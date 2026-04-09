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
6. End only when score passes or attempt budget is exhausted.`;
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

Workflow:
1. If no active contract exists, initialize one for the current task before implementation starts.
2. Use the harness contract as the source of truth.
3. Refresh review and score after each meaningful implementation pass.
4. If score fails and attempt budget remains, advance with a new strategy and continue.
5. Declare completion only after score passes, or when the attempt budget is exhausted with a clear blocker report.`;
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
