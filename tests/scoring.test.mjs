import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { writeJson } from '../packages/harness-core/src/io.mjs';
import { statePaths } from '../packages/harness-core/src/paths.mjs';
import { scoreRepo } from '../packages/harness-core/src/scoring.mjs';

function mkRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-score-'));
  fs.writeFileSync(path.join(dir, 'README.md'), '# demo\n');
  fs.writeFileSync(path.join(dir, 'LICENSE'), 'MIT\n');
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# AGENTS\n');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# CLAUDE\n');
  const paths = statePaths(dir);
  writeJson(paths.contract, {
    task: 'score me',
    threshold: 90,
    max_attempts: 4,
    acceptance: [{ id: 'A1', text: 'README exists', required: true, check: { type: 'file_exists', path: 'README.md' } }],
    verification: [{ id: 'T1', cmd: 'node -e "process.exit(0)"', required: true }],
    metadata: {
      workflow_mode: 'team_loop',
      teams: [
        { id: 'standards_team' },
        { id: 'execution_team' },
        { id: 'evaluation_team' },
      ],
    },
  });
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

test('scoreRepo passes when acceptance and verification pass', () => {
  const { dir, paths } = mkRepo();
  fs.writeFileSync(
    paths.handoffs,
    JSON.stringify({
      attempt: 1,
      team_id: 'evaluation_team',
      decision: 'pass',
      next_team: null,
      summary: 'gate passed',
    }) + '\n',
  );
  const result = scoreRepo(dir, { generateReview: true });
  assert.equal(result.passed, true);
  assert.equal(result.score >= 90, true);
});

test('scoreRepo blocks repeated strategy fingerprint', () => {
  const { dir, paths } = mkRepo();
  fs.writeFileSync(paths.attempts, JSON.stringify({ fingerprint: 'same', passed: false }) + '\n');
  writeJson(paths.active, { active: true, attempt: 2, max_attempts: 4, strategy_fingerprint: 'same' });
  const result = scoreRepo(dir, { generateReview: true });
  assert.equal(result.passed, false);
  assert.equal(result.hard_failures.includes('repeated failure strategy fingerprint'), true);
});

test('scoreRepo blocks team loop when evaluation handoff is missing', () => {
  const { dir } = mkRepo();
  const result = scoreRepo(dir, { generateReview: true });
  assert.equal(result.passed, false);
  assert.equal(result.hard_failures.includes('evaluation team has not approved the current loop'), true);
});

test('scoreRepo passes team loop after evaluation handoff approves the attempt', () => {
  const { dir, paths } = mkRepo();
  fs.writeFileSync(
    paths.handoffs,
    JSON.stringify({
      attempt: 1,
      team_id: 'evaluation_team',
      decision: 'pass',
      next_team: null,
      summary: 'gate passed',
    }) + '\n',
  );

  const result = scoreRepo(dir, { generateReview: true });
  assert.equal(result.passed, true);
});
