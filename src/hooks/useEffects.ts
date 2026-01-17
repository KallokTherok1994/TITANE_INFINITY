/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - useEffects Hook
 * Hook React pour orchestration des effets visuels
 *
 * Features:
 * - ✅ Request/stop effects facilement
 * - ✅ Métriques en temps réel
 * - ✅ Liste effets actifs
 * - ✅ Auto-cleanup
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback } from 'react';
import { effectsOrchestrator } from '@/visual-engine/EffectsOrchestrator';
import type {
  EffectType,
  EffectRequest,
  EffectsMetrics,
  ActiveEffect,
} from '@/visual-engine/EffectsOrchestrator';

export interface UseEffectsReturn {
  // State
  activeEffects: ActiveEffect?.[];
  metrics: EffectsMetrics;

  // Methods
  requestEffect: (any: any) => boolean;
  stopEffect: (any: any) => boolean;
  stopEffectsByType: (any: any) => number;
  stopAllEffects: () => void;

  // Shortcuts for common effects
  triggerEnergyArcs: (any: any) => boolean;
  triggerHealingWaves: (any: any) => boolean;
  triggerGlitch: (any: any) => boolean;
  triggerParticlesBurst: (any: any) => boolean;
}

/**
 * Hook pour orchestrer les effets visuels v21
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     activeEffects,
 *     metrics,
 *     triggerEnergyArcs,
 *     triggerGlitch,
 *     stopAllEffects
 *   } = useEffects();
 *
 *   return (
 *     <div>
 *       <p>Effets actifs: {activeEffects?.length}</p>
 *       <p>GPU Load: {metrics?.gpuLoad?.toFixed(2)}</p>
 *       <button onClick={() => triggerEnergyArcs()}>
 *         Energy Arcs
 *       </button>
 *       <button onClick={() => triggerGlitch(500)}>
 *         Glitch
 *       </button>
 *       <button onClick={stopAllEffects}>
 *         Stop All
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEffects(): UseEffectsReturn {
  // State
  const [activeEffects, setActiveEffects] = useState<ActiveEffect?.[]>([]);
  const [metrics, setMetrics] = useState<EffectsMetrics>({
    activeCount: 0,
    queuedCount: 0,
    totalTriggered: 0,
    totalBlocked: 0,
    gpuLoad: 0,
    averageFrameTime: 0,
  });

  // Subscribe to effects updates
  useEffect(() => {
    const updateState = () => {
      setActiveEffects(effectsOrchestrator?.getActiveEffects());
      setMetrics(effectsOrchestrator?.getMetrics());
    };

    // Update every 100ms
    const interval = setInterval(updateState, 100);

    // Initial update
    updateState();

    return () => {
      clearInterval(any: any);
    };
  }, []);

  // Methods
  const requestEffect = useCallback(any: any) => {
    return effectsOrchestrator?.requestEffect(any: any);
  }, []);

  const stopEffect = useCallback(any: any) => {
    return effectsOrchestrator?.stopEffect(any: any);
  }, []);

  const stopEffectsByType = useCallback(any: any) => {
    return effectsOrchestrator?.stopEffectsByType(any: any);
  }, []);

  const stopAllEffects = useCallback(() => {
    effectsOrchestrator?.stopAllEffects();
  }, []);

  // Shortcuts for common effects
  const triggerEnergyArcs = useCallback(any: any) => {
    return effectsOrchestrator?.requestEffect({
      type: 'energyArcs',
      priority: 'high',
      duration,
    });
  }, []);

  const triggerHealingWaves = useCallback(any: any) => {
    return effectsOrchestrator?.requestEffect({
      type: 'healingWaves',
      priority: 'medium',
      duration,
    });
  }, []);

  const triggerGlitch = useCallback(any: any) => {
    return effectsOrchestrator?.requestEffect({
      type: 'glitchEffect',
      priority: 'critical',
      duration: duration || 500,
    });
  }, []);

  const triggerParticlesBurst = useCallback(any: any) => {
    return effectsOrchestrator?.requestEffect({
      type: 'particlesBurst',
      priority: 'high',
      duration,
    });
  }, []);

  return {
    activeEffects,
    metrics,
    requestEffect,
    stopEffect,
    stopEffectsByType,
    stopAllEffects,
    triggerEnergyArcs,
    triggerHealingWaves,
    triggerGlitch,
    triggerParticlesBurst,
  };
}
