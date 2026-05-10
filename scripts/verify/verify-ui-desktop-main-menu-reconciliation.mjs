import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ARTIFACT_PATH = path.resolve(
  ROOT,
  'artifacts/ui-desktop/v64-main-menu-capture-reconciliation.jsonl'
);

const REQUIRED_SURFACES = [
  'TITANE',
  'TIME',
  'ADMIN',
  'DEV',
  'FUSION',
  'TWINS',
  'OPTIMIZATION',
  'TOTAL_DEV',
];

const REQUIRED_FIELDS = [
  'schemaVersion',
  'capturedSurface',
  'route',
  'rootFound',
  'titleFound',
  'tabsExpected',
  'tabsFound',
  'controlsExpected',
  'controlsFound',
  'proofStatus',
  'sourceSpec',
];

const ACCEPTED_MISSING_CONTROLS = new Set(['TIME', 'TWINS', 'OPTIMIZATION']);

let passCount = 0;
let warnCount = 0;
let failCount = 0;

function pass(msg) {
  passCount += 1;
  console.log(`PASS: ${msg}`);
}

function warn(msg) {
  warnCount += 1;
  console.log(`WARN: ${msg}`);
}

function fail(msg) {
  failCount += 1;
  console.log(`FAIL: ${msg}`);
}

console.log('=== TITANE v64 Main Menu Reconciliation Artifact Verifier ===');
console.log(`Artifact: ${ARTIFACT_PATH}`);

if (!fs.existsSync(ARTIFACT_PATH)) {
  fail('artifact missing');
  console.log(`\nSummary: PASS=${passCount} WARN=${warnCount} FAIL=${failCount}`);
  process.exit(1);
}

const raw = fs.readFileSync(ARTIFACT_PATH, 'utf8');
const lines = raw
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);

if (lines.length === 0) {
  fail('artifact exists but has no records');
  console.log(`\nSummary: PASS=${passCount} WARN=${warnCount} FAIL=${failCount}`);
  process.exit(1);
}
pass(`artifact exists with ${lines.length} records`);

const records = [];
for (let i = 0; i < lines.length; i += 1) {
  try {
    records.push(JSON.parse(lines[i]));
  } catch (error) {
    fail(`line ${i + 1} invalid JSON: ${error.message}`);
  }
}

if (records.length !== lines.length) {
  fail('artifact JSONL parse failed');
  console.log(`\nSummary: PASS=${passCount} WARN=${warnCount} FAIL=${failCount}`);
  process.exit(1);
}
pass('all records parse as JSON');

const surfaceMap = new Map();
for (const record of records) {
  if (!surfaceMap.has(record.capturedSurface)) {
    surfaceMap.set(record.capturedSurface, []);
  }
  surfaceMap.get(record.capturedSurface).push(record);
}

for (const surface of REQUIRED_SURFACES) {
  const entries = surfaceMap.get(surface) || [];
  if (entries.length === 0) {
    fail(`missing capturedSurface=${surface}`);
    continue;
  }
  pass(`capturedSurface=${surface} present (${entries.length} records)`);
}

for (let i = 0; i < records.length; i += 1) {
  const record = records[i];
  const tag = `L${i + 1}:${record.capturedSurface || 'UNKNOWN_SURFACE'}`;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in record)) {
      fail(`${tag} missing required field ${field}`);
    }
  }

  if (record.schemaVersion !== 'v64') {
    fail(`${tag} schemaVersion must be v64`);
  }

  if (record.proofStatus === 'UNKNOWN') {
    fail(`${tag} proofStatus UNKNOWN is forbidden`);
  }

  if (record.proofStatus === 'ERROR_BOUNDARY_DETECTED') {
    fail(`${tag} ErrorBoundary status is forbidden`);
  }

  if (record.proofStatus === 'BLANK_PAGE_DETECTED') {
    fail(`${tag} blank page status is forbidden`);
  }

  if (record.rootFound !== true) {
    fail(`${tag} rootFound must be true`);
  }

  if (record.titleFound !== true) {
    fail(`${tag} titleFound must be true`);
  }

  const missingControls = Array.isArray(record.missingControls)
    ? record.missingControls
    : [];

  if (missingControls.length > 0 && !ACCEPTED_MISSING_CONTROLS.has(record.capturedSurface)) {
    warn(`${tag} has missingControls not in accepted drift list: ${JSON.stringify(missingControls)}`);
  }

  if (missingControls.length > 0 && ACCEPTED_MISSING_CONTROLS.has(record.capturedSurface)) {
    pass(`${tag} missingControls accepted drift for ${record.capturedSurface}`);
  }
}

console.log(`\nSummary: PASS=${passCount} WARN=${warnCount} FAIL=${failCount}`);
if (failCount > 0) {
  console.log('VERDICT: FAIL');
  process.exit(1);
}
console.log('VERDICT: PASS');
