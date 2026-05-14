import { describe, it, expect } from 'vitest';
import { ALLOWED_COMMANDS } from '@/lib/security';

/**
 * v34.0.6 IPC LEGACY PRUNE
 * Verifies that the 30 commands previously in ipc-coverage-baseline.txt
 * (legacy gaps L1) are now whitelisted in src/lib/security.ts ALLOWED_COMMANDS.
 * Anti-regression: prevents reintroducing L1_WHITELIST_REJECT for these surfaces.
 */
describe('v34.0.6 IPC legacy prune — L1 whitelist alignment', () => {
  const expected = [
    // AdminPage / GovernanceCenter
    'append_security_log',
    'clear_security_log',
    'export_security_log',
    'clear_permission_audit',
    'create_ia_policy',
    'delete_ia_policy',
    'toggle_ia_policy',
    'save_ia_policies',
    'memory_debug_scan',
    // AuthCenter
    'auth_delete_api_key',
    'auth_generate_dev_token',
    'auth_get_api_keys',
    'auth_get_status',
    'auth_grant_role',
    'auth_revoke_dev_token',
    'auth_revoke_role',
    'auth_save_api_keys',
    'auth_validate_dev_token',
    // CognitivePage extended probes
    'engine_get_harmonia_state',
    'engine_get_nexus_state',
    'engine_get_sentinel_state',
    // Evolution
    'get_evolution_state',
    'run_evolution',
    // DesktopHandoff
    'desktop_open_session',
    // v34.0.6 phase 2 — DesktopPerception session lifecycle
    'desktop_pause_session',
    'desktop_resume_session',
    'desktop_handoff_session',
    'desktop_kill_switch',
    // v34.0.6 phase 3 — RAG service caller migration (ai_chat -> ai_chat_send)
    'ai_chat_send',
  ];

  it.each(expected)('whitelists %s in ALLOWED_COMMANDS', cmd => {
    expect(ALLOWED_COMMANDS.has(cmd)).toBe(true);
  });

  it('keeps the v34.0.5 engine probes intact (no regression)', () => {
    [
      'quick_health_check',
      'engine_get_cognition_state',
      'engine_get_singularity_state',
      'temporal_get_today_state',
      'identity_get_matrix',
      'web_search',
    ].forEach(cmd => {
      expect(ALLOWED_COMMANDS.has(cmd)).toBe(true);
    });
  });
});
