'use strict';
/**
 * ui-desktop-strict-backend-proof-agent-chat.wdio.test.js
 * v60 — Strict backend proof gate: AGENT_CHAT, AGENT_CONTEXT, CHAT_CONTEXT,
 *        ORCHESTRATION_CENTER, ORCHESTRATION_INTELLIGENCE
 *
 * All records: schemaVersion:"v60", capturedAt, sourceSpec (explicit), route, moduleId, tier
 */

const SOURCE_SPEC = 'ui-desktop-strict-backend-proof-agent-chat.wdio.test.js';

const {
  probeInvoke,
  probeInvokeAndReflect,
  probeGuarded,
  probeDisplayOnly,
  waitForTauriReady,
  navigateAndWait,
} = require('./helpers/uiDesktopBackendProofDepth.js');

describe('v60 Strict Backend Proof — Agent/Chat Context + Orchestration Modules', () => {
  // ─── AGENT_CHAT — Tier 1 ─────────────────────────────────────────────────

  describe('AGENT_CHAT — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/admin', 'page-admin', 10000);
      await waitForTauriReady(8000);
    });

    it('get_system_health as agent context signal — full v60 schema', async () => {
      await probeInvoke(
        'get_system_health',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/admin',
          moduleId: 'AGENT_CHAT',
          tier: 1,
        }
      );
    });
  });

  // ─── CHAT_CONTEXT — Tier 1 ───────────────────────────────────────────────

  describe('CHAT_CONTEXT — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/titane', 'page-titane', 10000);
      await waitForTauriReady(8000);
    });

    it('chat_get_providers_status as chat context — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'chat_get_providers_status',
        {},
        '[data-testid="page-titane"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/titane',
          moduleId: 'CHAT_CONTEXT',
          tier: 1,
          evidenceKind: 'CHAT_CONTEXT',
        }
      );
    });

    it('memory context transition — navigates to memory and back to titane', async () => {
      await navigateAndWait('/memory', 'page-memory', 6000);
      await probeInvoke(
        'memory_get_state',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/memory',
          moduleId: 'CHAT_CONTEXT',
          tier: 1,
        }
      );
      await navigateAndWait('/titane', 'page-titane', 6000);
      await probeInvoke(
        'chat_get_providers_status',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/titane',
          moduleId: 'CHAT_CONTEXT',
          tier: 1,
        }
      );
    });

    it('memory_get_state on memory route — v60 full schema', async () => {
      await navigateAndWait('/memory', 'page-memory', 8000);
      await waitForTauriReady(8000);
      await probeInvokeAndReflect('memory_get_state', {}, '[data-testid="page-memory"]', {
        sourceSpec: SOURCE_SPEC,
        route: '/memory',
        moduleId: 'AGENT_CONTEXT',
        tier: 1,
        evidenceKind: 'AGENT_CONTEXT',
      });
    });

    it('chat_get_providers_status on titane route — v60 full schema', async () => {
      await navigateAndWait('/titane', 'page-titane', 8000);
      await waitForTauriReady(8000);
      await probeInvokeAndReflect(
        'chat_get_providers_status',
        {},
        '[data-testid="page-titane"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/titane',
          moduleId: 'AGENT_CONTEXT',
          tier: 1,
          evidenceKind: 'AGENT_CONTEXT',
        }
      );
    });
  });

  // ─── ORCHESTRATION_CENTER — Tier 3 ───────────────────────────────────────

  describe('ORCHESTRATION_CENTER — Tier 3', () => {
    before(async () => {
      await navigateAndWait(
        '/orchestration-center',
        'page-orchestration-meta-center',
        10000
      );
      await waitForTauriReady(8000);
    });

    it('orchestration-center display confirmed — full v60 schema', async () => {
      probeDisplayOnly(
        'ORCHESTRATION_CENTER',
        '/orchestration-center',
        'Orchestration center — display-only confirmed in v60 strict scope (Tier 3 accepted)',
        { sourceSpec: SOURCE_SPEC, tier: 3, moduleId: 'ORCHESTRATION_CENTER' }
      );
    });
  });

  // ─── ORCHESTRATION_INTELLIGENCE — Tier 3 ─────────────────────────────────

  describe('ORCHESTRATION_INTELLIGENCE — Tier 3', () => {
    before(async () => {
      await navigateAndWait(
        '/orchestration-intelligence',
        'page-orchestration-intelligence',
        10000
      );
      await waitForTauriReady(8000);
    });

    it('orchestration-intelligence display confirmed — full v60 schema', async () => {
      probeDisplayOnly(
        'ORCHESTRATION_INTELLIGENCE',
        '/orchestration-intelligence',
        'Orchestration intelligence — display-only confirmed in v60 strict scope (Tier 3 accepted)',
        { sourceSpec: SOURCE_SPEC, tier: 3, moduleId: 'ORCHESTRATION_INTELLIGENCE' }
      );
    });
  });
});
