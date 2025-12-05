/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — BATCH COMMANDS HOOK
 * Hook React pour exécuter plusieurs commandes Tauri en batch
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import {
  batchInvoke,
  parallelInvoke,
  sequentialInvoke,
  type BatchCommand,
  type BatchResult,
  type BatchProgress,
  type BatchOptions,
} from '../services/tauriBridge';

export type BatchState = {
  isExecuting: boolean;
  progress: BatchProgress | null;
  results: BatchResult[] | null;
  error: string | null;
};

const flushStateUpdates = () => new Promise(resolve => setTimeout(resolve, 0));

export function useBatchCommands() {
  const [state, setState] = useState<BatchState>({
    isExecuting: false,
    progress: null,
    results: null,
    error: null,
  });

  const executeBatch = useCallback(
    async (commands: BatchCommand[], options?: BatchOptions) => {
      setState({
        isExecuting: true,
        progress: null,
        results: null,
        error: null,
      });

      try {
        const results = await batchInvoke(commands, {
          ...options,
          onProgress: (progress) => {
            setState(prev => ({ ...prev, progress }));
            if (options?.onProgress) {
              options.onProgress(progress);
            }
          },
        });

        setState({
          isExecuting: false,
          progress: { completed: commands.length, total: commands.length, percentage: 100 },
          results,
          error: null,
        });

        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isExecuting: false,
          progress: null,
          results: null,
          error: errorMessage,
        });
        await flushStateUpdates();
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    []
  );

  const executeParallel = useCallback(
    async (commands: BatchCommand[], options?: Omit<BatchOptions, 'mode'>) => {
      setState({
        isExecuting: true,
        progress: null,
        results: null,
        error: null,
      });

      try {
        const results = await parallelInvoke(commands, {
          ...options,
          onProgress: (progress) => {
            setState(prev => ({ ...prev, progress }));
            if (options?.onProgress) {
              options.onProgress(progress);
            }
          },
        });

        setState({
          isExecuting: false,
          progress: { completed: commands.length, total: commands.length, percentage: 100 },
          results,
          error: null,
        });

        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isExecuting: false,
          progress: null,
          results: null,
          error: errorMessage,
        });
        await flushStateUpdates();
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    []
  );

  const executeSequential = useCallback(
    async (commands: BatchCommand[], options?: Omit<BatchOptions, 'mode'>) => {
      setState({
        isExecuting: true,
        progress: null,
        results: null,
        error: null,
      });

      try {
        const results = await sequentialInvoke(commands, {
          ...options,
          onProgress: (progress) => {
            setState(prev => ({ ...prev, progress }));
            if (options?.onProgress) {
              options.onProgress(progress);
            }
          },
        });

        setState({
          isExecuting: false,
          progress: { completed: commands.length, total: commands.length, percentage: 100 },
          results,
          error: null,
        });

        return results;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          isExecuting: false,
          progress: null,
          results: null,
          error: errorMessage,
        });
        await flushStateUpdates();
        throw error instanceof Error ? error : new Error(errorMessage);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      progress: null,
      results: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    executeBatch,
    executeParallel,
    executeSequential,
    reset,
  };
}
