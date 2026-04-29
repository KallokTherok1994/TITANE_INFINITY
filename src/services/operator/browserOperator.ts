// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — BROWSER OPERATOR SERVICE
//   LOCK 7: BROWSER_OPERATOR_V1 — governed browser relay (One Door compliant)
//
//   All IPC calls go through safeInvokeCanonical (Rule 5 — One Door).
//   No direct @tauri-apps/api/core import.
// ═══════════════════════════════════════════════════════════════════════════

import { safeInvokeCanonical } from '@/utils/invoke';
import type {
  BrowserSession,
  BrowserRelayResult,
  BrowserOperatorConfig,
} from './browserTypes';

// ─────────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ─────────────────────────────────────────────────────────────────

/**
 * Opens a governed browser session with domain allowlist.
 * @param allowedDomains Domains this session may navigate to.
 * @param maxActions Optional cap on actions; defaults to 50.
 */
export async function openBrowserSession(
  allowedDomains: string[],
  maxActions?: number
): Promise<BrowserSession> {
  const result = await safeInvokeCanonical<BrowserSession>('browser_open_session', {
    allowed_domains: allowedDomains,
    max_actions: maxActions ?? null,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_open_session failed');
  }
  return result.content;
}

/**
 * Closes a browser session and releases resources.
 */
export async function closeBrowserSession(sessionId: string): Promise<boolean> {
  const result = await safeInvokeCanonical<boolean>('browser_close_session', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_close_session failed');
  }
  return result.content;
}

/**
 * Returns current session state.
 */
export async function getBrowserSessionStatus(sessionId: string): Promise<BrowserSession> {
  const result = await safeInvokeCanonical<BrowserSession>('browser_get_session_status', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_get_session_status failed');
  }
  return result.content;
}

// ─────────────────────────────────────────────────────────────────
// NAVIGATION & CONTENT
// ─────────────────────────────────────────────────────────────────

/**
 * Navigates to a URL if the domain is in the session allowlist.
 * Returns a relay result with ok=false and block_reason when blocked.
 */
export async function browserNavigate(
  sessionId: string,
  url: string
): Promise<BrowserRelayResult> {
  const result = await safeInvokeCanonical<BrowserRelayResult>('browser_navigate', {
    session_id: sessionId,
    url,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_navigate failed');
  }
  return result.content;
}

/**
 * Reads the full text content of the current page in the session.
 */
export async function browserRead(sessionId: string): Promise<BrowserRelayResult> {
  const result = await safeInvokeCanonical<BrowserRelayResult>('browser_read', {
    session_id: sessionId,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_read failed');
  }
  return result.content;
}

/**
 * Extracts structured content from the current page using a CSS selector.
 * @param selector CSS selector to extract elements from.
 */
export async function browserExtract(
  sessionId: string,
  selector: string
): Promise<BrowserRelayResult> {
  const result = await safeInvokeCanonical<BrowserRelayResult>('browser_extract', {
    session_id: sessionId,
    selector,
  });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_extract failed');
  }
  return result.content;
}

// ─────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────

/**
 * Returns the browser operator configuration and Playwright availability.
 */
export async function getBrowserOperatorConfig(): Promise<BrowserOperatorConfig> {
  const result = await safeInvokeCanonical<BrowserOperatorConfig>('browser_get_config', {});
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'browser_get_config failed');
  }
  return result.content;
}
