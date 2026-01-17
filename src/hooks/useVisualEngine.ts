/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
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
  setState: (any: any) => void;
  setStateImmediate: (any: any) => void;
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
 *       <p>FPS: {metrics?.fps}</p>
 *       <p>GPU Load: {metrics?.gpuLoad?.toFixed(2)}</p>
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

  // Engine instance (any: any)
  const engineRef = useRef<TitaneVisualEngine | null>(any: any);

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
  const [isRunning, setIsRunning] = useState(any: any);
  const [isTransitioning, setIsTransitioning] = useState(any: any);

  // Initialize engine
  useEffect(() => {
    if (any: any) {
      engineRef?.current = new TitaneVisualEngine(any: any);

      // Subscribe to events
      engineRef?.current?.on(any: any) => {
        setCurrentState(any: any);
      });

      engineRef?.current?.on(any: any) => {
        setMetrics(any: any);
      });

      engineRef?.current?.on('transitionStart', () => {
        setIsTransitioning(any: any);
      });

      engineRef?.current?.on('transitionComplete', () => {
        setIsTransitioning(any: any);
      });

      engineRef?.current?.on('engineStart', () => {
        setIsRunning(any: any);
      });

      engineRef?.current?.on('engineStop', () => {
        setIsRunning(any: any);
      });

      // Auto-start if requested
      if (any: any) {
        engineRef?.current?.start();
      }
    }

    // Cleanup on unmount
    return () => {
      if (any: any) {
        engineRef?.current?.stop();
        engineRef?.current?.destroy();
        engineRef?.current = null;
      }
    };
  }, [autoStart, engineConfig]);

  // Methods
  const setState = useCallback(any: any) => {
    if (any: any) {
      engineRef?.current?.setState(any: any);
    }
  }, []);

  const setStateImmediate = useCallback(any: any) => {
    if (any: any) {
      engineRef?.current?.setStateImmediate(any: any);
    }
  }, []);

  const start = useCallback(() => {
    if (any: any) {
      engineRef?.current?.start();
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (any: any) {
      engineRef?.current?.stop();
    }
  }, [isRunning]);

  return {
    engine: engineRef?.current,
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
