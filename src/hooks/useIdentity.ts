/**
 * TITANE_INFINITY v∞.36 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   REACT HOOKS FOR UNIFIED IDENTITY KERNEL v∞.36
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  unifiedIdentityKernel,
  type IdentityKernelState,
  type IdentitySignature,
  type CognitiveProfile,
  type EmotiveResonance,
  type AttentionState,
  type AdaptiveIdentityState,
  type IdentityExpressionPackage,
  type ContextFrame,
} from '../engines/identity/unifiedIdentityKernel';

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAT COMPLET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal: État complet du kernel
 */
export function useIdentityKernel(): IdentityKernelState {
  const [state, setState] = useState<IdentityKernelState>(
    unifiedIdentityKernel.getState()
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(newState => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return state;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE IDENTITAIRE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Signature identitaire
 */
export function useIdentitySignature(): IdentitySignature {
  const [signature, setSignature] = useState<IdentitySignature>(
    unifiedIdentityKernel.getSignature()
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setSignature(state.identitySignature);
    });
    return unsubscribe;
  }, []);

  return signature;
}

/**
 * Hook: Tone identitaire (0..1)
 */
export function useIdentityTone(): number {
  const [tone, setTone] = useState<number>(unifiedIdentityKernel.getSignature().tone);

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setTone(state.identitySignature.tone);
    });
    return unsubscribe;
  }, []);

  return tone;
}

/**
 * Hook: Énergie identitaire (0..1)
 */
export function useIdentityEnergy(): number {
  const [energy, setEnergy] = useState<number>(
    unifiedIdentityKernel.getSignature().energy
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setEnergy(state.identitySignature.energy);
    });
    return unsubscribe;
  }, []);

  return energy;
}

/**
 * Hook: Chaleur identitaire (0..1)
 */
export function useIdentityWarmth(): number {
  const [warmth, setWarmth] = useState<number>(
    unifiedIdentityKernel.getSignature().warmth
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setWarmth(state.identitySignature.warmth);
    });
    return unsubscribe;
  }, []);

  return warmth;
}

/**
 * Hook: Clarté identitaire (0..1)
 */
export function useIdentityClarity(): number {
  const [clarity, setClarity] = useState<number>(
    unifiedIdentityKernel.getSignature().clarity
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setClarity(state.identitySignature.clarity);
    });
    return unsubscribe;
  }, []);

  return clarity;
}

/**
 * Hook: Style narratif
 */
export function useNarrativeStyle(): string {
  const [style, setStyle] = useState<string>(
    unifiedIdentityKernel.getSignature().narrativeStyle
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setStyle(state.identitySignature.narrativeStyle);
    });
    return unsubscribe;
  }, []);

  return style;
}

/**
 * Hook: Posture cognitive
 */
export function useCognitivePosture(): string {
  const [posture, setPosture] = useState<string>(
    unifiedIdentityKernel.getSignature().cognitivePosture
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setPosture(state.identitySignature.cognitivePosture);
    });
    return unsubscribe;
  }, []);

  return posture;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL COGNITIF
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Profil cognitif complet
 */
export function useCognitiveProfile(): CognitiveProfile {
  const [profile, setProfile] = useState<CognitiveProfile>(
    unifiedIdentityKernel.getState().cognitiveProfile
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setProfile(state.cognitiveProfile);
    });
    return unsubscribe;
  }, []);

  return profile;
}

/**
 * Hook: Vitesse cognitive (0..1)
 */
export function useCognitiveSpeed(): number {
  const [speed, setSpeed] = useState<number>(
    unifiedIdentityKernel.getState().cognitiveProfile.speed
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setSpeed(state.cognitiveProfile.speed);
    });
    return unsubscribe;
  }, []);

  return speed;
}

/**
 * Hook: Profondeur cognitive (0..1)
 */
export function useCognitiveDepth(): number {
  const [depth, setDepth] = useState<number>(
    unifiedIdentityKernel.getState().cognitiveProfile.depth
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setDepth(state.cognitiveProfile.depth);
    });
    return unsubscribe;
  }, []);

  return depth;
}

/**
 * Hook: Précision cognitive (0..1)
 */
export function useCognitivePrecision(): number {
  const [precision, setPrecision] = useState<number>(
    unifiedIdentityKernel.getState().cognitiveProfile.precision
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setPrecision(state.cognitiveProfile.precision);
    });
    return unsubscribe;
  }, []);

  return precision;
}

// ═══════════════════════════════════════════════════════════════════════════
// RÉSONANCE ÉMOTIVE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Résonance émotive complète
 */
export function useEmotiveResonance(): EmotiveResonance {
  const [resonance, setResonance] = useState<EmotiveResonance>(
    unifiedIdentityKernel.getState().emotiveResonance
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setResonance(state.emotiveResonance);
    });
    return unsubscribe;
  }, []);

  return resonance;
}

/**
 * Hook: Intensité émotive (0..1)
 */
export function useEmotiveIntensity(): number {
  const [intensity, setIntensity] = useState<number>(
    unifiedIdentityKernel.getState().emotiveResonance.intensity
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setIntensity(state.emotiveResonance.intensity);
    });
    return unsubscribe;
  }, []);

  return intensity;
}

