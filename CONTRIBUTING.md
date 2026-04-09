# Contributing

## 先看规范

开始改动前，先看这两份文档：

- `docs/architecture.md`
- `docs/development-spec.md`

## 贡献规则

- 先写 contract，再动实现
- 行为变更优先补测试
- 小而可逆的改动，优先于“聪明但难回退”的大改
- 没有 `score.json` 通过，就不算完成

## 本地工作流

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

## 放置规则

- 运行时代码放 `packages/`
- 宿主配置放 `.claude/`、`.codex/`、`.agents/`
- 分发资产放 `plugins/`
- 测试放 `tests/`
- 回归样例放 `fixtures/`
- 长期文档放 `docs/`

## Pull Request 要写清楚什么

- 这次改动为什么存在
- 它满足了哪些 acceptance 条目
- 实际跑了哪些 verification 命令
- 是否改动了 harness 规则、评分口径或安装产物
