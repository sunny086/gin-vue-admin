# 04-change-recipes

## 配方A：新增后端接口
1. 在 router 增加路由注册。
2. 在 api 增加 handler 与入参校验。
3. 在 service 编排业务逻辑。
4. 必要时补 model/request/response 结构。
引用：
- F977f83e7-S0005 | server/api/v1/system/sys_export_template.go:44-47
- F2473a7b4-S0001 | server/api/v1/system/sys_initdb.go:1-2
- F2473a7b4-S0002 | server/api/v1/system/sys_initdb.go:3-11
- F2473a7b4-S0003 | server/api/v1/system/sys_initdb.go:12-20
- F981a6bb5-S0012 | server/api/v1/system/sys_menu.go:256-298
- Fb7bbb044-S0001 | server/api/v1/system/sys_api.go:1-2
- Fb7bbb044-S0002 | server/api/v1/system/sys_api.go:3-15
- Fb7bbb044-S0003 | server/api/v1/system/sys_api.go:16-26

## 配方B：调整菜单与权限
1. 修改菜单结构与角色关联。
2. 校对 Casbin 策略与默认首页。
3. 前端确认 asyncRouter 与菜单渲染。
引用：
- Fb7bbb044-S0013 | server/api/v1/system/sys_api.go:272-291
- F981a6bb5-S0003 | server/api/v1/system/sys_menu.go:16-25
- F981a6bb5-S0004 | server/api/v1/system/sys_menu.go:26-46
- F981a6bb5-S0005 | server/api/v1/system/sys_menu.go:47-66
- F981a6bb5-S0006 | server/api/v1/system/sys_menu.go:67-95
- F981a6bb5-S0007 | server/api/v1/system/sys_menu.go:96-125
- F981a6bb5-S0012 | server/api/v1/system/sys_menu.go:256-298
- F981a6bb5-S0014 | server/api/v1/system/sys_menu.go:326-336
- Fed8c5ff3-S0004 | server/api/v1/system/sys_authority.go:26-66
- Fed8c5ff3-S0006 | server/api/v1/system/sys_authority.go:103-132
- F98ed0356-S0001 | server/api/v1/system/sys_casbin.go:1-2
- F98ed0356-S0002 | server/api/v1/system/sys_casbin.go:3-12
- F98ed0356-S0003 | server/api/v1/system/sys_casbin.go:13-23
- F98ed0356-S0004 | server/api/v1/system/sys_casbin.go:24-54

## 配方C：新增前端页面
1. 新建 view 组件并注册菜单 component 路径。
2. 添加对应 API 调用与状态管理逻辑。
3. 检查权限路由与缓存策略。
引用：
- F2d829685-S0001 | web/src/components/errorPreview/index.vue:1-55
- F2d829685-S0002 | web/src/components/errorPreview/index.vue:56-117
- F2d829685-S0003 | web/src/components/errorPreview/index.vue:118-121
- F2d829685-S0004 | web/src/components/errorPreview/index.vue:122-127
- Fd0a86a35-S0001 | web/src/components/application/index.vue:1-4
- Fd0a86a35-S0002 | web/src/components/application/index.vue:5-13
- Fd0a86a35-S0003 | web/src/components/application/index.vue:14-22
- Fd0a86a35-S0004 | web/src/components/application/index.vue:23-28
- F82e32e61-S0001 | web/src/api/api.js:1-14
- F82e32e61-S0002 | web/src/api/api.js:15-30
- F82e32e61-S0003 | web/src/api/api.js:31-46
- F82e32e61-S0004 | web/src/api/api.js:47-62
- F82e32e61-S0005 | web/src/api/api.js:63-78
- F82e32e61-S0006 | web/src/api/api.js:79-93

## 配方D：改导出模板/自动代码
1. 修改模板定义或导出查询逻辑。
2. 校对数据库字段映射和前端配置项。
3. 端到端验证导入导出流程。
引用：
- F69c195e8-S0007 | server/api/v1/system/auto_code_package.go:92-101
- Fb6cd4bca-S0001 | server/api/v1/system/auto_code_template.go:1-2
- Fb6cd4bca-S0002 | server/api/v1/system/auto_code_template.go:3-11
- Fb6cd4bca-S0003 | server/api/v1/system/auto_code_template.go:12-22
- Fb6cd4bca-S0004 | server/api/v1/system/auto_code_template.go:23-58
- Fb6cd4bca-S0005 | server/api/v1/system/auto_code_template.go:59-93
- Fb6cd4bca-S0006 | server/api/v1/system/auto_code_template.go:94-122
- Fdc1388c0-S0001 | server/api/v1/system/auto_code_history.go:1-2
- Fdc1388c0-S0002 | server/api/v1/system/auto_code_history.go:3-11
- Fdc1388c0-S0003 | server/api/v1/system/auto_code_history.go:12-22

## 配方E：接入或修改插件
1. 后端插件路由/服务注册到插件入口。
2. 前端插件 view/api 目录与动态组件路径保持一致。
3. 校验权限、菜单与构建路径映射。
引用：
- F80e05030-S0007 | server/plugin/announcement/plugin.go:20-33
- F8fa09b8b-S0005 | server/plugin/email/main.go:23-26
- Fbc8d9da6-S0003 | server/plugin/announcement/initialize/api.go:9-50
- F81e07d16-S0003 | server/plugin/announcement/initialize/dictionary.go:9-13
- Fbf33fb77-S0003 | server/plugin/announcement/initialize/menu.go:9-23
- Fa2163d2d-S0001 | server/plugin/announcement/initialize/router.go:1-2
- Fa2163d2d-S0002 | server/plugin/announcement/initialize/router.go:3-9
- Fa2163d2d-S0003 | server/plugin/announcement/initialize/router.go:10-16
- F80e05030-S0006 | server/plugin/announcement/plugin.go:16-19
- Faa77ffc9-S0001 | server/plugin/announcement/router/enter.go:1-2

