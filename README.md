# Harness Loop

一个给 Claude Code、Codex、OpenClaw 使用的可移植 harness 运行时，用来把“我觉得做完了”变成“已经通过可验证的完成门禁”。

## 它解决什么问题

大模型写代码最常见的失败方式，不是不会写，而是过早宣布“完成”。

Harness Loop 用一条很克制的确定性链路把这件事卡住：

- 先定义 contract
- 再做实现
- 再做 review
- 再跑 verification
- 最后由 score 决定能不能放行

## 仓库里有什么

这个仓库包含三层核心能力：

1. `packages/harness-core`：共享内核，负责 contract / review / verification / score / installer
2. `packages/harnessctl`：CLI 入口，负责 `init / review / score / doctor / install` 等命令
3. Claude Code / Codex / OpenClaw 宿主适配资产，以及可分发 bundle

## Current status

当前结论很简单：

- 可用级别基线已经完成
- GitHub 公开仓库已经建立
- 真实 Claude / Codex 宿主内 smoke test 还没闭环

详细状态见：

- [完成情况](docs/completion-status.md)
- [剩余待办](docs/remaining-tasks.md)
- [本地验证记录](docs/local-verification.md)

## 快速开始

```bash
npm run install
node packages/harnessctl/src/index.mjs init --task "实现一个新功能"
node packages/harnessctl/src/index.mjs review
node packages/harnessctl/src/index.mjs score
```

如果你要把它接进 OpenClaw，有两种路：

- 仓库内生成 skill 资产：`node packages/harnessctl/src/index.mjs install --host openclaw --mode portable`
- 直接注册到当前 OpenClaw 配置：`node packages/harnessctl/src/index.mjs install --host openclaw --mode workspace`

## 什么时候会触发 harness-run

当用户的任务明显带着下面这类意图时，宿主就应该更容易自动命中 `harness-run`：

- 明确提到 `harness`、`harness loop`、`按 harness 架构循环工作`
- 明确要求先定 `contract` / 验收标准，再实现，再 `review`、`verification`、`score`
- 明确要求循环迭代，直到结果通过评估、门禁或验收后再交付

反过来，如果只是简单问答、翻译、解释，或者一次性很小的修改，而且用户明确不要 harness，就不该硬套这条流程。

在 OpenClaw 里，命中 `harness-run` 后的目标不是单线程完成任务，而是自动进入三团队循环：

- `standards_team`：先定 contract、验收标准、验证命令
- `execution_team`：只按 contract 做最小可逆改动
- `evaluation_team`：负责 `review + score`，不通过就继续下一轮

## 常用命令

```bash
harnessctl init --task "..." --host auto --type feature
harnessctl draft-contract --task "..."
harnessctl handoff --team standards_team --decision continue --next-team execution_team --summary "contract ready"
harnessctl review
harnessctl score
harnessctl doctor
harnessctl install --host auto --mode portable
harnessctl advance --strategy new-plan
harnessctl clean
```

## 目录速览

```text
packages/    核心运行时代码
.claude/     Claude repo-local 配置
.codex/      Codex repo-local 配置
.agents/     Codex skills
plugins/     对外分发插件资产
skills/      OpenClaw 可加载的本地 skill
.harness/    harness 运行时状态与 shim
tests/       测试代码
fixtures/    回归样例仓库
scripts/     构建与辅助脚本
docs/        架构、规范、状态与发布文档
```

## 文档导航

- [可用级别交付计划](docs/delivery-plan.md)
- [架构说明](docs/architecture.md)
- [开发规格说明](docs/development-spec.md)
- [宿主 Smoke Test 手册](docs/host-smoke-test.md)
- [安装 / 卸载 / 重装指南](docs/install-operations.md)
- [发布流程](docs/release-process.md)
- [AGENTS 协作规则](AGENTS.md)
- [Contributing](CONTRIBUTING.md)
- [隐私政策](docs/privacy-policy.md)
- [服务条款](docs/terms-of-service.md)

如果你想知道“文件该放哪、该怎么命名、哪些文档各自负责什么”，直接看 [开发规格说明](docs/development-spec.md)。

## 本地验证

```bash
npm test
npm run review
npm run doctor
npm run bundle
npm run score
```

最新一次本地分数门禁结果为 **100 / 90**。

## 开源信息

- 仓库地址：<https://github.com/DwDestiny/harness-loop>
- License：MIT
