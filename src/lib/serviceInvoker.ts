/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Service Invoker
 * Retry, timeout, et error handling pour tous les services Tauri
 * ═══════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface InvokeOptions {
  /** Nombre de tentatives (défaut: 3) */
  retries?: number;
  /** Timeout en ms (défaut: 30000) */
  timeout?: number;
  /** Délai initial entre tentatives en ms (défaut: 500) */
  retryDelay?: number;
  /** Facteur multiplicateur pour backoff exponentiel (défaut: 2) */
  backoffFactor?: number;
  /** Désactiver retry (défaut: false) */
  noRetry?: boolean;
  /** Contexte pour logs/métriques */
  context?: string;
}

export class TimeoutError extends Error {
  constructor(
    public readonly command: string,
    public readonly timeoutMs: number
  ) {
    super(`Command "${command}" timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export class RetryError extends Error {
  public readonly originalError: Error;

  constructor(
    public readonly command: string,
    public readonly attempts: number,
    lastError: Error
  ) {
    super(
      `Command "${command}" failed after ${attempts} attempts: ${lastError.message}`
    );
    this.name = 'RetryError';
    this.originalError = lastError;
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly command: string,
    public readonly validationErrors: string[]
  ) {
    super(
      `Command "${command}" validation failed: ${validationErrors.join(', ')}`
    );
    this.name = 'ValidationError';
  }
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Promise avec timeout
 */
function timeoutPromise<T>(ms: number, command: string): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new TimeoutError(command, ms)), ms)
  );
}

/**
 * Backoff exponentiel avec jitter
 */
function calculateBackoff(
  attempt: number,
  baseDelay: number,
  factor: number
): number {
  const exponentialDelay = baseDelay * Math.pow(factor, attempt);
  // Ajouter jitter (±25%)
  const jitter = exponentialDelay * (0.75 + Math.random() * 0.5);
  return Math.min(jitter, 30000); // Max 30s
}

/**
 * Attendre avec backoff
 */
async function waitWithBackoff(
  attempt: number,
  baseDelay: number,
  factor: number
): Promise<void> {
  const delay = calculateBackoff(attempt, baseDelay, factor);
  await new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Vérifier si erreur est retriable
 */
function isRetriableError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;

  const errorMsg = error instanceof Error ? error.message : String(error);

  // Erreurs réseau/temporaires retriables
  const retriablePatterns = [
    'network',
    'timeout',
    'connection',
    'unavailable',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'fetch failed',
  ];

  return retriablePatterns.some((pattern) =>
    errorMsg.toLowerCase().includes(pattern)
  );
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
      // Race entre invoke et timeout
      const result = await Promise.race<T>([
        invoke<T>(command, payload ?? {}),
        timeoutPromise<T>(timeout, command),
      ]);

      // Succès - log si retry
      if (attempt > 0) {
        console.log(
          `[${context}] ✓ "${command}" succeeded on attempt ${attempt + 1}/${maxAttempts}`
        );
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Dernière tentative ou erreur non-retriable
      if (attempt === maxAttempts - 1 || !isRetriableError(error)) {
        console.error(
          `[${context}] ✗ "${command}" failed (attempt ${attempt + 1}/${maxAttempts}):`,
          lastError.message
        );

        // Si toutes tentatives échouées
        if (attempt === maxAttempts - 1 && maxAttempts > 1) {
          throw new RetryError(command, maxAttempts, lastError);
        }

        throw lastError;
      }

      // Log retry
      const nextDelay = calculateBackoff(attempt, retryDelay, backoffFactor);
      console.warn(
        `[${context}] ⟳ "${command}" attempt ${attempt + 1}/${maxAttempts} failed. Retry in ${Math.round(nextDelay)}ms...`
      );

      // Attendre avant retry
      await waitWithBackoff(attempt, retryDelay, backoffFactor);
    }
  }

  // Ne devrait jamais arriver (sécurité TypeScript)
  const finalError = lastError ?? new Error('Unknown error');
  throw new RetryError(command, maxAttempts, finalError);
}

/**
 * Invoke Tauri command avec timeout uniquement (sans retry)
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
 * Invoke Tauri command sans retry ni timeout (wrapper simple)
 *
 * @example
 * ```ts
 * const data = await invokeSimple('get_cached_data');
 * ```
 */
export async function invokeSimple<T>(
  command: string,
  payload?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, payload ?? {});
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Service] Command "${command}" failed:`, errorMsg);
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
export async function invokeBatch<T = unknown>(
  commands: BatchCommand[]
): Promise<T[]> {
  return Promise.all(
    commands.map((cmd) =>
      invokeWithRetry<T>(cmd.command, cmd.payload, cmd.options)
    )
  );
}

/**
 * Exécuter plusieurs commandes en séquence (avec circuit breaker)
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
  commands: BatchCommand[]
): Promise<T[]> {
  const results: T[] = [];

  for (const cmd of commands) {
    try {
      const result = await invokeWithRetry<T>(
        cmd.command,
        cmd.payload,
        cmd.options
      );
      results.push(result);
    } catch (error) {
      console.error(
        `[Sequence] Failed at command "${cmd.command}". Stopping sequence.`
      );
      throw error;
    }
  }

  return results;
}

// ────────────────────────────────────────────────────────────────
// Presets par type de commande
// ────────────────────────────────────────────────────────────────

/**
 * Options pour commandes rapides (get state, health check)
 */
export const FAST_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 5000,
  retries: 2,
  retryDelay: 300,
  context: 'Fast',
};

/**
 * Options pour commandes standards (get data, save)
 */
export const STANDARD_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 15000,
  retries: 3,
  retryDelay: 500,
  context: 'Standard',
};

/**
 * Options pour commandes longues (evolution, analysis)
 */
export const LONG_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 60000,
  retries: 2,
  retryDelay: 1000,
  backoffFactor: 3,
  context: 'Long',
};

/**
 * Options pour commandes critiques (no retry, short timeout)
 */
export const CRITICAL_COMMAND_OPTIONS: InvokeOptions = {
  timeout: 10000,
  noRetry: true,
  context: 'Critical',
};
