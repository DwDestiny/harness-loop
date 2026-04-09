import path from 'node:path';
import { appendLine, fileExists, readJson, readText, sha1, writeJson, writeText } from './io.mjs';
import { statePaths } from './paths.mjs';
import { runCommand } from './shell.mjs';
import { reviewRepo } from './review.mjs';

function evaluateCheck(repoRoot, check, verification) {
  if (!check) return { ok: null, evidence: 'No deterministic check attached.' };
  if (check.type === 'file_exists') {
    const ok = fileExists(path.join(repoRoot, check.path));
    return { ok, evidence: check.path };
  }
  if (check.type === 'all_files_exist') {
    const missing = (check.paths || []).filter((file) => !fileExists(path.join(repoRoot, file)));
    return { ok: missing.length === 0, evidence: missing.length ? `Missing: ${missing.join(', ')}` : 'all files present' };
  }
  if (check.type === 'text_in_file') {
    const fullPath = path.join(repoRoot, check.path);
    const text = fileExists(fullPath) ? readText(fullPath) : '';
    const ok = text.includes(check.includes);
    return { ok, evidence: `${check.path} includes ${JSON.stringify(check.includes)}` };
  }
  if (check.type === 'verification_ok') {
    const found = (verification.commands || []).find((item) => item.id === check.id || item.cmd === check.cmd);
    return { ok: Boolean(found?.ok), evidence: found ? `${found.cmd}: ${found.ok}` : 'verification result missing' };
  }
  return { ok: null, evidence: `Unknown check type: ${check.type}` };
}

function runVerification(repoRoot, contract) {
  const commands = (contract.verification || []).map((item) => {
    const result = runCommand(item.cmd, { cwd: repoRoot });
    return {
      id: item.id,
      cmd: item.cmd,
      required: item.required !== false,
      ok: result.ok,
      code: result.code,
      summary: result.summary,
      durationMs: result.durationMs,
    };
  });
  return { commands };
}

function acceptanceStatuses(repoRoot, contract, verification) {
  const reported = new Map((verification.acceptance || []).map((item) => [item.id, item]));
  return (contract.acceptance || []).map((item) => {
    if (reported.has(item.id)) {
      const found = reported.get(item.id);
      return {
        id: item.id,
        text: item.text,
        required: item.required !== false,
        ok: Boolean(found.ok),
        evidence: found.evidence || 'reported by verification',
      };
    }
    const checked = evaluateCheck(repoRoot, item.check, verification);
    return {
      id: item.id,
      text: item.text,
      required: item.required !== false,
      ok: checked.ok,
      evidence: checked.evidence,
    };
  });
}

function governanceChecks(repoRoot) {
  const files = ['README.md', 'LICENSE', 'AGENTS.md', 'CLAUDE.md'];
  const present = files.filter((file) => fileExists(path.join(repoRoot, file))).length;
  return { total: files.length, present, files };
}

