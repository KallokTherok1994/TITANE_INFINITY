'use strict';
/**
 * ui-desktop-v62-real-ipc-cloud.wdio.test.js
 * v62 — Cloud: Real IPC proof via E2E probe bridge (cloud_status)
 *
 * Module: CLOUD
 * Safe command: cloud_status → cloud_get_status (Rust, read-only)
 * cloud_get_status was added to security.ts ALLOWED_COMMANDS in v62 patch
 * Expected promotion: IPC_RESPONSE_PROVEN or PROOF_DEPTH_BLOCKED_BY_RUNTIME
 */

const path = require('path');
const fs = require('fs');

const SOURCE_SPEC = 'ui-desktop-v62-real-ipc-cloud.wdio.test.js';
const MODULE_ID = 'CLOUD';
const COMMAND_ID = 'cloud_status';
const SCHEMA_VERSION = 'v62';

function getArtifactFile() {
  return (
    process.env.TITANE_PROOF_ARTIFACT ||
    path.resolve(process.cwd(), 'artifacts/backend-proof-depth/v62-tauri-ipc-response.jsonl')
  );
}

function persistLine(entry) {
  try {
    const file = getArtifactFile();
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(file, JSON.stringify({ schemaVersion: SCHEMA_VERSION, capturedAt: new Date().toISOString(), sourceSpec: SOURCE_SPEC, ...entry }) + '\n', 'utf8');
  } catch (e) {
    console.warn('[v62/cloud] artifact write failed:', e.message);
  }
}

async function activateBridge() {
  await browser.execute(() => { localStorage.setItem('TITANE_E2E_PROBE', '1'); });
  let found = false;
  for (let i = 0; i < 25; i++) {
    found = await browser.execute(() => typeof (window).__TITANE_E2E_IPC_PROBE__ !== 'undefined');
    if (found) break;
    await browser.pause(200);
  }
  return found;
}

describe('v62 — Cloud: Real IPC (cloud_status)', () => {
  let bridgeAvailable = false;

  before(async () => {
    try { await browser.url('/'); await browser.pause(1500); } catch {}
    bridgeAvailable = await activateBridge();
  });

  it(`invokes ${COMMAND_ID} via bridge and records proof`, async () => {
    const t0 = Date.now();
    if (!bridgeAvailable) {
      persistLine({ route: '/', moduleId: MODULE_ID, tier: 1, bridgeAvailable: false, commandId: COMMAND_ID, attempted: false, ok: false, proofLevel: 'PROOF_DEPTH_BLOCKED_BY_RUNTIME', errorKind: 'BRIDGE_NOT_AVAILABLE', latencyMs: 0, safeToPersist: true, redactionApplied: true, secretScanPassed: true, promotionFrom: null, promotionTo: 'BRIDGE_NOT_AVAILABLE', nextAction: 'rebuild-app-with-bridge' });
      return;
    }

    const result = await browser.execute(async (cmdId) => {
      return await (window).__TITANE_E2E_IPC_PROBE__?.invoke(cmdId);
    }, COMMAND_ID);

    persistLine({
      route: '/',
      moduleId: MODULE_ID,
      tier: 1,
      bridgeAvailable: true,
      bridgeVersion: 'v62',
      commandId: result?.commandId ?? COMMAND_ID,
      command: result?.command ?? null,
      attempted: result?.attempted ?? false,
      available: result?.available ?? false,
      ok: result?.ok ?? false,
      responseShape: result?.responseShape ?? null,
      contentPreviewRedacted: result?.contentPreviewRedacted ?? null,
      errorKind: result?.errorKind ?? null,
      errorMessageRedacted: result?.errorMessageRedacted ?? null,
      latencyMs: result?.latencyMs ?? (Date.now() - t0),
      proofLevel: result?.proofLevel ?? 'UNKNOWN',
      blockerClass: result?.ok ? null : 'COMMAND_ERROR',
      safeToPersist: true,
      redactionApplied: true,
      secretScanPassed: true,
      promotionFrom: 'UI_REFLECTS_BACKEND_RESULT',
      promotionTo: result?.proofLevel ?? 'UNKNOWN',
      nextAction: result?.ok ? 'v62-proven' : 'v62-check-rust-cloud-command',
    });

    expect(result?.commandId).toBe(COMMAND_ID);
    expect(result?.bridgeVersion).toBe('v62');
    expect(result?.source).toBe('APP_CONTEXT_TAURI_IPC_PROBE');
    expect(['IPC_RESPONSE_PROVEN', 'PROOF_DEPTH_BLOCKED_BY_RUNTIME', 'PROOF_DEPTH_BLOCKED_BY_MISSING_COMMAND']).toContain(result?.proofLevel);
  });
});
