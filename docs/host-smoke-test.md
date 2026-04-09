# 宿主 Smoke Test 手册

这份手册只做一件事：**教第一次接手的人，如何在真实 Claude Code 和 Codex 宿主里，验证本仓库的 hooks、agents、skill 和 stop gate 是否真的生效。**

它不写“已经通过”的结论，只写执行步骤、预期现象、失败判断和证据要求。

## 1. 测试前准备

先确认你在仓库根目录，并且工作区是干净的，避免把别人的改动误判成宿主问题。

建议先做这些本地检查：

```bash
npm run install
npm run doctor
```

然后确认这些文件确实存在：

- `.claude/settings.json`
- `.claude/agents/harness-builder.md`
- `.claude/agents/harness-planner.md`
- `.claude/agents/harness-researcher.md`
- `.claude/agents/harness-reviewer.md`
- `.claude/skills/harness-run/SKILL.md`
- `.codex/config.toml`
- `.codex/hooks.json`
- `.codex/agents/harness_builder.toml`
- `.codex/agents/harness_planner.toml`
- `.codex/agents/harness_researcher.toml`
- `.codex/agents/harness_reviewer.toml`
- `.agents/skills/harness-run/SKILL.md`
- `plugins/codex-harness-loop/skills/harness-run/SKILL.md`

测试前还要准备一个记录位置，建议把每一步的输出、截图、时间戳、宿主版本、仓库 commit 都记下来，后面排障会省很多时间。

## 2. Claude 侧逐项验证

### 2.1 hooks

检查 `.claude/settings.json` 是否被 Claude Code 读取。

操作方式：

- 在 Claude Code 中打开这个仓库
- 发一个很简单的新任务，例如“请帮我检查这个仓库的 smoke test 手册是否完整”
- 结束会话，触发 `Stop`

预期现象：

- `UserPromptSubmit` 会先触发 `review --quiet`
- `Stop` 会触发 `score --host claude --stop-hook`
- 如果终端或宿主日志可见，应该能看到对应命令被执行

### 2.2 agents

检查 `.claude/agents/*.md` 是否能被宿主发现。

操作方式：

- 在 Claude Code 中尝试调用或选择 `harness-planner`
- 再尝试调用或选择 `harness-researcher`
- 再尝试调用或选择 `harness-reviewer`
- 再尝试调用或选择 `harness-builder`

预期现象：

- 宿主能识别这些 agent 名称
- `harness-planner` 应该对应“先写 contract / 先定任务”
- `harness-researcher` 应该用于风险检查
- `harness-reviewer` 应该用于 review
- `harness-builder` 应该用于最小实现

### 2.3 skill

检查 `harness-run` skill 是否可触发。

操作方式：

- 明确要求 Claude 使用 `harness-run`
- 让它按 harness 流程执行一个简单任务
- 观察它是否会先刷新 review，再在结束前刷新 score

预期现象：

- 宿主能找到 `harness-run`
- 执行过程会围绕 contract / review / verification / score 展开
- 结束前不会只凭口头结论直接宣称完成

### 2.4 stop gate

检查 stop gate 在失败场景下是否真的拦截。

推荐做法：

- 使用 `fixtures/test-fail` 或 `fixtures/review-block` 作为故意失败样例
- 在临时副本里运行，不要污染主仓库
- 让任务进入一个明显不满足 contract、review 或 verification 的状态
- 再触发 `Stop`

预期现象：

- `score` 不应给出通过结论
- stop gate 应显示 block、失败原因或未满足门禁的证据
- 不能出现“明明失败却被放行”的情况

## 3. Codex 侧逐项验证

### 3.1 codex_hooks

检查 `.codex/config.toml` 里的 `codex_hooks = true` 是否生效。

操作方式：

- 在 Codex 中打开这个仓库
- 确认当前会话处于仓库根目录
- 启动一个新会话或恢复一个已有会话

预期现象：

