#!/usr/bin/env node

/**
 * TITANE∞ — COPILOT-XS scaffolding
 * Creator: Kevin Thibault
 * Generated/maintained with GitHub Copilot (GPT-5.2)
 * License: governed by repository LICENSE.md
 */

import { spawnSync } from 'node:child_process';

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

// 1) Validate (fast)
runOrFallback('pnpm', ['run', 'copilot-xs:validate'], 'corepack', [
  'pnpm',
  'run',
  'copilot-xs:validate',
]);

// 2) GitGuardian secret scanning (fast, before running tests)
// Set COPILOT_XS_SKIP_GITGUARDIAN=1 to bypass locally
if (process.env.COPILOT_XS_SKIP_GITGUARDIAN !== '1') {
  run('node', ['.github/copilot-xs/scripts/gitguardian-precommit.js']);
}

// 3) Full test gate (can be slow; set COPILOT_XS_SKIP_TESTS=1 to bypass locally)
if (process.env.COPILOT_XS_SKIP_TESTS !== '1') {
  runOrFallback('pnpm', ['run', 'test:all'], 'corepack', ['pnpm', 'run', 'test:all']);
}
