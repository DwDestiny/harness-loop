# 剩余待办任务清单

## 当前阶段结论

当前这轮 **可用级别主链路已经完成**。

已经补齐的内容：

- 团队化交付计划
- 宿主 smoke test 手册
- 安装 / 卸载 / 重装指南
- release 流程与 Claude 分发策略
- 关键坏路径自动化测试
- 主仓库 `Claude Code CLI` / `Codex CLI` 正向 smoke test 证据

总控真相源见：

- `docs/delivery-plan.md`

## 本轮已完成任务包

### PKG-02：宿主 smoke test 手册

状态：文档已完成，主仓库执行结果已由 PKG-06 回写

### PKG-03：安装 / 卸载 / 重装说明

状态：已完成

### PKG-04：Claude 分发策略与 release 流程

状态：已完成

### PKG-05：异常输入测试

状态：已完成

### PKG-06：真实宿主主链路 smoke test 与证据回写

状态：已完成

已确认：

- 主仓库 `Claude Code CLI` 正向链路可跑通
- 主仓库 `Codex CLI` 正向链路可跑通
- 安装、卸载、重装流程已实测
- 结果已回写到 `docs/local-verification.md`

## 当前剩余阻塞项

### PKG-06-EXT：失败态 stop gate 与路径信任差异补测

目标：

- 在真实宿主里故意制造一个失败态，确认 stop gate 会写出失败 attempt 或 block 原因
- 明确“主仓库路径正常、复制路径失效”到底是宿主 trusted project 规则，还是别的配置差异
- 给出一条可复现的失败态验收路径，而不是只拿正向链路下结论

当前阻塞：

- 复制到新路径的副本没有自动刷新 `.harness/state/current/*`
- 这说明 copied path 的宿主行为和主仓库路径并不等价，不能拿副本结果冒充主结论

### PKG-07：基于真实宿主结果补最终发布说明

目标：

- 根据“主仓库正向已验、失败态待补”的真实结果，补最终可宣称口径
- 如果失败态门禁也补完，再决定是否做 tag / release artifact 发布

当前阻塞：

- 现在不能写成“所有宿主集成已完全验证”
- 也不该把 copied path 的异常直接甩锅成仓库配置错误

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

先补 **PKG-06-EXT**，把失败态门禁和路径信任差异收口，再决定是否进入 PKG-07 与 P1 / P2。
