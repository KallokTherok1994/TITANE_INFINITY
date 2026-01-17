/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.5.0 — useAdvancedPerformance Hook
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Hook React pour monitoring de performance avancé
 *
 * @version 25.5.0
 * @created 2025-12-16
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';
import {
  advancedPerformanceMonitor,
  type PerformanceSnapshot,
  type PerformanceBottleneck,
  type PerformanceHeatmap,
  type PredictiveAnalysis,
  type AutoOptimizationConfig,
} from '@/modules/performance/AdvancedPerformanceMonitor';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseAdvancedPerformanceOptions {
  enabled?: boolean;
  interval?: number; // ms between snapshots
  autoOptimization?: Partial<AutoOptimizationConfig>;
  onBottleneckDetected?: (bottleneck: PerformanceBottleneck) => void;
  onCriticalIssue?: (issue: PerformanceBottleneck) => void;
}

export interface UseAdvancedPerformanceReturn {
  // État
  isMonitoring: boolean;
  snapshots: PerformanceSnapshot[];
  bottlenecks: PerformanceBottleneck[];
  heatmap: PerformanceHeatmap | null;
  predictive: PredictiveAnalysis | null;

  // Métriques actuelles
  currentMetrics: {
    cpu: number;
    memory: number;
    fps: number;
    latency: number;
  };

  // Scores de santé (0-100)
  healthScores: {
    overall: number;
    cpu: number;
    memory: number;
    rendering: number;
    network: number;
  };

