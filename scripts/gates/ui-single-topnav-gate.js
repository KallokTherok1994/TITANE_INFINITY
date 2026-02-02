#!/usr/bin/env node
/**
 * TITANE∞ vΩ.STABLE0 — GATE_UI_SINGLE_TOPNAV
 * Bloquant: assure une seule TopNav globale via tests anti-régression
 */

import { execSync } from 'child_process';

const TEST_CMD = 'pnpm -s vitest run src/__tests__/ui/ui-navigation.test.ts';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  GATE_UI_SINGLE_TOPNAV — Single Global TopNav Required   ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

try {
  execSync(TEST_CMD, { stdio: 'inherit' });
  console.log('\n✅ PASS: Single TopNav gate validated');
  process.exit(0);
} catch (error) {
  console.error('\n❌ FAIL: Single TopNav gate failed');
  process.exit(1);
}
