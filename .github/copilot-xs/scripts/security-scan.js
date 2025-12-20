#!/usr/bin/env node

/**
 * TITANE∞ — COPILOT-XS scaffolding
 * Creator: Kevin Thibault
 * Generated/maintained with GitHub Copilot (GPT-5.2)
 * License: governed by repository LICENSE.md
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });

  // Command not found
  if (result.error && result.error.code === 'ENOENT') {
    return { ok: false, reason: 'not-found' };
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return { ok: true };
}

function runOrFallback(primaryCmd, primaryArgs, fallbackCmd, fallbackArgs) {
  const primary = run(primaryCmd, primaryArgs);
  if (primary.ok) {
    return primary;
  }

  if (primary.reason !== 'not-found') {
    return primary;
  }

  return run(fallbackCmd, fallbackArgs);
}

const hasPackageLock = existsSync('package-lock.json');
const hasPnpmLock = existsSync('pnpm-lock.yaml');
const hasYarnLock = existsSync('yarn.lock');

if (hasPackageLock) {
  run('npm', ['audit']);
  process.exit(0);
}

if (hasPnpmLock) {
  const pnpmResult = runOrFallback(
    'pnpm',
    ['audit'],
    'corepack',
    ['pnpm', 'audit']
  );

  if (!pnpmResult.ok) {
    console.warn(
      '[COPILOT-XS] ⚠️ Security scan skipped: pnpm-lock.yaml detected but neither pnpm nor corepack is available.'
    );
  }
  process.exit(0);
}

if (hasYarnLock) {
  const yarnResult = run('yarn', ['npm', 'audit']);
  if (!yarnResult.ok) {
    console.warn(
      '[COPILOT-XS] ⚠️ Security scan skipped: yarn.lock detected but yarn is not installed.'
    );
  }
  process.exit(0);
}

console.warn(
  '[COPILOT-XS] ⚠️ Security scan skipped: no lockfile found (package-lock.json / pnpm-lock.yaml / yarn.lock).'
);
