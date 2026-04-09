# 验证记录

## 验证范围

这份记录现在覆盖三层：

- 本地仓库门禁
- `2026-04-09` 在真实 `Claude Code CLI` 和 `Codex CLI` 中，对主仓库做的正向 smoke test
- `2026-04-09` 在真实 `OpenClaw` 中，对 `harness-run` skill 的发现链路与真实 agent turn 做的 smoke test

它还**不**覆盖下面两类结论：

- 故意失败场景下的宿主 stop gate 反向验证
- 复制到新路径后的 trusted project 差异已经完全厘清

## 本次实际执行的命令

```bash
npm run install
claude --version
claude auth status
claude agents
claude -p --output-format json "..."
claude -p --output-format json --setting-sources project "..."
codex --version
codex login status
codex exec --json ... "..."
codex exec --json ... "请使用 harness-run skill ..."
node packages/harnessctl/src/index.mjs install --host openclaw --mode workspace
openclaw skills list
openclaw status
openclaw gateway status
openclaw agent --agent main --message "请用 harness 架构循环工作..." --json
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

## 结果

### 1. 安装 / 卸载 / 重装

通过。

- 按 [install-operations.md](install-operations.md) 先卸载 repo-local 资产，再执行 `npm run install`
- `install` 返回 `ok = true`
- Claude / Codex / `.agents` / `plugins` 的关键文件都重新落位

### 2. Claude Code CLI

主仓库正向链路通过。

- `claude --version` = `2.1.87`
- `claude auth status` 显示已登录
- `claude agents` 能看到 4 个 project agents：`harness-builder`、`harness-planner`、`harness-researcher`、`harness-reviewer`
- `claude -p --output-format json` 成功返回 `claude_cli_smoke_test_ok`
- `claude -p --output-format json --setting-sources project "请用 harness 架构循环工作..."` 已返回严格三团队结果：明确给出 `standards_team / execution_team / evaluation_team`，并且失败回路明确先回到 `standards_team`
- 主仓库 `.harness/state/current/review.json`、`.harness/state/current/score.json`、`.harness/state/current/attempts.jsonl` 在 `2026-04-09 12:55:46` 和 `2026-04-09 12:56:52`（Asia/Shanghai）被刷新，说明正向链路里 `review` 和 `score` 确实被执行
- 调试日志显示 project skill 目录 `.claude/skills` 被加载，并且在 `--setting-sources project` 下能看到 `project: 1` 的 skill 计数和 `UserPromptSubmit` matcher
- 为了提高 Claude 侧自然语言命中稳定性，`npm run install` 现在会把受控的 harness 路由块写入 `CLAUDE.md`，在 skill 自动发现失手时仍然强制走三团队循环

需要保留的事实：

- 默认会话会混入用户级 skill / plugin / hook，所以“真实默认宿主行为”和“纯项目隔离行为”不是一回事
- Claude 的 skill 自动发现并不总是稳定命中 repo-local skill，所以当前采用了“双保险”：repo-local `harness-run` skill + `CLAUDE.md` 受控路由块

### 3. Codex CLI

主仓库正向链路通过。

- `codex --version` = `codex-cli 0.118.0`
- `codex login status` 显示 `Logged in using ChatGPT`
- `codex exec --json` 成功返回 `codex_cli_smoke_test_ok。`
- `codex exec --json "请用 harness 架构循环工作..."` 已返回严格三团队结果：明确给出 `standards_team / execution_team / evaluation_team`，并且失败回路明确先回到 `standards_team`
- 主仓库 `.harness/state/current/attempts.jsonl` 在 `2026-04-09 12:50:51`、`12:51:56`、`12:54:32`（Asia/Shanghai）新增通过记录，说明 `Stop -> score` 的正向链路确实生效
- `harness-run` skill 探针中，Codex 先读取了 `.agents/skills/harness-run/SKILL.md`，随后返回 `review,score`

需要保留的事实：

- Codex CLI 全程伴随全局环境噪音，包括 `state_5.sqlite` migration warning、plugin manifest warning、analytics `403`
- 这些告警没有阻断主仓库正向链路，但会明显污染日志，不适合直接把原始终端输出当对外演示材料

### 4. OpenClaw

OpenClaw 真实 agent turn 通过。

- `node packages/harnessctl/src/index.mjs install --host openclaw --mode workspace` 成功把当前仓库 `skills/` 注册进 `~/.openclaw/openclaw.json -> skills.load.extraDirs`
- `openclaw skills list` 已能看到 `harness-run`，来源显示为 `openclaw-extra`
- `openclaw status` 和 `openclaw gateway status` 都确认网关可达、Gateway service 正在运行
- `openclaw agent --agent main --message "请用 harness 架构循环工作..." --json` 返回了真实三团队回答，明确包含 `standards_team / execution_team / evaluation_team` 与“评估失败先回 `standards_team`”的失败回路

需要保留的事实：

- 这一步确认了 skill 被发现、配置已注册、真实 agent turn 已能回出三团队框架
- 但还没有补完“一次真实任务中，`sessions_spawn` 真的把 `standards_team / execution_team / evaluation_team` 跑起来”的强证据

### 5. 本地门禁

通过。

- `npm test`：20 个测试全部通过
- `npm run review`：`critical = 0`、`high = 0`、`medium = 0`
- `npm run doctor`：`ok = true`、`checked = 20`
- `npm run bundle`：`dist/claude-harness-loop/`、`dist/codex-harness-loop/`、`dist/openclaw-harness-loop/` 已产出
- `npm run score`：`passed = true`、`score = 100`、`threshold = 90`

## 当前判断

当前可以下的结论是：

- 主仓库的安装流程已经实测通过
- 主仓库在 `Claude Code CLI`、`Codex CLI`、`OpenClaw` 里的严格 harness 意图 smoke test 都已经通过
- OpenClaw 已经能发现并加载 `harness-run`
- OpenClaw 真实 agent turn 已经能按三团队框架回应 harness 意图
- `harness-run` 在 Codex CLI 侧有直接读取 skill 文件并给出最终三团队结果的证据，Claude CLI 侧有 project skill 已加载加 `CLAUDE.md` 受控路由块的双重证据

当前还不能下的结论是：

- 复制到新路径后的副本一定会自动继承相同的 hook 行为
- 故意失败场景下的宿主 stop gate 已经在真实宿主里完整验收
- OpenClaw 已经留下了 `sessions_spawn` 三团队完整实跑证据
