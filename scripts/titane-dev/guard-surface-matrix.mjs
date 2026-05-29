import { readFileSync, existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase'))?.split('=')[1]
  || args[args.indexOf('--phase') + 1]
  || 'GATE_5';

const MATRIX_JSON = path.join(ROOT, 'docs', 'nexus-v36', '07_SURFACE_DECISION_MATRIX.json');
const MATRIX_MD = path.join(ROOT, 'docs', 'nexus-v36', '07_SURFACE_DECISION_MATRIX.md');

const GATE_NUM = parseInt(phaseArg.replace('GATE_', '') || '5');

// Before Gate 7: matrix doesn't need to exist yet
if (GATE_NUM < 7) {
  console.log(`SURFACE_MATRIX_GUARD phase=${phaseArg}`);
  console.log('PRE_MATRIX_PHASE: Surface Decision Matrix not required before Gate 7.');
  console.log('SURFACE_MATRIX_GUARD=PASS');
  process.exit(0);
}

// Gate 7+: matrix must exist
let errors = [];

if (!existsSync(MATRIX_MD)) {
  errors.push('MISSING: docs/nexus-v36/07_SURFACE_DECISION_MATRIX.md');
}

if (!existsSync(MATRIX_JSON)) {
  errors.push('MISSING: docs/nexus-v36/07_SURFACE_DECISION_MATRIX.json');
} else {
  let matrix;
  try {
    matrix = JSON.parse(readFileSync(MATRIX_JSON, 'utf8'));
  } catch (e) {
    errors.push(`INVALID_JSON: 07_SURFACE_DECISION_MATRIX.json :: ${e.message}`);
  }

  if (matrix?.routes) {
    // Check no SIMULATED_UI as KEEP_DAILY
    for (const route of matrix.routes) {
      if (route.isSimulated && route.decision === 'KEEP_DAILY') {
        errors.push(`SIMULATED_UI_AS_KEEP_DAILY: ${route.route} is SIMULATED_UI but decision=KEEP_DAILY`);
      }
      // Check no route deletions
      if (route.decision === 'DELETE' || route.decision === 'REMOVED') {
        errors.push(`ROUTE_DELETION_FOUND: ${route.route} has decision=DELETE — not allowed without Kevin approval`);
      }
    }
    console.log(`Routes classified: ${matrix.routes.length}`);
    const simulated = matrix.routes.filter(r => r.isSimulated).length;
    console.log(`SIMULATED_UI count: ${simulated}`);
  }
}

console.log(`SURFACE_MATRIX_GUARD phase=${phaseArg}`);

if (errors.length > 0) {
  console.log('SURFACE_MATRIX_GUARD=FAIL');
  errors.forEach(e => console.log(e));
  process.exit(1);
} else {
  console.log('SURFACE_MATRIX_GUARD=PASS');
  process.exit(0);
}
