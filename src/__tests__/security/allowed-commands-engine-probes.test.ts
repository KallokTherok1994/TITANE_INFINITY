/**
 * v34.0.5 — IPC L1 whitelist coverage for engine probes.
 * Guarantees that the 6 commands fixed in v34.0.5 stay registered in
 * ALLOWED_COMMANDS. Regressing this set immediately re-breaks the visible UI
 * runtime pulse (Settings, AdminPage, GlobalRuntimePulse, CognitivePage,
 * TwinsPage, TemporalFlowCenter, IdentityCenter).
 */
import { describe, expect, it } from 'vitest';

import { ALLOWED_COMMANDS } from '../../lib/security';

const REQUIRED_PROBES = [
  'quick_health_check',
  'engine_get_cognition_state',
  'engine_get_singularity_state',
  'temporal_get_today_state',
  'identity_get_matrix',
  'web_search',
] as const;

describe('ALLOWED_COMMANDS — engine probes (v34.0.5)', () => {
  for (const cmd of REQUIRED_PROBES) {
    it(`whitelists "${cmd}" so secureInvoke does not throw before IPC`, () => {
      expect(ALLOWED_COMMANDS.has(cmd)).toBe(true);
    });
  }
});