/**
 * Hook: Chaleur vocale (0..1)
 */
export function useVocalWarmth(): number {
  const [warmth, setWarmth] = useState<number>(
    unifiedIdentityKernel.getState().emotiveResonance.vocalWarmth
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setWarmth(state.emotiveResonance.vocalWarmth);
    });
    return unsubscribe;
  }, []);

  return warmth;
}

/**
 * Hook: Réactivité du halo (0..1)
 */
export function useHaloReactivity(): number {
  const [reactivity, setReactivity] = useState<number>(
    unifiedIdentityKernel.getState().emotiveResonance.haloReactivity
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setReactivity(state.emotiveResonance.haloReactivity);
    });
    return unsubscribe;
  }, []);

  return reactivity;
}

// ═══════════════════════════════════════════════════════════════════════════
// ATTENTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: État d'attention complet
 */
export function useAttentionState(): AttentionState {
  const [attention, setAttention] = useState<AttentionState>(
    unifiedIdentityKernel.getState().attention
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setAttention(state.attention);
    });
    return unsubscribe;
  }, []);

  return attention;
}

/**
 * Hook: Focus attentionnel (0..1)
 */
export function useAttentionFocus(): number {
  const [focus, setFocus] = useState<number>(
    unifiedIdentityKernel.getState().attention.focus
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setFocus(state.attention.focus);
    });
    return unsubscribe;
  }, []);

  return focus;
}

/**
 * Hook: Charge cognitive (0..1)
 */
export function useCognitiveLoad(): number {
  const [load, setLoad] = useState<number>(
    unifiedIdentityKernel.getState().attention.cognitiveLoad
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setLoad(state.attention.cognitiveLoad);
    });
    return unsubscribe;
  }, []);

  return load;
}

/**
 * Hook: Priorités attentionnelles
 */
export function useAttentionPriorities(): string[] {
  const [priorities, setPriorities] = useState<string[]>(
    unifiedIdentityKernel.getState().attention.priorities
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setPriorities(state.attention.priorities);
    });
    return unsubscribe;
  }, []);

  return priorities;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADAPTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: État adaptatif complet
 */
export function useAdaptiveState(): AdaptiveIdentityState {
  const [adaptive, setAdaptive] = useState<AdaptiveIdentityState>(
    unifiedIdentityKernel.getState().adaptation
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setAdaptive(state.adaptation);
    });
    return unsubscribe;
  }, []);

  return adaptive;
}

/**
 * Hook: Sensibilité au contexte (0..1)
 */
export function useContextSensitivity(): number {
  const [sensitivity, setSensitivity] = useState<number>(
    unifiedIdentityKernel.getState().adaptation.contextSensitivity
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setSensitivity(state.adaptation.contextSensitivity);
    });
    return unsubscribe;
  }, []);

  return sensitivity;
}

/**
 * Hook: Alignement utilisateur (0..1)
 */
export function useUserAlignment(): number {
  const [alignment, setAlignment] = useState<number>(
    unifiedIdentityKernel.getState().adaptation.userAlignment
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setAlignment(state.adaptation.userAlignment);
    });
    return unsubscribe;
  }, []);

  return alignment;
}

// ═══════════════════════════════════════════════════════════════════════════
// MÉTRIQUES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Cohérence globale (0..1)
 */
export function useGlobalCoherence(): number {
  const [coherence, setCoherence] = useState<number>(
    unifiedIdentityKernel.getCoherence()
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setCoherence(state.globalCoherence);
    });
    return unsubscribe;
  }, []);

  return coherence;
}

/**
 * Hook: Stabilité identitaire (0..1)
 */
export function useIdentityStability(): number {
  const [stability, setStability] = useState<number>(
    unifiedIdentityKernel.getStability()
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(state => {
      setStability(state.identityStability);
    });
    return unsubscribe;
  }, []);

  return stability;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT POUR OUTPUT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Package d'expression complet
 */
export function useIdentityExpression(): IdentityExpressionPackage {
  const [expression, setExpression] = useState<IdentityExpressionPackage>(
    unifiedIdentityKernel.exportToOutput()
  );

  useEffect(() => {
    const unsubscribe = unifiedIdentityKernel.subscribe(() => {
      setExpression(unifiedIdentityKernel.exportToOutput());
    });
    return unsubscribe;
  }, []);

  return expression;
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Actions disponibles
 */
export function useIdentityActions() {
  return {
    /**
     * Mettre à jour depuis contexte
     */
    updateFromContext: (context: ContextFrame) => {
      unifiedIdentityKernel.updateFromContext(context);
    },

    /**
     * Aligner avant réponse
     */
    alignBeforeResponse: () => {
      unifiedIdentityKernel.alignBeforeResponse();
    },

    /**
     * Forcer une valeur identitaire
     */
    setIdentityValue: (key: keyof IdentitySignature, value: unknown) => {
      unifiedIdentityKernel.setIdentityValue(key, value);
    },
  };
}
