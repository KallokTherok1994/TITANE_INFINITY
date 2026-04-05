#!/usr/bin/env node
/**
 * TITANE∞ — Version Synchronization Script
 *
 * Ensures that the version declared in package.json is propagated to:
 *   - src-tauri/Cargo.toml  (version = "x.y.z")
 *   - src-tauri/tauri.conf.json  (version field)
 *   - runtime/stable/tauri.conf.json  (stable runtime version field)
 *
 * Phase 4.3 — Build artifact consolidation
 *
 * Usage: node scripts/sync-versions.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// ── 1. Read source-of-truth version from package.json ────────────────────────

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

if (!version) {
  console.error('❌ No version field in package.json');
  process.exit(1);
}

console.log(`📦 Source version: ${version}`);

let changed = 0;

// ── 2. Sync Cargo.toml ────────────────────────────────────────────────────────

const cargoPath = path.join(root, 'src-tauri', 'Cargo.toml');
if (fs.existsSync(cargoPath)) {
  const cargo = fs.readFileSync(cargoPath, 'utf8');
  // Match the version line at the top of [package] section
  const updated = cargo.replace(/^(version\s*=\s*")[^"]*(")/m, `$1${version}$2`);

  if (updated !== cargo) {
    if (!dryRun) fs.writeFileSync(cargoPath, updated, 'utf8');
    console.log(`  ✅ src-tauri/Cargo.toml → ${version}`);
    changed++;
  } else {
    console.log(`  ✓  src-tauri/Cargo.toml already at ${version}`);
  }
} else {
  console.warn('  ⚠️  src-tauri/Cargo.toml not found, skipping');
}

// ── 3. Sync tauri.conf.json ───────────────────────────────────────────────────

const tauriConfPath = path.join(root, 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(tauriConfPath)) {
  const conf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));

  let tauriChanged = false;

  // Tauri v2: version lives under package.version
  if (conf.package?.version !== undefined && conf.package.version !== version) {
    conf.package.version = version;
    tauriChanged = true;
  }

  // Tauri v2 (newer): version at root
  if (conf.version !== undefined && conf.version !== version) {
    conf.version = version;
    tauriChanged = true;
  }

  if (tauriChanged) {
    if (!dryRun) fs.writeFileSync(tauriConfPath, JSON.stringify(conf, null, 2) + '\n');
    console.log(`  ✅ src-tauri/tauri.conf.json → ${version}`);
    changed++;
  } else {
    console.log(`  ✓  src-tauri/tauri.conf.json already at ${version}`);
  }
} else {
  console.warn('  ⚠️  src-tauri/tauri.conf.json not found, skipping');
}

// ── 4. Sync runtime/stable/tauri.conf.json (stable build config) ───────────

const runtimeStableTauriConfPath = path.join(
  root,
  'runtime',
  'stable',
  'tauri.conf.json'
);
if (fs.existsSync(runtimeStableTauriConfPath)) {
  const conf = JSON.parse(fs.readFileSync(runtimeStableTauriConfPath, 'utf8'));

  let tauriChanged = false;

  if (conf.package?.version !== undefined && conf.package.version !== version) {
    conf.package.version = version;
    tauriChanged = true;
  }

  if (conf.version !== undefined && conf.version !== version) {
    conf.version = version;
    tauriChanged = true;
  }

  if (tauriChanged) {
    if (!dryRun) {
      fs.writeFileSync(runtimeStableTauriConfPath, JSON.stringify(conf, null, 2) + '\n');
    }
    console.log(`  ✅ runtime/stable/tauri.conf.json → ${version}`);
    changed++;
  } else {
    console.log(`  ✓  runtime/stable/tauri.conf.json already at ${version}`);
  }
} else {
  console.warn('  ⚠️  runtime/stable/tauri.conf.json not found, skipping');
}

// ── 5. Sync tauri.base.json (template) ───────────────────────────────────────

const tauriBasePath = path.join(root, 'tauri.base.json');
if (fs.existsSync(tauriBasePath)) {
  const base = JSON.parse(fs.readFileSync(tauriBasePath, 'utf8'));

  let baseChanged = false;

  if (base.version !== undefined && base.version !== version) {
    base.version = version;
    baseChanged = true;
  }

  if (baseChanged) {
    if (!dryRun) fs.writeFileSync(tauriBasePath, JSON.stringify(base, null, 2) + '\n');
    console.log(`  ✅ tauri.base.json → ${version}`);
    changed++;
  } else {
    console.log(`  ✓  tauri.base.json already at ${version}`);
  }
} else {
  console.warn('  ⚠️  tauri.base.json not found, skipping');
}

// ── 6. Sync runtime/stable/manifest.json (deployment metadata) ──────────────

const runtimeStableManifestPath = path.join(root, 'runtime', 'stable', 'manifest.json');
if (fs.existsSync(runtimeStableManifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(runtimeStableManifestPath, 'utf8'));

  let manifestChanged = false;

  if (manifest.version !== undefined && manifest.version !== version) {
    manifest.version = version;
    manifestChanged = true;
  }

  if (manifestChanged) {
    if (!dryRun) {
      fs.writeFileSync(
        runtimeStableManifestPath,
        JSON.stringify(manifest, null, 2) + '\n'
      );
    }
    console.log(`  ✅ runtime/stable/manifest.json → ${version}`);
    changed++;
  } else {
    console.log(`  ✓  runtime/stable/manifest.json already at ${version}`);
  }
} else {
  console.warn('  ⚠️  runtime/stable/manifest.json not found, skipping');
}

// ── Summary ───────────────────────────────────────────────────────────────────

if (dryRun) {
  console.log(`\nDry run: ${changed} file(s) would be updated.`);
} else {
  console.log(`\n✅ Version sync complete. ${changed} file(s) updated.`);
}
