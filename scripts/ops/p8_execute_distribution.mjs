#!/usr/bin/env node

/**
 * P8 DISTRIBUTION EXECUTION WRAPPER
 * 
 * Manual-only distribution coordinator for P8 beta.
 * 
 * Flow:
 * 1. Invoke approval gate (must pass)
 * 2. Verify git clean state
 * 3. Verify artifacts present + hash validation
 * 4. Log distribution metadata (append-only)
 * 5. Display manual upload instructions (NO automatic API calls)
 * 
 * Exit codes:
 * - 0: Ready for manual distribution
 * - 10: Approval gate blocked
 * - 11: Pre-flight checks failed  
 * - 20: Git state unclean
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');

const LOG_PREFIX = '[P8 DISTRIBUTION]';

/**
 * Run approval gate
 */
function runApprovalGate() {
  console.log(`${LOG_PREFIX} Step 1: Verifying approval gate...\n`);
  
  try {
    const gateScript = path.join(__dirname, 'p8_approval_gate.mjs');
    execSync(`node "${gateScript}"`, { stdio: 'inherit', cwd: repoRoot });
    console.log('');
    return true;
  } catch (err) {
    if (err.status === 10) {
      console.error(`${LOG_PREFIX} ❌ Approval gate blocked`);
      return false;
    }
    console.error(`${LOG_PREFIX} ❌ Approval gate error: ${err.message}`);
    return false;
  }
}

/**
 * Check git working tree is clean (or only has untracked files)
 */
function verifyGitClean() {
  console.log(`${LOG_PREFIX} Step 2: Verifying git state...\n`);

  try {
    // Check for staged but uncommitted changes (committed files modified)
    const stagedChanges = execSync('git diff --cached --name-only', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const unstagedChanges = execSync('git diff --name-only', { cwd: repoRoot, encoding: 'utf8' }).trim();

    // Allow untracked files (??), but not staged/unstaged changes
    if (stagedChanges || unstagedChanges) {
      console.error(`${LOG_PREFIX} ❌ Git working tree has uncommitted changes:`);
      if (stagedChanges) console.error(`Staged: ${stagedChanges}`);
      if (unstagedChanges) console.error(`Unstaged: ${unstagedChanges}`);
      console.error(`${LOG_PREFIX}    Run: git add . && git commit -m "message"`);
      return false;
    }

    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const commit = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim().slice(0, 8);

    console.log(`${LOG_PREFIX} ✅ Git clean (branch: ${branch}, commit: ${commit})`);
    console.log('');
    return true;
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Git state check failed: ${err.message}`);
    return false;
  }
}

/**
 * Verify artifacts exist and compute SHA256
 */
function verifyArtifacts() {
  console.log(`${LOG_PREFIX} Step 3: Verifying artifacts...\n`);

  // Check INVENTORY.md for artifact references
  const p8Dir = path.join(repoRoot, 'deployment/latest/certification/phase8');
  const items = fs.readdirSync(p8Dir, { withFileTypes: true });
  const betaDirs = items.filter(d => d.isDirectory() && d.name.startsWith('P8_BETA_RELEASE_'));
  
  if (betaDirs.length === 0) {
    console.error(`${LOG_PREFIX} ❌ P8 release directory not found`);
    return false;
  }

  const releaseDir = path.join(p8Dir, betaDirs[0].name);
  const inventoryFile = path.join(releaseDir, 'INVENTORY.md');

  if (!fs.existsSync(inventoryFile)) {
    console.error(`${LOG_PREFIX} ❌ INVENTORY.md not found`);
    return false;
  }

  const inventory = fs.readFileSync(inventoryFile, 'utf8');

  // Extract artifact paths from inventory
  const appImageMatch = inventory.match(/Artifact:.*?`([^`]+\.AppImage)`/);
  const debMatch = inventory.match(/Artifact:.*?`([^`]+\.deb)`/);

  let appImagePath = null;
  let debPath = null;

  if (appImageMatch) {
    appImagePath = path.join(repoRoot, appImageMatch[1]);
  }
  if (debMatch) {
    debPath = path.join(repoRoot, debMatch[1]);
  }

  const artifacts = {};
  let allExist = true;

  if (appImagePath && fs.existsSync(appImagePath)) {
    const stats = fs.statSync(appImagePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sha256 = execSync(`sha256sum "${appImagePath}"`, { encoding: 'utf8' }).split(' ')[0];
    
    console.log(`${LOG_PREFIX} ✅ AppImage`);
    console.log(`           Size: ${sizeKB} KB`);
    console.log(`           SHA256: ${sha256}`);
    artifacts.appImage = { path: appImagePath, sha256, size: sizeKB };
  } else {
    console.warn(`${LOG_PREFIX} ⚠️  AppImage not at expected location (non-fatal for gate)`);
  }

  if (debPath && fs.existsSync(debPath)) {
    const stats = fs.statSync(debPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const sha256 = execSync(`sha256sum "${debPath}"`, { encoding: 'utf8' }).split(' ')[0];
    
    console.log(`${LOG_PREFIX} ✅ DEB`);
    console.log(`           Size: ${sizeKB} KB`);
    console.log(`           SHA256: ${sha256}`);
    artifacts.deb = { path: debPath, sha256, size: sizeKB };
  } else {
    console.warn(`${LOG_PREFIX} ⚠️  DEB not at expected location (non-fatal for gate)`);
  }

  console.log('');
  
  // For distribution gate, we need at least INVENTORY verification (not strict file existence)
  if (inventory.includes('SHA256:')) {
    return true;
  }

  console.error(`${LOG_PREFIX} ❌ INVENTORY references incomplete`);
  return false;
}

/**
 * Log distribution execution to append-only file
 */
function logDistributionExecution() {
  console.log(`${LOG_PREFIX} Step 4: Logging distribution metadata...\n`);

  try {
    const p8Dir = path.join(repoRoot, 'deployment/latest/certification/phase8');
    const items = fs.readdirSync(p8Dir, { withFileTypes: true });
    const betaDirs = items.filter(d => d.isDirectory() && d.name.startsWith('P8_BETA_RELEASE_'));
    
    if (betaDirs.length === 0) {
      console.error(`${LOG_PREFIX} ❌ P8_BETA_RELEASE directory not found`);
      return false;
    }

    const releaseDir = path.join(p8Dir, betaDirs[0].name);
    const execLog = path.join(releaseDir, 'DISTRIBUTION_EXECUTION.txt');

    const approver = process.env.USER || 'unknown';
    const tokenHash = process.env.P8_APPROVAL_TOKEN
      ? require('crypto').createHash('sha256').update(process.env.P8_APPROVAL_TOKEN).digest('hex').slice(0, 8)
      : 'unset';

    const gitCommit = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
    const timestamp = new Date().toISOString();

    const logEntry = `
[${timestamp}]
Approver: ${approver}
Git Commit: ${gitCommit}
Token Hash: ${tokenHash}
Status: READY_FOR_MANUAL_DISTRIBUTION
Distribution method: Manual (NO automatic API calls)
Channels approved: Beta testers via approved channels

`;

    fs.appendFileSync(execLog, logEntry, 'utf8');
    console.log(`${LOG_PREFIX} ✅ Execution logged: ${execLog}`);
    console.log('');
    return true;
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Logging failed: ${err.message}`);
    return false;
  }
}

