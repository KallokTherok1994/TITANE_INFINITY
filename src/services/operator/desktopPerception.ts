// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — DESKTOP PERCEPTION FRONTEND BINDING
//   LOCK 5: DESKTOP_SCOPED_OPERATOR_V1
//   Perception stack (open/close/active_window/list_windows) +
//   Control surfaces (pause/resume/handoff/kill-switch)
// ═══════════════════════════════════════════════════════════════════════════

import { safeInvokeCanonical } from '@/utils/invoke';
import type {
  DesktopSession,
  DesktopSessionResult,
  DesktopPerceptionResult,
  DesktopOperatorConfig,
} from './desktopTypes';

// ─── PERCEPTION STACK (LOCK 5 canonical scope) ────────────────────────────────

/**
 * Open a governed desktop perception session.
 * @param allowedSurfaces Optional list of allowed surface patterns.
 */
export async function openDesktopSession(
  allowedSurfaces: string[] = []
): Promise<DesktopSessionResult> {
  const result = await safeInvokeCanonical<DesktopSessionResult>('desktop_open_session', {
    allowed_surfaces: allowedSurfaces,
  });
  if (!result.ok || result.content === null) {
    return { ok: false, session: null, error: result.error?.message ?? 'desktop_open_session failed' };
  }
  return result.content;
}

/**
 * Close an existing desktop perception session.
 */
export async function closeDesktopSession(sessionId: string): Promise<DesktopSessionResult> {
  const result = await safeInvokeCanonical<DesktopSessionResult>('desktop_close_session', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    return { ok: false, session: null, error: result.error?.message ?? 'desktop_close_session failed' };
  }
  return result.content;
}

/**
 * Get status of an existing desktop perception session.
 */
export async function getDesktopSessionStatus(
  sessionId: string
): Promise<DesktopSessionResult> {
  const result = await safeInvokeCanonical<DesktopSessionResult>('desktop_get_session_status', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    return { ok: false, session: null, error: result.error?.message ?? 'desktop_get_session_status failed' };
  }
  return result.content;
}

/**
 * Get the currently active/focused window.
 */
export async function desktopGetActiveWindow(
  sessionId: string
): Promise<DesktopPerceptionResult> {
  const result = await safeInvokeCanonical<DesktopPerceptionResult>(
    'desktop_get_active_window',
    { session_id: sessionId }
  );
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_get_active_window failed');
  }
  return result.content;
}

/**
 * List all visible windows.
 */
export async function desktopListWindows(
  sessionId: string
): Promise<DesktopPerceptionResult> {
  const result = await safeInvokeCanonical<DesktopPerceptionResult>(
    'desktop_list_windows',
    { session_id: sessionId }
  );
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_list_windows failed');
  }
  return result.content;
}

/**
 * Get the desktop operator config (platform, availability, forbidden actions).
 */
export async function getDesktopOperatorConfig(): Promise<DesktopOperatorConfig> {
  const result = await safeInvokeCanonical<DesktopOperatorConfig>('desktop_get_config', {});
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_get_config failed');
  }
  return result.content;
}

/**
 * Check whether desktop perception is available on this platform.
 */
export async function isDesktopPerceptionAvailable(): Promise<boolean> {
  try {
    const config = await getDesktopOperatorConfig();
    return config.available;
  } catch {
    return false;
  }
}

// ─── CONTROL SURFACES (future CONTROL_SURFACES sub-lock) ─────────────────────

/**
 * Pause an active desktop perception session
 */
export async function pauseDesktopSession(sessionId: string): Promise<DesktopSession> {
  const result = await safeInvokeCanonical<DesktopSession>('desktop_pause_session', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_pause_session failed');
  }
  return result.content;
}

/**
 * Resume a paused desktop perception session
 */
export async function resumeDesktopSession(sessionId: string): Promise<DesktopSession> {
  const result = await safeInvokeCanonical<DesktopSession>('desktop_resume_session', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_resume_session failed');
  }
  return result.content;
}

/**
 * Trigger handoff of a session to the user
 */
export async function handoffDesktopSession(
  sessionId: string,
  reason: string
): Promise<DesktopSession> {
  const result = await safeInvokeCanonical<DesktopSession>('desktop_handoff_session', {
    session_id: sessionId,
    reason,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_handoff_session failed');
  }
  return result.content;
}

/**
 * Immediately stop and kill a desktop perception session
 */
export async function killDesktopSession(
  sessionId: string,
  reason: string
): Promise<boolean> {
  const result = await safeInvokeCanonical<boolean>('desktop_kill_switch', {
    session_id: sessionId,
    reason,
  });
  if (!result.ok) {
    throw new Error(result.error?.message ?? 'desktop_kill_switch failed');
  }
  return result.content ?? false;
}

/**
 * Get the control surface capabilities for a desktop session
 */
export async function getDesktopControlStatus(
  sessionId: string
): Promise<Record<string, unknown>> {
  const result = await safeInvokeCanonical<Record<string, unknown>>(
    'desktop_get_control_status',
    { session_id: sessionId }
  );
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'desktop_get_control_status failed');
  }
  return result.content;
}



