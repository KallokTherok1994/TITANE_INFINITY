/**
 * TITANE_INFINITY v34.1.0 — RemoteTransport
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Browser/remote transport client that connects a TITANE client (PC ami,
 * mobile, tablette) to the canonical Tauri runtime running on the PC mère
 * via the Remote Gateway (One Door governance).
 *
 *   client (browser)  ──POST /api/auth/token──▶  gateway  ──▶  Tauri runtime
 *                     ──POST /api/invoke    ──▶  gateway  ──▶  Tauri command
 *
 * Invariants:
 *   - JWT cached in sessionStorage (NOT localStorage — survives reload but
 *     never bleeds across user sessions).
 *   - Refreshes the token T-5 minutes before expiry.
 *   - Memory CRUD invoked through this transport MUST NOT persist locally:
 *     remote clients delegate all memory state to the PC mère.
 *   - Envelope contract `{ ok, content, error }` is the only accepted shape.
 */

const REMOTE_URL_STORAGE_KEY = 'titane_remote_url';
const JWT_STORAGE_KEY = 'titane_remote_jwt_v1';
const TOKEN_LIFETIME_MS = 4 * 60 * 60 * 1000; // 4 h
const REFRESH_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // T-5 min

export class RemoteMemoryLocalPersistenceError extends Error {
  constructor(key: string) {
    super(
      `RemoteTransport: remote clients must not persist memory locally (attempted localStorage key=${key}). Memory CRUD goes through the PC mère via /api/invoke.`
    );
    this.name = 'RemoteMemoryLocalPersistenceError';
  }
}

export interface RemoteEnvelope<T = unknown> {
  ok: boolean;
  content: T | null;
  error: string | null;
}

interface CachedJwt {
  token: string;
  /** Absolute expiry timestamp in ms. */
  expiresAt: number;
}

export interface RemoteTransportOptions {
  /** Base URL of the gateway, e.g. `https://titane.example.com`. */
  baseUrl?: string;
  /** Pre-shared secret (only used on the very first /api/auth/token call). */
  sharedSecret?: string;
  /** Override `globalThis.fetch` (used by tests). */
  fetchImpl?: typeof fetch;
}

function resolveBaseUrl(opts: RemoteTransportOptions): string {
  if (opts.baseUrl && opts.baseUrl.length > 0) return opts.baseUrl;
  // Vite env (build-time) wins; runtime override via localStorage allows the
  // user to point a single client at a different gateway without rebuild.
  const viteEnv =
    typeof import.meta !== 'undefined' &&
    typeof (import.meta as ImportMeta & { env?: Record<string, string> }).env !== 'undefined'
      ? ((import.meta as ImportMeta & { env: Record<string, string> }).env
          .VITE_TITANE_REMOTE_URL as string | undefined)
      : undefined;
  if (viteEnv) return viteEnv;
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem(REMOTE_URL_STORAGE_KEY);
    if (stored && stored.length > 0) return stored;
  }
  return '';
}

function readCachedJwt(): CachedJwt | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(JWT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedJwt;
    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedJwt(jwt: CachedJwt): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(JWT_STORAGE_KEY, JSON.stringify(jwt));
  } catch {
    /* sessionStorage full or unavailable — fall back to in-memory only */
  }
}

function isJwtFresh(jwt: CachedJwt | null, now: number): boolean {
  if (!jwt) return false;
  return jwt.expiresAt - REFRESH_BEFORE_EXPIRY_MS > now;
}

export class RemoteTransport {
  private readonly baseUrl: string;
  private readonly sharedSecret: string;
  private readonly fetchImpl: typeof fetch;
  /** In-memory mirror of the sessionStorage JWT to avoid a JSON parse per call. */
  private jwt: CachedJwt | null;

