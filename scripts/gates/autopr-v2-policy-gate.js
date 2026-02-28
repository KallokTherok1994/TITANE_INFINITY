#!/usr/bin/env node

import { execSync } from 'node:child_process';

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function main() {
  const mode = (process.env.TITANE_AUTOPR_V2_MODE || 'governed').toLowerCase();
  const allowedModes = new Set(['governed', 'disabled']);

  if (!allowedModes.has(mode)) {
    console.error(`FAIL: TITANE_AUTOPR_V2_MODE invalid: ${mode}`);
    process.exit(2);
  }

  if (mode === 'disabled') {
    console.log('PASS: AutoPR v2 disabled explicitly.');
    process.exit(0);
  }

  const branch = safeExec('git rev-parse --abbrev-ref HEAD');
  if (!branch) {
    console.error('FAIL: unable to resolve git branch.');
    process.exit(2);
  }

  const status = safeExec('git status --porcelain');
  if (!status) {
    console.error('FAIL: AutoPR v2 requires staged or working-tree changes.');
    process.exit(2);
  }

  const forbiddenPatterns = [/^\.env/, /^secrets?\//i, /^deployment\/latest\//i];
  const changedPaths = status
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.slice(3));

  const forbiddenPath = changedPaths.find(path =>
    forbiddenPatterns.some(pattern => pattern.test(path))
  );
  if (forbiddenPath) {
    console.error(`FAIL: AutoPR v2 forbidden path changed: ${forbiddenPath}`);
    process.exit(2);
  }

  console.log(`PASS: AutoPR v2 policy ok on branch ${branch}.`);
}

main();
