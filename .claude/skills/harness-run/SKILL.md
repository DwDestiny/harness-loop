---
description: Use this when the user explicitly asks for harness, harness loop, 按 harness 架构循环工作, or wants contract/review/verification/score gated delivery.
allowed-tools: Read, Grep, Glob, LS, Bash, Write, Edit, MultiEdit, Task
disable-model-invocation: true
---
Use this skill when:
- 用户明确说“用 harness”“按 harness 架构循环工作”“按 harness 流程做”“跑 harness loop”
- 用户要求先定 contract / 验收标准，再实现，再 review，再 verification，再 score
- 用户要求循环迭代，直到结果通过评估、门禁或验收后再交付

Do not use this skill for:
- 简单问答、解释、翻译、闲聊
- 一次性很小的改动，而且用户明确不要 harness 流程

Workflow:
1. Run ./.harness/bin/harnessctl init --host claude --task "$ARGUMENTS" if no active contract exists.
2. Standards team responsibility: tighten the contract, acceptance, and verification before code changes. Use planner for this.
3. After standards work is done, record the handoff with ./.harness/bin/harnessctl handoff --team standards_team --decision continue --next-team execution_team --summary "contract ready".
4. Execution team responsibility: implement the smallest reversible diff. Use builder for this.
5. After execution work is done, record the handoff with ./.harness/bin/harnessctl handoff --team execution_team --decision continue --next-team evaluation_team --summary "diff ready".
6. Evaluation team responsibility: use researcher plus reviewer to find blockers, then refresh review and score after each meaningful implementation pass.
7. If evaluation passes, record ./.harness/bin/harnessctl handoff --team evaluation_team --decision pass --summary "score passed".
8. If evaluation fails and attempt budget remains, record ./.harness/bin/harnessctl handoff --team evaluation_team --decision retry --next-team standards_team --summary "next loop", then advance with a new strategy and continue.
9. End only when evaluation says the gate passed, or when the attempt budget is exhausted.
