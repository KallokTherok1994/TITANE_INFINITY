/**
 * TITANE_INFINITY v∞.12 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   React Hooks pour Presence OS v∞.1
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import {
  presenceOS,
  type PresenceState,
  type PresenceOSMode,
  type CognitiveState,
  type AffectiveState,
  type ExpressiveOSState,
  type SpatialState,
} from '@/engines/presence/_stubs';

// Alias pour compatibilité
type PresenceMode = PresenceOSMode;
type ExpressiveState = ExpressiveOSState;
type SpatialPosition = SpatialState;

/*
import {
  presenceOS,
  type PresenceState,
  type PresenceMode,
  type CognitiveState,
  type AffectiveState,
  type ExpressiveState,
  type SpatialPosition,
} from '@/engines/presence/presenceOS';
*/

// ═══════════════════════════════════════════════════════════════════════════
// PRESENCE OS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour Presence OS
 */
export function usePresenceOS() {
  const [state, setState] = useState<PresenceState>(presenceOS.getState());

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    mode: state.mode,
    cognitive: state.cognitive,
    affective: state.affective,
    expressive: state.expressive,
    spatial: state.spatial,
    auraPattern: state.auraPattern,
    coherence: state.globalCoherence,
    setMode: (mode: PresenceMode, immediate?: boolean) => presenceOS.setMode(mode, immediate),
    reactToUserInput: (input: string, emotion?: string) => presenceOS.reactToUserInput(input, emotion),
  };
}

/**
 * Hook pour mode de présence actuel
 */
export function usePresenceMode(): PresenceMode {
  const [mode, setMode] = useState<PresenceMode>(presenceOS.getState().mode);

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe((state) => setMode(state.mode));
    return unsubscribe;
  }, []);

  return mode;
}

/**
 * Hook pour état cognitif
 */
export function useCognitiveState(): CognitiveState {
  const [cognitive, setCognitive] = useState<CognitiveState>(presenceOS.getState().cognitive);

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe((state) => setCognitive(state.cognitive));
    return unsubscribe;
  }, []);

  return cognitive;
}

/**
 * Hook pour état affectif
 */
export function useAffectiveState(): AffectiveState {
  const [affective, setAffective] = useState<AffectiveState>(presenceOS.getState().affective);

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe((state) => setAffective(state.affective));
    return unsubscribe;
  }, []);

  return affective;
}

/**
 * Hook pour état expressif
 */
export function useExpressiveState(): ExpressiveState {
  const [expressive, setExpressive] = useState<ExpressiveState>(presenceOS.getState().expressive);

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe((state) => setExpressive(state.expressive));
    return unsubscribe;
  }, []);

  return expressive;
}

/**
 * Hook pour position spatiale
 */
export function useSpatialPosition(): SpatialPosition {
  const [spatial, setSpatial] = useState<SpatialPosition>(presenceOS.getState().spatial);

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe((state) => setSpatial(state.spatial));
    return unsubscribe;
  }, []);

  return spatial;
}

/**
 * Hook pour cohérence globale
 */
export function usePresenceCoherence(): number {
  const [coherence, setCoherence] = useState<number>(presenceOS.getState().globalCoherence);

  useEffect(() => {
    const unsubscribe = presenceOS.subscribe((state) => setCoherence(state.globalCoherence));
    return unsubscribe;
  }, []);

  return coherence;
}

/**
 * Hook pour contrôle du mode
 */
export function usePresenceModeControl() {
  const mode = usePresenceMode();

  return {
    currentMode: mode,
    setInsight: () => presenceOS.setMode('insight'),
    setEmpathy: () => presenceOS.setMode('empathy'),
    setArchitect: () => presenceOS.setMode('architect'),
    setDeepWork: () => presenceOS.setMode('deep-work'),
    setSingularity: () => presenceOS.setMode('singularity'),
    setNeutral: () => presenceOS.setMode('neutral'),
    setListening: () => presenceOS.setMode('listening'),
    setProcessing: () => presenceOS.setMode('processing'),
  };
}
