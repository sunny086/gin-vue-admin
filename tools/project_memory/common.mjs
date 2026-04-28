import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_SCOPE = ['server', 'web', 'deploy', 'root'];
export const DEFAULT_EXCLUDES = [
  '.git/',
  '.idea/',
  '.vscode/',
  '.cursor/',
  '.codex/',
  '.claude/',
  '.aone_copilot/',
  '.trae/',
  'node_modules/',
  'server/docs/',
  '/assets/',
];

export const ROOT_KEY_FILES = [
  'README.md',
  'README-en.md',
  'SECURITY.md',
  'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md',
  'Makefile',
];

export const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.bmp',
  '.ico',
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
]);

export const TEXT_EXTENSIONS = new Set([
  '.go',
  '.vue',
  '.js',
  '.mjs',
  '.ts',
  '.tsx',
  '.scss',
  '.css',
  '.html',
  '.json',
  '.md',
  '.yaml',
  '.yml',
  '.tpl',
  '.sh',
  '.mod',
  '.sum',
  '.env',
  '.txt',
  '.conf',
  '.ini',
  '.toml',
  '.sql',
  '.xml',
]);

export const TEXT_FILENAMES = new Set(['Makefile', 'Dockerfile', 'LICENSE']);

export const DOMAIN_LABELS = {
  'auth-access': '鉴权与访问控制',
  'menu-rbac': '菜单与权限编排',
  'codegen-ai': '代码生成与AI工作流',
  'mcp-skills': 'MCP与Skills生态',
  'system-config': '系统配置与运行时',
  'plugin-ecosystem': '插件生态',
  'data-model': '数据模型与初始化数据',
  'frontend-core': '前端框架内核',
  'frontend-ui': '前端业务界面',
  'deploy-ops': '部署与运维',
  'docs-governance': '文档与治理',
  other: '通用模块',
};

export const GLOSSARY = [
  ['AuthN', '身份认证（Authentication）'],
  ['AuthZ', '权限授权（Authorization）'],
  ['DynRoute', '动态路由'],
  ['ACG', '自动代码生成（Auto Code Generation）'],
  ['MCP', 'Model Context Protocol 服务能力'],
];

export function normalizePath(p) {
  return p.split(path.sep).join('/');
}

export function toPosixRelative(repoRoot, absPath) {
  return normalizePath(path.relative(repoRoot, absPath));
}

export function parseListArg(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCLIArgs(argv) {
  const args = {
    scope: [...DEFAULT_SCOPE],
    exclude: [...DEFAULT_EXCLUDES],
    out: 'docs/project-memory',
    devOut: 'docs/project-memory-dev',
    noDev: false,
    lang: 'zh',
    maxLinesPerDoc: 850,
    repoRoot: process.cwd(),
  };

  const tokens = [...argv];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const [k, v] = token.includes('=') ? token.split(/=(.*)/, 2) : [token, undefined];
    const val = v ?? tokens[i + 1];

    if (k === '--scope') {
      args.scope = parseListArg(val);
      if (v === undefined) i += 1;
    } else if (k === '--exclude') {
      const list = parseListArg(val);
      args.exclude.push(...list);
      if (v === undefined) i += 1;
    } else if (k === '--out') {
      args.out = val;
      if (v === undefined) i += 1;
    } else if (k === '--dev-out') {
      args.devOut = val;
      if (v === undefined) i += 1;
    } else if (k === '--no-dev') {
      args.noDev = true;
    } else if (k === '--lang') {
      args.lang = val || 'zh';
      if (v === undefined) i += 1;
    } else if (k === '--max-lines-per-doc') {
      const n = Number(val);
      if (Number.isFinite(n) && n > 0) {
        args.maxLinesPerDoc = Math.floor(n);
      }
      if (v === undefined) i += 1;
    } else if (k === '--repo-root') {
      args.repoRoot = val || process.cwd();
      if (v === undefined) i += 1;
    }
  }

  if (!args.scope.length) {
    args.scope = [...DEFAULT_SCOPE];
  }
  args.scope = [...new Set(args.scope.map((s) => s.trim()).filter(Boolean))];
  args.exclude = [...new Set(args.exclude.map((s) => s.trim()).filter(Boolean))];
  args.repoRoot = path.resolve(args.repoRoot);

  return args;
}

