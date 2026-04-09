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

Workflow:
1. If no active contract exists, initialize one for the current task before implementation starts.
2. Use the harness contract as the source of truth.
3. Refresh review and score after each meaningful implementation pass.
4. If score fails and attempt budget remains, advance with a new strategy and continue.
5. Declare completion only after score passes, or when the attempt budget is exhausted with a clear blocker report.
