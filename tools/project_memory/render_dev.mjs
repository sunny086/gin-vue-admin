import path from 'node:path';
import { DOMAIN_LABELS, emptyDirSync, writeJSON, writeTextFile } from './common.mjs';

function buildRefsByDomain(dataset) {
  const byDomain = new Map();
  const fileMap = new Map(dataset.files.map((f) => [f.file_id, f]));
  for (const seg of dataset.segments) {
    const file = fileMap.get(seg.file_id);
    const domain = file?.domain || 'other';
    if (!byDomain.has(domain)) byDomain.set(domain, []);
    byDomain.get(domain).push({
      segment_id: seg.segment_id,
      file_id: seg.file_id,
      path: file?.path || '',
      start_line: seg.start_line,
      end_line: seg.end_line,
      summary: seg.summary,
      tags: seg.tags || [],
      calls: seg.calls || [],
    });
  }

  for (const [domain, arr] of byDomain.entries()) {
    arr.sort((a, b) => a.path.localeCompare(b.path) || a.start_line - b.start_line);
    byDomain.set(
      domain,
      arr.slice(0, 120)
    );
  }
  return byDomain;
}

function topPathsByPrefix(files, prefix, limit = 20) {
  return files
    .filter((f) => f.path.startsWith(prefix))
    .sort((a, b) => b.line_count - a.line_count || a.path.localeCompare(b.path))
    .slice(0, limit)
    .map((f) => ({ path: f.path, file_id: f.file_id, line_count: f.line_count }));
}

function pickRefs(items, keywords, limit = 12) {
  const kws = keywords.map((k) => k.toLowerCase());
  const scored = [];
  for (const item of items || []) {
    const hay = `${item.path} ${item.summary} ${(item.tags || []).join(' ')} ${(item.calls || []).join(
      ' '
    )}`.toLowerCase();
    let score = 0;
    for (const k of kws) if (hay.includes(k)) score += 2;
    if (score > 0) scored.push({ ...item, _score: score });
  }
  scored.sort((a, b) => b._score - a._score || a.path.localeCompare(b.path));
  return scored.slice(0, limit).map(({ _score, ...rest }) => rest);
}

function ensureRefs(primary, fallback, limit = 12) {
  if (primary && primary.length) return primary.slice(0, limit);
  return (fallback || []).slice(0, limit);
}

function renderRefLines(refs) {
  const lines = [];
  for (const r of refs) {
    lines.push(`- ${r.segment_id} | ${r.path}:${r.start_line}-${r.end_line}`);
  }
  if (!refs.length) lines.push('- 无');
  return lines;
}

function renderHandoffOverview(dataset, byDomain) {
  const lines = [];
  lines.push('# 00-handoff-overview');
  lines.push('');
  lines.push('## 项目定位');
  lines.push('- 这是基于 gin-vue-admin 的前后端分离管理平台，内置 RBAC、自动代码、MCP/Skills、插件机制。');
  lines.push(
    `- 当前画像范围：${dataset.stats.total_files} 文件 / ${dataset.stats.total_segments} 逻辑段 / ${dataset.stats.total_lines} 行。`
  );
  lines.push('');
  lines.push('## 接手第一视角');
  lines.push('- 后端主链路：`main -> initialize -> router -> middleware -> api -> service -> model`。');
  lines.push('- 前端主链路：`main -> permission -> router -> pinia -> view -> api`。');
  lines.push('- 高风险域：鉴权访问、菜单权限、自动代码生成、MCP/Skills。');
  lines.push('');
  lines.push('## 模块入口（建议阅读顺序）');
  const domains = [...byDomain.keys()].sort((a, b) => a.localeCompare(b));
  for (const d of domains) {
    lines.push(`- ${d}: ${DOMAIN_LABELS[d] || DOMAIN_LABELS.other}`);
  }
  lines.push('');
  lines.push('## 关键模块引用');
  const keyRefs = [
    ...pickRefs(byDomain.get('system-config') || [], ['main', 'initialize', 'router'], 6),
    ...pickRefs(byDomain.get('auth-access') || [], ['jwt', 'casbin', 'token'], 6),
    ...pickRefs(byDomain.get('codegen-ai') || [], ['auto', 'workflow', 'template'], 6),
  ].slice(0, 18);
  lines.push(...renderRefLines(keyRefs));
  lines.push('');
  return lines.join('\n');
}

