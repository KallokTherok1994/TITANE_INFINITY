#!/usr/bin/env node

/**
 * TITANE∞ — Vite Base Relative Gate
 * 
 * Purpose: Ensure production build uses relative asset paths (./assets/...)
 * to avoid breaking AppImage/DEB boot in file:// Tauri runtime.
 * 
 * Criteria:
 *   PASS: dist/index.html contains "./assets/" AND NOT "/assets/"
 *   FAIL: dist/index.html contains "/assets/" OR missing dist/index.html
 * 
 * Protocol: vΩ.1 — FIX_PROD_BOOT_LOOP
 */

const fs = require('fs');
const path = require('path');

const DIST_INDEX = path.join(process.cwd(), 'dist', 'index.html');
const TIMEOUT_MS = 5000;

function main() {
  console.log('🔍 [GATE] Vite Base Relative — Checking production assets...\n');

  // Check if dist/index.html exists
  if (!fs.existsSync(DIST_INDEX)) {
    console.error(`❌ FAIL: ${DIST_INDEX} not found`);
    console.error('   Run: pnpm run build');
    process.exit(1);
  }

  try {
    const htmlContent = fs.readFileSync(DIST_INDEX, 'utf-8');

    // Check for absolute asset paths (FAIL condition)
    const hasAbsoluteAssets = htmlContent.includes('"/assets/');
    
    // Check for relative asset paths (PASS condition)
    const hasRelativeAssets = htmlContent.includes('"./assets/');

    console.log('Results:');
    console.log(`  Absolute "/assets/": ${hasAbsoluteAssets ? '❌ FOUND' : '✓ Not found'}`);
    console.log(`  Relative "./assets/": ${hasRelativeAssets ? '✓ Found' : '❌ NOT FOUND'}`);

    if (hasAbsoluteAssets) {
      console.error('\n❌ FAIL: Found absolute asset paths!');
      console.error('   This will break AppImage/DEB boots in file:// Tauri runtime.');
      console.error('   Fix: Ensure vite.config.ts uses base: "./" for production builds.');
      process.exit(1);
    }

    if (!hasRelativeAssets) {
      console.error('\n❌ FAIL: No relative asset paths found!');
      console.error('   Expected: ./assets/...');
      console.error('   Check vite.config.ts for build configuration.');
      process.exit(1);
    }

    console.log('\n✅ PASS: Production assets are correctly relative (./assets/)');
    console.log('   AppImage/DEB boot will work correctly.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error reading ${DIST_INDEX}:`, error.message);
    process.exit(1);
  }
}

main();
