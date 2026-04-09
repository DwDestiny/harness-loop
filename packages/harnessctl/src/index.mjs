#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { draftContract, doctor, installPortable, scoreRepo, statePaths, writeReview } from '../../harness-core/src/index.mjs';
import { parseArgs, readJson, writeJson } from '../../harness-core/src/io.mjs';

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

function initCommand() {
  const task = args.task || 'Unnamed task';
  const contract = draftContract({
    task,
    type: args.type || 'feature',
    threshold: Number(args.threshold || 90),
    maxAttempts: Number(args['max-attempts'] || 4),
    repoMeta: readPackageMeta(),
  });
  writeJson(paths.contract, contract);
  writeJson(paths.active, {
    active: true,
    host: args.host || 'auto',
    task_id: new Date().toISOString().replace(/[:.]/g, '-'),
    attempt: 1,
    max_attempts: contract.max_attempts,
    strategy_fingerprint: args.strategy || null,
  });
  print({ ok: true, contract, active: readJson(paths.active) });
}

function advanceCommand() {
  const active = readJson(paths.active, { active: true, attempt: 1, max_attempts: 4 });
  const next = {
    ...active,
    active: true,
    attempt: (active.attempt || 1) + 1,
    strategy_fingerprint: args.strategy || null,
  };
  writeJson(paths.active, next);
  print(next);
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
  'draft-contract': draftContractCommand,
  review: reviewCommand,
  score: scoreCommand,
  doctor: doctorCommand,
  install: installCommand,
  clean: cleanCommand,
  help: () => print('Usage: harnessctl <init|advance|draft-contract|review|score|doctor|install|clean>'),
};

(commands[command] || commands.help)();
