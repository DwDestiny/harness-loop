# 验证记录

## 覆盖范围

这份记录现在覆盖 4 类证据：

- 本地门禁
- `Claude Code CLI` 严格 harness 主链路 + 失败态 stop gate
- `Codex CLI` 严格 harness 主链路 + 失败态 stop gate
- `OpenClaw` skill 发现、真实 agent turn、真实 `sessions_spawn`

## 本次实际执行的命令

```bash
npm run install
claude --version
claude auth status
claude agents
claude -p --output-format json --setting-sources project "请用 harness 架构循环工作..."
codex --version
codex login status
codex exec --json "请用 harness 架构循环工作..."
node packages/harnessctl/src/index.mjs install --host openclaw --mode workspace
openclaw skills list
openclaw agent --agent main --message "请用 harness 架构循环工作..." --json
openclaw agent --agent main --thinking high --json --message "使用 harness-run skill，并真实调用 sessions_spawn 三次"
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

另外补了两条失败态验证：

```bash
claude -p --output-format json --setting-sources project --dangerously-skip-permissions "不要改任何文件，只回复 STOP-GATE-PROBE"
codex exec --json "不要改任何文件，只回复 STOP-GATE-PROBE"
```

其中 Codex 的失败态验证是在**带 `.git` 的临时副本**里完成的，因为 repo-local 行为本来就依赖 git 工作区语义。

## 结果

### 1. 安装 / 卸载 / 重装

通过。

- `npm run install` 能稳定刷新 `.claude/`、`.codex/`、`.agents/`、`skills/`、`plugins/`
- `install --host openclaw --mode workspace` 能把当前仓库 `skills/` 注册到 `~/.openclaw/openclaw.json -> skills.load.extraDirs`

### 2. Claude Code CLI

通过。

- `claude --version` = `2.1.87`
- `claude auth status` 已登录
- `claude agents` 能看到 project agents
- 严格 harness 提示会返回固定三团队：`standards_team / execution_team / evaluation_team`
- 失败回路会明确回到 `standards_team`
- 失败态 stop gate 已真实写回 `.harness/state/current/attempts.jsonl` 和 `score.json`

本次失败态证据要点：

- 临时副本内 `score.json` 刷新为失败态
- `attempts.jsonl` 追加了新的失败记录
- 失败原因来自真实 `verification + acceptance`，不是手工伪造结果

### 3. Codex CLI

通过。

- `codex --version` = `codex-cli 0.118.0`
- `codex login status` 显示已登录
- 严格 harness 提示会返回固定三团队：`standards_team / execution_team / evaluation_team`
- 失败回路会明确回到 `standards_team`
- 在带 `.git` 的临时副本中，失败态 stop gate 会真实刷新 `attempts.jsonl`

需要保留的事实：

- Codex CLI 日志仍然会混入全局环境噪音，例如 state db migration warning、plugin manifest warning
- 这些告警没有阻断 harness 主链路，也没有阻断失败态证据写回

### 4. OpenClaw

通过。

- `openclaw skills list` 已能看到 `harness-run`
- `openclaw agent --agent main --message "请用 harness 架构循环工作..." --json` 会返回固定三团队和失败回路
- `openclaw agent --agent main --thinking high --json --message "使用 harness-run skill，并真实调用 sessions_spawn 三次"` 已真实触发 3 次 `sessions_spawn`

本次 `sessions_spawn` 强证据：

- `standards_team`：`runId = 531a84fd-4d16-4573-9c1f-75f4f08ae025`
- `execution_team`：`runId = f078e7ff-182a-44a4-aeb2-3f5335c0ba69`
- `evaluation_team`：`runId = a1323c95-56ed-40fb-aa4f-656133aa9a6a`
- 三次返回状态都是 `accepted`

这说明 OpenClaw 已经不是“只会解释团队”，而是真实调用了派发工具。

### 5. 本地门禁

通过。

- `npm test`：通过
- `npm run review`：通过
- `npm run doctor`：通过
- `npm run bundle`：通过
- `npm run score`：通过，`score = 100 / 90`

## 当前判断

现在可以下的结论是：

- tri-host 严格 harness 主链路已验证通过
- Claude / Codex 的真实失败态门禁证据已经补齐
- OpenClaw 的真实 `sessions_spawn` 证据已经补齐
- 当前仓库已经达到“可交付稳定基线”

现在不要下的结论是：

- OpenClaw 的 `thread` 绑定或持久子会话已经完成验证
- 任意非 git、非 trusted 路径都会自动表现一致

## 一句话判断

**该补的核心证据已经补齐了，剩下的是宿主边界扩展，不是主链路缺口。**
