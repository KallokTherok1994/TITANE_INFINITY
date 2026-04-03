// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — DESKTOP PERCEPTION FRONTEND BINDING
//   LOCK 5: Desktop operator control surfaces (pause/resume/handoff/kill-switch)
// ═══════════════════════════════════════════════════════════════════════════

import { invoke } from '@tauri-apps/api/core';
import type { DesktopSession, DesktopControlStatus } from './desktopTypes';

/**
 * Pause an active desktop perception session
 * @param sessionId The session to pause
 * @returns Updated session with status PAUSED
 */
export async function pauseDesktopSession(sessionId: string): Promise<DesktopSession> {
  return invoke<DesktopSession>('desktop_pause_session', {
    session_id: sessionId,
  });
}

/**
 * Resume a paused desktop perception session
 * @param sessionId The session to resume (must be PAUSED)
 * @returns Updated session with status PERCEIVING
 */
export async function resumeDesktopSession(sessionId: string): Promise<DesktopSession> {
  return invoke<DesktopSession>('desktop_resume_session', {
    session_id: sessionId,
  });
}

/**
 * Trigger handoff of a session to the user
 * @param sessionId The session to handoff
 * @param reason Reason for handoff (e.g., "sensitive_content", "user_intervention")
 * @returns Updated session with handoff_pending=true
 */
export async function handoffDesktopSession(
  sessionId: string,
  reason: string
): Promise<DesktopSession> {
  return invoke<DesktopSession>('desktop_handoff_session', {
    session_id: sessionId,
    reason,
  });
}

/**
 * Immediately stop and kill a desktop perception session
 * @param sessionId The session to kill
 * @param reason Reason for kill switch activation
 * @returns Promise<boolean> true if killed successfully
 */
export async function killDesktopSession(sessionId: string, reason: string): Promise<boolean> {
  return invoke<boolean>('desktop_kill_switch', {
    session_id: sessionId,
    reason,
  });
}

/**
 * Get the control surface capabilities for a desktop session
 * @param sessionId The session to query
 * @returns Control status with honest capability flags (can_pause, can_resume, can_handoff, can_kill)
 */
export async function getDesktopControlStatus(
  sessionId: string
): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>('desktop_get_control_status', {
    session_id: sessionId,
  });
}
