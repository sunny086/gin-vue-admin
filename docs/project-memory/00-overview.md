# 00-overview

## 目标与边界
- 目标：构建可重复生成的项目画像文档包，支持低 token 问题定位。
- 纳入文件：650，逻辑段：4769，总行数：80517。
- 范围：server, web, deploy, root
- 排除：.git/, .idea/, .vscode/, .cursor/, .codex/, .claude/, .aone_copilot/, .trae/, node_modules/, server/docs/, /assets/

## 架构主链路
- 后端：`main -> initialize -> router -> middleware -> api -> service -> model`。
- 前端：`main -> router/permission -> pinia -> view -> api -> request`。
- 插件：后端 `server/plugin` 与前端 `web/src/plugin` 双端协同。
- AI 能力：`auto_code + mcp + skills + ai_workflow` 形成自动化编程链路。

## 模块地图
| Domain | 说明 | 文件数 | 逻辑段数 |
|---|---|---:|---:|
| auth-access | 鉴权与访问控制 | 54 | 352 |
| codegen-ai | 代码生成与AI工作流 | 45 | 518 |
| data-model | 数据模型与初始化数据 | 33 | 196 |
| deploy-ops | 部署与运维 | 10 | 27 |
| docs-governance | 文档与治理 | 5 | 107 |
| frontend-core | 前端框架内核 | 42 | 444 |
| frontend-ui | 前端业务界面 | 86 | 780 |
| mcp-skills | MCP与Skills生态 | 35 | 420 |
| menu-rbac | 菜单与权限编排 | 54 | 521 |
| other | 通用模块 | 22 | 64 |
| plugin-ecosystem | 插件生态 | 67 | 282 |
| system-config | 系统配置与运行时 | 197 | 1058 |

## 关键规模指标
- 后端路由注册动作数（静态扫描）：191
- 路由域 Top:
- customer: 4
- addBaseMenu: 1
- addCategory: 1
- addFunc: 1
- addMenuAuthority: 1
- admin_register: 1
- breakpointContinue: 1
- breakpointContinueFinish: 1
- canRemoveAuthorityBtn: 1
- captcha: 1
- 最大文件 Top:
- web/src/view/systemTools/aiWrokflow/index.vue: 2424 行
- web/src/view/systemTools/autoCode/index.vue: 1682 行
- web/src/view/systemTools/skills/index.vue: 1461 行
- web/src/view/superAdmin/menu/icon.vue: 1180 行
- web/src/view/systemTools/exportTemplate/exportTemplate.vue: 1167 行
- web/src/view/systemTools/system/system.vue: 1136 行
- web/src/view/systemTools/version/version.vue: 999 行
- web/src/view/superAdmin/menu/menu.vue: 933 行
- web/src/view/superAdmin/dictionary/sysDictionary.vue: 925 行
- web/src/view/superAdmin/api/api.vue: 919 行
- server/go.sum: 881 行
- server/service/system/sys_skills.go: 786 行

## 术语字典
- AuthN: 身份认证（Authentication）
- AuthZ: 权限授权（Authorization）
- DynRoute: 动态路由
- ACG: 自动代码生成（Auto Code Generation）
- MCP: Model Context Protocol 服务能力

