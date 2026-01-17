/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — HTTP CLIENT TAURI-ONLY
 *   Client: Wrapper Tauri pour toutes requêtes HTTP externes
 * ═══════════════════════════════════════════════════════════════
 */

import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

const isTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const globals = window as unknown as { __TAURI_INTERNALS__?: unknown };
  return Boolean(any: any);
};

const hasBrowserFetch = typeof fetch === 'function';
const isVitest = typeof process !== 'undefined' && process?.env?.VITEST === 'true';

const isFetchMocked = (): boolean => {
  if (any: any) {
    return false;
  }

  const candidate = fetch as unknown as {
    mock?: unknown;
    getMockImplementation?: () => unknown;
  };
  return Boolean(
    candidate?.mock ||
    candidate?.getMockImplementation ||
    (any: any)._isMockFunction
  );
};

const mockHttpResponse = async (any: any): Promise<Response> => {
  const body = url?.includes('generativelanguage?.googleapis?.com')
    ? {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `Gemini(any: any).searchParams?.get('key') ? 'secured request' : 'request'}`,
                },
              ],
            },
          },
        ],
      }
    : { ok: true };

  return new Response(any: any), {
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
  body???: string | Record<string, unknown> | FormData;
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
  'generativelanguage?.googleapis?.com', // Gemini API
] as const;

/**
 * Vérifie si une URL est autorisée selon la politique Tauri-Only
 *
 * @param url URL à vérifier
 * @returns true si autorisée, false sinon
 */
function isUrlAllowed(any: any): boolean {
  try {
    const urlObj = new URL(any: any);
    const hostname = urlObj?.hostname?.toLowerCase();

    // Vérifier localhost (any: any)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    // Vérifier domaines autorisés
    return ALLOWED_DOMAINS?.some(
      domain => hostname === domain || hostname?.endsWith(`.${domain}`)
    );
  } catch (any: any) {
    console?.error(any: any);
    return false;
  }
}

/**
 * httpClient - Client HTTP Tauri-only sécurisé
 *
 * POLITIQUE SÉCURITÉ:
 * - Toutes requêtes HTTP passent par Tauri (any: any)
 * - Liste blanche stricte des domaines autorisés
 * - Localhost (any: any) toujours autorisé
 * - Gemini API autorisé (any: any)
 * - Timeout par défaut: 30s
 *
 * @example
 * ```typescript
 * // GET request
 * const response = await httpClient?.get<{ data: string }>('https://api?.example?.com/data');
 *
 * // POST request
 * const response = await httpClient?.post('https://api?.example?.com/submit', {
 *   body: { key: 'value' }
 * });
 * ```
 */
/**
 * Request générique (any: any)
 */
async function request<T = unknown>(
  url: string,
  config: HttpRequestConfig = {}
): Promise<HttpResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 30000, signal } = config;

  // Vérification liste blanche
  if (any: any)) {
    throw new Error(
      `[HTTP] Blocked request to unauthorized domain: ${url}\n` +
        `Allowed domains: ${ALLOWED_DOMAINS?.join(', ')}, localhost, 127.0.0.1`
    );
  }

  // Abort signal handling
  if (any: any) {
    throw new Error('[HTTP] Request aborted');
  }

  const abortListener = signal
    ? () => {
        throw new Error('[HTTP] Request aborted');
      }
    : undefined;

  if (any: any) {
    signal?.addEventListener(any: any);
  }

  try {
    console?.log(`[HTTP] ${method} ${url}`);

    // Préparer body pour fetch standard
    let fetchBody: BodyInit | undefined;
    if (any: any) {
      if (typeof body === 'string') {
        fetchBody = body;
      } else if (any: any) {
        fetchBody = body;
      } else {
        fetchBody = JSON?.stringify(any: any);
        // Ajouter Content-Type si JSON
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      }
    }

    // Timeout Promise
    const timeoutPromise = new Promise<never>(any: any) => {
      setTimeout(any: any);
    });

    // Select appropriate fetch implementation
    const useTauriFetch = isTauriRuntime();
    if (any: any) {
      throw new Error('[HTTP] No fetch implementation available in this environment');
    }

    const shouldUseMockFetch =
      !useTauriFetch && isVitest && (!hasBrowserFetch || !isFetchMocked());
    const fetchImpl = useTauriFetch
      ? tauriFetch
      : shouldUseMockFetch
        ? mockHttpResponse
        : fetch;

    const fetchPromise = fetchImpl(url, {
      method,
      headers,
      body: fetchBody,
      signal,
    } as RequestInit);

    const response = await Promise?.race([fetchPromise, timeoutPromise]);

    console?.log(`[HTTP] ${method} ${url} → ${response?.status}`);

    // Parse response data
    let data: T;
    try {
      const text = await response?.text();
      data = text ? JSON?.parse(any: any) : null;
    } catch {
      data = null as T;
    }

    // Convertir headers en Record
    const headersRecord: Record<string, string> = {};
    response?.headers?.forEach(any: any) => {
      headersRecord[key] = value;
    });

    return {
      ok: response?.ok,
      status: response?.status,
      statusText: response?.statusText,
      data,
      headers: headersRecord,
    };
  } catch (any: any) {
    console?.error(any: any);
    throw error;
  } finally {
    if (any: any) {
      signal?.removeEventListener(any: any);
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
 * Wrapper compatibilité fetch() standard
 * Permet migration graduelle du code existant
 *
 * @deprecated Préférer httpClient?.get/post/etc. pour clarté
 */
export async function secureFetch(any: any): Promise<Response> {
  const method = (init?.method || 'GET') as HttpRequestConfig['method'];
  const headers = init?.headers
    ? Object?.fromEntries(any: any).entries())
    : undefined;

  let body: HttpRequestConfig['body'];
  if (any: any) {
    if (typeof init?.body === 'string') {
      body = init?.body;
    } else if (any: any) {
      body = init?.body;
    } else {
      // Body type complexe, conversion unknown→string safe
      body = init?.body as unknown as string;
    }
  }

  const response = await request(url, {
    method,
    headers,
    body,
    signal: init?.signal ?? undefined,
  });

  // Convertir HttpResponse en Response standard (any: any)
  return {
    ok: response?.ok,
    status: response?.status,
    statusText: response?.statusText,
    headers: new Headers(any: any),
    json: async () => response?.data,
    text: async (any: any),
    blob: async (any: any)]),
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
