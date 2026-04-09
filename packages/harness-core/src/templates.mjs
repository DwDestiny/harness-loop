export function claudeAgents() {
  return {
    'harness-planner.md': `---
name: harness-planner
description: Turn a task into a measurable harness contract.
tools: Read, Write, Edit
---
Write or refresh .harness/state/current/contract.json before implementation starts.`,
    'harness-researcher.md': `---
name: harness-researcher
description: Reduce execution risk before implementation.
tools: Read, Grep, Glob, LS
---
Inspect code, tests, and docs. Write concise risk notes only.`,
    'harness-builder.md': `---
name: harness-builder
description: Implement the smallest diff that satisfies the contract.
tools: Read, Write, Edit, MultiEdit, Bash
---
Make the smallest reversible change and run required verification commands.`,
    'harness-reviewer.md': `---
name: harness-reviewer
description: Review against the contract and report blocking issues only.
tools: Read, Grep, Glob, LS
---
Write .harness/state/current/review.json. No taste-based feedback.`,
  };
}

export function claudeSkill() {
  return `---
name: harness-run
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

Hard rules:
- Always use the exact team ids standards_team, execution_team, evaluation_team when explaining or running the loop.
- Never route a failed evaluation directly back to execution_team. Failed evaluations must return to standards_team first so the contract and strategy can be tightened before the next execution pass.

Workflow:
1. Run ./.harness/bin/harnessctl init --host claude --task "$ARGUMENTS" if no active contract exists.
2. Standards team responsibility: tighten the contract, acceptance, and verification before code changes. Use planner for this.
3. After standards work is done, record the handoff with ./.harness/bin/harnessctl handoff --team standards_team --decision continue --next-team execution_team --summary "contract ready".
4. Execution team responsibility: implement the smallest reversible diff. Use builder for this.
5. After execution work is done, record the handoff with ./.harness/bin/harnessctl handoff --team execution_team --decision continue --next-team evaluation_team --summary "diff ready".
6. Evaluation team responsibility: use researcher plus reviewer to find blockers, then refresh review and score after each meaningful implementation pass.
7. If evaluation passes, record ./.harness/bin/harnessctl handoff --team evaluation_team --decision pass --summary "score passed".
8. If evaluation fails and attempt budget remains, record ./.harness/bin/harnessctl handoff --team evaluation_team --decision retry --next-team standards_team --summary "next loop", then advance with a new strategy and continue.
9. End only when evaluation says the gate passed, or when the attempt budget is exhausted.`;
}

export function claudeSettings() {
  return {
    hooks: {
      UserPromptSubmit: [
        {
          hooks: [
            {
              type: 'command',
              command: '$CLAUDE_PROJECT_DIR/.harness/bin/harnessctl review --quiet',
            },
          ],
        },
      ],
      Stop: [
        {
          hooks: [
            {
              type: 'command',
              command: '$CLAUDE_PROJECT_DIR/.harness/bin/harnessctl score --host claude --stop-hook',
            },
          ],
        },
      ],
    },
  };
}

export function codexAgents() {
  return {
    'harness_planner.toml': `name = "harness_planner"
description = "Turn the task into a measurable harness contract."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = "Write or refresh .harness/state/current/contract.json before implementation starts."
`,
    'harness_researcher.toml': `name = "harness_researcher"
description = "Reduce execution risk before implementation."
model = "gpt-5.4"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"
developer_instructions = "Inspect code, tests, and docs. Output concise risk notes only."
`,
    'harness_builder.toml': `name = "harness_builder"
description = "Implement the smallest diff that satisfies the contract."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "workspace-write"
developer_instructions = "Make the smallest reversible change and run required verification commands."
`,
    'harness_reviewer.toml': `name = "harness_reviewer"
description = "Review against the contract and report blocking issues only."
model = "gpt-5.4"
model_reasoning_effort = "high"
sandbox_mode = "read-only"
developer_instructions = "Write .harness/state/current/review.json. No taste-based feedback."
`,
  };
}

export function codexSkill() {
  return `---
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
9. Declare completion only after score passes, or when the attempt budget is exhausted with a clear blocker report.`;
}

export function openclawSkill() {
  return `---
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
3. 如果用户明确要求“不要解释”或“直接开始”，就直接进入派发；不要在派发前长篇解释。
4. 在 sessions_spawn 里必须使用固定 label，分别是 standards_team、execution_team、evaluation_team
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
  "label": "standards_team",
  "runtime": "subagent",
  "mode": "run",
  "runTimeoutSeconds": 300
})

对 execution_team 和 evaluation_team 使用同样格式，保持各自职责边界，不要混岗。label 在这里就是编排时使用的固定团队标识，不要随意改名。`;
}

export function openclawSkillManifest() {
  return {
    name: 'harness-run',
    version: '0.3.0',
    description: 'OpenClaw harness team loop: trigger a standards team, execution team, and evaluation team that keep iterating until score passes.',
    author: 'DwDestiny',
    homepage: 'https://github.com/DwDestiny/harness-loop',
    keywords: [
      'harness',
      'openclaw',
      'sessions_spawn',
      'team_loop',
      'contract',
      'review',
      'score',
      '多智能体',
      '评估团队',
    ],
  };
}

export function codexHooks() {
  return {
    hooks: {
      SessionStart: [
        {
          matcher: 'startup|resume',
          hooks: [
            {
              type: 'command',
              command: '.harness/bin/harnessctl review --quiet',
            },
          ],
        },
      ],
      Stop: [
        {
          hooks: [
            {
              type: 'command',
              command: '.harness/bin/harnessctl score --host codex --stop-hook',
            },
          ],
        },
      ],
    },
  };
}

export function codexPluginManifest() {
  return {
    name: 'harness-loop',
    version: '0.2.0',
    description: 'Deterministic harness loop for measured coding workflows.',
    license: 'MIT',
    skills: './skills/',
    interface: {
      displayName: 'Harness Loop',
      shortDescription: 'Measured coding loops with stop gates',
      longDescription: 'Add a deterministic score gate before an agent can claim a coding task is done.',
      developerName: 'DwDestiny',
      category: 'Productivity',
      capabilities: ['Read', 'Write'],
      websiteURL: 'https://github.com/DwDestiny/harness-loop',
      privacyPolicyURL: 'https://github.com/DwDestiny/harness-loop/blob/main/docs/privacy-policy.md',
      termsOfServiceURL: 'https://github.com/DwDestiny/harness-loop/blob/main/docs/terms-of-service.md',
      defaultPrompt: ['Use Harness Loop to keep coding work behind a score gate.'],
      brandColor: '#111827'
    }
  };
}
