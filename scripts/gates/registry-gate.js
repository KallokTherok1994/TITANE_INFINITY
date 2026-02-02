#!/usr/bin/env node
/**
 * TITANE∞ vΩ.STABLE0 — GATE_REGISTRY (repo-events.jsonl)
 * Bloquant: toute modification infra/devops/config doit être loggée
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.join(__dirname, '../../registry/repo-events.jsonl');

const INFRA_PATTERNS = [
  '.github/workflows/',
  'scripts/',
  'src-tauri/',
  'config/',
  'runtime/',
  'package.json',
  'pnpm-lock.yaml',
  'tauri.conf.json',
  'tauri.base.json',
];

const REQUIRED_FIELDS = [
  'id',
  'ts',
  'category',
  'scope',
  'change_type',
  'summary',
  'reason',
  'files_changed',
  'tests_run',
  'proofs',
  'risk_level',
  'rollback',
  'status',
];

function getModifiedFiles() {
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    const unstaged = execSync('git diff --name-only', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    return [...new Set([...staged, ...unstaged])];
  } catch {
    return [];
  }
}

function isInfraFile(file) {
  return INFRA_PATTERNS.some(pattern => file.includes(pattern));
}

function parseRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) return [];
  const content = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function getLastEntry() {
  const entries = parseRegistry();
  return entries[entries.length - 1];
}

function validateEntry(entry) {
  const missing = REQUIRED_FIELDS.filter(field => !entry?.[field]);
  return { valid: missing.length === 0, missing };
}

function filesCovered(modifiedFiles, entry) {
  if (!entry?.files_changed) return false;
  const infraFiles = modifiedFiles.filter(isInfraFile);
  if (infraFiles.length === 0) return true;
  return infraFiles.every(file =>
    entry.files_changed.some(recorded => file.includes(recorded) || recorded.includes(file))
  );
}

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  GATE_REGISTRY — Repo events required for infra changes  ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

const modifiedFiles = getModifiedFiles();
const infraFiles = modifiedFiles.filter(isInfraFile);

console.log(`📂 Fichiers modifiés: ${modifiedFiles.length}`);
console.log(`🛠️  Fichiers infra: ${infraFiles.length}\n`);

if (infraFiles.length === 0) {
  console.log('✅ PASS: Aucun fichier infra modifié');
  process.exit(0);
}

if (!fs.existsSync(REGISTRY_PATH)) {
  console.error(`❌ FAIL: Registre repo manquant: ${REGISTRY_PATH}`);
  process.exit(1);
}

const lastEntry = getLastEntry();
if (!lastEntry) {
  console.error('❌ FAIL: Registre repo vide');
  process.exit(1);
}

const validation = validateEntry(lastEntry);
if (!validation.valid) {
  console.error('❌ FAIL: Entry repo incomplète');
  console.error(`Champs manquants: ${validation.missing.join(', ')}`);
  process.exit(1);
}

if (!filesCovered(modifiedFiles, lastEntry)) {
  console.error('❌ FAIL: Fichiers infra non documentés dans repo-events.jsonl');
  const uncovered = infraFiles.filter(file =>
    !lastEntry.files_changed.some(recorded => file.includes(recorded) || recorded.includes(file))
  );
  uncovered.forEach(file => console.error(`  - ${file}`));
  process.exit(1);
}

console.log('✅ PASS: Entry repo valide et à jour');
process.exit(0);
