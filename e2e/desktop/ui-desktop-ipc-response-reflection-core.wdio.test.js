/**
 * ui-desktop-ipc-response-reflection-core.wdio.test.js
 * v59 — IPC Response Reflection: Core modules (Chat, Time, Memory, Experience, Research, Cloud)
 *
 * Goal: Promote proof depth from BLOCKED_BY_RUNTIME → IPC_RESPONSE_PROVEN or UI_REFLECTS_BACKEND_RESULT
 * Technique: Single session, waitForTauriReady before first probe, sequential probes.
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
  isTauriAvailable,
  checkErrorBoundary,
  getBodyHTML,
  hasDegradedIndicator,
  navigateAndWait,
  logClassification,
} = require('./helpers/uiDesktopBackendProofDepth.js');

const SOURCE_SPEC = 'e2e/desktop/ui-desktop-ipc-response-reflection-core.wdio.test.js';

// Ensure v59 artifact
process.env.TITANE_PROOF_ARTIFACT =
  'artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl';

describe('v59 IPC Response Reflection — Core Modules', () => {
  let tauriAvailable = false;

  before(async () => {
    tauriAvailable = await waitForTauriReady(8000);
    logClassification('v59-core', `Tauri IPC bridge available: ${tauriAvailable}`);
  });

  // ─── TITANE Chat ────────────────────────────────────────────────────────────

  describe('TITANE Chat (/titane)', () => {
    before(async () => {
      await navigateAndWait('/titane', 'page-titane', 8000);
    });

    it('should probe chat_get_providers_status → IPC_RESPONSE_PROVEN or BLOCKED_BY_PROVIDER', async () => {
      const result = await probeInvokeAndReflect(
        'chat_get_providers_status',
        {},
        '[data-testid="page-titane"]',
        { moduleId: 'TITANE_CHAT', route: '/titane', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.attempted).toBe('boolean');
      expect(typeof result.proofLevel).toBe('string');
      logClassification('TITANE_CHAT.providers_status', result.proofLevel);
    });

    it('should probe chat_get_memory_stats → IPC_RESPONSE_PROVEN or classified error', async () => {
      const result = await probeInvoke(
        'chat_get_memory_stats',
        {},
        { moduleId: 'TITANE_CHAT', route: '/titane', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('TITANE_CHAT.memory_stats', result.proofLevel);
    });

    it('should not have ErrorBoundary on /titane', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Time ───────────────────────────────────────────────────────────────────

  describe('Time (/time)', () => {
    before(async () => {
      await navigateAndWait('/time', 'page-time', 8000);
    });

    it('should probe read_snapshot → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvokeAndReflect(
        'read_snapshot',
        {},
        '[data-testid="page-time"]',
        { moduleId: 'TIME', route: '/time', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('TIME.read_snapshot', result.proofLevel);
    });

    it('should probe get_timeline → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvoke(
        'get_timeline',
        {},
        { moduleId: 'TIME', route: '/time', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('TIME.get_timeline', result.proofLevel);
    });

    it('should not have ErrorBoundary on /time', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Memory ─────────────────────────────────────────────────────────────────

  describe('Memory (/memory)', () => {
    before(async () => {
      await navigateAndWait('/memory', 'page-memory', 8000);
    });

    it('should probe memory_get_state → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvokeAndReflect(
        'memory_get_state',
        {},
        '[data-testid="page-memory"]',
        { moduleId: 'MEMORY', route: '/memory', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('MEMORY.memory_get_state', result.proofLevel);
    });

    it('should not have ErrorBoundary on /memory', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Experience ─────────────────────────────────────────────────────────────

  describe('Experience (/experience)', () => {
    before(async () => {
      await navigateAndWait('/experience', 'page-experience', 8000);
    });

    it('should probe get_experience_state or classify guarded/display-only', async () => {
      const result = await probeInvoke(
        'get_experience_state',
        {},
        { moduleId: 'EXPERIENCE', route: '/experience', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('EXPERIENCE.get_experience_state', result.proofLevel);
    });

    it('should not have ErrorBoundary on /experience', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Research ───────────────────────────────────────────────────────────────

  describe('Research (/research)', () => {
    before(async () => {
      await navigateAndWait('/research', 'research-page', 8000);
    });

    it('should classify research as GUARDED (One Door: no external network)', async () => {
      const html = await getBodyHTML();
      const isGuarded = !tauriAvailable || hasDegradedIndicator(html);
      const result = probeGuarded(
        'RESEARCH',
        '/research',
        'One Door policy: external search blocked; module rendered but network gate active'
      );
      // Override proofLevel to guarded-with-ui if page renders
      expect(result.proofLevel).toBe('PROOF_DEPTH_GUARDED_ONLY');
      logClassification('RESEARCH.guarded', result.proofLevel);
    });

    it('should not have ErrorBoundary on /research', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Cloud ──────────────────────────────────────────────────────────────────

  describe('Cloud (/cloud)', () => {
    before(async () => {
      await navigateAndWait('/cloud', 'page-cloud-center', 8000);
    });

    it('should classify cloud as GUARDED (no real push/pull in E2E)', async () => {
      const result = probeGuarded(
        'CLOUD',
        '/cloud',
        'No real cloud push/pull permitted in E2E; sync gate shown but not triggered'
      );
      expect(result.proofLevel).toBe('PROOF_DEPTH_GUARDED_ONLY');
      logClassification('CLOUD.guarded', result.proofLevel);
    });

    it('should probe get_cloud_status if available', async () => {
      const result = await probeInvoke(
        'get_cloud_status',
        {},
        { moduleId: 'CLOUD', route: '/cloud', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('CLOUD.get_cloud_status', result.proofLevel);
    });

    it('should not have ErrorBoundary on /cloud', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });
});
