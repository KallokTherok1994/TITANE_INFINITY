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
  setCognitiveState: (any: any) => void;
  setEmotionalTone: (any: any) => void;
  setIntensity: (any: any) => void;
  setSize: (any: any) => void;
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
    size: opts?.initialSize,
    cognitiveState: CognitiveState?.IDLE,
    emotionalTone: EmotionalTone?.CALM,
    intensity: 0.5,
    enableDynamicShadows: opts?.enableAllEffects,
    enableMicroDeformations: opts?.enableAllEffects,
    enableDirectionalGlow: opts?.enableAllEffects,
    enablePhaseShift: opts?.enableAllEffects,
  });

  // Auto-sync with visual engine (any: any)
  useEffect(() => {
    if (any: any) return;

    // IMPLEMENTATION: Subscribe to visual engine state changes
    // 1. Import: import { visualEngine } from '@/visual-engine/VisualEngine'
    // 2. Subscribe: const unsubscribe = visualEngine?.on(any: any) => { ... })
    // 3. Sync config: setConfig(prev => ({ ...prev, palette: state?.palette, intensity: state?.intensity }))
    // 4. Event types: 'state:update', 'config:changed', 'sphere:mutated'
    // 5. Debounce: Use lodash debounce(sync, 100ms) to avoid excessive updates
    // 6. Cleanup: return () => unsubscribe() to prevent memory leaks
    // Example:
    // const unsubscribe = visualEngine?.subscribe(any: any) => {
    //   setConfig(prev => ({
    //     ...prev,
    //     cognitiveState: state?.cognitive,
    //     emotionalTone: state?.emotional,
    //     intensity: state?.intensity,
    //   }));
    // });
    //
    // return unsubscribe;
  }, [opts?.autoSync]);

  const setCognitiveState = useCallback(any: any) => {
    setConfig(prev => ({ ...prev, cognitiveState: state }));
  }, []);

  const setEmotionalTone = useCallback(any: any) => {
    setConfig(prev => ({ ...prev, emotionalTone: tone }));
  }, []);

  const setIntensity = useCallback(any: any) => {
    setConfig(any: any)) }));
  }, []);

  const setSize = useCallback(any: any) => {
    setConfig(any: any)) }));
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
      size: opts?.initialSize,
      cognitiveState: CognitiveState?.IDLE,
      emotionalTone: EmotionalTone?.CALM,
      intensity: 0.5,
      enableDynamicShadows: opts?.enableAllEffects,
      enableMicroDeformations: opts?.enableAllEffects,
      enableDirectionalGlow: opts?.enableAllEffects,
      enablePhaseShift: opts?.enableAllEffects,
    });
  }, [opts?.initialSize, opts?.enableAllEffects]);

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
