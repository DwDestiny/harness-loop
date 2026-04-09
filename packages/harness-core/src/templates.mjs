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
description: Run a harness-governed implementation loop for the current task.
allowed-tools: Read, Grep, Glob, LS, Bash, Write, Edit, MultiEdit, Task
disable-model-invocation: true
---
1. Run ./.harness/bin/harnessctl init --host claude --task "$ARGUMENTS" if no active contract exists.
2. Ensure contract exists before code changes.
3. Use planner, researcher, builder, reviewer.
4. End only when score passes or attempt budget is exhausted.`;
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
description: Run a harness-governed implementation loop.
---
Use the harness contract as the source of truth. Refresh review and score before declaring completion.`;
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
