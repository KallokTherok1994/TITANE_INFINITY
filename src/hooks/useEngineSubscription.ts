/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — ENGINE SUBSCRIPTION HOOK
 * Hook React pour s'abonner aux mises à jour des engines (remplace polling)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import {
  useSingularityState,
  type EngineName,
  type EngineDataMap,
} from '../core/state/SingularityState';
import { useTitaneCore } from './useTitaneCore';

type EngineType =
  | 'helios'
  | 'harmonia'
  | 'nexus'
  | 'sentinel'
  | 'watchdog'
  | 'selfheal'
  | 'adaptive';

export interface UseEngineSubscriptionReturn {
  data: unknown | null;
  loading: boolean;
}

/**
 * Hook pour s'abonner aux mises à jour d'un engine
 * Remplace le pattern useState + setInterval
 *
 * @example
 * ```tsx
 * export const Helios = () => {
 *   const { data: metrics, loading } = useEngineSubscription('helios');
 *   // ...
 * }
 * ```
 */
export function useEngineSubscription(engine: EngineType): UseEngineSubscriptionReturn {
  const engineData = useSingularityState(state => state.enginesData[engine]);
  const setEngineData = useSingularityState(state => state.setEngineData);
  const setEngineLoading = useSingularityState(state => state.setEngineLoading);

  const {
    getHeliosMetrics,
    getHarmoniaFlows,
    getNexusGraph,
    getSentinelStatus,
    getWatchdogData,
    getSelfHealData,
    getAdaptiveData,
  } = useTitaneCore();

  useEffect(() => {
    const commandMap: Record<
      EngineType,
      { fn: () => Promise<unknown>; interval: number }
    > = {
      helios: { fn: getHeliosMetrics, interval: 3000 },
      harmonia: { fn: getHarmoniaFlows, interval: 4000 },
      nexus: { fn: getNexusGraph, interval: 5000 },
      sentinel: { fn: getSentinelStatus, interval: 3000 },
      watchdog: { fn: getWatchdogData, interval: 2000 },
      selfheal: { fn: getSelfHealData, interval: 5000 },
      adaptive: { fn: getAdaptiveData, interval: 4000 },
    };

    const config = commandMap[engine as keyof typeof commandMap];
    if (!config) {
      logger.error(`[useEngineSubscription] Unknown engine: ${engine}`);
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      setEngineLoading(engine, true);
      try {
        const data = await config.fn();
        if (mounted && data) {
          // Backend validates data structure, type assertion needed for generic fn()
          setEngineData(engine as EngineName, data as EngineDataMap[typeof engine]);
        }
      } catch (error) {
        logger.error(`[useEngineSubscription] Error fetching ${engine}:`, error);
      } finally {
        if (mounted) {
          setEngineLoading(engine, false);
        }
      }
    };

    // Immediate first fetch
    fetchData();

    // Set up interval
    const intervalId = window.setInterval(fetchData, config.interval);

    // Cleanup
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [
    engine,
    setEngineData,
    setEngineLoading,
    getHeliosMetrics,
    getHarmoniaFlows,
    getNexusGraph,
    getSentinelStatus,
    getWatchdogData,
    getSelfHealData,
    getAdaptiveData,
  ]);

  return {
    data: engineData?.data ?? null,
    loading: engineData?.loading ?? false,
  };
}
