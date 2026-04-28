import path from 'node:path';
import {
  DOMAIN_LABELS,
  GLOSSARY,
  emptyDirSync,
  splitBlocksToFiles,
  topNEntries,
  writeJSON,
  writeJSONL,
  writeTextFile,
} from './common.mjs';

function buildModuleMap(dataset) {
  const fileById = new Map(dataset.files.map((f) => [f.file_id, f]));
  const domainMap = new Map();

  for (const file of dataset.files) {
    if (!domainMap.has(file.domain)) {
      domainMap.set(file.domain, {
        label: DOMAIN_LABELS[file.domain] || DOMAIN_LABELS.other,
        file_ids: [],
        segment_ids: [],
        paths: [],
      });
    }
    const item = domainMap.get(file.domain);
    item.file_ids.push(file.file_id);
    item.paths.push(file.path);
  }

  for (const segment of dataset.segments) {
    const domain = fileById.get(segment.file_id)?.domain || 'other';
    if (!domainMap.has(domain)) {
      domainMap.set(domain, {
        label: DOMAIN_LABELS[domain] || DOMAIN_LABELS.other,
        file_ids: [],
        segment_ids: [],
        paths: [],
      });
    }
    domainMap.get(domain).segment_ids.push(segment.segment_id);
  }

  const out = {};
  const sortedDomains = [...domainMap.keys()].sort((a, b) => a.localeCompare(b));
  for (const domain of sortedDomains) {
    const value = domainMap.get(domain);
    out[domain] = {
      label: value.label,
      file_count: value.file_ids.length,
      segment_count: value.segment_ids.length,
      file_ids: value.file_ids.sort((a, b) => a.localeCompare(b)),
      segment_ids: value.segment_ids.sort((a, b) => a.localeCompare(b)),
      paths: [...new Set(value.paths)].sort((a, b) => a.localeCompare(b)),
    };
  }
  return out;
}

function getTopLargeFiles(dataset, n = 15) {
  return [...dataset.files]
    .sort((a, b) => b.line_count - a.line_count || a.path.localeCompare(b.path))
    .slice(0, n);
}

