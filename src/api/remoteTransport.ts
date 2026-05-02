/**
 * TITANE∞ — Remote Transport (Un Seul TITANE Vivant)
 *
 * Allows any client (browser, Android, remote desktop) to connect to the
 * single authoritative TITANE instance running on the PC mère via the
 * Remote Gateway Axum server (:7420 + Cloudflare tunnel).
 *
 * Hierarchy: Tauri local IPC > Remote Gateway > Degraded (no transport)
 *
 * Security:
 *  - JWT access token stored in sessionStorage (cleared on tab close)
 *  - Refresh token stored in sessionStorage
 *  - Gateway URL stored in localStorage (user-configured)
 *  - All requests require Authorization: Bearer <token>
 *  - 401 auto-triggers token refresh before retry
 *
 * © 2026 TITANE Team. All rights reserved.
 */

// ─────────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────────

const KEY_REMOTE_URL = 'titane_remote_url';
const KEY_ACCESS_TOKEN = 'titane_remote_access_token';
const KEY_REFRESH_TOKEN = 'titane_remote_refresh_token';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface RemoteIpcResult<T = unknown> {
  ok: boolean;
  content: T | null;
  error: { code: string; message: string } | null;
}

// ─────────────────────────────────────────────────────────────────
// Gateway URL management
// ─────────────────────────────────────────────────────────────────

/** Returns the stored Remote Gateway URL, or null if not configured. */
export function getRemoteGatewayUrl(): string | null {
  try {
    const url = localStorage.getItem(KEY_REMOTE_URL);
    return url && url.length > 0 ? url : null;
  } catch {
    return null;
  }
}

/** Returns true if a Remote Gateway URL is configured. */
export function isRemoteGatewayAvailable(): boolean {
  return getRemoteGatewayUrl() !== null;
}

/**
 * Persist the Remote Gateway URL for this device.
 * Strips trailing slash for consistent construction.
 */
export function setRemoteGatewayUrl(url: string): void {
  try {
    localStorage.setItem(KEY_REMOTE_URL, url.replace(/\/+$/, ''));
  } catch {
    // localStorage may be blocked in some contexts — silently ignore
  }
}

/** Clear the Remote Gateway URL and all stored tokens. */
export function clearRemoteGatewayUrl(): void {
  try {
    localStorage.removeItem(KEY_REMOTE_URL);
  } catch {
    /* noop */
  }
  clearStoredTokens();
}

// ─────────────────────────────────────────────────────────────────
// Token management (sessionStorage — cleared on tab close)
// ─────────────────────────────────────────────────────────────────

function getStoredAccessToken(): string | null {
  try {
    return sessionStorage.getItem(KEY_ACCESS_TOKEN);
  } catch {
    return null;
  }
}

function setStoredAccessToken(token: string): void {
  try {
    sessionStorage.setItem(KEY_ACCESS_TOKEN, token);
  } catch {
    /* noop */
  }
}

function getStoredRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(KEY_REFRESH_TOKEN);
  } catch {
    return null;
  }
}

function setStoredRefreshToken(token: string): void {
  try {
    sessionStorage.setItem(KEY_REFRESH_TOKEN, token);
  } catch {
    /* noop */
  }
}

function clearStoredTokens(): void {
  try {
    sessionStorage.removeItem(KEY_ACCESS_TOKEN);
    sessionStorage.removeItem(KEY_REFRESH_TOKEN);
  } catch {
    /* noop */
  }
}

// ─────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────

/**
 * Authenticate this client with the PC mère Remote Gateway using the
 * shared secret. On success, stores JWT tokens in sessionStorage.
 *
 * @param secret - The TITANE_REMOTE_SECRET configured on the PC mère (≥32 chars)
 */
