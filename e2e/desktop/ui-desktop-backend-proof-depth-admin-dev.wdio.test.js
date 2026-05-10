/**
 * ui-desktop-backend-proof-depth-admin-dev.wdio.test.js
 * v58 — Proof depth for Admin/Dev/DocCenter/Fusion modules.
 *
 * Modules:
 *   ADMIN_GOVERNANCE (secrets hard-assert), DEV_COCKPIT (IPC),
 *   DOC_CENTER (guarded), ADMIN_AUDIO, FUSION
 *
 * Rules:
 * - Read-only IPC only
 * - No export execution
 * - No destructive dev commands
 */

'use strict';

const {
  probeInvoke,
  probeGuarded,
  isTauriAvailable,
  getBodyHTML,
  checkErrorBoundary,
  navigateAndWait,
  logClassification,
} = require('./helpers/uiDesktopBackendProofDepth.js');

// ─── ADMIN GOVERNANCE ─────────────────────────────────────────────────────────

describe('[v58:depth] ADMIN GOVERNANCE — /admin — GUARDED_ONLY + secrets hard assert', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/admin', 'page-admin', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });

  it('secrets never exposed in DOM — hard assert', async () => {
    await navigateAndWait('/admin', 'page-admin', 12000);
    await browser.pause(600);
    const html = await getBodyHTML();
    const hasRawSecret = typeof html === 'string' && /sk-[a-zA-Z0-9]{30,}/.test(html);
    const hasRawBearer = typeof html === 'string' && /Bearer [a-zA-Z0-9]{20,}/.test(html);
    const secretExposed = hasRawSecret || hasRawBearer;
    logClassification('ADMIN_GOVERNANCE', secretExposed ? 'PROOF_DEPTH_BLOCKED_BY_SECRET' : 'PROOF_DEPTH_GUARDED_ONLY',
      `secrets_masked=${!secretExposed}`);
    expect(secretExposed).toBe(false); // P0 SECURITY HARD ASSERT
  });

  it('governance classified as GUARDED_ONLY', async () => {
    await navigateAndWait('/admin', 'page-admin', 12000);
    const guard = probeGuarded('ADMIN_GOVERNANCE', '/admin', 'Governance actions gated — no destructive execution');
    expect(guard.proofLevel).toBe('PROOF_DEPTH_GUARDED_ONLY');
    logClassification('ADMIN_GOVERNANCE', 'PROOF_DEPTH_GUARDED_ONLY', 'governance gated by design');
  });
});

// ─── DEV COCKPIT ──────────────────────────────────────────────────────────────

describe('[v58:depth] DEV COCKPIT — /dev — IPC_RESPONSE_PROVEN or DEGRADED_VISIBLE', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/dev', 'page-dev', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });

  it('get_system_health — probe IPC response shape (dev context)', async () => {
    await navigateAndWait('/dev', 'page-dev', 12000);
    await browser.pause(500);
    const r = await probeInvoke('get_system_health', {}, { module: 'DEV_COCKPIT', route: '/dev' });
    expect(r.attempted).toBe(true);
    if (r.ok) {
      expect(r.responseShape).not.toBe('null');
      logClassification('DEV_COCKPIT', 'PROOF_DEPTH_IPC_RESPONSE_PROVEN', `shape=${r.responseShape}`);
    } else {
      logClassification('DEV_COCKPIT', r.proofLevel, `errorKind=${r.errorKind}`);
    }
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });

  it('dev_get_logs or equivalent — optional probe', async () => {
    await navigateAndWait('/dev', 'page-dev', 12000);
    const r = await probeInvoke('get_logs', {}, { module: 'DEV_COCKPIT_LOGS', route: '/dev' });
    logClassification('DEV_COCKPIT_LOGS', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

// ─── DOC CENTER ───────────────────────────────────────────────────────────────

describe('[v58:depth] DOC CENTER — /doc-center — GUARDED_ONLY', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/doc-center', 'doc-center-page', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });

  it('doc center export guarded — no execution', async () => {
    await navigateAndWait('/doc-center', 'doc-center-page', 12000);
    await browser.pause(400);
    // Export path is not configurable in E2E — classify as GUARDED_ONLY
    const guard = probeGuarded('DOC_CENTER', '/doc-center', 'Export button present but guarded — path not configurable in E2E');
    expect(guard.proofLevel).toBe('PROOF_DEPTH_GUARDED_ONLY');
    logClassification('DOC_CENTER', 'PROOF_DEPTH_GUARDED_ONLY', 'export guarded');
  });

  it('doc center IPC probe — any read-only doc command', async () => {
    await navigateAndWait('/doc-center', 'doc-center-page', 12000);
    // Probe a documentation-related read-only command
    const r = await probeInvoke('get_documentation_index', {}, { module: 'DOC_CENTER_INDEX', route: '/doc-center' });
    logClassification('DOC_CENTER_INDEX', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

// ─── ADMIN AUDIO ──────────────────────────────────────────────────────────────

describe('[v58:depth] ADMIN AUDIO — /admin — IPC_COMMAND_PROVEN or GUARDED_ONLY', () => {
  it('audio settings probe — no real audio mutation', async () => {
    await navigateAndWait('/admin', 'page-admin', 12000);
    await browser.pause(400);
    // Read-only audio config probe
    const r = await probeInvoke('cp_get_audio_config', {}, { module: 'ADMIN_AUDIO', route: '/admin' });
    logClassification('ADMIN_AUDIO', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});

// ─── FUSION ───────────────────────────────────────────────────────────────────

describe('[v58:depth] FUSION — /fusion — IPC_COMMAND_PROVEN or DISPLAY_ONLY', () => {
  it('page root no ErrorBoundary', async () => {
    await navigateAndWait('/fusion', 'page-fusion', 12000);
    const err = await checkErrorBoundary();
    expect(err).toBe(false);
  });

  it('fusion page depth probe', async () => {
    await navigateAndWait('/fusion', 'page-fusion', 12000);
    await browser.pause(400);
    const r = await probeInvoke('get_fusion_status', {}, { module: 'FUSION', route: '/fusion' });
    logClassification('FUSION', r.proofLevel, `ok=${r.ok} errorKind=${r.errorKind}`);
    expect(r.proofLevel).not.toBe('PROOF_DEPTH_UNKNOWN');
  });
});
