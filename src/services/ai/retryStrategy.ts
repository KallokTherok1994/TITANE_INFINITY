/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v21 — RETRY STRATEGY (Phase 2)
 *   Stratégie de retry unifiée pour tous les providers IA
 *   Audit v21 - Harmonisation retry logic
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '../../utils/logger';

export interface RetryConfig {
  /** Nombre maximum de tentatives */
  maxAttempts: number;
  /** Délai initial entre tentatives (ms) */
  initialDelayMs: number;
  /** Multiplicateur pour backoff exponentiel */
  backoffMultiplier: number;
  /** Délai maximum entre tentatives (ms) */
  maxDelayMs: number;
  /** Fonction pour déterminer si une erreur est retriable */
  shouldRetry?: (error: unknown) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000, // 1s
  backoffMultiplier: 2, // 1s → 2s → 4s
  maxDelayMs: 10000, // 10s max
};

/**
 * Erreurs retriables par défaut (codes HTTP, messages types)
 */
const RETRIABLE_ERROR_PATTERNS = [
  /rate.?limit/i,
  /429/,
  /503/,
  /timeout/i,
  /timed.?out/i,
  /network/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /overloaded/i,
  /temporarily.?unavailable/i,
];

/**
 * Erreurs NON retriables (fatal, ne pas retry)
 */
const NON_RETRIABLE_ERROR_PATTERNS = [
  /abort/i,
  /aborted/i,
  /AbortError/i,
  /OLLAMA_ABORTED/i,
  /invalid.?api.?key/i,
  /401/,
  /403/,
  /insufficient.?quota/i,
  /quota.?exceeded/i,
  /bad.?request/i,
  /400/,
];

/**
 * Déterminer si une erreur est retriable
 */
export function isRetriableError(error: unknown): boolean {
  const errorStr = String(error);

  // Vérifier patterns non retriables en premier
  if (NON_RETRIABLE_ERROR_PATTERNS.some(pattern => pattern.test(errorStr))) {
    return false;
  }

  // Vérifier patterns retriables
  return RETRIABLE_ERROR_PATTERNS.some(pattern => pattern.test(errorStr));
}

/**
 * Calculer le délai avant la prochaine tentative (backoff exponentiel)
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Attendre un délai avec possibilité d'annulation
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exécuter une fonction avec retry automatique
 *
 * @template T Type de retour de la fonction
 * @param fn Fonction async à exécuter
 * @param config Configuration retry
 * @param context Contexte pour logs (nom du provider, action, etc.)
 * @returns Résultat de la fonction ou throw de la dernière erreur
 *
 * @example
 * ```typescript
 * const response = await withRetry(
 *   async () => fetch('https://api.example.com/generate'),
 *   { maxAttempts: 3 },
 *   { provider: 'gemini', action: 'generate' }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: Record<string, unknown> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const shouldRetryFn = finalConfig.shouldRetry || isRetriableError;

  let lastError: unknown;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      // Tentative d'exécution
      const result = await fn();

      // Succès: logger si ce n'était pas la première tentative
      if (attempt > 1) {
        logger.info('Retry succeeded', {
          ...context,
          attempt,
          totalAttempts: finalConfig.maxAttempts,
        });
      }

      return result;
    } catch (error) {
      lastError = error;

      // Dernière tentative: throw immédiatement
      if (attempt === finalConfig.maxAttempts) {
        logger.error('All retry attempts failed', {
          ...context,
          attempts: finalConfig.maxAttempts,
          lastError: String(error),
        });
        throw error;
      }

      // Vérifier si l'erreur est retriable
      if (!shouldRetryFn(error)) {
        logger.warn('Non-retriable error, aborting retries', {
          ...context,
          attempt,
          error: String(error),
        });
        throw error;
      }

      // Calculer délai avant prochaine tentative
      const delayMs = calculateDelay(attempt, finalConfig);

      logger.warn('Retry attempt failed, retrying...', {
        ...context,
        attempt,
        nextAttempt: attempt + 1,
        delayMs,
        error: String(error),
      });

      // Attendre avant prochaine tentative
      await delay(delayMs);
    }
  }

  // Fallback (normalement jamais atteint)
  throw lastError;
}

/**
 * Wrapper pour retry avec timeout global
 *
 * @template T Type de retour
 * @param fn Fonction à exécuter
 * @param timeoutMs Timeout global en millisecondes
 * @param config Configuration retry
 * @param context Contexte pour logs
 * @returns Résultat ou timeout error
 *
 * @example
 * ```typescript
 * const response = await withRetryAndTimeout(
 *   async () => apiCall(),
 *   30000, // 30s timeout global
 *   { maxAttempts: 3 },
 *   { provider: 'openai' }
 * );
 * ```
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  config: Partial<RetryConfig> = {},
  context: Record<string, unknown> = {}
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Global timeout exceeded (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  return Promise.race([withRetry(fn, config, context), timeoutPromise]);
}

/**
 * Configuration retry spécifique par provider
 */
export const PROVIDER_RETRY_CONFIGS: Record<string, RetryConfig> = {
  gemini: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 8000,
  },
  openai: {
    maxAttempts: 3,
    initialDelayMs: 1500,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
  },
  claude: {
    maxAttempts: 3,
    initialDelayMs: 2000, // Claude est parfois plus lent
    backoffMultiplier: 2,
    maxDelayMs: 12000,
  },
  ollama: {
    maxAttempts: 2, // Local, moins de retries nécessaires
    initialDelayMs: 500,
    backoffMultiplier: 1.5,
    maxDelayMs: 3000,
  },
  local: {
    maxAttempts: 2,
    initialDelayMs: 300,
    backoffMultiplier: 1.5,
    maxDelayMs: 2000,
  },
};

/**
 * Helper: obtenir config retry pour un provider
 */
export function getRetryConfig(provider: string): RetryConfig {
  return PROVIDER_RETRY_CONFIGS[provider] || DEFAULT_RETRY_CONFIG;
}
