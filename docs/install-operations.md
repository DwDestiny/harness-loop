# 安装、卸载、重装与安装后验证

这份文档只回答一件事：**怎么把 Harness Loop 装进去、卸下来、重新装回去，以及装完以后该检查什么。**

它不替代架构说明，也不替代开发规格说明。  
如果你想先理解目录和规则，先看：

- [架构说明](architecture.md)
- [开发规格说明](development-spec.md)

## 1. 前置环境要求

先确认下面几项都满足，再开始安装：

- `Node.js >= 18`
- 当前目录是仓库根目录
- 终端能正常执行 `npm`
- 你有权限写入当前仓库内的这些目录：
  - `.harness/`
  - `.claude/`
  - `.codex/`
  - `.agents/`
  - `plugins/`

推荐先做一次最小检查：

```bash
node -v
npm -v
pwd
```

如果你不在仓库根目录，先切回来：

```bash
cd /Users/dw/Desktop/private_programe/harness
```

## 2. 首次安装

仓库内当前推荐的安装方式是：

```bash
npm run install
```

等价于：

```bash
node packages/harnessctl/src/index.mjs install --host auto --mode portable
```

这一步会在仓库里写入 repo-local 资产，主要包括：

- `.harness/bin/harnessctl`
- `.claude/settings.json`
- `.claude/agents/*.md`
- `.claude/skills/harness-run/SKILL.md`
- `.codex/config.toml`
- `.codex/hooks.json`
- `.codex/agents/*.toml`
- `.agents/skills/harness-run/SKILL.md`
- `plugins/claude-harness-loop/README.md`
- `plugins/codex-harness-loop/.codex-plugin/plugin.json`
- `plugins/codex-harness-loop/skills/harness-run/SKILL.md`

如果只想安装某一侧，可以直接指定宿主：

```bash
node packages/harnessctl/src/index.mjs install --host claude --mode portable
node packages/harnessctl/src/index.mjs install --host codex --mode portable
```

## 3. 卸载 Claude 相关资产

Claude 侧的卸载原则很简单：**删掉 repo-local 的 Claude 资产，不动其他宿主资产。**

需要清理的文件和目录是：

- `.claude/settings.json`
- `.claude/agents/`
- `.claude/skills/`
- `plugins/claude-harness-loop/`

如果你只想手工卸载 Claude 侧，建议执行：

```bash
rm -f .claude/settings.json
rm -rf .claude/agents
rm -rf .claude/skills
rm -rf plugins/claude-harness-loop
```

卸载后，`Codex` 相关目录可以继续保留，不需要跟着删。

## 4. 卸载 Codex 相关资产

Codex 侧的卸载原则同样是：**只删 Codex 和 `.agents` 相关资产，不碰 Claude 侧。**

需要清理的文件和目录是：

- `.codex/config.toml`
- `.codex/hooks.json`
- `.codex/agents/`
- `.agents/skills/harness-run/`
- `plugins/codex-harness-loop/`

如果你只想手工卸载 Codex 侧，建议执行：

```bash
rm -f .codex/config.toml
rm -f .codex/hooks.json
rm -rf .codex/agents
rm -rf .agents/skills/harness-run
rm -rf plugins/codex-harness-loop
```

如果你想把两侧都清掉，再额外删除 `.harness/bin/harnessctl`：

```bash
rm -f .harness/bin/harnessctl
```

## 5. 重装步骤

重装不要直接“再跑一遍安装”了事，先清理，再安装，最后核对文件。

推荐顺序：

1. 先卸载要重装的宿主资产
2. 再运行安装命令
3. 最后检查生成文件是否落位

例如要全量重装：

```bash
rm -f .harness/bin/harnessctl
rm -f .claude/settings.json
rm -rf .claude/agents
rm -rf .claude/skills
rm -f .codex/config.toml
rm -f .codex/hooks.json
rm -rf .codex/agents
rm -rf .agents/skills/harness-run
rm -rf plugins/claude-harness-loop
rm -rf plugins/codex-harness-loop
npm run install
```

如果你只重装 Claude：

```bash
rm -f .claude/settings.json
rm -rf .claude/agents
rm -rf .claude/skills
rm -rf plugins/claude-harness-loop
node packages/harnessctl/src/index.mjs install --host claude --mode portable
```

如果你只重装 Codex：

```bash
rm -f .codex/config.toml
rm -f .codex/hooks.json
rm -rf .codex/agents
rm -rf .agents/skills/harness-run
rm -rf plugins/codex-harness-loop
node packages/harnessctl/src/index.mjs install --host codex --mode portable
```

## 6. 安装后怎么验证 hooks / agents / skills 已落位

这里验证的是**文件是否真的写到了应该写的位置**，不是“宿主里已经完成 smoke test”。

### 6.1 验证通用安装产物

先看 shim 是否存在：

```bash
test -f .harness/bin/harnessctl && echo "ok"
```

再看安装命令生成了哪些文件：

```bash
node packages/harnessctl/src/index.mjs install --host auto --mode portable
```

输出里应当能看到 `.claude/`、`.codex/`、`.agents/`、`plugins/` 相关路径。

### 6.2 验证 Claude 侧

检查这些文件是否存在：

- `.claude/settings.json`
- `.claude/agents/harness-planner.md`
- `.claude/agents/harness-builder.md`
- `.claude/agents/harness-reviewer.md`
- `.claude/agents/harness-researcher.md`
- `.claude/skills/harness-run/SKILL.md`
- `plugins/claude-harness-loop/README.md`

