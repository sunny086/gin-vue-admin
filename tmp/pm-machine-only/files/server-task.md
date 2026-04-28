# server-task

- 文件数量：1

## [F59632558] server/task/clearTable.go
- 语言: go
- 领域: system-config (系统配置与运行时)
- 行数: 52
- imports: errors, fmt, github.com/flipped-aurora/gin-vue-admin/server/model/common, gorm.io/gorm, time
- entrypoints: -
- depends_on: -
- owned_by: backend
- 逻辑段:
- [F59632558-S0001] 行 1-2 | go-package | 逻辑段 go-package：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: -
- risks: -
- tags: system-config, go-package
- [F59632558-S0002] 行 3-17 | go-import | 逻辑段 go-import：承载「系统配置与运行时」域的实现细节。
- inputs: -
- outputs: -
- side_effects: -
- calls: import, db, tableName, compareField, interval
- risks: -
- tags: system-config, go-import, database
- [F59632558-S0003] 行 18-52 | go-func | 函数 ClearTable：承载该模块的核心逻辑，位于「系统配置与运行时」域。
- inputs: db *gorm.DB
- outputs: error
- side_effects: -
- calls: ClearTable, New, ParseDuration, Debug, Exec, Sprintf, Now, Add
- risks: -
- tags: system-config, go-func, database, security

