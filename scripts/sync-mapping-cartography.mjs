#!/usr/bin/env node
// scripts/sync-mapping-cartography.mjs
// Synchronise les documents de mapping et cartographie TITANE (Règle 15)

import fs from 'fs';
import path from 'path';

const DOCS = [
  'UI_SURFACE_MAP.md',
  'docs/CARTOGRAPHY_COMPLETE.md',
  'ARCHITECTURE.md',
  'OLLAMA_RUNTIME_MAP.md',
  'RELEASE_SURFACE_INVENTORY.md',
  'docs/IPC_CATALOG.md',
];

function updateDateVersion(file, version) {
  let content = fs.readFileSync(file, 'utf8');
  const date = new Date().toISOString().split('T')[0];
  content = content.replace(/(Version\s*:?\s*)([\d.]+)/i, `$1${version}`);
  content = content.replace(/(Date\s*:?\s*)([\d-]+)/i, `$1${date}`);
  content = content.replace(
    /(Généré le|Mise à jour le|Generated:|Dernière génération\s*:?)[^\n]*/gi,
    `$1 ${date}`
  );
  fs.writeFileSync(file, content, 'utf8');
}

function main() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = pkg.version;
  for (const doc of DOCS) {
    if (fs.existsSync(doc)) {
      updateDateVersion(doc, version);
      console.log(`✔️  Synchronisé: ${doc}`);
    } else {
      console.warn(`⚠️  Fichier absent: ${doc}`);
    }
  }
}

main();
