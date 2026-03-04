#!/usr/bin/env bash
set -euo pipefail

REGISTRY="scripts/autoheal/autoheal_rules.jsonl"
if [[ ! -f "$REGISTRY" ]]; then
  echo "FAIL: missing $REGISTRY"
  exit 1
fi

node <<'NODE'
const fs = require('fs');
const p = 'scripts/autoheal/autoheal_rules.jsonl';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
if (lines.length === 0) {
  console.error('FAIL: empty autoheal registry');
  process.exit(1);
}
const required = ['id','date','scope','symptom','root_cause','fix','prevention_test','commands','files_changed','rollback'];
const ids = new Set();
for (let i = 0; i < lines.length; i++) {
  let row;
  try { row = JSON.parse(lines[i]); } catch (e) {
    console.error(`FAIL: invalid json at line ${i+1}`);
    process.exit(1);
  }
  for (const k of required) {
    const v = row[k];
    if (v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0)) {
      console.error(`FAIL: missing ${k} at line ${i+1}`);
      process.exit(1);
    }
  }
  if (ids.has(row.id)) {
    console.error(`FAIL: duplicate id ${row.id}`);
    process.exit(1);
  }
  ids.add(row.id);
}
const last = JSON.parse(lines[lines.length - 1]);
if (!String(last.prevention_test).includes('detect_recurrence')) {
  console.error('FAIL: last entry prevention_test must include detect_recurrence');
  process.exit(1);
}
console.log('PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX');
console.log('PASS: G_AH_RECURRENCE_GUARD_PASS');
console.log(`INFO: entries=${lines.length}`);
NODE
