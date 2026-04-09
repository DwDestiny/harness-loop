export function guessVerificationCommands(repoMeta = {}) {
  const scripts = repoMeta.scripts || {};
  const commands = [];
  if (scripts.test) commands.push('npm test');
  if (scripts.review) commands.push('npm run review');
  if (scripts.doctor) commands.push('npm run doctor');
  if (commands.length === 0) commands.push('node --version');
  return commands;
}

export function draftContract({ task, type = 'feature', threshold = 90, maxAttempts = 4, repoMeta = {} }) {
  const verification = guessVerificationCommands(repoMeta).map((cmd, index) => ({
    id: `T${index + 1}`,
    cmd,
    required: true,
  }));

  const acceptance = [
    {
      id: 'A1',
      text: `Requested ${type} behavior exists and is wired into the repo.`,
      required: true,
    },
    {
      id: 'A2',
      text: 'Automated verification exists and passes.',
      required: true,
    },
    {
      id: 'A3',
      text: 'Usage or maintenance docs are updated when the interface changes.',
      required: type !== 'spike',
      check: { type: 'file_exists', path: 'README.md' },
    },
  ];

  return {
    task,
    type,
    threshold,
    max_attempts: maxAttempts,
    acceptance,
    verification,
    metadata: {
      drafted_by: 'harnessctl',
      deterministic_gate: true,
    },
  };
}
