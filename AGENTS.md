# AGENTS.md

## 项目定位

Harness Loop 是一个给 Claude Code 和 Codex 使用的可移植 harness 运行时。

它的目标不是“帮模型多做一点事”，而是把交付过程变成一个有门禁的闭环：

- 先定义 contract
- 再执行实现
- 再做 review
- 最后用 score 决定能不能宣布完成

一句话说，这个项目要解决的是：**模型过早说“做完了”**。

## 当前仓库包含什么

### 1. 共享内核

`packages/harness-core`

负责：

- contract 生成
- review 结果整理
- verification 执行与读取
- score 计算与 stop gate
- repo-local 安装资产生成

### 2. CLI

`packages/harnessctl`

对外提供：

- `init`
- `advance`
- `draft-contract`
- `review`
- `score`
- `doctor`
- `install`
- `clean`

### 3. 宿主适配层

仓库同时维护：

- Claude Code 的 repo-local 资产
- Codex 的 repo-local 资产
- `dist/` 下的可分发 bundle

## 目录速览

```text
packages/
  harness-core/      # 内核与评分逻辑
  harnessctl/        # CLI 入口
fixtures/            # 回归样例仓库
docs/                # 状态、验证、发布辅助文档
plugins/             # 可分发插件资产
.claude/             # Claude repo-local 适配
.codex/              # Codex repo-local 适配
.agents/             # Codex skills
.harness/state/      # 运行时状态与历史记录
```

## 真相来源

当 `.harness/state/current/active.json` 存在时，下面这些规则强制生效：

- `contract.json` 是当前任务的唯一完成定义
- 没有最新 `score.json` 通过，不能宣称完成
- 如果 stop hook 阻断，先读 `attempts.jsonl` 再决定怎么改
- 优先做最小且可逆的改动
- 连续失败时必须调整策略，不能机械重复
- 对用户的过程更新保持短、准、可执行

## 标准工作流

1. `harnessctl init` 或 `draft-contract`
2. 先确认 acceptance 和 verification 是否可测
3. 再做最小实现
4. 跑 `review`
5. 跑 `score`
6. 通过则结束，不通过则 `advance` 后继续下一轮

## 完成标准

只有同时满足下面几件事，任务才算完成：

- contract 已生成
- 必需 verification 命令全部通过
- review 中没有 critical / high 阻塞
- acceptance 条目全部满足
- score 达到 threshold

少任何一项，都不能叫“完成”。

## 开发与改动边界

### 对内核的改动

改 `packages/harness-core` 时，优先关注：

- 分数口径是否稳定
- hard failure 是否会误放行
- 状态文件是否仍然自洽
- 安装器输出是否仍然能生成 Claude / Codex 资产

### 对 CLI 的改动

改 `packages/harnessctl` 时，优先关注：

- 命令语义是否清晰
- 输出是否可被脚本消费
- exit code 是否仍然符合门禁预期

### 对文档和模板的改动

改 `README.md`、`AGENTS.md`、`CLAUDE.md`、`templates.mjs`、plugin manifest 时，优先关注：

- 文档口径是否和代码现状一致
- 发布信息是否为真实地址
- 不要留下 `example.com` 这种占位内容

## 推荐验证命令

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

如果是准备开源或发布，至少再补这两类检查：

- README / AGENTS / plugin manifest 的对外口径检查
- 真实宿主内 smoke test

## 评审原则

### 高优先级问题

- 会导致错误放行的评分逻辑
- acceptance / verification / review 之间口径不一致
- hook 或安装产物失效
- 文档宣称已经完成，但实际上没验证

### 低价值改动

下面这些一般不要优先做：

- 只换措辞、不提升可执行性的文档润色
- 不影响门禁正确性的样式性重构
- 在没有明确问题前就扩 MCP / semantic judge

## 团队分工模型

- Lead：控制循环、保证 contract 与 score 的完整性
- Planner：把任务变成可测 contract
- Researcher：只做降风险，不做空泛分析
- Builder：做最小 diff，并跑验证
- Reviewer：只提阻塞问题，不给审美建议

## 当前发布认知

这份仓库已经适合公开开源，但还不适合宣称“所有宿主集成已完全验证”。

现在能明确说的只有两件事：

- 本地仓库能力是完整且可验证的
- 真实 Claude / Codex 宿主内 smoke test 仍然要补

别把“本地通过”说成“全链路都完成”，这是这个项目最需要防止的自欺。