  // Actions
  start: () => void;
  stop: () => void;
  clear: () => void;
  refresh: () => void;
  applyOptimization: (suggestionId: string) => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAdvancedPerformance(
  options: UseAdvancedPerformanceOptions = {}
): UseAdvancedPerformanceReturn {
  const {
    enabled = true,
    interval = 1000,
    autoOptimization,
    onBottleneckDetected,
    onCriticalIssue,
  } = options;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [bottlenecks, setBottlenecks] = useState<PerformanceBottleneck[]>([]);
  const [heatmap, setHeatmap] = useState<PerformanceHeatmap | null>(null);
  const [predictive, setPredictive] = useState<PredictiveAnalysis | null>(null);

  const updateIntervalRef = useRef<number | null>(null);
  const previousBottlenecksRef = useRef<Set<string>>(new Set());

  /**
   * Démarre le monitoring
   */
  const start = useCallback(() => {
    if (isMonitoring) return;

    advancedPerformanceMonitor.startMonitoring(interval);
    setIsMonitoring(true);

    logger.debug('Monitoring started');
  }, [isMonitoring, interval]);

  /**
   * Arrête le monitoring
   */
  const stop = useCallback(() => {
    if (!isMonitoring) return;

    advancedPerformanceMonitor.stopMonitoring();
    setIsMonitoring(false);

    logger.debug('Monitoring stopped');
  }, [isMonitoring]);

  /**
   * Nettoie les données
   */
  const clear = useCallback(() => {
    advancedPerformanceMonitor.clear();
    setSnapshots([]);
    setBottlenecks([]);
    setHeatmap(null);
    setPredictive(null);
    previousBottlenecksRef.current.clear();
  }, []);

  /**
   * Rafraîchit les données manuellement
   */
  const refresh = useCallback(() => {
    const newSnapshots = advancedPerformanceMonitor.getSnapshots();
    const newBottlenecks = advancedPerformanceMonitor.getBottlenecks();
    const newHeatmap = advancedPerformanceMonitor.getHeatmap();
    const newPredictive = advancedPerformanceMonitor.getPredictiveAnalysis();

    setSnapshots(newSnapshots);
    setBottlenecks(newBottlenecks);
    setHeatmap(newHeatmap);
    setPredictive(newPredictive);

    // Détecter nouveaux bottlenecks
    const currentIds = new Set(newBottlenecks.map(b => b.id));
    const newIds = [...currentIds].filter(id => !previousBottlenecksRef.current.has(id));

    newIds.forEach(id => {
      const bottleneck = newBottlenecks.find(b => b.id === id);
      if (!bottleneck) return;

      onBottleneckDetected?.(bottleneck);

      if (bottleneck.severity === 'critical') {
        onCriticalIssue?.(bottleneck);
      }
    });

    previousBottlenecksRef.current = currentIds;
  }, [onBottleneckDetected, onCriticalIssue]);

  /**
   * Applique une optimisation
   */
  const applyOptimization = useCallback(
    async (suggestionId: string) => {
      const allSuggestions = bottlenecks.flatMap(b => b.suggestions);
      const suggestion = allSuggestions.find(s => s.id === suggestionId);

      if (!suggestion) {
        logger.warn(`[useAdvancedPerformance] Suggestion not found: ${suggestionId}`);
        return;
      }

      logger.debug(`[useAdvancedPerformance] Applying optimization: ${suggestion.title}`);

      // Optimization logic placeholder - implementation pending
      // For now, just log
    },
    [bottlenecks]
  );

  /**
   * Calcule les métriques actuelles
   */
  const currentMetrics = useMemo(() => {
    if (snapshots.length === 0) {
      return {
        cpu: 0,
        memory: 0,
        fps: 60,
        latency: 0,
      };
    }

    const latest = snapshots[snapshots.length - 1];
    if (!latest) {
      return {
        cpu: 0,
        memory: 0,
        fps: 60,
        latency: 0,
      };
    }

    return {
      cpu: latest.cpu.usage,
      memory: latest.memory.heapUsed,
      fps: latest.rendering.fps,
      latency: latest.network.latency,
    };
  }, [snapshots]);

  /**
   * Calcule les scores de santé
   */
  const healthScores = useMemo(() => {
    if (snapshots.length === 0) {
      return {
        overall: 100,
        cpu: 100,
        memory: 100,
        rendering: 100,
        network: 100,
      };
    }

    const latest = snapshots[snapshots.length - 1];
    if (!latest) {
      return {
        overall: 100,
        cpu: 100,
        memory: 100,
        rendering: 100,
        network: 100,
      };
    }

    // CPU score (inverse of usage)
    const cpuScore = Math.max(0, 100 - latest.cpu.usage);

    // Memory score (0-1GB = 100, >1GB = 0)
    const memoryGB = latest.memory.heapUsed / (1024 * 1024 * 1024);
    const memoryScore = Math.max(0, 100 - memoryGB * 100);

    // Rendering score (based on FPS)
    const renderingScore = Math.min(100, (latest.rendering.fps / 60) * 100);

    // Network score (based on latency)
    const networkScore = Math.max(0, 100 - latest.network.latency / 10);

    // Overall score (weighted average)
    const overall =
      cpuScore * 0.25 + memoryScore * 0.25 + renderingScore * 0.35 + networkScore * 0.15;

    return {
      overall: Math.round(overall),
      cpu: Math.round(cpuScore),
      memory: Math.round(memoryScore),
      rendering: Math.round(renderingScore),
      network: Math.round(networkScore),
    };
  }, [snapshots]);

  /**
   * Configure l'auto-optimization si fournie
   */
  useEffect(() => {
    if (autoOptimization) {
      // Auto-optimization monitor config update pending
      logger.debug('Auto-optimization configured:', autoOptimization);
    }
  }, [autoOptimization]);

  /**
   * Démarre le monitoring automatique au mount
   */
  useEffect(() => {
    if (enabled) {
      start();
    }

    return () => {
      if (isMonitoring) {
        stop();
      }
    };
  }, [enabled, start, stop, isMonitoring]);

  /**
   * Mise à jour périodique des données
   */
  useEffect(() => {
    if (!isMonitoring) return;

    updateIntervalRef.current = window.setInterval(() => {
      refresh();
    }, interval);

    return () => {
      if (updateIntervalRef.current !== null) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [isMonitoring, interval, refresh]);

  return {
    // État
    isMonitoring,
    snapshots,
    bottlenecks,
    heatmap,
    predictive,

    // Métriques
    currentMetrics,
    healthScores,

    // Actions
    start,
    stop,
    clear,
    refresh,
    applyOptimization,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: useMemo import
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo } from 'react';
