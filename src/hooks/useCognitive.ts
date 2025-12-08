/**
 * TITANE_INFINITY v∞.35 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ COGNITIVE HOOKS
 *   React Hooks for Predictive, Conscious, and Narrative Engines
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';

// REMOVED: engines/predictive supprimé en PHASE 1 (OPTION B)
// Stub local pour maintenir compatibilité
type PredictiveFrame = any;
const predictiveReflectionEngine = {
  getState: () => ({} as PredictiveFrame),
  start: () => {},
  stop: () => {},
};

/*
import {
  predictiveReflectionEngine,
  type PredictiveFrame,
} from '@/engines/predictive/predictiveReflectionEngine';
*/
import {
  consciousDynamicsModel,
  type ConsciousState,
  type ConsciousMode,
} from '@/engines/conscious/consciousDynamicsModel';
import {
  internalNarrativeEngine,
  type InternalNarrativeState,
  type IntentDirection,
  type InnerThought,
} from '@/engines/narrative/internalNarrativeEngine';

// ═══════════════════════════════════════════════════════════════════════════
// PREDICTIVE REFLECTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour l'état prédictif complet
 */
export function usePredictive(): PredictiveFrame & {
  applyPerceptualContext: (context: Record<string, unknown>) => void;
  applyNervousContext: (context: Record<string, unknown>) => void;
} {
  const [state, setState] = useState<PredictiveFrame>(
    predictiveReflectionEngine.getState()
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    applyPerceptualContext: predictiveReflectionEngine.applyPerceptualContext.bind(
      predictiveReflectionEngine
    ),
    applyNervousContext: predictiveReflectionEngine.applyNervousContext.bind(
      predictiveReflectionEngine
    ),
  };
}

/**
 * Hook pour l'intention prédite de l'utilisateur
 */
export function usePredictedIntent() {
  const [intent, setIntent] = useState(
    predictiveReflectionEngine.getState().predictedUserIntent
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine.subscribe(state => {
      setIntent(state.predictedUserIntent);
    });
    return unsubscribe;
  }, []);

  return intent;
}

/**
 * Hook pour l'émotion prédite de l'utilisateur
 */
export function usePredictedEmotion() {
  const [emotion, setEmotion] = useState(
    predictiveReflectionEngine.getState().predictedUserEmotion
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine.subscribe(state => {
      setEmotion(state.predictedUserEmotion);
    });
    return unsubscribe;
  }, []);

  return emotion;
}

/**
 * Hook pour le besoin prédit
 */
export function usePredictedNeed() {
  const [need, setNeed] = useState(predictiveReflectionEngine.getState().predictedNeed);

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine.subscribe(state => {
      setNeed(state.predictedNeed);
    });
    return unsubscribe;
  }, []);

  return need;
}

/**
 * Hook pour les ajustements recommandés
 */
export function useRecommendedAdjustments() {
  const [adjustments, setAdjustments] = useState(
    predictiveReflectionEngine.getState().recommendedAdjustments
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine.subscribe(state => {
      setAdjustments(state.recommendedAdjustments);
    });
    return unsubscribe;
  }, []);

  return adjustments;
}

/**
 * Hook pour l'auto-prédiction de TITANE∞
 */
export function useTitaneSelfPrediction() {
  const [prediction, setPrediction] = useState(
    predictiveReflectionEngine.getState().titaneSelfPrediction
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine.subscribe(state => {
      setPrediction(state.titaneSelfPrediction);
    });
    return unsubscribe;
  }, []);

  return prediction;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSCIOUS DYNAMICS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour l'état de conscience
 */
export function useConsciousDynamics(): ConsciousState & {
  setMode: (mode: ConsciousMode) => void;
  boostFocus: (amount?: number) => void;
  boostClarity: (amount?: number) => void;
  pauseReflective: (duration?: number) => void;
  applyContext: (context: Record<string, unknown>) => void;
} {
  const [state, setState] = useState<ConsciousState>(consciousDynamicsModel.getState());

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    setMode: consciousDynamicsModel.setMode.bind(consciousDynamicsModel),
    boostFocus: consciousDynamicsModel.boostFocus.bind(consciousDynamicsModel),
    boostClarity: consciousDynamicsModel.boostClarity.bind(consciousDynamicsModel),
    pauseReflective: consciousDynamicsModel.pauseReflective.bind(consciousDynamicsModel),
    applyContext: consciousDynamicsModel.applyContext.bind(consciousDynamicsModel),
  };
}

/**
 * Hook pour le focus cognitif
 */
export function useConsciousFocus() {
  const [focus, setFocus] = useState(consciousDynamicsModel.getState().focus);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(state => {
      setFocus(state.focus);
    });
    return unsubscribe;
  }, []);

  return {
    focus,
    boost: consciousDynamicsModel.boostFocus.bind(consciousDynamicsModel),
  };
}

/**
 * Hook pour la clarté cognitive
 */
export function useConsciousClarity() {
  const [clarity, setClarity] = useState(consciousDynamicsModel.getState().clarity);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(state => {
      setClarity(state.clarity);
    });
    return unsubscribe;
  }, []);

  return {
    clarity,
    boost: consciousDynamicsModel.boostClarity.bind(consciousDynamicsModel),
  };
}

