/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - useVisualEngine Hook
 * Hook React pour intégration facile du Visual Engine v21
 *
 * Features:
 * - ✅ Auto-init du Visual Engine
 * - ✅ State management réactif
 * - ✅ Performance metrics en temps réel
 * - ✅ Throttle status monitoring
 * - ✅ Auto-cleanup
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { TitaneVisualEngine } from '@/visual-engine/TitaneVisualEngine';
import type {
  VisualEngineConfig,
  PerformanceMetrics,
} from '@/visual-engine/TitaneVisualEngine';
import type { VisualState } from '@/design-system/visual-states';

export interface UseVisualEngineOptions extends Partial<VisualEngineConfig> {
  autoStart?: boolean; // Auto-start engine on mount
}

export interface UseVisualEngineReturn {
  engine: TitaneVisualEngine | null;
  currentState: VisualState;
  metrics: PerformanceMetrics;
  isRunning: boolean;
  isTransitioning: boolean;
  setState: (state: VisualState, duration?: number) => void;
  setStateImmediate: (state: VisualState) => void;
  start: () => void;
  stop: () => void;
}

/**
 * Hook pour utiliser le Visual Engine v21 dans un composant React
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     currentState,
 *     metrics,
 *     setState,
 *     isRunning
 *   } = useVisualEngine({
 *     autoStart: true,
 *     debug: true,
 *     adaptiveFPS: true,
 *   });
 *
 *   return (
 *     <div>
 *       <p>État: {currentState}</p>
 *       <p>FPS: {metrics.fps}</p>
 *       <p>GPU Load: {metrics.gpuLoad.toFixed(2)}</p>
 *       <button onClick={() => setState('intense')}>
 *         Mode Intense
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVisualEngine(
  options: UseVisualEngineOptions = {}
): UseVisualEngineReturn {
  const { autoStart = true, ...engineConfig } = options;

  // Engine instance (singleton pattern)
  const engineRef = useRef<TitaneVisualEngine | null>(null);

  // State
  const [currentState, setCurrentState] = useState<VisualState>('idle');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    effectsActive: 0,
    memoryUsage: 0,
    gpuLoad: 0,
    throttleActive: false,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize engine
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new TitaneVisualEngine(engineConfig);

      // Subscribe to events
      engineRef.current.on('visualStateChange', (state: VisualState) => {
        setCurrentState(state);
      });

      engineRef.current.on('performanceUpdate', (newMetrics: PerformanceMetrics) => {
        setMetrics(newMetrics);
      });

      engineRef.current.on('transitionStart', () => {
        setIsTransitioning(true);
      });

      engineRef.current.on('transitionComplete', () => {
        setIsTransitioning(false);
      });

      engineRef.current.on('engineStart', () => {
        setIsRunning(true);
      });

      engineRef.current.on('engineStop', () => {
        setIsRunning(false);
      });

      // Auto-start if requested
      if (autoStart) {
        engineRef.current.start();
      }
    }

    // Cleanup on unmount
    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [autoStart, engineConfig]);

  // Methods
  const setState = useCallback((state: VisualState, duration?: number) => {
    if (engineRef.current) {
      engineRef.current.setState(state, duration);
    }
  }, []);

  const setStateImmediate = useCallback((state: VisualState) => {
    if (engineRef.current) {
      engineRef.current.setStateImmediate(state);
    }
  }, []);

  const start = useCallback(() => {
    if (engineRef.current && !isRunning) {
      engineRef.current.start();
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (engineRef.current && isRunning) {
      engineRef.current.stop();
    }
  }, [isRunning]);

  return {
    engine: engineRef.current,
    currentState,
    metrics,
    isRunning,
    isTransitioning,
    setState,
    setStateImmediate,
    start,
    stop,
  };
}
