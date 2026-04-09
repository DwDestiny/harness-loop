import { spawnSync } from 'node:child_process';

export function runCommand(command, { cwd } = {}) {
  const startedAt = Date.now();
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const durationMs = Date.now() - startedAt;
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const ok = result.status === 0;
  const summary = [stdout.trim(), stderr.trim()].filter(Boolean).join(' | ').slice(0, 300);

  return {
    ok,
    code: result.status ?? 1,
    stdout,
    stderr,
    summary,
    durationMs,
    command,
  };
}
