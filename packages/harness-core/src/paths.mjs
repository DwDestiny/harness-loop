import path from 'node:path';

export function statePaths(repoRoot) {
  const base = path.join(repoRoot, '.harness', 'state', 'current');
  return {
    base,
    active: path.join(base, 'active.json'),
    handoffs: path.join(base, 'handoffs.jsonl'),
    contract: path.join(base, 'contract.json'),
    verification: path.join(base, 'verification.json'),
    review: path.join(base, 'review.json'),
    score: path.join(base, 'score.json'),
    summary: path.join(base, 'summary.md'),
    attempts: path.join(base, 'attempts.jsonl'),
  };
}
