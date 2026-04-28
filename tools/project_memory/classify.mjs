import { DOMAIN_LABELS, trimTo, uniq } from './common.mjs';

function classifyDomainByPath(filePath) {
  const p = filePath.toLowerCase();

  if (p.startsWith('deploy/')) return 'deploy-ops';
  if (
    p.startsWith('readme') ||
    p.endsWith('security.md') ||
    p.endsWith('contributing.md') ||
    p.endsWith('code_of_conduct.md')
  ) {
    return 'docs-governance';
  }
  if (p.includes('/plugin/')) return 'plugin-ecosystem';
  if (p.includes('/mcp/') || p.includes('skills')) return 'mcp-skills';
  if (p.includes('auto_code') || p.includes('autocode') || p.includes('ai_workflow')) {
    return 'codegen-ai';
  }
  if (
    p.includes('jwt') ||
    p.includes('casbin') ||
    p.includes('authority') ||
    p.includes('auth') ||
    p.includes('login') ||
    p.includes('api_token')
  ) {
    return 'auth-access';
  }
  if (
    p.includes('menu') ||
    p.includes('dictionary') ||
    p.includes('params') ||
    p.includes('sys_api') ||
    p.includes('operation_record')
  ) {
    return 'menu-rbac';
  }
  if (p.startsWith('server/model') || p.startsWith('server/source')) return 'data-model';
  if (
    p.startsWith('server/config') ||
    p.startsWith('server/initialize') ||
    p.startsWith('server/core') ||
    p.startsWith('server/global') ||
    p === 'makefile' ||
    p.endsWith('dockerfile')
  ) {
    return 'system-config';
  }
  if (p.startsWith('web/src/view') || p.startsWith('web/src/components')) return 'frontend-ui';
  if (
    p.startsWith('web/src/api') ||
    p.startsWith('web/src/router') ||
    p.startsWith('web/src/pinia') ||
    p.startsWith('web/src/core') ||
    p === 'web/src/pathinfo.json' ||
    p.startsWith('web/src/utils') ||
    p.startsWith('web/src/directive') ||
    p.startsWith('web/src/permission') ||
    p === 'web/src/main.js'
  ) {
    return 'frontend-core';
  }
  if (p.startsWith('server/')) return 'system-config';
  return 'other';
}

