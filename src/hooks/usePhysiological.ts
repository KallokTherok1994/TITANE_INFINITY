/**
 * TITANE_INFINITY v∞.13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   React Hooks pour Interoception Engine & Holophonic Engine
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  interoceptionEngine,
  type InteroceptionState,
  type InteroceptionContext,
} from '@/engines/interoception/interoceptionEngine';
import {
  holophonicEngine,
  type TitanSpatialState,
  type SpatialPreset,
  type CognitiveSound,
  type SpatialOptions,
} from '@/engines/spatial/holophonicEngine';

// ═══════════════════════════════════════════════════════════════════════════
// INTEROCEPTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour l'état interne de TITANE∞
 */
export function useInteroception() {
  const [state, setState] = useState<InteroceptionState>(interoceptionEngine.getState());

  useEffect(() => {
    const unsubscribe = interoceptionEngine.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    setEnergy: (value: number) => interoceptionEngine.setEnergy(value),
    setCognitiveLoad: (value: number) => interoceptionEngine.setCognitiveLoad(value),
    setClarity: (value: number) => interoceptionEngine.setClarity(value),
    setStability: (value: number) => interoceptionEngine.setStability(value),
    setEmotionalTemperature: (value: number) => interoceptionEngine.setEmotionalTemperature(value),
    applyContext: (context: InteroceptionContext) => interoceptionEngine.applyContext(context),
    exportForAura: () => interoceptionEngine.exportForAura(),
    exportForVoice: () => interoceptionEngine.exportForVoice(),
    exportForProsody: () => interoceptionEngine.exportForProsody(),
    exportForSpatial: () => interoceptionEngine.exportForSpatial(),
    exportForAutonomic: () => interoceptionEngine.exportForAutonomic(),
  };
}

/**
 * Hook pour l'énergie interne uniquement
 */
export function useInternalEnergy() {
  const [energy, setEnergy] = useState<number>(interoceptionEngine.getState().energy);

  useEffect(() => {
    const unsubscribe = interoceptionEngine.subscribe((state) => {
      setEnergy(state.energy);
    });
    return unsubscribe;
  }, []);

  return energy;
}

/**
 * Hook pour la charge cognitive
 */
export function useCognitiveLoad() {
  const [load, setLoad] = useState<number>(interoceptionEngine.getState().cognitiveLoad);

  useEffect(() => {
    const unsubscribe = interoceptionEngine.subscribe((state) => {
      setLoad(state.cognitiveLoad);
    });
    return unsubscribe;
  }, []);

  return {
    load,
    setLoad: (value: number) => interoceptionEngine.setCognitiveLoad(value),
  };
}

/**
 * Hook pour la clarté mentale
 */
export function useMentalClarity() {
  const [clarity, setClarity] = useState<number>(interoceptionEngine.getState().clarity);

  useEffect(() => {
    const unsubscribe = interoceptionEngine.subscribe((state) => {
      setClarity(state.clarity);
    });
    return unsubscribe;
  }, []);

  return clarity;
}

/**
 * Hook pour la respiration (phase 0..1)
 */
export function useBreathingPhase() {
  const [phase, setPhase] = useState<number>(interoceptionEngine.getState().breathingPhase);

  useEffect(() => {
    const unsubscribe = interoceptionEngine.subscribe((state) => {
      setPhase(state.breathingPhase);
    });
    return unsubscribe;
  }, []);

  return phase;
}

/**
 * Hook pour l'homeostasie (équilibre global 0..1)
 */
export function useHomeostasis() {
  const [homeostasis, setHomeostasis] = useState<number>(interoceptionEngine.getState().homeostasis);

  useEffect(() => {
    const unsubscribe = interoceptionEngine.subscribe((state) => {
      setHomeostasis(state.homeostasis);
    });
    return unsubscribe;
  }, []);

  return homeostasis;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOLOPHONIC HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour le moteur holophonique
 */
export function useHolophonic() {
  const [spatialState, setSpatialState] = useState<TitanSpatialState>(
    holophonicEngine.getSpatialState()
  );

  useEffect(() => {
    const unsubscribe = holophonicEngine.subscribe(setSpatialState);
    return unsubscribe;
  }, []);

  return {
    spatialState,
    setSpatialState: (state: Partial<TitanSpatialState>) => holophonicEngine.setSpatialState(state),
    setPreset: (preset: SpatialPreset) => holophonicEngine.setPreset(preset),
    playCue: (cue: CognitiveSound, options?: SpatialOptions) => holophonicEngine.playCue(cue, options),
    setSoundIntensity: (intensity: 'off' | 'minimal' | 'normal' | 'rich') =>
      holophonicEngine.setSoundIntensity(intensity),
  };
}

/**
 * Hook pour la position spatiale uniquement
 */
export function useSpatialPosition() {
  const [position, setPosition] = useState<{ x: number; y: number; z: number }>({
    x: holophonicEngine.getSpatialState().x,
    y: holophonicEngine.getSpatialState().y,
    z: holophonicEngine.getSpatialState().z,
  });

  useEffect(() => {
    const unsubscribe = holophonicEngine.subscribe((state) => {
      setPosition({ x: state.x, y: state.y, z: state.z });
    });
    return unsubscribe;
  }, []);

  return position;
}

/**
 * Hook pour jouer des sons cognitifs facilement
 */
export function useCognitiveSounds() {
  return {
    playThinking: () => holophonicEngine.playCue('thinking'),
    playInsight: () => holophonicEngine.playCue('insight'),
    playModeSwitch: () => holophonicEngine.playCue('mode_switch'),
    playErrorSoft: () => holophonicEngine.playCue('error_soft'),
    playHealComplete: () => holophonicEngine.playCue('heal_complete'),
    playWakeWord: () => holophonicEngine.playCue('wake_word'),
    playListening: () => holophonicEngine.playCue('listening'),
    playProcessing: () => holophonicEngine.playCue('processing'),
  };
}

/**
 * Hook pour combiner interoception + spatial (état physiologique global)
 */
export function usePhysiologicalState() {
  const interoception = useInteroception();
  const holophonic = useHolophonic();

  return {
    internal: interoception.state,
    spatial: holophonic.spatialState,
    energy: interoception.state.energy,
    cognitiveLoad: interoception.state.cognitiveLoad,
    clarity: interoception.state.clarity,
    stability: interoception.state.stability,
    breathingPhase: interoception.state.breathingPhase,
    homeostasis: interoception.state.homeostasis,
    position: {
      x: holophonic.spatialState.x,
      y: holophonic.spatialState.y,
      z: holophonic.spatialState.z,
    },
    distance: holophonic.spatialState.distance,
  };
}
