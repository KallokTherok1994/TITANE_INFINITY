#!/usr/bin/env node

import { execSync } from 'node:child_process';

const TARGET_FILES = [
  'src/types/remediationPermissions.ts',
  'src/engines/selfHealing/remediationPermissionsEngine.ts',
];

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  } catch {
    return '';
  }
}

function main() {
  const baseRef = process.env.REMEDIATION_GUARD_BASE_REF || 'origin/MAIN';
  safeExec(`git fetch origin MAIN --quiet`);

  const changedFilesRaw = safeExec(
    `git diff --name-only ${baseRef}...HEAD -- ${TARGET_FILES.join(' ')}`
  );

  const changedFiles = changedFilesRaw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (changedFiles.length === 0) {
    console.log('PASS: no remediation permission model changes detected.');
    process.exit(0);
  }

  const diff = safeExec(
    `git diff --unified=0 ${baseRef}...HEAD -- ${TARGET_FILES.join(' ')}`
  );
  const wideningSignals = [
    'allowedCommands',
    'allowedStores',
    'allowedStatePathPrefixes',
    'sandboxPathPrefixes',
  ];

  const hasAddedPermissions = diff
    .split('\n')
    .some(
      line =>
        line.startsWith('+') && wideningSignals.some(signal => line.includes(signal))
    );

  if (hasAddedPermissions) {
    console.error('FAIL: remediation permission widening detected.');
    console.error('Changed files:', changedFiles.join(', '));
    console.error(
      'Policy: default-deny model cannot be widened without explicit governance path.'
    );
    process.exit(2);
  }

  console.log('PASS: remediation permission files changed without widening markers.');
}

main();
