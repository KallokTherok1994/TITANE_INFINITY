// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — DESKTOP PERCEPTION TYPES
//   LOCK 5: Control surface status and capability types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Desktop control surface status and capabilities
 */
export interface DesktopControlStatus {
  // Status flags
  can_pause: boolean;
  can_resume: boolean;
  can_handoff: boolean;
  can_kill: boolean;

  // Current state
  current_status:
    | 'idle'
    | 'perceiving'
    | 'paused'
    | 'handoff_pending'
    | 'blocked'
    | 'stopped';

  // Timing
  paused_at?: string;
  paused_duration_seconds?: number;

  // Reason tracking
  last_handoff_reason?: string;
  last_kill_reason?: string;
}