/**
 * Hook pour le bruit cognitif
 */
export function useConsciousNoise() {
  const [noise, setNoise] = useState(consciousDynamicsModel.getState().noise);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(state => {
      setNoise(state.noise);
    });
    return unsubscribe;
  }, []);

  return noise;
}

/**
 * Hook pour la profondeur de réflexion
 */
export function useConsciousDepth() {
  const [depth, setDepth] = useState(consciousDynamicsModel.getState().depth);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(state => {
      setDepth(state.depth);
    });
    return unsubscribe;
  }, []);

  return depth;
}

/**
 * Hook pour la stabilité globale
 */
export function useConsciousStability() {
  const [stability, setStability] = useState(consciousDynamicsModel.getState().stability);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(state => {
      setStability(state.stability);
    });
    return unsubscribe;
  }, []);

  return stability;
}

/**
 * Hook pour le mode de conscience
 */
export function useConsciousMode() {
  const [mode, setModeState] = useState(consciousDynamicsModel.getState().mode);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel.subscribe(state => {
      setModeState(state.mode);
    });
    return unsubscribe;
  }, []);

  const setMode = (newMode: ConsciousMode) => {
    consciousDynamicsModel.setMode(newMode);
  };

  return { mode, setMode };
}

/**
 * Hook pour l'état de réparation
 */
export function useConsciousRepair() {
  const [repair, setRepair] = useState(consciousDynamicsModel.getRepairState());

  useEffect(() => {
    const interval = setInterval(() => {
      setRepair(consciousDynamicsModel.getRepairState());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return repair;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL NARRATIVE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour l'état narratif
 */
export function useInternalNarrative(): InternalNarrativeState & {
  generateMonologue: (context: Record<string, unknown>) => void;
  setNarrativeAnchor: (anchor: string) => void;
  setIntentDirection: (direction: IntentDirection) => void;
  stimulateCuriosity: (amount?: number) => void;
  clearMonologue: () => void;
} {
  const [state, setState] = useState<InternalNarrativeState>(
    internalNarrativeEngine.getState()
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    generateMonologue: internalNarrativeEngine.generateInnerMonologue.bind(
      internalNarrativeEngine
    ),
    setNarrativeAnchor: internalNarrativeEngine.setNarrativeAnchor.bind(
      internalNarrativeEngine
    ),
    setIntentDirection: internalNarrativeEngine.setIntentDirection.bind(
      internalNarrativeEngine
    ),
    stimulateCuriosity: internalNarrativeEngine.stimulateCuriosity.bind(
      internalNarrativeEngine
    ),
    clearMonologue: internalNarrativeEngine.clearMonologue.bind(internalNarrativeEngine),
  };
}

/**
 * Hook pour le monologue récent
 */
export function useInnerMonologue(count: number = 5) {
  const [monologue, setMonologue] = useState<InnerThought[]>(
    internalNarrativeEngine.getRecentMonologue(count)
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine.subscribe(() => {
      setMonologue(internalNarrativeEngine.getRecentMonologue(count));
    });
    return unsubscribe;
  }, [count]);

  return monologue;
}

/**
 * Hook pour l'ancre narrative
 */
export function useNarrativeAnchor() {
  const [anchor, setAnchor] = useState(
    internalNarrativeEngine.getState().narrativeAnchor
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine.subscribe(state => {
      setAnchor(state.narrativeAnchor);
    });
    return unsubscribe;
  }, []);

  const setNarrativeAnchor = (newAnchor: string) => {
    internalNarrativeEngine.setNarrativeAnchor(newAnchor);
  };

  return { anchor, setAnchor: setNarrativeAnchor };
}

/**
 * Hook pour la cohérence narrative
 */
export function useNarrativeCoherence() {
  const [coherence, setCoherence] = useState(
    internalNarrativeEngine.getState().coherenceScore
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine.subscribe(state => {
      setCoherence(state.coherenceScore);
    });
    return unsubscribe;
  }, []);

  return coherence;
}

/**
 * Hook pour la curiosité cognitive
 */
export function useNarrativeCuriosity() {
  const [curiosity, setCuriosity] = useState(
    internalNarrativeEngine.getState().curiosity
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine.subscribe(state => {
      setCuriosity(state.curiosity);
    });
    return unsubscribe;
  }, []);

  const stimulate = (amount?: number) => {
    internalNarrativeEngine.stimulateCuriosity(amount);
  };

  return { curiosity, stimulate };
}

/**
 * Hook pour la pensée active
 */
export function useActiveThought() {
  const [thought, setThought] = useState<InnerThought | null>(
    internalNarrativeEngine.getActiveThought()
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine.subscribe(state => {
      setThought(state.activeThought);
    });
    return unsubscribe;
  }, []);

  return thought;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED COGNITIVE STATE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook combiné pour vue d'ensemble cognitive complète
 */
export function useCognitiveDynamicsState() {
  const predictive = usePredictive();
  const conscious = useConsciousDynamics();
  const narrative = useInternalNarrative();

  return {
    predictive,
    conscious,
    narrative,
  };
}
