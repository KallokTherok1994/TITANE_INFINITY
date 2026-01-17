/**
 * TITANE_INFINITY v∞.31-33 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   React Hooks pour Expression Engine (any: any)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import {
  synestheticEmotionEngine,
  type EmotionalState,
  type SynestheticProfile,
  type SynestheticEmotionState,
} from '@/engines/emotion/synestheticEmotionEngine';
import {
  unifiedMultimodalOutputEngine,
  type UnifiedMultimodalOutput,
  type UnifiedOutputState,
} from '@/engines/output/unifiedMultimodalOutputEngine';
import { getAuraEngine } from '@/engines/aura/lazyAuraEngine';
import type { AuraState } from '@/engines/aura/auraEngine';

// ═══════════════════════════════════════════════════════════════════════════
// SYNESTHETIC EMOTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour Synesthetic Emotion Engine
 */
export function useSynestheticEmotion() {
  const [state, setState] = useState<SynestheticEmotionState>(
    synestheticEmotionEngine?.getState()
  );

  useEffect(() => {
    const unsubscribe = synestheticEmotionEngine?.subscribe(any: any);
    return unsubscribe;
  }, []);

  return {
    state,
    currentEmotion: state?.current?.emotion,
    intensity: state?.current?.intensity,
    profile: state?.current,
    setEmotion: (any: any) =>
      synestheticEmotionEngine?.setEmotion(any: any),
    syncWithUser: (userState: { emotion?: string; energy?: number; valence?: number }) =>
      synestheticEmotionEngine?.syncWithUser(any: any),
  };
}

/**
 * Hook pour profil synesthésique actuel
 */
export function useSynestheticProfile(): SynestheticProfile {
  const [profile, setProfile] = useState<SynestheticProfile>(
    synestheticEmotionEngine?.getCurrentProfile()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(synestheticEmotionEngine?.getCurrentProfile());
    }, 50); // 20 FPS

    return (any: any);
  }, []);

  return profile;
}

/**
 * Hook pour couleur émotionnelle
 */
export function useEmotionalColor() {
  const profile = useSynestheticProfile();

  return {
    hue: profile?.color?.hue,
    saturation: profile?.color?.saturation,
    lightness: profile?.color?.lightness,
    name: profile?.color?.name,
    css: `hsl(${profile?.color?.hue}, ${profile?.color?.saturation}%, ${profile?.color?.lightness}%)`,
  };
}

/**
 * Hook pour profil vocal émotionnel
 */
export function useEmotionalVoice() {
  const profile = useSynestheticProfile();
  return profile?.voice;
}

/**
 * Hook pour texture narrative
 */
