#!/usr/bin/env node
/**
 * TITANE_INFINITY v27.0.1 — Proprietary License
 * © 2025-2026 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * GATE A: Vérification des assets relatifs dans dist/index.html
 * But: Empêcher les assets absolus (/vite.svg, /manifest.json) qui échouent en AppImage/DEB
 * Status: BLOQUANT (exit 1 si assets absolus détectés)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DIST_INDEX = join(process.cwd(), 'dist', 'index.html');

// ✅ GATE A: Vérifier absence d'assets absolus
const runGateDistAssets = () => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  GATE A: Assets Relatifs dans dist/index.html                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  if (!existsSync(DIST_INDEX)) {
    console.error('❌ FAIL: dist/index.html introuvable');
    console.error(`   Path: ${DIST_INDEX}`);
    console.error('   Exécutez "pnpm run build" avant ce gate.\n');
    process.exit(1);
  }

  const content = readFileSync(DIST_INDEX, 'utf-8');

  // Patterns interdits (assets absolus)
  const forbiddenPatterns = [
    { pattern: /href="\/vite\.svg"/g, name: 'href="/vite.svg"' },
    { pattern: /src="\/vite\.svg"/g, name: 'src="/vite.svg"' },
    { pattern: /href="\/manifest\.json"/g, name: 'href="/manifest.json"' },
    { pattern: /src="\/assets\//g, name: 'src="/assets/' },
    { pattern: /href="\/assets\//g, name: 'href="/assets/' },
    { pattern: /src="\/src\//g, name: 'src="/src/' },
    { pattern: /href="\/src\//g, name: 'href="/src/' },
  ];

  const violations = [];

  for (const { pattern, name } of forbiddenPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({ name, count: matches.length });
    }
  }

  if (violations.length > 0) {
    console.error('❌ FAIL: Assets absolus détectés dans dist/index.html\n');
    console.error('Les assets suivants utilisent des chemins absolus:');
    for (const v of violations) {
      console.error(`   - ${v.name} (${v.count} occurrence${v.count > 1 ? 's' : ''})`);
    }
    console.error('\n🔧 FIX: Dans index.html source, remplacez:');
    console.error('   href="/vite.svg"        →  href="./vite.svg"');
    console.error('   href="/manifest.json"   →  href="./manifest.json"');
    console.error('   src="/assets/..."       →  src="./assets/..."');
    console.error('\n💡 RAISON: Les assets absolus (/...) échouent en production');
    console.error('           (AppImage/DEB utilisent file:// sans serveur HTTP).\n');
    process.exit(1);
  }

  console.log('✅ PASS: Tous les assets utilisent des chemins relatifs');
  console.log('         (vérifiés: vite.svg, manifest.json, /assets/, /src/)\n');
  process.exit(0);
};

runGateDistAssets();
