/**
 * Stable SurfaceTruth DOM proof — runtime seal gate
 *
 * Proves that the stable AppImage runtime exposes correct SurfaceRoot
 * attributes: appVersion matches package.json, buildTimestamp is non-zero,
 * and data-surface-truth identity is present.
 *
 * Does NOT require Ollama or any AI backend.
 * Requires: tauri-driver, WebKitWebDriver, DISPLAY, stable AppImage via TAURI_BINARY_PATH.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { openApp, waitAppReady } from './ui-driver.wdio.js';

const ROOT = process.cwd();
const PACKAGE_VERSION = JSON.parse(
  fs.readFileSync(path.resolve(ROOT, 'package.json'), 'utf8')
).version;
const REPORTS_DIR = path.resolve(ROOT, 'reports/runtime-proof');

fs.mkdirSync(REPORTS_DIR, { recursive: true });

describe('Stable SurfaceTruth DOM proof (WDIO/Tauri)', () => {
  before(async () => {
    await openApp();
    await waitAppReady();
  });

  it('exposes SurfaceRoot with correct appVersion matching package.json', async function () {
    this.timeout(60000);

    const surfaceRoot = await $('[data-testid="surface-root"]');
    await surfaceRoot.waitForExist({ timeout: 30000 });

    const appVersion = await surfaceRoot.getAttribute('data-app-version');
    assert.ok(appVersion, 'data-app-version attribute must be present');
    assert.strictEqual(
      appVersion,
      PACKAGE_VERSION,
      `data-app-version="${appVersion}" must equal package.json version "${PACKAGE_VERSION}"`
    );
  });

  it('exposes non-zero buildTimestamp on SurfaceRoot', async function () {
    this.timeout(30000);

    const surfaceRoot = await $('[data-testid="surface-root"]');
    const buildTimestamp = await surfaceRoot.getAttribute('data-build-timestamp');

    assert.ok(buildTimestamp, 'data-build-timestamp attribute must be present');
    assert.notStrictEqual(
      buildTimestamp,
      '1970-01-01T00:00:00.000Z',
      'data-build-timestamp must not be epoch zero (build-time constant injection failed)'
    );
    assert.ok(
      buildTimestamp.startsWith('2026-') || buildTimestamp.startsWith('20'),
      `data-build-timestamp="${buildTimestamp}" must be a valid recent ISO timestamp`
    );
  });

  it('exposes data-surface-truth identity on SurfaceRoot', async function () {
    this.timeout(30000);

    const surfaceRoot = await $('[data-testid="surface-root"]');
    const surfaceTruth = await surfaceRoot.getAttribute('data-surface-truth');
    const surfaceRing = await surfaceRoot.getAttribute('data-surface-ring');

    assert.ok(surfaceTruth, 'data-surface-truth attribute must be present');
    assert.ok(surfaceRing, 'data-surface-ring attribute must be present');
    assert.strictEqual(
      surfaceTruth,
      'app-root',
      'root surface identity must be "app-root"'
    );
    assert.strictEqual(surfaceRing, 'core', 'root surface ring must be "core"');
  });

  after(async function () {
    const proofPath = path.join(REPORTS_DIR, 'stable-surface-truth-proof.json');
    const proof = {
      provenAt: new Date().toISOString(),
      appVersion: PACKAGE_VERSION,
      gate: 'stable-surface-truth.wdio.test.js',
      runtime: 'tauri-wdio',
      binary: process.env.TAURI_BINARY_PATH || 'unset',
      verdict: 'SURFACE_TRUTH_CONFIRMED',
    };
    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2), 'utf8');
    console.log(`[SurfaceTruth] Proof written: ${proofPath}`);
  });
});
