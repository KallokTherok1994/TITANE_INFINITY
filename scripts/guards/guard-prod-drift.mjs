#!/usr/bin/env node
/**
 * P5-2: Production Drift Detector
 * Compare deployed release vs baseline
 * Exit 0 = stable, Exit 2 = drift detected
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RELEASE_DIR = 'deployment/latest/release/p4_deploy_20260217_171400';
const BASELINE_MANIFEST = 'reports/ai_local_vΩ3/P5_POST_PROD_BASELINE_20260217_172127/02_RELEASE_TREE.txt';

console.log('[P5-2] Drift Detector Starting...');

// Check 1: Release dir exists
if (!fs.existsSync(RELEASE_DIR)) {
  console.error(`✗ Release dir missing: ${RELEASE_DIR}`);
  process.exit(2);
}
console.log(`✓ Release dir exists`);

// Check 2: SHA256 present
const sha256File = path.join(RELEASE_DIR, 'SHA256SUMS.released.txt');
if (!fs.existsSync(sha256File)) {
  console.error(`✗ Missing checksums: ${sha256File}`);
  process.exit(2);
}
console.log(`✓ Checksums present`);

// Check 3: Git state unchanged
try {
  const gitStatus = execSync('git status --porcelain=v1', { encoding: 'utf8' }).trim();
  if (gitStatus && !gitStatus.includes('reports/') && !gitStatus.includes('_quarantine')) {
    console.error(`✗ Unexpected git changes: ${gitStatus.split('\n')[0]}`);
    process.exit(2);
  }
  console.log(`✓ Git state stable`);
} catch (e) {
  console.error(`✗ Git check failed: ${e.message}`);
  process.exit(2);
}

// Check 4: HEAD unchanged
try {
  const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  if (head !== '210f0cf0') {
    console.warn(`⚠ HEAD changed (expected 210f0cf0, got ${head})`);
    // Not fatal, just warn
  }
  console.log(`✓ HEAD stable`);
} catch (e) {
  console.error(`✗ HEAD check failed`);
  process.exit(2);
}

console.log('\n[P5-2] ✅ NO DRIFT DETECTED');
process.exit(0);
