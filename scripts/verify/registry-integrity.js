#!/usr/bin/env node
/**
 * TITANE∞ Registry - Integrity Gate
 * Usage: pnpm verify:registry:integrity
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assert, loadEventsJsonl, readJson, resolveRepoRoot } from '../registry/registry-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);

const EVENTS_FILE = path.resolve(ROOT_DIR, 'runtime/registry/events.jsonl');
const SNAPSHOT_FILE = path.resolve(ROOT_DIR, 'runtime/registry/snapshot.json');
const DASHBOARD_FILE = path.resolve(ROOT_DIR, 'runtime/registry/dashboard.md');
const CYCLES_FILE = path.resolve(ROOT_DIR, 'runtime/registry/cycles.json');

function verifyIntegrity() {
  assert(fs.existsSync(EVENTS_FILE), 'events.jsonl manquant');
  assert(fs.existsSync(SNAPSHOT_FILE), 'snapshot.json manquant');
  assert(fs.existsSync(DASHBOARD_FILE), 'dashboard.md manquant');
  assert(fs.existsSync(CYCLES_FILE), 'cycles.json manquant');

  const events = loadEventsJsonl(EVENTS_FILE);
  const snapshot = readJson(SNAPSHOT_FILE);
  const cycles = readJson(CYCLES_FILE);

  assert(Number(snapshot.eventCount) === events.length, `snapshot.eventCount (${snapshot.eventCount}) != events (${events.length})`);

  const seenIds = new Set();
  let lastTs = null;
  for (const e of events) {
    if (e.schemaVersion === 2) {
      assert(typeof e.id === 'string' && e.id.length === 26, 'event.id invalide (ULID 26 chars)');
      assert(!seenIds.has(e.id), `event.id dupliqué: ${e.id}`);
      seenIds.add(e.id);
      assert(typeof e.timestamp === 'string' && !Number.isNaN(Date.parse(e.timestamp)), 'event.timestamp invalide');
      const ts = Date.parse(e.timestamp);
      if (lastTs !== null) {
        assert(ts >= lastTs, 'timestamps non-monotones (append-only suspect)');
      }
      lastTs = ts;
      assert(typeof e.type === 'string' && e.type.length > 0, 'event.type manquant');
      assert(typeof e.cycleId === 'string' && e.cycleId.length > 0, 'event.cycleId manquant');
    }
  }

  const activeCycleId = cycles.activeCycleId;
  if (activeCycleId) {
    assert(cycles.open.some((c) => c.id === activeCycleId), 'cycles.activeCycleId ne pointe pas vers un cycle ouvert');
  }
  assert(Array.isArray(cycles.open) && Array.isArray(cycles.closed), 'cycles.open/closed invalides');

  console.log('✅ registry-integrity: PASS');
}

try {
  verifyIntegrity();
} catch (e) {
  console.error(`❌ registry-integrity: FAIL\n${e.message}`);
  process.exit(1);
}
