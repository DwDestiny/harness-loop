# AGENTS.md

## 进入仓库先看哪里

按这个顺序读：

1. `README.md`
2. `docs/architecture.md`
3. `docs/development-spec.md`
4. `docs/remaining-tasks.md`
5. `docs/local-verification.md`

规则很简单：

- `README.md` 负责入口说明
- `docs/architecture.md` 负责架构真相
- `docs/development-spec.md` 负责目录、命名、放置规则
- `docs/remaining-tasks.md` 只负责还没做的事
- `docs/local-verification.md` 只负责真实验证证据

不要再把这些内容复制成三四份口径不同的说明书。

## Harness 生效时，谁是当前真相源

当 `.harness/state/current/active.json` 存在时：

- `contract.json` 定义“什么才算完成”
- `review.json` 说明当前阻塞项
- `score.json` 决定能不能放行
- `handoffs.jsonl` 记录三团队交接
- `attempts.jsonl` 记录每轮失败与策略变化

没有最新 `score.json` 通过，不要宣称完成。

如果 stop gate 拦住了，先看 `attempts.jsonl`，不要靠猜。

## 标准执行顺序

1. `harnessctl init` 或 `draft-contract`
2. 收紧 acceptance 与 verification
3. 做最小实现
4. 跑 `review`
5. 跑 `score`
6. 没通过就 `handoff + advance`，重新回到 `standards_team`

## 修改边界

### 改运行规则

优先看：

- `packages/harness-core/src/`

重点关注：

- score 口径
- hard failure
- review / verification / acceptance 一致性
- 三团队交接是否被正确纳入门禁

### 改 CLI

优先看：

- `packages/harnessctl/src/`

重点关注：

- 命令语义
- 输出格式
- exit code

### 改宿主模板或插件资产

优先看：

- `packages/harness-core/src/templates.mjs`
- `packages/harness-core/src/installer.mjs`

不要先改这些生成产物：

- `.claude/`
- `.codex/`
- `.agents/`
- `skills/`
- `plugins/`
- `dist/`

先改模板源头，再刷新生成产物。

### 改文档

按职责修改：

- `README.md`：入口说明，面向智能体用户
- `docs/architecture.md`：架构真相源
- `docs/development-spec.md`：规范真相源
- `docs/local-verification.md`：验证证据
- `docs/completion-status.md`：当前可宣称口径
- `docs/remaining-tasks.md`：剩余事项

## 完成标准

只有同时满足这些条件，任务才算完成：

- contract 已生成
- 必需 verification 已通过
- review 中没有 critical / high 阻塞
- acceptance 条目全部满足
- score 达到 threshold

在 `team_loop` 模式里，还必须满足：

- `evaluation_team` 已对当前轮次明确放行

## 推荐验证命令

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

## 评审优先级

优先看这些问题：

- 会导致错误放行的评分逻辑
- 宿主 hook / skill / 安装产物失效
- 模板源头与生成结果漂移
- 文档口径和真实验证结果冲突
- 新文件落错位置，破坏目录清晰度

## 当前底线

这个仓库现在已经可以按“可交付稳定基线”对外说明。

但不要把下面这些宿主边界说成已经完成：

- OpenClaw 的 `thread` 绑定或持久子会话
- 任意非 git、非 trusted 路径下的完全一致行为
- 任何官方插件市场接入
