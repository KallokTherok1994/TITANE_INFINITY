#!/usr/bin/env node
/**
 * TITANE∞ Registry - Sync Verification
 * Usage: pnpm verify:registry
 *
 * Verifies that watched changes are accompanied by registry updates.
 * Fails CI if changes to tests/config/workflows/package.json without:
 * - new registry event(s)
 * - snapshot regenerated
 * - dashboard regenerated
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const EVENTS_FILE = path.resolve(ROOT_DIR, 'runtime/registry/events.jsonl');
const SNAPSHOT_FILE = path.resolve(ROOT_DIR, 'runtime/registry/snapshot.json');
const OUTDATED_FLAG = path.resolve(ROOT_DIR, '.registry-outdated');

// Patterns that require registry update
const WATCHED_PATTERNS = [
  'src/**/*.test.ts',
  'src/**/*.test.tsx',
  'src/**/*.spec.ts',
  'src/**/*.spec.tsx',
  'tests/**/*.test.ts',
  'tests/**/*.test.tsx',
  'e2e/**/*.spec.ts',
  'e2e/**/*.test.ts',
  'e2e/**/*.test.js',
  'vitest*.config.ts',
  'playwright.config.ts',
  'wdio.conf.js',
  '.github/workflows/*.yml',
];

function getGitDiff() {
  try {
    // Get changed files compared to HEAD~1 or origin/MAIN
    const diff = execSync(
      'git diff --name-only HEAD~1 2>/dev/null || git diff --name-only origin/MAIN',
      {
        cwd: ROOT_DIR,
        encoding: 'utf8',
      }
    );
    return diff.trim().split('\n').filter(Boolean);
  } catch (e) {
    // Fallback: get staged files
    try {
      const staged = execSync('git diff --cached --name-only', {
        cwd: ROOT_DIR,
        encoding: 'utf8',
      });
      return staged.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
}

function matchesPattern(file, pattern) {
  // Simple glob matching
  const regex = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\./g, '\\.');
  return new RegExp(`^${regex}$`).test(file);
}

function verify() {
  console.log('📋 TITANE∞ Registry Sync Verification\n');

  // Check registry files exist
  if (!fs.existsSync(EVENTS_FILE)) {
    console.error('❌ Registry events.jsonl not found');
    console.error(
      '   Run: pnpm registry:log -- --type=REGISTRY_INIT --desc="Initialize registry"'
    );
    fs.writeFileSync(OUTDATED_FLAG, 'Registry not initialized');
    process.exit(1);
  }

  if (!fs.existsSync(SNAPSHOT_FILE)) {
    console.error('❌ Registry snapshot.json not found');
    console.error('   Run: pnpm registry:snapshot');
    fs.writeFileSync(OUTDATED_FLAG, 'Snapshot not found');
    process.exit(1);
  }

  // Get changed files
  const changedFiles = getGitDiff();
  console.log(`📂 Changed files: ${changedFiles.length}`);

  // Find watched files that changed
  const watchedChanges = changedFiles.filter(file =>
    WATCHED_PATTERNS.some(pattern => matchesPattern(file, pattern))
  );

  if (watchedChanges.length === 0) {
    console.log('✅ No watched files changed - registry sync not required');
    if (fs.existsSync(OUTDATED_FLAG)) {
      fs.unlinkSync(OUTDATED_FLAG);
    }
    process.exit(0);
  }

  console.log(`\n⚠️ Watched files changed (${watchedChanges.length}):`);
  watchedChanges.forEach(f => console.log(`   - ${f}`));

  const required = [
    'runtime/registry/events.jsonl',
    'runtime/registry/snapshot.json',
    'runtime/registry/dashboard.md',
  ];
  const missing = required.filter(r => !changedFiles.includes(r));
  if (missing.length === 0) {
    console.log('\n✅ Registry artifacts updated (events + snapshot + dashboard)');
    if (fs.existsSync(OUTDATED_FLAG)) fs.unlinkSync(OUTDATED_FLAG);
    process.exit(0);
  }

  // Registry not updated!
  const errorMsg = [
    'Registry not updated for code changes:',
    ...watchedChanges.map(f => `  - ${f}`),
    '',
    'Fix: mettre à jour le registre (event + snapshot + dashboard):',
    '  pnpm registry:log -- --type=WORKFLOW_CHANGED --cycleId=<...> --attempt=1 --severity=MEDIUM --impact=CI --owner=<...> --priority=P1 --desc="..." --next="..." --files="..."',
    '  pnpm registry:snapshot',
    '  pnpm registry:dashboard',
    '',
    `Missing required file updates: ${missing.join(', ')}`,
  ].join('\n');

  console.error(`\n❌ GATE_REGISTRY: FAIL\n\n${errorMsg}`);
  fs.writeFileSync(OUTDATED_FLAG, errorMsg);
  process.exit(1);
}

verify();