检查 hook 配置里是否包含预期触发项：

```bash
sed -n '1,220p' .claude/settings.json
```

重点看两类内容：

- `UserPromptSubmit`
- `Stop`

### 6.3 验证 Codex 侧

检查这些文件是否存在：

- `.codex/config.toml`
- `.codex/hooks.json`
- `.codex/agents/harness_planner.toml`
- `.codex/agents/harness_builder.toml`
- `.codex/agents/harness_reviewer.toml`
- `.codex/agents/harness_researcher.toml`
- `.agents/skills/harness-run/SKILL.md`
- `plugins/codex-harness-loop/.codex-plugin/plugin.json`
- `plugins/codex-harness-loop/skills/harness-run/SKILL.md`

检查 hook 配置是否写入：

```bash
sed -n '1,220p' .codex/config.toml
sed -n '1,220p' .codex/hooks.json
```

重点看两类内容：

- `codex_hooks = true`
- `SessionStart` 和 `Stop`

### 6.4 验证 skill 内容是否落位

skill 是否写到位，最直接的办法是看文件是否存在、内容是否是预期模板：

```bash
sed -n '1,220p' .claude/skills/harness-run/SKILL.md
sed -n '1,220p' .agents/skills/harness-run/SKILL.md
sed -n '1,220p' plugins/codex-harness-loop/skills/harness-run/SKILL.md
```

如果你要确认的是“宿主发现能力”，那是下一层验证，应该去看 [剩余待办](remaining-tasks.md) 里列出的宿主 smoke test 任务。  
这份文档这里只负责告诉你文件有没有正确落位。

## 7. 常见错误与排查

### 7.1 执行安装后看不到文件

常见原因：

- 你不在仓库根目录
- `npm run install` 跑在了别的目录
- 当前分支不是你想要的分支

排查方式：

```bash
pwd
ls
```

确认当前目录里能看到 `package.json`、`packages/`、`.claude/`、`.codex/`。

### 7.2 `node` 版本太低

常见表现：

- 安装命令直接失败
- CLI 脚本无法执行

排查方式：

```bash
node -v
```

如果版本低于 `18`，先升级 Node，再重新安装。

### 7.3 只装了一边，另一边文件缺失

常见原因：

- 安装时显式传了 `--host claude`
- 安装时显式传了 `--host codex`

排查方式：

```bash
node packages/harnessctl/src/index.mjs install --host auto --mode portable
```

如果你想要两边都落位，`--host auto` 才是最稳的方式。

### 7.4 hook 文件有语法问题

常见表现：

- JSON / TOML 打不开
- 后续命令读配置时失败

排查方式：

```bash
sed -n '1,220p' .claude/settings.json
sed -n '1,220p' .codex/hooks.json
sed -n '1,220p' .codex/config.toml
```

优先检查是否有多余逗号、引号不配对、路径写错、内容被手工改坏。

### 7.5 卸载后又被旧文件干扰

常见原因：

- 旧的 `.claude/agents/` 目录没删干净
- 旧的 `.agents/skills/harness-run/` 还在
- `plugins/` 里残留旧 bundle

排查方式：

```bash
find .claude .codex .agents plugins -maxdepth 3 -type f | sort
```

如果还有旧文件，就按第 3、4 节把它们删干净，再重装。

### 7.6 `harnessctl` shim 不可执行

常见表现：

- `.harness/bin/harnessctl` 存在，但不能直接执行

排查方式：

```bash
ls -l .harness/bin/harnessctl
```

如果没有执行权限，重新跑一次安装命令：

```bash
npm run install
```

### 7.7 重新安装后内容还是旧的

常见原因：

- 你只跑了安装，没有先删旧资产
- 旧 bundle 覆盖了新内容的判断

排查方式：

1. 先删除旧目录
2. 再运行安装命令
3. 再用 `sed -n` 检查文件内容

如果还是不对，优先回到 `packages/harness-core/src/templates.mjs` 和 `packages/harness-core/src/installer.mjs` 检查源头模板，而不是只盯生成结果。

### 7.8 换了仓库路径后 hook 没反应

常见原因：

- 你复制了仓库，但新路径还没有被宿主当成 trusted project
- 你在 `/tmp` 之类临时目录做副本验证
- repo-local 资产虽然存在，但宿主没有把这个新路径当成“已信任、已接管”的项目

常见表现：

- 主仓库路径里 `review.json`、`score.json`、`attempts.jsonl` 会刷新
- 一换到新副本路径，这些文件就不再刷新
- 你会误以为是 hook 模板坏了，其实更可能是宿主路径上下文不同

排查方式：

```bash
pwd
sed -n '1,220p' .codex/config.toml
sed -n '1,220p' .codex/hooks.json
sed -n '1,220p' .claude/settings.json
```

然后做两件事：

1. 先在目标路径里重新打开宿主会话
2. 确认宿主已经把这个新路径当成 trusted project，再重跑 smoke test

不要在 copied path 没被宿主接管时，就直接回头改模板源文件。

## 8. 建议的最小操作顺序

如果你只想按最少步骤把事情做完，直接走这个顺序：

```bash
cd /Users/dw/Desktop/private_programe/harness
npm run install
test -f .harness/bin/harnessctl && echo "ok"
sed -n '1,220p' .claude/settings.json
sed -n '1,220p' .codex/config.toml
sed -n '1,220p' .codex/hooks.json
```

如果这几步都没有报错，下一步再去看 [剩余待办](remaining-tasks.md) 里列出的宿主 smoke test 任务。