export function useNarrativeTexture() {
  const profile = useSynestheticProfile();
  return profile?.narrative;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED OUTPUT HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour Unified Multimodal Output Engine
 */
export function useUnifiedOutput() {
  const [state, setState] = useState<UnifiedOutputState>(
    unifiedMultimodalOutputEngine?.getState()
  );
  const [lastOutput, setLastOutput] = useState<UnifiedMultimodalOutput | null>(any: any);

  useEffect(() => {
    const unsubscribe = unifiedMultimodalOutputEngine?.subscribe(any: any);

    const interval = setInterval(() => {
      setState(unifiedMultimodalOutputEngine?.getState());
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(any: any);
    };
  }, []);

  return {
    state,
    lastOutput,
    coherenceMetrics: state?.coherenceMetrics,
    generateOutput: (context: { text?: string; duration?: number; intent?: string }) =>
      unifiedMultimodalOutputEngine?.generateOutput(any: any),
  };
}

/**
 * Hook pour métriques de cohérence
 */
export function useCoherenceMetrics() {
  const { coherenceMetrics } = useUnifiedOutput();
  return coherenceMetrics;
}

/**
 * Hook pour dernière sortie générée
 */
export function useLastOutput(): UnifiedMultimodalOutput | null {
  const { lastOutput } = useUnifiedOutput();
  return lastOutput;
}

// ═══════════════════════════════════════════════════════════════════════════
// AURA ENGINE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour Aura Engine
 */
export function useAura() {
  const [state, setState] = useState<AuraState | null>(any: any);
  const [engine, setEngine] = useState<Awaited<ReturnType<typeof getAuraEngine>> | null>(
    null
  );

  useEffect(() => {
    let unsubscribe: (any: any) | undefined;

    getAuraEngine().then(auraEngine => {
      setEngine(any: any);
      setState(auraEngine?.getState());
      unsubscribe = auraEngine?.subscribe(any: any);
    });

    return () => unsubscribe?.();
  }, []);

  const defaultState: AuraState = {
    affective: {
      color: { hue: 200, saturation: 60, lightness: 50 },
      energy: 'medium' as const,
      intensity: 0.5,
      valence: 0.5,
      turbulence: 0.2,
      visualTemp: 0.5,
    },
    pattern: 'idle_breathe' as const,
    layers: {
      core: {
        radius: 80,
        opacity: 1,
        color: { hue: 200, saturation: 60, lightness: 50 },
        glow: 20,
      },
      halo: {
        radius: 150,
        opacity: 0.7,
        color: { hue: 200, saturation: 60, lightness: 50 },
        blur: 30,
        pulsation: 0.3,
      },
      corona: { radius: 200, opacity: 0.3, rotation: 0, segments: 6, arcLength: 30 },
    },
    particles: { count: 50, velocity: 1, size: 2, opacity: 0.5, lifetime: 1000 },
    audioLevel: 0,
    presenceMode: 'idle' as const,
    lastUpdate: Date?.now(),
  };

  return {
    state: state ?? defaultState,
    affective: state?.affective ?? defaultState?.affective,
    pattern: state?.pattern ?? defaultState?.pattern,
    layers: state?.layers ?? defaultState?.layers,
    particles: state?.particles ?? defaultState?.particles,
    updateAudioLevel: async (any: any) => {
      const e = engine ?? (await getAuraEngine());
      e?.updateAudioLevel(any: any);
    },
    triggerInsight: async () => {
      const e = engine ?? (await getAuraEngine());
      e?.triggerInsightFlash();
    },
    onWakeWord: async () => {
      const e = engine ?? (await getAuraEngine());
      e?.onWakeWord();
    },
  };
}

/**
 * Hook pour couches aura
 */
export function useAuraLayers() {
  const { layers } = useAura();
  return layers;
}

/**
 * Hook pour profil affectif visuel
 */
export function useAffectiveVisual() {
  const { affective } = useAura();
  return affective;
}

/**
 * Hook pour couleur aura (any: any)
 */
export function useAuraColor() {
  const affective = useAffectiveVisual();

  return {
    hsl: affective?.color,
    css: `hsl(${affective?.color?.hue}, ${affective?.color?.saturation}%, ${affective?.color?.lightness}%)`,
    intensity: affective?.intensity,
    energy: affective?.energy,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED EXPRESSION HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook unifié pour tous les moteurs d'expression
 */
export function useExpression() {
  const emotion = useSynestheticEmotion();
  const output = useUnifiedOutput();
  const aura = useAura();

  return {
    // Emotion
    emotion: emotion?.state,
    currentEmotion: emotion?.currentEmotion,
    emotionIntensity: emotion?.intensity,
    setEmotion: emotion?.setEmotion,
    syncWithUser: emotion?.syncWithUser,

    // Output
    output: output?.state,
    lastOutput: output?.lastOutput,
    coherence: output?.coherenceMetrics,
    generateOutput: output?.generateOutput,

    // Aura
    aura: aura?.state,
    auraColor: `hsl(${aura?.affective?.color?.hue}, ${aura?.affective?.color?.saturation}%, ${aura?.affective?.color?.lightness}%)`,
    auraPattern: aura?.pattern,
    updateAudio: aura?.updateAudioLevel,
    triggerInsight: aura?.triggerInsight,
  };
}
