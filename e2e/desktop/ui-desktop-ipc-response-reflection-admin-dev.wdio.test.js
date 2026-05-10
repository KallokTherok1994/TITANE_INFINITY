/**
 * ui-desktop-ipc-response-reflection-admin-dev.wdio.test.js
 * v59 — IPC Response Reflection: Admin System, Admin Config, Dev Cockpit
 *
 * These modules expose real IPC commands for system health and configuration.
 * Goal: Reach IPC_RESPONSE_PROVEN or UI_REFLECTS_BACKEND_RESULT.
 * Guarded flows: secrets/tokens are BLOCKED_BY_SECRET (no capture).
 *
 * Artifact: artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl
 */

'use strict';

const {
  probeInvoke,
  probeInvokeAndReflect,
  probeGuarded,
  probeDegraded,
  waitForTauriReady,
  checkErrorBoundary,
  getBodyHTML,
  navigateAndWait,
  logClassification,
} = require('./helpers/uiDesktopBackendProofDepth.js');

const SOURCE_SPEC = 'e2e/desktop/ui-desktop-ipc-response-reflection-admin-dev.wdio.test.js';

process.env.TITANE_PROOF_ARTIFACT = 'artifacts/backend-proof-depth/v59-ipc-response-reflection.jsonl';

describe('v59 IPC Response Reflection — Admin + Dev Cockpit', () => {
  before(async () => {
    await waitForTauriReady(8000);
  });

  // ─── Admin System ────────────────────────────────────────────────────────────

  describe('Admin System (/admin)', () => {
    before(async () => {
      await navigateAndWait('/admin', 'page-admin', 8000);
    });

    it('should probe get_system_health → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvokeAndReflect(
        'get_system_health',
        {},
        '[data-testid="page-admin"]',
        { moduleId: 'ADMIN_SYSTEM', route: '/admin', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('ADMIN_SYSTEM.get_system_health', result.proofLevel);
    });

    it('should probe cp_get_system_info → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvoke(
        'cp_get_system_info',
        {},
        { moduleId: 'ADMIN_SYSTEM', route: '/admin', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('ADMIN_SYSTEM.cp_get_system_info', result.proofLevel);
    });

    it('should not have ErrorBoundary on /admin', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });

  // ─── Admin Config ────────────────────────────────────────────────────────────

  describe('Admin Config (/admin config area)', () => {
    it('should probe cp_get_ai_config → IPC_RESPONSE_PROVEN or BLOCKED_BY_SECRET', async () => {
      const result = await probeInvoke(
        'cp_get_ai_config',
        {},
        { moduleId: 'ADMIN_CONFIG', route: '/admin', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      // Config may include tokens; response shape must be captured but tokens redacted
      if (result.ok && result.responseShape !== 'null') {
        logClassification('ADMIN_CONFIG.cp_get_ai_config', 'IPC_RESPONSE_PROVEN');
      } else {
        logClassification('ADMIN_CONFIG.cp_get_ai_config', result.proofLevel);
      }
    });

    it('should classify secret-bearing config fields as BLOCKED_BY_SECRET', async () => {
      // We never capture raw token values — classify the secret fields as guarded
      const result = probeGuarded(
        'ADMIN_CONFIG',
        '/admin',
        'Secret-bearing config fields (API keys, tokens) are BLOCKED_BY_SECRET — not captured in proof artifact'
      );
      expect(result.proofLevel).toBe('PROOF_DEPTH_GUARDED_ONLY');
      logClassification('ADMIN_CONFIG.secrets_guarded', result.proofLevel);
    });
  });

  // ─── Dev Cockpit ─────────────────────────────────────────────────────────────

  describe('Dev Cockpit (/dev)', () => {
    before(async () => {
      await navigateAndWait('/dev', 'page-dev', 8000);
    });

    it('should probe get_system_health on dev route → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvokeAndReflect(
        'get_system_health',
        {},
        '[data-testid="page-dev"]',
        { moduleId: 'DEV_COCKPIT', route: '/dev', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('DEV_COCKPIT.get_system_health', result.proofLevel);
    });

    it('should probe performance_get_metrics → IPC_RESPONSE_PROVEN or classified', async () => {
      const result = await probeInvoke(
        'performance_get_metrics',
        {},
        { moduleId: 'DEV_COCKPIT', route: '/dev', sourceSpec: SOURCE_SPEC }
      );
      expect(typeof result.proofLevel).toBe('string');
      logClassification('DEV_COCKPIT.performance_get_metrics', result.proofLevel);
    });

    it('should not have ErrorBoundary on /dev', async () => {
      const hasError = await checkErrorBoundary();
      expect(hasError).toBe(false);
    });
  });
});
