#!/usr/bin/env node
/**
 * verify-backend-proof-depth.mjs
 * Schema-level verifier for TITANE backend proof-depth JSONL artifacts.
 * Validates structure, proof levels, secret redaction, and tier compliance.
 *
 * Usage: node scripts/verify/verify-backend-proof-depth.mjs
 *        node scripts/verify/verify-backend-proof-depth.mjs --strict
 * Or via: pnpm run verify:backend-proof-depth
 *         pnpm run verify:backend-proof-depth:strict
 *
 * --strict mode: FAILs on missing sourceSpec, uiEvidence, sandboxEvidence, etc.
 *                Applied ONLY to v60+ artifacts (filename contains 'v60' or is
 *                the TITANE_PROOF_ARTIFACT target if it doesn’t match a legacy name).
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// ─── Strict mode flag ────────────────────────────────────────────────────────

const STRICT_MODE = process.argv.includes('--strict');

// An artifact is considered "v60+" (strict schema enforcement) if its path contains 'v60' or 'v61',
// or if it is the TITANE_PROOF_ARTIFACT override and does not match known legacy names.
function isV60Artifact(relPath) {
  return relPath.includes('v60') || relPath.includes('v61') ||
    (process.env.TITANE_PROOF_ARTIFACT &&
     relPath === process.env.TITANE_PROOF_ARTIFACT &&
     !relPath.includes('v58') && !relPath.includes('v59'));
}

// ─── Configuration ───────────────────────────────────────────────────────────

const ARTIFACTS_STATIC = [
  'artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl',
  'artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl',
  'artifacts/backend-proof-depth/v60-strict-backend-proof.jsonl',
  'artifacts/backend-proof-depth/v61-tier1-blocker-reduction.jsonl',
];

// Build artifact list: static list + TITANE_PROOF_ARTIFACT if set and not already included
function buildArtifactList() {
  const list = [...ARTIFACTS_STATIC];
  const env = process.env.TITANE_PROOF_ARTIFACT;
  if (env && !list.includes(env)) {
    list.push(env);
  }
  return list;
}

const ARTIFACTS = buildArtifactList();

const REQUIRED_FIELDS_BASE = [
  'route',
  'attempted',
  'available',
  'ok',
  'proofLevel',
  'safeToPersist',
];

const REQUIRED_FIELDS_IPC = [
  ...REQUIRED_FIELDS_BASE,
  'command',
  'errorKind',
  'latencyMs',
];

const REQUIRED_FIELDS_RESPONSE_PROVEN = [
  ...REQUIRED_FIELDS_IPC,
  'responseShape',
];

const REQUIRED_FIELDS_UI_REFLECTS = [
  ...REQUIRED_FIELDS_BASE,
];

const REQUIRED_FIELDS_SANDBOXED = [
  ...REQUIRED_FIELDS_BASE,
];

// Forbidden proof levels — must never appear
const FORBIDDEN_PROOF_LEVELS = new Set([
  'UNKNOWN',
  'IMPLIED_LIVE',
  'BUTTON_EXISTS_AS_PROOF',
  'TRYINVOKE_SWALLOWED_AS_PASS',
  'COMMAND_ONLY_AS_LIVE',
]);

// Tier 1 modules — must not remain UI_ONLY
const TIER_1_MODULE_IDS = new Set([
  'TITANE_CHAT',
  'TIME',
  'MEMORY',
  'DOC_CENTER',
  'ADMIN_SYSTEM',
  'ADMIN_CONFIG',
  'DEV_COCKPIT',
  'RESEARCH',
  'CLOUD',
  'EXPERIENCE',
  'AGENT_CHAT',
]);

// Secret patterns to detect leakage
const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{10,}\b/,
  /\bBearer\s+[A-Za-z0-9_.-]{20,}\b/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bapi[_-]?key\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/i,
  /\bpassword\s*[:=]\s*["'][^"']{6,}/i,
  /\bsecret\s*[:=]\s*["'][A-Za-z0-9_-]{10,}/i,
];

// Home path leak pattern
const HOME_PATH_PATTERN = /\/home\/[a-z][a-z0-9_-]*/;

// ─── Helpers ─────────────────────────────────────────────────────────────────

let errors = [];
let warnings = [];
let passes = [];

function fail(msg) { errors.push(`FAIL: ${msg}`); }
function warn(msg) { warnings.push(`WARN: ${msg}`); }
function pass(msg) { passes.push(`PASS: ${msg}`); }

// In strict mode for a v60 artifact: emit FAIL instead of WARN
function strictFail(msg, artifactRelPath, useStrict = false) {
  if (useStrict && STRICT_MODE) {
    fail(msg);
  } else {
    warn(msg);
  }
}

function checkSecrets(str, location) {
  if (typeof str !== 'string') return;
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(str)) {
      fail(`Secret pattern detected in ${location}: pattern=${pattern.source.slice(0, 40)}`);
      return;
    }
  }
}

