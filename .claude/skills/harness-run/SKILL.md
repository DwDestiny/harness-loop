---
description: Run a harness-governed implementation loop for the current task.
allowed-tools: Read, Grep, Glob, LS, Bash, Write, Edit, MultiEdit, Task
disable-model-invocation: true
---
1. Run ./.harness/bin/harnessctl init --host claude --task "$ARGUMENTS" if no active contract exists.
2. Ensure contract exists before code changes.
3. Use planner, researcher, builder, reviewer.
4. End only when score passes or attempt budget is exhausted.
