import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { doctor } from '../packages/harness-core/src/doctor.mjs';
import { installPortable } from '../packages/harness-core/src/installer.mjs';
import { writeJson } from '../packages/harness-core/src/io.mjs';
import { statePaths } from '../packages/harness-core/src/paths.mjs';
import { scoreRepo } from '../packages/harness-core/src/scoring.mjs';

function makeRepo({ withPackageJson = true } = {}) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-error-cases-'));
  if (withPackageJson) {
    fs.writeFileSync(path.join(repoRoot, 'package.json'), JSON.stringify({ name: 'tmp' }, null, 2));
  }
  fs.writeFileSync(path.join(repoRoot, 'README.md'), '# tmp\n');
  fs.writeFileSync(path.join(repoRoot, 'LICENSE'), 'MIT\n');
  fs.writeFileSync(path.join(repoRoot, 'AGENTS.md'), '# AGENTS\n');
  fs.writeFileSync(path.join(repoRoot, 'CLAUDE.md'), '# CLAUDE\n');
  return repoRoot;
}

function seedScoreState(repoRoot, { verification = [{ id: 'T1', cmd: 'node -e "process.exit(0)"', required: true }] } = {}) {
  const paths = statePaths(repoRoot);
  writeJson(paths.contract, {
    task: 'error case',
    threshold: 90,
    max_attempts: 4,
    acceptance: [
      {
        id: 'A1',
        text: 'README exists',
        required: true,
        check: { type: 'file_exists', path: 'README.md' },
      },
    ],
    verification,
  });
  writeJson(paths.active, { active: true, attempt: 1, max_attempts: 4 });
  return paths;
}

test('malformed contract surfaces a readable JSON parse error', () => {
  const repoRoot = makeRepo();
  const paths = statePaths(repoRoot);
  fs.mkdirSync(path.dirname(paths.contract), { recursive: true });
  fs.writeFileSync(paths.contract, '{ not valid json\n', 'utf8');

  assert.throws(() => scoreRepo(repoRoot, { generateReview: true }), /contract\.json/);
});

test('missing verification contract blocks scoring', () => {
  const repoRoot = makeRepo();
  seedScoreState(repoRoot, { verification: [] });

  const result = scoreRepo(repoRoot, { generateReview: true });
  assert.equal(result.passed, false);
  assert.equal(result.hard_failures.includes('verification commands are missing'), true);
});

test('invalid hooks config is rejected by doctor', () => {
  const repoRoot = makeRepo();
  fs.mkdirSync(path.join(repoRoot, '.codex'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, '.codex', 'config.toml'), '[features]\ncodex_hooks = true\n');
  fs.writeFileSync(path.join(repoRoot, '.codex', 'hooks.json'), '{ invalid json\n', 'utf8');

  const report = doctor(repoRoot);
  assert.equal(report.ok, false);
  assert.equal(report.issues.some((item) => item.includes('.codex/hooks.json')), true);
});

test('empty repo without package.json still installs portable assets and reports the missing manifest', () => {
  const repoRoot = makeRepo({ withPackageJson: false });
  const install = installPortable(repoRoot, { host: 'auto' });

  assert.equal(install.ok, true);
  assert.equal(fs.existsSync(path.join(repoRoot, '.claude', 'settings.json')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, '.codex', 'hooks.json')), true);

  const report = doctor(repoRoot);
  assert.equal(report.ok, false);
  assert.equal(report.issues.includes('package.json'), true);
});
