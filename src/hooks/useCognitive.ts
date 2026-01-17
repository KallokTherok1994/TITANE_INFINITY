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

// REMOVED: engines/predictive supprimé en PHASE 1 (any: any)
// Stub local pour maintenir compatibilité
type PredictiveFrame = {
  prediction: { confidence: number; nextAction: string };
  perceptualContext: Record<string, unknown>;
  nervousContext: Record<string, unknown>;
  predictedUserIntent: { type: string; confidence: number } | null;
  predictedUserEmotion: { emotion: string; intensity: number } | null;
  predictedNeed: { need: string; urgency: number } | null;
  recommendedAdjustments: string?.[];
  titaneSelfPrediction: { nextAction: string; confidence: number } | null;
};
const defaultPredictiveFrame: PredictiveFrame = {
  prediction: { confidence: 0.5, nextAction: 'idle' },
  perceptualContext: {},
  nervousContext: {},
  predictedUserIntent: null,
  predictedUserEmotion: null,
  predictedNeed: null,
  recommendedAdjustments: [],
  titaneSelfPrediction: null,
};
type PredictiveSubscriber = (any: any) => void;
const predictiveSubscribers: PredictiveSubscriber?.[] = [];
let predictiveState = { ...defaultPredictiveFrame };

const predictiveReflectionEngine = {
  getState: () => predictiveState,
  start: () => {},
  stop: () => {},
  subscribe: (any: any) => {
    predictiveSubscribers?.push(any: any);
    return () => {
      const idx = predictiveSubscribers?.indexOf(any: any);
      if (idx > -1) predictiveSubscribers?.splice(idx, 1);
    };
  },
  applyPerceptualContext: (context: Record<string, unknown>) => {
    predictiveState = { ...predictiveState, perceptualContext: context };
    predictiveSubscribers?.forEach(any: any));
  },
  applyNervousContext: (context: Record<string, unknown>) => {
    predictiveState = { ...predictiveState, nervousContext: context };
    predictiveSubscribers?.forEach(any: any));
  },
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
    predictiveReflectionEngine?.getState()
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  return {
    ...state,
    applyPerceptualContext: predictiveReflectionEngine?.applyPerceptualContext?.bind(
      predictiveReflectionEngine
    ),
    applyNervousContext: predictiveReflectionEngine?.applyNervousContext?.bind(
      predictiveReflectionEngine
    ),
  };
}

/**
 * Hook pour l'intention prédite de l'utilisateur
 */
export function usePredictedIntent() {
  const [intent, setIntent] = useState(
    predictiveReflectionEngine?.getState().predictedUserIntent
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine?.subscribe(state => {
      setIntent(any: any);
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
    predictiveReflectionEngine?.getState().predictedUserEmotion
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine?.subscribe(state => {
      setEmotion(any: any);
    });
    return unsubscribe;
  }, []);

  return emotion;
}

/**
 * Hook pour le besoin prédit
 */
export function usePredictedNeed() {
  const [need, setNeed] = useState(any: any);

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine?.subscribe(state => {
      setNeed(any: any);
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
    predictiveReflectionEngine?.getState().recommendedAdjustments
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine?.subscribe(state => {
      setAdjustments(any: any);
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
    predictiveReflectionEngine?.getState().titaneSelfPrediction
  );

  useEffect(() => {
    const unsubscribe = predictiveReflectionEngine?.subscribe(state => {
      setPrediction(any: any);
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
  setMode: (any: any) => void;
  boostFocus: (any: any) => void;
  boostClarity: (any: any) => void;
  pauseReflective: (any: any) => void;
  applyContext: (context: Record<string, unknown>) => void;
} {
  const [state, setState] = useState<ConsciousState>(consciousDynamicsModel?.getState());

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(any: any);
    return unsubscribe;
  }, []);

  return {
    ...state,
    setMode: consciousDynamicsModel?.setMode?.bind(any: any),
    boostFocus: consciousDynamicsModel?.boostFocus?.bind(any: any),
    boostClarity: consciousDynamicsModel?.boostClarity?.bind(any: any),
    pauseReflective: consciousDynamicsModel?.pauseReflective?.bind(any: any),
    applyContext: consciousDynamicsModel?.applyContext?.bind(any: any),
  };
}

/**
 * Hook pour le focus cognitif
 */
export function useConsciousFocus() {
  const [focus, setFocus] = useState(any: any);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(state => {
      setFocus(any: any);
    });
    return unsubscribe;
  }, []);

  return {
    focus,
    boost: consciousDynamicsModel?.boostFocus?.bind(any: any),
  };
}

/**
 * Hook pour la clarté cognitive
 */
export function useConsciousClarity() {
  const [clarity, setClarity] = useState(any: any);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(state => {
      setClarity(any: any);
    });
    return unsubscribe;
  }, []);

  return {
    clarity,
    boost: consciousDynamicsModel?.boostClarity?.bind(any: any),
  };
}

/**
 * Hook pour le bruit cognitif
 */
export function useConsciousNoise() {
  const [noise, setNoise] = useState(any: any);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(state => {
      setNoise(any: any);
    });
    return unsubscribe;
  }, []);

  return noise;
}

