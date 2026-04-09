import path from 'node:path';
import { fileExists, readText } from './io.mjs';

export function doctor(repoRoot) {
  const checks = [];
  const required = [
    'package.json',
    'README.md',
    'LICENSE',
    'AGENTS.md',
    'CLAUDE.md',
    'packages/harness-core/src/scoring.mjs',
    'packages/harnessctl/src/index.mjs',
    '.harness/bin/harnessctl',
    '.claude/settings.json',
    '.claude/agents/harness-planner.md',
    '.claude/skills/harness-run/SKILL.md',
    '.codex/config.toml',
    '.codex/hooks.json',
    '.codex/agents/harness_planner.toml',
    '.agents/skills/harness-run/SKILL.md',
    'plugins/codex-harness-loop/.codex-plugin/plugin.json',
  ];

  for (const relPath of required) {
    checks.push({ path: relPath, ok: fileExists(path.join(repoRoot, relPath)) });
  }

  const configPath = path.join(repoRoot, '.codex', 'config.toml');
  if (fileExists(configPath)) {
    const text = readText(configPath);
    checks.push({ path: '.codex/config.toml:codex_hooks', ok: /codex_hooks\s*=\s*true/.test(text) });
  }

  const hooksPath = path.join(repoRoot, '.codex', 'hooks.json');
  if (fileExists(hooksPath)) {
    try {
      const hooksConfig = JSON.parse(readText(hooksPath));
      const ok = Boolean(hooksConfig && typeof hooksConfig === 'object' && hooksConfig.hooks && typeof hooksConfig.hooks === 'object');
      checks.push({ path: '.codex/hooks.json', ok });
    } catch {
      checks.push({ path: '.codex/hooks.json', ok: false });
    }
  }

  const issues = checks.filter((item) => !item.ok).map((item) => item.path);
  return {
    ok: issues.length === 0,
    checked: checks.length,
    issues,
  };
}
