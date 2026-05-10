/**
 * TITANE∞ — E2E IPC Probe Allowlist (v62)
 *
 * E2E-ONLY — never imported in production runtime paths.
 * Lists the exhaustive set of allowlisted IPC commands that the E2E probe
 * bridge may invoke. All commands are:
 *   - read-only or sandbox-only (no destructive side effects)
 *   - already present in src/lib/security.ts ALLOWED_COMMANDS
 *   - safe to expose as proof evidence (no secrets returned)
 *
 * FORBIDDEN by design:
 *   - web_research (uncontrolled external network)
 *   - cloud_sync_push / cloud_restore_vault (mutating)
 *   - conversation_generate / generate_response (external AI provider)
 *   - write_snapshot / write_log (write operations)
 *   - any command with "reset", "delete", "push", "send", "save" semantics
 */

export interface AllowlistEntry {
  /** commandId is the probe key used by WDIO (stable alias) */
  commandId: string;
  /** command is the actual Tauri IPC command name */
  command: string;
  /** module it belongs to */
  module: string;
  /** true = read-only, no side effects */
  readOnly: boolean;
  /** whether sandbox/isolation is required */
  requiresSandbox: boolean;
  /** human-readable description */
  description: string;
  /** whether the command exists in ALLOWED_COMMANDS in src/lib/security.ts */
  inSecurityAllowlist: boolean;
  /** whether Rust implementation exists */
  rustImplemented: boolean;
}

/**
 * Exhaustive v62 E2E IPC probe allowlist.
 * commandId → AllowlistEntry
 */
export const E2E_IPC_PROBE_ALLOWLIST: Record<string, AllowlistEntry> = {
  // ─── ADMIN_SYSTEM ────────────────────────────────────────────────────────
  system_health: {
    commandId: 'system_health',
    command: 'get_system_health',
    module: 'ADMIN_SYSTEM',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get system health metrics (CPU, memory, disk, uptime)',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },
  helios_metrics: {
    commandId: 'helios_metrics',
    command: 'get_helios_metrics',
    module: 'ADMIN_SYSTEM',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get Helios engine metrics (system performance)',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },
  helios_state: {
    commandId: 'helios_state',
    command: 'get_helios_state',
    module: 'ADMIN_SYSTEM',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get Helios engine state',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },

  // ─── EXPERIENCE ──────────────────────────────────────────────────────────
  experience_state: {
    commandId: 'experience_state',
    command: 'experience_get_state',
    module: 'EXPERIENCE',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get experience/XP state (level, totalXp, milestones)',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },

  // ─── MEMORY ──────────────────────────────────────────────────────────────
  memory_state: {
    commandId: 'memory_state',
    command: 'memory_get_state',
    module: 'MEMORY',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get memory module state (stats, availability)',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },
  memory_state_alt: {
    commandId: 'memory_state_alt',
    command: 'get_memory_state',
    module: 'MEMORY',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get memory state (alternate command alias)',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },

  // ─── AGENT_CHAT ──────────────────────────────────────────────────────────
  health_check: {
    commandId: 'health_check',
    command: 'health_check',
    module: 'AGENT_CHAT',
    readOnly: true,
    requiresSandbox: false,
    description: 'Chat engine health check (provider status, readiness)',
    inSecurityAllowlist: true,
    rustImplemented: true,
  },

  // ─── CLOUD ───────────────────────────────────────────────────────────────
  cloud_status: {
    commandId: 'cloud_status',
    command: 'cloud_get_status',
    module: 'CLOUD',
    readOnly: true,
    requiresSandbox: false,
    description: 'Get cloud sync status (connection, last sync, vault state)',
    inSecurityAllowlist: true, // added in v62 security.ts patch
    rustImplemented: true,
  },

  // ─── RESEARCH — NO SAFE COMMAND ─────────────────────────────────────────
  // web_research is FORBIDDEN (uncontrolled external network)
  // No safe read-only status command exists for RESEARCH module
  // BLOCKED_BY_MISSING_SAFE_COMMAND for v62
};

/**
 * Returns true if commandId is in the allowlist.
 */
export function isAllowlistedCommandId(commandId: string): boolean {
  return Object.prototype.hasOwnProperty.call(E2E_IPC_PROBE_ALLOWLIST, commandId);
}

/**
 * Returns all command IDs in the allowlist.
 */
export function listAllowedCommandIds(): string[] {
  return Object.keys(E2E_IPC_PROBE_ALLOWLIST);
}

/**
 * Returns the AllowlistEntry for a given commandId, or null if not found.
 */
export function getAllowlistEntry(commandId: string): AllowlistEntry | null {
  return E2E_IPC_PROBE_ALLOWLIST[commandId] ?? null;
}