  constructor(opts: RemoteTransportOptions = {}) {
    this.baseUrl = resolveBaseUrl(opts);
    this.sharedSecret = opts.sharedSecret ?? '';
    this.fetchImpl =
      opts.fetchImpl ??
      (typeof fetch !== 'undefined'
        ? fetch.bind(globalThis)
        : (() => {
            throw new Error('RemoteTransport: no fetch implementation available');
          }));
    this.jwt = readCachedJwt();
  }

  /**
   * Returns a non-empty JWT string, refreshing it through the gateway if the
   * cached one is missing or within the T-5min refresh window.
   */
  async ensureToken(): Promise<string> {
    const now = Date.now();
    if (isJwtFresh(this.jwt, now)) {
      return this.jwt!.token;
    }
    const url = `${this.baseUrl}/api/auth/token`;
    const body = JSON.stringify({ shared_secret: this.sharedSecret });
    const res = await this.fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!res.ok) {
      throw new Error(
        `RemoteTransport: /api/auth/token failed (HTTP ${res.status})`
      );
    }
    const parsed = (await res.json()) as RemoteEnvelope<{ token: string }>;
    if (!parsed.ok || !parsed.content?.token) {
      throw new Error(
        `RemoteTransport: /api/auth/token returned non-ok envelope (${parsed.error ?? 'unknown'})`
      );
    }
    const next: CachedJwt = {
      token: parsed.content.token,
      expiresAt: now + TOKEN_LIFETIME_MS,
    };
    this.jwt = next;
    writeCachedJwt(next);
    return next.token;
  }

  /**
   * Invoke a remote command through the gateway. Returns the unwrapped
   * `content` on success, throws on `ok=false` or HTTP error.
   *
   * Anti-regression guard: if the command starts with `memory_` AND the caller
   * touches localStorage with a `memory_*` key during this call window, we
   * throw RemoteMemoryLocalPersistenceError — remote clients persist nothing
   * locally.
   */
  async invoke<T = unknown>(command: string, payload?: unknown): Promise<T> {
    if (
      command.startsWith('memory_') &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      this.guardLocalMemoryPersistence();
    }
    const token = await this.ensureToken();
    const url = `${this.baseUrl}/api/invoke`;
    const res = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ command, payload }),
    });
    if (!res.ok) {
      throw new Error(
        `RemoteTransport: /api/invoke ${command} failed (HTTP ${res.status})`
      );
    }
    const env = (await res.json()) as RemoteEnvelope<T>;
    if (!env.ok) {
      throw new Error(
        `RemoteTransport: ${command} returned ok=false (${env.error ?? 'unknown'})`
      );
    }
    return (env.content as T) ?? (null as unknown as T);
  }

  /**
   * Wraps localStorage.setItem so that ANY memory_* key written during a
   * remote invoke throws RemoteMemoryLocalPersistenceError. Idempotent.
   */
  private guardLocalMemoryPersistence(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const ls = window.localStorage as Storage & { __titane_guard__?: boolean };
    if (ls.__titane_guard__) return;
    const original = ls.setItem.bind(ls);
    const wrapped = (key: string, value: string) => {
      if (/^memory_/i.test(key)) {
        throw new RemoteMemoryLocalPersistenceError(key);
      }
      original(key, value);
    };
    try {
      ls.setItem = wrapped;
    } catch {
      // Some test environments freeze Storage.setItem; fall back to defineProperty
      try {
        Object.defineProperty(ls, 'setItem', {
          configurable: true,
          writable: true,
          value: wrapped,
        });
      } catch {
        // If both fail, mark guard active but leave behavior unchanged (best effort)
      }
    }
    ls.__titane_guard__ = true;
  }
}

let singleton: RemoteTransport | null = null;

export function getRemoteTransport(
  opts: RemoteTransportOptions = {}
): RemoteTransport {
  if (!singleton) {
    singleton = new RemoteTransport(opts);
  }
  return singleton;
}

/** Test-only — wipes the singleton + sessionStorage JWT. */
export function __resetRemoteTransportForTests__(): void {
  singleton = null;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(JWT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
