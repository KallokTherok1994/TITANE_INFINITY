/**
 * TITANE∞ — useStoreSync
 *
 * Synchronises the core Zustand stores (Memory, Evolution, System)
 * with the Tauri backend on application load.
 *
 * Phase 2.3.3 — Store persistence wiring
 * Aligned to actual store API: fetchState() / fetchLogs()
 */

import { useEffect, useRef } from 'react';
import { useMemoryStore } from '@stores/memoryStore';
import { useEvolutionStore } from '@stores/evolutionStore';

interface StoreSyncOptions {
  /** Abort if the sync takes longer than this many ms. Default: 10000 */
  timeoutMs?: number;
  /** Called when all stores have loaded successfully */
  onSuccess?: () => void;
  /** Called when one or more stores fail to load */
  onError?: (errors: Error[]) => void;
}

/**
 * Hook that eagerly loads all core stores from the Tauri backend.
 * Safe to call multiple times; only runs once per mount.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * export const App: React.FC = () => {
 *   useStoreSync();
 *   return <Routes />;
 * };
 * ```
 *
 * **Note:** Options are captured at mount time and are intentionally not reactive.
 * This prevents re-triggering the sync on every render cycle when callbacks are
 * defined inline. Pass stable references (useCallback / useMemo) if you need
 * the callbacks to reflect updated state.
 */
export const useStoreSync = (options: StoreSyncOptions = {}): void => {
  // Capture options at mount — intentional snapshot (not reactive)
  const optionsRef = useRef(options);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;

    const { timeoutMs = 10_000, onSuccess, onError } = optionsRef.current;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const sync = async (): Promise<void> => {
      const errors: Error[] = [];

      const tasks: Array<{ name: string; fn: () => Promise<void> }> = [
        {
          name: 'memory',
          fn: () => useMemoryStore.getState().fetchState(),
        },
        {
          name: 'evolution',
          fn: () => useEvolutionStore.getState().fetchState(),
        },
      ];

      await Promise.allSettled(
        tasks.map(async task => {
          try {
            await task.fn();
          } catch (err) {
            const error =
              err instanceof Error ? err : new Error(`${task.name} sync failed`);
            errors.push(error);
            console.warn(`[useStoreSync] ${task.name} failed:`, error.message);
          }
        })
      );

      if (!controller.signal.aborted) {
        if (errors.length === 0) {
          onSuccess?.();
        } else {
          onError?.(errors);
        }
      }
    };

    sync().finally(() => clearTimeout(timer));

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, []); // mount-once — no reactive dependencies needed
};