function renderDay1Runbook(dataset, byDomain) {
  const lines = [];
  lines.push('# 01-day1-runbook');
  lines.push('');
  lines.push('## Day1 目标');
  lines.push('- 在本地拉起前后端、确认鉴权链路可用、掌握日志与错误定位入口。');
  lines.push('');
  lines.push('## 启动路径');
  lines.push('1. 后端：`cd server && go run .`');
  lines.push('2. 前端：`cd web && npm install && npm run serve`');
  lines.push('3. 文档：`http://127.0.0.1:8888/swagger/index.html`');
  lines.push('');
  lines.push('## 调试入口（代码引用）');
  const picked = [
    ...pickRefs(byDomain.get('system-config') || [], ['runserver', 'viper', 'router'], 8),
    ...pickRefs(byDomain.get('frontend-core') || [], ['permission', 'router', 'request'], 8),
  ].slice(0, 14);
  const fallback = [
    ...(byDomain.get('system-config') || []).slice(0, 8),
    ...(byDomain.get('frontend-core') || []).slice(0, 8),
  ];
  const refs = ensureRefs(picked, fallback, 14);
  lines.push(...renderRefLines(refs));
  lines.push('');
  lines.push('## 常见问题定位');
  lines.push('- 登录失败：优先看 JWT 中间件、用户 API、前端请求头拼装。');
  lines.push('- 菜单不显示：优先看 menu API、authority 关联、前端动态路由注册。');
  lines.push('- 配置不生效：优先看 viper 加载与配置回写链路。');
  lines.push('');
  return lines.join('\n');
}

function renderBackendPlaybook(dataset, byDomain) {
  const lines = [];
  lines.push('# 02-backend-playbook');
  lines.push('');
  lines.push('## 分层职责');
  lines.push('- router：声明路由与中间件绑定。');
  lines.push('- api：参数绑定、校验、响应整形。');
  lines.push('- service：业务编排、事务与数据操作。');
  lines.push('- model/source：结构定义与初始化数据。');
  lines.push('');
  lines.push('## 高频改动入口');
  lines.push('- 新增接口：`router -> api -> service -> model` 全链路。');
  lines.push('- 改权限：`jwt/casbin/authority/menu` 联动检查。');
  lines.push('- 改生成器：`auto_code_*` 与模板资源联动。');
  lines.push('');
  lines.push('## 关键引用');
  const picked = [
    ...pickRefs(byDomain.get('auth-access') || [], ['jwt', 'casbin', 'authority', 'token'], 10),
    ...pickRefs(byDomain.get('menu-rbac') || [], ['menu', 'dictionary', 'params'], 10),
    ...pickRefs(byDomain.get('codegen-ai') || [], ['auto', 'template', 'mcp'], 10),
  ].slice(0, 24);
  const fallback = [
    ...(byDomain.get('auth-access') || []).slice(0, 8),
    ...(byDomain.get('menu-rbac') || []).slice(0, 8),
    ...(byDomain.get('codegen-ai') || []).slice(0, 8),
  ];
  const refs = ensureRefs(picked, fallback, 24);
  lines.push(...renderRefLines(refs));
  lines.push('');
  lines.push('## 后端检查清单');
  lines.push('- 接口层是否做参数校验与错误返回一致性。');
  lines.push('- service 是否存在跨模块副作用（global 状态、事务边界）。');
  lines.push('- 路由是否按权限域正确挂载到 public/private group。');
  lines.push('');
  return lines.join('\n');
}

function renderFrontendPlaybook(dataset, byDomain) {
  const lines = [];
  lines.push('# 03-frontend-playbook');
  lines.push('');
  lines.push('## 前端主链路');
  lines.push('- 启动：`src/main.js`');
  lines.push('- 权限：`src/permission.js`');
  lines.push('- 状态：`src/pinia/modules/*`');
  lines.push('- 页面：`src/view/*`');
  lines.push('');
  lines.push('## 高频改动入口');
  lines.push('- 新页面：路由菜单 + 视图组件 + API 封装联动。');
  lines.push('- 鉴权行为：token 存储、请求拦截、动态路由初始化。');
  lines.push('- 系统工具页：autoCode、skills、workflow 属于高复杂区域。');
  lines.push('');
  lines.push('## 关键引用');
  const picked = [
    ...pickRefs(byDomain.get('frontend-core') || [], ['router', 'permission', 'request', 'pinia'], 12),
    ...pickRefs(byDomain.get('frontend-ui') || [], ['view', 'systemtools', 'superadmin'], 12),
  ].slice(0, 22);
  const fallback = [
    ...(byDomain.get('frontend-core') || []).slice(0, 10),
    ...(byDomain.get('frontend-ui') || []).slice(0, 10),
  ];
  const refs = ensureRefs(picked, fallback, 22);
  lines.push(...renderRefLines(refs));
  lines.push('');
  lines.push('## 前端检查清单');
  lines.push('- 路由注册是否与菜单元数据一致。');
  lines.push('- 请求层是否正确透传 token/new-token。');
  lines.push('- keep-alive 与 tab 缓存行为是否符合配置。');
  lines.push('');
  return lines.join('\n');
}