function loadAttempts(attemptsPath) {
  if (!fileExists(attemptsPath)) return [];
  return readText(attemptsPath)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function computeFingerprint(active, hardFailures, acceptance, verification, review) {
  if (active?.strategy_fingerprint) return active.strategy_fingerprint;
  return sha1(JSON.stringify({
    hardFailures,
    acceptance: acceptance.filter((item) => item.ok === false).map((item) => item.id),
    verification: (verification.commands || []).filter((item) => !item.ok).map((item) => item.id || item.cmd),
    blocking: (review.blocking || []).map((item) => item.title),
  }));
}

function buildSummary({ contract, acceptance, verification, review, score }) {
  const lines = [
    '# Harness Summary',
    '',
    `- Task: ${contract.task}`,
    `- Passed: ${score.passed}`,
    `- Score: ${score.score}/${score.threshold}`,
    `- Hard failures: ${score.hard_failures.length}`,
    '',
    '## Acceptance',
  ];
  for (const item of acceptance) {
    lines.push(`- [${item.ok ? 'x' : ' '}] ${item.id} ${item.text}`);
  }
  lines.push('', '## Verification');
  for (const item of verification.commands || []) {
    lines.push(`- ${item.ok ? 'PASS' : 'FAIL'} ${item.cmd}`);
  }
  lines.push('', '## Review');
  lines.push(`- Critical: ${review.critical || 0}`);
  lines.push(`- High: ${review.high || 0}`);
  lines.push(`- Medium: ${review.medium || 0}`);
  if ((review.blocking || []).length) {
    lines.push('', '### Blocking items');
    for (const item of review.blocking) {
      lines.push(`- ${item.title} (${item.evidence})`);
    }
  }
  if (score.next_move.length) {
    lines.push('', '## Next move');
    for (const item of score.next_move) lines.push(`- ${item}`);
  }
  return lines.join('\n') + '\n';
}

export function scoreRepo(repoRoot, options = {}) {
  const paths = statePaths(repoRoot);
  const contract = readJson(paths.contract);
  const active = readJson(paths.active, { active: false, attempt: 1, max_attempts: 1 });
  if (!contract) throw new Error('contract.json is required before scoring');
  const verificationContract = Array.isArray(contract.verification) ? contract.verification : [];
  const verificationMissing = verificationContract.length === 0;

  const verification = options.runVerification === false
    ? (readJson(paths.verification, { commands: [] }))
    : runVerification(repoRoot, { ...contract, verification: verificationContract });
  writeJson(paths.verification, verification);

  const review = options.generateReview === false
    ? readJson(paths.review, { critical: 0, high: 0, medium: 0, blocking: [], notes: [] })
    : reviewRepo(repoRoot);
  writeJson(paths.review, review);

  const acceptance = acceptanceStatuses(repoRoot, contract, verification);
  const governance = governanceChecks(repoRoot);

  const hardFailures = [];
  if (!fileExists(paths.contract)) hardFailures.push('contract.json is missing');
  if (!fileExists(paths.verification)) hardFailures.push('verification.json is missing');
  if (!fileExists(paths.review)) hardFailures.push('review.json is missing');
  if (verificationMissing) hardFailures.push('verification commands are missing');

  for (const item of verification.commands || []) {
    if (item.required !== false && !item.ok) hardFailures.push(`${item.cmd} failed`);
  }
  if ((review.critical || 0) > 0) hardFailures.push('review found critical issues');
  if ((review.high || 0) > 0) hardFailures.push('review found high issues');
  for (const item of acceptance) {
    if (item.required && item.ok !== true) hardFailures.push(`acceptance ${item.id} not satisfied`);
  }
  if ((active.attempt || 1) > (contract.max_attempts || active.max_attempts || 1)) {
    hardFailures.push('attempt budget exhausted');
  }

  const attempts = loadAttempts(paths.attempts);
  const fingerprint = computeFingerprint(active, hardFailures, acceptance, verification, review);
  const lastAttempt = attempts.at(-1);
  if (lastAttempt && lastAttempt.fingerprint === fingerprint && lastAttempt.passed === false) {
    hardFailures.push('repeated failure strategy fingerprint');
  }

  const requiredAcceptance = acceptance.filter((item) => item.required);
  const requiredVerification = (verification.commands || []).filter((item) => item.required !== false);
  const acceptanceScore = requiredAcceptance.length
    ? Math.round(40 * requiredAcceptance.filter((item) => item.ok).length / requiredAcceptance.length)
    : 40;
  const verificationScore = verificationMissing ? 0 : (requiredVerification.length
    ? Math.round(35 * requiredVerification.filter((item) => item.ok).length / requiredVerification.length)
    : 35);
  const reviewPenalty = Math.min((review.medium || 0) * 3, 15);
  const reviewScore = Math.max(0, 15 - reviewPenalty - ((review.high || 0) * 15) - ((review.critical || 0) * 15));
  const governanceScore = Math.round(10 * governance.present / governance.total);
  const score = acceptanceScore + verificationScore + reviewScore + governanceScore;

  const nextMove = [];
  if (hardFailures.length) {
    for (const failure of hardFailures) nextMove.push(failure);
  }
  if (!nextMove.length && score < contract.threshold) {
    nextMove.push('raise acceptance coverage or verification completeness');
  }

  const result = {
    passed: hardFailures.length === 0 && score >= contract.threshold,
    score,
    threshold: contract.threshold,
    hard_failures: hardFailures,
    components: {
      acceptance: acceptanceScore,
      verification: verificationScore,
      review: reviewScore,
      governance: governanceScore,
    },
    acceptance,
    next_move: nextMove,
    fingerprint,
    attempt: active.attempt || 1,
  };

  writeJson(paths.score, result);
  writeText(paths.summary, buildSummary({ contract, acceptance, verification, review, score: result }));
  appendLine(paths.attempts, JSON.stringify({
    timestamp: new Date().toISOString(),
    attempt: active.attempt || 1,
    fingerprint,
    passed: result.passed,
    score,
    hard_failures: hardFailures,
  }));

  if (result.passed && active.active !== false) {
    writeJson(paths.active, { ...active, active: false });
  }

  return result;
}
