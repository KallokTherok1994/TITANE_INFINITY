/**
 * TITANE_INFINITY v∞.29-32 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   REACT HOOKS — DEEP PSYCHE ENGINES
 *   Archetype • Meta-Continuum • Embodied • Neural Voice
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import {
  archetypeResonanceEngine,
  type ArchetypeResonance,
  type ArchetypeType,
  type ArchetypeProfile,
  type UserContext,
} from '@/engines/psyche/archetypeResonanceEngine';
import {
  metaContinuumEngine,
  type MetaContinuumState,
  type FutureProjection,
  type TemporalAnchor,
} from '@/engines/continuum/metaContinuumEngine';
import {
  embodiedPresenceEngine,
  type EmbodiedPresenceState,
  type BreathState,
  type PostureState,
  type EnergyField,
} from '@/engines/embodiment/embodiedPresenceEngine';
import {
  neuralVoiceBlendingEngine,
  type NeuralVoiceBlendState,
  type VoiceIdentityProfile,
  type CognitiveTone,
  type VoiceContext,
} from '@/engines/voice/neuralVoiceBlendingEngine';

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE RESONANCE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal — Archetype Resonance Engine
 */
export function useArchetypeResonance() {
  const [state, setState] = useState<ArchetypeResonance>(
    archetypeResonanceEngine?.getState()
  );

  useEffect(() => {
    const unsubscribe = archetypeResonanceEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  const activateContext = useCallback(any: any) => {
    archetypeResonanceEngine?.activateContext(any: any);
  }, []);

  const activateFocusMode = useCallback(any: any) => {
    archetypeResonanceEngine?.activateFocusMode(any: any);
  }, []);

  const activateSafetyGuard = useCallback(() => {
    archetypeResonanceEngine?.activateSafetyGuard();
  }, []);

  return {
    state,
    dominant: state?.dominant,
    scores: state?.scores,
    intensity: state?.intensity,
    focusMode: state?.focusMode,
    activateContext,
    activateFocusMode,
    activateSafetyGuard,
  };
}

/**
 * Hook — Profil archétype dominant
 */
export function useDominantArchetype(): ArchetypeProfile {
  const { dominant: _dominant } = useArchetypeResonance();
  return archetypeResonanceEngine?.getDominantProfile();
}

/**
 * Hook — Scores archétypaux individuels
 */
