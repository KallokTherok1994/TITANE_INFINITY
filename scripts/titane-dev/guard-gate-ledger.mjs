import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase'))?.split('=')[1]
  || args[args.indexOf('--phase') + 1]
  || 'GATE_5';

const STATE_FILE = path.join(ROOT, '.titane-dev', 'state', 'nexus_gate_state.json');
const LEDGER_FILE = path.join(ROOT, '.titane-dev', 'state', 'nexus_gate_ledger.jsonl');

const P2_GATES = ['gate_10', 'gate_11', 'gate_12', 'gate_13', 'gate_14'];

let errors = [];

// Check state file
if (!existsSync(STATE_FILE)) {
  errors.push('MISSING: nexus_gate_state.json');
}

// Check ledger file
if (!existsSync(LEDGER_FILE)) {
  errors.push('MISSING: nexus_gate_ledger.jsonl');
}

if (errors.length > 0) {
  console.log('GATE_LEDGER_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
}

let state;
try {
  state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
} catch (e) {
  console.log('GATE_LEDGER_GUARD=FAIL');
  console.log(`INVALID_JSON: nexus_gate_state.json :: ${e.message}`);
  process.exit(1);
}

// Verify all completed gates have a verdict
const GATE_NUM = parseInt(phaseArg.replace('GATE_', '') || '5');
for (let i = 0; i < GATE_NUM; i++) {
  const key = `gate_${i}`;
  if (state.gates[key] === undefined) continue; // Not in state
  if (state.gates[key] === 'UNKNOWN') {
    errors.push(`INCOMPLETE_GATE: ${key} has verdict UNKNOWN but should be before ${phaseArg}`);
  }
}

// Verify P2 gates remain LOCKED unless already completed
// A completed P2 gate (number <= last_completed_gate number) may hold PASS/QUALIFIED/FAIL.
// Future P2 gates must remain LOCKED_P2 until explicitly approved.
if (state.p2_transition !== 'APPROVED') {
  const lastCompletedNum = parseInt((state.last_completed_gate || 'GATE_-1').replace('GATE_', ''));
  const TERMINAL_VERDICTS = new Set(['PASS', 'QUALIFIED', 'QUALIFIED_NO_BLOCKING_CONFLICT', 'QUALIFIED_VISUAL_WITH_NONBLOCKING_NOTES', 'QUALIFIED_PENDING_KEVIN_VISUAL_VALIDATION', 'FAIL']);
  for (const pg of P2_GATES) {
    const pgNum = parseInt(pg.replace('gate_', ''));
    const verdict = state.gates[pg];
    if (!verdict) continue;
    if (pgNum <= lastCompletedNum) {
      // Completed gate: must have a terminal verdict, not still LOCKED_P2 or UNKNOWN
      if (!TERMINAL_VERDICTS.has(verdict)) {
        errors.push(`P2_INTEGRITY: ${pg} is a completed gate but has non-terminal verdict "${verdict}"`);
      }
    } else {
      // Future gate: must remain LOCKED_P2
      if (verdict !== 'LOCKED_P2') {
        errors.push(`P2_INTEGRITY: ${pg} should be LOCKED_P2, got "${verdict}"`);
      }
    }
  }
}

// Parse and validate ledger entries
const ledgerLines = readFileSync(LEDGER_FILE, 'utf8').split('\n').filter(Boolean);
let ledgerErrors = [];
for (let i = 0; i < ledgerLines.length; i++) {
  try {
    const entry = JSON.parse(ledgerLines[i]);
    if (!entry.gate) ledgerErrors.push(`Line ${i + 1}: missing gate`);
    if (!entry.verdict) ledgerErrors.push(`Line ${i + 1}: missing verdict`);
    if (!entry.timestamp) ledgerErrors.push(`Line ${i + 1}: missing timestamp`);
    if (!Array.isArray(entry.proofs)) ledgerErrors.push(`Line ${i + 1}: proofs must be array`);
  } catch (e) {
    ledgerErrors.push(`Line ${i + 1}: invalid JSON :: ${e.message}`);
  }
}
errors.push(...ledgerErrors);

console.log(`GATE_LEDGER_GUARD phase=${phaseArg}`);
console.log(`State gates: ${JSON.stringify(state.gates)}`);
console.log(`Ledger entries: ${ledgerLines.length}`);
console.log(`P2 transition: ${state.p2_transition}`);

if (errors.length > 0) {
  console.log('GATE_LEDGER_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('GATE_LEDGER_GUARD=PASS');
  process.exit(0);
}
