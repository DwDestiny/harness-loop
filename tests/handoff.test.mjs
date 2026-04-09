import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { writeJson } from '../packages/harness-core/src/io.mjs';
import { statePaths } from '../packages/harness-core/src/paths.mjs';

function mkRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-handoff-'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'tmp' }, null, 2));
  fs.writeFileSync(path.join(dir, 'README.md'), '# demo\n');
  fs.writeFileSync(path.join(dir, 'LICENSE'), 'MIT\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# AGENTS\n');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# CLAUDE\n');
  const paths = statePaths(dir);
  writeJson(paths.contract, { task: 'handoff', threshold: 90, max_attempts: 4, acceptance: [], verification: [] });
  writeJson(paths.active, {
    active: true,
    attempt: 1,
    max_attempts: 4,
    current_team: 'standards_team',
    team_round: 1,
    next_team: 'standards_team',
  });
  return { dir, paths };
}

test('harnessctl handoff records team decision and advances active state', () => {
  const { dir, paths } = mkRepo();
  const cliPath = path.join(process.cwd(), 'packages', 'harnessctl', 'src', 'index.mjs');

  execFileSync('node', [
    cliPath,
    'handoff',
    '--team',
    'standards_team',
    '--decision',
    'continue',
    '--next-team',
    'execution_team',
    '--summary',
    'contract is ready',
  ], { cwd: dir });

  const lines = fs.readFileSync(paths.handoffs, 'utf8').trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  assert.equal(lines.length, 1);
  assert.equal(lines[0].team_id, 'standards_team');
  assert.equal(lines[0].decision, 'continue');
  assert.equal(lines[0].next_team, 'execution_team');

  const active = JSON.parse(fs.readFileSync(paths.active, 'utf8'));
  assert.equal(active.current_team, 'execution_team');
  assert.equal(active.next_team, 'execution_team');
  assert.equal(active.last_handoff_decision, 'continue');
});
