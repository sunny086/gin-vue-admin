import fs from 'node:fs';
import path from 'node:path';
import {
  collectScopedFiles,
  detectLanguage,
  fileIdFromPath,
  readFileLines,
  segmentId,
  toPosixRelative,
  uniq,
} from './common.mjs';

const RESERVED_CALLS = new Set([
  'if',
  'for',
  'switch',
  'return',
  'func',
  'map',
  'make',
  'new',
  'append',
  'len',
  'cap',
  'delete',
  'panic',
  'recover',
  'select',
  'case',
  'default',
  'go',
  'defer',
  'const',
  'var',
  'type',
]);

function normalizeStarts(starts, lineCount) {
  const map = new Map();
  for (const item of starts) {
    if (!item || !Number.isFinite(item.line)) continue;
    const line = Math.max(1, Math.min(lineCount, item.line));
    if (!map.has(line)) {
      map.set(line, {
        line,
        kind: item.kind || 'block',
        title: item.title || '',
      });
    }
  }
  return [...map.values()].sort((a, b) => a.line - b.line);
}

function buildSegmentsFromStarts(starts, lineCount) {
  if (lineCount <= 0) {
    return [
      {
        start_line: 1,
        end_line: 1,
        kind: 'empty',
        title: 'empty',
      },
    ];
  }

  const normalized = normalizeStarts(starts, lineCount);
  if (!normalized.length) {
    return [
      {
        start_line: 1,
        end_line: lineCount,
        kind: 'block',
        title: 'whole-file',
      },
    ];
  }

  const segments = [];
  if (normalized[0].line > 1) {
    segments.push({
      start_line: 1,
      end_line: normalized[0].line - 1,
      kind: 'preamble',
      title: 'preamble',
    });
  }

  for (let i = 0; i < normalized.length; i += 1) {
    const current = normalized[i];
    const next = normalized[i + 1];
    const end = next ? next.line - 1 : lineCount;
    if (current.line <= end) {
      segments.push({
        start_line: current.line,
        end_line: end,
        kind: current.kind,
        title: current.title || '',
      });
    }
  }

  const last = segments[segments.length - 1];
  if (last && last.end_line < lineCount) {
    segments.push({
      start_line: last.end_line + 1,
      end_line: lineCount,
      kind: 'tail',
      title: 'tail',
    });
  }

  return segments;
}

