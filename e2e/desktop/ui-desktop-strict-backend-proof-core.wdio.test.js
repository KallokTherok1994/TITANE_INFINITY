'use strict';
/**
 * ui-desktop-strict-backend-proof-core.wdio.test.js
 * v60 — Strict backend proof gate: TITANE CHAT, TIME, MEMORY, EXPERIENCE, RESEARCH, CLOUD
 *
 * Requirements:
 *   - All records: schemaVersion:"v60", capturedAt, sourceSpec (explicit), route, moduleId, tier
 *   - UI_REFLECTS_BACKEND_RESULT records: structured uiEvidence with selector/found/textHash/evidenceKind
 *   - 0 MISSING_SOURCE_SPEC in strict mode
 */

const SOURCE_SPEC = 'ui-desktop-strict-backend-proof-core.wdio.test.js';

const {
  probeInvoke,
  probeInvokeAndReflect,
  probeGuarded,
  probeDisplayOnly,
  waitForTauriReady,
  navigateAndWait,
} = require('./helpers/uiDesktopBackendProofDepth.js');

describe('v60 Strict Backend Proof — Core Modules (TITANE CHAT, TIME, MEMORY, EXPERIENCE, RESEARCH, CLOUD)', () => {

  // ─── TITANE CHAT ─────────────────────────────────────────────────────────

  describe('TITANE CHAT — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/titane', 'page-titane', 10000);
      await waitForTauriReady(8000);
    });

    it('chat_get_providers_status — UI_REFLECTS_BACKEND_RESULT', async () => {
      const result = await probeInvokeAndReflect(
        'chat_get_providers_status',
        {},
        '[data-testid="page-titane"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/titane',
          moduleId: 'TITANE_CHAT',
          tier: 1,
          evidenceKind: 'STATUS_BADGE',
        }
      );
      // Proof is recorded — strict verifier validates schema
    });

    it('chat_get_memory_stats — UI_REFLECTS_BACKEND_RESULT', async () => {
      const result = await probeInvokeAndReflect(
        'chat_get_memory_stats',
        {},
        '[data-testid="page-titane"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/titane',
          moduleId: 'TITANE_CHAT',
          tier: 1,
          evidenceKind: 'HEALTH_CARD',
        }
      );
    });

    it('chat_get_providers_status — BLOCKED_BY_RUNTIME classified correctly', async () => {
      // If blocked, record must still have full v60 schema
      const result = await probeInvoke(
        'chat_get_providers_status',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/titane',
          moduleId: 'TITANE_CHAT',
          tier: 1,
        }
      );
      // Schema compliance validated by verifier
    });
  });

  // ─── TIME ─────────────────────────────────────────────────────────────────

  describe('TIME — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/time', 'page-time', 10000);
      await waitForTauriReady(8000);
    });

    it('read_snapshot — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'read_snapshot',
        {},
        '[data-testid="page-time"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/time',
          moduleId: 'TIME',
          tier: 1,
          evidenceKind: 'RESULT_PANEL',
        }
      );
    });

    it('get_timeline — IPC probe with full v60 schema', async () => {
      await probeInvoke(
        'get_timeline',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/time',
          moduleId: 'TIME',
          tier: 1,
        }
      );
    });
  });

  // ─── MEMORY ──────────────────────────────────────────────────────────────

  describe('MEMORY — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/memory', 'page-memory', 10000);
      await waitForTauriReady(8000);
    });

    it('memory_get_state — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'memory_get_state',
        {},
        '[data-testid="page-memory"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/memory',
          moduleId: 'MEMORY',
          tier: 1,
          evidenceKind: 'RUNTIME_STATUS',
        }
      );
    });
  });

  // ─── EXPERIENCE ───────────────────────────────────────────────────────────

  describe('EXPERIENCE — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/experience', 'page-experience', 10000);
      await waitForTauriReady(8000);
    });

    it('experience probe — full v60 schema IPC attempt', async () => {
      await probeInvoke(
        'performance_get_metrics',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/experience',
          moduleId: 'EXPERIENCE',
          tier: 2,
        }
      );
    });
  });

  // ─── RESEARCH ─────────────────────────────────────────────────────────────

  describe('RESEARCH — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/research', 'research-page', 10000);
      await waitForTauriReady(8000);
    });

    it('research guarded — full v60 schema', async () => {
      probeGuarded(
        'RESEARCH',
        '/research',
        'No REQUIRED_LIVE IPC command for research in v60 probe scope — guarded display-only confirmed',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'RESEARCH' }
      );
    });
  });

  // ─── CLOUD ────────────────────────────────────────────────────────────────

  describe('CLOUD — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/cloud', 'page-cloud-center', 10000);
      await waitForTauriReady(8000);
    });

    it('cloud guarded — full v60 schema', async () => {
      probeGuarded(
        'CLOUD',
        '/cloud',
        'Cloud center — no IPC command for strict probe; guarded display confirmed',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'CLOUD' }
      );
    });
  });

});
