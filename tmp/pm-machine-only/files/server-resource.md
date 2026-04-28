# server-resource

- 文件数量：37

## [Fcfb9d18b] server/resource/function/api.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 45
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fcfb9d18b-S0001] 行 1-45 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: Context, Error, FailWithMessage, OkWithData
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block

## [F3b98530a] server/resource/function/api.js.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 33
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F3b98530a-S0001] 行 1-33 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: service
- risks: -
- tags: plugin-ecosystem, block

## [Ff32b1368] server/resource/function/server.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 26
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Ff32b1368-S0001] 行 1-26 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: MustGetGlobalDBByDBName, Model
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block, database

## [Faee93e2a] server/resource/mcp/tools.tpl
- 语言: template
- 领域: mcp-skills (MCP与Skills生态)
- 行数: 57
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Faee93e2a-S0001] 行 1-57 | block | 逻辑段 block：承载「MCP与Skills生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, init, RegisterTool, Handle, GetArguments, New, NewTool, WithDescription, Required, Description, DefaultString, DefaultNumber
- risks: 存在待办逻辑，行为边界未完全收敛
- tags: mcp-skills, block, ai-tooling

## [F7163097b] server/resource/package/readme.txt.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 8
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F7163097b-S0001] 行 1-8 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: system-config, block

## [F81f3ff38] server/resource/package/server/api/api.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 261
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F81f3ff38-S0001] 行 1-261 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Context, ShouldBindJSON, FailWithMessage, Error, GetUserID, OkWithMessage, Query, ByIds, QueryArray, OkWithData, List
- risks: 依赖全局状态，模块可测试性与解耦性下降 / 逻辑段较长，建议拆分以降低维护成本
- tags: system-config, block

## [Fb8978382] server/resource/package/server/api/enter.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 4
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fb8978382-S0001] 行 1-4 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: system-config, block

## [F40f08894] server/resource/package/server/model/model.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 76
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F40f08894-S0001] 行 1-76 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, TableName, GetChildren, SetChildren, GetID, int, GetParentID
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: system-config, block, database

## [F9524fbae] server/resource/package/server/model/request/request.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 40
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F9524fbae-S0001] 行 1-40 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import
- risks: -
- tags: system-config, block

## [F09f5fbcf] server/resource/package/server/router/enter.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 4
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F09f5fbcf-S0001] 行 1-4 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: system-config, block

## [F5763c078] server/resource/package/server/router/router.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 43
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F5763c078-S0001] 行 1-43 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: 变更路由注册
- calls: import, Router, Group, Use, OperationRecord, POST, DELETE, PUT, GET
- risks: -
- tags: system-config, block, route

## [Fa492a98f] server/resource/package/server/service/enter.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 4
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fa492a98f-S0001] 行 1-4 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: system-config, block

## [F8cb88e48] server/resource/package/server/service/service.go.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 214
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F8cb88e48-S0001] 行 1-214 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: 写入数据库
- calls: MustGetGlobalDBByDBName, DataSource, Table, Where, Select, Scan, import, Create, Find, Count, New, Transaction
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: system-config, block, database

## [Fad37e568] server/resource/package/web/api/api.js.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 131
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fad37e568-S0001] 行 1-131 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: service
- risks: -
- tags: system-config, block

## [F649e6d26] server/resource/package/web/view/form.vue.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 275
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F649e6d26-S0001] 行 1-275 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: ref, getDictFunc, async, DataSource, getDataSourceFunc, defineOptions, useRoute, useRouter, List, getTableData, reactive, init
- risks: 逻辑段较长，建议拆分以降低维护成本
- tags: system-config, block

## [Fb194ca98] server/resource/package/web/view/table.vue.tpl
- 语言: template
- 领域: system-config (系统配置与运行时)
- 行数: 695
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fb194ca98-S0001] 行 1-695 | block | 逻辑段 block：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: ref, getDictFunc, async, DataSource, getDataSourceFunc, openDialog, formatDate, getDetails, Func, deleteRow, defineOptions, useBtnAuth
- risks: 依赖全局状态，模块可测试性与解耦性下降 / 逻辑段较长，建议拆分以降低维护成本
- tags: system-config, block

## [Fd987673b] server/resource/plugin/server/api/api.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 256
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fd987673b-S0001] 行 1-256 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Context, ShouldBindJSON, FailWithMessage, Error, GetUserID, OkWithMessage, Query, ByIds, QueryArray, OkWithData, List
- risks: 依赖全局状态，模块可测试性与解耦性下降 / 逻辑段较长，建议拆分以降低维护成本
- tags: plugin-ecosystem, block, plugin

## [F9082acfd] server/resource/plugin/server/api/enter.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 7
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F9082acfd-S0001] 行 1-7 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: plugin-ecosystem, block

## [Fcdda6761] server/resource/plugin/server/config/config.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 5
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fcdda6761-S0001] 行 1-5 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: plugin-ecosystem, block, config

