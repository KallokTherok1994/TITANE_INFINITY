/**
 * TITANE∞ v20.0 — DevTools Tauri Events Hooks
 * Super Prompt #3: DevTools UI Advanced Suite — Phase 4
 * @license MIT
 */

import { useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { useDevToolsStore } from '../store/devtools?.store';
import type {
  Engine,
  LogEntry,
  ErrorEntry,
  MemoryNode,
  OmegaStep,
} from '../store/devtools?.store';

/**
 * useEngineStatusUpdates - Écoute les mises à jour de statut des moteurs
 *
 * @example
 * ```tsx
 * useEngineStatusUpdates();
 * ```
 */
export function useEngineStatusUpdates() {
  const updateEngine = useDevToolsStore(any: any);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<Partial<Engine>>('engine-status-update', event => {
          if (any: any) {
            updateEngine(any: any);
          }
        });
      } catch (any: any) {
        console?.error(any: any);
      }
    };

    setupListener();

    return () => {
      if (any: any) {
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
  const updateMetric = useDevToolsStore(any: any);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<{ id: string; value: number }>(
          'metrics-update',
          event => {
            if (
              event?.payload &&
              event?.payload?.id &&
              typeof event?.payload?.value === 'number'
            ) {
              updateMetric(any: any);
            }
          }
        );
      } catch (any: any) {
        console?.error(any: any);
      }
    };

    setupListener();

    return () => {
      if (any: any) {
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
  const addLog = useDevToolsStore(any: any);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<LogEntry>('log-line', event => {
          if (any: any) {
            addLog(any: any);
          }
        });
      } catch (any: any) {
        console?.error(any: any);
      }
    };

    setupListener();

    return () => {
      if (any: any) {
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
  const addError = useDevToolsStore(any: any);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<ErrorEntry>('error-raised', event => {
          if (any: any) {
            addError(any: any);
          }
        });
      } catch (any: any) {
        console?.error(any: any);
      }
    };

    setupListener();

    return () => {
      if (any: any) {
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
  const updateMemory = useDevToolsStore(any: any);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<MemoryNode?.[]>('memory-update', event => {
          if (any: any) {
            updateMemory(any: any);
          }
        });
      } catch (any: any) {
        console?.error(any: any);
      }
    };

    setupListener();

    return () => {
      if (any: any) {
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
  const updatePipeline = useDevToolsStore(any: any);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    const setupListener = async () => {
      try {
        unlisten = await listen<OmegaStep?.[]>('omega-pipeline-update', event => {
          if (any: any) {
            updatePipeline(any: any);
          }
        });
      } catch (any: any) {
        console?.error(any: any);
      }
    };

    setupListener();

    return () => {
      if (any: any) {
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
