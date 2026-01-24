#!/usr/bin/env node
/**
 * TITANE∞ Registry - Close a cycle (updates cycles.json + logs CYCLE_END)
 * Usage:
 *   pnpm registry:cycle:close -- --cycleId=<ULID?> --owner="..." --priority=P1 --desc="..." --outcome=achieved|abandoned
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

import { assert, nowIso, parseCliArgs, readJson, resolveRepoRoot, writeJson } from './registry-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);
const CYCLES_FILE = path.resolve(ROOT_DIR, 'runtime/registry/cycles.json');

function loadCycles() {
  assert(fs.existsSync(CYCLES_FILE), 'cycles.json manquant');
  return readJson(CYCLES_FILE);
}

function close() {
  const args = parseCliArgs(process.argv);
  const cycles = loadCycles();

  const cycleId = args.cycleId || cycles.activeCycleId;
  const owner = args.owner;
  const priority = args.priority;
  const desc = args.desc || args.description;
  const outcome = args.outcome;

  assert(cycleId, 'Missing --cycleId (et aucun cycle actif)');
  assert(owner && owner.trim().length > 0, 'Missing --owner');
  assert(priority && ['P0', 'P1', 'P2', 'P3'].includes(priority), 'Invalid --priority');
  assert(desc && desc.trim().length >= 20, 'Missing/short --desc (>=20 chars)');
  assert(outcome && ['achieved', 'abandoned'].includes(outcome), 'Invalid --outcome (achieved|abandoned)');

  const idx = cycles.open.findIndex((c) => c.id === cycleId);
  assert(idx >= 0, `Cycle non trouvé dans open: ${cycleId}`);

  const cycle = cycles.open[idx];
  cycles.open.splice(idx, 1);
  cycles.closed.push({
    ...cycle,
    endedAt: nowIso(),
    status: 'CLOSED',
    outcome,
  });
  cycles.activeCycleId = cycles.activeCycleId === cycleId ? null : cycles.activeCycleId;
  cycles.generatedAt = nowIso();
  cycles.$schema = './schemas/cycles.schema.json';
  writeJson(CYCLES_FILE, cycles);

  const res = spawnSync(process.execPath, [
    path.resolve(ROOT_DIR, 'scripts/registry/log-event.js'),
    `--type=CYCLE_END`,
    `--cycleId=${cycleId}`,
    `--attempt=1`,
    `--severity=LOW`,
    `--impact=DELIVERY`,
    `--owner=${owner}`,
    `--priority=${priority}`,
    `--desc=${desc.trim()}`,
    `--blockers=`,
    `--justification=outcome:${outcome}`,
  ], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  });
  process.exit(res.status ?? 1);
}

try {
  close();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
