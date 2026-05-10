'use strict';
/**
 * ui-desktop-strict-backend-proof-admin-dev.wdio.test.js
 * v60 — Strict backend proof gate: ADMIN SYSTEM, ADMIN CONFIG, DEV COCKPIT
 *
 * All records: schemaVersion:"v60", capturedAt, sourceSpec (explicit), route, moduleId, tier
 */

const SOURCE_SPEC = 'ui-desktop-strict-backend-proof-admin-dev.wdio.test.js';

const {
  probeInvoke,
  probeInvokeAndReflect,
  probeGuarded,
  waitForTauriReady,
  navigateAndWait,
} = require('./helpers/uiDesktopBackendProofDepth.js');

describe('v60 Strict Backend Proof — Admin/Dev Modules (ADMIN SYSTEM, ADMIN CONFIG, DEV COCKPIT)', () => {

  // ─── ADMIN SYSTEM ─────────────────────────────────────────────────────────

  describe('ADMIN SYSTEM — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/admin', 'page-admin', 10000);
      await waitForTauriReady(8000);
    });

    it('get_system_health — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'get_system_health',
        {},
        '[data-testid="page-admin"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/admin',
          moduleId: 'ADMIN_SYSTEM',
          tier: 1,
          evidenceKind: 'HEALTH_CARD',
        }
      );
    });

    it('cp_get_system_info — IPC probe with full v60 schema', async () => {
      await probeInvoke(
        'cp_get_system_info',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/admin',
          moduleId: 'ADMIN_SYSTEM',
          tier: 1,
        }
      );
    });
  });

  // ─── ADMIN CONFIG ─────────────────────────────────────────────────────────

  describe('ADMIN CONFIG — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/admin', 'page-admin', 10000);
      await waitForTauriReady(8000);
    });

    it('cp_get_ai_config — IPC probe with full v60 schema', async () => {
      await probeInvoke(
        'cp_get_ai_config',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/admin',
          moduleId: 'ADMIN_CONFIG',
          tier: 1,
        }
      );
    });

    it('cp_get_system_info reflected in admin UI — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'cp_get_system_info',
        {},
        '[data-testid="page-admin"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/admin',
          moduleId: 'ADMIN_CONFIG',
          tier: 1,
          evidenceKind: 'RUNTIME_STATUS',
        }
      );
    });
  });

  // ─── DEV COCKPIT ──────────────────────────────────────────────────────────

  describe('DEV COCKPIT — Tier 1', () => {
    before(async () => {
      await navigateAndWait('/dev', 'page-dev', 10000);
      await waitForTauriReady(8000);
    });

    it('get_system_health on dev route — UI_REFLECTS_BACKEND_RESULT', async () => {
      await probeInvokeAndReflect(
        'get_system_health',
        {},
        '[data-testid="page-dev"]',
        {
          sourceSpec: SOURCE_SPEC,
          route: '/dev',
          moduleId: 'DEV_COCKPIT',
          tier: 1,
          evidenceKind: 'HEALTH_CARD',
        }
      );
    });

    it('cp_get_ai_config on dev route — IPC probe v60', async () => {
      await probeInvoke(
        'cp_get_ai_config',
        {},
        {
          sourceSpec: SOURCE_SPEC,
          route: '/dev',
          moduleId: 'DEV_COCKPIT',
          tier: 1,
        }
      );
    });
  });

});
