# Contributing

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

## Pull Request 要写清楚什么

- 这次改动为什么存在
- 它满足了哪些 acceptance 条目
- 实际跑了哪些 verification 命令
- 是否改动了 harness 规则、评分口径或安装产物
