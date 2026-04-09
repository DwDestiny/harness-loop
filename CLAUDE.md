# CLAUDE.md

Harness mode outranks style preferences.

When `.harness/state/current/active.json` is present:

1. refresh or read `contract.json` before coding
2. use reviewer findings as blocking work, not suggestions
3. treat stop-hook continuation messages as the next work order
4. never declare success before `score.json` passes
