# 发布流程

## 目标

这份文档只回答一件事：

**当前仓库到底怎么发布，发布时能说什么，不能说什么。**

这里不写想象中的平台能力，只写当前仓库已经具备、并且可以务实执行的流程。

## 当前定版策略

### 1. Claude 只采用 portable project assets 分发

当前 Claude 侧的定版策略是：**只走 portable project assets，不宣称有独立的 Claude 平台发布通道。**

原因很直接：

- 仓库里已经有 Claude 的 repo-local 适配资产，入口是 `.claude/`
- `plugins/claude-harness-loop/` 明确是把 repo-local 资产镜像成可搬运 bundle
- 当前还没有真实 Claude 宿主内 smoke test 的闭环证据
- 当前仓库也没有一个可依赖的“Claude 官方插件发布”路径可以写死

所以，Claude 侧发布时只能说：

- 我们提供可搬运的 project assets
- 我们提供可本地安装、可本地验证的 bundle
- 我们不提前宣称“Claude 宿主已完成完整发布验收”

### 2. Codex 采用 repo-local + 插件清单 + bundle 的分发方式

当前 Codex 侧的定版策略是：

- 仓库内使用 `.codex/` 保存 repo-local 配置
- 使用 `.agents/` 保存 Codex skills
- 使用 `plugins/codex-harness-loop/.codex-plugin/plugin.json` 保存插件清单
- 发布时输出 `dist/codex-harness-loop/` 作为 bundle 产物

所以，Codex 侧当前应该按“仓库内插件资产 + GitHub release 产物”来分发，而不是写成一个已经接入某个外部插件市场的方案。

## 发布前必须先过的本地检查

发布前先确认这些东西都过了：

1. `npm test`
2. `npm run review`
3. `npm run doctor`
4. `npm run bundle`
5. `npm run score`
6. `git status` 处于可发布状态，没有意外改动
7. `dist/claude-harness-loop/` 与 `dist/codex-harness-loop/` 已重新生成
8. `README.md`、`AGENTS.md`、`docs/architecture.md`、`docs/development-spec.md`、`docs/remaining-tasks.md` 的口径没有打架

如果本地检查没有过，就不要往下走 tag 和 release。

## 版本发布步骤

### 步骤 1：确认版本号

先定这次发布要用的版本号，建议按 `vMAJOR.MINOR.PATCH` 的形式来标记。

如果这次主要是文档、流程、分发说明修订，通常走 patch 就够了。

### 步骤 2：完成本地门禁

先把本地门禁跑完，确认仓库处于可发布状态。

建议按这个顺序执行：

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

### 步骤 3：打 tag

本地门禁通过后，再创建发布 tag。

示例：

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

如果仓库使用的是别的版本规范，也可以保持一致，但必须是全仓库统一口径。

### 步骤 4：准备 bundle

bundle 产物由 `npm run bundle` 生成，当前重点是这两个目录：

- `dist/claude-harness-loop/`
- `dist/codex-harness-loop/`

发布时把这两个目录作为 release artifact 的主体，不要把 `dist/` 当成手改源头。

### 步骤 5：创建 GitHub Release

在 GitHub Release 页面或对应自动化流程里：

- 选择刚刚推送的 tag
- 填写本次版本说明
- 上传 bundle artifact
- 上传必要的校验文件

如果当前发布只想做最小闭环，至少要上传：

- `dist/claude-harness-loop/`
- `dist/codex-harness-loop/`

如果仓库后续补了 checksum 或压缩包导出脚本，再把它们一起作为 release artifact 上传。

## 能宣称什么，不能提前宣称什么

### 可以宣称完成的内容

发布完成后，最多只能宣称这些事情：

- 仓库已完成本地门禁
- bundle 已生成
- tag 已创建
- GitHub Release 已发布
- repo-local 资产与 bundle 产物已经对外可见

### 不能提前宣称的内容

以下内容不能提前写成“已经完成”：

- Claude Code 宿主内 smoke test 已通过
- Codex 宿主内 smoke test 已通过
- 所有宿主环境都能自动安装成功
- 已接入某个官方插件市场
- 已完成真实宿主的最终验收闭环

如果没有做真实宿主 smoke test，就不要把 release 文案写成“宿主已验收通过”。

## 发布前检查清单

发布前最后过一遍这个清单：

- 版本号已经确定
- `npm test` 通过
- `npm run review` 通过
- `npm run doctor` 通过
- `npm run bundle` 通过
- `npm run score` 通过
- `dist/claude-harness-loop/` 存在且内容正常
- `dist/codex-harness-loop/` 存在且内容正常
- `README.md` 仍然简洁
- `AGENTS.md` 仍然只讲协作规则
- `docs/architecture.md` 仍然是架构真相源
- `docs/development-spec.md` 仍然是目录与命名真相源
- `docs/remaining-tasks.md` 没有把已完成事项继续挂成待办
- `git status` 干净，没有多余文件
- release 文案没有写超出当前能力的承诺

## 当前结论

当前仓库的 release 策略已经定版为：

- Claude：portable project assets
- Codex：repo-local 资产 + 插件清单 + bundle
- 发布动作：本地门禁 -> tag -> bundle -> GitHub Release
- 公开口径：只宣称仓库与产物已发布，不提前宣称真实宿主完全验收