function extractGoStarts(lines) {
  const starts = [];
  const reFunc = /^func\s*(\([^)]+\)\s*)?([A-Za-z_]\w*)\s*\(/;
  const reType = /^type\s+([A-Za-z_]\w*)\s+/;
  const rePkg = /^package\s+([A-Za-z_]\w*)/;

  lines.forEach((lineRaw, idx) => {
    const line = lineRaw.trimEnd();
    const lineNo = idx + 1;
    if (/^package\s+/.test(line)) {
      const m = line.match(rePkg);
      starts.push({ line: lineNo, kind: 'go-package', title: m?.[1] || '' });
      return;
    }
    if (/^import\s*(\(|")/.test(line)) {
      starts.push({ line: lineNo, kind: 'go-import', title: 'imports' });
      return;
    }
    if (/^(const|var)\s*(\(|[A-Za-z_])/.test(line)) {
      starts.push({ line: lineNo, kind: 'go-const-var', title: line.split(/\s+/)[0] });
      return;
    }
    if (/^type\s+/.test(line)) {
      const m = line.match(reType);
      starts.push({ line: lineNo, kind: 'go-type', title: m?.[1] || '' });
      return;
    }
    if (/^func\s+/.test(line)) {
      const m = line.match(reFunc);
      starts.push({ line: lineNo, kind: 'go-func', title: m?.[2] || '' });
    }
  });

  return starts;
}

function findTagBlockRanges(lines, tagName) {
  const ranges = [];
  const startRe = new RegExp(`^\\s*<${tagName}(\\s|>)`);
  const endRe = new RegExp(`</${tagName}>`);
  for (let i = 0; i < lines.length; i += 1) {
    if (!startRe.test(lines[i])) continue;
    const start = i + 1;
    let end = start;
    for (let j = i; j < lines.length; j += 1) {
      if (endRe.test(lines[j])) {
        end = j + 1;
        i = j;
        break;
      }
      if (j === lines.length - 1) {
        end = lines.length;
        i = j;
      }
    }
    ranges.push({ start, end });
  }
  return ranges;
}

function extractVueStarts(lines) {
  const starts = [];
  const templateRanges = findTagBlockRanges(lines, 'template');
  const scriptRanges = findTagBlockRanges(lines, 'script');
  const styleRanges = findTagBlockRanges(lines, 'style');

  for (const r of templateRanges) {
    starts.push({ line: r.start, kind: 'vue-template', title: 'template' });
  }
  for (const r of styleRanges) {
    starts.push({ line: r.start, kind: 'vue-style', title: 'style' });
  }
  for (const r of scriptRanges) {
    starts.push({ line: r.start, kind: 'vue-script', title: 'script' });
    for (let ln = r.start; ln <= r.end; ln += 1) {
      const line = lines[ln - 1].trim();
      if (/^export\s+default/.test(line)) {
        starts.push({ line: ln, kind: 'vue-script-export', title: 'export default' });
      } else if (/^export\s+(const|function)\s+([A-Za-z_$]\w*)/.test(line)) {
        const m = line.match(/^export\s+(?:const|function)\s+([A-Za-z_$]\w*)/);
        starts.push({ line: ln, kind: 'vue-script-export', title: m?.[1] || 'export' });
      } else if (/^const\s+([A-Za-z_$]\w*)\s*=\s*(async\s*)?\([^)]*\)\s*=>/.test(line)) {
        const m = line.match(/^const\s+([A-Za-z_$]\w*)/);
        starts.push({ line: ln, kind: 'vue-script-func', title: m?.[1] || 'const-func' });
      } else if (/^(async\s+)?function\s+([A-Za-z_$]\w*)\s*\(/.test(line)) {
        const m = line.match(/^(?:async\s+)?function\s+([A-Za-z_$]\w*)\s*\(/);
        starts.push({ line: ln, kind: 'vue-script-func', title: m?.[1] || 'function' });
      } else if (/^const\s+\{?\s*[^=]+use[A-Za-z0-9_]+\s*\}?\s*=/.test(line)) {
        starts.push({ line: ln, kind: 'vue-script-setup', title: 'setup' });
      }
    }
  }

  return starts;
}

function extractJSStarts(lines) {
  const starts = [];
  lines.forEach((lineRaw, idx) => {
    const line = lineRaw.trim();
    const lineNo = idx + 1;
    if (/^import\s+/.test(line)) {
      starts.push({ line: lineNo, kind: 'js-import', title: 'import' });
      return;
    }
    if (/^export\s+default/.test(line)) {
      starts.push({ line: lineNo, kind: 'js-export', title: 'export default' });
      return;
    }
    if (/^export\s+(const|function)\s+([A-Za-z_$]\w*)/.test(line)) {
      const m = line.match(/^export\s+(?:const|function)\s+([A-Za-z_$]\w*)/);
      starts.push({ line: lineNo, kind: 'js-export', title: m?.[1] || 'export' });
      return;
    }
    if (/^(const|let|var)\s+([A-Za-z_$]\w*)\s*=/.test(line)) {
      const m = line.match(/^(?:const|let|var)\s+([A-Za-z_$]\w*)\s*=/);
      starts.push({ line: lineNo, kind: 'js-const', title: m?.[1] || 'const' });
      return;
    }
    if (/^(async\s+)?function\s+([A-Za-z_$]\w*)\s*\(/.test(line)) {
      const m = line.match(/^(?:async\s+)?function\s+([A-Za-z_$]\w*)\s*\(/);
      starts.push({ line: lineNo, kind: 'js-func', title: m?.[1] || 'function' });
      return;
    }
    if (/^([A-Za-z_$]\w*)\s*:\s*(async\s*)?\([^)]*\)\s*=>/.test(line)) {
      const m = line.match(/^([A-Za-z_$]\w*)\s*:/);
      starts.push({ line: lineNo, kind: 'js-func', title: m?.[1] || 'method' });
      return;
    }
  });
  return starts;
}

function extractYAMLStarts(lines) {
  const starts = [];
  lines.forEach((lineRaw, idx) => {
    const line = lineRaw.trimEnd();
    if (/^[A-Za-z0-9_.-]+:\s*(#.*)?$/.test(line)) {
      const key = line.split(':')[0];
      starts.push({ line: idx + 1, kind: 'yaml-key', title: key });
    }
  });
  return starts;
}

function extractMarkdownStarts(lines) {
  const starts = [];
  lines.forEach((lineRaw, idx) => {
    const line = lineRaw.trimEnd();
    if (/^#{1,6}\s+/.test(line)) {
      const title = line.replace(/^#{1,6}\s+/, '').trim();
      starts.push({ line: idx + 1, kind: 'md-heading', title });
    }
  });
  return starts;
}

function segmentByLanguage(lang, lines) {
  if (lang === 'go') return buildSegmentsFromStarts(extractGoStarts(lines), lines.length);
  if (lang === 'vue') return buildSegmentsFromStarts(extractVueStarts(lines), lines.length);
  if (lang === 'js') return buildSegmentsFromStarts(extractJSStarts(lines), lines.length);
  if (lang === 'yaml') return buildSegmentsFromStarts(extractYAMLStarts(lines), lines.length);
  if (lang === 'markdown') return buildSegmentsFromStarts(extractMarkdownStarts(lines), lines.length);
  return buildSegmentsFromStarts([], lines.length);
}

function extractGoImports(lines) {
  const imports = [];
  let inBlock = false;
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (line.startsWith('import (')) {
      inBlock = true;
      continue;
    }
    if (inBlock && line === ')') {
      inBlock = false;
      continue;
    }
    if (inBlock) {
      const m = line.match(/^"([^"]+)"/);
      if (m) imports.push(m[1]);
      continue;
    }
    const single = line.match(/^import\s+"([^"]+)"/);
    if (single) imports.push(single[1]);
  }
  return uniq(imports).sort((a, b) => a.localeCompare(b));
}

function extractJSImports(lines) {
  const imports = [];
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    const m1 = line.match(/^import\s+.+\s+from\s+['"]([^'"]+)['"]/);
    const m2 = line.match(/^import\s+['"]([^'"]+)['"]/);
    if (m1) imports.push(m1[1]);
    else if (m2) imports.push(m2[1]);
  }
  return uniq(imports).sort((a, b) => a.localeCompare(b));
}

function extractDependsOn(imports) {
  return imports
    .filter((item) => item.startsWith('.') || item.startsWith('@/') || item.startsWith('/'))
    .sort((a, b) => a.localeCompare(b));
}

function extractEntrypoints(relPath, raw) {
  const entries = [];
  if (relPath === 'server/main.go') entries.push('backend-main');
  if (relPath.startsWith('server/cmd/') && relPath.endsWith('/main.go')) entries.push('backend-subcommand');
  if (relPath === 'web/src/main.js') entries.push('frontend-main');
  if (relPath === 'web/src/router/index.js') entries.push('frontend-router');
  if (relPath === 'server/router/enter.go') entries.push('backend-router-entry');
  if (/\bfunc\s+main\s*\(/.test(raw)) entries.push('main-function');
  if (/createRouter\s*\(/.test(raw)) entries.push('router-definition');
  if (/Router\.Group\(/.test(raw) && /Init[A-Za-z0-9_]+Router/.test(raw)) entries.push('route-registration');
  return uniq(entries);
}

function extractRouteDefs(raw) {
  const defs = [];
  const routeReg = /\.(GET|POST|PUT|DELETE|PATCH)\("([^"]+)"/g;
  let m = routeReg.exec(raw);
  while (m) {
    defs.push({ method: m[1], path: m[2] });
    m = routeReg.exec(raw);
  }
  return defs;
}

function extractCalls(content, limit = 12) {
  const calls = [];
  const reg = /\b([A-Za-z_]\w*)\s*\(/g;
  let m = reg.exec(content);
  while (m) {
    const name = m[1];
    if (!RESERVED_CALLS.has(name) && !calls.includes(name)) {
      calls.push(name);
      if (calls.length >= limit) break;
    }
    m = reg.exec(content);
  }
  return calls;
}

function safeSliceLines(lines, startLine, endLine) {
  const start = Math.max(1, startLine);
  const end = Math.max(start, endLine);
  return lines.slice(start - 1, end).join('\n');
}

function inferOwnedBy(relPath) {
  if (relPath.startsWith('server/')) return 'backend';
  if (relPath.startsWith('web/')) return 'frontend';
  if (relPath.startsWith('deploy/')) return 'devops';
  return 'governance';
}

export function scanProject(options) {
  const { repoRoot, scope, exclude } = options;
  const relFiles = collectScopedFiles(repoRoot, scope, exclude);

  const files = [];
  const segments = [];
  const langStats = new Map();
  const rootStats = new Map();

  for (const relPath of relFiles) {
    const absPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(absPath)) continue;
    const { raw, lines, lineCount } = readFileLines(absPath);
    const lang = detectLanguage(relPath);
    const starts = segmentByLanguage(lang, lines);
    const fileId = fileIdFromPath(relPath);

    const imports =
      lang === 'go'
        ? extractGoImports(lines)
        : lang === 'js' || lang === 'vue'
          ? extractJSImports(lines)
          : [];
    const dependsOn = extractDependsOn(imports);
    const entrypoints = extractEntrypoints(relPath, raw);
    const routeDefs = extractRouteDefs(raw);

    files.push({
      file_id: fileId,
      path: relPath,
      lang,
      domain: '',
      line_count: lineCount,
      imports,
      entrypoints,
      depends_on: dependsOn,
      owned_by: inferOwnedBy(relPath),
      route_defs: routeDefs,
    });

    starts.forEach((segment, idx) => {
      const content = safeSliceLines(lines, segment.start_line, segment.end_line);
      segments.push({
        segment_id: segmentId(fileId, idx + 1),
        file_id: fileId,
        start_line: segment.start_line,
        end_line: segment.end_line,
        kind: segment.kind,
        title: segment.title || '',
        summary: '',
        inputs: [],
        outputs: [],
        side_effects: [],
        calls: extractCalls(content),
        risks: [],
        tags: [],
        _content: content,
      });
    });

    langStats.set(lang, (langStats.get(lang) || 0) + 1);
    const root = relPath.split('/')[0];
    rootStats.set(root, (rootStats.get(root) || 0) + 1);
  }

  files.sort((a, b) => a.path.localeCompare(b.path));
  const fileIdx = new Map(files.map((f) => [f.file_id, f]));
  segments.sort((a, b) => {
    const pa = fileIdx.get(a.file_id)?.path || '';
    const pb = fileIdx.get(b.file_id)?.path || '';
    return pa.localeCompare(pb) || a.start_line - b.start_line;
  });

  return {
    config: {
      scope,
      exclude,
    },
    files,
    segments,
    stats: {
      total_files: files.length,
      total_segments: segments.length,
      total_lines: files.reduce((acc, f) => acc + f.line_count, 0),
      lang_distribution: Object.fromEntries(
        [...langStats.entries()].sort((a, b) => a[0].localeCompare(b[0]))
      ),
      scope_distribution: Object.fromEntries(
        [...rootStats.entries()].sort((a, b) => a[0].localeCompare(b[0]))
      ),
      entrypoint_files: files.filter((f) => f.entrypoints.length > 0).map((f) => f.path),
    },
  };
}

export function buildSegmentFileMap(dataset) {
  const map = new Map();
  for (const seg of dataset.segments) {
    if (!map.has(seg.file_id)) map.set(seg.file_id, []);
    map.get(seg.file_id).push(seg);
  }
  return map;
}

