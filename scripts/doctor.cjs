#!/usr/bin/env node

/**
 * TITANE∞ — Doctor Script vΩ
 * Vérifie la toolchain pour un environnement déterministe
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TOOLS_NODE_BIN = path.join(PROJECT_ROOT, '.tools', 'node', 'current', 'bin');

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  const prefix = {
    info: 'ℹ',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };
  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

function checkCommand(command, description) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`${description}: OK`, 'success');
    return { ok: true, output: output.trim() };
  } catch (error) {
    log(`${description}: FAILED`, 'error');
    return { ok: false, error: error.message };
  }
}

function checkPath(paths, description) {
  const found = paths.some(p => fs.existsSync(p));
  if (found) {
    log(`${description}: OK`, 'success');
    return { ok: true };
  } else {
    log(`${description}: MISSING`, 'error');
    return { ok: false };
  }
}

console.log('🔧 TITANE∞ — Doctor Check\n');

let allOk = true;

// 1. Node.js
const nodeCheck = checkCommand('node --version', 'Node.js');
if (!nodeCheck.ok) allOk = false;

// 2. PATH .tools
const pathTools = checkPath(
  [TOOLS_NODE_BIN],
  'Repo Node toolchain (.tools/node/current/bin)'
);
if (!pathTools.ok) {
  log('  → Add to PATH: export PATH="$PWD/.tools/node/current/bin:$PATH"', 'warning');
}

// 3. Corepack (optionnel si pnpm fonctionne)
const corepackCheck = checkCommand('corepack --version', 'Corepack');
if (!corepackCheck.ok) {
  log('Corepack not available, but pnpm works - OK', 'warning');
}

// 4. pnpm
const pnpmCheck = checkCommand('pnpm --version', 'pnpm');
if (!pnpmCheck.ok) allOk = false;

// 5. Rust
const rustCheck = checkCommand('rustc --version', 'Rust');
if (!rustCheck.ok) allOk = false;

// 6. Tauri CLI
const tauriCheck = checkCommand('tauri --version', 'Tauri CLI');
if (!tauriCheck.ok) allOk = false;

// 7. Git LFS
const gitLfsCheck = checkCommand('git lfs version', 'Git LFS');
if (!gitLfsCheck.ok) allOk = false;

// 8. Package manager lock
const lockCheck = checkPath(['pnpm-lock.yaml'], 'pnpm-lock.yaml');
if (!lockCheck.ok) allOk = false;

// 9. Engines compatibility
const packageJson = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')
);
const engines = packageJson.engines || {};
if (engines.node) {
  const nodeVersion = nodeCheck.output?.replace('v', '');
  if (nodeVersion && !nodeVersion.startsWith(engines.node.replace('>=', ''))) {
    log(`Node version mismatch: required ${engines.node}, got ${nodeVersion}`, 'warning');
  }
}

// 10. Security audit
const securityAuditCheck = checkCommand(
  'bash scripts/audit/01-security-audit.sh --quiet',
  'Security audit'
);
if (!securityAuditCheck.ok) {
  log(
    'Security audit failed - check reports/security-audit-*/SECURITY_SUMMARY.md',
    'error'
  );
  allOk = false;
}

// 11. Performance audit
const performanceAuditCheck = checkCommand(
  'bash scripts/audit/03-performance-measure.sh --quiet',
  'Performance audit'
);
if (!performanceAuditCheck.ok) {
  log(
    'Performance audit failed - check reports/performance-*/PERFORMANCE_SUMMARY.md',
    'error'
  );
  allOk = false;
}

console.log('');

if (allOk) {
  log('🎉 All checks passed! Ready for development.', 'success');
  process.exit(0);
} else {
  log('❌ Some checks failed. Run ./titane.sh repair or fix issues manually.', 'error');
  console.log('\n🔧 Quick fixes:');
  console.log('  - Node: Install via .tools or system package manager');
  console.log('  - Corepack: corepack enable');
  console.log('  - pnpm: corepack pnpm install');
  console.log('  - Rust: Install via rustup');
  console.log('  - Tauri: pnpm add -D @tauri-apps/cli');
  console.log('  - Git LFS: Install via package manager');
  process.exit(1);
}