export async function remoteAuthenticate(
  secret: string
): Promise<{ ok: boolean; error?: string }> {
  const baseUrl = getRemoteGatewayUrl();
  if (!baseUrl) {
    return { ok: false, error: 'REMOTE_URL_NOT_CONFIGURED' };
  }
  try {
    const resp = await fetch(`${baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    const data = (await resp.json()) as {
      ok: boolean;
      access_token?: string;
      refresh_token?: string;
      error?: string;
    };
    if (data.ok && data.access_token) {
      setStoredAccessToken(data.access_token);
      if (data.refresh_token) {
        setStoredRefreshToken(data.refresh_token);
      }
      return { ok: true };
    }
    return { ok: false, error: data.error ?? 'AUTH_FAILED' };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/** Try to refresh the access token using the stored refresh token. */
async function tryRefreshAccessToken(): Promise<boolean> {
  const baseUrl = getRemoteGatewayUrl();
  const refreshToken = getStoredRefreshToken();
  if (!baseUrl || !refreshToken) return false;
  try {
    const resp = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = (await resp.json()) as { ok: boolean; access_token?: string };
    if (data.ok && data.access_token) {
      setStoredAccessToken(data.access_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// IPC bridge — routes commands to the PC mère gateway
// ─────────────────────────────────────────────────────────────────

async function doInvokeRequest(
  baseUrl: string,
  accessToken: string,
  cmd: string,
  payload: Record<string, unknown>
): Promise<Response> {
  return fetch(`${baseUrl}/api/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ command: cmd, payload }),
  });
}

/**
 * Invoke a TITANE IPC command on the PC mère Remote Gateway.
 *
 * - Requires prior call to remoteAuthenticate() or a valid token in sessionStorage.
 * - Automatically refreshes the access token on 401 and retries once.
 * - Returns { ok, content, error } matching the canonical IPC contract.
 */
export async function remoteInvoke<T = unknown>(
  cmd: string,
  payload: Record<string, unknown> = {}
): Promise<RemoteIpcResult<T>> {
  const baseUrl = getRemoteGatewayUrl();
  if (!baseUrl) {
    return {
      ok: false,
      content: null,
      error: {
        code: 'REMOTE_URL_NOT_CONFIGURED',
        message: 'Remote Gateway URL not set. Configure it in TITANE Settings.',
      },
    };
  }

  const token = getStoredAccessToken();
  if (!token) {
    return {
      ok: false,
      content: null,
      error: {
        code: 'REMOTE_NOT_AUTHENTICATED',
        message:
          'Not authenticated. Call remoteAuthenticate() first or configure the gateway in Settings.',
      },
    };
  }

  try {
    let resp = await doInvokeRequest(baseUrl, token, cmd, payload);

    // Auto-refresh on 401 — retry once with new token
    if (resp.status === 401) {
      const refreshed = await tryRefreshAccessToken();
      const newToken = refreshed ? getStoredAccessToken() : null;
      if (newToken) {
        resp = await doInvokeRequest(baseUrl, newToken, cmd, payload);
      } else {
        clearStoredTokens();
        return {
          ok: false,
          content: null,
          error: {
            code: 'REMOTE_SESSION_EXPIRED',
            message: 'Session expired. Re-authenticate in TITANE Settings.',
          },
        };
      }
    }

    const data = (await resp.json()) as { ok: boolean; content?: T; error?: string };
    return {
      ok: data.ok === true,
      content: data.ok ? (data.content ?? null) : null,
      error: data.ok
        ? null
        : { code: 'REMOTE_INVOKE_ERROR', message: data.error ?? 'Remote invoke failed' },
    };
  } catch (err) {
    return {
      ok: false,
      content: null,
      error: { code: 'REMOTE_FETCH_ERROR', message: String(err) },
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Health probe
// ─────────────────────────────────────────────────────────────────

/**
 * Probe the Remote Gateway health endpoint.
 * Returns true if reachable and healthy.
 * Can be called before authentication to verify connectivity.
 */
export async function probeRemoteGateway(url?: string): Promise<boolean> {
  const baseUrl = url ?? getRemoteGatewayUrl();
  if (!baseUrl) return false;
  try {
    const resp = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
    if (!resp.ok) return false;
    const data = (await resp.json()) as { ok?: boolean; content?: { status?: string } };
    // Gateway returns { ok: true, content: { service, status: "ok", ... } }
    return data?.ok === true && data?.content?.status === 'ok';
  } catch {
    return false;
  }
}
