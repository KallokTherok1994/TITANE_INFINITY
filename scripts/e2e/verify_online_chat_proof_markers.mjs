#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

export const REQUIRED_RUNTIME_MARKERS = [
  'reasoning-progress',
  'data-runtime-mode',
  'data-runtime-duration',
  'data-runtime-quality',
  'data-runtime-save',
  'data-runtime-search',
  'data-runtime-sources',
];

function walkFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    if (/\.(?:html|js|mjs|cjs|css)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

export function getEmbeddedProofCandidateFiles(distDir = 'dist') {
  const absoluteDistDir = path.resolve(distDir);
  return walkFiles(absoluteDistDir);
}

export function verifyOnlineChatProofMarkers({
  distDir = 'dist',
  requiredMarkers = REQUIRED_RUNTIME_MARKERS,
} = {}) {
  const absoluteDistDir = path.resolve(distDir);
  const candidateFiles = getEmbeddedProofCandidateFiles(absoluteDistDir);

  if (candidateFiles.length === 0) {
    return {
      ok: false,
      distDir: absoluteDistDir,
      candidateFiles: [],
      missingMarkers: [...requiredMarkers],
      matchedMarkers: [],
      reason: 'NO_DIST_ASSETS',
    };
  }

  const markerMatches = new Map(requiredMarkers.map(marker => [marker, false]));

  for (const filePath of candidateFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const marker of requiredMarkers) {
      if (!markerMatches.get(marker) && content.includes(marker)) {
        markerMatches.set(marker, true);
      }
    }
  }

  const matchedMarkers = requiredMarkers.filter(marker => markerMatches.get(marker));
  const missingMarkers = requiredMarkers.filter(marker => !markerMatches.get(marker));

  return {
    ok: missingMarkers.length === 0,
    distDir: absoluteDistDir,
    candidateFiles,
    matchedMarkers,
    missingMarkers,
    reason: missingMarkers.length === 0 ? 'MARKERS_PRESENT' : 'MISSING_RUNTIME_MARKERS',
  };
}

function main() {
  const distDir = process.argv[2] || process.env.TITANE_E2E_DIST_DIR || 'dist';
  const result = verifyOnlineChatProofMarkers({ distDir });

  if (result.ok) {
    console.log(
      `[E2E_EMBEDDED_FRESHNESS] PASS dist=${result.distDir} files=${result.candidateFiles.length} markers=${result.matchedMarkers.length}`
    );
    return;
  }

  const nextStep = 'Run pnpm run build:tauri:e2e before retrying the embedded desktop proof.';
  console.error(
    `[E2E_EMBEDDED_FRESHNESS] FAIL reason=${result.reason} dist=${result.distDir}`
  );
  console.error(
    `[E2E_EMBEDDED_FRESHNESS] missing_markers=${JSON.stringify(result.missingMarkers)}`
  );
  console.error(`[E2E_EMBEDDED_FRESHNESS] next_step=${nextStep}`);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}