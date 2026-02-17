#!/usr/bin/env node

/**
 * P8 RECORD APPROVAL
 * 
 * Appends a human-approved beta distribution to the immutable BETA_APPROVAL_LOG.
 * 
 * Usage:
 *   P8_APPROVAL_TOKEN=<token> node scripts/ops/p8_record_approval.mjs
 * 
 * DOES NOT trigger distribution. Purely a logging/audit function.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../');

const LOG_PREFIX = '[P8 RECORD APPROVAL]';

/**
 * Get approver info
 */
function getApproverInfo() {
  const user = process.env.USER || 'unknown';
  const timestamp = new Date().toISOString();
  const gitUser = execSync('git config user.name', { cwd: repoRoot, encoding: 'utf8' }).trim() || user;

  return { user: gitUser || user, timestamp };
}

/**
 * Get artifact info
 */
function getArtifactInfo() {
  const latestStableDir = path.join(repoRoot, 'deployment/latest/stable');
  const appImagePath = path.join(latestStableDir, 'titane-infinity.AppImage');
  const debPath = path.join(latestStableDir, 'titan-stable.deb');

  const artifacts = {};

  if (fs.existsSync(appImagePath)) {
    const stats = fs.statSync(appImagePath);
    artifacts.appImage = {
      name: 'titane-infinity.AppImage',
      size: (stats.size / (1024 * 1024)).toFixed(1) + ' MB'
    };
  }

  if (fs.existsSync(debPath)) {
    const stats = fs.statSync(debPath);
    artifacts.deb = {
      name: 'titan-stable.deb',
      size: (stats.size / (1024 * 1024)).toFixed(1) + ' MB'
    };
  }

  return artifacts;
}

/**
 * Get git info
 */
function getGitInfo() {
  const commit = execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();

  return { commit: commit.slice(0, 8), branch };
}

/**
 * Get token hash
 */
function getTokenHash() {
  const token = process.env.P8_APPROVAL_TOKEN;

  if (!token) {
    console.error(`${LOG_PREFIX} ❌ P8_APPROVAL_TOKEN not set`);
    process.exit(1);
  }

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash.slice(0, 8);
}

/**
 * Build approval entry
 */
function buildApprovalEntry(approver, timestamp, tokenHash, gitInfo, artifacts) {
  const dateName = timestamp.replace(/[:\-]/g, '').replace('T', '_').split('Z')[0];

  let entry = `\n## P8_BETA_APPROVAL_${dateName}\n\n`;
  entry += `**Date (UTC):** ${timestamp}  \n`;
  entry += `**Approver:** ${approver}  \n`;
  entry += `**Approval Token (SHA256 hash):** ${tokenHash}  \n`;
  entry += `**Git Commit:** ${gitInfo.commit}  \n`;
  entry += `**Branch:** ${gitInfo.branch}  \n`;
  entry += `**Status:** APPROVED_FOR_DISTRIBUTION  \n\n`;

  entry += `**Artifacts Approved:**\n`;
  for (const [key, artifact] of Object.entries(artifacts)) {
    entry += `- ${artifact.name} (${artifact.size})\n`;
  }

  entry += `\n**Distribution Method:** Manual (no automatic API calls)  \n`;
  entry += `**Distribution Channels Approved:**\n`;
  entry += `- Beta tester group (pre-approved)\n`;
  entry += `- Internal secure channels\n\n`;

  entry += `**Expected Beta Duration:** 7 days  \n`;
  entry += `**Week 1 Monitoring:** Enabled (see docs/OPS_WEEK1_PLAYBOOK.md)  \n`;
  entry += `**Rollback Status:** Ready (deployment/latest/certification/phase8/*/ROLLBACK.md)  \n\n`;

  entry += `**Notes:**  \n`;
  entry += `P8 beta distribution APPROVED by human authority. See BETA_APPROVAL_LOG.md for audit trail.\n\n`;

  entry += `**Signature:** \`P8_APPROVAL_COMPLETE_${dateName}\`\n`;

  return entry;
}

/**
 * Append to log
 */
function appendToLog(entry) {
  const logFile = path.join(repoRoot, 'docs/BETA_APPROVAL_LOG.md');

  if (!fs.existsSync(logFile)) {
    console.error(`${LOG_PREFIX} ❌ BETA_APPROVAL_LOG.md not found: ${logFile}`);
    process.exit(1);
  }

  try {
    fs.appendFileSync(logFile, entry, 'utf8');
    console.log(`${LOG_PREFIX} ✅ Approval recorded to BETA_APPROVAL_LOG.md`);
    return true;
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Failed to append: ${err.message}`);
    return false;
  }
}

/**
 * Main
 */
function recordApproval() {
  console.log(`\n${LOG_PREFIX} Starting approval recording...\n`);

  try {
    const approverInfo = getApproverInfo();
    const artifacts = getArtifactInfo();
    const gitInfo = getGitInfo();
    const tokenHash = getTokenHash();

    if (Object.keys(artifacts).length === 0) {
      console.error(`${LOG_PREFIX} ❌ No artifacts found (AppImage and DEB required)`);
      process.exit(1);
    }

    const entry = buildApprovalEntry(approverInfo.user, approverInfo.timestamp, tokenHash, gitInfo, artifacts);

    console.log(`${LOG_PREFIX} Approval Details:`);
    console.log(`  Approver: ${approverInfo.user}`);
    console.log(`  Timestamp: ${approverInfo.timestamp}`);
    console.log(`  Token Hash: ${tokenHash}`);
    console.log(`  Commit: ${gitInfo.commit}`);
    console.log(`  Artifacts: ${Object.keys(artifacts).length}\n`);

    if (appendToLog(entry)) {
      console.log(`${LOG_PREFIX} ✅ APPROVAL RECORDED\n`);
      console.log(`Next steps:`);
      console.log(`1. Review the approval entry just added`);
      console.log(`2. Commit: git add docs/BETA_APPROVAL_LOG.md && git commit -m "docs: record P8 beta approval"`);
      console.log(`3. Start manual distribution (NO automatic release)\n`);
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Failed: ${err.message}`);
    process.exit(1);
  }
}

recordApproval();
