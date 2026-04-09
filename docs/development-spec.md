# 开发规格说明

## 目标

这份文档只回答一件事：

**这个仓库里，什么东西该放哪，应该怎么命名，改动时以谁为准。**

如果没有这份规则，目录会越长越乱，README 会越写越胖，宿主配置也会慢慢分叉。

## 一级目录规则

### `packages/`

放核心运行时代码。

- `packages/harness-core/`：规则、评分、安装模板
- `packages/harnessctl/`：CLI 入口

凡是“会影响运行行为”的代码，优先放这里。

### `.claude/`

放 Claude Code 的 repo-local 适配资产。

包括：

- hooks 配置
- agents
- Claude 专用 skills

### `.codex/`

放 Codex 的 repo-local 适配资产。

包括：

- feature 配置
- hooks
- Codex agents

### `.agents/`

放 Codex 使用的 skills 目录。

它和 `.codex/` 配套，但职责不同：

- `.codex/` 负责宿主配置
- `.agents/` 负责 skill 内容

### `plugins/`

放对外分发的插件资产。

规则：

- `plugins/claude-harness-loop/`：Claude 分发资产
- `plugins/codex-harness-loop/`：Codex 插件资产

这里放的是“准备被打包和分发”的内容，不是临时实验目录。

### `.harness/`

放 harness 自己的运行时状态与可执行 shim。

包括：

- `.harness/bin/`
- `.harness/state/current/`
- `.harness/state/history/`

不要把业务源码塞进这里。

### `tests/`

放测试代码。

规则：

- 单元与契约测试放这里
- 文件名使用 `*.test.mjs`
- 不把样例仓库直接塞进测试根目录

### `fixtures/`

放回归样例仓库。

每个 fixture 都应该是一个自解释场景，例如：

- `pass-minimal`
- `test-fail`
- `review-block`

fixture 的职责是表达“一个完整场景”，不是存零碎输入文件。

### `scripts/`

放构建、生成、迁移、校验辅助脚本。

规则：

- 只有被多人重复执行、值得独立存在的动作，才放进 `scripts/`
- 一次性排障命令不要落成长期脚本

### `docs/`

放长期有效的项目文档。

当前分工：

- `architecture.md`：讲系统结构
- `development-spec.md`：讲目录、命名、放置规则
- `completion-status.md`：讲当前可以对外宣称什么
- `remaining-tasks.md`：讲仍值得继续做什么
- `local-verification.md`：讲真实验证证据
- `privacy-policy.md` / `terms-of-service.md`：讲开源发布必需条款
- `archive/`：放阶段性计划、历史过程物，不再当前台真相源

## 文档分工规则

### `README.md`

负责对外说明。

要讲清：

- 项目是什么
- 为什么存在
- 怎么快速跑起来
- 去哪里看架构和规范

不要在 README 里展开过长的内部协作规则。

### `AGENTS.md`

负责仓库内协作规则。

要讲清：

- 智能体和开发者进入仓库后先看什么
- harness 生效时谁是当前真相源
- 修改不同区域时优先看什么
- 完成标准与交付门禁

不要把 README 的外部介绍再抄一遍。

### 状态文档

以下文件只讲状态，不讲通用规则：

- `docs/completion-status.md`
- `docs/remaining-tasks.md`
- `docs/local-verification.md`

它们不应该承担架构说明职责。

## 命名规则

### 目录命名

- 包目录、插件目录使用 `kebab-case`
- 宿主根目录使用宿主约定名称：`.claude`、`.codex`、`.agents`

### JavaScript 模块文件

- 使用全小写
- 单词文件直接用语义名，例如 `contract.mjs`
- 新增多词文件时使用 `kebab-case`

### JSON 状态字段

- 使用 `snake_case`

例如：

- `task_id`
- `max_attempts`
- `strategy_fingerprint`

原因很简单：状态文件是机器读写数据，`snake_case` 更稳定，也更适合跨工具消费。

### CLI 选项

- 使用 `kebab-case`

例如：

- `--max-attempts`
- `--stop-hook`

这是命令行领域的通用习惯，不要硬拗成别的形式。

### Claude 资产命名

- agent 文件使用 `kebab-case`

例如：

- `harness-builder.md`
- `harness-planner.md`

### Codex 资产命名

- agent 文件使用 `snake_case`

例如：

- `harness_builder.toml`
- `harness_planner.toml`

原因不是审美，而是沿用当前宿主生态里已经存在的习惯，减少摩擦。

## 新文件应该往哪里放

### 新增评分、review、contract、安装逻辑

放到：

- `packages/harness-core/src/`

### 新增 CLI 子命令

放到：

- `packages/harnessctl/src/`

### 新增宿主 hook、agent、skill 映射

按宿主分流：

- Claude 配置进 `.claude/`
- Codex 配置进 `.codex/`
- Codex skill 内容进 `.agents/`
- 对外分发插件进 `plugins/`

### 新增构建或发布脚本

放到：

- `scripts/`

### 新增测试场景

如果是测试代码：

- `tests/`

如果是完整样例仓库：

- `fixtures/<scenario-name>/`

### 新增长期说明文档

放到：

- `docs/`

根目录不要继续堆新的“说明书副本”。

## 修改规则

### 改宿主模板时

优先改：

- `packages/harness-core/src/templates.mjs`
- `packages/harness-core/src/installer.mjs`

然后再通过安装命令刷新产物。

不要只改生成结果而忘了改模板源头，否则迟早再次漂移。

### 改插件清单时

如果是 Codex plugin manifest：

- 先确认 `templates.mjs` 与 `plugins/codex-harness-loop/.codex-plugin/plugin.json` 是否仍然一致

### 改状态文档时

必须保持：

- `completion-status` 讲“现在完成到哪”
- `remaining-tasks` 讲“接下来缺什么”
- `local-verification` 讲“本地跑过什么”

不要三份文档都写“项目是什么”。

## 清理规则

以下内容不应该长期留在仓库根目录：

- 临时笔记
- 一次性排障输出
- 重复版说明文档
- 系统垃圾文件，例如 `.DS_Store`

以下内容不应该继续出现：

- `example.com` 占位发布地址
- “先放这以后再说”的未归类脚本
- 同一条规则在 README、AGENTS、状态文档里被抄三遍

## 交付前检查

每次涉及结构、规范、模板、文档的改动，至少确认：

1. README 是否仍然简洁
2. AGENTS 是否仍然聚焦协作规则
3. `docs/architecture.md` 与 `docs/development-spec.md` 是否仍是规范真相源
4. 宿主模板与生成产物是否一致
5. 目录中是否新增了没有归属的文件

## 当前规范结论

从现在开始，这个仓库的规范真相源是：

- `docs/architecture.md`
- `docs/development-spec.md`

README、AGENTS、状态文档都应该围绕这两份文档收口，而不是各自再长出一套新规范。
