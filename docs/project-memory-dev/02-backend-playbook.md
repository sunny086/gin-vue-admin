# 02-backend-playbook

## 分层职责
- router：声明路由与中间件绑定。
- api：参数绑定、校验、响应整形。
- service：业务编排、事务与数据操作。
- model/source：结构定义与初始化数据。

## 高频改动入口
- 新增接口：`router -> api -> service -> model` 全链路。
- 改权限：`jwt/casbin/authority/menu` 联动检查。
- 改生成器：`auto_code_*` 与模板资源联动。

## 关键引用
- Fed8c5ff3-S0004 | server/api/v1/system/sys_authority.go:26-66
- Fed8c5ff3-S0006 | server/api/v1/system/sys_authority.go:103-132
- F98ed0356-S0004 | server/api/v1/system/sys_casbin.go:24-54
- F98ed0356-S0005 | server/api/v1/system/sys_casbin.go:55-70
- F904fca8b-S0004 | server/api/v1/system/sys_jwt_blacklist.go:22-34
- F951cec3f-S0003 | server/middleware/jwt.go:16-85
- F8db5cfbe-S0001 | server/api/v1/system/sys_api_token.go:1-2
- F8db5cfbe-S0002 | server/api/v1/system/sys_api_token.go:3-11
- F8db5cfbe-S0003 | server/api/v1/system/sys_api_token.go:12-14
- F8db5cfbe-S0004 | server/api/v1/system/sys_api_token.go:15-44
- F72d2e73c-S0001 | server/api/v1/system/sys_dictionary_detail.go:1-2
- F72d2e73c-S0002 | server/api/v1/system/sys_dictionary_detail.go:3-14
- F72d2e73c-S0003 | server/api/v1/system/sys_dictionary_detail.go:15-25
- F72d2e73c-S0004 | server/api/v1/system/sys_dictionary_detail.go:26-50
- F72d2e73c-S0005 | server/api/v1/system/sys_dictionary_detail.go:51-75
- F72d2e73c-S0006 | server/api/v1/system/sys_dictionary_detail.go:76-100
- F72d2e73c-S0007 | server/api/v1/system/sys_dictionary_detail.go:101-130
- F72d2e73c-S0008 | server/api/v1/system/sys_dictionary_detail.go:131-160
- F72d2e73c-S0009 | server/api/v1/system/sys_dictionary_detail.go:161-193
- F72d2e73c-S0010 | server/api/v1/system/sys_dictionary_detail.go:194-218
- F715ea4cc-S0001 | server/api/v1/system/auto_code_mcp.go:1-2
- F715ea4cc-S0002 | server/api/v1/system/auto_code_mcp.go:3-14
- F715ea4cc-S0003 | server/api/v1/system/auto_code_mcp.go:15-30
- F715ea4cc-S0004 | server/api/v1/system/auto_code_mcp.go:31-37

## 后端检查清单
- 接口层是否做参数校验与错误返回一致性。
- service 是否存在跨模块副作用（global 状态、事务边界）。
- 路由是否按权限域正确挂载到 public/private group。

