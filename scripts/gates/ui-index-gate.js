#!/usr/bin/env node
/**
 * TITANE∞ vΩ.3 — UI Index Gate
 * Enforcement gate: bloque les modifications UI sans entry dans ui-events.jsonl
 * © 2026 TITANE Team. All rights reserved.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const UI_REGISTRY_PATH = path.join(__dirname, '../registry/ui-events.jsonl');

// Fichiers UI critiques (toute modification = entry requise)
const UI_CRITICAL_PATTERNS = [
  'src/components/layout/AppShell.*',
  'src/components/layout/TopNav.*',
  'src/pages/**/*.tsx',
  'src/pages/**/*.css',
  'src/components/**/navigation/**',
  'src/components/**/header/**',
];

// Champs obligatoires dans une entry UI
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

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Obtient les fichiers modifiés (git diff)
 */
function getModifiedFiles() {
  try {
    // Fichiers staged
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    // Fichiers unstaged
    const unstaged = execSync('git diff --name-only', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    return [...new Set([...staged, ...unstaged])];
  } catch (error) {
    console.warn('[GATE_UI_INDEX] Warning: git non disponible, skip check');
    return [];
  }
}

/**
 * Vérifie si un fichier correspond aux patterns UI critiques
 */
function isUICriticalFile(filename) {
  return UI_CRITICAL_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\//g, '\\/'));
    return regex.test(filename);
  });
}

/**
 * Parse le registre UI (JSONL)
 */
function parseUIRegistry() {
  if (!fs.existsSync(UI_REGISTRY_PATH)) {
    return [];
  }
  
  const content = fs.readFileSync(UI_REGISTRY_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (error) {
      console.warn(`[GATE_UI_INDEX] Warning: invalid JSON line: ${line}`);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Obtient la dernière entry du registre
 */
function getLastRegistryEntry() {
  const entries = parseUIRegistry();
  return entries[entries.length - 1];
}

/**
 * Valide qu'une entry a tous les champs requis
 */
function validateEntry(entry) {
  const missing = REQUIRED_FIELDS.filter(field => !entry[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Vérifie si les fichiers modifiés sont couverts par la dernière entry
 */
function filesAreCovered(modifiedFiles, entry) {
  if (!entry || !entry.files_changed) return false;
  
  const uiFiles = modifiedFiles.filter(isUICriticalFile);
  if (uiFiles.length === 0) return true; // Aucun fichier UI = pas de check
  
  // Tous les fichiers UI modifiés doivent être dans files_changed
  return uiFiles.every(file => 
    entry.files_changed.some(recorded => 
      file.includes(recorded) || recorded.includes(file)
    )
  );
}

// ═══════════════════════════════════════════════════════════════
// GATE LOGIC
// ═══════════════════════════════════════════════════════════════

function runGate() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  GATE_UI_INDEX — UI Modifications Require Registry      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // 1. Obtenir les fichiers modifiés
  const modifiedFiles = getModifiedFiles();
  const uiModifiedFiles = modifiedFiles.filter(isUICriticalFile);
  
  console.log(`📂 Fichiers modifiés: ${modifiedFiles.length}`);
  console.log(`🎨 Fichiers UI critiques: ${uiModifiedFiles.length}\n`);
  
  if (uiModifiedFiles.length === 0) {
    console.log('✅ PASS: Aucun fichier UI critique modifié\n');
    return { passed: true };
  }
  
  console.log('Fichiers UI modifiés:');
  uiModifiedFiles.forEach(f => console.log(`  - ${f}`));
  console.log('');
  
  // 2. Vérifier existence du registre
  if (!fs.existsSync(UI_REGISTRY_PATH)) {
    console.error(`❌ FAIL: Registre UI manquant: ${UI_REGISTRY_PATH}`);
    console.error('Créer le registre avec au moins une entry pour ce changement.\n');
    return { passed: false, reason: 'REGISTRY_MISSING' };
  }
  
  // 3. Obtenir la dernière entry
  const lastEntry = getLastRegistryEntry();
  if (!lastEntry) {
    console.error('❌ FAIL: Registre UI vide');
    console.error('Ajouter une entry pour documenter ce changement.\n');
    return { passed: false, reason: 'REGISTRY_EMPTY' };
  }
  
  console.log(`📝 Dernière entry UI: ${lastEntry.id} (${lastEntry.ts})\n`);
  
  // 4. Valider les champs requis
  const validation = validateEntry(lastEntry);
  if (!validation.valid) {
    console.error('❌ FAIL: Entry UI incomplète');
    console.error(`Champs manquants: ${validation.missing.join(', ')}\n`);
    return { passed: false, reason: 'ENTRY_INCOMPLETE', missing: validation.missing };
  }
  
  // 5. Vérifier que les fichiers modifiés sont couverts
  if (!filesAreCovered(modifiedFiles, lastEntry)) {
    console.error('❌ FAIL: Fichiers UI modifiés non documentés');
    console.error('Les fichiers suivants ne sont pas listés dans files_changed:');
    const uncovered = uiModifiedFiles.filter(f => 
      !lastEntry.files_changed.some(recorded => f.includes(recorded) || recorded.includes(f))
    );
    uncovered.forEach(f => console.error(`  - ${f}`));
    console.error('\nAjouter une nouvelle entry ou mettre à jour la dernière.\n');
    return { passed: false, reason: 'FILES_NOT_COVERED', uncovered };
  }
  
  // 6. Vérifier tests_run
  if (!lastEntry.tests_run || lastEntry.tests_run.length === 0) {
    console.warn('⚠️  WARNING: Aucun test documenté dans tests_run');
    console.warn('Recommandé: ajouter au moins un test de non-régression.\n');
  }
  
  // 7. Vérifier rollback
  if (!lastEntry.rollback || lastEntry.rollback.trim() === '') {
    console.warn('⚠️  WARNING: Aucun rollback plan documenté');
    console.warn('Recommandé: spécifier comment annuler ce changement.\n');
  }
  
  console.log('✅ PASS: Entry UI valide et à jour\n');
  console.log('Entry details:');
  console.log(`  ID: ${lastEntry.id}`);
  console.log(`  Scope: ${lastEntry.scope}`);
  console.log(`  Type: ${lastEntry.change_type}`);
  console.log(`  Summary: ${lastEntry.summary}`);
  console.log(`  Risk: ${lastEntry.risk_level}`);
  console.log(`  Status: ${lastEntry.status}`);
  console.log('');
  
  return { passed: true, entry: lastEntry };
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const result = runGate();

if (!result.passed) {
  console.error('╔══════════════════════════════════════════════════════════╗');
  console.error('║  GATE BLOCKED: UI modifications require documentation   ║');
  console.error('╚══════════════════════════════════════════════════════════╝\n');
  console.error('Action requise:');
  console.error('1. Créer/mettre à jour une entry dans registry/ui-events.jsonl');
  console.error('2. Inclure tous les champs obligatoires');
  console.error('3. Lister tous les fichiers UI modifiés');
  console.error('4. Documenter les tests + rollback plan\n');
  console.error('Voir: docs/governance/UI_NAVIGATION_CONSTITUTION.md Article 5\n');
  process.exit(1);
}

console.log('✅ Gate passed — modifications UI correctement documentées\n');
process.exit(0);
