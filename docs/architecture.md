# 架构说明

## 目标

Harness Loop 要解决的不是“模型会不会写代码”，而是“模型会不会太早说自己写完了”。

这套仓库用一条确定性的闭环把这件事卡住：

`contract -> implementation -> review -> verification -> score`

只有这条链路跑通，任务才算完成。

## 总体分层

仓库分成 5 层：

### 1. 共享内核

目录：`packages/harness-core/src/`

职责：

- 生成 contract
- 执行或读取 verification
- 生成 review 结果
- 计算 score 与 hard failure
- 生成 Claude / Codex 安装模板

这是整个项目的真相层，也是唯一应该承载评分口径的地方。

### 2. CLI 入口

目录：`packages/harnessctl/src/`

职责：

- 对外暴露 `init / advance / draft-contract / review / score / doctor / install / clean`
- 把仓库操作收束成可执行命令
- 给 hook、脚本、使用者提供统一入口

它是“操作台”，不是规则中心。规则仍然属于 `harness-core`。

### 3. 宿主适配层

目录：

- `.claude/`
- `.codex/`
- `.agents/`
- `plugins/`

职责：

- 把同一套 harness 规则映射到不同宿主
- 提供 repo-local 运行资产
- 提供可分发插件资产

这里不应该另起一套业务逻辑，只负责“接线”和“映射”。

### 4. 运行时状态层

目录：`.harness/state/`

职责：

- `current/`：当前任务状态
- `history/`：历史尝试记录

当前任务状态的核心文件：

- `active.json`
- `contract.json`
- `verification.json`
- `review.json`
- `score.json`
- `summary.md`
- `attempts.jsonl`

这层不是文档，也不是测试；它是运行时证据。

### 5. 工程支撑层

目录：

- `tests/`
- `fixtures/`
- `scripts/`
- `docs/`
- `.github/workflows/`

职责：

- `tests/`：单元与契约测试
- `fixtures/`：回归样例仓库
- `scripts/`：构建和辅助脚本
- `docs/`：架构、规范、状态、发布说明
- `.github/workflows/`：CI 与发布流水线

## 核心执行链路

### 1. 任务初始化

入口命令：

- `harnessctl init`
- `harnessctl draft-contract`

结果：

- 生成 contract
- 写入 active 状态
- 确定 threshold、attempt budget、acceptance、verification

### 2. 实现阶段

执行者根据 contract 做最小实现。

这个阶段不允许把“看起来差不多”当成完成，只能围绕 contract 落地。

### 3. review 阶段

入口命令：

- `harnessctl review`

结果：

- 生成结构化 review
- 标出 blocking 问题

### 4. verification + score 阶段

入口命令：

- `harnessctl score`

结果：

- 跑 verification 命令
- 汇总 acceptance、review、governance
- 计算 score
- 判断 pass / block

### 5. 失败后推进下一轮

入口命令：

- `harnessctl advance`

作用：

- 增加 attempt
- 允许记录新的 strategy fingerprint

## Hook 架构

### Claude Code

配置文件：`.claude/settings.json`

当前策略：

- `UserPromptSubmit` 时先跑 `review --quiet`
- `Stop` 时跑 `score --host claude --stop-hook`

含义很直接：

- 用户刚发任务时，先刷新 review 结果
- 模型准备收工时，再由 score 决定能不能放行

### Codex

配置文件：

- `.codex/config.toml`
- `.codex/hooks.json`

当前策略：

- `SessionStart` 的 `startup|resume` 时先跑 `review --quiet`
- `Stop` 时跑 `score --host codex --stop-hook`

含义：

- 会话启动或恢复时先同步状态
- 会话结束前由 score 做最终门禁

## 安装与产物流向

### 源头

真正的模板源头在：

- `packages/harness-core/src/templates.mjs`
- `packages/harness-core/src/installer.mjs`

### repo-local 资产

执行：

```bash
npm run install
```

会写入：

- `.harness/bin/harnessctl`
- `.claude/`
- `.codex/`
- `.agents/`
- `plugins/` 中必要插件资产

### bundle 产物

执行：

```bash
npm run bundle
```

会产出：

- `dist/claude-harness-loop/`
- `dist/codex-harness-loop/`

`dist/` 是构建结果，不是长期手改的真相源。

## 当前架构边界

这个仓库当前明确不负责：

- 远程托管服务
- 默认内置 MCP server
- semantic judge 作为硬门禁
- 真实宿主 smoke test 的验收报告自动化

换句话说，它现在是一套“本地可验证的 harness 框架”，不是全套发布平台。

## 读文档顺序

如果你第一次接手这个仓库，建议按下面顺序读：

1. `README.md`
2. `docs/architecture.md`
3. `docs/development-spec.md`
4. `AGENTS.md`
5. `docs/remaining-tasks.md`
