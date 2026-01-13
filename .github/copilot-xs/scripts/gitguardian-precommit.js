#!/usr/bin/env node

/**
 * TITANE∞ — GitGuardian pre-commit hook
 * Creator: Kevin Thibault
 * Generated/maintained with GitHub Copilot (GPT-5.2)
 * License: governed by repository LICENSE.md
 * 
 * This script runs GitGuardian secret scanning on staged files before commit.
 * Set COPILOT_XS_SKIP_GITGUARDIAN=1 to bypass GitGuardian scanning locally.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS
        ? `${process.env.NODE_OPTIONS} --no-deprecation`
        : '--no-deprecation',
    },
    ...options,
  });

  // Command not found
  if (result.error && result.error.code === 'ENOENT') {
    return { ok: false, reason: 'not-found' };
  }

  if (result.status !== 0) {
    return { ok: false, status: result.status ?? 1 };
  }

  return { ok: true };
}

function checkGitGuardianInstalled() {
  // Check if ggshield is installed
  const result = spawnSync('which', ['ggshield'], {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  return result.status === 0;
}

function installGitGuardian() {
  console.log('🔐 GitGuardian not found. Attempting to install ggshield...');
  
  // Try to install via pip
  const pipInstall = run('pip3', ['install', '--user', 'ggshield'], { stdio: 'inherit' });
  
  if (!pipInstall.ok && pipInstall.reason === 'not-found') {
    // Try pip without version suffix
    const pipInstall2 = run('pip', ['install', '--user', 'ggshield'], { stdio: 'inherit' });
    
    if (!pipInstall2.ok) {
      console.warn('⚠️ Could not install ggshield. Skipping GitGuardian scan.');
      console.warn('To install manually, run: pip install ggshield');
      return false;
    }
  }
  
  console.log('✅ GitGuardian ggshield installed successfully');
  return true;
}

// Skip if explicitly disabled
if (process.env.COPILOT_XS_SKIP_GITGUARDIAN === '1') {
  console.log('⏭️ GitGuardian scan skipped (COPILOT_XS_SKIP_GITGUARDIAN=1)');
  process.exit(0);
}

// Check if .gitguardian.yml config exists
if (!existsSync('.gitguardian.yml')) {
  console.warn('⚠️ .gitguardian.yml not found. GitGuardian will use default configuration.');
}

// Check if GitGuardian is installed
if (!checkGitGuardianInstalled()) {
  const installed = installGitGuardian();
  if (!installed) {
    console.warn('⚠️ GitGuardian scan skipped: ggshield not installed');
    console.warn('   Set COPILOT_XS_SKIP_GITGUARDIAN=1 to suppress this warning');
    // Don't fail the commit if GitGuardian is not installed
    process.exit(0);
  }
}

// Run GitGuardian scan on pre-commit
console.log('🔐 Running GitGuardian secret scan on staged files...');

const scanResult = run('ggshield', ['secret', 'scan', 'pre-commit']);

if (!scanResult.ok) {
  if (scanResult.reason === 'not-found') {
    console.error('❌ GitGuardian ggshield not found in PATH');
    console.error('   Install with: pip install ggshield');
    console.error('   Or skip with: COPILOT_XS_SKIP_GITGUARDIAN=1');
    // Don't fail commit if tool is not found
    process.exit(0);
  } else {
    console.error('❌ GitGuardian detected secrets in staged files!');
    console.error('   Please remove secrets before committing.');
    console.error('   See output above for details.');
    console.error('');
    console.error('   To bypass (NOT RECOMMENDED): COPILOT_XS_SKIP_GITGUARDIAN=1 git commit');
    process.exit(scanResult.status);
  }
}

console.log('✅ GitGuardian scan passed - no secrets detected');
process.exit(0);
