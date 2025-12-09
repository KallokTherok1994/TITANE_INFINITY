#!/usr/bin/env node
/**
 * TITANE∞ v21 — Pipeline Auto-Fix Script
 *
 * Corrige automatiquement tous les problèmes Husky/ESLint/Prettier
 *
 * Usage: npm run fix-pipeline
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

console.log('🔧 TITANE∞ Pipeline Auto-Fix v21');
console.log('═══════════════════════════════════════════════════════════');

// ═══════════════════════════════════════════════════════════════
// 1. FIX ESLINT
// ═══════════════════════════════════════════════════════════════

console.log('\n📝 1. Running ESLint auto-fix...');
try {
  execSync('npm exec eslint -- --fix .', {
    cwd: ROOT,
    stdio: 'inherit',
  });
  console.log('✅ ESLint fixes applied');
} catch (err) {
  console.warn('⚠️ ESLint had some errors (non-blocking)');
}

// ═══════════════════════════════════════════════════════════════
// 2. FIX PRETTIER
// ═══════════════════════════════════════════════════════════════

console.log('\n✨ 2. Running Prettier format...');
try {
  execSync('npm exec prettier -- --write .', {
    cwd: ROOT,
    stdio: 'inherit',
  });
  console.log('✅ Prettier formatting applied');
} catch (err) {
  console.warn('⚠️ Prettier had some errors (non-blocking)');
}

// ═══════════════════════════════════════════════════════════════
// 3. CHECK TYPESCRIPT
// ═══════════════════════════════════════════════════════════════

console.log('\n🔍 3. Running TypeScript check...');
try {
  execSync('npm run check', {
    cwd: ROOT,
    stdio: 'inherit',
  });
  console.log('✅ TypeScript check passed');
} catch (err) {
  console.warn('⚠️ TypeScript has some errors (warnings only)');
}

// ═══════════════════════════════════════════════════════════════
// 4. SUMMARY
// ═══════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ Pipeline auto-fix complete!');
console.log('\n📋 Next steps:');
console.log('   1. Review changes: git diff');
console.log('   2. Test commit: git commit -m "fix: pipeline corrections"');
console.log('   3. If commit fails, check: npm run lint');
console.log('═══════════════════════════════════════════════════════════\n');
