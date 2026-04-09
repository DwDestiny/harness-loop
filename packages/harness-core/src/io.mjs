import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function fileExists(targetPath) {
  return fs.existsSync(targetPath);
}

export function readJson(targetPath, fallback = null) {
  if (!fileExists(targetPath)) return fallback;
  const text = fs.readFileSync(targetPath, 'utf8');
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${targetPath}: ${error.message}`, { cause: error });
  }
}

export function writeJson(targetPath, value) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export function readText(targetPath, fallback = '') {
  if (!fileExists(targetPath)) return fallback;
  return fs.readFileSync(targetPath, 'utf8');
}

export function writeText(targetPath, value) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, value, 'utf8');
}

export function appendLine(targetPath, line) {
  ensureDir(path.dirname(targetPath));
  fs.appendFileSync(targetPath, line + '\n', 'utf8');
}

export function listFiles(rootDir, options = {}) {
  const {
    include = null,
    excludeDirs = new Set(['.git', 'node_modules', 'dist']),
    excludePaths = [],
  } = options;

  const results = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      if (excludePaths.some((pattern) => relPath.startsWith(pattern))) continue;
      if (entry.isDirectory()) {
        if (excludeDirs.has(entry.name)) continue;
        walk(fullPath);
        continue;
      }
      if (!include || include(relPath)) results.push(fullPath);
    }
  }

  if (fileExists(rootDir)) walk(rootDir);
  return results;
}

export function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex');
}

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [key, inlineValue] = token.slice(2).split('=');
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}