function checkHomePath(str, location, fieldName) {
  if (typeof str !== 'string') return;
  if (HOME_PATH_PATTERN.test(str) && !str.includes('[REDACTED]')) {
    warn(`Home path potentially leaked in ${location}.${fieldName}: may need redaction`);
  }
}

// ─── Validate a single JSONL record ──────────────────────────────────────────

function validateRecord(record, lineNum, artifactName, strictArtifact = false) {
  const loc = `${artifactName}:L${lineNum}`;
  const strict = strictArtifact && STRICT_MODE;

  // Check for forbidden proof levels
  const pl = record.proofLevel;
  if (!pl) {
    fail(`${loc}: missing proofLevel`);
    return;
  }
  if (FORBIDDEN_PROOF_LEVELS.has(pl)) {
    fail(`${loc}: forbidden proofLevel "${pl}" — must not appear in governed artifacts`);
  }

  // Check for required base fields
  for (const field of REQUIRED_FIELDS_BASE) {
    if (!(field in record)) {
      fail(`${loc}: missing required field "${field}"`);
    }
  }

  // Check module/moduleId field
  const moduleId = record.moduleId || record.module;
  if (!moduleId) {
    fail(`${loc}: missing moduleId or module field`);
  }

  // route check (strict: FAIL, default: WARN)
  if (!record.route) {
    if (strict) {
      fail(`${loc}: [STRICT] missing required field "route"`);
    } else {
      warn(`${loc}: missing route field — recommended for traceability`);
    }
  }

  // Check timestamp or capturedAt
  if (!record.timestamp && !record.capturedAt) {
    warn(`${loc}: missing timestamp/capturedAt — recommended for audit trail`);
  }

  // IPC-specific checks
  if (pl === 'PROOF_DEPTH_IPC_COMMAND_PROVEN' || pl === 'IPC_COMMAND_PROVEN') {
    if (!record.command) {
      fail(`${loc}: IPC_COMMAND_PROVEN record must include command name`);
    }
    if (record.available === undefined) {
      fail(`${loc}: IPC_COMMAND_PROVEN record must include availability`);
    }
  }

  // Response shape checks
  if (pl === 'PROOF_DEPTH_IPC_RESPONSE_PROVEN' || pl === 'IPC_RESPONSE_PROVEN') {
    if (!record.command) {
      fail(`${loc}: IPC_RESPONSE_PROVEN record must include command name`);
    }
    if (!record.responseShape || record.responseShape === 'null') {
      fail(`${loc}: IPC_RESPONSE_PROVEN record must include non-null responseShape`);
    }
    if (record.latencyMs === undefined || record.latencyMs === null) {
      warn(`${loc}: IPC_RESPONSE_PROVEN record missing latencyMs`);
    }
  }

  // UI reflection checks
  if (pl === 'UI_REFLECTS_BACKEND_RESULT') {
    if (!record.uiSelector && !record.uiEvidence && !record.uiReflected) {
      warn(`${loc}: UI_REFLECTS_BACKEND_RESULT missing UI selector or evidence field`);
    }
    // strict: require structured uiEvidence
    if (strict) {
      if (!record.uiEvidence || typeof record.uiEvidence !== 'object') {
        fail(`${loc}: [STRICT] UI_REFLECTS_BACKEND_RESULT must include structured uiEvidence object`);
      } else {
        if (!('found' in record.uiEvidence)) {
          fail(`${loc}: [STRICT] uiEvidence must include 'found' boolean`);
        }
        if (!record.uiEvidence.selector) {
          fail(`${loc}: [STRICT] uiEvidence must include 'selector'`);
        }
        if (!record.uiEvidence.evidenceKind) {
          fail(`${loc}: [STRICT] uiEvidence must include 'evidenceKind'`);
        }
      }
    }
  }

  // Sandboxed mutation checks
  if (pl === 'SANDBOXED_MUTATION_PROVEN') {
    if (!record.tempPath && !record.sandboxPath && !record.cleanupStatus && !record.sandboxEvidence) {
      if (strict) {
        fail(`${loc}: [STRICT] SANDBOXED_MUTATION_PROVEN must include sandboxEvidence object`);
      } else {
        warn(`${loc}: SANDBOXED_MUTATION_PROVEN should include tempPath/cleanupStatus or sandboxEvidence`);
      }
    }
    if (strict && record.sandboxEvidence && !record.sandboxEvidence.nonProductionMarker) {
      fail(`${loc}: [STRICT] sandboxEvidence must include nonProductionMarker:true`);
    }
    if (!record.nonProductionMarker && !(record.sandboxEvidence && record.sandboxEvidence.nonProductionMarker)) {
      if (!strict) warn(`${loc}: SANDBOXED_MUTATION_PROVEN should include nonProductionMarker`);
    }
  }

  // Check Tier 1 modules for UI_ONLY
  if (TIER_1_MODULE_IDS.has(moduleId) && pl === 'UI_ONLY') {
    fail(`${loc}: Tier 1 module "${moduleId}" must not remain at UI_ONLY proof level`);
  }

  // Secret scanning in string fields
  const stringFields = ['responseShape', 'errorMsg', 'errorMessageRedacted', 'command', 'route'];
  for (const field of stringFields) {
    if (record[field]) {
      checkSecrets(String(record[field]), `${loc}.${field}`);
    }
  }

  // Home path check in route
  if (record.route) {
    checkHomePath(String(record.route), loc, 'route');
  }

  // sourceSpec check (strict: FAIL, default: WARN)
  if (!record.sourceSpec) {
    if (strict) {
      fail(`${loc}: [STRICT] missing required field "sourceSpec" — must be explicit in v60+ artifacts`);
    } else {
      warn(`${loc}: missing sourceSpec — recommended for traceability`);
    }
  }

  // strict: redactionApplied + secretScanPassed required
  if (strict) {
    if (record.redactionApplied === undefined) {
      fail(`${loc}: [STRICT] missing "redactionApplied" boolean field`);
    }
    if (record.secretScanPassed === undefined) {
      fail(`${loc}: [STRICT] missing "secretScanPassed" boolean field`);
    }
    if (!['v60', 'v61'].includes(record.schemaVersion)) {
      fail(`${loc}: [STRICT] missing or wrong schemaVersion (expected "v60" or "v61", got "${record.schemaVersion}")`);
    }
    if (!record.capturedAt) {
      fail(`${loc}: [STRICT] missing "capturedAt" ISO timestamp`);
    }
  }
}

