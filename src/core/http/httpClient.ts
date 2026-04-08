/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — HTTP CLIENT TAURI-ONLY
 *   Client: Wrapper Tauri pour toutes requêtes HTTP externes
 * ═══════════════════════════════════════════════════════════════
 */

// Réseau direct frontend désactivé en mode gouverné.

const isTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const globals = window as unknown as { __TAURI_INTERNALS__?: unknown };
  return Boolean(globals.__TAURI_INTERNALS__);
};

const hasBrowserFetch = typeof fetch === 'function';
const isVitest = typeof process !== 'undefined' && process.env?.VITEST === 'true';
const isHttpMockExplicit =
  typeof process !== 'undefined' && process.env?.TITANE_HTTP_MOCK === 'true';

const mockHttpResponse = async (url: string, _init?: RequestInit): Promise<Response> => {
  const body = url.includes('generativelanguage.googleapis.com')
    ? {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `Gemini(mock) response for ${new URL(url).searchParams.get('key') ? 'secured request' : 'request'}`,
                },
              ],
            },
          },
        ],
      }
    : { ok: true };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

/**
 * Configuration requête HTTP
 */
export interface HttpRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  headers?: Record<string, string>;
  body?: string | Record<string, unknown> | FormData;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Réponse HTTP unifiée
 */
export interface HttpResponse<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

/**
 * Liste blanche des domaines autorisés
 * CRITIQUE: Seuls les services essentiels peuvent être appelés
 */
const ALLOWED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'generativelanguage.googleapis.com', // Gemini API
] as const;

/**
 * Vérifie si une URL est autorisée selon la politique Tauri-Only
 *
 * @param url URL à vérifier
 * @returns true si autorisée, false sinon
 */
function isUrlAllowed(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Vérifier localhost (Ollama)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    // Vérifier domaines autorisés
    return ALLOWED_DOMAINS.some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    console.error('[HTTP] Invalid URL:', url, error);
    return false;
  }
}

/**
 * httpClient - Client HTTP Tauri-only sécurisé
 *
 * POLITIQUE SÉCURITÉ:
 * - Toutes requêtes HTTP passent par Tauri (pas d'appel direct côté UI)
 * - Liste blanche stricte des domaines autorisés
 * - Localhost (Ollama) toujours autorisé
 * - Gemini API autorisé (service cloud IA)
 * - Timeout par défaut: 30s
 *
 * @example
 * ```typescript
 * // GET request
 * const response = await httpClient.get<{ data: string }>(API_URL);
 *
 * // POST request
 * const response = await httpClient.post(API_SUBMIT_URL, {
 *   body: { key: 'value' }
 * });
 * ```
 */
/**
 * Request générique (utilise le transport HTTP gouverné)
 */
