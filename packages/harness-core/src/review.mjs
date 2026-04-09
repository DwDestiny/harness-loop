import path from 'node:path';
import { fileExists, listFiles, readText, writeJson } from './io.mjs';
import { statePaths } from './paths.mjs';

const MARKER_PATTERN = /^\s*(?:\/\/|#|\*|\/\*|<!--|;).*?\b(TODO|FIXME|HACK|XXX)\b/i;

export function reviewRepo(repoRoot) {
  const blocking = [];
  const notes = [];

  const requiredDocs = ['README.md', 'LICENSE', 'AGENTS.md', 'CLAUDE.md'];
  for (const file of requiredDocs) {
    if (!fileExists(path.join(repoRoot, file))) {
      blocking.push({
        severity: 'high',
        title: `${file} is missing`,
        evidence: file,
        fix: `Add ${file} at repo root.`,
      });
    }
  }

  const files = listFiles(repoRoot, {
    include: (relPath) => /^(packages|scripts|tests)\/.+\.(mjs|js|md|sh)$/i.test(relPath),
    excludePaths: ['fixtures/'],
  });

  for (const fullPath of files) {
    const relPath = path.relative(repoRoot, fullPath).replace(/\\/g, '/');
    const lines = readText(fullPath).split(/\r?\n/);
    lines.forEach((line, index) => {
      if (MARKER_PATTERN.test(line)) {
        notes.push({
          severity: 'medium',
          title: 'Unresolved marker found',
          evidence: `${relPath}:${index + 1}`,
          fix: 'Resolve or remove the marker before shipping.',
        });
      }
    });
  }

  const review = {
    critical: blocking.filter((item) => item.severity === 'critical').length,
    high: blocking.filter((item) => item.severity === 'high').length,
    medium: notes.length,
    blocking,
    notes,
  };

  return review;
}

export function writeReview(repoRoot) {
  const review = reviewRepo(repoRoot);
  const paths = statePaths(repoRoot);
  writeJson(paths.review, review);
  return review;
}
