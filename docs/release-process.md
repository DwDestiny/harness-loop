# 发布流程

## 目标

这份文档只回答一件事：

**当前这个仓库，已经验证到什么程度，发布时到底能说什么。**

## 当前发布口径

现在可以真实写出去的口径是：

- 仓库已经完成本地门禁
- Claude / Codex / OpenClaw 三宿主严格 harness 主链路已验证
- Claude / Codex 的失败态 stop gate 已有真实证据
- OpenClaw 的 `sessions_spawn` 三次派发已真实返回 `accepted`
- 当前提供的是 repo-local 资产、workspace skill 和 bundle 产物

## 当前分发策略

### Claude

采用 portable project assets。

仓库内对应资产：

- `.claude/`
- `CLAUDE.md`
- `dist/claude-harness-loop/`

### Codex

采用 repo-local 配置 + skills + 插件清单 + bundle。

仓库内对应资产：

- `.codex/`
- `.agents/`
- `plugins/codex-harness-loop/.codex-plugin/plugin.json`
- `dist/codex-harness-loop/`

### OpenClaw

采用 workspace skill + bundle。

仓库内对应资产：

- `skills/harness-run/`
- `dist/openclaw-harness-loop/`

如果需要直接接到本机 OpenClaw 工作区，用：

```bash
node packages/harnessctl/src/index.mjs install --host openclaw --mode workspace
```

## 发布前必须先过的检查

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
git status
```

发布前还要人工确认：

- `README.md`、`docs/completion-status.md`、`docs/local-verification.md` 口径一致
- `dist/claude-harness-loop/`、`dist/codex-harness-loop/`、`dist/openclaw-harness-loop/` 已重新生成
- 没有把历史过程文档继续放在主入口冒充真相源

## 标准发布步骤

### 1. 先跑本地门禁

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

### 2. 确认版本号

按 `vMAJOR.MINOR.PATCH` 统一打版本。

### 3. 打 tag

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

### 4. 创建 GitHub Release

上传这些产物：

- `dist/claude-harness-loop/`
- `dist/codex-harness-loop/`
- `dist/openclaw-harness-loop/`

## 可以宣称什么

可以宣称：

- 这是一个已经验证过 tri-host 主链路的 harness runtime
- `harness-run` 的触发语义、三团队循环和失败回路已经落地
- 当前仓库已经可以安装、运行、打包、发布

## 不要提前宣称什么

不要提前写成“已经完成”：

- OpenClaw 的 `thread` 绑定或持久子会话
- 任意非 git、非 trusted 路径下的完全一致行为
- 任何官方插件市场接入

## 一句话判断

**现在这个仓库已经具备正式发布条件，剩下需要克制的是口径，不是能力。**
