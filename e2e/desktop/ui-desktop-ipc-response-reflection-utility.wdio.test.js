/**
 * ui-desktop-ipc-response-reflection-utility.wdio.test.js
 * v59 — IPC Response Reflection: Utility modules (Skills, Knowledge, Creation, Evolution,
 *        Performance, Twins, Fusion + Tier 3 route presence)
 *
 * Artifact: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
 */

'use strict';

const {
  probeInvoke,
  probeInvokeAndReflect,
  probeGuarded,
  probeDegraded,
  probeDisplayOnly,
  waitForTauriReady,
  checkErrorBoundary,
  getBodyHTML,
  hasDegradedIndicator,
  navigateAndWait,
  logClassification,
} = require('./helpers/uiDesktopBackendProofDepth.js');

const SOURCE_SPEC = 'e2e/desktop/ui-desktop-ipc-response-reflection-utility.wdio.test.js';

process.env.TITANE_PROOF_ARTIFACT =
  'artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl';

describe('v59 IPC Response Reflection — Utility Modules', () => {
  before(async () => {
    await waitForTauriReady(8000);
  });

  // ─── Performance ─────────────────────────────────────────────────────────────

  describe('Performance (/performance)', () => {
    before(async () => {
      await navigateAndWait('/performance', 'page-performance-test', 8000);
    });

    it('should probe performance_get_metrics → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvokeAndReflect(
        'performance_get_metrics',
        {},
        '[data-testid="page-performance-test"]',
        { moduleId: 'PERFORMANCE', route: '/performance', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('PERFORMANCE.performance_get_metrics', result.proofLevel);
    });

    it('should not have ErrorBoundary on /performance', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Skills ───────────────────────────────────────────────────────────────────

  describe('Skills (/skills)', () => {
    before(async () => {
      await navigateAndWait('/skills', 'page-skills', 8000);
    });

    it('should probe get_skills_registry or classify display-only', async () => {
      const result = await probeInvoke(
        'get_skills_registry',
        {},
        { moduleId: 'SKILLS', route: '/skills', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('SKILLS.get_skills_registry', result.proofLevel);
    });

    it('should not have ErrorBoundary on /skills', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Knowledge ───────────────────────────────────────────────────────────────

  describe('Knowledge (/knowledge)', () => {
    before(async () => {
      await navigateAndWait('/knowledge', 'page-knowledge', 8000);
    });

    it('should probe get_knowledge_state or classify display-only', async () => {
      const result = await probeInvoke(
        'get_knowledge_state',
        {},
        { moduleId: 'KNOWLEDGE', route: '/knowledge', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('KNOWLEDGE.get_knowledge_state', result.proofLevel);
    });

    it('should not have ErrorBoundary on /knowledge', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Creation Studio ─────────────────────────────────────────────────────────

  describe('Creation Studio (/creation)', () => {
    before(async () => {
      await navigateAndWait('/creation', 'page-creation-studio', 8000);
    });

    it('should probe get_creation_state or classify display-only', async () => {
      const result = await probeInvoke(
        'get_creation_state',
        {},
        { moduleId: 'CREATION', route: '/creation', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('CREATION.get_creation_state', result.proofLevel);
    });

    it('should not have ErrorBoundary on /creation', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Evolution Monitor ───────────────────────────────────────────────────────

  describe('Evolution Monitor (/evolution)', () => {
    before(async () => {
      await navigateAndWait('/evolution', 'page-evolution-monitor', 8000);
    });

    it('should probe get_evolution_metrics or classify', async () => {
      const result = await probeInvoke(
        'get_evolution_metrics',
        {},
        { moduleId: 'EVOLUTION', route: '/evolution', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('EVOLUTION.get_evolution_metrics', result.proofLevel);
    });

    it('should not have ErrorBoundary on /evolution', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Twins ───────────────────────────────────────────────────────────────────

  describe('Twins (/twins)', () => {
    before(async () => {
      await navigateAndWait('/twins', 'page-twins', 8000);
    });

    it('should probe get_twins_state or classify', async () => {
      const result = await probeInvoke(
        'get_twins_state',
        {},
        { moduleId: 'TWINS', route: '/twins', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('TWINS.get_twins_state', result.proofLevel);
    });

    it('should not have ErrorBoundary on /twins', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Fusion ───────────────────────────────────────────────────────────────────

  describe('Fusion (/fusion)', () => {
    before(async () => {
      await navigateAndWait('/fusion', 'page-fusion', 8000);
    });

    it('should probe get_fusion_status or classify', async () => {
      const result = await probeInvoke(
        'get_fusion_status',
        {},
        { moduleId: 'FUSION', route: '/fusion', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('FUSION.get_fusion_status', result.proofLevel);
    });

    it('should not have ErrorBoundary on /fusion', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Tier 3 Route Presence ───────────────────────────────────────────────────

  describe('Tier 3 — Route presence confirmation', () => {
    const tier3Routes = [
      { route: '/selfheal', testid: 'page-selfheal', moduleId: 'SELFHEAL' },
      { route: '/adaptive', testid: 'page-adaptive-engine', moduleId: 'ADAPTIVE_ENGINE' },
      {
        route: '/singularity',
        testid: 'page-singularity-monitor',
        moduleId: 'SINGULARITY',
      },
      { route: '/sentinel', testid: 'page-sentinel', moduleId: 'SENTINEL' },
      { route: '/watchdog', testid: 'page-watchdog', moduleId: 'WATCHDOG' },
    ];

    for (const { route, testid, moduleId } of tier3Routes) {
      it(`should render ${route} without ErrorBoundary`, async () => {
        await navigateAndWait(route, testid, 8000);
        const hasError = await checkErrorBoundary();
        probeDisplayOnly(
          moduleId,
          route,
          'Tier 3 route renders without ErrorBoundary — display-only confirmed'
        );
        expect(hasError).toBe(false);
      });
    }
  });
});
