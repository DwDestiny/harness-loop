# Harness Loop

一个给 Claude Code 和 Codex 使用的可移植 harness 运行时，用来把“我觉得做完了”变成“已经通过可验证的完成门禁”。

这个仓库提供三层能力：

1. 一个确定性的 harness 内核，负责 contract、verification、review、score 四层真相模型
2. 一个 `harnessctl` CLI，负责初始化任务、推进尝试、执行 review、打分、安装和清理
3. 一套 Claude Code / Codex 的本地适配资产，以及可分发 bundle

## Current status

**当前结论：本地仓库已经可用，并且已经整理为可公开开源的仓库；但真实宿主内 smoke test 仍未闭环。**

已经完成的部分：

- deterministic harness kernel 已完成
- `harnessctl` CLI 已完成
- Claude repo-local 适配文件已完成
- Codex repo-local 适配文件已完成
- bundle 构建已完成
- fixture 回归矩阵已完成
- 文档、许可证、贡献说明、代理说明已补齐
- 本地自动化校验已通过

仍然刻意保留为后续工作的部分：

- 真实 Claude Code 宿主内 smoke test
- 真实 Codex 宿主内 smoke test
- Claude 正式 marketplace 分发形态
- MCP / semantic judge 等增强层

详细状态说明见：

- [完成情况](docs/completion-status.md)
- [剩余待办](docs/remaining-tasks.md)
- [本地验证记录](docs/local-verification.md)

## 这个项目解决什么问题

大模型写代码最常见的失败方式，不是不会写，而是过早宣布“完成”。

Harness Loop 用一套很克制的机制把这件事卡住：

- 先写 contract，再动手
- verification 必须是真命令，不是口头承诺
- review 输出必须结构化
- stop / score 是确定性的
- 失败就继续循环
- 只有硬失败清零且分数达标，才允许通过

## 当前范围

这是一个刻意保持轻量的 MVP：

- 仅依赖现代 Node 运行时
- 不引入第三方运行时依赖
- 支持 Claude Code / Codex 的 repo-local 安装
- 包含 Codex plugin skeleton
- 包含 Claude portable bundle

## 快速开始

```bash
npm run install
node packages/harnessctl/src/index.mjs init --task "实现一个新功能"
node packages/harnessctl/src/index.mjs review
node packages/harnessctl/src/index.mjs score
```

## CLI 命令

```bash
harnessctl init --task "..." --host auto --type feature
harnessctl draft-contract --task "..."
harnessctl review
harnessctl score
harnessctl doctor
harnessctl install --host auto --mode portable
harnessctl advance --strategy new-plan
harnessctl clean
```

## 仓库结构

```text
packages/
  harness-core/
  harnessctl/
fixtures/
  pass-minimal/
  test-fail/
  review-block/
  missing-doc/
  repeat-loop/
docs/
  completion-status.md
  remaining-tasks.md
  local-verification.md
  privacy-policy.md
  terms-of-service.md
.claude/
.codex/
.agents/
plugins/
  codex-harness-loop/
  claude-harness-loop/
```

## Harness 真相模型

运行时状态存放在 `.harness/state/current/`：

- `active.json`
- `contract.json`
- `verification.json`
- `review.json`
- `score.json`
- `summary.md`
- `attempts.jsonl`

其中：

- `contract.json` 定义本次任务要算什么叫完成
- `verification.json` 记录真实跑过的验证命令
- `review.json` 记录阻塞级问题
- `score.json` 负责最终放行或阻断

## 已包含的宿主适配层

### Claude Code

- `.claude/settings.json` hooks
- `.claude/agents/*.md`
- `.claude/skills/harness-run/SKILL.md`

### Codex

- `.codex/config.toml`
- `.codex/hooks.json`
- `.codex/agents/*.toml`
- `.agents/skills/harness-run/SKILL.md`
- `plugins/codex-harness-loop/.codex-plugin/plugin.json`

## 本地验证快照

当前仓库可通过以下命令验证：

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

最新一次本地分数门禁结果为 **100 / 90**。

## 仍然刻意保持简单的地方

- 还没有内置外部 MCP server
- 还没有把 semantic judge 当成门禁
- 还没有宣称“正式 marketplace 发布已完成”

## 开源信息

- 仓库地址：<https://github.com/DwDestiny/harness-loop>
- License：MIT
- 隐私政策：[docs/privacy-policy.md](docs/privacy-policy.md)
- 服务条款：[docs/terms-of-service.md](docs/terms-of-service.md)
