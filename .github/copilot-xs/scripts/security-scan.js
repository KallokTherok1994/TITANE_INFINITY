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

const hasPnpmLock = existsSync('pnpm-lock.yaml');

if (hasPnpmLock) {
  // Prefer corepack when available; fallback to pnpm.
  const pnpmResult = runOrFallback('corepack', ['pnpm', 'audit'], 'pnpm', ['audit']);

  if (!pnpmResult.ok) {
    console.warn(
      '[COPILOT-XS] ⚠️ Security scan skipped: pnpm-lock.yaml detected but neither pnpm nor corepack is available.'
    );
  }
  process.exit(0);
}

console.warn('[COPILOT-XS] ⚠️ Security scan skipped: pnpm-lock.yaml not found.');