function computeRouteStats(dataset) {
  const groupCounter = new Map();
  let totalRoutes = 0;

  for (const file of dataset.files) {
    if (!(file.path.startsWith('server/router/') && file.path.endsWith('.go'))) continue;
    for (const route of file.route_defs || []) {
      totalRoutes += 1;
      const pathText = route.path || '';
      const group = pathText.includes('/') ? pathText.split('/')[0] : pathText;
      const key = group || 'root';
      groupCounter.set(key, (groupCounter.get(key) || 0) + 1);
    }
  }

  return {
    total_routes: totalRoutes,
    groups: [...groupCounter.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}

function computeFrontendViews(dataset) {
  return dataset.files
    .filter((f) => f.path.startsWith('web/src/view/') && f.path.endsWith('.vue'))
    .map((f) => f.path)
    .sort((a, b) => a.localeCompare(b));
}

function computeTestStats(dataset) {
  const tests = dataset.files.filter(
    (f) =>
      f.path.endsWith('_test.go') ||
      f.path.endsWith('.test.js') ||
      f.path.endsWith('.spec.js') ||
      f.path.endsWith('.test.ts') ||
      f.path.endsWith('.spec.ts')
  );
  return {
    test_file_count: tests.length,
    examples: tests.slice(0, 10).map((f) => f.path),
  };
}

function renderOverview(dataset, moduleMap) {
  const routeStats = computeRouteStats(dataset);
  const topLargeFiles = getTopLargeFiles(dataset, 12);
  const domainRows = Object.entries(moduleMap).map(([domain, meta]) => ({
    domain,
    label: meta.label,
    file_count: meta.file_count,
    segment_count: meta.segment_count,
  }));

  const lines = [];
  lines.push('# 00-overview');
  lines.push('');
  lines.push('## 目标与边界');
  lines.push('- 目标：构建可重复生成的项目画像文档包，支持低 token 问题定位。');
  lines.push(
    `- 纳入文件：${dataset.stats.total_files}，逻辑段：${dataset.stats.total_segments}，总行数：${dataset.stats.total_lines}。`
  );
  lines.push(`- 范围：${dataset.config.scope.join(', ')}`);
  lines.push(`- 排除：${dataset.config.exclude.join(', ')}`);
  lines.push('');
  lines.push('## 架构主链路');
  lines.push('- 后端：`main -> initialize -> router -> middleware -> api -> service -> model`。');
  lines.push('- 前端：`main -> router/permission -> pinia -> view -> api -> request`。');
  lines.push('- 插件：后端 `server/plugin` 与前端 `web/src/plugin` 双端协同。');
  lines.push('- AI 能力：`auto_code + mcp + skills + ai_workflow` 形成自动化编程链路。');
  lines.push('');
  lines.push('## 模块地图');
  lines.push('| Domain | 说明 | 文件数 | 逻辑段数 |');
  lines.push('|---|---|---:|---:|');
  for (const row of domainRows) {
    lines.push(`| ${row.domain} | ${row.label} | ${row.file_count} | ${row.segment_count} |`);
  }
  lines.push('');
  lines.push('## 关键规模指标');
  lines.push(`- 后端路由注册动作数（静态扫描）：${routeStats.total_routes}`);
  lines.push('- 路由域 Top:');
  for (const [group, count] of routeStats.groups.slice(0, 10)) {
    lines.push(`- ${group}: ${count}`);
  }
  lines.push('- 最大文件 Top:');
  for (const f of topLargeFiles) {
    lines.push(`- ${f.path}: ${f.line_count} 行`);
  }
  lines.push('');
  lines.push('## 术语字典');
  for (const [abbr, desc] of GLOSSARY) {
    lines.push(`- ${abbr}: ${desc}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function renderFeatureMap(dataset) {
  const routeStats = computeRouteStats(dataset);
  const views = computeFrontendViews(dataset);
  const pluginFiles = dataset.files
    .filter((f) => f.path.includes('/plugin/'))
    .map((f) => f.path)
    .sort((a, b) => a.localeCompare(b));
  const deployFiles = dataset.files
    .filter((f) => f.path.startsWith('deploy/'))
    .map((f) => f.path)
    .sort((a, b) => a.localeCompare(b));

  const lines = [];
  lines.push('# 01-feature-map');
  lines.push('');
  lines.push('## 后端功能域（基于路由扫描）');
  lines.push(`- 路由总量：${routeStats.total_routes}`);
  lines.push('- 路由域分布：');
  for (const [group, count] of routeStats.groups.slice(0, 30)) {
    lines.push(`- ${group}: ${count}`);
  }
  lines.push('');
  lines.push('## 前端功能页（web/src/view）');
  lines.push(`- 页面文件总数：${views.length}`);
  for (const view of views) {
    lines.push(`- ${view}`);
  }
  lines.push('');
  lines.push('## 插件能力映射');
  lines.push(`- 插件相关文件数：${pluginFiles.length}`);
  for (const p of pluginFiles) {
    lines.push(`- ${p}`);
  }
  lines.push('');
  lines.push('## 部署与运维资产');
  lines.push(`- 部署文件数：${deployFiles.length}`);
  for (const f of deployFiles) {
    lines.push(`- ${f}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function renderStrengthsWeaknesses(dataset) {
  const testStats = computeTestStats(dataset);
  const hasMCP = dataset.files.some((f) => f.path.startsWith('server/mcp/'));
  const hasPlugin = dataset.files.some((f) => f.path.includes('/plugin/'));
  const hasAutoCode = dataset.files.some((f) => f.path.includes('auto_code') || f.path.includes('autoCode'));
  const hasMultiDB = dataset.files.some((f) => f.path.startsWith('server/config/gorm_'));
  const hasDeployment = dataset.files.some((f) => f.path.startsWith('deploy/kubernetes/'));

  const lines = [];
  lines.push('# 02-strengths-weaknesses');
  lines.push('');
  lines.push('## 优点');
  lines.push('- 分层清晰：后端 `router/api/service/model` 与前端 `router/pinia/view/api` 结构稳定。');
  if (hasAutoCode) lines.push('- 自动化能力强：内置代码生成、模板管理、工作流编排。');
  if (hasMCP) lines.push('- AI工具链完整：具备 MCP 独立服务与工具注册机制。');
  if (hasPlugin) lines.push('- 扩展性较好：插件支持后端与前端双侧集成。');
  if (hasMultiDB) lines.push('- 基础设施兼容面广：数据库/对象存储配置项覆盖较多。');
  if (hasDeployment) lines.push('- 部署资产齐全：提供 Docker 与 Kubernetes 示例。');
  lines.push('');
  lines.push('## 缺点');
  lines.push('- 全局状态使用较多（`global.*`），模块独立测试与并行演进成本增加。');
  lines.push('- 业务与平台能力耦合度偏高（如系统管理、自动代码、MCP 同仓并行演进）。');
  lines.push('- 文档与实现存在规模差，手工阅读成本高，需要依赖索引化检索。');
  lines.push(
    `- 自动化测试覆盖有限：当前纳入范围仅检测到 ${testStats.test_file_count} 个测试文件。`
  );
  lines.push('');
  lines.push('## 维护建议');
  lines.push('- 通过 `segment_id` 作为最小知识单元，优先做按域检索再展开代码。');
  lines.push('- 对超长逻辑段优先拆分，降低后续模型上下文成本。');
  lines.push('- 将高频问题沉淀为 Prompt 模板并固定检索顺序。');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function renderRiskBacklog(dataset) {
  const testStats = computeTestStats(dataset);
  const lines = [];
  lines.push('# 03-risk-backlog');
  lines.push('');
  lines.push('## P0');
  lines.push('- 鉴权链路变更风险：`JWT + Casbin + 动态菜单`三者耦合，变更需联动验证。');
  lines.push('- 自动代码与运行时代码并存：模板/生成逻辑误改可能影响核心业务目录。');
  lines.push('');
  lines.push('## P1');
  lines.push('- 全局状态依赖风险：`global.*` 共享对象增多，重载与并发场景需重点回归。');
  lines.push('- 插件边界风险：插件与主系统 API 演进不一致时可能引发兼容问题。');
  lines.push('- 测试覆盖风险：测试文件数量偏少，核心链路需补充集成校验。');
  lines.push('');
  lines.push('## P2');
  lines.push('- 文档老化风险：项目迭代后若不刷新索引，定位精度会逐步下降。');
  lines.push('- 前端页面规模膨胀风险：系统工具域页面体量较大，建议按功能拆分。');
  lines.push('');
  lines.push('## 观察指标');
  lines.push(`- 测试文件数：${testStats.test_file_count}`);
  lines.push(`- 逻辑段总数：${dataset.stats.total_segments}`);
  lines.push(`- 纳入文件总数：${dataset.stats.total_files}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function renderPromptPack(dataset, moduleMap) {
  const domains = Object.keys(moduleMap).sort((a, b) => a.localeCompare(b));
  const lines = [];
  lines.push('# 04-prompt-pack');
  lines.push('');
  lines.push('## 使用原则');
  lines.push('- 先按 `domain` 缩小范围，再按 `file_id` 与 `segment_id` 精准提问。');
  lines.push('- 问题模板优先要求返回 `segment_id + 行号区间 + 变更建议`。');
  lines.push('- 同类问题复用同一模板，减少上下文冗余。');
  lines.push('');
  lines.push('## 检索模板');
  lines.push('### 模板A：定位故障');
  lines.push('- 输入：`domain=<domain>, symptom=<现象>, constraint=<限制>`');
  lines.push('- 指令：');
  lines.push('```text');
  lines.push('请仅在指定 domain 内检索，返回最可能的 5 个 segment_id，按置信度排序。');
  lines.push('每项包含：file_id、path、start_line-end_line、失败机理、最小修复点。');
  lines.push('```');
  lines.push('');
  lines.push('### 模板B：评估改动影响');
  lines.push('- 输入：`target_segment=<segment_id>, change=<改动描述>`');
  lines.push('- 指令：');
  lines.push('```text');
  lines.push('基于 target_segment，给出上游依赖、下游影响、回归测试建议。');
  lines.push('输出必须包含受影响的 file_id 列表与优先级。');
  lines.push('```');
  lines.push('');
  lines.push('### 模板C：生成修复补丁草案');
  lines.push('- 输入：`segment_ids=[...], goal=<目标行为>`');
  lines.push('- 指令：');
  lines.push('```text');
  lines.push('仅根据给定 segment_ids 生成最小补丁方案，避免跨域重构。');
  lines.push('输出包括：变更点、风险、验证步骤。');
  lines.push('```');
  lines.push('');
  lines.push('## Domain 值参考');
  for (const d of domains) {
    lines.push(`- ${d}: ${moduleMap[d].label}`);
  }
  lines.push('');
  lines.push('## 术语缩写');
  for (const [abbr, desc] of GLOSSARY) {
    lines.push(`- ${abbr}: ${desc}`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function groupFileBucket(filePath) {
  const parts = filePath.split('/');
  if (filePath.startsWith('server/')) {
    const sub = parts.length >= 3 ? parts[1] : 'root';
    return `server-${sub}`;
  }
  if (filePath.startsWith('web/src/')) {
    const sub = parts.length >= 4 ? parts[2] : 'src-root';
    return `web-${sub}`;
  }
  if (filePath.startsWith('web/')) {
    return parts.length >= 3 ? `web-${parts[1]}` : 'web-root';
  }
  if (filePath.startsWith('deploy/')) {
    return 'deploy-root';
  }
  return 'root';
}

function slugifyBucketName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function renderFileBlocks(dataset) {
  const fileById = new Map(dataset.files.map((f) => [f.file_id, f]));
  const segMap = new Map();
  for (const seg of dataset.segments) {
    if (!segMap.has(seg.file_id)) segMap.set(seg.file_id, []);
    segMap.get(seg.file_id).push(seg);
  }

  const buckets = new Map();
  for (const file of dataset.files) {
    const bucket = groupFileBucket(file.path);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(file);
  }

  const out = new Map();
  const bucketNames = [...buckets.keys()].sort((a, b) => a.localeCompare(b));
  for (const bucket of bucketNames) {
    const files = buckets.get(bucket).sort((a, b) => a.path.localeCompare(b.path));
    const blocks = [];
    blocks.push([`# ${bucket}`, '', `- 文件数量：${files.length}`, '']);
    for (const file of files) {
      const segs = (segMap.get(file.file_id) || []).sort(
        (a, b) => a.start_line - b.start_line || a.segment_id.localeCompare(b.segment_id)
      );
      const block = [];
      block.push(`## [${file.file_id}] ${file.path}`);
      block.push(`- 语言: ${file.lang}`);
      block.push(`- 领域: ${file.domain} (${DOMAIN_LABELS[file.domain] || DOMAIN_LABELS.other})`);
      block.push(`- 行数: ${file.line_count}`);
      block.push(`- imports: ${file.imports.length ? file.imports.join(', ') : '-'}`);
      block.push(`- entrypoints: ${file.entrypoints.length ? file.entrypoints.join(', ') : '-'}`);
      block.push(`- depends_on: ${file.depends_on.length ? file.depends_on.join(', ') : '-'}`);
      block.push(`- owned_by: ${file.owned_by}`);
      block.push('- 逻辑段:');
      for (const s of segs) {
        block.push(
          `- [${s.segment_id}] 行 ${s.start_line}-${s.end_line} | ${s.kind} | ${s.summary}`
        );
        block.push(`- inputs: ${s.inputs.length ? s.inputs.join(' | ') : '-'}`);
        block.push(`- outputs: ${s.outputs.length ? s.outputs.join(' | ') : '-'}`);
        block.push(`- side_effects: ${s.side_effects.length ? s.side_effects.join(', ') : '-'}`);
        block.push(`- calls: ${s.calls.length ? s.calls.join(', ') : '-'}`);
        block.push(`- risks: ${s.risks.length ? s.risks.join(' / ') : '-'}`);
        block.push(`- tags: ${s.tags.length ? s.tags.join(', ') : '-'}`);
      }
      block.push('');
      blocks.push(block);
    }
    out.set(bucket, blocks);
  }
  return out;
}

function sanitizeFilesForIndex(files) {
  return files.map((f) => ({
    file_id: f.file_id,
    path: f.path,
    lang: f.lang,
    domain: f.domain,
    line_count: f.line_count,
    imports: f.imports,
    entrypoints: f.entrypoints,
    depends_on: f.depends_on,
    owned_by: f.owned_by,
  }));
}

function sanitizeSegmentsForIndex(segments) {
  return segments.map((s) => ({
    segment_id: s.segment_id,
    file_id: s.file_id,
    start_line: s.start_line,
    end_line: s.end_line,
    kind: s.kind,
    summary: s.summary,
    inputs: s.inputs,
    outputs: s.outputs,
    side_effects: s.side_effects,
    calls: s.calls,
    risks: s.risks,
    tags: s.tags,
  }));
}

export function renderProject(dataset, options) {
  const outRoot = path.join(options.repoRoot, options.out);
  const filesDir = path.join(outRoot, 'files');
  const indexDir = path.join(outRoot, 'index');

  emptyDirSync(outRoot);
  emptyDirSync(filesDir);
  emptyDirSync(indexDir);

  const moduleMap = buildModuleMap(dataset);
  const cleanFiles = sanitizeFilesForIndex(dataset.files);
  const cleanSegments = sanitizeSegmentsForIndex(dataset.segments);

  writeJSONL(path.join(indexDir, 'files.jsonl'), cleanFiles);
  writeJSONL(path.join(indexDir, 'segments.jsonl'), cleanSegments);
  writeJSON(path.join(indexDir, 'module-map.json'), moduleMap);
  writeJSON(path.join(indexDir, 'manifest.json'), {
    scope: dataset.config.scope,
    exclude: dataset.config.exclude,
    stats: dataset.stats,
    output: options.out,
    sync_id: options.syncId || null,
    generated_at: options.generatedAt || null,
    source_stats:
      options.sourceStats || {
        total_files: cleanFiles.length,
        total_segments: cleanSegments.length,
        total_lines: dataset.stats.total_lines,
      },
  });

  writeTextFile(path.join(outRoot, '00-overview.md'), renderOverview(dataset, moduleMap));
  writeTextFile(path.join(outRoot, '01-feature-map.md'), renderFeatureMap(dataset));
  writeTextFile(
    path.join(outRoot, '02-strengths-weaknesses.md'),
    renderStrengthsWeaknesses(dataset)
  );
  writeTextFile(path.join(outRoot, '03-risk-backlog.md'), renderRiskBacklog(dataset));
  writeTextFile(path.join(outRoot, '04-prompt-pack.md'), renderPromptPack(dataset, moduleMap));

  const fileBuckets = renderFileBlocks(dataset);
  const fileIndexLines = ['# files/ 文档索引', ''];
  for (const [bucket, blocks] of [...fileBuckets.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const chunks = splitBlocksToFiles(blocks, options.maxLinesPerDoc, slugifyBucketName(bucket));
    for (const chunk of chunks) {
      writeTextFile(path.join(filesDir, chunk.fileName), `${chunk.lines.join('\n')}\n`);
      fileIndexLines.push(`- ${chunk.fileName}`);
    }
  }
  fileIndexLines.push('');
  writeTextFile(path.join(filesDir, 'README.md'), `${fileIndexLines.join('\n')}\n`);

  return {
    outRoot,
    filesCount: cleanFiles.length,
    segmentsCount: cleanSegments.length,
    moduleMap,
    topDomains: topNEntries(
      new Map(Object.entries(dataset.stats.domain_distribution || {}).map(([k, v]) => [k, v])),
      10
    ),
  };
}
