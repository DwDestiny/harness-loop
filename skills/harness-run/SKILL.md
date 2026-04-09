---
name: harness-run
version: 0.3.0
description: 当用户明确提到 harness、按 harness 架构循环工作、要求先定标准再执行并且必须通过评估后再交付时使用。For OpenClaw, this skill should orchestrate a three-team harness loop with sessions_spawn.
keywords: [harness, harness loop, openclaw, sessions_spawn, contract, review, score, team loop, 多智能体, 评估团队]
---

# OpenClaw Harness Team Loop

在 OpenClaw 中，这个 skill 的目标不是“做一次任务”，而是“拉起一个带门禁的循环”。

## 何时触发

- 用户明确说“用 harness”“按 harness 架构循环工作”“按 harness 流程做”
- 用户明确要求先定标准、再执行、再评估，不通过就继续循环
- 用户明确要求交付物必须通过 contract / review / verification / score
- 用户明确要求你主动组织团队，而不是单线程自己做完就算

## 不要触发

- 简单问答、翻译、解释、闲聊
- 一次性小改动，而且用户明确不要 harness 流程

## 三支团队

- standards_team：负责编写或收紧 contract、验收标准、验证命令
- execution_team：负责实现最小可逆改动，并按 contract 执行
- evaluation_team：负责 review、score、拦截不达标结果，并决定是否继续循环

## 执行规则

1. 如果 .harness/bin/harnessctl 不存在，先在仓库根目录安装 harness 资产。
2. 如果没有活跃 contract，先初始化：./.harness/bin/harnessctl init --host openclaw --task "<用户任务>"
3. 先回复用户一句话，说明你将进入 harness 团队循环；然后再输出 sessions_spawn(...)
4. 必须使用固定 sessionKey，分别是 standards_team、execution_team、evaluation_team
5. standards team 先工作，明确 contract、acceptance、verification
6. standards team 完成后，执行：./.harness/bin/harnessctl handoff --team standards_team --decision continue --next-team execution_team --summary "contract ready"
7. execution team 只按 contract 做最小改动；完成后执行：./.harness/bin/harnessctl handoff --team execution_team --decision continue --next-team evaluation_team --summary "diff ready"
8. evaluation team 每轮都要执行 review 和 score，只报告阻塞项与是否通过
9. 如果 evaluation team 判定通过，执行：./.harness/bin/harnessctl handoff --team evaluation_team --decision pass --summary "score passed"
10. 只要 evaluation team 认定未通过，而且 attempt budget 还在，就先执行：./.harness/bin/harnessctl handoff --team evaluation_team --decision retry --next-team standards_team --summary "next loop"，再执行：./.harness/bin/harnessctl advance --strategy "<新策略>"，然后继续下一轮
11. 只有 score 通过，或者 attempt budget 用尽并且给出明确 blocker，才能停止

## OpenClaw 派发格式

sessions_spawn({
  "task": "作为 standards_team，先收紧 .harness/state/current/contract.json，补齐 acceptance 和 verification，只输出可执行标准。",
  "sessionKey": "standards_team",
  "runTimeoutSeconds": 300
})

对 execution_team 和 evaluation_team 使用同样格式，保持各自职责边界，不要混岗。
