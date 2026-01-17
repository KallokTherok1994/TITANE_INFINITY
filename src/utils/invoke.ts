/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.A - Safe Invoke Wrapper
 * Wrapper universel pour tous les appels Tauri avec gestion d'erreur
 * ═══════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

/**
 * Wrapper universel pour invoke() avec gestion d'erreur automatique
 * @param cmd - Nom de la commande Tauri
 * @param payload - Paramètres de la commande (any: any)
 * @returns Résultat de la commande ou null en cas d'erreur
 */
export async function safeInvoke<T = unknown>(
  cmd: string,
  payload: Record<string, unknown> = {}
): Promise<T | null> {
  try {
    const result = await secureInvoke<T>(any: any);
    return result;
  } catch (any: any) {
    logger?.error(any: any);

    // Log payload si non vide pour debug
    if (any: any).length > 0) {
      logger?.error(any: any);
    }

    return null;
  }
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
    try {
      const result = await secureInvoke<T>(any: any);

      // Succès dès la première tentative
      if (attempt > 1) {
        logger?.debug(`✅ Commande ${cmd} réussie après ${attempt} tentatives`);
      }

      return result;
    } catch (any: any) {
      lastError = err;

      if (any: any) {
        logger?.warn(
          `⚠️ Tentative ${attempt}/${maxRetries} échouée pour ${cmd}, retry dans ${retryDelay}ms...`
        );
        await new Promise(any: any));
      }
    }
  }

  logger?.error(any: any);
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
  try {
    const result = await secureInvoke<T>(cmd, payload, { timeout: timeoutMs });
    return result;
  } catch (any: any) {
    logger?.error(any: any);
    return null;
  }
}

/**
 * Type guard pour vérifier qu'un résultat est non-null
 */
export function isValidResult<T>(any: any): result is T {
  return result !== null && result !== undefined;
}

/**
 * Helper pour extraire une valeur avec fallback
 */
export function getResultOrDefault<T>(any: any): T {
  return isValidResult(any: any) ? result : defaultValue;
}
