# AGENTS.md

## 先看哪里

进入这个仓库后，先按下面顺序读：

1. `README.md`
2. `docs/architecture.md`
3. `docs/development-spec.md`
4. `docs/delivery-plan.md`
5. `AGENTS.md`
6. `docs/remaining-tasks.md`

其中：

- `docs/architecture.md` 负责讲系统结构
- `docs/development-spec.md` 负责讲目录、命名、放置规则
- `docs/delivery-plan.md` 负责讲当前阶段团队与任务包
- `AGENTS.md` 只负责协作与执行规则

不要把 README、AGENTS、状态文档重新写成三份重复规范。

## Harness 生效规则

当 `.harness/state/current/active.json` 存在时：

- `contract.json` 是当前任务的唯一完成定义
- 没有最新 `score.json` 通过，不能宣称完成
- 如果 stop hook 阻断，先读 `attempts.jsonl`
- 优先做最小且可逆的改动
- 连续失败时必须调整策略，不能机械重复

## 标准执行顺序

1. `harnessctl init` 或 `draft-contract`
2. 确认 acceptance 与 verification 可测
3. 做最小实现
4. 跑 `review`
5. 跑 `score`
6. 未通过则 `advance` 后继续下一轮

## 修改边界

### 改运行规则

优先查看：

- `packages/harness-core/src/`

重点关注：

- 评分口径
- hard failure
- review / verification / acceptance 一致性

### 改 CLI

优先查看：

- `packages/harnessctl/src/`

重点关注：

- 命令语义
- 输出格式
- exit code

### 改宿主模板或插件资产

优先查看：

- `packages/harness-core/src/templates.mjs`
- `packages/harness-core/src/installer.mjs`
- `.claude/`
- `.codex/`
- `.agents/`
- `plugins/`

先改模板源头，再刷新生成产物，不要只改表面结果。

### 改文档

按职责修改：

- `README.md`：对外说明
- `docs/architecture.md`：架构真相源
- `docs/development-spec.md`：规范真相源
- `docs/delivery-plan.md`：阶段任务包真相源
- `docs/*status*.md`：状态与待办

## 完成标准

只有同时满足下面几件事，任务才算完成：

- contract 已生成
- 必需 verification 命令全部通过
- review 中没有 critical / high 阻塞
- acceptance 条目全部满足
- score 达到 threshold

## 推荐验证命令

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

## 评审优先级

先看这些问题：

- 会导致错误放行的评分逻辑
- hook 或安装产物失效
- 模板源头与生成结果漂移
- 文档说法与代码现状冲突
- 新文件没有归类，破坏目录清晰度

## 当前底线

这份仓库已经适合公开开源，但还不适合宣称“所有宿主集成已完全验证”。

本地通过，不等于真实宿主已经验完。别在这件事上自欺。
