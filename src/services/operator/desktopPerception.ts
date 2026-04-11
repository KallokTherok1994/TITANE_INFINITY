// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — DESKTOP PERCEPTION FRONTEND BINDING
//   LOCK 5: Desktop operator control surfaces (pause/resume/handoff/kill-switch)
// ═══════════════════════════════════════════════════════════════════════════

import { safeInvokeCanonical, type CanonicalIpcResult } from '@/utils/invoke';
import type { DesktopSession, DesktopControlStatus } from './desktopTypes';

/**
 * Pause an active desktop perception session
 * @param sessionId The session to pause
 * @returns Canonical IPC result with updated session (status PAUSED)
 */
export async function pauseDesktopSession(
  sessionId: string
): Promise<CanonicalIpcResult<DesktopSession>> {
  return safeInvokeCanonical<DesktopSession>('desktop_pause_session', {
    session_id: sessionId,
  });
}

/**
 * Resume a paused desktop perception session
 * @param sessionId The session to resume (must be PAUSED)
 * @returns Canonical IPC result with updated session (status PERCEIVING)
 */
export async function resumeDesktopSession(
  sessionId: string
): Promise<CanonicalIpcResult<DesktopSession>> {
  return safeInvokeCanonical<DesktopSession>('desktop_resume_session', {
    session_id: sessionId,
  });
}

/**
 * Trigger handoff of a session to the user
 * @param sessionId The session to handoff
 * @param reason Reason for handoff (e.g., "sensitive_content", "user_intervention")
 * @returns Canonical IPC result with updated session (handoff_pending=true)
 */
export async function handoffDesktopSession(
  sessionId: string,
  reason: string
): Promise<CanonicalIpcResult<DesktopSession>> {
  return safeInvokeCanonical<DesktopSession>('desktop_handoff_session', {
    session_id: sessionId,
    reason,
  });
}

/**
 * Immediately stop and kill a desktop perception session
 * @param sessionId The session to kill
 * @param reason Reason for kill switch activation
 * @returns Canonical IPC result — ok: true if killed successfully
 */
export async function killDesktopSession(
  sessionId: string,
  reason: string
): Promise<CanonicalIpcResult<boolean>> {
  return safeInvokeCanonical<boolean>('desktop_kill_switch', {
    session_id: sessionId,
    reason,
  });
}

/**
 * Get the control surface capabilities for a desktop session
 * @param sessionId The session to query
 * @returns Canonical IPC result with control status (can_pause, can_resume, can_handoff, can_kill)
 */
export async function getDesktopControlStatus(
  sessionId: string
): Promise<CanonicalIpcResult<Record<string, unknown>>> {
  return safeInvokeCanonical<Record<string, unknown>>('desktop_get_control_status', {
    session_id: sessionId,
  });
}
