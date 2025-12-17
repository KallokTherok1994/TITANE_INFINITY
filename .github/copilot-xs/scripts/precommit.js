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
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// 1) Validate (fast)
run('npm', ['run', 'copilot-xs:validate']);

// 2) Full test gate (can be slow; set COPILOT_XS_SKIP_TESTS=1 to bypass locally)
if (process.env.COPILOT_XS_SKIP_TESTS !== '1') {
  run('npm', ['run', 'test:all']);
}
