/**
 * TITANE∞ v20.0 — DevTools Tauri Events Hooks
 * Super Prompt #3: DevTools UI Advanced Suite — Phase 4
 * @license MIT
 */

import { useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useDevToolsStore } from '../store/devtools.store';
import type {
  Engine,
  LogEntry,
  ErrorEntry,
  MemoryNode,
  OmegaStep,
} from '../store/devtools.store';

/**
 * useEngineStatusUpdates - Écoute les mises à jour de statut des moteurs
 *
 * @example
 * ```tsx
 * useEngineStatusUpdates();
 * ```
 */
export function useEngineStatusUpdates() {
  const updateEngine = useDevToolsStore(state => state.updateEngine);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<Partial<Engine>>('engine-status-update', event => {
          if (event.payload && event.payload.id) {
            updateEngine(event.payload.id, event.payload);
          }
        });
      } catch (error) {
        console.error('[DevTools] Failed to setup engine status listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [updateEngine]);
}

/**
 * useMetricsUpdates - Écoute les mises à jour de métriques
 *
 * @example
 * ```tsx
 * useMetricsUpdates();
 * ```
 */
export function useMetricsUpdates() {
  const updateMetric = useDevToolsStore(state => state.updateMetric);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<{ id: string; value: number }>(
          'metrics-update',
          event => {
            if (
              event.payload &&
              event.payload.id &&
              typeof event.payload.value === 'number'
            ) {
              updateMetric(event.payload.id, event.payload.value);
            }
          }
        );
      } catch (error) {
        console.error('[DevTools] Failed to setup metrics listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [updateMetric]);
}

/**
 * useLogStream - Écoute le flux de logs en temps réel
 *
 * @example
 * ```tsx
 * useLogStream();
 * ```
 */
export function useLogStream() {
  const addLog = useDevToolsStore(state => state.addLog);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<LogEntry>('log-line', event => {
          if (event.payload) {
            addLog(event.payload);
          }
        });
      } catch (error) {
        console.error('[DevTools] Failed to setup log stream listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [addLog]);
}

/**
 * useErrorTracking - Écoute les erreurs système
 *
 * @example
 * ```tsx
 * useErrorTracking();
 * ```
 */
export function useErrorTracking() {
  const addError = useDevToolsStore(state => state.addError);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<ErrorEntry>('error-raised', event => {
          if (event.payload) {
            addError(event.payload);
          }
        });
      } catch (error) {
        console.error('[DevTools] Failed to setup error tracking listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [addError]);
}

/**
 * useMemoryUpdates - Écoute les mises à jour de la mémoire
 *
 * @example
 * ```tsx
 * useMemoryUpdates();
 * ```
 */
export function useMemoryUpdates() {
  const updateMemory = useDevToolsStore(state => state.updateMemory);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<MemoryNode[]>('memory-update', event => {
          if (event.payload) {
            updateMemory(event.payload);
          }
        });
      } catch (error) {
        console.error('[DevTools] Failed to setup memory updates listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [updateMemory]);
}

/**
 * usePipelineUpdates - Écoute les étapes du pipeline Omega
 *
 * @example
 * ```tsx
 * usePipelineUpdates();
 * ```
 */
export function usePipelineUpdates() {
  const updatePipeline = useDevToolsStore(state => state.updatePipeline);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<OmegaStep[]>('omega-pipeline-update', event => {
          if (event.payload) {
            updatePipeline(event.payload);
          }
        });
      } catch (error) {
        console.error('[DevTools] Failed to setup pipeline updates listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [updatePipeline]);
}

/**
 * useAllDevToolsEvents - Hook principal activant tous les listeners
 *
 * Utiliser dans DevToolsApp pour activer tous les events en une fois
 *
 * @example
 * ```tsx
 * function DevToolsApp() {
 *   useAllDevToolsEvents();
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAllDevToolsEvents() {
  useEngineStatusUpdates();
  useMetricsUpdates();
  useLogStream();
  useErrorTracking();
  useMemoryUpdates();
  usePipelineUpdates();
}
