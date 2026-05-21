import { rm } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const profiles = {
  all: ['node_modules/.vite', 'dist', 'node_modules', 'target'],
  base: ['node_modules', 'target', 'dist'],
  vite: ['node_modules/.vite', 'dist/.vite-cache'],
};

const profile = process.argv[2];
if (!profile || !Object.hasOwn(profiles, profile)) {
  console.error('[clean-paths] usage: node scripts/windows/clean-paths.mjs <base|vite|all>');
  process.exit(1);
}

for (const entry of profiles[profile]) {
  const target = resolve(rootDir, entry);
  const rel = relative(rootDir, target);

  if (rel.startsWith('..') || rel === '') {
    throw new Error(`[clean-paths] refusing to remove outside workspace: ${target}`);
  }

  await rm(target, { recursive: true, force: true });
  console.log(`[clean-paths] removed ${entry}`);
}
