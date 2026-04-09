# 剩余待办任务清单

## 当前阶段结论

当前这轮 **可用级别基线已经完成**。

已经补齐的内容：

- 团队化交付计划
- 宿主 smoke test 手册
- 安装 / 卸载 / 重装指南
- release 流程与 Claude 分发策略
- 关键坏路径自动化测试

总控真相源见：

- `docs/delivery-plan.md`

## 本轮已完成任务包

### PKG-02：宿主 smoke test 手册

状态：文档已完成，真实执行未完成

### PKG-03：安装 / 卸载 / 重装说明

状态：已完成

### PKG-04：Claude 分发策略与 release 流程

状态：已完成

### PKG-05：异常输入测试

状态：已完成

## 当前剩余阻塞项

### PKG-06：真实宿主 smoke test 执行与证据回写

目标：

- 在真实 Claude Code / Codex 宿主中按 `docs/host-smoke-test.md` 执行手册
- 把结果回写到 `docs/local-verification.md`
- 明确哪一侧通过、哪一侧受宿主限制

当前阻塞：

- 仓库内手册已齐，但还没有真实宿主执行证据

### PKG-07：基于真实宿主结果补最终发布说明

目标：

- 根据 PKG-06 的真实结果，补最终可宣称口径
- 如果条件满足，再做 tag / release artifact 发布

当前阻塞：

- 没有真实宿主结果前，不该把“宿主已验收”写进 release 口径

## P1：可发布增强项

### 演示材料

- 增加失败案例截图或录屏
- 让 README 不只是工程说明，也更像可展示产品

## P2：后续能力增强

### MCP 集成

- 把研究、验证、diff、issue tracker 接起来

### semantic judge

- 只能作为补充，不应替代 deterministic gate

### 更强的 contract 模板

- feature
- bugfix
- refactor
- docs-only
- test-only

## 当前执行策略

先执行 **PKG-06**，拿到真实宿主证据，再决定是否进入 PKG-07 与 P1 / P2。
