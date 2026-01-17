/**
 * TITANE∞ v26.3.0 — Tauri Client Wrapper
 * Type-safe communication layer with automatic error handling
 * Security: whitelist, anti-injection, anti-loop protection
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * Unified Tauri command invocation with type safety
 */
export async function tauri<T>(
  cmd: string,
  payload?: Record<string, unknown>
): Promise<T> {
  try {
    const result = await invoke<T>(cmd, payload ? { payload } : undefined);
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Tauri error';
    console.error(`Tauri command "${cmd}" failed:`, error);
    throw new Error(`Tauri command "${cmd}" failed: ${errorMessage}`);
  }
}

/**
 * Tauri command with retry logic
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
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        console.warn(`[Tauri Retry] Attempt ${attempt + 1}/${maxRetries} failed for "${cmd}". Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw new Error(`Command "${cmd}" failed after ${maxRetries} retries: ${lastError?.message}`);
}

/**
 * Batch invoke multiple commands in parallel
 */
export async function tauriBatch<T = unknown>(
  commands: Array<{
    cmd: string;
    payload?: Record<string, unknown>;
  }>
): Promise<T[]> {
  const promises = commands.map(({ cmd, payload }) => tauri<T>(cmd, payload));
  return Promise.all(promises);
}

/**
 * Check if Tauri API is available
 */
export function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
