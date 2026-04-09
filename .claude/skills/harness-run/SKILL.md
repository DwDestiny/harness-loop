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
2. Ensure the contract is measurable before code changes.
3. Use planner, researcher, builder, reviewer around the contract.
4. Refresh review and score after each meaningful implementation pass.
5. If score fails and attempt budget remains, advance with a new strategy and continue the loop.
6. End only when score passes or attempt budget is exhausted.