- 宿主读取到 `codex_hooks = true`
- 后续的 `SessionStart` 和 `Stop` hooks 有机会执行
- 如果这一步都没有效果，后面不用继续猜 agent 或 skill

### 3.2 hooks

检查 `.codex/hooks.json` 是否被真实宿主读取。

操作方式：

- 新开一个 Codex 会话，观察 `SessionStart`
- 再结束会话，观察 `Stop`

预期现象：

- `SessionStart` 的 `startup|resume` 会先触发 `review --quiet`
- `Stop` 会触发 `score --host codex --stop-hook`
- 命令路径应能从仓库根目录正确解析到 `.harness/bin/harnessctl`

### 3.3 agents

检查 `.codex/agents/*.toml` 是否能被宿主发现。

操作方式：

- 在 Codex 中尝试调用或选择 `harness_planner`
- 再尝试调用或选择 `harness_researcher`
- 再尝试调用或选择 `harness_reviewer`
- 再尝试调用或选择 `harness_builder`

预期现象：

- 宿主能识别这些 agent 名称
- 这些 agent 的职责应与仓库定义一致
- 如果宿主把它们当作普通文本而不是可用角色，说明发现链路有问题

### 3.4 skill

检查 `.agents/skills/harness-run/SKILL.md` 和 `plugins/codex-harness-loop/skills/harness-run/SKILL.md` 是否可触发。

操作方式：

- 在 Codex 中明确要求使用 `harness-run`
- 让它执行一个最小 harness 流程

预期现象：

- 宿主能识别 `harness-run`
- 执行过程中会回到 harness contract 作为真相源
- 完成前应刷新 review 和 score

### 3.5 stop gate

检查 Codex 的结束门禁是否会拦截失败结果。

推荐做法：

- 仍然优先用 `fixtures/test-fail` 或 `fixtures/review-block`
- 在临时副本里制造一个明确失败的状态
- 触发 `Stop`

预期现象：

- `score` 不应放行
- block 原因应能对应到 contract、review、verification 或评分门槛
- 不能只显示“任务结束”而没有门禁结论

## 4. 失败时怎么判断

### 4.1 配置问题

通常表现为：

- 文件缺失
- JSON 或 TOML 语法错误
- agent 文件名写错
- skill 路径写错
- hook 命令本身写错

判断方式：

- 本地直接打开对应文件就能看到明显错误
- `npm run doctor` 或本地校验已经失败
- 宿主即使能启动，也无法进入对应 hook 或 agent

### 4.2 路径问题

通常表现为：

- 文件明明存在，但宿主报找不到
- 命令里用了相对路径，却不是从仓库根目录执行
- `.harness/bin/harnessctl` 没有被正确安装
- 某个宿主只认一种入口，而当前配置写成了另一种

判断方式：

- 本地用同样的命令在仓库根目录执行是可以的
- 一换到宿主里就报路径不存在
- 报错内容更像 “not found / no such file / cannot resolve path”

### 4.3 宿主限制

通常表现为：

- 配置文件正确，路径也对，但宿主版本不支持某类 hook
- 宿主只支持部分 agent/skill 发现方式
- 宿主 UI 没有暴露可用 agent 入口
- 某些行为需要宿主升级后才支持

判断方式：

- 本地命令都能跑通
- 配置文件也没有语法问题
- 但真实宿主就是没有相应触发点
- 这时要记录宿主版本、产品形态、会话模式，而不是反复改仓库

## 5. 通过证据要记录什么

每一步都至少记录下面这些信息：

- 测试日期和时间
- 宿主名称与版本
- 仓库 commit
- 测试是在 Claude 还是 Codex
- 使用的是哪一个会话
- 执行了哪一步
- 看到的具体现象
- 输出日志或报错原文
- 对应的截图或录屏
- 是否命中 stop gate
- 失败归因是配置、路径还是宿主限制

如果要把结果写回仓库，建议同步更新 `docs/local-verification.md`，但这份手册本身只负责告诉你怎么测，不负责替你下结论。