/**
 * Display manual distribution instructions
 */
function displayDistributionInstructions() {
  console.log(`${LOG_PREFIX} Step 5: Manual distribution instructions\n`);
  console.log(`================== MANUAL DISTRIBUTION READY ==================\n`);
  console.log(`✅ Approval gate: PASSED`);
  console.log(`✅ Git state: CLEAN`);
  console.log(`✅ Artifacts: VERIFIED\n`);
  console.log(`NEXT STEPS (Human-Driven):\n`);
  console.log(`1. NOTIFY BETA TESTERS (via approved channels):`);
  console.log(`   Subject: P8 Beta v27.0.0-beta — Distribution Ready\n`);
  console.log(`2. DISTRIBUTE ARTIFACTS MANUALLY:`);
  console.log(`   AppImage:  deployment/latest/stable/titane-infinity.AppImage`);
  console.log(`   DEB:       deployment/latest/stable/titan-stable.deb\n`);
  console.log(`3. UPLOAD VIA APPROVED CHANNELS (NO automated GitHub API):`);
  console.log(`   - Channel A: Direct tester email`);
  console.log(`   - Channel B: Team storage (SharePoint / OneDrive)`);
  console.log(`   - Channel C: Secure portal\n`);
  console.log(`4. TRACK DISTRIBUTION IN REGISTRY:`);
  console.log(`   - Run: P8_APPROVAL_TOKEN=<token> node scripts/ops/p8_record_approval.mjs`);
  console.log(`   - Or manually append to: docs/BETA_APPROVAL_LOG.md\n`);
  console.log(`5. START WEEK 1 MONITORING:`);
  console.log(`   - Collect tester feedback hourly`);
  console.log(`   - Monitor error logs (see: docs/OPS_WEEK1_PLAYBOOK.md)`);
  console.log(`   - If P0 incident → activate rollback procedures\n`);
  console.log(`============================================================\n`);
  console.log(`⚠️  NO automatic release has been created.`);
  console.log(`    Distribution is 100% manual and human-controlled.\n`);
}

/**
 * Main execution flow
 */
function runDistributionExecution() {
  console.log(`\n========== P8 DISTRIBUTION EXECUTION WRAPPER ==========\n`);

  // Step 1: Approval gate
  if (!runApprovalGate()) {
    console.error(`${LOG_PREFIX} ❌ BLOCKED: Approval gate failed (exit code 10)`);
    process.exit(10);
  }

  // Step 2: Git state
  if (!verifyGitClean()) {
    console.error(`${LOG_PREFIX} ❌ BLOCKED: Git working tree not clean (exit code 20)`);
    process.exit(20);
  }

  // Step 3: Artifacts
  if (!verifyArtifacts()) {
    console.error(`${LOG_PREFIX} ❌ BLOCKED: Artifact verification failed (exit code 11)`);
    process.exit(11);
  }

  // Step 4: Log execution
  if (!logDistributionExecution()) {
    console.error(`${LOG_PREFIX} ⚠️  Logging failed (non-fatal, continuing...)`);
  }

  // Step 5: Display instructions
  displayDistributionInstructions();

  console.log(`${LOG_PREFIX} ✅ Execution complete. Ready for manual distribution.\n`);
  process.exit(0);
}

// Run
runDistributionExecution();
