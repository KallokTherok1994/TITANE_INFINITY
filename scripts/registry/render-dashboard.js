#!/usr/bin/env node
/**
 * TITANE∞ Registry - Render dashboard.md (human view)
 * Usage: pnpm registry:dashboard
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEventsJsonl, nowIso, readJson, resolveRepoRoot } from './registry-lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolveRepoRoot(__dirname);

const EVENTS_FILE = path.resolve(ROOT_DIR, 'runtime/registry/events.jsonl');
const SNAPSHOT_FILE = path.resolve(ROOT_DIR, 'runtime/registry/snapshot.json');
const CYCLES_FILE = path.resolve(ROOT_DIR, 'runtime/registry/cycles.json');
const DASHBOARD_FILE = path.resolve(ROOT_DIR, 'runtime/registry/dashboard.md');

function render() {
  const snapshot = fs.existsSync(SNAPSHOT_FILE) ? readJson(SNAPSHOT_FILE) : null;
  const cycles = fs.existsSync(CYCLES_FILE) ? readJson(CYCLES_FILE) : null;
  const events = loadEventsJsonl(EVENTS_FILE);

  const activeCycleId =
    snapshot?.registry?.activeCycleId || cycles?.activeCycleId || null;
  const activeCycle =
    activeCycleId && cycles ? cycles.open.find(c => c.id === activeCycleId) : null;
  const recent = events.slice(-12).reverse();

  const lines = [];
  lines.push('# TITANE∞ — Registry Dashboard');
  lines.push('');
  lines.push(`- Généré: ${nowIso()}`);
  lines.push(`- Cycle actif: ${activeCycleId || 'Aucun'}`);
  if (activeCycle?.objective) {
    lines.push(`- Objectif: ${activeCycle.objective}`);
  }
  if (snapshot?.registry?.priorityActionUnique) {
    lines.push(
      `- Action prioritaire (unique): ${snapshot.registry.priorityActionUnique}`
    );
  }
  if (snapshot?.registry?.nextBlocker) {
    lines.push(`- Blocage principal: ${snapshot.registry.nextBlocker}`);
  }
  lines.push('');

  lines.push('## Dernière décision');
  if (snapshot?.registry?.lastDecision) {
    const d = snapshot.registry.lastDecision;
    lines.push(
      `- ${d.timestamp} — ${d.description} (owner=${d.owner}, priority=${d.priority})`
    );
  } else {
    lines.push('- Aucune');
  }
  lines.push('');

  lines.push('## Dernier test_run');
  if (snapshot?.registry?.lastTestRun) {
    const t = snapshot.registry.lastTestRun;
    lines.push(
      `- ${t.timestamp} — suite=${t.suiteId || 'n/a'} failed=${t.failed ?? 'n/a'} passed=${t.passed ?? 'n/a'} duration_ms=${t.duration_ms ?? 'n/a'}`
    );
    if (t.command) lines.push(`- Commande: ${t.command}`);
  } else {
    lines.push('- Aucun');
  }
  lines.push('');

  lines.push('## Événements récents');
  if (recent.length === 0) {
    lines.push('- Aucun');
  } else {
    for (const e of recent) {
      const id = e.id ? e.id.slice(0, 10) : 'legacy';
      const desc = e.description
        ? String(e.description).replace(/\s+/g, ' ').trim()
        : '(no description)';
      lines.push(`- ${e.timestamp} [${id}] ${e.type}: ${desc}`);
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('Source: `runtime/registry/events.jsonl` (append-only)');
  lines.push('');

  fs.mkdirSync(path.dirname(DASHBOARD_FILE), { recursive: true });
  fs.writeFileSync(DASHBOARD_FILE, lines.join('\n') + '\n');
  console.log('✅ Dashboard rendered');
}

try {
  render();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
