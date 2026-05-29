import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase'))?.split('=')[1]
  || args[args.indexOf('--phase') + 1]
  || 'UNKNOWN';

const STATE_FILE = path.join(ROOT, '.titane-dev', 'state', 'nexus_gate_state.json');
const LEDGER_FILE = path.join(ROOT, '.titane-dev', 'state', 'nexus_gate_ledger.jsonl');

const GATE_MAP = {
  GATE_5: 'gate_5', GATE_6: 'gate_6', GATE_7: 'gate_7',
  GATE_8: 'gate_8', GATE_9: 'gate_9',
  GATE_10: 'gate_10', GATE_11: 'gate_11', GATE_12: 'gate_12',
  GATE_13: 'gate_13', GATE_14: 'gate_14'
};

const P2_GATES = ['GATE_10', 'GATE_11', 'GATE_12', 'GATE_13', 'GATE_14'];

let errors = [];

if (!existsSync(STATE_FILE)) {
  console.log('PHASE_LOCK_GUARD=FAIL');
  console.log('MISSING: .titane-dev/state/nexus_gate_state.json');
  process.exit(1);
}

let state;
try {
  state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
} catch (e) {
  console.log('PHASE_LOCK_GUARD=FAIL');
  console.log(`INVALID_JSON: nexus_gate_state.json :: ${e.message}`);
  process.exit(1);
}

// If requesting a P2-locked gate without P2 transition.
// APPROVED = bulk approval; ACTIVE = gate-by-gate approval (valid when phaseArg is current_gate).
if (P2_GATES.includes(phaseArg)) {
  const isCurrentGate = state.current_gate === phaseArg;
  const isGateByGateApproval = state.p2_transition === 'ACTIVE' && isCurrentGate;
  if (state.p2_transition !== 'APPROVED' && !isGateByGateApproval) {
    errors.push(`P2_LOCKED: ${phaseArg} requires P2 transition approval. p2_transition=${state.p2_transition}, current_gate=${state.current_gate}`);
  }
}

// Check that prior gate is not in a bad state
const gateKey = GATE_MAP[phaseArg];
if (gateKey && P2_GATES.includes(phaseArg) === false) {
  // For P1 gates, verify previous completed gate
  const gateNum = parseInt(phaseArg.replace('GATE_', ''));
  if (gateNum > 5) {
    const prevKey = `gate_${gateNum - 1}`;
    const prevVerdict = state.gates[prevKey];
    if (!['PASS', 'QUALIFIED', 'QUALIFIED_NO_BLOCKING_CONFLICT'].includes(prevVerdict)) {
      errors.push(`PRIOR_GATE_INCOMPLETE: ${prevKey} verdict is "${prevVerdict}" — must be PASS or QUALIFIED`);
    }
  }
}

// Verify P2 gates remain LOCKED_P2 if p2 not approved.
// Completed P2 gates (number <= last_completed_gate) may hold terminal verdicts.
if (state.p2_transition !== 'APPROVED') {
  const lastCompletedNum = parseInt((state.last_completed_gate || 'GATE_-1').replace('GATE_', ''));
  const TERMINAL_VERDICTS = new Set(['PASS', 'QUALIFIED', 'QUALIFIED_NO_BLOCKING_CONFLICT', 'QUALIFIED_VISUAL_WITH_NONBLOCKING_NOTES', 'QUALIFIED_PENDING_KEVIN_VISUAL_VALIDATION', 'FAIL']);
  for (const pg of P2_GATES) {
    const pgNum = parseInt(pg.replace('GATE_', ''));
    const key = GATE_MAP[pg];
    const verdict = state.gates[key];
    if (pgNum <= lastCompletedNum) {
      if (!TERMINAL_VERDICTS.has(verdict)) {
        errors.push(`P2_INTEGRITY: ${key} is a completed gate but has non-terminal verdict "${verdict}"`);
      }
    } else {
      if (verdict !== 'LOCKED_P2') {
        errors.push(`P2_INTEGRITY: ${key} should be LOCKED_P2 but is "${verdict}"`);
      }
    }
  }
}

console.log(`PHASE_LOCK_GUARD phase=${phaseArg}`);
console.log(`current_gate=${state.current_gate}`);
console.log(`p2_transition=${state.p2_transition}`);

if (errors.length > 0) {
  console.log('PHASE_LOCK_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('PHASE_LOCK_GUARD=PASS');
  process.exit(0);
}
