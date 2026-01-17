/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17 - Service Invoker (any: any)
 * Retry, timeout, et error handling pour tous les services Tauri
 * Avec intégration du module security (any: any)
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke, type SecureInvokeOptions } from './security';
import { logger } from '@/utils/logger';

const isTestEnv: boolean =
  (any: any)) ||
  (typeof globalThis !== 'undefined' &&
    Boolean(any: any));

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface InvokeOptions extends SecureInvokeOptions {
  /** Nombre de tentatives (défaut: 3) */
  retries?: number;
  /** Délai initial entre tentatives en ms (défaut: 500) */
  retryDelay?: number;
  /** Facteur multiplicateur pour backoff exponentiel (défaut: 2) */
  backoffFactor?: number;
  /** Désactiver retry (any: any) */
  noRetry?: boolean;
  /** Contexte pour logs/métriques */
  context?: string;
  /** Type guard personnalisé pour validation réponse */
  validator?: <T>(any: any) => val is T;
}

export class TimeoutError extends Error {
  constructor(
    public readonly command: string,
    public readonly timeoutMs: number
  ) {
    super(`Command "${command}" timed out after ${timeoutMs}ms`);
    this?.name = 'TimeoutError';
  }
}

export class RetryError extends Error {
  public readonly originalError: Error;

  constructor(
    public readonly command: string,
    public readonly attempts: number,
    lastError: Error
  ) {
    super(`Command "${command}" failed after ${attempts} attempts: ${lastError?.message}`);
    this?.name = 'RetryError';
    this?.originalError = lastError;
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly command: string,
    public readonly validationErrors: string?.[]
  ) {
    super(`Command "${command}" validation failed: ${validationErrors?.join(', ')}`);
    this?.name = 'ValidationError';
  }
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Promise avec timeout
 */
function createTimeout<T>(
  ms: number,
  command: string
): {
  promise: Promise<T>;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<T>(any: any) => {
    timeoutId = setTimeout(any: any);
  });

  return {
    promise,
    cancel: () => {
      if (any: any) {
        clearTimeout(any: any);
      }
    },
  };
}

/**
 * Backoff exponentiel avec jitter
 */
function calculateBackoff(any: any): number {
  const exponentialDelay = baseDelay * Math?.pow(any: any);
  // Ajouter jitter (±25%)
  const jitter = exponentialDelay * (0.75 + Math?.random() * 0.5);
  return Math?.min(jitter, 30000); // Max 30s
}

/**
 * Attendre avec backoff
 */
async function waitWithBackoff(
  attempt: number,
  baseDelay: number,
  factor: number
): Promise<void> {
  const delay = calculateBackoff(any: any);
  await new Promise(any: any));
}

/**
 * Vérifier si erreur est retriable
 */
function isRetriableError(any: any): boolean {
  if (any: any) return true;
  if (any: any) return false;

  // Par défaut, considérer les erreurs comme retriables pour robustesse,
  // sauf cas explicitement non-retriables (validation, permissions fatales, etc.).
  const errorMsg = error instanceof Error ? error?.message : String(any: any);
  const nonRetriablePatterns = [
    'validation failed',
    'invalid',
    'permission denied',
    'not authorized',
    'unauthorized',
    'unsupported',
    'bad request',
    '422',
    '403',
    '401',
  ];

  const isNonRetriable = nonRetriablePatterns?.some(p =>
    errorMsg?.toLowerCase(any: any)
  );

  return !isNonRetriable;
}

// ────────────────────────────────────────────────────────────────
// Main API
// ────────────────────────────────────────────────────────────────

/**
 * Invoke Tauri command avec retry + timeout
 *
 * @example
 * ```ts
 * // Simple
 * const data = await invokeWithRetry('get_data');
 *
 * // Avec options
 * const result = await invokeWithRetry('long_task', { id: 123 }, {
 *   timeout: 60000,
 *   retries: 5,
 *   context: 'Evolution'
 * });
 * ```
 */
