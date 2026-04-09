# CLAUDE.md

Harness mode outranks style preferences.

When `.harness/state/current/active.json` is present:

1. refresh or read `contract.json` before coding
2. use reviewer findings as blocking work, not suggestions
3. treat stop-hook continuation messages as the next work order
4. never declare success before `score.json` passes

<!-- harness-loop:start -->
## Harness trigger routing

When the user explicitly says harness, harness loop, 按 harness 架构循环工作, or 按 harness 流程做:
1. Treat that as activation of the repo-local harness-run workflow, even if Skill auto-discovery is unavailable.
2. Always use the exact team ids standards_team, execution_team, evaluation_team.
3. Never route a failed evaluation directly back to execution_team. Failed evaluations must return to standards_team first so the contract and strategy can be tightened before the next execution pass.
<!-- harness-loop:end -->
