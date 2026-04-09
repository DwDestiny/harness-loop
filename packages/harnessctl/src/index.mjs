#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { draftContract, doctor, installPortable, scoreRepo, statePaths, writeReview } from '../../harness-core/src/index.mjs';
import { appendLine, parseArgs, readJson, writeJson } from '../../harness-core/src/io.mjs';

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || 'help';
const repoRoot = process.cwd();
const paths = statePaths(repoRoot);

function readPackageMeta() {
  const packagePath = path.join(repoRoot, 'package.json');
  if (!fs.existsSync(packagePath)) return {};
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function print(value, quiet = false) {
  if (quiet) return;
  if (typeof value === 'string') {
    process.stdout.write(`${value}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function teamSequence(contract = {}) {
  if (Array.isArray(contract?.metadata?.team_sequence) && contract.metadata.team_sequence.length > 0) {
    return contract.metadata.team_sequence;
  }
  if (Array.isArray(contract?.metadata?.teams) && contract.metadata.teams.length > 0) {
    return contract.metadata.teams.map((item) => item.id).filter(Boolean);
  }
  return ['standards_team', 'execution_team', 'evaluation_team'];
}

function nextTeamInSequence(sequence, currentTeam) {
  if (!sequence.length) return null;
  const currentIndex = sequence.indexOf(currentTeam);
  if (currentIndex === -1) return sequence[0];
  return sequence[currentIndex + 1] || null;
}

function initCommand() {
  const task = args.task || 'Unnamed task';
  const contract = draftContract({
    task,
    type: args.type || 'feature',
    threshold: Number(args.threshold || 90),
    maxAttempts: Number(args['max-attempts'] || 4),
    repoMeta: readPackageMeta(),
  });
  const sequence = teamSequence(contract);
  writeJson(paths.contract, contract);
  writeJson(paths.active, {
    active: true,
    host: args.host || 'auto',
    task_id: new Date().toISOString().replace(/[:.]/g, '-'),
    attempt: 1,
    max_attempts: contract.max_attempts,
    strategy_fingerprint: args.strategy || null,
    current_team: sequence[0] || null,
    next_team: sequence[0] || null,
    team_round: 1,
    last_handoff_decision: null,
  });
  print({ ok: true, contract, active: readJson(paths.active) });
}

function advanceCommand() {
  const contract = readJson(paths.contract, {});
  const sequence = teamSequence(contract);
  const active = readJson(paths.active, { active: true, attempt: 1, max_attempts: 4 });
  const next = {
    ...active,
    active: true,
    attempt: (active.attempt || 1) + 1,
    strategy_fingerprint: args.strategy || null,
    current_team: sequence[0] || null,
    next_team: sequence[0] || null,
    team_round: (active.team_round || 1) + 1,
    last_handoff_decision: 'retry',
  };
  writeJson(paths.active, next);
  print(next);
}

function handoffCommand() {
  const contract = readJson(paths.contract, {});
  const sequence = teamSequence(contract);
  const active = readJson(paths.active, {
    active: true,
    attempt: 1,
    max_attempts: contract.max_attempts || 4,
    current_team: sequence[0] || null,
    next_team: sequence[0] || null,
    team_round: 1,
  });
  const teamId = args.team || active.current_team || sequence[0] || null;
  const decision = args.decision || 'continue';
  const explicitNextTeam = args['next-team'];
  const nextTeam = explicitNextTeam !== undefined ? explicitNextTeam : nextTeamInSequence(sequence, teamId);
  const record = {
    timestamp: new Date().toISOString(),
    attempt: active.attempt || 1,
    team_round: active.team_round || 1,
    team_id: teamId,
    decision,
    next_team: nextTeam,
    summary: args.summary || '',
  };
  appendLine(paths.handoffs, JSON.stringify(record));
  const nextActive = {
    ...active,
    current_team: nextTeam,
    next_team: nextTeam,
    last_handoff_decision: decision,
  };
  writeJson(paths.active, nextActive);
  print({ ok: true, handoff: record, active: nextActive });
}

function draftContractCommand() {
  const contract = draftContract({
    task: args.task || 'Unnamed task',
    type: args.type || 'feature',
    threshold: Number(args.threshold || 90),
    maxAttempts: Number(args['max-attempts'] || 4),
    repoMeta: readPackageMeta(),
  });
  print(contract);
}

function reviewCommand() {
  const review = writeReview(repoRoot);
  print(review, Boolean(args.quiet));
  process.exit(review.high > 0 || review.critical > 0 ? 2 : 0);
}

function scoreCommand() {
  const result = scoreRepo(repoRoot, { generateReview: true });
  if (args['stop-hook']) {
    if (result.passed) {
      process.stdout.write('{}\n');
      return;
    }
    process.stdout.write(`${JSON.stringify({ decision: 'block', reason: `Harness failed: ${result.hard_failures.join('; ')}` })}\n`);
    return;
  }
  print(result);
  process.exit(result.passed ? 0 : 2);
}

function doctorCommand() {
  const result = doctor(repoRoot);
  print(result);
  process.exit(result.ok ? 0 : 2);
}

function installCommand() {
  const result = installPortable(repoRoot, { host: args.host || 'auto', mode: args.mode || 'portable' });
  print(result);
}

function cleanCommand() {
  const current = path.join(repoRoot, '.harness', 'state', 'current');
  fs.rmSync(current, { recursive: true, force: true });
  print({ ok: true, removed: '.harness/state/current' });
}

const commands = {
  init: initCommand,
  advance: advanceCommand,
  handoff: handoffCommand,
  'draft-contract': draftContractCommand,
  review: reviewCommand,
  score: scoreCommand,
  doctor: doctorCommand,
  install: installCommand,
  clean: cleanCommand,
  help: () => print('Usage: harnessctl <init|advance|handoff|draft-contract|review|score|doctor|install|clean>'),
};

(commands[command] || commands.help)();
