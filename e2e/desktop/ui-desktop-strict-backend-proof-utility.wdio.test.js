'use strict';
/**
 * ui-desktop-strict-backend-proof-utility.wdio.test.js
 * v60 — Strict backend proof gate: PERFORMANCE, SKILLS, KNOWLEDGE, CREATION, EVOLUTION, TWINS, FUSION
 * Plus DOC_CENTER (Tier 1).
 *
 * All records: schemaVersion:"v60", capturedAt, sourceSpec (explicit), route, moduleId, tier
 */

const SOURCE_SPEC = 'ui-desktop-strict-backend-proof-utility.wdio.test.js';

const {
  probeInvoke,
  probeInvokeAndReflect,
  probeGuarded,
  probeDisplayOnly,
  waitForTauriReady,
  navigateAndWait,
} = require('./helpers/uiDesktopBackendProofDepth.js');

describe('v60 Strict Backend Proof — Utility Modules (PERFORMANCE, SKILLS, KNOWLEDGE, CREATION, EVOLUTION, TWINS, FUSION, DOC_CENTER)', () => {

  // ─── DOC_CENTER — Tier 1 ─────────────────────────────────────────────────

  describe('DOC_CENTER — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/doc-center', 'doc-center-page', 10000);
      await waitForTauriReady(8000);
    });

    it('get_documentation_index — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'get_documentation_index',
        {},
        '[data-testid="doc-center-page"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/doc-center',
          moduleId: 'DOC_CENTER',
          tier: 1,
          evidenceKind: 'RESULT_PANEL',
        }
      );
    });
  });

  // ─── PERFORMANCE — Tier 2 ────────────────────────────────────────────────

  describe('PERFORMANCE — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/performance', 'page-performance-test', 10000);
      await waitForTauriReady(8000);
    });

    it('performance_get_metrics — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'performance_get_metrics',
        {},
        '[data-testid="page-performance-test"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/performance',
          moduleId: 'PERFORMANCE',
          tier: 2,
          evidenceKind: 'RESULT_PANEL',
        }
      );
    });
  });

  // ─── SKILLS — Tier 2 ─────────────────────────────────────────────────────

  describe('SKILLS — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/skills', 'page-skills', 10000);
      await waitForTauriReady(8000);
    });

    it('skills guarded — full v60 schema', async () => {
      probeGuarded(
        'SKILLS',
        '/skills',
        'No dedicated SKILLS IPC command available in v60 strict scope',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'SKILLS' }
      );
    });
  });

  // ─── KNOWLEDGE — Tier 2 ──────────────────────────────────────────────────

  describe('KNOWLEDGE — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/knowledge', 'page-knowledge', 10000);
      await waitForTauriReady(8000);
    });

    it('knowledge guarded — full v60 schema', async () => {
      probeGuarded(
        'KNOWLEDGE',
        '/knowledge',
        'No dedicated KNOWLEDGE IPC command available in v60 strict scope',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'KNOWLEDGE' }
      );
    });
  });

  // ─── CREATION — Tier 2 ───────────────────────────────────────────────────

  describe('CREATION — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/creation', 'page-creation-studio', 10000);
      await waitForTauriReady(8000);
    });

    it('creation guarded — full v60 schema', async () => {
      probeGuarded(
        'CREATION',
        '/creation',
        'No dedicated CREATION IPC command in v60 strict scope',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'CREATION' }
      );
    });
  });

  // ─── EVOLUTION — Tier 2 ──────────────────────────────────────────────────

  describe('EVOLUTION — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/evolution', 'page-evolution-monitor', 10000);
      await waitForTauriReady(8000);
    });

    it('evolution guarded — full v60 schema', async () => {
      probeGuarded(
        'EVOLUTION',
        '/evolution',
        'No dedicated EVOLUTION IPC command in v60 strict scope',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'EVOLUTION' }
      );
    });
  });

  // ─── TWINS — Tier 2 ──────────────────────────────────────────────────────

  describe('TWINS — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/twins', 'page-twins', 10000);
      await waitForTauriReady(8000);
    });

    it('twins guarded — full v60 schema', async () => {
      probeGuarded(
        'TWINS',
        '/twins',
        'No dedicated TWINS IPC command in v60 strict scope',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'TWINS' }
      );
    });
  });

  // ─── FUSION — Tier 2 ─────────────────────────────────────────────────────

  describe('FUSION — Tier 2', () => {
    before(async () => {
      await navigateAndWait('/fusion', 'page-fusion', 10000);
      await waitForTauriReady(8000);
    });

    it('fusion guarded — full v60 schema', async () => {
      probeGuarded(
        'FUSION',
        '/fusion',
        'No dedicated FUSION IPC command in v60 strict scope',
        { sourceSpec: SOURCE_SPEC, tier: 2, moduleId: 'FUSION' }
      );
    });
  });

});
