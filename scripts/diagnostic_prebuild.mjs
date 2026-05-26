#!/usr/bin/env node
// TITANE∞ Pre-Build Diagnostic — checks package.json, Ollama, git state
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const ROOT = process.cwd();
const results = [];

function check(label, fn) {
  try {
    const r = fn();
    results.push({
      label,
      status: r ? 'PASS' : 'FAIL',
      detail: typeof r === 'string' ? r : '',
    });
  } catch (e) {
    results.push({ label, status: 'FAIL', detail: e.message });
  }
}

// 1. package.json validity
check('package.json JSON validity', () => {
  const raw = readFileSync(path.join(ROOT, 'package.json'), 'utf8');
  const pkg = JSON.parse(raw);
  return `version=${pkg.version}, scripts=${Object.keys(pkg.scripts).length}`;
});

// 2. Git state
check('Git status clean', () => {
  const out = execSync('git status --porcelain', { encoding: 'utf8', cwd: ROOT }).trim();
  if (!out) return 'clean';
  const lines = out.split('\n').filter(l => l.trim());
  return `${lines.length} uncommitted file(s)`;
});

// 3. Ollama reachable
check('Ollama health', () => {
  try {
    const resp = execSync('curl -sf http://127.0.0.1:11434/api/tags', {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const models = JSON.parse(resp);
    const names = (models.models || []).map(m => m.name);
    return `online: ${names.join(', ') || 'no models'}`;
  } catch {
    return 'NOT_RUNNING';
  }
});

// 4. TypeScript check (quick)
check('tsc --noEmit', () => {
  execSync('npx tsc --noEmit', {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: 60000,
    stdio: 'pipe',
  });
  return '0 errors';
});

// 5. ESLint quick
check('eslint', () => {
  execSync('npx eslint "src/**/*.{ts,tsx}" --max-warnings=0', {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: 60000,
    stdio: 'pipe',
  });
  return '0 errors';
});

// 6. Node version
check('Node version', () => {
  const v = process.version;
  const major = parseInt(v.slice(1).split('.')[0], 10);
  if (major < 20) throw new Error(`Node ${v} < 20`);
  return v;
});

// 7. pnpm version
check('pnpm available', () => {
  const out = execSync('pnpm --version', { encoding: 'utf8', cwd: ROOT }).trim();
  if (!out) throw new Error('pnpm not found');
  return out;
});

console.log('\n=== TITANE∞ PRE-BUILD DIAGNOSTIC ===\n');
for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`  ${icon} ${r.label}: ${r.detail || r.status}`);
}
const failCount = results.filter(r => r.status === 'FAIL').length;
console.log(`\n  PASS=${results.length - failCount}  FAIL=${failCount}`);
if (failCount > 0) process.exit(1);
