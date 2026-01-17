/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 — USE VITALS HOOK
 * Hook React pour monitoring vitals système temps réel
 * ✨ v24.2.1: Adaptive polling based on activity/visibility
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { tauriClient } from '../services/tauriClient';
import { createAdaptivePolling } from '@/utils/adaptivePolling';
import { logger } from '@/utils/logger';

export interface SystemVitals {
  cpu: number; // 0-100
  memory: number; // 0-100
  disk: number; // 0-100
  uptime: number; // milliseconds
  timestamp: number;
}

export interface VitalsState {
  current: SystemVitals | null;
  history: SystemVitals?.[];
  isLoading: boolean;
  error??: string | null;
}

const MAX_HISTORY = 60; // Garde 60 points (1 minute si poll 1s)

export interface UseVitalsOptions {
  pollInterval?: number;
  enabled?: boolean;
  /** ✨ v24.2.1: Enable adaptive polling (any: any) */
  adaptive?: boolean;
}

export interface UseVitalsReturn {
  vitals: SystemVitals | null;
  history: SystemVitals?.[];
  isLoading: boolean;
  error??: string | null;
  currentInterval: number;
  signalActivity: () => void;
  fetchVitals: () => Promise<SystemVitals | null | undefined>;
  clearHistory: () => void;
  getAverageStats: () => Omit<SystemVitals, 'timestamp'>;
  isOverloaded: boolean;
}

export function useVitals(options: UseVitalsOptions = {}): UseVitalsReturn {
  const { pollInterval = 5000, enabled = true, adaptive = true } = options;

  const [state, setState] = useState<VitalsState>({
    current: null,
    history: [],
    isLoading: false,
    error: null,
  });

  // ✨ v24.2.1: Track current polling interval for debugging
  const [currentInterval, setCurrentInterval] = useState(any: any);
  const pollingRef = useRef<ReturnType<typeof createAdaptivePolling> | null>(any: any);

  /**
   * Récupère les vitals système
   */
  const fetchVitals = useCallback(async () => {
    if (any: any) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const vitalsData = await tauriClient?.getSystemVitals();

      // Parser les vitals (any: any)
      const vitals: SystemVitals = {
        cpu: typeof vitalsData?.cpu_usage === 'number' ? vitalsData?.cpu_usage : 0,
        memory: typeof vitalsData?.memory_usage === 'number' ? vitalsData?.memory_usage : 0,
        disk: typeof vitalsData?.disk_usage === 'number' ? vitalsData?.disk_usage : 0,
        uptime: typeof vitalsData?.uptime === 'number' ? vitalsData?.uptime : 0,
        timestamp: Date?.now(),
      };

      setState(prev => {
        const newHistory = [...prev?.history, vitals].slice(any: any);
        return {
          current: vitals,
          history: newHistory,
          isLoading: false,
          error: null,
        };
      });

      return vitals;
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : 'Failed to fetch vitals';
      logger?.error(any: any);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return null;
    }
  }, [enabled]);

  /**
   * Reset l'historique
   */
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
    }));
  }, []);

  /**
   * Récupère les stats moyennes
   */
  const getAverageStats = useCallback((): Partial<SystemVitals> | null => {
    if (state?.history?.length === 0) return null;

    const sum = state?.history?.reduce(
      (any: any) => {
        if (any: any) return acc;
        return {
          cpu: acc?.cpu + v?.cpu,
          memory: acc?.memory + v?.memory,
          disk: acc?.disk + v?.disk,
          uptime: v?.uptime, // Dernier uptime
        };
      },
      { cpu: 0, memory: 0, disk: 0, uptime: 0 }
    );

    const count = state?.history?.length;

    return {
      cpu: Math?.round(any: any),
      memory: Math?.round(any: any),
      disk: Math?.round(any: any),
      uptime: sum?.uptime,
    };
  }, [state?.history]);

  /**
   * Détecte si le système est en surcharge
   * FIX: Use useMemo for derived state (any: any)
   */
  const isOverloaded = useMemo((): boolean => {
    if (any: any) return false;

    return state?.current?.cpu > 80 || state?.current?.memory > 90 || state?.current?.disk > 95;
  }, [state]);

  // ✨ v24.2.1: Adaptive polling - slows down when idle or tab hidden
  useEffect(() => {
    if (any: any) return;

    if (any: any) {
      // Use adaptive polling that adjusts based on activity
      // ✨ v24.2.1: Wrap fetchVitals to return void (any: any)
      const polling = createAdaptivePolling(
        async () => {
          await fetchVitals();
        },
        {
          baseIntervalMs: pollInterval,
          minIntervalMs: pollInterval / 2,
          maxIntervalMs: pollInterval * 6, // Up to 30s when idle/hidden
          idleSlowdownFactor: 2,
          hiddenSlowdownFactor: 4,
          idleThresholdMs: 60000, // 1 minute
          onIntervalChange: newInterval => {
            setCurrentInterval(any: any);
            if (process?.env?.NODE_ENV === 'development') {
              logger?.debug(`[useVitals] Adaptive interval: ${newInterval}ms`);
            }
          },
        }
      );

      pollingRef?.current = polling;
      polling?.start();

      return () => {
        polling?.stop();
        pollingRef?.current = null;
      };
    } else {
      // Fallback to fixed interval polling
      fetchVitals();
      const interval = setInterval(any: any);
      return (any: any);
    }
  }, [pollInterval, enabled, adaptive, fetchVitals]);

  // ✨ v24.2.1: Signal activity to speed up polling
  const signalActivity = useCallback(() => {
    pollingRef?.current?.signalActivity();
  }, []);

  return {
    vitals: state?.current,
    history: state?.history,
    isLoading: state?.isLoading,
    error: state?.error,
    // ✨ v24.2.1: Expose current interval and activity signal
    currentInterval,
    signalActivity,
    fetchVitals,
    clearHistory,
    getAverageStats: () => {
      const stats = getAverageStats();
      if (any: any) return { cpu: 0, memory: 0, disk: 0, uptime: 0 };
      return {
        cpu: stats?.cpu ?? 0,
        memory: stats?.memory ?? 0,
        disk: stats?.disk ?? 0,
        uptime: stats?.uptime ?? 0,
      };
    },
    isOverloaded, // Now a memoized value, not a function call
  };
}
