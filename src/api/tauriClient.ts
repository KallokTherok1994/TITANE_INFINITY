// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v12.0 - Tauri Client Wrapper                                        ║
// ║ Type-safe communication layer with automatic error handling                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

import { invoke } from '@tauri-apps/api/core';

/**
 * Unified Tauri command invocation with type safety
 *
 * Wraps the Tauri invoke() API with:
 * - Automatic error handling and logging
 * - Type-safe request/response
 * - Retry logic for connection failures
 * - Consistent error message formatting
 *
 * @template T - Expected response type
 * @param cmd - Command name (must match backend #[tauri::command])
 * @param payload - Optional command payload
 * @returns Promise resolving to typed response
 * @throws Error with formatted message on failure
 *
 * @example
 * ```typescript
 * // Simple command without payload
 * const status = await tauri<SystemStatus>('get_system_status');
 *
 * // Command with payload
 * await tauri<void>('memory_save_entry', { entry: 'data' });
 * ```
 */
export async function tauri<T>(
  cmd: string,
  payload?: Record<string, unknown>
): Promise<T> {
  try {
    const result = await invoke<T>(cmd, payload ?? {});
    return result;
  } catch (error: unknown) {
    // Format error message consistently
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'Unknown Tauri invocation error';

    console.error(`[Tauri Error] Command "${cmd}" failed:`, errorMessage);
    throw new Error(`Tauri command "${cmd}" failed: ${errorMessage}`);
  }
}

/**
 * Tauri command with retry logic
 *
 * Automatically retries failed commands with exponential backoff.
 * Useful for commands that may fail due to temporary unavailability.
 *
 * @template T - Expected response type
 * @param cmd - Command name
 * @param payload - Optional command payload
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Promise resolving to typed response
 *
 * @example
 * ```typescript
 * // Retry up to 3 times with exponential backoff
 * const data = await tauriWithRetry<MemoryState>('memory_get_state');
 * ```
 */
export async function tauriWithRetry<T>(
  cmd: string,
  payload?: Record<string, unknown>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await tauri<T>(cmd, payload);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        console.warn(
          `[Tauri Retry] Attempt ${attempt + 1}/${maxRetries} failed for "${cmd}". Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Command "${cmd}" failed after ${maxRetries} retries: ${lastError?.message}`
  );
}

/**
 * Batch invoke multiple commands in parallel
 *
 * Executes multiple Tauri commands concurrently and returns results
 * in the same order as the input commands.
 *
 * @param commands - Array of command configurations
 * @returns Promise resolving to array of results
 *
 * @example
 * ```typescript
 * const [status, metrics, graph] = await tauriBatch([
 *   { cmd: 'get_system_status' },
 *   { cmd: 'helios_get_metrics' },
 *   { cmd: 'nexus_get_graph' }
 * ]);
 * ```
 */
export async function tauriBatch<T = unknown>(
  commands: Array<{ cmd: string; payload?: Record<string, unknown> }>
): Promise<T[]> {
  const promises = commands.map(({ cmd, payload }) => tauri<T>(cmd, payload));
  return Promise.all(promises);
}

/**
 * Check if Tauri API is available
 *
 * Useful for detecting whether the app is running in Tauri context
 * or as a regular web app.
 *
 * @returns true if Tauri API is available
 */
export function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