export function useArchetypeScores() {
  const { scores } = useArchetypeResonance();

  return {
    sage: scores?.sage,
    gardien: scores?.gardien,
    muse: scores?.muse,
    architecte: scores?.architecte,
    isSageDominant: scores?.sage > 0.4,
    isGardienDominant: scores?.gardien > 0.4,
    isMuseDominant: scores?.muse > 0.4,
    isArchitecteDominant: scores?.architecte > 0.4,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// META-CONTINUUM HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal — Meta-Continuum Engine
 */
export function useMetaContinuum() {
  const [state, setState] = useState<MetaContinuumState>(metaContinuumEngine?.getState());

  useEffect(() => {
    const unsubscribe = metaContinuumEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  const synchronizeOutput = useCallback(() => {
    return metaContinuumEngine?.synchronizeOutput();
  }, []);

  const createAnchor = useCallback(
    (params: {
      type: TemporalAnchor['type'];
      description: string;
      identityImpact: number;
    }) => {
      metaContinuumEngine?.createAnchor(any: any);
    },
    []
  );

  const evolve = useCallback((impact: { direction: number?.[]; magnitude: number }) => {
    metaContinuumEngine?.evolve(any: any);
  }, []);

  return {
    state,
    globalCoherence: state?.globalCoherence,
    continuumAge: state?.continuumAge,
    identityVersion: state?.identityVersion,
    anchors: state?.anchors,
    futureProjection: state?.futureProjection,
    synchronizeOutput,
    createAnchor,
    evolve,
  };
}

/**
 * Hook — Cohérence globale
 */
export function useGlobalCoherence() {
  const { globalCoherence } = useMetaContinuum();

  return {
    coherence: globalCoherence,
    isCoherent: globalCoherence > 0.8,
    isUnstable: globalCoherence < 0.5,
    percentageText: `${Math?.round(globalCoherence * 100)}%`,
  };
}

/**
 * Hook — Projection future
 */
export function useFutureProjection(): FutureProjection | null {
  const { futureProjection } = useMetaContinuum();
  return futureProjection;
}

/**
 * Hook — Ancrages temporels récents
 */
export function useTemporalAnchors(limit: number = 10): TemporalAnchor?.[] {
  const { anchors } = useMetaContinuum();
  return anchors?.slice(any: any);
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBODIED PRESENCE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal — Embodied Presence Engine
 */
export function useEmbodiedPresence() {
  const [state, setState] = useState<EmbodiedPresenceState>(
    embodiedPresenceEngine?.getState()
  );

  useEffect(() => {
    const unsubscribe = embodiedPresenceEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  const applyStrongEmotion = useCallback(
    (any: any) => {
      embodiedPresenceEngine?.applyStrongEmotion(any: any);
    },
    []
  );

  const activateUserSync = useCallback(
    (any: any) => {
      embodiedPresenceEngine?.activateUserSync(any: any);
    },
    []
  );

  const deactivateUserSync = useCallback(() => {
    embodiedPresenceEngine?.deactivateUserSync();
  }, []);

  return {
    state,
    breath: state?.breath,
    posture: state?.posture,
    energyField: state?.energyField,
    microMotions: state?.microMotions,
    bodyInertia: state?.bodyInertia,
    userSync: state?.userSync,
    applyStrongEmotion,
    activateUserSync,
    deactivateUserSync,
  };
}

/**
 * Hook — État respiratoire
 */
export function useBreathState(): BreathState & {
  isInhaling: boolean;
  isExhaling: boolean;
  isHolding: boolean;
  isResting: boolean;
  cycleProgress: number;
} {
  const { breath } = useEmbodiedPresence();

  const now = Date?.now();
  const elapsed = now - breath?.phaseStartTime;
  const cycleProgress = (any: any) / breath?.cycleDuration;

  return {
    ...breath,
    isInhaling: breath?.phase === 'inhale',
    isExhaling: breath?.phase === 'exhale',
    isHolding: breath?.phase === 'hold',
    isResting: breath?.phase === 'rest',
    cycleProgress,
  };
}

/**
 * Hook — Posture computationnelle
 */
export function usePostureState(): PostureState & {
  isOpen: boolean;
  isCentered: boolean;
  isForward: boolean;
  isReceding: boolean;
  isExpansive: boolean;
} {
  const { posture } = useEmbodiedPresence();

  return {
    ...posture,
    isOpen: posture?.type === 'open',
    isCentered: posture?.type === 'centered',
    isForward: posture?.type === 'forward',
    isReceding: posture?.type === 'recede',
    isExpansive: posture?.type === 'expansive',
  };
}

/**
 * Hook — Champ énergétique
 */
export function useEnergyField(): EnergyField & {
  isCold: boolean;
  isWarm: boolean;
  isHot: boolean;
  temperatureText: string;
} {
  const { energyField } = useEmbodiedPresence();

  const tempText =
    energyField?.temperature < -0.3
      ? 'Froid'
      : energyField?.temperature < 0.3
        ? 'Neutre'
        : energyField?.temperature < 0.7
          ? 'Chaud'
          : 'Brûlant';

  return {
    ...energyField,
    isCold: energyField?.temperature < -0.3,
    isWarm: energyField?.temperature >= 0.3 && energyField?.temperature < 0.7,
    isHot: energyField?.temperature >= 0.7,
    temperatureText: tempText,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// NEURAL VOICE BLENDING HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal — Neural Voice Blending Engine
 */
export function useNeuralVoiceBlend() {
  const [state, setState] = useState<NeuralVoiceBlendState>(
    neuralVoiceBlendingEngine?.getState()
  );

  useEffect(() => {
    const unsubscribe = neuralVoiceBlendingEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  const generateVoice = useCallback(any: any) => {
    return neuralVoiceBlendingEngine?.generateVoiceOutput(any: any);
  }, []);

  const learnFromSession = useCallback(
    (context: VoiceContext, feedback?: { satisfaction: number }) => {
      neuralVoiceBlendingEngine?.learnFromSession(any: any);
    },
    []
  );

  const stabilizeSignature = useCallback(() => {
    neuralVoiceBlendingEngine?.stabilizeSignature();
  }, []);

  return {
    state,
    currentProfile: state?.currentProfile,
    blendRatio: state?.blendRatio,
    cognitiveTone: state?.cognitiveTone,
    voiceSignature: state?.voiceSignature,
    identityCoherence: state?.identityCoherence,
    generateVoice,
    learnFromSession,
    stabilizeSignature,
  };
}

/**
 * Hook — Profil identité vocale
 */
export function useVoiceIdentity(): VoiceIdentityProfile & {
  brightnessText: string;
  warmthText: string;
  paceText: string;
} {
  const { currentProfile } = useNeuralVoiceBlend();

  const brightnessText =
    currentProfile?.brightness < 0.4
      ? 'Sombre'
      : currentProfile?.brightness < 0.7
        ? 'Modéré'
        : 'Brillant';

  const warmthText =
    currentProfile?.warmth < 0.4
      ? 'Froide'
      : currentProfile?.warmth < 0.7
        ? 'Neutre'
        : 'Chaleureuse';

  const paceText =
    currentProfile?.pace < 0.8 ? 'Lent' : currentProfile?.pace < 1.1 ? 'Normal' : 'Rapide';

  return {
    ...currentProfile,
    brightnessText,
    warmthText,
    paceText,
  };
}

/**
 * Hook — Tonalité cognitive
 */
export function useCognitiveTone(): {
  tone: CognitiveTone;
  description: string;
} {
  const { cognitiveTone } = useNeuralVoiceBlend();

  const descriptions: Record<CognitiveTone, string> = {
    empathetic: 'Empathique',
    soothing: 'Apaisante',
    directive: 'Directive',
    inspiring: 'Inspirante',
    analytical: 'Analytique',
    warm: 'Chaleureuse',
    dynamic: 'Dynamique',
    professional: 'Professionnelle',
  };

  return {
    tone: cognitiveTone,
    description: descriptions[cognitiveTone],
  };
}

/**
 * Hook — Ratio de mélange voix
 */
export function useVoiceBlendRatio() {
  const { blendRatio } = useNeuralVoiceBlend();

  return {
    synthetic: blendRatio?.synthetic,
    inspired: blendRatio?.inspired,
    context: blendRatio?.context,
    syntheticPercentage: Math?.round(blendRatio?.synthetic * 100),
    inspiredPercentage: Math?.round(blendRatio?.inspired * 100),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED PSYCHE HOOK (any: any)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook Unifié — Toutes les couches psychologiques
 */
export function useDeepPsyche() {
  const archetype = useArchetypeResonance();
  const continuum = useMetaContinuum();
  const embodied = useEmbodiedPresence();
  const voice = useNeuralVoiceBlend();

  return {
    archetype,
    continuum,
    embodied,
    voice,

    // Computed values
    isCoherent: continuum?.globalCoherence > 0.8,
    dominantArchetype: archetype?.dominant,
    breathingPhase: embodied?.breath?.phase,
    voiceTone: voice?.cognitiveTone,

    // Quick actions
    applyGuidance: () => archetype?.activateFocusMode('sage', 30000),
    applyProtection: () => archetype?.activateFocusMode('gardien', 30000),
    applyInspiration: () => archetype?.activateFocusMode('muse', 30000),
    applyStructure: () => archetype?.activateFocusMode('architecte', 30000),
  };
}