// ─── Validate a single JSONL artifact ────────────────────────────────────────

function validateArtifact(relPath) {
  const absPath = join(ROOT, relPath);
  const strictArtifact = isV60Artifact(relPath);

  if (!existsSync(absPath)) {
    if (relPath.includes('v59')) {
      warn(`Artifact not yet created (expected for v59 pre-run): ${relPath}`);
      return { exists: false, lineCount: 0, proofLevels: {} };
    }
    if (relPath.includes('v61')) {
      warn(`v61 artifact not yet created (expected after v61 suite run): ${relPath}`);
      return { exists: false, lineCount: 0, proofLevels: {} };
    }
    if (relPath.includes('v60')) {
      if (STRICT_MODE) {
        fail(`[STRICT] v60 artifact missing (required in strict mode): ${relPath}`);
      } else {
        warn(`v60 artifact not yet created: ${relPath}`);
      }
      return { exists: false, lineCount: 0, proofLevels: {} };
    }
    fail(`Required artifact missing: ${relPath}`);
    return { exists: false, lineCount: 0, proofLevels: {} };
  }

  const content = readFileSync(absPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length === 0) {
    fail(`Artifact is empty: ${relPath}`);
    return { exists: true, lineCount: 0, proofLevels: {} };
  }

  pass(`Artifact exists with ${lines.length} records: ${relPath}`);

  const proofLevels = {};
  let parseErrors = 0;

  // Minimum line count check (strict mode for v60)
  if (STRICT_MODE && strictArtifact && lines.length < 10) {
    fail(`[STRICT] v60 artifact has only ${lines.length} records — minimum 10 required for strict proof gate`);
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    try {
      const record = JSON.parse(lines[i]);
      validateRecord(record, lineNum, relPath, strictArtifact);
      const pl = record.proofLevel || 'MISSING';
      proofLevels[pl] = (proofLevels[pl] || 0) + 1;
    } catch (e) {
      fail(`${relPath}:L${lineNum}: JSON parse error — ${e.message}`);
      parseErrors++;
    }
  }

  if (parseErrors === 0) {
    pass(`All ${lines.length} records parse cleanly: ${relPath}`);
  }

  // Check forbidden proof levels in totals
  for (const forbidden of FORBIDDEN_PROOF_LEVELS) {
    if (proofLevels[forbidden]) {
      fail(`Forbidden proof level "${forbidden}" found ${proofLevels[forbidden]} times in ${relPath}`);
    }
  }

  return { exists: true, lineCount: lines.length, proofLevels };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n=== TITANE Backend Proof-Depth Verifier ===');
if (STRICT_MODE) console.log('MODE: --strict (v60+ schema enforcement active)');
console.log('');

const results = {};
for (const artifact of ARTIFACTS) {
  console.log(`Validating: ${artifact}`);
  results[artifact] = validateArtifact(artifact);
}

// Print level distributions
console.log('\n--- Proof Level Distribution ---');
for (const [artifact, result] of Object.entries(results)) {
  if (result.lineCount > 0) {
    console.log(`\n${artifact} (${result.lineCount} records):`);
    for (const [level, count] of Object.entries(result.proofLevels).sort()) {
      const marker = FORBIDDEN_PROOF_LEVELS.has(level) ? '❌' : '✓';
      console.log(`  ${marker} ${level}: ${count}`);
    }
  }
}

// Print summary
console.log('\n--- Verification Summary ---');
for (const p of passes) console.log(p);
for (const w of warnings) console.log(w);
for (const e of errors) console.log(e);

console.log(`\nPASS: ${passes.length} | WARN: ${warnings.length} | FAIL: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ VERDICT: FAIL\n');
  process.exit(1);
} else {
  console.log('\n✅ VERDICT: PASS\n');
  process.exit(0);
}
