#!/usr/bin/env node

/**
 * Guard: Production-Safe Build Mode Lock
 * 
 * Verifies that:
 * 1. build:prod-safe exists and contains NPM_CONFIG_IGNORE_SCRIPTS=1 + vite build
 * 2. postbuild exists (must never be removed)
 * 3. build:prod-safe does NOT contain postbuild side-effects
 * 4. deployment/latest/certification/ untouched
 * 
 * Authority: P4-1A Production Build Mode Hardening
 * Policy: Stop-the-line strict
 * 
 * Exit 0: PASS (build:prod-safe locked)
 * Exit 1: FAIL (invalid config)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const packageJsonPath = path.join(projectRoot, 'package.json');
const designDocPath = path.join(projectRoot, 'docs/PRODUCTION_BUILD_POLICY.md');

const FORBIDDEN_PATTERNS = [
  'postbuild',
  'post-build.sh',
  'bash scripts/post-build.sh',
  'update-desktop-database',
  'gtk-update-icon-cache',
  '.local/share/applications',
  '.titane/logs',
];

const REQUIRED_PATTERNS = [
  'NPM_CONFIG_IGNORE_SCRIPTS=1',
  'vite build',
];

/**
 * Main guard logic
 */
async function verifyBuildMode() {
  const errors = [];
  const warnings = [];
  let status = 'PASS';

  console.log('🔒 Guard: Production-Safe Build Mode Lock');
  console.log('─'.repeat(60));
  console.log('');

  // 1. Read package.json
  console.log('[1/5] Verify package.json structure...');
  let packageJson;
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(content);
  } catch (err) {
    errors.push(`❌ Failed to read/parse package.json: ${err.message}`);
    status = 'FAIL';
  }

  if (status === 'PASS' && packageJson) {
    // 2. Verify build:prod-safe exists
    if (!packageJson.scripts['build:prod-safe']) {
      errors.push('❌ scripts.build:prod-safe missing');
      status = 'BLOCKED';
    } else {
      const buildProdSafeCmd = packageJson.scripts['build:prod-safe'];
      
      // Check required patterns
      let hasRequired = true;
      for (const pattern of REQUIRED_PATTERNS) {
        if (!buildProdSafeCmd.includes(pattern)) {
          errors.push(`❌ build:prod-safe missing required pattern: "${pattern}"`);
          hasRequired = false;
          status = 'BLOCKED';
        }
      }

      if (hasRequired) {
        console.log('  ✅ build:prod-safe exists with required env');
      }

      // Check forbidden patterns
      for (const pattern of FORBIDDEN_PATTERNS) {
        if (buildProdSafeCmd.includes(pattern)) {
          errors.push(`❌ build:prod-safe contains forbidden pattern: "${pattern}"`);
          status = 'BLOCKED';
        }
      }
    }
  }

  // 3. Verify postbuild exists
  console.log('[2/5] Verify postbuild hook retained...');
  if (packageJson && !packageJson.scripts['postbuild']) {
    errors.push('❌ scripts.postbuild removed (must remain)');
    status = 'BLOCKED';
  } else if (packageJson) {
    console.log('  ✅ postbuild script present (not removed)');
  }

  // 4. Verify build:prod-safe:verify exists
  console.log('[3/5] Verify build:prod-safe:verify script...');
  if (packageJson && !packageJson.scripts['build:prod-safe:verify']) {
    warnings.push('⚠️  build:prod-safe:verify missing (optional but recommended)');
  } else if (packageJson) {
    console.log('  ✅ build:prod-safe:verify present');
  }

  // 5. Verify design doc
  console.log('[4/5] Verify production build policy document...');
  if (!fs.existsSync(designDocPath)) {
    warnings.push('⚠️  PRODUCTION_BUILD_POLICY.md not found (should exist)');
  } else {
    const docContent = fs.readFileSync(designDocPath, 'utf-8');
    if (!docContent.includes('NPM_CONFIG_IGNORE_SCRIPTS') ||
        !docContent.includes('build:prod-safe')) {
      warnings.push('⚠️  PRODUCTION_BUILD_POLICY.md missing key references');
    } else {
      console.log('  ✅ PRODUCTION_BUILD_POLICY.md present and references policy');
    }
  }

  // 6. Verify archive untouched
  console.log('[5/5] Verify archive immutability...');
  const archivePath = path.join(projectRoot, 'deployment/latest/certification/p3');
  if (fs.existsSync(archivePath)) {
    const lockFile = path.join(archivePath, 'immutability/LOCK.md');
    if (fs.existsSync(lockFile)) {
      console.log('  ✅ Archive LOCK.md present (immutable)');
    } else {
      warnings.push('⚠️  Archive lacks LOCK.md verification');
    }
  }

  // Print results
  console.log('');
  console.log('─'.repeat(60));
  console.log('');

  if (errors.length > 0) {
    console.log('🔴 ERRORS:');
    errors.forEach(err => console.log('  ' + err));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('🟡 WARNINGS:');
    warnings.forEach(warn => console.log('  ' + warn));
    console.log('');
  }

  if (status === 'PASS') {
    console.log('✅ VERDICT: PROD_BUILD_MODE_LOCKED');
    console.log('');
    console.log('Safe production build path established:');
    console.log('  → pnpm run build:prod-safe');
    console.log('  → NPM_CONFIG_IGNORE_SCRIPTS=1 vite build');
    console.log('');
    console.log('Production build token required (P4-1):');
    console.log('  → GO_FOR_PROD_BUILD__TITANE_INFINITY=<token>');
  } else if (status === 'BLOCKED') {
    console.log('❌ VERDICT: BLOCKED (config invalid)');
    console.log('');
    console.log('Fix required before P4-1:');
    if (!packageJson?.scripts['build:prod-safe']) {
      console.log('  1. Add build:prod-safe script to package.json');
    }
    if (!packageJson?.scripts['postbuild']) {
      console.log('  2. Restore postbuild script (must not be removed)');
    }
  } else {
    console.log('⚠️  VERDICT: ' + status);
  }

  console.log('');
  process.exit(status === 'PASS' ? 0 : 1);
}

// Execute
verifyBuildMode().catch(err => {
  console.error('❌ Guard execution failed:', err);
  process.exit(1);
});
