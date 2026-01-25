#!/usr/bin/env node
/**
 * TITANE∞ Registry - Log Event (Append-only) — Schema v2
 * Usage:
 *   pnpm registry:log -- \
 *     --type=TEST_RUN \
 *     --cycleId=<ULID> \
 *     --attempt=1 \
 *     --severity=MEDIUM \
 *     --impact=TESTS \
 *     --owner=<name> \
 *     --priority=P1 \
 *     --desc="Description claire (>=20 caractères)" \
 *     --next="Action 1,Action 2" \
 *     --blockers="" \
 *     --files="path/a.ts,path/b.ts" \
 *     --suiteId=vitest-core \
 *     --command="pnpm test" \
 *     --duration_ms=1234 \
 *     --passed=10 \
 *     --failed=0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assert,
  generateUlid,
  loadEventsJsonl,
  looksLikeSecret,
  nowIso,
  parseCliArgs,
  resolveRepoRoot,
  safeJsonStringifyOneLine,
  splitCsv,
} from './registry-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);

const EVENTS_FILE = path.resolve(ROOT_DIR, 'runtime/registry/events.jsonl');

const VALID_TYPES = [
  'CYCLE_START',
  'DECISION',
  'INCIDENT',
  'CYCLE_END',
  'TEST_RUN',
  'CI_RUN',
  'FIX_APPLIED',
  'CONFIG_CHANGED',
  'WORKFLOW_CHANGED',
  'SUITE_ADDED',
  'SUITE_REMOVED',
  'GATE_ADDED',
  'GATE_REMOVED',
];

const VALID_SEVERITY = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_IMPACT = ['TESTS', 'CI', 'ARCHITECTURE', 'SECURITY', 'DELIVERY'];
const VALID_PRIORITY = ['P0', 'P1', 'P2', 'P3'];

function ensureDir() {
  fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true });
}

function isVagueDescription(desc) {
  const d = desc.trim();
  if (d.length < 20) return true;
  if (/^(update|fix|changes|misc|cleanup|wip)\b/i.test(d)) return true;
  const hasSignal =
    /\b(pnpm|vitest|cargo|tauri|workflow|gate|suite)\b/i.test(d) ||
    /\.(ts|tsx|js|yml|json|md)\b/i.test(d) ||
    d.includes('/') ||
    /\d/.test(d);
  return !hasSignal;
}

function getExistingAttemptKey(events, cycleId, type, attempt) {
  return events.some(
    e => e && e.cycleId === cycleId && e.type === type && e.attempt === attempt
  );
}

function logEvent() {
  const args = parseCliArgs(process.argv);

  const type = args.type;
  const cycleId = args.cycleId;
  const attempt = Number(args.attempt || '0');
  const description = args.desc || args.description;
  const severity = args.severity;
  const impact = args.impact;
  const owner = args.owner;
  const priority = args.priority;

  const nextActions = splitCsv(args.next || args.next_actions);
  const blockers = splitCsv(args.blockers);
  const files = splitCsv(args.files);

  const actorKind = args['actor-kind'] || args.actorKind || 'human';
  const actorName = args['actor-name'] || args.actorName || process.env.USER || 'unknown';
  const actorTool = args['actor-tool'] || args.actorTool || 'cli';
  const actorModel = args['actor-model'] || args.actorModel;

  const meta = {
    suiteId: args.suiteId,
    gateId: args.gateId,
    command: args.command,
    duration_ms: args.duration_ms ? Number(args.duration_ms) : undefined,
    passed: args.passed ? Number(args.passed) : undefined,
    failed: args.failed ? Number(args.failed) : undefined,
    justification: args.justification,
  };

  assert(type, 'Missing --type');
  assert(VALID_TYPES.includes(type), `Invalid type: ${type}`);
  assert(cycleId, 'Missing --cycleId');
  assert(Number.isFinite(attempt) && attempt >= 1, 'Invalid --attempt (>=1)');
  assert(
    description && description.trim().length >= 20,
    'Missing/short --desc (>=20 chars)'
  );
  assert(
    !isVagueDescription(description),
    'Description trop vague (doit contenir un signal concret: fichier/commande/outil/numéro)'
  );
  assert(severity && VALID_SEVERITY.includes(severity), 'Invalid --severity');
  assert(impact && VALID_IMPACT.includes(impact), 'Invalid --impact');
  assert(owner && owner.trim().length > 0, 'Missing --owner');
  assert(priority && VALID_PRIORITY.includes(priority), 'Invalid --priority');

  if (type !== 'CYCLE_END') {
    assert(nextActions.length >= 1, 'next_actions requis (min 1)');
  }

  assert(!looksLikeSecret(description), 'Secret détecté dans description');
  if (meta.command) assert(!looksLikeSecret(meta.command), 'Secret détecté dans command');
  for (const f of files) assert(!looksLikeSecret(f), 'Secret détecté dans files');

  const existingEvents = loadEventsJsonl(EVENTS_FILE);
  const duplicateAttempt = getExistingAttemptKey(existingEvents, cycleId, type, attempt);
  if (duplicateAttempt) {
    assert(
      meta.justification && meta.justification.trim().length >= 15,
      'attempt répété: fournir --justification (>=15 chars)'
    );
  }

  const event = {
    schemaVersion: 2,
    id: generateUlid(),
    timestamp: nowIso(),
    type,
    cycleId,
    attempt,
    actor: {
      kind: actorKind,
      name: actorName,
      tool: actorTool,
      model: actorModel,
    },
    description: description.trim(),
    severity,
    impact,
    files: files.length > 0 ? files : undefined,
    meta: Object.values(meta).some(v => v !== undefined && v !== '') ? meta : undefined,
    next_actions: nextActions,
    blockers,
    owner,
    priority,
  };

  ensureDir();
  fs.appendFileSync(EVENTS_FILE, safeJsonStringifyOneLine(event) + '\n');
  console.log('✅ Registry event appended:', event.id);
}

try {
  logEvent();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