export function ensureDirSync(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function emptyDirSync(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

export function readFileLines(absPath) {
  const raw = fs.readFileSync(absPath, 'utf8');
  const normalized = raw.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  return {
    raw: normalized,
    lines,
    lineCount: lines.length,
  };
}

export function writeTextFile(absPath, text) {
  ensureDirSync(path.dirname(absPath));
  fs.writeFileSync(absPath, text, 'utf8');
}

export function writeJSON(absPath, data) {
  writeTextFile(absPath, `${JSON.stringify(data, null, 2)}\n`);
}

export function writeJSONL(absPath, rows) {
  const text = rows.map((row) => JSON.stringify(row)).join('\n');
  writeTextFile(absPath, `${text}${rows.length ? '\n' : ''}`);
}

export function hashFNV1a(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computeSyncId(payload) {
  return `S${hashFNV1a(JSON.stringify(payload))}`;
}

export function fileIdFromPath(relPath) {
  return `F${hashFNV1a(relPath)}`;
}

export function segmentId(fileId, index1) {
  return `${fileId}-S${String(index1).padStart(4, '0')}`;
}

export function detectLanguage(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  const base = path.basename(relPath);
  if (base === 'Dockerfile') return 'dockerfile';
  if (base === 'Makefile') return 'makefile';
  if (ext === '.go') return 'go';
  if (ext === '.vue') return 'vue';
  if (ext === '.js' || ext === '.mjs') return 'js';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  if (ext === '.md') return 'markdown';
  if (ext === '.json') return 'json';
  if (ext === '.scss' || ext === '.css') return 'style';
  if (ext === '.html') return 'html';
  if (ext === '.tpl') return 'template';
  if (ext === '.sh') return 'shell';
  return 'text';
}

export function shouldExcludePath(relPath, excludes) {
  const normalized = normalizePath(relPath);
  const ext = path.extname(normalized).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return true;
  if (normalized.startsWith('.')) return true;

  return excludes.some((item) => normalized.includes(item));
}

export function isEligibleTextFile(relPath) {
  const base = path.basename(relPath);
  const ext = path.extname(relPath).toLowerCase();
  return TEXT_FILENAMES.has(base) || TEXT_EXTENSIONS.has(ext) || !ext;
}

export function walkFiles(absDir) {
  const out = [];
  if (!fs.existsSync(absDir)) return out;
  const stack = [absDir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(abs);
      } else if (entry.isFile()) {
        out.push(abs);
      }
    }
  }
  return out;
}

export function collectScopedFiles(repoRoot, scopes, excludes) {
  const fileSet = new Set();
  const validScopes = [...new Set(scopes)];

  for (const scope of validScopes) {
    if (scope === 'root') {
      for (const rootFile of ROOT_KEY_FILES) {
        const abs = path.join(repoRoot, rootFile);
        if (fs.existsSync(abs)) {
          const rel = toPosixRelative(repoRoot, abs);
          if (!shouldExcludePath(rel, excludes)) {
            fileSet.add(rel);
          }
        }
      }
      continue;
    }

    const absScope = path.join(repoRoot, scope);
    if (!fs.existsSync(absScope)) continue;
    const files = walkFiles(absScope);
    for (const absFile of files) {
      const rel = toPosixRelative(repoRoot, absFile);
      if (!isEligibleTextFile(rel)) continue;
      if (shouldExcludePath(rel, excludes)) continue;
      fileSet.add(rel);
    }
  }

  return [...fileSet].sort((a, b) => a.localeCompare(b));
}

export function safeJSONParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function uniq(arr) {
  return [...new Set(arr)];
}

export function trimTo(input, maxLen) {
  if (!input) return '';
  if (input.length <= maxLen) return input;
  return `${input.slice(0, Math.max(0, maxLen - 1))}…`;
}

export function topNEntries(counterMap, n = 12) {
  return [...counterMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n);
}

export function splitBlocksToFiles(blocks, maxLines, filenameBase) {
  const files = [];
  let current = [];
  let currentCount = 0;

  for (const block of blocks) {
    const blockCount = block.length;
    if (current.length && currentCount + blockCount > maxLines) {
      files.push(current);
      current = [];
      currentCount = 0;
    }
    current.push(...block);
    currentCount += blockCount;
  }

  if (current.length) {
    files.push(current);
  }

  if (files.length <= 1) {
    return [{ fileName: `${filenameBase}.md`, lines: files[0] || [] }];
  }

  return files.map((lines, idx) => ({
    fileName: `${filenameBase}-part${String(idx + 1).padStart(2, '0')}.md`,
    lines,
  }));
}
