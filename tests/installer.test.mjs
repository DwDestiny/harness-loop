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
  const report = doctor(dir);
  assert.equal(report.ok, true);
});