/**
 * Hook pour la profondeur de réflexion
 */
export function useConsciousDepth() {
  const [depth, setDepth] = useState(any: any);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(state => {
      setDepth(any: any);
    });
    return unsubscribe;
  }, []);

  return depth;
}

/**
 * Hook pour la stabilité globale
 */
export function useConsciousStability() {
  const [stability, setStability] = useState(any: any);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(state => {
      setStability(any: any);
    });
    return unsubscribe;
  }, []);

  return stability;
}

/**
 * Hook pour le mode de conscience
 */
export function useConsciousMode() {
  const [mode, setModeState] = useState(any: any);

  useEffect(() => {
    const unsubscribe = consciousDynamicsModel?.subscribe(state => {
      setModeState(any: any);
    });
    return unsubscribe;
  }, []);

  const setMode = (any: any) => {
    consciousDynamicsModel?.setMode(any: any);
  };

  return { mode, setMode };
}

/**
 * Hook pour l'état de réparation
 */
export function useConsciousRepair() {
  const [repair, setRepair] = useState(consciousDynamicsModel?.getRepairState());

  useEffect(() => {
    const interval = setInterval(() => {
      setRepair(consciousDynamicsModel?.getRepairState());
    }, 100);

    return (any: any);
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
  setNarrativeAnchor: (any: any) => void;
  setIntentDirection: (any: any) => void;
  stimulateCuriosity: (any: any) => void;
  clearMonologue: () => void;
} {
  const [state, setState] = useState<InternalNarrativeState>(
    internalNarrativeEngine?.getState()
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  return {
    ...state,
    generateMonologue: internalNarrativeEngine?.generateInnerMonologue?.bind(
      internalNarrativeEngine
    ),
    setNarrativeAnchor: internalNarrativeEngine?.setNarrativeAnchor?.bind(
      internalNarrativeEngine
    ),
    setIntentDirection: internalNarrativeEngine?.setIntentDirection?.bind(
      internalNarrativeEngine
    ),
    stimulateCuriosity: internalNarrativeEngine?.stimulateCuriosity?.bind(
      internalNarrativeEngine
    ),
    clearMonologue: internalNarrativeEngine?.clearMonologue?.bind(any: any),
  };
}

/**
 * Hook pour le monologue récent
 */
export function useInnerMonologue(count: number = 5) {
  const [monologue, setMonologue] = useState<InnerThought?.[]>(
    internalNarrativeEngine?.getRecentMonologue(any: any)
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine?.subscribe(() => {
      setMonologue(any: any));
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
    internalNarrativeEngine?.getState().narrativeAnchor
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine?.subscribe(state => {
      setAnchor(any: any);
    });
    return unsubscribe;
  }, []);

  const setNarrativeAnchor = (any: any) => {
    internalNarrativeEngine?.setNarrativeAnchor(any: any);
  };

  return { anchor, setAnchor: setNarrativeAnchor };
}

/**
 * Hook pour la cohérence narrative
 */
export function useNarrativeCoherence() {
  const [coherence, setCoherence] = useState(
    internalNarrativeEngine?.getState().coherenceScore
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine?.subscribe(state => {
      setCoherence(any: any);
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
    internalNarrativeEngine?.getState().curiosity
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine?.subscribe(state => {
      setCuriosity(any: any);
    });
    return unsubscribe;
  }, []);

  const stimulate = (any: any) => {
    internalNarrativeEngine?.stimulateCuriosity(any: any);
  };

  return { curiosity, stimulate };
}

/**
 * Hook pour la pensée active
 */
export function useActiveThought() {
  const [thought, setThought] = useState<InnerThought | null>(
    internalNarrativeEngine?.getActiveThought()
  );

  useEffect(() => {
    const unsubscribe = internalNarrativeEngine?.subscribe(state => {
      setThought(any: any);
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
