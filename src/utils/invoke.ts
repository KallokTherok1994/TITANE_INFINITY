/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.A - Safe Invoke Wrapper
 * Wrapper universel pour tous les appels Tauri avec gestion d'erreur
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { isTauriAvailable } from '@/api/tauriClient';
import { isRemoteGatewayAvailable, remoteInvoke } from '@/api/remoteTransport';

export interface IpcErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface CanonicalIpcResult<T> {
  ok: boolean;
  content: T | null;
  error: IpcErrorPayload | null;
}

function normalizeIpcResponse<T>(
  command: string,
  response: unknown
): CanonicalIpcResult<T> {
  if (response && typeof response === 'object') {
    const candidate = response as Record<string, unknown>;
    if ('ok' in candidate && 'content' in candidate && 'error' in candidate) {
      return {
        ok: candidate.ok === true,
        content: (candidate.content as T | null) ?? null,
        error:
          candidate.error && typeof candidate.error === 'object'
            ? (candidate.error as IpcErrorPayload)
            : candidate.error
              ? { code: 'IPC_ERROR', message: String(candidate.error) }
              : null,
      };
    }

    if ('success' in candidate || 'fallback' in candidate) {
      const success = candidate.success === true;
      return {
        ok: success,
        content: success ? (response as T) : null,
        error: success
          ? null
          : {
              code: 'IPC_LEGACY_RESPONSE',
              message: String(
                candidate.error ?? 'Legacy IPC response without canonical contract'
              ),
            },
      };
    }
  }

  if (response === null || response === undefined) {
    return {
      ok: false,
      content: null,
      error: {
        code: 'IPC_MALFORMED_RESPONSE',
        message: `Malformed IPC response for ${command}`,
      },
    };
  }

  return { ok: true, content: response as T, error: null };
}

export async function safeInvokeCanonical<T = unknown>(
  cmd: string,
  payload: Record<string, unknown> = {},
  timeoutMs = 10000
): Promise<CanonicalIpcResult<T>> {
  // 1. Tauri local IPC — highest priority (local desktop runtime)
  if (isTauriAvailable()) {
    try {
      const raw = await secureInvoke<unknown>(cmd, payload, { timeout: timeoutMs });
      return normalizeIpcResponse<T>(cmd, raw);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        ok: false,
        content: null,
        error: {
          code: error.name || 'IPC_ERROR',
          message: error.message,
        },
      };
    }
  }

  // 2. Remote Gateway — PC mère (all other clients: browser, Android, remote desktop)
  if (isRemoteGatewayAvailable()) {
    const result = await remoteInvoke<T>(cmd, payload);
    return {
      ok: result.ok,
      content: result.content,
      error: result.error
        ? { code: result.error.code, message: result.error.message }
        : null,
    };
  }

  // 3. No transport available
  return {
    ok: false,
    content: null,
    error: {
      code: 'NO_TRANSPORT',
      message: 'Neither Tauri IPC nor Remote Gateway is available. Configure the gateway in TITANE Settings to connect to the PC mère.',
    },
  };
}

/**
 * Wrapper universel pour invoke() avec gestion d'erreur automatique
 * @param cmd - Nom de la commande Tauri
 * @param payload - Paramètres de la commande (optionnel)
 * @returns Résultat de la commande ou null en cas d'erreur
 */
export async function safeInvoke<T = unknown>(
  cmd: string,
  payload: Record<string, unknown> = {}
): Promise<T | null> {
  const result = await safeInvokeCanonical<T>(cmd, payload);
  if (result.ok) {
    return result.content;
  }

  console.error(`❌ Tauri Command Error [${cmd}]:`, result.error);

  // Log payload si non vide pour debug
  if (Object.keys(payload).length > 0) {
    console.error(`   Payload:`, payload);
  }

  return null;
}

/**
 * Wrapper pour invoke() avec retry automatique
 * @param cmd - Nom de la commande Tauri
 * @param payload - Paramètres de la commande
 * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
 * @param retryDelay - Délai entre tentatives en ms (défaut: 1000)
 * @returns Résultat de la commande ou null après épuisement des tentatives
 */
export async function safeInvokeWithRetry<T = unknown>(
  cmd: string,
  payload: Record<string, unknown> = {},
  maxRetries = 3,
  retryDelay = 1000
): Promise<T | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await safeInvokeCanonical<T>(cmd, payload);
    if (result.ok) {
      // Succès dès la première tentative
      if (attempt > 1) {
        console.warn(`✅ Commande ${cmd} réussie après ${attempt} tentatives`);
      }

      return result.content;
    }

    lastError = result.error;

    if (attempt < maxRetries) {
      console.warn(
        `⚠️ Tentative ${attempt}/${maxRetries} échouée pour ${cmd}, retry dans ${retryDelay}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  console.error(`❌ Commande ${cmd} échouée après ${maxRetries} tentatives:`, lastError);
  return null;
}

/**
 * Wrapper pour invoke() avec timeout
 * @param cmd - Nom de la commande Tauri
 * @param payload - Paramètres de la commande
 * @param timeoutMs - Timeout en millisecondes (défaut: 10000)
 * @returns Résultat de la commande ou null si timeout
 */
export async function safeInvokeWithTimeout<T = unknown>(
  cmd: string,
  payload: Record<string, unknown> = {},
  timeoutMs = 10000
): Promise<T | null> {
  const result = await safeInvokeCanonical<T>(cmd, payload, timeoutMs);
  if (result.ok) {
    return result.content;
  }

  console.error(`❌ Tauri Command Timeout [${cmd}]:`, result.error);
  return null;
}

/**
 * Type guard pour vérifier qu'un résultat est non-null
 */
export function isValidResult<T>(result: T | null): result is T {
  return result !== null && result !== undefined;
}

/**
 * Helper pour extraire une valeur avec fallback
 */
export function getResultOrDefault<T>(result: T | null, defaultValue: T): T {
  return isValidResult(result) ? result : defaultValue;
}
