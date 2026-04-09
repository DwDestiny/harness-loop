import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copy(srcRel, destRel) {
  const src = path.join(root, srcRel);
  const dest = path.join(root, destRel);
  fs.cpSync(src, dest, { recursive: true });
}

copy('.claude', 'dist/claude-harness-loop/.claude');
copy('.codex', 'dist/codex-harness-loop/.codex');
copy('.agents', 'dist/codex-harness-loop/.agents');
copy('skills', 'dist/openclaw-harness-loop/skills');
copy('plugins/codex-harness-loop', 'dist/codex-harness-loop/plugin');
copy('plugins/claude-harness-loop', 'dist/claude-harness-loop/plugin');
console.log(JSON.stringify({ ok: true, dist }, null, 2));
