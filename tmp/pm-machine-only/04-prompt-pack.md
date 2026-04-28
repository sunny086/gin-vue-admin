# 04-prompt-pack

## 使用原则
- 先按 `domain` 缩小范围，再按 `file_id` 与 `segment_id` 精准提问。
- 问题模板优先要求返回 `segment_id + 行号区间 + 变更建议`。
- 同类问题复用同一模板，减少上下文冗余。

## 检索模板
### 模板A：定位故障
- 输入：`domain=<domain>, symptom=<现象>, constraint=<限制>`
- 指令：
```text
请仅在指定 domain 内检索，返回最可能的 5 个 segment_id，按置信度排序。
每项包含：file_id、path、start_line-end_line、失败机理、最小修复点。
```

### 模板B：评估改动影响
- 输入：`target_segment=<segment_id>, change=<改动描述>`
- 指令：
```text
基于 target_segment，给出上游依赖、下游影响、回归测试建议。
输出必须包含受影响的 file_id 列表与优先级。
```

### 模板C：生成修复补丁草案
- 输入：`segment_ids=[...], goal=<目标行为>`
- 指令：
```text
仅根据给定 segment_ids 生成最小补丁方案，避免跨域重构。
输出包括：变更点、风险、验证步骤。
```

## Domain 值参考
- auth-access: 鉴权与访问控制
- codegen-ai: 代码生成与AI工作流
- data-model: 数据模型与初始化数据
- deploy-ops: 部署与运维
- docs-governance: 文档与治理
- frontend-core: 前端框架内核
- frontend-ui: 前端业务界面
- mcp-skills: MCP与Skills生态
- menu-rbac: 菜单与权限编排
- other: 通用模块
- plugin-ecosystem: 插件生态
- system-config: 系统配置与运行时

## 术语缩写
- AuthN: 身份认证（Authentication）
- AuthZ: 权限授权（Authorization）
- DynRoute: 动态路由
- ACG: 自动代码生成（Auto Code Generation）
- MCP: Model Context Protocol 服务能力

