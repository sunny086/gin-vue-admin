# 00-handoff-overview

## 项目定位
- 这是基于 gin-vue-admin 的前后端分离管理平台，内置 RBAC、自动代码、MCP/Skills、插件机制。
- 当前画像范围：650 文件 / 4769 逻辑段 / 80517 行。

## 接手第一视角
- 后端主链路：`main -> initialize -> router -> middleware -> api -> service -> model`。
- 前端主链路：`main -> permission -> router -> pinia -> view -> api`。
- 高风险域：鉴权访问、菜单权限、自动代码生成、MCP/Skills。

## 模块入口（建议阅读顺序）
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

## 关键模块引用
- F904fca8b-S0004 | server/api/v1/system/sys_jwt_blacklist.go:22-34
- F951cec3f-S0003 | server/middleware/jwt.go:16-85
- F8db5cfbe-S0001 | server/api/v1/system/sys_api_token.go:1-2
- F8db5cfbe-S0002 | server/api/v1/system/sys_api_token.go:3-11
- F8db5cfbe-S0003 | server/api/v1/system/sys_api_token.go:12-14
- F8db5cfbe-S0004 | server/api/v1/system/sys_api_token.go:15-44
- F69c195e8-S0007 | server/api/v1/system/auto_code_package.go:92-101
- Fb6cd4bca-S0001 | server/api/v1/system/auto_code_template.go:1-2
- Fb6cd4bca-S0002 | server/api/v1/system/auto_code_template.go:3-11
- Fb6cd4bca-S0003 | server/api/v1/system/auto_code_template.go:12-22
- Fb6cd4bca-S0004 | server/api/v1/system/auto_code_template.go:23-58
- Fb6cd4bca-S0005 | server/api/v1/system/auto_code_template.go:59-93

