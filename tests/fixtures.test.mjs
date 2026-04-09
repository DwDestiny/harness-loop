import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { scoreRepo } from '../packages/harness-core/src/scoring.mjs';

const root = process.cwd();

const cases = [
  ['pass-minimal', true],
  ['test-fail', false],
  ['review-block', false],
  ['missing-doc', false],
  ['repeat-loop', false],
];

for (const [name, expected] of cases) {
  test(`fixture ${name} yields ${expected ? 'pass' : 'fail'}`, () => {
    const result = scoreRepo(path.join(root, 'fixtures', name), { generateReview: false });
    assert.equal(result.passed, expected);
  });
}
