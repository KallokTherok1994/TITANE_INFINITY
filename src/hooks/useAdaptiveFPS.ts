/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - useAdaptiveFPS Hook
 * Hook React pour monitoring FPS et throttling adaptatif
 *
 * Features:
 * - ✅ FPS monitoring en temps réel
 * - ✅ Throttle level tracking
 * - ✅ Performance warnings
 * - ✅ Auto-recommendations
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';

export interface FPSMetrics {
  current: number;
  average: number;
  min: number;
  max: number;
  throttleLevel: number;
  isThrottling: boolean;
}

export interface PerformanceWarning {
  level: 'info' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
}

export interface UseAdaptiveFPSReturn {
  metrics: FPSMetrics;
  warnings: PerformanceWarning[];
  isPerformanceGood: boolean; // FPS >= 55
  isPerformanceDegraded: boolean; // FPS < 45
}

/**
 * Hook pour monitorer les performances FPS et le throttling
 *
 * @example
 * ```tsx
 * function PerformanceMonitor() {
 *   const {
 *     metrics,
 *     warnings,
 *     isPerformanceGood,
 *     isPerformanceDegraded
 *   } = useAdaptiveFPS();
 *
 *   return (
 *     <div>
 *       <p>FPS: {metrics.current}</p>
 *       <p>Throttle: Level {metrics.throttleLevel}</p>
 *       {isPerformanceDegraded && (
 *         <div className="alert-critical">
 *           Performance dégradée !
 *         </div>
 *       )}
 *       {warnings.map((warning, i) => (
 *         <div key={i} className={`alert-${warning.level}`}>
 *           {warning.message}
 *           {warning.recommendation && (
 *             <p>{warning.recommendation}</p>
 *           )}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdaptiveFPS(): UseAdaptiveFPSReturn {
  // State
  const [metrics, setMetrics] = useState<FPSMetrics>({
    current: 60,
    average: 60,
    min: 60,
    max: 60,
    throttleLevel: 0,
    isThrottling: false,
  });

  const [warnings, setWarnings] = useState<PerformanceWarning[]>([]);

  // FPS tracking
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsHistory: number[] = [];
    const maxHistory = 60; // Track last 60 frames

    const measureFPS = () => {
      frameCount++;

      if (frameCount >= 10) {
        const now = performance.now();
        const delta = now - lastTime;
        const fps = Math.round((frameCount / delta) * 1000);

        // Add to history
        fpsHistory.push(fps);
        if (fpsHistory.length > maxHistory) {
          fpsHistory.shift();
        }

        // Calculate metrics
        const average = Math.round(
          fpsHistory.reduce((sum, f) => sum + f, 0) / fpsHistory.length
        );
        const min = Math.min(...fpsHistory);
        const max = Math.max(...fpsHistory);

        // Estimate throttle level based on FPS
        let throttleLevel = 0;
        let isThrottling = false;

        if (average < 45) {
          throttleLevel = 3;
          isThrottling = true;
        } else if (average < 50) {
          throttleLevel = 2;
          isThrottling = true;
        } else if (average < 55) {
          throttleLevel = 1;
          isThrottling = true;
        }

        setMetrics({
          current: fps,
          average,
          min,
          max,
          throttleLevel,
          isThrottling,
        });

        // Generate warnings
        const newWarnings: PerformanceWarning[] = [];

        if (average < 30) {
          newWarnings.push({
            level: 'critical',
            message: 'Performance critique: FPS < 30',
            recommendation: 'Désactivez les particules et effets visuels',
          });
        } else if (average < 45) {
          newWarnings.push({
            level: 'warning',
            message: 'Performance dégradée: FPS < 45',
            recommendation: 'Réduisez la complexité visuelle',
          });
        } else if (average < 55) {
          newWarnings.push({
            level: 'info',
            message: 'Throttling léger actif',
            recommendation: 'Performance acceptable mais sous-optimale',
          });
        }

        if (isThrottling && throttleLevel >= 2) {
          newWarnings.push({
            level: 'warning',
            message: `Throttling niveau ${throttleLevel} actif`,
            recommendation: 'Effets visuels réduits pour maintenir les performances',
          });
        }

        setWarnings(newWarnings);

        // Reset
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return {
    metrics,
    warnings,
    isPerformanceGood: metrics.average >= 55,
    isPerformanceDegraded: metrics.average < 45,
  };
}
