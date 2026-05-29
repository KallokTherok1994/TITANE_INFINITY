import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();

// Always-forbidden paths regardless of P2 state
const ALWAYS_FORBIDDEN_PREFIXES = [
  'src-tauri/', 'package.json', 'pnpm-lock.yaml',
  'Cargo.toml', 'Cargo.lock', 'runtime/', 'deployment/', 'release/',
  '.github/workflows/', '.env'
];

// src/ is forbidden in P1 (p2_transition=LOCKED) but allowed in P2 (ACTIVE or APPROVED)
const STATE_FILE = path.join(ROOT, '.titane-dev', 'state', 'nexus_gate_state.json');
let p2TransitionState = 'LOCKED';
if (existsSync(STATE_FILE)) {
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    p2TransitionState = state.p2_transition || 'LOCKED';
  } catch { /* use default LOCKED */ }
}
const srcForbidden = p2TransitionState === 'LOCKED';

const FORBIDDEN_PREFIXES = srcForbidden
  ? ['src/', ...ALWAYS_FORBIDDEN_PREFIXES]
  : ALWAYS_FORBIDDEN_PREFIXES;

function isForbidden(filePath) {
  const normalized = filePath.replace(/\\/g, '/').replace(/^[" ]+|[" ]+$/g, '');
  return FORBIDDEN_PREFIXES.some(p => normalized.startsWith(p) || normalized === p.replace(/\/$/, ''));
}

let violations = [];

try {
  const status = execSync('git status --short --porcelain', { cwd: ROOT, encoding: 'utf8' });
  const lines = status.split('\n').filter(Boolean);

  for (const line of lines) {
    const xy = line.slice(0, 2);
    const file = line.slice(3).trim().replace(/^"(.*)"$/, '$1');

    // Only check modifications (M, A, D) — not untracked (??)
    if (xy.trim() !== '' && !xy.startsWith('?')) {
      if (isForbidden(file)) {
        violations.push(`FORBIDDEN_MODIFIED: ${file}`);
      }
    }
  }
} catch (e) {
  console.error(`GUARD_SCOPE_ERROR: ${e.message}`);
  process.exit(1);
}

if (violations.length > 0) {
  console.log('SCOPE_GUARD=FAIL');
  violations.forEach(v => console.log(v));
  process.exit(1);
} else {
  console.log('SCOPE_GUARD=PASS');
  console.log('No forbidden paths modified.');
  process.exit(0);
}
