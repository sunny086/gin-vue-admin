# 03-frontend-playbook

## 前端主链路
- 启动：`src/main.js`
- 权限：`src/permission.js`
- 状态：`src/pinia/modules/*`
- 页面：`src/view/*`

## 高频改动入口
- 新页面：路由菜单 + 视图组件 + API 封装联动。
- 鉴权行为：token 存储、请求拦截、动态路由初始化。
- 系统工具页：autoCode、skills、workflow 属于高复杂区域。

## 关键引用
- F2d829685-S0001 | web/src/components/errorPreview/index.vue:1-55
- F2d829685-S0002 | web/src/components/errorPreview/index.vue:56-117
- F2d829685-S0003 | web/src/components/errorPreview/index.vue:118-121
- F2d829685-S0004 | web/src/components/errorPreview/index.vue:122-127
- Fe365e846-S0001 | web/src/components/richtext/rich-view.vue:1-12
- Fe365e846-S0002 | web/src/components/richtext/rich-view.vue:13-22
- Fe365e846-S0003 | web/src/components/richtext/rich-view.vue:23-44
- Fe365e846-S0004 | web/src/components/richtext/rich-view.vue:45-57
- Fe365e846-S0005 | web/src/components/richtext/rich-view.vue:58-132

## 前端检查清单
- 路由注册是否与菜单元数据一致。
- 请求层是否正确透传 token/new-token。
- keep-alive 与 tab 缓存行为是否符合配置。