function extractGoFuncSignature(line) {
  const clean = line.trim();
  const m = clean.match(/^func\s*(\([^)]+\)\s*)?([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(.*)$/);
  if (!m) return null;
  const receiver = (m[1] || '').trim();
  const name = (m[2] || '').trim();
  const inputs = (m[3] || '').trim();
  let outputs = (m[4] || '').trim();
  if (outputs.endsWith('{')) outputs = outputs.slice(0, -1).trim();
  return { receiver, name, inputs, outputs };
}

function extractJSFunctionSignature(line) {
  const clean = line.trim();
  const mFn = clean.match(/^(?:async\s+)?function\s+([A-Za-z_$]\w*)\s*\(([^)]*)\)/);
  if (mFn) {
    return { name: mFn[1], inputs: mFn[2], outputs: '' };
  }
  const mArrow = clean.match(/^const\s+([A-Za-z_$]\w*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
  if (mArrow) {
    return { name: mArrow[1], inputs: mArrow[2], outputs: '' };
  }
  const mExport = clean.match(/^export\s+const\s+([A-Za-z_$]\w*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
  if (mExport) {
    return { name: mExport[1], inputs: mExport[2], outputs: '' };
  }
  return null;
}

function inferActionFromName(name) {
  if (!name) return '承载该模块的核心逻辑';
  const n = name.toLowerCase();
  if (n.startsWith('init') || n.includes('setup') || n.includes('register')) return '完成初始化或注册流程';
  if (n.startsWith('get') || n.includes('list') || n.includes('find') || n.includes('query')) return '执行查询与读取流程';
  if (n.startsWith('create') || n.includes('add') || n.includes('insert')) return '执行创建或新增流程';
  if (n.startsWith('update') || n.includes('set') || n.includes('save')) return '执行更新与配置写入流程';
  if (n.startsWith('delete') || n.includes('remove')) return '执行删除与清理流程';
  if (n.includes('run') || n.includes('start') || n.includes('stop')) return '控制服务运行状态';
  if (n.includes('validate') || n.includes('verify') || n.includes('check')) return '执行校验与约束判断';
  if (n.includes('render') || n.includes('preview')) return '输出渲染结果';
  if (n.includes('handle')) return '处理请求或事件分发';
  return '承载该模块的核心逻辑';
}

function detectSideEffects(content) {
  const effects = [];
  const text = content || '';
  if (/panic\s*\(/.test(text)) effects.push('触发 panic');
  if (/os\.Exit\s*\(/.test(text)) effects.push('触发进程退出');
  if (/Create\(|Save\(|Update\(|Delete\(|AutoMigrate\(/.test(text)) effects.push('写入数据库');
  if (/WriteFile|fs\.writeFile|fs\.writeFileSync/.test(text)) effects.push('写入文件系统');
  if (/Router\.(GET|POST|PUT|DELETE|PATCH)|addRoute|createRouter/.test(text)) effects.push('变更路由注册');
  if (/global\.[A-Za-z_]\w*\s*=/.test(text)) effects.push('修改全局状态');
  if (/http\.(Get|Post|Do)|axios|fetch\(/.test(text)) effects.push('发起网络调用');
  if (/go\s+\w+\(/.test(text)) effects.push('启动并发协程');
  return uniq(effects);
}

function detectRisks(content, segment) {
  const risks = [];
  const text = content || '';
  if (/panic\s*\(/.test(text)) risks.push('存在 panic 路径，异常恢复依赖上层中间件');
  if (/os\.Exit\s*\(/.test(text)) risks.push('存在进程级退出路径，影响服务可用性');
  if (/TODO|FIXME/.test(text)) risks.push('存在待办逻辑，行为边界未完全收敛');
  if (/global\.[A-Za-z_]\w*/.test(text)) risks.push('依赖全局状态，模块可测试性与解耦性下降');
  if ((segment.end_line || 0) - (segment.start_line || 0) > 220) risks.push('逻辑段较长，建议拆分以降低维护成本');
  return uniq(risks);
}

function extractTags(domain, segmentKind, content) {
  const tags = [domain, segmentKind];
  const text = content || '';
  if (/Router\.(GET|POST|PUT|DELETE|PATCH)|createRouter|addRoute/.test(text)) tags.push('route');
  if (/gorm|sql|AutoMigrate|Model\(/.test(text)) tags.push('database');
  if (/jwt|token|casbin|authority/.test(text)) tags.push('security');
  if (/mcp|skills|workflow/.test(text)) tags.push('ai-tooling');
  if (/plugin/.test(text)) tags.push('plugin');
  if (/config|viper|env/.test(text)) tags.push('config');
  return uniq(tags.filter(Boolean));
}

function fillInputsOutputs(lang, segment) {
  const firstLine = (segment._content || '').split('\n')[0]?.trim() || '';

  if (lang === 'go' && segment.kind === 'go-func') {
    const sig = extractGoFuncSignature(firstLine);
    if (sig) {
      return {
        inputs: sig.inputs ? [sig.inputs] : [],
        outputs: sig.outputs ? [sig.outputs] : [],
        name: sig.name,
      };
    }
  }
  if (lang === 'js' || lang === 'vue') {
    const sig = extractJSFunctionSignature(firstLine);
    if (sig) {
      return {
        inputs: sig.inputs ? [sig.inputs] : [],
        outputs: sig.outputs ? [sig.outputs] : [],
        name: sig.name,
      };
    }
  }
  return { inputs: [], outputs: [], name: segment.title || '' };
}

function buildSummary(lang, segment, domain) {
  const domainLabel = DOMAIN_LABELS[domain] || DOMAIN_LABELS.other;
  const content = segment._content || '';
  const firstLine = content.split('\n')[0]?.trim() || '';

  if (lang === 'go' && segment.kind === 'go-func') {
    const sig = extractGoFuncSignature(firstLine);
    const name = sig?.name || segment.title || 'anonymous';
    return `函数 ${name}：${inferActionFromName(name)}，位于「${domainLabel}」域。`;
  }

  if (lang === 'go' && segment.kind === 'go-type') {
    const name = segment.title || 'Type';
    return `类型 ${name}：定义该文件的数据结构或接口边界，支撑「${domainLabel}」域。`;
  }

  if (lang === 'vue' && segment.kind === 'vue-template') {
    return `模板区块：定义页面结构与交互骨架，承载「${domainLabel}」的界面呈现。`;
  }
  if (lang === 'vue' && segment.kind.startsWith('vue-script')) {
    return `脚本区块：编排状态、事件与接口调用，落实「${domainLabel}」的业务逻辑。`;
  }
  if (lang === 'vue' && segment.kind === 'vue-style') {
    return `样式区块：定义页面视觉表现与布局约束。`;
  }

  if (lang === 'js' && segment.kind === 'js-import') {
    return `依赖导入区：声明当前模块依赖与耦合边界。`;
  }
  if (lang === 'js' && (segment.kind === 'js-func' || segment.kind === 'js-export')) {
    const sig = extractJSFunctionSignature(firstLine);
    const name = sig?.name || segment.title || 'module-part';
    return `函数/导出 ${name}：${inferActionFromName(name)}，用于支撑「${domainLabel}」域。`;
  }

  if (lang === 'yaml' && segment.kind === 'yaml-key') {
    return `配置键 ${segment.title || 'key'}：约束运行参数与部署行为。`;
  }

  if (lang === 'markdown' && segment.kind === 'md-heading') {
    return `文档章节「${trimTo(segment.title || 'section', 36)}」：提供项目说明与协作规则。`;
  }

  return `逻辑段 ${segment.kind}：承载「${domainLabel}」域的实现细节。`;
}

function inferDomainForSegment(fileDomain, segment) {
  const text = (segment._content || '').toLowerCase();
  if (/mcp|skills/.test(text)) return 'mcp-skills';
  if (/auto[_-]?code|workflow/.test(text)) return 'codegen-ai';
  if (/plugin/.test(text)) return 'plugin-ecosystem';
  return fileDomain;
}

function inferOwnedBy(filePath, currentOwnedBy) {
  if (currentOwnedBy && currentOwnedBy !== 'unknown') return currentOwnedBy;
  if (filePath.startsWith('server/')) return 'backend';
  if (filePath.startsWith('web/')) return 'frontend';
  if (filePath.startsWith('deploy/')) return 'devops';
  return 'governance';
}

export function classifyProject(dataset) {
  const fileById = new Map(dataset.files.map((f) => [f.file_id, f]));
  const domainCounter = new Map();

  dataset.files.forEach((file) => {
    const domain = classifyDomainByPath(file.path);
    file.domain = domain;
    file.owned_by = inferOwnedBy(file.path, file.owned_by);
    domainCounter.set(domain, (domainCounter.get(domain) || 0) + 1);
  });

  dataset.segments.forEach((segment) => {
    const file = fileById.get(segment.file_id);
    const baseDomain = file?.domain || 'other';
    const domain = inferDomainForSegment(baseDomain, segment);
    if (file && file.domain === 'other' && domain !== 'other') {
      file.domain = domain;
    }

    const io = fillInputsOutputs(file?.lang || 'text', segment);
    const sideEffects = detectSideEffects(segment._content);
    const risks = detectRisks(segment._content, segment);
    const calls = uniq(segment.calls || []).slice(0, 12);
    const summary = buildSummary(file?.lang || 'text', segment, domain);
    const tags = extractTags(domain, segment.kind, segment._content);

    segment.summary = summary;
    segment.inputs = io.inputs;
    segment.outputs = io.outputs;
    segment.side_effects = sideEffects;
    segment.calls = calls;
    segment.risks = risks;
    segment.tags = tags;
  });

  dataset.stats.domain_distribution = Object.fromEntries(
    [...domainCounter.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  );

  return dataset;
}
