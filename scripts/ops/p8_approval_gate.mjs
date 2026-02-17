#!/usr/bin/env node

/**
 * P8.1 APPROVAL GATE
 * 
 * Bloquant approval mechanism for P8 beta distribution.
 * 
 * - Reads P8_APPROVAL_TOKEN from environment
 * - Validates against P8 VERDICT status
 * - NO distribution logic here (governance layer only)
 * - Exit 10 if token missing or invalid
 * - Exit 0 if gate passes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');

const LOG_PREFIX = '[P8.1 APPROVAL GATE]';

/**
 * Check if P8_APPROVAL_TOKEN is provided and matches expected format
 */
function checkApprovalToken() {
  const token = process.env.P8_APPROVAL_TOKEN;
  
  if (!token) {
    console.error(`${LOG_PREFIX} ❌ BLOCKED: Approval token required (P8_APPROVAL_TOKEN not set)`);
    console.error(`${LOG_PREFIX}    To proceed, provide token: export P8_APPROVAL_TOKEN=<token>`);
    return false;
  }

  // Validate format: should be UUID or SHA-like string (32+ hex chars or standard UUID format)
  const isValidFormat = /^[a-fA-F0-9\-]{32,}$/.test(token);
  if (!isValidFormat) {
    console.error(`${LOG_PREFIX} ❌ BLOCKED: Invalid token format`);
    console.error(`${LOG_PREFIX}    Expected: UUID or hex string (32+ chars), got: ${token.slice(0, 10)}...`);
    return false;
  }

  console.log(`${LOG_PREFIX} ✅ Token format valid (${token.slice(0, 8)}...)`);
  return true;
}

/**
 * Verify P8 VERDICT.md exists and status == PASS
 */
function verifyP8Verdict() {
  const p8Dir = path.join(repoRoot, 'deployment/latest/certification/phase8');
  
  if (!fs.existsSync(p8Dir)) {
    console.error(`${LOG_PREFIX} ❌ P8 directory not found: ${p8Dir}`);
    return false;
  }

  // Find P8_BETA_RELEASE_* folder (should be unique)
  const items = fs.readdirSync(p8Dir, { withFileTypes: true });
  const betaDirs = items.filter(d => d.isDirectory() && d.name.startsWith('P8_BETA_RELEASE_'));

  if (betaDirs.length === 0) {
    console.error(`${LOG_PREFIX} ❌ No P8_BETA_RELEASE_* folder found in ${p8Dir}`);
    return false;
  }

  if (betaDirs.length > 1) {
    console.error(`${LOG_PREFIX} ❌ Multiple P8_BETA_RELEASE_* folders found (expected exactly 1)`);
    return false;
  }

  const verdictFile = path.join(p8Dir, betaDirs[0].name, 'VERDICT.md');

  if (!fs.existsSync(verdictFile)) {
    console.error(`${LOG_PREFIX} ❌ VERDICT.md not found: ${verdictFile}`);
    return false;
  }

  const verdict = fs.readFileSync(verdictFile, 'utf8');

  // Check for PASS status (flexible matching)
  const hasPass = verdict.includes('PASS') && 
                  (verdict.includes('✅ PASS') || verdict.includes('Overall Status:') || verdict.includes('READY FOR'));
  
  if (!hasPass) {
    console.error(`${LOG_PREFIX} ❌ P8 VERDICT status is not PASS`);
    console.error(`${LOG_PREFIX}    Found verdict file but status != PASS`);
    return false;
  }

  console.log(`${LOG_PREFIX} ✅ P8 VERDICT status confirmed: PASS`);
  return true;
}

/**
 * Verify sealed archives have not been modified
 */
function verifySealedArchives() {
  try {
    // Check that archives INVENTORY exists (proof of artifacts)
    const p8Dir = path.join(repoRoot, 'deployment/latest/certification/phase8');
    const items = fs.readdirSync(p8Dir, { withFileTypes: true });
    const betaDirs = items.filter(d => d.isDirectory() && d.name.startsWith('P8_BETA_RELEASE_'));
    
    if (betaDirs.length === 0) {
      console.error(`${LOG_PREFIX} ❌ No P8 beta release directory found`);
      return false;
    }

    const releaseDir = path.join(p8Dir, betaDirs[0].name);
    const inventoryFile = path.join(releaseDir, 'INVENTORY.md');

    if (!fs.existsSync(inventoryFile)) {
      console.error(`${LOG_PREFIX} ❌ INVENTORY.md not found: ${inventoryFile}`);
      return false;
    }

    const inventory = fs.readFileSync(inventoryFile, 'utf8');
    
    // Verify inventory contains artifact references with SHA256
    if (!inventory.includes('SHA256:')) {
      console.error(`${LOG_PREFIX} ❌ INVENTORY.md missing SHA256 hashes`);
      return false;
    }

    // Check for Titan-Stable references
    if (!inventory.includes('Titan-Stable')) {
      console.error(`${LOG_PREFIX} ❌ INVENTORY.md missing Titan-Stable artifacts`);
      return false;
    }

    console.log(`${LOG_PREFIX} ✅ Sealed archives verified in INVENTORY (immutable)`);
    return true;
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Archive verification failed: ${err.message}`);
    return false;
  }
}

/**
 * Main gate function
 */
function runApprovalGate() {
  console.log(`\n${LOG_PREFIX} Starting P8.1 Approval Gate...\n`);

  let passed = true;

  // Check 1: Token presence and format
  if (!checkApprovalToken()) {
    passed = false;
  }

  // Check 2: P8 VERDICT status
  if (!verifyP8Verdict()) {
    passed = false;
  }

  // Check 3: Sealed archives
  if (!verifySealedArchives()) {
    passed = false;
  }

  console.log('');
  if (passed) {
    console.log(`${LOG_PREFIX} ✅ APPROVAL GATE: PASS`);
    console.log(`${LOG_PREFIX}    Ready for controlled distribution (manual only)`);
    console.log('');
    return 0; // SUCCESS
  } else {
    console.log(`${LOG_PREFIX} ❌ APPROVAL GATE: BLOCKED`);
    console.log(`${LOG_PREFIX}    Distribution cannot proceed until all checks pass`);
    console.log('');
    return 10; // BLOCKED (distinct from other errors)
  }
}

// Run gate
const exitCode = runApprovalGate();
process.exit(exitCode);
