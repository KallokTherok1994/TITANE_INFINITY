#!/usr/bin/env node
/**
 * TITANE∞ Registry - Quality Gate (semantic)
 * Usage: pnpm verify:registry:quality
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assert,
  loadEventsJsonl,
  looksLikeSecret,
  resolveRepoRoot,
} from '../registry/registry-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);

const EVENTS_FILE = path.resolve(ROOT_DIR, 'runtime/registry/events.jsonl');

const VALID_TYPES = new Set([
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
]);

const BANNED_NEXT = [/^continue$/i, /^next$/i, /^later$/i, /^todo$/i, /^fix$/i];

function isVague(desc) {
  const d = desc.trim();
  if (d.length < 20) return true;
  if (/^(update|fix|changes|misc|cleanup|wip)\b/i.test(d)) return true;
  const hasSignal =
    /\.(ts|tsx|js|yml|json|md)\b/i.test(d) ||
    d.includes('/') ||
    /\b(pnpm|vitest|cargo|tauri|workflow|gate|suite)\b/i.test(d) ||
    /\d/.test(d);
  return !hasSignal;
}

function verifyQuality() {
  assert(fs.existsSync(EVENTS_FILE), 'events.jsonl manquant');
  const events = loadEventsJsonl(EVENTS_FILE).filter(e => e && e.schemaVersion === 2);

  const attemptKeys = new Map();
  for (const e of events) {
    assert(VALID_TYPES.has(e.type), `type invalide: ${e.type}`);
    assert(
      typeof e.description === 'string' && e.description.trim().length >= 20,
      'description trop courte'
    );
    assert(!isVague(e.description), 'description vague');
    assert(!looksLikeSecret(e.description), 'secret détecté (description)');
    if (e.meta?.command)
      assert(!looksLikeSecret(e.meta.command), 'secret détecté (command)');

    assert(
      ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(e.severity),
      'severity invalide'
    );
    assert(
      ['TESTS', 'CI', 'ARCHITECTURE', 'SECURITY', 'DELIVERY'].includes(e.impact),
      'impact invalide'
    );
    assert(['P0', 'P1', 'P2', 'P3'].includes(e.priority), 'priority invalide');
    assert(typeof e.owner === 'string' && e.owner.trim().length > 0, 'owner manquant');
    assert(typeof e.attempt === 'number' && e.attempt >= 1, 'attempt invalide');

    if (e.type !== 'CYCLE_END') {
      assert(
        Array.isArray(e.next_actions) && e.next_actions.length >= 1,
        'next_actions manquant'
      );
    }
    if (Array.isArray(e.next_actions)) {
      for (const a of e.next_actions) {
        assert(
          typeof a === 'string' && a.trim().length >= 8,
          'next_actions item trop court'
        );
        assert(!BANNED_NEXT.some(r => r.test(a.trim())), 'next_actions trop générique');
      }
    }

    const key = `${e.cycleId}::${e.type}::${e.attempt}`;
    if (attemptKeys.has(key)) {
      assert(
        typeof e.meta?.justification === 'string' &&
          e.meta.justification.trim().length >= 15,
        'attempt répété sans justification'
      );
    }
    attemptKeys.set(key, true);
  }

  console.log('✅ registry-quality: PASS');
}

try {
  verifyQuality();
} catch (e) {
  console.error(`❌ registry-quality: FAIL\n${e.message}`);
  process.exit(1);
}
