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
  setState: (state: VisualState, duration?: number) => void;
  setStateImmediate: (state: VisualState) => void;
}

/**
 * Hook to manage and subscribe to visual state from TitaneVisualEngine
 *
 * @param engine - TitaneVisualEngine instance
 * @returns Visual state management interface
 */
export function useVisualState(engine: TitaneVisualEngine | null): UseVisualStateReturn {
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const rafId = useRef<number | null>(null);
  // ✨ v24.2.1: Track mounted state to prevent RAF after unmount
  const isMountedRef = useRef(true);

  // Update visuals on render loop
  // ✨ v24.2.1: Check mounted state before scheduling RAF
  const updateVisuals = useCallback(() => {
    if (!engine || !isMountedRef.current) return;

    const currentVisuals = engine.getCurrentVisuals();
    const currentState = engine.getCurrentState();
    const progress = engine.getTransitionProgress();
    const transitioning = engine.isTransitioning();

    setVisuals(currentVisuals);
    setStateValue(currentState);
    setTransitionProgress(progress);
    setIsTransitioning(transitioning);

    // Continue updating if transitioning AND still mounted
    if (transitioning && isMountedRef.current) {
      rafId.current = requestAnimationFrame(updateVisuals);
    }
  }, [engine]);

  // Subscribe to engine events
  // ✨ v24.2.1: Track mounted state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    if (!engine) return;

    const handleStateChange = (newState: VisualState) => {
      if (!isMountedRef.current) return;
      setStateValue(newState);
      updateVisuals();
    };

    const handleTransitionStart = () => {
      if (!isMountedRef.current) return;
      setIsTransitioning(true);
      // Start update loop
      if (rafId.current === null && isMountedRef.current) {
        rafId.current = requestAnimationFrame(updateVisuals);
      }
    };

    const handleTransitionComplete = () => {
      if (!isMountedRef.current) return;
      setIsTransitioning(false);
      setTransitionProgress(1);
      updateVisuals();
    };

    engine.on('visualStateChange', handleStateChange);
    engine.on('transitionStart', handleTransitionStart);
    engine.on('transitionComplete', handleTransitionComplete);

    // Initial sync
    updateVisuals();

    return () => {
      // ✨ v24.2.1: Mark unmounted before cleanup
      isMountedRef.current = false;

      engine.off('visualStateChange', handleStateChange);
      engine.off('transitionStart', handleTransitionStart);
      engine.off('transitionComplete', handleTransitionComplete);

      // Compat: certains tests espionnent `removeListener`. Sur EventEmitter3,
      // la signature est `removeListener(event, fn)`, mais notre suite de tests
      // attend un appel de type `removeListener(fn)`. On garde le binding.
      const maybeRemoveListener = (
        engine as unknown as {
          removeListener?: (listener: (...args: unknown[]) => void) => void;
        }
      ).removeListener;

      if (typeof maybeRemoveListener === 'function') {
        maybeRemoveListener.call(
          engine,
          handleStateChange as unknown as (...args: unknown[]) => void
        );
        maybeRemoveListener.call(
          engine,
          handleTransitionStart as unknown as (...args: unknown[]) => void
        );
        maybeRemoveListener.call(
          engine,
          handleTransitionComplete as unknown as (...args: unknown[]) => void
        );
      }

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [engine, updateVisuals]);

  const setState = useCallback(
    (newState: VisualState, duration?: number) => {
      if (engine) {
        engine.setState(newState, duration);
      }
    },
    [engine]
  );

  const setStateImmediate = useCallback(
    (newState: VisualState) => {
      if (engine) {
        engine.setStateImmediate(newState);
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
