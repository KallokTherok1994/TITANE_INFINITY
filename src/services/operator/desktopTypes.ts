// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — DESKTOP PERCEPTION TYPES
//   LOCK 5: DESKTOP_SCOPED_OPERATOR_V1
//   Perception stack (session, window discovery) + Control surface types
// ═══════════════════════════════════════════════════════════════════════════

// ─── PERCEPTION STACK types ──────────────────────────────────────────────────

export enum DesktopScopeCategory {
  Allowed = "Allowed",
  Denied = "Denied",
  Unknown = "Unknown",
}

export enum DesktopSessionStatus {
  Idle = "idle",
  Perceiving = "perceiving",
  Blocked = "blocked",
  Stopped = "stopped",
  Paused = "paused",
  HandoffPending = "handoff_pending",
}

/** Information about a single desktop window */
export interface DesktopWindowInfo {
  title: string;
  process_name: string;
  pid: number;
  is_focused: boolean;
  is_visible: boolean;
  window_class?: string;
}

/**
 * Desktop perception session (canonical)
 */
export interface DesktopSession {
  session_id: string;
  authority_level: string;
  allowed_surfaces: string[];
  status: DesktopSessionStatus | 'idle' | 'perceiving' | 'paused' | 'handoff_pending' | 'blocked' | 'stopped';
  started_at: string;
  expires_at: string;
  actions_count: number;
  max_actions: number;
  handoff_pending: boolean;
  paused_at?: string;
  handoff_reason?: string;
  kill_reason?: string;
}

/** Result of desktop_open_session / desktop_close_session */
export interface DesktopSessionResult {
  ok: boolean;
  session: DesktopSession | null;
  error?: string;
}

/** Result of desktop_get_active_window / desktop_list_windows */
export interface DesktopPerceptionResult {
  ok: boolean;
  category: string;
  scope_used: string;
  action: string;
  active_window?: DesktopWindowInfo | null;
  windows?: DesktopWindowInfo[] | null;
  block_reason: string | null;
  handoff_required: boolean;
  actions_remaining: number;
  session_id: string;
  error?: string;
}

/** Config for the desktop perception operator */
export interface DesktopOperatorConfig {
  available: boolean;
  platform: string;
  max_sessions: number;
  session_ttl_seconds: number;
  forbidden: string[];
  generated_at: string;
}

// ─── CONTROL SURFACES types (LOCK 5 future sub-lock) ─────────────────────────

/**
 * Desktop control surface status and capabilities
 */
export interface DesktopControlStatus {
  can_pause: boolean;
  can_resume: boolean;
  can_handoff: boolean;
  can_kill: boolean;
  current_status:
    | 'idle'
    | 'perceiving'
    | 'paused'
    | 'handoff_pending'
    | 'blocked'
    | 'stopped';
  paused_at?: string;
  paused_duration_seconds?: number;
  last_handoff_reason?: string;
  last_kill_reason?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DESKTOP_FORBIDDEN_ACTIONS = [
  "screenshot_capture",
  "raw_input_injection",
  "keylog",
  "clipboard_read",
  "clipboard_write",
  "screen_record",
  "auto_click",
] as const;

export type DesktopForbiddenAction = (typeof DESKTOP_FORBIDDEN_ACTIONS)[number];

