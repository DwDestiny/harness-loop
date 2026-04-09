import test from 'node:test';
import assert from 'node:assert/strict';
import { draftContract } from '../packages/harness-core/src/contract.mjs';

test('draftContract produces required acceptance and verification', () => {
  const contract = draftContract({ task: 'Build a feature', repoMeta: { scripts: { test: 'node --test tests', doctor: 'node cmd', review: 'node review' } } });
  assert.equal(contract.task, 'Build a feature');
  assert.equal(contract.acceptance.length >= 3, true);
  assert.deepEqual(contract.verification.map((item) => item.cmd), ['npm test', 'npm run review', 'npm run doctor']);
});

test('draftContract carries harness team loop metadata', () => {
  const contract = draftContract({ task: 'Ship a governed workflow' });
  assert.equal(contract.metadata.workflow_mode, 'team_loop');
  assert.equal(Array.isArray(contract.metadata.teams), true);
  assert.deepEqual(
    contract.metadata.teams.map((item) => item.id),
    ['standards_team', 'execution_team', 'evaluation_team'],
  );
});
