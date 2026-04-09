# Harness Loop

给 Claude Code、Codex、OpenClaw 使用的可移植 harness 运行时。

它的目标很简单：当用户明确表达“请按 harness 架构循环工作”“先定标准再做，没过评估别交付”这类意图时，宿主应该自动命中 `harness-run`，进入带门禁的三团队循环，而不是让单个智能体在“差不多”时过早宣称完成。

## 这个仓库给谁用

这个仓库的主要读者不是普通人，而是另一个智能体或集成者。

你来这里，通常只需要搞清楚 4 件事：

1. 什么时候该启用 harness
2. 启用后应该怎么循环
3. 安装资产会落到哪里
4. 任务成功和失败分别该看哪个真相源文件

## 它会在什么时候接管

当用户明显带着下面这些意图时，应该启用 `harness-run`：

- 明确提到 `harness`、`harness loop`、`按 harness 架构循环工作`、`按 harness 流程做`
- 明确要求先定 `contract` / 验收标准，再实现，再 `review`、`verification`、`score`
- 明确要求循环迭代，直到通过评估或门禁再交付
- 明确要求你主动组织团队，而不是单线程自己做完就算

不要在这些场景硬触发：

- 简单问答、解释、翻译、闲聊
- 一次性很小的改动，而且用户明确不要 harness 流程

## 它会怎么工作

命中 `harness-run` 后，目标不是“做一次任务”，而是进入固定循环：

`standards_team -> execution_team -> evaluation_team -> (pass | retry)`

- `standards_team`：收紧 `contract`、验收标准、验证命令
- `execution_team`：只做最小、可逆、可验证的改动
- `evaluation_team`：执行 `review + score`，决定 `pass` 或 `retry`

关键规则只有一条：

**只要 `evaluation_team` 判定不通过，就必须先回到 `standards_team`，不能直接把失败结果打回 `execution_team`。**

## Current status

当前版本已经达到**可交付可复用的稳定基线**。

已经真实验证通过的内容：

- `Claude Code CLI`：严格 harness 主链路通过，失败态 stop gate 已写回失败证据
- `Codex CLI`：严格 harness 主链路通过，失败态 stop gate 已在带 `.git` 的临时副本中写回失败证据
- `OpenClaw`：skill 发现通过，真实 agent turn 通过，真实 `sessions_spawn` 三次派发已返回 `accepted`
- 本地门禁：`test / review / doctor / bundle / score` 全部通过

现在可以对外宣称：

- 这是一个已经能安装、能运行、能触发、能门禁放行的 tri-host harness runtime
- `harness-run` 的触发语义、三团队循环和失败回路都已经落地

现在不要提前宣称：

- OpenClaw 的 `thread` 绑定或持久子会话已经完成验证
- 所有非 git、非 trusted 的复制路径都会自动表现一致
- 已经接入任何官方插件市场

详细状态分别看：

- [完成情况](docs/completion-status.md)
- [验证记录](docs/local-verification.md)
- [剩余事项](docs/remaining-tasks.md)

## 最短安装路径

先在当前仓库生成和刷新全部宿主资产：

```bash
npm install
npm run install
```

如果你要把当前仓库的 OpenClaw skill 直接注册到本机工作区，再执行：

```bash
node packages/harnessctl/src/index.mjs install --host openclaw --mode workspace
```

三宿主的落位和最短验证方式如下：

| 宿主 | 关键落位 | 最短验证 |
| --- | --- | --- |
| Claude Code | `.claude/`、`CLAUDE.md` | `claude -p --output-format json --setting-sources project "请用 harness 架构循环工作..."` |
| Codex | `.codex/`、`.agents/` | `codex exec --json "请用 harness 架构循环工作..."` |
| OpenClaw | `skills/harness-run/`，必要时写入 `~/.openclaw/openclaw.json` 的 `skills.load.extraDirs` | `openclaw skills list` 和 `openclaw agent --agent main --message "请用 harness 架构循环工作..." --json` |

更细的卸载、重装、排查路径见 [安装 / 卸载 / 重装指南](docs/install-operations.md)。

## 最短运行路径

安装完成后，一个最小 harness 回合应该长这样：

```bash
./.harness/bin/harnessctl init --task "实现一个新功能"
./.harness/bin/harnessctl review
./.harness/bin/harnessctl score
```

如果评分没过，不要直接说“完成了”，而是先记录评估交接，再进入下一轮：

```bash
./.harness/bin/harnessctl handoff --team evaluation_team --decision retry --next-team standards_team --summary "next loop"
./.harness/bin/harnessctl advance --strategy "tighten-contract"
```

在真实宿主里，`harness-run` 应该替你组织这条循环；手工命令主要用于调试、补证据和排障。

## 当前任务的真相源

任务进行中，优先看这些文件：

- [contract.json](/Users/dw/Desktop/private_programe/harness/.harness/state/current/contract.json)
- [review.json](/Users/dw/Desktop/private_programe/harness/.harness/state/current/review.json)
- [score.json](/Users/dw/Desktop/private_programe/harness/.harness/state/current/score.json)
- [handoffs.jsonl](/Users/dw/Desktop/private_programe/harness/.harness/state/current/handoffs.jsonl)
- [attempts.jsonl](/Users/dw/Desktop/private_programe/harness/.harness/state/current/attempts.jsonl)

判断规则很简单：

- `contract.json` 定义“什么才算完成”
- `review.json` 说明当前阻塞项
- `score.json` 决定这轮能不能放行
- `handoffs.jsonl` 记录三团队交接
- `attempts.jsonl` 记录每轮失败和策略变化

## 改哪里才算改对

这个仓库分成“源头文件”和“生成产物”两层。

优先改这些源头：

- [templates.mjs](/Users/dw/Desktop/private_programe/harness/packages/harness-core/src/templates.mjs)
- [installer.mjs](/Users/dw/Desktop/private_programe/harness/packages/harness-core/src/installer.mjs)
- [index.mjs](/Users/dw/Desktop/private_programe/harness/packages/harnessctl/src/index.mjs)

不要把这些生成产物当真相源直接手改：

- `.claude/`
- `.codex/`
- `.agents/`
- `skills/`
- `plugins/`
- `dist/`

正确做法是：

1. 先改源头
2. 再跑 `npm run install`
3. 需要发包时再跑 `npm run bundle`

## 仓库结构

```text
packages/    核心运行时代码
.claude/     Claude repo-local 资产
.codex/      Codex repo-local 配置
.agents/     Codex skills
skills/      OpenClaw workspace skill
plugins/     对外分发插件资产
.harness/    运行时状态与 shim
tests/       测试
fixtures/    回归样例仓库
scripts/     构建与辅助脚本
docs/        架构、规范、验证、发布文档
```

目录和命名的硬规则见 [开发规格说明](docs/development-spec.md)。

## 文档地图

- [架构说明](docs/architecture.md)
- [开发规格说明](docs/development-spec.md)
- [安装 / 卸载 / 重装指南](docs/install-operations.md)
- [宿主 Smoke Test 手册](docs/host-smoke-test.md)
- [验证记录](docs/local-verification.md)
- [完成情况](docs/completion-status.md)
- [剩余事项](docs/remaining-tasks.md)
- [发布流程](docs/release-process.md)
- [AGENTS 协作规则](AGENTS.md)
- [Contributing](CONTRIBUTING.md)
- [历史交付计划归档](docs/archive/delivery-plan-v0-baseline.md)

## 本地门禁

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

当前最新门禁结果：`score = 100 / 90`

## 开源信息

- 仓库地址：[DwDestiny/harness-loop](https://github.com/DwDestiny/harness-loop)
- License：MIT
