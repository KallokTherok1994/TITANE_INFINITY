/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — PERFORMANCE MONITOR
 *   Hook: Monitoring performance temps réel + throttling intelligent
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  cpuLoad: number;
  shouldReduceMotion: boolean;
  shouldThrottle: boolean;
}

export interface UsePerformanceMonitorOptions {
  fpsThreshold?: number; // FPS minimum acceptable (défaut: 40)
  cpuThreshold?: number; // CPU max acceptable (défaut: 80%)
  enabled?: boolean;
}

export interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics;
  shouldReduceMotion: boolean;
  shouldThrottle: boolean;
  animationConfig: {
    duration: number; // Durée animations ajustée
    skipAnimation: boolean; // Skip animations si perf critique
  };
}

/**
 * Hook performance monitor v15
 * - FPS tracking temps réel
 * - CPU load detection (via Harmonia si disponible)
 * - Throttling intelligent animations
 * - Adaptation dynamique durée animations
 */
export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn {
  const { fpsThreshold = 40, cpuThreshold = 80, enabled = true } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    cpuLoad: 0,
    shouldReduceMotion: false,
    shouldThrottle: false,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef<number>();
  // ✨ v24.2.1: Track running state to prevent RAF after unmount
  const isRunningRef = useRef(false);

  /**
   * FPS tracking via requestAnimationFrame
   * ✨ v24.2.1: Use isRunningRef to prevent RAF scheduling after cleanup
   */
  const trackFPS = useCallback(() => {
    if (!enabled || !isRunningRef.current) return;

    frameCountRef.current++;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    // Update FPS chaque seconde
    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed);

      setMetrics(prev => ({
        ...prev,
        fps,
        shouldReduceMotion: fps < fpsThreshold,
        shouldThrottle: fps < fpsThreshold || prev.cpuLoad > cpuThreshold,
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    // ✨ v24.2.1: Only schedule next frame if still running
    if (isRunningRef.current) {
      rafIdRef.current = requestAnimationFrame(trackFPS);
    }
  }, [enabled, fpsThreshold, cpuThreshold]);

  /**
   * Détection prefers-reduced-motion
   */
  useEffect(() => {
    if (!enabled) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setMetrics(prev => ({
        ...prev,
        shouldReduceMotion: e.matches,
      }));
    };

    if (mediaQuery.matches) {
      setMetrics(prev => ({ ...prev, shouldReduceMotion: true }));
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enabled]);

  /**
   * Start FPS tracking
   * ✨ v24.2.1: Use isRunningRef for clean RAF lifecycle
   */
  useEffect(() => {
    if (!enabled) return;

    isRunningRef.current = true;
    rafIdRef.current = requestAnimationFrame(trackFPS);

    return () => {
      // ✨ v24.2.1: Stop the loop first, then cancel pending RAF
      isRunningRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled, trackFPS]);

  /**
   * Calcul animation config adaptative
   */
  const animationConfig = {
    duration: metrics.shouldReduceMotion
      ? 0
      : metrics.shouldThrottle
        ? 0.15 // 150ms si throttled
        : 0.2, // 200ms normal
    skipAnimation: metrics.shouldReduceMotion || metrics.fps < 20,
  };

  return {
    metrics,
    shouldReduceMotion: metrics.shouldReduceMotion,
    shouldThrottle: metrics.shouldThrottle,
    animationConfig,
  };
}
