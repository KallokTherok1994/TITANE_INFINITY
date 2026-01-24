#!/usr/bin/env node
/**
 * TITANE∞ Registry - Rebuild Snapshot from Events (Schema v2)
 * Usage: pnpm registry:snapshot
 * Reads events.jsonl + cycles.json and rebuilds snapshot.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEventsJsonl, nowIso, readJson, resolveRepoRoot, writeJson } from './registry-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);
const EVENTS_FILE = path.resolve(ROOT_DIR, 'runtime/registry/events.jsonl');
const SNAPSHOT_FILE = path.resolve(ROOT_DIR, 'runtime/registry/snapshot.json');
const CYCLES_FILE = path.resolve(ROOT_DIR, 'runtime/registry/cycles.json');

function loadCurrentSnapshot() {
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    return {
      version: '1.0.0',
      lastUpdate: null,
      eventCount: 0,
      suites: {},
      gates: {},
      combined: {},
      registry: {},
    };
  }
  
  return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
}

function loadCycles() {
  if (!fs.existsSync(CYCLES_FILE)) {
    return {
      schemaVersion: 2,
      generatedAt: null,
      activeCycleId: null,
      open: [],
      closed: [],
    };
  }
  return readJson(CYCLES_FILE);
}

function findLast(events, predicate) {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (predicate(e)) return e;
  }
  return null;
}

function pickPriorityAction(event) {
  if (!event || !Array.isArray(event.next_actions)) return null;
  return event.next_actions.find((a) => typeof a === 'string' && a.trim().length > 0) || null;
}

function rebuildSnapshot() {
  const events = loadEventsJsonl(EVENTS_FILE);
  const snapshot = loadCurrentSnapshot();
  const cycles = loadCycles();
  
  console.log(`📋 Processing ${events.length} events...`);
  
  // Update metadata
  snapshot.lastUpdate = nowIso();
  snapshot.eventCount = events.length;

  const activeCycleId = cycles.activeCycleId;
  const activeCycle = activeCycleId ? cycles.open.find((c) => c.id === activeCycleId) : null;
  const eventsInCycle = activeCycleId ? events.filter((e) => e && e.cycleId === activeCycleId) : [];

  const lastEvent = findLast(eventsInCycle, (e) => e && e.schemaVersion === 2) || findLast(events, (e) => e && e.schemaVersion === 2);
  const lastDecision = findLast(eventsInCycle, (e) => e && e.type === 'DECISION' && e.schemaVersion === 2);
  const lastTestRun = findLast(eventsInCycle, (e) => e && e.type === 'TEST_RUN' && e.schemaVersion === 2);
  const lastIncident = findLast(eventsInCycle, (e) => e && e.type === 'INCIDENT' && e.schemaVersion === 2);

  const lastWithBlockers = findLast(eventsInCycle, (e) => e && Array.isArray(e.blockers) && e.blockers.length > 0 && e.schemaVersion === 2);
  const nextBlocker = lastWithBlockers ? lastWithBlockers.blockers[0] : null;

  const priorityActionUnique = pickPriorityAction(lastEvent) || pickPriorityAction(lastDecision) || (lastIncident ? pickPriorityAction(lastIncident) : null);

  snapshot.registry = {
    schemaVersion: 2,
    activeCycleId: activeCycleId || null,
    currentObjective: activeCycle ? activeCycle.objective : null,
    lastDecision: lastDecision
      ? { id: lastDecision.id, timestamp: lastDecision.timestamp, description: lastDecision.description, owner: lastDecision.owner, priority: lastDecision.priority }
      : null,
    lastTestRun: lastTestRun
      ? {
          id: lastTestRun.id,
          timestamp: lastTestRun.timestamp,
          suiteId: lastTestRun.meta?.suiteId || null,
          command: lastTestRun.meta?.command || null,
          duration_ms: lastTestRun.meta?.duration_ms ?? null,
          passed: lastTestRun.meta?.passed ?? null,
          failed: lastTestRun.meta?.failed ?? null,
        }
      : null,
    nextBlocker,
    priorityActionUnique,
    lastEvent: lastEvent ? { id: lastEvent.id, timestamp: lastEvent.timestamp, type: lastEvent.type } : null,
  };
  
  // Process events to update snapshot state
  for (const event of events) {
    switch (event.type) {
      case 'SUITE_ADDED':
        if (event.suiteId && event.suiteData) {
          snapshot.suites[event.suiteId] = event.suiteData;
        }
        break;
      case 'SUITE_REMOVED':
        if (event.suiteId) {
          delete snapshot.suites[event.suiteId];
        }
        break;
      case 'GATE_ADDED':
        if (event.gateId && event.gateData) {
          snapshot.gates[event.gateId] = event.gateData;
        }
        break;
      case 'GATE_REMOVED':
        if (event.gateId) {
          delete snapshot.gates[event.gateId];
        }
        break;
      // Other event types are logged but don't modify snapshot structure
    }
  }
  
  // Write updated snapshot
  snapshot.$schema = './schemas/snapshot.schema.json';
  writeJson(SNAPSHOT_FILE, snapshot);
  
  console.log('✅ Snapshot rebuilt:');
  console.log(`   - Suites: ${Object.keys(snapshot.suites).length}`);
  console.log(`   - Gates: ${Object.keys(snapshot.gates).length}`);
  console.log(`   - Events processed: ${snapshot.eventCount}`);
}

rebuildSnapshot();

