/**
 * TITANE∞ — Remote Transport
 *
 * fetch()-based IPC transport that mirrors the Tauri invoke() contract.
 * Used when TITANE runs in remote-browser mode (no Tauri WebView context).
 *
 * Architecture:
 *   Browser → POST /api/auth/token  → get JWT
 *   Browser → POST /api/invoke      → { command, payload } → { ok, content, error }
 *
 * Stored tokens: sessionStorage only — never localStorage, never cookies.
 * Token refresh is handled transparently on 401 responses.
 *
 * @module remoteTransport
 */

// ── Types ────────────────────────────────────────────────────

export interface RemoteTransportConfig {
  /** Base URL of the TITANE remote gateway (e.g. "https://abc.trycloudflare.com") */
  baseUrl: string;
  /** Shared secret used to obtain the initial JWT */
  sharedSecret?: string;
}

export interface IpcContract<T = unknown> {
  ok: boolean;
  content: T;
  error?: string;
}

// ── Session Storage Keys ──────────────────────────────────────

const SS_ACCESS_TOKEN = 'titane_remote_access_token';
const SS_REFRESH_TOKEN = 'titane_remote_refresh_token';

// ── RemoteTransport ───────────────────────────────────────────

export class RemoteTransport {
  private baseUrl: string;

  constructor(config: RemoteTransportConfig) {
    // Strip trailing slash
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  // ── Auth ──────────────────────────────────────────────────

  /**
   * Obtain tokens using the shared secret.
   * Tokens are stored in sessionStorage (cleared on tab close).
   */
  async authenticate(secret: string): Promise<void> {
    const resp = await fetch(`${this.baseUrl}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret }),
    });
    const data = await resp.json();
    if (!data.ok || !data.access_token) {
      throw new Error(data.error ?? 'Authentication failed');
    }
    sessionStorage.setItem(SS_ACCESS_TOKEN, data.access_token);
    sessionStorage.setItem(SS_REFRESH_TOKEN, data.refresh_token ?? '');
  }

  /**
   * Try to refresh the access token using the stored refresh token.
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = sessionStorage.getItem(SS_REFRESH_TOKEN);
    if (!refreshToken) return false;

    try {
      const resp = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await resp.json();
      if (!data.ok || !data.access_token) return false;
      sessionStorage.setItem(SS_ACCESS_TOKEN, data.access_token);
      return true;
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem(SS_ACCESS_TOKEN);
  }

  clearTokens(): void {
    sessionStorage.removeItem(SS_ACCESS_TOKEN);
    sessionStorage.removeItem(SS_REFRESH_TOKEN);
  }

  private getAccessToken(): string | null {
    return sessionStorage.getItem(SS_ACCESS_TOKEN);
  }

  // ── IPC Invoke ────────────────────────────────────────────

  /**
   * Invoke a command on the remote TITANE gateway.
   * Mirrors the Tauri invoke() signature.
   *
   * On 401, attempts token refresh once before throwing.
   */
  async invoke<T = unknown>(
    command: string,
    payload?: Record<string, unknown>
  ): Promise<T> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    const response = await this._invokeWithToken<T>(command, payload, token);
    return response;
  }

  private async _invokeWithToken<T>(
    command: string,
    payload: Record<string, unknown> | undefined,
    token: string
  ): Promise<T> {
    let resp: Response;
    try {
      resp = await fetch(`${this.baseUrl}/api/invoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ command, payload }),
      });
    } catch (err) {
      throw new Error(
        `Network error: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // On 401 — try refresh once
    if (resp.status === 401) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        this.clearTokens();
        throw new Error('Session expired. Please re-authenticate.');
      }
      const newToken = this.getAccessToken()!;
      return this._invokeWithToken<T>(command, payload, newToken);
    }

    const data: IpcContract<T> = await resp.json();
    if (!data.ok) {
      throw new Error(data.error ?? `Command '${command}' failed`);
    }
    return data.content;
  }

  // ── REST Shortcuts ────────────────────────────────────────

  async healthCheck(): Promise<unknown> {
    const resp = await fetch(`${this.baseUrl}/api/health`);
    return resp.json();
  }

  async getRuntimeConfig(): Promise<unknown> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch(`${this.baseUrl}/api/config/runtime`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: IpcContract = await resp.json();
    if (!data.ok) throw new Error(data.error ?? 'Failed to get runtime config');
    return data.content;
  }
}

// ── Singleton management ──────────────────────────────────────

let _instance: RemoteTransport | null = null;

export function getRemoteTransport(): RemoteTransport {
  if (!_instance) {
    const base =
      (typeof window !== 'undefined' &&
        (window as Window & { __TITANE_REMOTE_BASE__?: string })
          .__TITANE_REMOTE_BASE__) ||
      window.location.origin;
    _instance = new RemoteTransport({ baseUrl: base });
  }
  return _instance;
}

export function initRemoteTransport(config: RemoteTransportConfig): RemoteTransport {
  _instance = new RemoteTransport(config);
  return _instance;
}