## [F09ddccaf] server/resource/plugin/server/gen/gen.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 19
- imports: -
- entrypoints: main-function
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F09ddccaf-S0001] 行 1-19 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, main, NewGenerator, Join, ApplyBasic, Execute
- risks: -
- tags: plugin-ecosystem, block, database

## [F9df2f501] server/resource/plugin/server/initialize/api.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 13
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F9df2f501-S0001] 行 1-13 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Api, RegisterApis
- risks: -
- tags: plugin-ecosystem, block, plugin

## [F7c36b6f7] server/resource/plugin/server/initialize/dictionary.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 13
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F7c36b6f7-S0001] 行 1-13 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Dictionary, RegisterDictionaries
- risks: -
- tags: plugin-ecosystem, block, plugin

## [Fb7f13aa6] server/resource/plugin/server/initialize/gorm.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 18
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fb7f13aa6-S0001] 行 1-18 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: 写入数据库
- calls: import, Gorm, WithContext, AutoMigrate, Wrap, L, Error, Sprintf
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block, database

## [Fdfcf30fe] server/resource/plugin/server/initialize/menu.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 13
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fdfcf30fe-S0001] 行 1-13 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Menu, RegisterMenus
- risks: -
- tags: plugin-ecosystem, block, plugin

## [F20b2f614] server/resource/plugin/server/initialize/router.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 15
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F20b2f614-S0001] 行 1-15 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Router, Group, Use, JWTAuth, CasbinHandler
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block

## [Fc9b0c5e1] server/resource/plugin/server/initialize/viper.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 18
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fc9b0c5e1-S0001] 行 1-18 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Viper, UnmarshalKey, Wrap, L, Error, Sprintf
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block, plugin

## [Ffe44b247] server/resource/plugin/server/model/model.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 77
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Ffe44b247-S0001] 行 1-77 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, TableName, GetChildren, SetChildren, GetID, int, GetParentID
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block, database

## [Fed4b5f2d] server/resource/plugin/server/model/request/request.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 39
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fed4b5f2d-S0001] 行 1-39 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import
- risks: -
- tags: plugin-ecosystem, block

## [F0a52e557] server/resource/plugin/server/plugin.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 34
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F0a52e557-S0001] 行 1-34 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, init, Register, Viper, Api, Menu, Dictionary, Background, Gorm, Router
- risks: -
- tags: plugin-ecosystem, block, plugin, config

## [F05c009a3] server/resource/plugin/server/plugin/plugin.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 6
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F05c009a3-S0001] 行 1-6 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: plugin-ecosystem, block, plugin, config

## [F9e8c41e2] server/resource/plugin/server/router/enter.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 7
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F9e8c41e2-S0001] 行 1-7 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: plugin-ecosystem, block

## [F097ce9c3] server/resource/plugin/server/router/router.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 47
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F097ce9c3-S0001] 行 1-47 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, Init, Group, Use, OperationRecord, POST, DELETE, PUT, GET
- risks: -
- tags: plugin-ecosystem, block

## [Fdb732658] server/resource/plugin/server/service/enter.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 8
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fdb732658-S0001] 行 1-8 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: plugin-ecosystem, block

## [F5e1e5463] server/resource/plugin/server/service/service.go.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 212
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F5e1e5463-S0001] 行 1-212 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: 写入数据库
- calls: MustGetGlobalDBByDBName, DataSource, Table, Where, Select, Scan, import, Create, Find, Count, New, Transaction
- risks: 依赖全局状态，模块可测试性与解耦性下降
- tags: plugin-ecosystem, block, database, plugin

## [F906a7e61] server/resource/plugin/web/api/api.js.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 128
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F906a7e61-S0001] 行 1-128 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: service
- risks: -
- tags: plugin-ecosystem, block

## [Fbc272bc8] server/resource/plugin/web/form/form.vue.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 465
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fbc272bc8-S0001] 行 1-465 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: ref, getDictFunc, Date, async, DataSource, getDataSourceFunc, defineOptions, useRoute, useRouter, List, getTableData, reactive
- risks: 逻辑段较长，建议拆分以降低维护成本
- tags: plugin-ecosystem, block, plugin

## [Fcc8766e6] server/resource/plugin/web/view/view.vue.tpl
- 语言: template
- 领域: plugin-ecosystem (插件生态)
- 行数: 690
- imports: -
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [Fcc8766e6-S0001] 行 1-690 | block | 逻辑段 block：承载「插件生态」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: ref, getDictFunc, async, DataSource, getDataSourceFunc, openDialog, formatDate, getDetails, Func, deleteRow, defineOptions, useBtnAuth
- risks: 依赖全局状态，模块可测试性与解耦性下降 / 逻辑段较长，建议拆分以降低维护成本
- tags: plugin-ecosystem, block, plugin

