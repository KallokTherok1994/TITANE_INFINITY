/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 — USE VITALS HOOK
 * Hook React pour monitoring vitals système temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { tauriClient } from '../services/tauriClient';

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

export function useVitals(options: { pollInterval?: number; enabled?: boolean } = {}) {
  const { pollInterval = 5000, enabled = true } = options;

  const [state, setState] = useState<VitalsState>({
    current: null,
    history: [],
    isLoading: false,
    error: null,
  });

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
   */
  const isOverloaded = useCallback((): boolean => {
    if (!state.current) return false;

    return state.current.cpu > 80 || state.current.memory > 90 || state.current.disk > 95;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll vitals automatiquement
  useEffect(() => {
    if (!enabled) return;

    // Première récupération immédiate
    fetchVitals();

    // Poll régulier
    const interval = setInterval(fetchVitals, pollInterval);

    return () => clearInterval(interval);
  }, [fetchVitals, pollInterval, enabled]);

  return {
    vitals: state.current,
    history: state.history,
    isLoading: state.isLoading,
    error: state.error,
    fetchVitals,
    clearHistory,
    getAverageStats,
    isOverloaded,
  };
}
