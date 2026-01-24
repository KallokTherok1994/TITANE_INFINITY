#!/usr/bin/env node
/**
 * TITANE∞ Registry - Start a cycle (creates cycles.json entry + logs CYCLE_START)
 * Usage:
 *   pnpm registry:cycle:start -- --objective="..." --owner="..." --priority=P1 --next="..."
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { assert, generateUlid, nowIso, parseCliArgs, readJson, resolveRepoRoot, splitCsv, writeJson } from './registry-lib.js';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);
const CYCLES_FILE = path.resolve(ROOT_DIR, 'runtime/registry/cycles.json');

function loadCycles() {
  if (!fs.existsSync(CYCLES_FILE)) {
    return {
      $schema: './schemas/cycles.schema.json',
      schemaVersion: 2,
      generatedAt: nowIso(),
      activeCycleId: null,
      open: [],
      closed: [],
    };
  }
  return readJson(CYCLES_FILE);
}

function start() {
  const args = parseCliArgs(process.argv);
  const objective = args.objective;
  const owner = args.owner;
  const priority = args.priority;
  const nextActions = splitCsv(args.next || args.next_actions);

  assert(objective && objective.trim().length >= 20, 'Missing/short --objective (>=20 chars)');
  assert(owner && owner.trim().length > 0, 'Missing --owner');
  assert(priority && ['P0', 'P1', 'P2', 'P3'].includes(priority), 'Invalid --priority');
  assert(nextActions.length >= 1, 'next_actions requis (min 1)');

  const cycles = loadCycles();
  assert(!cycles.activeCycleId, `Cycle déjà actif: ${cycles.activeCycleId}`);

  const cycleId = generateUlid();
  const startedAt = nowIso();

  cycles.open.push({
    id: cycleId,
    objective: objective.trim(),
    owner,
    priority,
    startedAt,
    status: 'OPEN',
  });
  cycles.activeCycleId = cycleId;
  cycles.generatedAt = nowIso();
  cycles.$schema = './schemas/cycles.schema.json';
  writeJson(CYCLES_FILE, cycles);

  const res = spawnSync(process.execPath, [
    path.resolve(ROOT_DIR, 'scripts/registry/log-event.js'),
    `--type=CYCLE_START`,
    `--cycleId=${cycleId}`,
    `--attempt=1`,
    `--severity=MEDIUM`,
    `--impact=DELIVERY`,
    `--owner=${owner}`,
    `--priority=${priority}`,
    `--desc=${objective.trim()}`,
    `--next=${nextActions.join(',')}`,
  ], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  process.exit(res.status ?? 1);
}

try {
  start();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
