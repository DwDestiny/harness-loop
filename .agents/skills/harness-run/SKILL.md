---
name: harness-run
description: Use this when the user explicitly asks for harness, harness loop, 按 harness 架构循环工作, or wants contract/review/verification/score gated delivery.
---
Use this skill when:
- 用户明确提到 harness、harness loop、按 harness 架构循环工作、按 harness 流程、用 harness 做
- 用户要求先定标准再实现，或者明确提到 contract、review、verification、score
- 用户要求循环迭代，直到结果通过评估、门禁或验收再交付

Do not use this skill for:
- 简单问答、解释、翻译、闲聊
- 一次性小修改，而且用户明确不需要 harness

Hard rules:
- Always use the exact team ids standards_team, execution_team, evaluation_team when explaining or running the loop.
- Never route a failed evaluation directly back to execution_team. Failed evaluations must return to standards_team first so the contract and strategy can be tightened before the next execution pass.

Workflow:
1. If no active contract exists, initialize one for the current task before implementation starts.
2. Standards team responsibility: use the contract as the source of truth and tighten acceptance plus verification first.
3. After standards work is done, record a handoff to execution_team.
4. Execution team responsibility: implement the smallest reversible diff that can satisfy the contract.
5. After execution work is done, record a handoff to evaluation_team.
6. Evaluation team responsibility: refresh review and score after each meaningful implementation pass, and block completion on failures.
7. If evaluation passes, record a pass handoff for evaluation_team.
8. If score fails and attempt budget remains, record a retry handoff to standards_team, advance with a new strategy, and continue.
9. Declare completion only after score passes, or when the attempt budget is exhausted with a clear blocker report.
