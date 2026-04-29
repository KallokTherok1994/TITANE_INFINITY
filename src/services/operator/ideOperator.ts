// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — IDE OPERATOR SERVICE
//   LOCK 6: IDE_OPERATOR_V1 — governed IDE/dev relay (One Door compliant)
//
//   All IPC calls go through safeInvokeCanonical (Rule 5 — One Door).
//   No direct @tauri-apps/api/core import.
// ═══════════════════════════════════════════════════════════════════════════

import { safeInvokeCanonical } from '@/utils/invoke';
import type {
  IDESession,
  IDERelayResult,
  IDEOperatorConfig,
  IDEScopeCategory,
} from './ideTypes';

// ─────────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * Opens a governed IDE session.
 * @param workspaceDir Absolute path to the workspace root.
 * @param allowedScopes Optional scope override; defaults to server-side defaults.
 */
export async function openIDESession(
  workspaceDir: string,
  allowedScopes?: IDEScopeCategory[]
): Promise<IDESession> {
  const result = await safeInvokeCanonical<IDESession>('ide_open_session', {
    workspace_dir: workspaceDir,
    allowed_scopes: allowedScopes ?? [],
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_open_session failed');
  }
  return result.content;
}

/**
 * Closes an active IDE session.
 */
export async function closeIDESession(sessionId: string): Promise<boolean> {
  const result = await safeInvokeCanonical<boolean>('ide_close_session', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_close_session failed');
  }
  return result.content;
}

/**
 * Returns the current state of an IDE session.
 */
export async function getIDESessionStatus(sessionId: string): Promise<IDESession> {
  const result = await safeInvokeCanonical<IDESession>('ide_get_session_status', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_get_session_status failed');
  }
  return result.content;
}

// ─────────────────────────────────────────────────────────────────
// PERCEPTION STACK — READ-ONLY RELAY
// ─────────────────────────────────────────────────────────────────

/**
 * Lists the repository structure (repo_inventory).
 */
export async function ideRepoInventory(sessionId: string): Promise<IDERelayResult> {
  const result = await safeInvokeCanonical<IDERelayResult>('ide_repo_inventory', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_repo_inventory failed');
  }
  return result.content;
}

/**
 * Reads a file via the governed IDE relay.
 */
export async function ideFileRead(
  sessionId: string,
  path: string
): Promise<IDERelayResult> {
  const result = await safeInvokeCanonical<IDERelayResult>('ide_file_read', {
    session_id: sessionId,
    path,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_file_read failed');
  }
  return result.content;
}

/**
 * Searches patterns in files via the governed IDE relay.
 */
export async function ideGrepSearch(
  sessionId: string,
  pattern: string,
  path?: string
): Promise<IDERelayResult> {
  const result = await safeInvokeCanonical<IDERelayResult>('ide_grep_search', {
    session_id: sessionId,
    pattern,
    path: path ?? null,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_grep_search failed');
  }
  return result.content;
}

/**
 * Returns git status for the session workspace.
 */
export async function ideGitStatus(sessionId: string): Promise<IDERelayResult> {
  const result = await safeInvokeCanonical<IDERelayResult>('ide_git_status', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_git_status failed');
  }
  return result.content;
}

/**
 * Returns git diff for the session workspace.
 * @param target Optional: file path or commit ref.
 */
export async function ideGitDiff(
  sessionId: string,
  target?: string
): Promise<IDERelayResult> {
  const result = await safeInvokeCanonical<IDERelayResult>('ide_git_diff', {
    session_id: sessionId,
    target: target ?? null,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_git_diff failed');
  }
  return result.content;
}

// ─────────────────────────────────────────────────────────────────
// EXECUTION STACK — BOUNDED COMMAND
// ─────────────────────────────────────────────────────────────────

/**
 * Executes a bounded command in the session workspace.
 * Only commands on the safe allowlist are permitted.
 */
export async function ideSafeCommand(
  sessionId: string,
  command: string
): Promise<IDERelayResult> {
  const result = await safeInvokeCanonical<IDERelayResult>('ide_safe_command', {
    session_id: sessionId,
    command,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_safe_command failed');
  }
  return result.content;
}

// ─────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────

/**
 * Returns IDE operator configuration + tooling availability.
 */
export async function getIDEOperatorConfig(): Promise<IDEOperatorConfig> {
  const result = await safeInvokeCanonical<IDEOperatorConfig>('ide_get_config');
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'ide_get_config failed');
  }
  return result.content;
}

/**
 * Quick availability check — returns true if IDE operator is reachable.
 */
export async function isIDEOperatorAvailable(): Promise<boolean> {
  try {
    await getIDEOperatorConfig();
    return true;
  } catch {
    return false;
  }
}
