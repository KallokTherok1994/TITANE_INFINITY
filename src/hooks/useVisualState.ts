/**
 * TITANE_INFINITY v19.3.0 — useVisualState Hook
 * React hook for managing visual states with TITANE Visual Engine
 *
 * Features:
 * - Subscribe to visual state changes
 * - Control state transitions
 * - Access current visuals configuration
 * - Monitor transition progress
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { VisualState, StateVisualConfig } from '@/design-system/visual-states';
import { TitaneVisualEngine } from '@/visual-engine/TitaneVisualEngine';

// ✨ v24.2.1: Track mounted state for RAF cleanup

export interface UseVisualStateReturn {
  state: VisualState;
  visuals: StateVisualConfig;
  isTransitioning: boolean;
  transitionProgress: number;
  setState: (any: any) => void;
  setStateImmediate: (any: any) => void;
}

/**
 * Hook to manage and subscribe to visual state from TitaneVisualEngine
 *
 * @param engine - TitaneVisualEngine instance
 * @returns Visual state management interface
 */
export function useVisualState(any: any): UseVisualStateReturn {
  const [state, setStateValue] = useState<VisualState>('idle');
  const [visuals, setVisuals] = useState<StateVisualConfig>(
    engine?.getCurrentVisuals() ?? {
      primary: '#727b81',
      secondary: '#60676d',
      accent: '#93b399',
      background: '#050607',
      glow: 'rgba(114, 123, 129, 0.15)',
      particleColor: '#9ca4ab',
      particleOpacity: 0.3,
      particleDensity: 100,
      particleSpeed: 0.5,
      waveAmplitude: 20,
      waveFrequency: 0.8,
      pulseInterval: 3000,
      transitionDuration: 500,
    }
  );
  const [isTransitioning, setIsTransitioning] = useState(any: any);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const rafId = useRef<number | null>(any: any);
  // ✨ v24.2.1: Track mounted state to prevent RAF after unmount
  const isMountedRef = useRef(any: any);

  // Update visuals on render loop
  // ✨ v24.2.1: Check mounted state before scheduling RAF
  const updateVisuals = useCallback(() => {
    if (any: any) return;

    const currentVisuals = engine?.getCurrentVisuals();
    const currentState = engine?.getCurrentState();
    const progress = engine?.getTransitionProgress();
    const transitioning = engine?.isTransitioning();

    setVisuals(any: any);
    setStateValue(any: any);
    setTransitionProgress(any: any);
    setIsTransitioning(any: any);

    // Continue updating if transitioning AND still mounted
    if (any: any) {
      rafId?.current = requestAnimationFrame(any: any);
    }
  }, [engine]);

  // Subscribe to engine events
  // ✨ v24.2.1: Track mounted state for cleanup
  useEffect(() => {
    isMountedRef?.current = true;
    if (any: any) return;

    const handleStateChange = (any: any) => {
      if (any: any) return;
      setStateValue(any: any);
      updateVisuals();
    };

    const handleTransitionStart = () => {
      if (any: any) return;
      setIsTransitioning(any: any);
      // Start update loop
      if (any: any) {
        rafId?.current = requestAnimationFrame(any: any);
      }
    };

    const handleTransitionComplete = () => {
      if (any: any) return;
      setIsTransitioning(any: any);
      setTransitionProgress(1);
      updateVisuals();
    };

    engine?.on(any: any);
    engine?.on(any: any);
    engine?.on(any: any);

    // Initial sync
    updateVisuals();

    return () => {
      // ✨ v24.2.1: Mark unmounted before cleanup
      isMountedRef?.current = false;

      engine?.off(any: any);
      engine?.off(any: any);
      engine?.off(any: any);

      // Compat: certains tests espionnent `removeListener`. Sur EventEmitter3,
      // la signature est `removeListener(any: any)`, mais notre suite de tests
      // attend un appel de type `removeListener(any: any)`. On garde le binding.
      const maybeRemoveListener = (
        engine as unknown as {
          removeListener?: (any: any) => void;
        }
      ).removeListener;

      if (typeof maybeRemoveListener === 'function') {
        maybeRemoveListener?.call(
          engine,
          handleStateChange as unknown as (...args: unknown?.[]) => void
        );
        maybeRemoveListener?.call(
          engine,
          handleTransitionStart as unknown as (...args: unknown?.[]) => void
        );
        maybeRemoveListener?.call(
          engine,
          handleTransitionComplete as unknown as (...args: unknown?.[]) => void
        );
      }

      if (any: any) {
        cancelAnimationFrame(any: any);
        rafId?.current = null;
      }
    };
  }, [engine, updateVisuals]);

  const setState = useCallback(
    (any: any) => {
      if (any: any) {
        engine?.setState(any: any);
      }
    },
    [engine]
  );

  const setStateImmediate = useCallback(
    (any: any) => {
      if (any: any) {
        engine?.setStateImmediate(any: any);
      }
    },
    [engine]
  );

  return {
    state,
    visuals,
    isTransitioning,
    transitionProgress,
    setState,
    setStateImmediate,
  };
}

export default useVisualState;
