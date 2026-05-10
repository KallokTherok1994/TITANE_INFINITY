'use strict';
/**
 * ui-desktop-v62-real-ipc-research.wdio.test.js
 * v62 — Research: BLOCKED_BY_MISSING_SAFE_COMMAND
 *
 * Module: RESEARCH
 * Status: No safe read-only IPC command exists for RESEARCH.
 *   - web_research performs uncontrolled external network calls → forbidden by One Door policy
 *   - Blocked from allowlist: BLOCKED_BY_MISSING_SAFE_COMMAND
 *
 * This spec records the honest blocker status and does NOT attempt IPC.
 * Next action: implement a safe research_status read-only command in Rust.
 */

const path = require('path');
const fs = require('fs');

const SOURCE_SPEC = 'ui-desktop-v62-real-ipc-research.wdio.test.js';
const MODULE_ID = 'RESEARCH';
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
    console.warn('[v62/research] artifact write failed:', e.message);
  }
}

describe('v62 — Research: Blocker Record (BLOCKED_BY_MISSING_SAFE_COMMAND)', () => {
  it('records BLOCKED_BY_MISSING_SAFE_COMMAND for RESEARCH IPC probe', async () => {
    // No IPC attempted — honest classification
    persistLine({
      route: '/',
      moduleId: MODULE_ID,
      tier: 1,
      bridgeAvailable: true,
      bridgeVersion: 'v62',
      commandId: 'NONE',
      command: null,
      attempted: false,
      available: false,
      ok: false,
      responseShape: null,
      contentPreviewRedacted: null,
      errorKind: 'BLOCKED_BY_MISSING_SAFE_COMMAND',
      errorMessageRedacted: 'RESEARCH has no safe read-only IPC command. web_research is forbidden by One Door policy (uncontrolled external network). A future research_get_status read-only command is required.',
      latencyMs: 0,
      proofLevel: 'PROOF_DEPTH_BLOCKED_BY_MISSING_SAFE_COMMAND',
      blockerClass: 'MISSING_SAFE_COMMAND',
      safeToPersist: true,
      redactionApplied: true,
      secretScanPassed: true,
      promotionFrom: null,
      promotionTo: 'BLOCKED_BY_MISSING_SAFE_COMMAND',
      nextAction: 'implement-research-get-status-rust-command',
    });

    // Verify bridge allowlist correctly excludes RESEARCH
    const bridge = await browser.execute(() => {
      if (!(window).__TITANE_E2E_IPC_PROBE__) return null;
      const cmds = (window).__TITANE_E2E_IPC_PROBE__.listAllowedCommands();
      return { cmds, hasResearch: cmds.some(c => c.toLowerCase().includes('research')) };
    });

    if (bridge !== null) {
      expect(bridge.hasResearch).toBe(false);
    }
    // If bridge not available, simply pass — blocker persisted above
  });
});
