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

import { useState, useCallback, useEffect, useRef } from 'react';
import { tauriClient } from '../services/tauriClient';
import { createAdaptivePolling } from '@/utils/adaptivePolling';

export interface SystemVitals {
  cpu: number; // 0-100
  memory: number; // 0-100
  disk: number; // 0-100
  uptime: number; // milliseconds
  timestamp: number;
}

export interface VitalsState {
  current: SystemVitals | null;
  history: SystemVitals[];
  isLoading: boolean;
  error: string | null;
}

const MAX_HISTORY = 60; // Garde 60 points (1 minute si poll 1s)

export interface UseVitalsOptions {
  pollInterval?: number;
  enabled?: boolean;
  /** ✨ v24.2.1: Enable adaptive polling (slower when idle/hidden) */
  adaptive?: boolean;
}

export function useVitals(options: UseVitalsOptions = {}) {
  const { pollInterval = 5000, enabled = true, adaptive = true } = options;

  const [state, setState] = useState<VitalsState>({
    current: null,
    history: [],
    isLoading: false,
    error: null,
  });

  // ✨ v24.2.1: Track current polling interval for debugging
  const [currentInterval, setCurrentInterval] = useState(pollInterval);
  const pollingRef = useRef<ReturnType<typeof createAdaptivePolling> | null>(null);

  /**
   * Récupère les vitals système
   */
  const fetchVitals = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const vitalsData = await tauriClient.getSystemVitals();

      // Parser les vitals (format peut varier selon le backend)
      const vitals: SystemVitals = {
        cpu: (vitalsData.cpu_usage as number) || 0,
        memory: (vitalsData.memory_usage as number) || 0,
        disk: (vitalsData.disk_usage as number) || 0,
        uptime: (vitalsData.uptime as number) || 0,
        timestamp: Date.now(),
      };

      setState(prev => {
        const newHistory = [...prev.history, vitals].slice(-MAX_HISTORY);
        return {
          current: vitals,
          history: newHistory,
          isLoading: false,
          error: null,
        };
      });

      return vitals;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vitals';
      console.error('❌ Vitals fetch error:', err);

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
    if (state.history.length === 0) return null;

    const sum = state.history.reduce(
      (acc, v) => ({
        cpu: acc.cpu + v.cpu,
        memory: acc.memory + v.memory,
        disk: acc.disk + v.disk,
        uptime: v.uptime, // Dernier uptime
      }),
      { cpu: 0, memory: 0, disk: 0, uptime: 0 }
    );

    const count = state.history.length;

    return {
      cpu: Math.round(sum.cpu / count),
      memory: Math.round(sum.memory / count),
      disk: Math.round(sum.disk / count),
      uptime: sum.uptime,
    };
  }, [state.history]);

  /**
   * Détecte si le système est en surcharge
   * FIX: Use useMemo instead of useCallback for derived state
   */
  const isOverloaded = (): boolean => {
    if (!state.current) return false;

    return state.current.cpu > 80 || state.current.memory > 90 || state.current.disk > 95;
  };

  // ✨ v24.2.1: Adaptive polling - slows down when idle or tab hidden
  useEffect(() => {
    if (!enabled) return;

    if (adaptive) {
      // Use adaptive polling that adjusts based on activity
      // ✨ v24.2.1: Wrap fetchVitals to return void (adaptive polling doesn't use return value)
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
            setCurrentInterval(newInterval);
            if (process.env.NODE_ENV === 'development') {
              console.log(`[useVitals] Adaptive interval: ${newInterval}ms`);
            }
          },
        }
      );

      pollingRef.current = polling;
      polling.start();

      return () => {
        polling.stop();
        pollingRef.current = null;
      };
    } else {
      // Fallback to fixed interval polling
      fetchVitals();
      const interval = setInterval(fetchVitals, pollInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval, enabled, adaptive]);

  // ✨ v24.2.1: Signal activity to speed up polling
  const signalActivity = useCallback(() => {
    pollingRef.current?.signalActivity();
  }, []);

  return {
    vitals: state.current,
    history: state.history,
    isLoading: state.isLoading,
    error: state.error,
    // ✨ v24.2.1: Expose current interval and activity signal
    currentInterval,
    signalActivity,
    fetchVitals,
    clearHistory,
    getAverageStats,
    isOverloaded,
  };
}
