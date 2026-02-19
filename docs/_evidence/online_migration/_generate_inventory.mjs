#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const raw = readFileSync('docs/_evidence/online_migration/01_scan_raw.txt', 'utf-8');
const lines = raw.split('\n');

const inventory = [];
let idCounter = 1;

// Patterns à identifier et tracker
const targetPatterns = {
  DOC_LOCAL_FIRST: /local[-\s]?first/i,
  DOC_OFFLINE: /offline\s*[:=]\s*true|mode.*hors.*ligne/i,
  SCRIPT_VERIFY: /verify.*local[-_]first|enforce[-_]local[-_]first/i,
  INSTRUCTIONS: /copilot-instructions\.md|titane\.instructions\.md/i,
  README: /README\.md.*local[-\s]first|local[-\s]only/i,
  PACKAGE_JSON: /package\.json.*verify:local-first/i,
  NETWORK_POLICY: /no\s+network|no\s+internet|local\s+uniquement/i,
  EXTERNAL_AI: /VITE_ENABLE_EXTERNAL_AI|enable_external_ai/i,
  FETCH_PATTERN: /fetch\(|https?:\/\/|localhost|127\.0\.0\.1|11434/i,
};

// Files à tracker explicitement
const criticalFiles = new Set();

for (const line of lines) {
  if (!line.match(/^\.\/[^:]+:\d+:/)) continue;
  
  const match = line.match(/^(\.\/[^:]+):(\d+):(.*)/);
  if (!match) continue;
  
  const [, file, lineNum, content] = match;
  
  // Catégoriser le fichier
  let category = 'OTHER';
  let action = 'REVIEW';
  
  if (file.includes('/.github/') || file.includes('instructions')) {
    category = 'INSTRUCTIONS';
    action = 'REWRITE';
  } else if (file.includes('/docs/')) {
    category = 'DOC';
    action = 'REWRITE';
  } else if (file.includes('package.json')) {
    category = 'CONFIG';
    action = 'RENAME';
  } else if (file.includes('/scripts/')) {
    category = 'SCRIPTS';
    action = 'INVERT';
  } else if (file.includes('/src-tauri/')) {
    category = 'TAURI';
    action = 'VERIFY';
  } else if (file.includes('/src/')) {
    category = 'RUNTIME_CODE';
    action = 'ADD_GUARD';
  } else if (file.includes('.github/')) {
    category = 'CI';
    action = 'VERIFY';
  }
  
  // Identifier le pattern matché
  let matchedPattern = 'GENERIC';
  for (const [name, regex] of Object.entries(targetPatterns)) {
    if (regex.test(content)) {
      matchedPattern = name;
      break;
    }
  }
  
  // Prioriser les fichiers critiques
  const isCritical = file.match(/\.(instructions|copilot-instructions|package\.json|README)/) ||
                     file.includes('enforce-local-first') ||
                     file.includes('verify/');
  
  if (isCritical || category !== 'OTHER') {
    criticalFiles.add(file);
    
    inventory.push({
      id: idCounter++,
      file: file.replace(/^\.\//, ''),
      line: parseInt(lineNum),
      match: content.trim().substring(0, 120),
      context: matchedPattern,
      category,
      action,
      priority: isCritical ? 'HIGH' : 'MEDIUM',
    });
  }
}

// Déduplication par fichier (garder première occurrence)
const seenFiles = new Set();
const dedupInventory = inventory.filter(item => {
  const key = `${item.file}:${item.context}`;
  if (seenFiles.has(key)) return false;
  seenFiles.add(key);
  return true;
});

// Tri par priorité + category
dedupInventory.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority === 'HIGH' ? -1 : 1;
  return a.category.localeCompare(b.category);
});

const output = {
  metadata: {
    generated: new Date().toISOString(),
    total_matches: inventory.length,
    unique_files: criticalFiles.size,
    deduplicated_entries: dedupInventory.length,
  },
  inventory: dedupInventory,
  scope_files: Array.from(criticalFiles).sort(),
};

writeFileSync('docs/_evidence/online_migration/01_inventory.json', JSON.stringify(output, null, 2));
console.log(`✓ Inventory generated: ${dedupInventory.length} entries, ${criticalFiles.size} files`);
