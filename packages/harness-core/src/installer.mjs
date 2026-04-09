import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureDir, readJson, writeJson, writeText } from './io.mjs';
import {
  claudeAgents,
  claudeSettings,
  claudeSkill,
  codexAgents,
  codexHooks,
  codexPluginManifest,
  codexSkill,
  openclawSkill,
  openclawSkillManifest,
} from './templates.mjs';

const claude_harness_block_start = '<!-- harness-loop:start -->';
const claude_harness_block_end = '<!-- harness-loop:end -->';

function chmodIfExists(targetPath) {
  try { fs.chmodSync(targetPath, 0o755); } catch {}
}

function claudeHarnessProjectBlock() {
  return `${claude_harness_block_start}
## Harness trigger routing

When the user explicitly says harness, harness loop, 按 harness 架构循环工作, or 按 harness 流程做:
1. Treat that as activation of the repo-local harness-run workflow, even if Skill auto-discovery is unavailable.
2. Always use the exact team ids standards_team, execution_team, evaluation_team.
3. Never route a failed evaluation directly back to execution_team. Failed evaluations must return to standards_team first so the contract and strategy can be tightened before the next execution pass.
${claude_harness_block_end}
`;
}

function mergeManagedBlock(currentText, blockText, startMarker, endMarker) {
  const normalized = currentText.endsWith('\n') ? currentText : `${currentText}\n`;
  const startIndex = normalized.indexOf(startMarker);
  const endIndex = normalized.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = normalized.slice(0, startIndex).replace(/\s*$/, '');
    const after = normalized.slice(endIndex + endMarker.length).replace(/^\s*/, '');
    return `${before}\n\n${blockText.trimEnd()}\n${after ? `\n${after}` : ''}`;
  }

  return `${normalized.replace(/\s*$/, '')}\n\n${blockText.trimEnd()}\n`;
}

function openclawConfigPath(options = {}) {
  return options.openclaw_config_path
    || process.env.OPENCLAW_CONFIG_PATH
    || path.join(os.homedir(), '.openclaw', 'openclaw.json');
}

function registerOpenclawExtraDir(repoRoot, options = {}) {
  const configPath = openclawConfigPath(options);
  const config = readJson(configPath, {});
  const next = { ...config };
  next.skills = next.skills || {};
  next.skills.load = next.skills.load || {};
  next.skills.load.extraDirs = Array.isArray(next.skills.load.extraDirs) ? next.skills.load.extraDirs : [];

  const skillsDir = path.join(repoRoot, 'skills');
  if (!next.skills.load.extraDirs.includes(skillsDir)) {
    next.skills.load.extraDirs.push(skillsDir);
  }

  writeJson(configPath, next);
  return { configPath, skillsDir };
}

export function installPortable(repoRoot, options = {}) {
  const host = options.host || 'auto';
  const mode = options.mode || 'portable';
  const created = [];

  ensureDir(path.join(repoRoot, '.harness', 'bin'));
  const shimPath = path.join(repoRoot, '.harness', 'bin', 'harnessctl');
  writeText(
    shimPath,
    '#!/usr/bin/env bash\n' +
      'set -euo pipefail\n' +
      'node "$(cd "$(dirname "$0")/../.." && pwd)/packages/harnessctl/src/index.mjs" "$@"\n',
  );
  chmodIfExists(shimPath);
  created.push('.harness/bin/harnessctl');

  if (host === 'auto' || host === 'claude') {
    writeJson(path.join(repoRoot, '.claude', 'settings.json'), claudeSettings());
    created.push('.claude/settings.json');
    for (const [name, contents] of Object.entries(claudeAgents())) {
      writeText(path.join(repoRoot, '.claude', 'agents', name), `${contents}\n`);
      created.push(`.claude/agents/${name}`);
    }
    writeText(path.join(repoRoot, '.claude', 'skills', 'harness-run', 'SKILL.md'), `${claudeSkill()}\n`);
    created.push('.claude/skills/harness-run/SKILL.md');
    const claudeMdPath = path.join(repoRoot, 'CLAUDE.md');
    const existingClaudeMd = fs.existsSync(claudeMdPath) ? fs.readFileSync(claudeMdPath, 'utf8') : '# CLAUDE.md\n';
    writeText(
      claudeMdPath,
      mergeManagedBlock(existingClaudeMd, claudeHarnessProjectBlock(), claude_harness_block_start, claude_harness_block_end),
    );
    created.push('CLAUDE.md');
    writeText(
      path.join(repoRoot, 'plugins', 'claude-harness-loop', 'README.md'),
      '# Claude portable bundle\n\nThis bundle mirrors the repo-local .claude assets for distribution.\n',
    );
    created.push('plugins/claude-harness-loop/README.md');
  }

  if (host === 'auto' || host === 'codex') {
    writeText(path.join(repoRoot, '.codex', 'config.toml'), '[features]\ncodex_hooks = true\n');
    created.push('.codex/config.toml');
    writeJson(path.join(repoRoot, '.codex', 'hooks.json'), codexHooks());
    created.push('.codex/hooks.json');
    for (const [name, contents] of Object.entries(codexAgents())) {
      writeText(path.join(repoRoot, '.codex', 'agents', name), contents);
      created.push(`.codex/agents/${name}`);
    }
    writeText(path.join(repoRoot, '.agents', 'skills', 'harness-run', 'SKILL.md'), `${codexSkill()}\n`);
    created.push('.agents/skills/harness-run/SKILL.md');
    writeJson(path.join(repoRoot, 'plugins', 'codex-harness-loop', '.codex-plugin', 'plugin.json'), codexPluginManifest());
    writeText(path.join(repoRoot, 'plugins', 'codex-harness-loop', 'skills', 'harness-run', 'SKILL.md'), `${codexSkill()}\n`);
    created.push('plugins/codex-harness-loop/.codex-plugin/plugin.json');
    created.push('plugins/codex-harness-loop/skills/harness-run/SKILL.md');
  }

  if (host === 'auto' || host === 'openclaw') {
    writeText(path.join(repoRoot, 'skills', 'harness-run', 'SKILL.md'), `${openclawSkill()}\n`);
    writeJson(path.join(repoRoot, 'skills', 'harness-run', 'skill.json'), openclawSkillManifest());
    created.push('skills/harness-run/SKILL.md');
    created.push('skills/harness-run/skill.json');

    if (mode === 'workspace') {
      const registration = registerOpenclawExtraDir(repoRoot, options);
      created.push(`${registration.configPath}#skills.load.extraDirs`);
    }
  }

  return { ok: true, created };
}