async function request<T = unknown>(
  url: string,
  config: HttpRequestConfig = {}
): Promise<HttpResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 30000, signal } = config;

  // Vérification liste blanche
  if (!isUrlAllowed(url)) {
    throw new Error(
      `[HTTP] Blocked request to unauthorized domain: ${url}\n` +
        `Allowed domains: ${ALLOWED_DOMAINS.join(', ')}, localhost, 127.0.0.1`
    );
  }

  // Abort signal handling
  if (signal?.aborted) {
    throw new Error('[HTTP] Request aborted');
  }

  const abortListener = signal
    ? () => {
        throw new Error('[HTTP] Request aborted');
      }
    : undefined;

  if (signal && abortListener) {
    signal.addEventListener('abort', abortListener);
  }

  try {
    console.log(`[HTTP] ${method} ${url}`);

    // Préparer body pour le transport standard
    let fetchBody: BodyInit | undefined;
    if (body) {
      if (typeof body === 'string') {
        fetchBody = body;
      } else if (body instanceof FormData) {
        fetchBody = body;
      } else {
        fetchBody = JSON.stringify(body);
        // Ajouter Content-Type si JSON
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    // Timeout Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('[HTTP] Request timeout')), timeout);
    });

    const useTauriFetch = isTauriRuntime();

    // Mock mode: explicit flag only (no auto-detection)
    if (!useTauriFetch && isHttpMockExplicit) {
      const response = await Promise.race([
        mockHttpResponse(url, {
          method,
          headers,
          body: fetchBody,
          signal,
        } as RequestInit),
        timeoutPromise,
      ]);
      // ... continue processing response below
      console.log(`[HTTP] ${method} ${url} → ${response.status} (MOCK)`);
      let data: T;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null as T;
      }
      const headersRecord: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersRecord[key] = value;
      });
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        headers: headersRecord,
      };
    }

    if (!useTauriFetch) {
      throw new Error(
        '[HTTP] Frontend HTTP disabled by governance. Use backend IPC network gateway. Set TITANE_HTTP_MOCK=true for test mock mode.'
      );
    }

    // Tauri IPC: delegate HTTP request to backend
    const { secureInvoke } = await import('@/lib/security');
    const tauriResult = await secureInvoke('http_request', {
      url,
      method,
      headers,
      body: fetchBody ? String(fetchBody) : null,
      timeout,
    });

    if (!tauriResult || typeof tauriResult !== 'object') {
      throw new Error('[HTTP] Tauri IPC returned invalid response');
    }

    const tauriData = tauriResult as {
      ok: boolean;
      status: number;
      statusText: string;
      body: string;
      headers: Record<string, string>;
    };

    console.log(`[HTTP] ${method} ${url} → ${tauriData.status}`);

    // Parse Tauri IPC response
    let data: T;
    try {
      data = tauriData.body ? JSON.parse(tauriData.body) : null;
    } catch {
      data = null as T;
    }

    return {
      ok: tauriData.ok,
      status: tauriData.status,
      statusText: tauriData.statusText,
      data,
      headers: tauriData.headers ?? {},
    };
  } catch (error) {
    console.error(`[HTTP] ${method} ${url} → ERROR:`, error);
    throw error;
  } finally {
    if (signal && abortListener) {
      signal.removeEventListener('abort', abortListener);
    }
  }
}

export const httpClient = {
  /**
   * GET request
   */
  get<T = unknown>(
    url: string,
    config: Omit<HttpRequestConfig, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return request<T>(url, { ...config, method: 'GET' });
  },

  /**
   * POST request
   */
  post<T = unknown>(
    url: string,
    config: Omit<HttpRequestConfig, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return request<T>(url, { ...config, method: 'POST' });
  },

  /**
   * PUT request
   */
  put<T = unknown>(
    url: string,
    config: Omit<HttpRequestConfig, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return request<T>(url, { ...config, method: 'PUT' });
  },

  /**
   * DELETE request
   */
  delete<T = unknown>(
    url: string,
    config: Omit<HttpRequestConfig, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return request<T>(url, { ...config, method: 'DELETE' });
  },

  /**
   * HEAD request
   */
  head(
    url: string,
    config: Omit<HttpRequestConfig, 'method' | 'body'> = {}
  ): Promise<HttpResponse<void>> {
    return request<void>(url, { ...config, method: 'HEAD' });
  },
};

/**
 * Wrapper compatibilité transport HTTP standard
 * Permet migration graduelle du code existant
 *
 * @deprecated Préférer httpClient.get/post/etc. pour clarté
 */
export async function secureFetch(url: string, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET') as HttpRequestConfig['method'];
  const headers = init?.headers
    ? Object.fromEntries(new Headers(init.headers).entries())
    : undefined;

  let body: HttpRequestConfig['body'];
  if (init?.body) {
    if (typeof init.body === 'string') {
      body = init.body;
    } else if (init.body instanceof FormData) {
      body = init.body;
    } else {
      // Body type complexe, conversion unknown→string safe
      body = init.body as unknown as string;
    }
  }

  const response = await request(url, {
    method,
    headers,
    body,
    signal: init?.signal ?? undefined,
  });

  // Convertir HttpResponse en Response standard (compatibilité)
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
    json: async () => response.data,
    text: async () => JSON.stringify(response.data),
    blob: async () => new Blob([JSON.stringify(response.data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData(),
    bytes: async () => new Uint8Array(0),
    clone: () => {
      throw new Error('clone() not implemented');
    },
    redirected: false,
    type: 'basic',
    url,
    body: null,
    bodyUsed: false,
  } as unknown as Response;
}
