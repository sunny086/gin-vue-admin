# project_memory

用于生成 Gin-Vue-Admin 的双视图项目画像文档包：

- 机器检索版：`docs/project-memory`
- 开发者接手版：`docs/project-memory-dev`

## 用法

```bash
node tools/project_memory/cli.mjs \
  --scope=server,web,deploy,root \
  --out=docs/project-memory \
  --dev-out=docs/project-memory-dev \
  --lang=zh \
  --max-lines-per-doc=850
```

## 参数

- `--scope`：扫描范围，逗号分隔，默认 `server,web,deploy,root`
- `--exclude`：额外排除项，可重复传入或逗号分隔
- `--out`：输出目录，默认 `docs/project-memory`
- `--dev-out`：开发者版输出目录，默认 `docs/project-memory-dev`
- `--no-dev`：仅生成机器检索版
- `--lang`：文档语言，默认 `zh`
- `--max-lines-per-doc`：`files/` 分卷单文件最大行数，默认 `850`

## 输出

- `docs/project-memory/00-overview.md`
- `docs/project-memory/01-feature-map.md`
- `docs/project-memory/02-strengths-weaknesses.md`
- `docs/project-memory/03-risk-backlog.md`
- `docs/project-memory/04-prompt-pack.md`
- `docs/project-memory/files/*.md`
- `docs/project-memory/index/files.jsonl`
- `docs/project-memory/index/segments.jsonl`
- `docs/project-memory/index/module-map.json`
- `docs/project-memory/index/manifest.json`（含 `sync_id`）

- `docs/project-memory-dev/00-handoff-overview.md`
- `docs/project-memory-dev/01-day1-runbook.md`
- `docs/project-memory-dev/02-backend-playbook.md`
- `docs/project-memory-dev/03-frontend-playbook.md`
- `docs/project-memory-dev/04-change-recipes.md`
- `docs/project-memory-dev/index/navigation.json`
- `docs/project-memory-dev/index/manifest.json`（含 `sync_id`）

## 同步机制

- 两套文档来自同一次 `scan + classify` 结果，不重复扫描。
- 机器版与开发者版写入同一个 `sync_id`。
- 若同次生成后两边 `sync_id` 不一致，CLI 会直接报错退出。