function renderChangeRecipes(dataset, byDomain) {
  const lines = [];
  lines.push('# 04-change-recipes');
  lines.push('');
  lines.push('## 配方A：新增后端接口');
  lines.push('1. 在 router 增加路由注册。');
  lines.push('2. 在 api 增加 handler 与入参校验。');
  lines.push('3. 在 service 编排业务逻辑。');
  lines.push('4. 必要时补 model/request/response 结构。');
  lines.push('引用：');
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('system-config') || [], ['init', 'router'], 4),
        byDomain.get('system-config') || [],
        4
      )
    )
  );
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('menu-rbac') || [], ['api', 'router'], 4),
        byDomain.get('menu-rbac') || [],
        4
      )
    )
  );
  lines.push('');
  lines.push('## 配方B：调整菜单与权限');
  lines.push('1. 修改菜单结构与角色关联。');
  lines.push('2. 校对 Casbin 策略与默认首页。');
  lines.push('3. 前端确认 asyncRouter 与菜单渲染。');
  lines.push('引用：');
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('menu-rbac') || [], ['menu', 'authority'], 8),
        byDomain.get('menu-rbac') || [],
        8
      )
    )
  );
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('auth-access') || [], ['casbin', 'jwt'], 6),
        byDomain.get('auth-access') || [],
        6
      )
    )
  );
  lines.push('');
  lines.push('## 配方C：新增前端页面');
  lines.push('1. 新建 view 组件并注册菜单 component 路径。');
  lines.push('2. 添加对应 API 调用与状态管理逻辑。');
  lines.push('3. 检查权限路由与缓存策略。');
  lines.push('引用：');
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('frontend-ui') || [], ['view', 'index.vue'], 8),
        byDomain.get('frontend-ui') || [],
        8
      )
    )
  );
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('frontend-core') || [], ['router', 'pinia'], 6),
        byDomain.get('frontend-core') || [],
        6
      )
    )
  );
  lines.push('');
  lines.push('## 配方D：改导出模板/自动代码');
  lines.push('1. 修改模板定义或导出查询逻辑。');
  lines.push('2. 校对数据库字段映射和前端配置项。');
  lines.push('3. 端到端验证导入导出流程。');
  lines.push('引用：');
  lines.push(
    ...renderRefLines(
      ensureRefs(
        pickRefs(byDomain.get('codegen-ai') || [], ['auto', 'template', 'export'], 10),
        byDomain.get('codegen-ai') || [],
        10
      )
    )
  );
  lines.push('');
  lines.push('## 配方E：接入或修改插件');
  lines.push('1. 后端插件路由/服务注册到插件入口。');
  lines.push('2. 前端插件 view/api 目录与动态组件路径保持一致。');
  lines.push('3. 校验权限、菜单与构建路径映射。');
  lines.push('引用：');
  lines.push(...renderRefLines(ensureRefs(
    pickRefs(byDomain.get('plugin-ecosystem') || [], ['plugin', 'register', 'router'], 10),
    byDomain.get('plugin-ecosystem') || [],
    10
  )));
  lines.push('');
  return lines.join('\n');
}

function buildNavigation(dataset, byDomain) {
  const docs = [
    '00-handoff-overview.md',
    '01-day1-runbook.md',
    '02-backend-playbook.md',
    '03-frontend-playbook.md',
    '04-change-recipes.md',
  ];

  const modules = [];
  for (const [domain, items] of [...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const fileIds = [...new Set(items.map((i) => i.file_id))];
    const segmentIds = items.slice(0, 60).map((i) => i.segment_id);
    modules.push({
      module: domain,
      label: DOMAIN_LABELS[domain] || DOMAIN_LABELS.other,
      doc: domain.startsWith('frontend') ? '03-frontend-playbook.md' : '02-backend-playbook.md',
      section: `module:${domain}`,
      file_ids: fileIds,
      segment_ids: segmentIds,
    });
  }

  return { docs, modules };
}

function computeSourceStats(dataset) {
  return {
    total_files: dataset.stats.total_files,
    total_segments: dataset.stats.total_segments,
    total_lines: dataset.stats.total_lines,
  };
}

export function renderDeveloperProject(dataset, options) {
  const outRoot = path.join(options.repoRoot, options.devOut);
  const indexDir = path.join(outRoot, 'index');
  emptyDirSync(outRoot);
  emptyDirSync(indexDir);

  const byDomain = buildRefsByDomain(dataset);
  const navigation = buildNavigation(dataset, byDomain);
  const generatedAt = options.generatedAt || new Date().toISOString();
  const sourceStats = options.sourceStats || computeSourceStats(dataset);

  writeTextFile(path.join(outRoot, '00-handoff-overview.md'), `${renderHandoffOverview(dataset, byDomain)}\n`);
  writeTextFile(path.join(outRoot, '01-day1-runbook.md'), `${renderDay1Runbook(dataset, byDomain)}\n`);
  writeTextFile(path.join(outRoot, '02-backend-playbook.md'), `${renderBackendPlaybook(dataset, byDomain)}\n`);
  writeTextFile(path.join(outRoot, '03-frontend-playbook.md'), `${renderFrontendPlaybook(dataset, byDomain)}\n`);
  writeTextFile(path.join(outRoot, '04-change-recipes.md'), `${renderChangeRecipes(dataset, byDomain)}\n`);

  writeJSON(path.join(indexDir, 'navigation.json'), navigation);
  writeJSON(path.join(indexDir, 'manifest.json'), {
    output: options.devOut,
    sync_id: options.syncId || null,
    generated_at: generatedAt,
    source_stats: sourceStats,
    scope: dataset.config.scope,
    exclude: dataset.config.exclude,
  });

  return {
    outRoot,
    docs: navigation.docs,
    modules: navigation.modules.length,
  };
}
