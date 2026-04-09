# 剩余待办任务清单

## P0：必须补完，不然不要宣称“全量完成”

### 1. Claude 宿主内 smoke test

确认下面几件事：

- `.claude/settings.json` hooks 会被真实宿主读取
- `.claude/agents/*.md` 会被发现
- `harness-run` skill 可触发
- Stop gate 在真实任务结束时会拦截失败结果

### 2. Codex 宿主内 smoke test

确认下面几件事：

- `.codex/config.toml` 的 `codex_hooks = true` 生效
- `.codex/hooks.json` 被真实宿主读取
- `.codex/agents/*.toml` 会被发现
- `.agents/skills/harness-run/SKILL.md` 可触发
- Stop gate 会在失败时 block

### 3. 明确 Claude 分发策略

二选一先定死：

- 只做 portable project assets
- 或补齐正式插件分发清单与发布流程

## P1：发布前强烈建议补上

### 4. 增加安装/卸载文档

现在能装，但卸载和重装的路径说明还不够清楚。

### 5. 增加失败案例截图或录屏

README 目前更像工程说明，不像对外演示文档。

### 6. 增加异常输入测试

建议补：

- malformed contract
- 缺失 verification
- 无效 hooks 配置
- 空 repo / 无 package.json 场景

### 7. 增加版本发布说明

明确：

- 如何打 tag
- 如何产出 zip bundle
- 如何验证 dist 内容
- 如何发布 release artifact

## P2：增强项，不是当前阻塞项

### 8. MCP 集成

把研究、验证、diff、issue tracker 接起来。

### 9. semantic judge

只能作为补充，不应替代 deterministic gate。

### 10. 更强的 contract 模板

按任务类型提供：

- feature
- bugfix
- refactor
- docs-only
- test-only

## 当前建议

别再扩功能了。

现在不用再补发布占位信息了，这部分已经完成。

接下来先把 **P0 的真实宿主验证补齐**，再决定要不要继续往发布增强层推进。
