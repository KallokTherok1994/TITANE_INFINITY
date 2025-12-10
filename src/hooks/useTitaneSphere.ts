/**
 * TITANE∞ v21 — useTitaneSphere Hook
 * React hook pour gérer l'état du noyau visuel
 *
 * Synchronise automatiquement avec l'état cognitif global
 */

import { useState, useEffect, useCallback } from 'react';
import { CognitiveState, EmotionalTone } from '@/design-system/visual-states';
import type { TitaneSphereConfig } from '@/components/core/TitaneSphereCore';

export interface UseTitaneSphereOptions {
  initialSize?: number;
  autoSync?: boolean; // Auto-sync with visual engine state
  enableAllEffects?: boolean;
}

export interface UseTitaneSphereReturn {
  config: TitaneSphereConfig;
  setCognitiveState: (state: CognitiveState) => void;
  setEmotionalTone: (tone: EmotionalTone) => void;
  setIntensity: (intensity: number) => void;
  setSize: (size: number) => void;
  toggleEffect: (
    effect: keyof Omit<
      TitaneSphereConfig,
      'size' | 'cognitiveState' | 'emotionalTone' | 'intensity'
    >
  ) => void;
  reset: () => void;
}

const DEFAULT_OPTIONS: Required<UseTitaneSphereOptions> = {
  initialSize: 200,
  autoSync: true,
  enableAllEffects: true,
};

export function useTitaneSphere(
  options: UseTitaneSphereOptions = {}
): UseTitaneSphereReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [config, setConfig] = useState<TitaneSphereConfig>({
    size: opts.initialSize,
    cognitiveState: CognitiveState.IDLE,
    emotionalTone: EmotionalTone.CALM,
    intensity: 0.5,
    enableDynamicShadows: opts.enableAllEffects,
    enableMicroDeformations: opts.enableAllEffects,
    enableDirectionalGlow: opts.enableAllEffects,
    enablePhaseShift: opts.enableAllEffects,
  });

  // Auto-sync with visual engine (if available)
  useEffect(() => {
    if (!opts.autoSync) return;

    // TODO: Subscribe to visual engine state changes
    // Example:
    // const unsubscribe = visualEngine.subscribe((state) => {
    //   setConfig(prev => ({
    //     ...prev,
    //     cognitiveState: state.cognitive,
    //     emotionalTone: state.emotional,
    //     intensity: state.intensity,
    //   }));
    // });
    //
    // return unsubscribe;
  }, [opts.autoSync]);

  const setCognitiveState = useCallback((state: CognitiveState) => {
    setConfig(prev => ({ ...prev, cognitiveState: state }));
  }, []);

  const setEmotionalTone = useCallback((tone: EmotionalTone) => {
    setConfig(prev => ({ ...prev, emotionalTone: tone }));
  }, []);

  const setIntensity = useCallback((intensity: number) => {
    setConfig(prev => ({ ...prev, intensity: Math.max(0, Math.min(1, intensity)) }));
  }, []);

  const setSize = useCallback((size: number) => {
    setConfig(prev => ({ ...prev, size: Math.max(50, Math.min(1000, size)) }));
  }, []);

  const toggleEffect = useCallback(
    (
      effect: keyof Omit<
        TitaneSphereConfig,
        'size' | 'cognitiveState' | 'emotionalTone' | 'intensity'
      >
    ) => {
      setConfig(prev => ({
        ...prev,
        [effect]: !prev[effect],
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setConfig({
      size: opts.initialSize,
      cognitiveState: CognitiveState.IDLE,
      emotionalTone: EmotionalTone.CALM,
      intensity: 0.5,
      enableDynamicShadows: opts.enableAllEffects,
      enableMicroDeformations: opts.enableAllEffects,
      enableDirectionalGlow: opts.enableAllEffects,
      enablePhaseShift: opts.enableAllEffects,
    });
  }, [opts.initialSize, opts.enableAllEffects]);

  return {
    config,
    setCognitiveState,
    setEmotionalTone,
    setIntensity,
    setSize,
    toggleEffect,
    reset,
  };
}

export default useTitaneSphere;
