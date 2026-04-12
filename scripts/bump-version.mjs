#!/usr/bin/env node
/**
 * TITANE∞ — Patch Version Bump Script (Rule 13)
 *
 * Increments the patch segment of the version in package.json by 0.0.1
 * then delegates full sync (Cargo.toml, tauri.conf.json, runtime) to sync-versions.mjs.
 *
 * Usage:
 *   node scripts/bump-version.mjs          # bump + sync
 *   node scripts/bump-version.mjs --dry-run  # preview only, no writes
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// ── 1. Read package.json ──────────────────────────────────────────────────────

const pkgPath = path.join(root, 'package.json');
const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);
const current = pkg.version;

if (!current || !/^\d+\.\d+\.\d+$/.test(current)) {
  console.error(`❌ Invalid version in package.json: ${current}`);
  process.exit(1);
}

// ── 2. Bump patch ─────────────────────────────────────────────────────────────

const parts = current.split('.');
const major = parts[0];
const minor = parts[1];
const patch = parseInt(parts[2], 10);
const next = `${major}.${minor}.${patch + 1}`;

console.log(`📦 Version bump: ${current} → ${next}${dryRun ? ' (dry-run)' : ''}`);

if (!dryRun) {
  pkg.version = next;
  // Preserve description version tag if it contains the old version
  if (pkg.description && pkg.description.includes(current)) {
    pkg.description = pkg.description.replace(current, next);
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`  ✅ package.json → ${next}`);

  // ── 3. Sync all downstream version files ────────────────────────────────────
  const syncScript = path.join(__dirname, 'sync-versions.mjs');
  if (fs.existsSync(syncScript)) {
    try {
      execFileSync(process.execPath, [syncScript], { stdio: 'inherit', cwd: root });
    } catch (err) {
      console.error(
        `❌ sync-versions.mjs failed. Run it manually: node scripts/sync-versions.mjs`
      );
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  } else {
    console.warn('  ⚠️  sync-versions.mjs not found, skipping downstream sync');
  }

  console.log(`\n✅ Version bumped to ${next}`);
} else {
  console.log(`  ℹ️  Dry-run: no files written. Would set version to ${next}`);
}
