#!/usr/bin/env node
/**
 * TITANE∞ — AutoHeal Rules Deduplication Script
 * Removes duplicate entries from autoheal_rules.jsonl.
 *
 * Strategy:
 * 1. Reads all entries from autoheal_rules.jsonl
 * 2. Groups by normalized `signature` field (lowercase, trim, collapse whitespace)
 * 3. For entries without `signature`, groups by normalized `symptom` + `scope`
 * 4. Keeps FIRST entry in each group (preserving chronological order)
 * 5. Writes deduplicated entries back to autoheal_rules.jsonl
 * 6. Prints summary: total before, total after, duplicates removed
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = resolve(__dirname, 'autoheal_rules.jsonl');

function normalizeStr(str) {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/\s+/g, ' ');
}

function getGroupKey(entry) {
  if (entry.signature && String(entry.signature).trim()) {
    return 'sig:' + normalizeStr(entry.signature);
  }
  const scopeStr = Array.isArray(entry.scope)
    ? entry.scope.map(normalizeStr).sort().join('|')
    : normalizeStr(entry.scope);
  return 'sym+scope:' + normalizeStr(entry.symptom) + '@@' + scopeStr;
}

const raw = readFileSync(REGISTRY_PATH, 'utf8');
const lines = raw
  .split(/\r?\n/)
  .map(l => l.trim())
  .filter(Boolean);

const totalBefore = lines.length;
const seen = new Map(); // groupKey -> first entry (kept)
const seenIds = new Map(); // id -> first occurrence index (for strict dedup by id)
const kept = [];

for (let i = 0; i < lines.length; i++) {
  let entry;
  try {
    entry = JSON.parse(lines[i]);
  } catch {
    console.error(`WARN: skipping invalid JSON at line ${i + 1}`);
    continue;
  }

  const id = entry.id;

  // Strict dedup by exact id first
  if (id && seenIds.has(id)) {
    continue; // duplicate id — skip
  }

  const key = getGroupKey(entry);

  if (seen.has(key)) {
    // Near-duplicate by normalized key — skip
    continue;
  }

  seen.set(key, i);
  if (id) seenIds.set(id, i);
  kept.push(entry);
}

const totalAfter = kept.length;
const duplicatesRemoved = totalBefore - totalAfter;

// Write back
const output = kept.map(e => JSON.stringify(e)).join('\n') + '\n';
writeFileSync(REGISTRY_PATH, output, 'utf8');

console.log(`DEDUP SUMMARY:`);
console.log(`  Total before : ${totalBefore}`);
console.log(`  Total after  : ${totalAfter}`);
console.log(`  Duplicates   : ${duplicatesRemoved}`);
console.log(`DONE: autoheal_rules.jsonl deduplicated.`);
