/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.1 — AURA PERFORMANCE MONITOR
 *   Monitoring FPS + auto-adjustment performance
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import { useAura } from './useAuraOrchestrator';

/**
 * Hook qui monitore les performances et met à jour l'orchestrateur Aura
 * Mesure FPS réels et recommande/applique auto-ajustements si nécessaire
 */
export const useAuraPerformanceMonitor = (
  autoAdjust: boolean = true,
  targetFPS: number = 60
) => {
  const aura = useAura();
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    let running = true;

    const measureFPS = () => {
      if (!running) return;

      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // Stocker les 60 dernières frames (1 seconde @ 60 FPS)
      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculer FPS moyen toutes les 30 frames
      if (frameTimesRef.current.length >= 30) {
        const avgDelta =
          frameTimesRef.current.reduce((sum, t) => sum + t, 0) /
          frameTimesRef.current.length;
        const currentFPS = Math.round(1000 / avgDelta);

        // Mettre à jour l'orchestrateur
        aura.updateFPS(currentFPS);

        // Auto-adjust si activé et FPS trop bas
        if (autoAdjust && currentFPS < targetFPS - 10) {
          const recommended = aura.getRecommendedQuality();
          if (recommended !== aura.config.quality) {
            logger.warn(
              `🎨 Aura: Performance issue detected (${currentFPS} FPS). Auto-adjusting to ${recommended}.`
            );
            aura.setQuality(recommended);
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      running = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [aura, autoAdjust, targetFPS]);

  return aura.metrics;
};

/**
 * Composant qui affiche un indicateur FPS minimal (dev mode)
 */
export const AuraFPSIndicator: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible?: boolean;
}> = ({ position = 'top-left', visible = true }) => {
  const metrics = useAuraPerformanceMonitor(true, 60);

  if (!visible) return null;

  const positionStyles = {
    'top-left': { top: '10px', left: '10px' },
    'top-right': { top: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' },
  };

  const fpsColor =
    metrics.fps >= 55 ? '#10b981' : metrics.fps >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${fpsColor}`,
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: fpsColor,
        zIndex: 10000,
        pointerEvents: 'none',
      }}
    >
      {metrics.fps} FPS
    </div>
  );
};

export default useAuraPerformanceMonitor;
