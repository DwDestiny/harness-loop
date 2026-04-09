import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installPortable } from '../packages/harness-core/src/installer.mjs';
import { doctor } from '../packages/harness-core/src/doctor.mjs';

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-install-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'tmp' }, null, 2));
  fs.writeFileSync(path.join(dir, 'README.md'), '# tmp\n');
  fs.writeFileSync(path.join(dir, 'LICENSE'), 'MIT\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# AGENTS\n');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# CLAUDE\n');
  fs.mkdirSync(path.join(dir, 'packages', 'harness-core', 'src'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'packages', 'harnessctl', 'src'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'packages', 'harness-core', 'src', 'scoring.mjs'), 'export {};\n');
  fs.writeFileSync(path.join(dir, 'packages', 'harnessctl', 'src', 'index.mjs'), 'export {};\n');
  return dir;
}

test('installPortable writes Claude and Codex assets', () => {
  const dir = tmpRepo();
  const result = installPortable(dir, { host: 'auto' });
  assert.equal(result.ok, true);
  assert.equal(fs.existsSync(path.join(dir, '.claude', 'settings.json')), true);
  assert.equal(fs.existsSync(path.join(dir, '.codex', 'hooks.json')), true);
  const claude_md = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.match(claude_md, /harness-run/);
  assert.match(claude_md, /standards_team/);
  assert.match(claude_md, /Never route a failed evaluation directly back to execution_team/i);
  const report = doctor(dir);
  assert.equal(report.ok, true);
});

test('installPortable writes skills with explicit harness trigger guidance', () => {
  const dir = tmpRepo();
  installPortable(dir, { host: 'auto' });

  const claude_skill = fs.readFileSync(path.join(dir, '.claude', 'skills', 'harness-run', 'SKILL.md'), 'utf8');
  const codex_skill = fs.readFileSync(path.join(dir, '.agents', 'skills', 'harness-run', 'SKILL.md'), 'utf8');
  const plugin_skill = fs.readFileSync(path.join(dir, 'plugins', 'codex-harness-loop', 'skills', 'harness-run', 'SKILL.md'), 'utf8');

  assert.match(claude_skill, /^name: harness-run$/m);
  assert.match(claude_skill, /按 harness 架构循环工作/);
  assert.match(claude_skill, /contract/i);
  assert.match(claude_skill, /review/i);
  assert.match(claude_skill, /score/i);
  assert.match(claude_skill, /Never route a failed evaluation directly back to execution_team/i);
  assert.match(claude_skill, /Do not use this skill|不要在简单问答/);

  assert.match(codex_skill, /按 harness 架构循环工作/);
  assert.match(codex_skill, /review/i);
  assert.match(codex_skill, /score/i);
  assert.match(codex_skill, /Never route a failed evaluation directly back to execution_team/i);
  assert.match(codex_skill, /advance/i);

  assert.equal(plugin_skill, codex_skill);
});

test('installPortable writes openclaw skill with team loop guidance', () => {
  const dir = tmpRepo();
  const result = installPortable(dir, { host: 'openclaw' });

  assert.equal(result.ok, true);

  const openclaw_skill = fs.readFileSync(path.join(dir, 'skills', 'harness-run', 'SKILL.md'), 'utf8');
  const openclaw_manifest = JSON.parse(fs.readFileSync(path.join(dir, 'skills', 'harness-run', 'skill.json'), 'utf8'));

  assert.match(openclaw_skill, /openclaw/i);
  assert.match(openclaw_skill, /sessions_spawn/i);
  assert.match(openclaw_skill, /standards_team/i);
  assert.match(openclaw_skill, /execution_team/i);
  assert.match(openclaw_skill, /evaluation_team/i);
  assert.match(openclaw_skill, /按 harness 架构循环工作/);
  assert.match(openclaw_skill, /"label": "standards_team"/);
  assert.doesNotMatch(openclaw_skill, /"sessionKey": "standards_team"/);

  assert.equal(openclaw_manifest.name, 'harness-run');
  assert.match(openclaw_manifest.description, /OpenClaw/i);
});

test('installPortable workspace mode registers repo skills in openclaw config', () => {
  const dir = tmpRepo();
  const config_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'openclaw-config-'));
  const config_path = path.join(config_dir, 'openclaw.json');
  fs.writeFileSync(config_path, JSON.stringify({ skills: { load: { extraDirs: [] } } }, null, 2));

  installPortable(dir, {
    host: 'openclaw',
    mode: 'workspace',
    openclaw_config_path: config_path,
  });

  const config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
  assert.equal(config.skills.load.extraDirs.includes(path.join(dir, 'skills')), true);
});
