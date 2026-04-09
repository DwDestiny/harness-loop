# 剩余事项

## 当前结论

**当前没有阻止交付的 P0。**

仓库级别该毕业的部分已经毕业：

- tri-host 严格 harness 主链路已验
- Claude / Codex 失败态门禁证据已补
- OpenClaw `sessions_spawn` 强证据已补
- README 与文档职责已收口

接下来剩下的是发布增强和宿主边界扩展，不再是“这个项目能不能用”的问题。

## P1：建议尽快做，但不阻塞交付

### 1. 发布演示材料

目标：

- 做一份更适合对外展示的截图或录屏
- 把“触发 harness -> 三团队循环 -> score 放行”的过程做成一眼能懂的材料

为什么还值得做：

- 现在仓库已经能用，但对外说服力还主要靠文档和日志
- 演示材料会明显降低别人第一次接入时的心理成本

### 2. GitHub Release 正式化

目标：

- 按当前真实验证结果打 tag
- 上传 `dist/` bundle
- 补一版正式 release note

为什么还值得做：

- 现在仓库已经具备发布条件
- 但还没有把“源码仓库”推进成“正式版本产物”

## P2：宿主边界扩展

### 1. OpenClaw thread / persistent 子会话

目标：

- 验证 `thread` 绑定或持久子会话模式
- 明确哪些能力属于网关配置，哪些属于 skill 自身

当前判断：

- 这不是当前仓库的核心缺陷
- 更像宿主通道和网关能力边界

### 2. 复制路径 / trusted project 体验优化

目标：

- 给非 git、非 trusted 路径补更清楚的提示
- 让使用者更快意识到这是宿主策略，不是 harness 模板失效

当前判断：

- 已经不再是 P0
- 更适合作为安装排查体验优化

## P3：后续能力增强

### 1. 更强的 contract 模板

- `feature`
- `bugfix`
- `refactor`
- `docs-only`
- `test-only`

### 2. semantic judge

- 只作为 deterministic gate 的补充
- 不替代 `score` 的硬门禁

### 3. 更深的外部集成

- MCP
- issue tracker
- release automation

## 当前策略

如果现在继续投入，最值的是：

1. 补一份强展示型演示材料
2. 做一次正式 GitHub Release
3. 再决定要不要继续追 OpenClaw thread 模式

## 一句话判断

**剩下的是“做得更漂亮、更完整”，不是“补到能用”。**
