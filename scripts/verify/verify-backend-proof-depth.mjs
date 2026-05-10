#!/usr/bin/env node
/**
 * verify-backend-proof-depth.mjs
 * Schema-level verifier for TITANE backend proof-depth JSONL artifacts.
 * Validates structure, proof levels, secret redaction, and tier compliance.
 *
 * Usage: node scripts/verify/verify-backend-proof-depth.mjs
 * Or via: pnpm run verify:backend-proof-depth
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// ─── Configuration ───────────────────────────────────────────────────────────

const ARTIFACTS = [
  'artifacts/backend-proof-depth/v58-backend-proof-depth.jsonl',
  'artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl',
];

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

function validateRecord(record, lineNum, artifactName) {
  const loc = `${artifactName}:L${lineNum}`;

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
  }

  // Sandboxed mutation checks
  if (pl === 'SANDBOXED_MUTATION_PROVEN') {
    if (!record.tempPath && !record.sandboxPath && !record.cleanupStatus) {
      warn(`${loc}: SANDBOXED_MUTATION_PROVEN should include tempPath/cleanupStatus`);
    }
    if (!record.nonProductionMarker) {
      warn(`${loc}: SANDBOXED_MUTATION_PROVEN should include nonProductionMarker`);
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

  // sourceSpec check
  if (!record.sourceSpec) {
    warn(`${loc}: missing sourceSpec — recommended for traceability`);
  }
}

// ─── Validate a single JSONL artifact ────────────────────────────────────────

function validateArtifact(relPath) {
  const absPath = join(ROOT, relPath);
  if (!existsSync(absPath)) {
    if (relPath.includes('v59')) {
      warn(`Artifact not yet created (expected for v59 pre-run): ${relPath}`);
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

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    try {
      const record = JSON.parse(lines[i]);
      validateRecord(record, lineNum, relPath);
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

console.log('\n=== TITANE Backend Proof-Depth Verifier ===\n');

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