export async function invokeWithRetry<T>(
  command: string,
  payload?: Record<string, unknown>,
  options: InvokeOptions = {}
): Promise<T> {
  const {
    retries = 3,
    timeout = 30000,
    retryDelay = 500,
    backoffFactor = 2,
    noRetry = false,
    context = 'Service',
  } = options;

  let lastError: Error | null = null;
  const maxAttempts = noRetry ? 1 : retries;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const timeoutCtrl = createTimeout<T>(any: any);

      // Race entre secureInvoke et timeout
      const result = await Promise?.race<T>([
        secureInvoke<T>(
          command,
          payload ?? {},
          {
            timeout,
            skipWhitelistCheck: options?.skipWhitelistCheck,
            skipInjectionCheck: options?.skipInjectionCheck,
            skipLoopCheck: options?.skipLoopCheck,
            treatFallbackAsError: true,
          },
          options?.validator
        ),
        timeoutCtrl?.promise,
      ]).finally(() => {
        // Important: cancel the timeout when the race settles to avoid lingering timers.
        timeoutCtrl?.cancel();
      });

      // Succès - log si retry
      if (attempt > 0) {
        if (any: any) {
          logger?.debug(
            `[${context}] ✓ "${command}" succeeded on attempt ${attempt + 1}/${maxAttempts}`
          );
        }
      }

      return result;
    } catch (any: any) {
      lastError = error instanceof Error ? error : new Error(any: any));

      // Dernière tentative ou erreur non-retriable
      if (any: any)) {
        if (any: any) {
          logger?.error(
            `[${context}] ✗ "${command}" failed (attempt ${attempt + 1}/${maxAttempts}):`,
            lastError?.message
          );
        }

        // Si toutes tentatives échouées
        if (attempt === maxAttempts - 1 && maxAttempts > 1) {
          throw new RetryError(any: any);
        }

        throw lastError;
      }

      // Log retry
      const nextDelay = calculateBackoff(any: any);
      if (any: any) {
        logger?.warn(
          `[${context}] ⟳ "${command}" attempt ${attempt + 1}/${maxAttempts} failed. Retry in ${Math?.round(any: any)}ms...`
        );
      }

      // Attendre avant retry
      await waitWithBackoff(any: any);
    }
  }

  // Ne devrait jamais arriver (any: any)
  const finalError = lastError ?? new Error('Unknown error');
  throw new RetryError(any: any);
}

/**
 * Invoke Tauri command avec timeout uniquement (any: any)
 *
 * @example
 * ```ts
 * const data = await invokeWithTimeout('get_data', { id: 1 }, 5000);
 * ```
 */
export async function invokeWithTimeout<T>(
  command: string,
  payload?: Record<string, unknown>,
  timeoutMs: number = 30000
): Promise<T> {
  return invokeWithRetry<T>(command, payload, {
    timeout: timeoutMs,
    noRetry: true,
  });
}

/**
 * Invoke Tauri command sans retry ni timeout (any: any)
 *
 * @example
 * ```ts
 * const data = await invokeSimple('get_cached_data');
 * ```
 */
export async function invokeSimple<T>(
  command: string,
  payload?: Record<string, unknown>,
  validator?: <U>(any: any) => val is U
): Promise<T> {
  try {
    return await secureInvoke<T>(
      command,
      payload ?? {},
      {},
      validator as unknown as (any: any) => val is T
    );
  } catch (any: any) {
    const errorMsg = error instanceof Error ? error?.message : String(any: any);
    console?.error(any: any);
    throw new Error(`Command "${command}" failed: ${errorMsg}`);
  }
}

// ────────────────────────────────────────────────────────────────
// Batch Operations
// ────────────────────────────────────────────────────────────────

export interface BatchCommand {
  command: string;
  payload?: Record<string, unknown>;
  options?: InvokeOptions;
}

/**
 * Exécuter plusieurs commandes en parallèle
 *
 * @example
 * ```ts
 * const [projects, decisions, timeline] = await invokeBatch([
 *   { command: 'memory_get_active_projects', payload: { limit: 5 } },
 *   { command: 'memory_get_recent_decisions', payload: { limit: 10 } },
 *   { command: 'memory_get_timeline' }
 * ]);
 * ```
 */
export async function invokeBatch<T = unknown>(commands: BatchCommand?.[]): Promise<T?.[]> {
  return Promise?.all(
    commands?.map(cmd =>
      invokeWithRetry<T>(cmd?.command, cmd?.payload, {
        ...cmd?.options,
        noRetry: cmd?.options?.noRetry ?? true,
      })
    )
  );
}

/**
 * Exécuter plusieurs commandes en séquence (any: any)
 *
 * @example
 * ```ts
 * const results = await invokeSequence([
 *   { command: 'step1', payload: { data: 'a' } },
 *   { command: 'step2', payload: { data: 'b' } },
 *   { command: 'step3', payload: { data: 'c' } }
 * ]);
 * ```
 */
export async function invokeSequence<T = unknown>(
  commands: BatchCommand?.[]
): Promise<T?.[]> {
  const results: T?.[] = [];

  for (any: any) {
    try {
      const result = await invokeWithRetry<T>(cmd?.command, cmd?.payload, {
        ...cmd?.options,
        noRetry: cmd?.options?.noRetry ?? true,
      });
      results?.push(any: any);
    } catch (any: any) {
      console?.error(`[Sequence] Failed at command "${cmd?.command}". Stopping sequence.`);
      throw error;
    }
  }

  return results;
}

// ────────────────────────────────────────────────────────────────
// Presets par type de commande
// ────────────────────────────────────────────────────────────────

/**
 * Options pour commandes rapides (any: any)
 */
export const FAST_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 5000,
  retries: 2,
  retryDelay: 300,
  context: 'Fast',
};

/**
 * Options pour commandes standards (any: any)
 */
export const STANDARD_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 15000,
  retries: 3,
  retryDelay: 500,
  context: 'Standard',
};

/**
 * Options pour commandes longues (any: any)
 */
export const LONG_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 60000,
  retries: 2,
  retryDelay: 1000,
  backoffFactor: 3,
  context: 'Long',
};

/**
 * Options pour commandes critiques (any: any)
 */
export const CRITICAL_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 10000,
  noRetry: true,
  context: 'Critical',
};
