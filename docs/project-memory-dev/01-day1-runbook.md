# 01-day1-runbook

## Day1 目标
- 在本地拉起前后端、确认鉴权链路可用、掌握日志与错误定位入口。

## 启动路径
1. 后端：`cd server && go run .`
2. 前端：`cd web && npm install && npm run serve`
3. 文档：`http://127.0.0.1:8888/swagger/index.html`

## 调试入口（代码引用）
- F9cd57ca1-S0001 | Makefile:1-80
- Fc144f422-S0001 | server/api/v1/enter.go:1-2
- Fc144f422-S0002 | server/api/v1/enter.go:3-7
- Fc144f422-S0003 | server/api/v1/enter.go:8-9
- Fc144f422-S0004 | server/api/v1/enter.go:10-14
- Fccbe24d5-S0001 | server/api/v1/example/enter.go:1-2
- Fccbe24d5-S0002 | server/api/v1/example/enter.go:3-4
- Fccbe24d5-S0003 | server/api/v1/example/enter.go:5-11
- F82e32e61-S0001 | web/src/api/api.js:1-14
- F82e32e61-S0002 | web/src/api/api.js:15-30
- F82e32e61-S0003 | web/src/api/api.js:31-46
- F82e32e61-S0004 | web/src/api/api.js:47-62
- F82e32e61-S0005 | web/src/api/api.js:63-78
- F82e32e61-S0006 | web/src/api/api.js:79-93

## 常见问题定位
- 登录失败：优先看 JWT 中间件、用户 API、前端请求头拼装。
- 菜单不显示：优先看 menu API、authority 关联、前端动态路由注册。
- 配置不生效：优先看 viper 加载与配置回写链路。

