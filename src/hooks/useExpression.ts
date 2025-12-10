/**
 * TITANE_INFINITY v∞.31-33 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   React Hooks pour Expression Engine (XXXI-XXXIII + Aura)
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
import { auraEngine, type AuraState } from '@/engines/aura/auraEngine';

// ═══════════════════════════════════════════════════════════════════════════
// SYNESTHETIC EMOTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour Synesthetic Emotion Engine
 */
export function useSynestheticEmotion() {
  const [state, setState] = useState<SynestheticEmotionState>(
    synestheticEmotionEngine.getState()
  );

  useEffect(() => {
    const unsubscribe = synestheticEmotionEngine.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    currentEmotion: state.current.emotion,
    intensity: state.current.intensity,
    profile: state.current,
    setEmotion: (emotion: EmotionalState, intensity?: number, duration?: number) =>
      synestheticEmotionEngine.setEmotion(emotion, intensity, 'stable', duration),
    syncWithUser: (userState: { emotion?: string; energy?: number; valence?: number }) =>
      synestheticEmotionEngine.syncWithUser(userState),
  };
}

/**
 * Hook pour profil synesthésique actuel
 */
export function useSynestheticProfile(): SynestheticProfile {
  const [profile, setProfile] = useState<SynestheticProfile>(
    synestheticEmotionEngine.getCurrentProfile()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(synestheticEmotionEngine.getCurrentProfile());
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, []);

  return profile;
}

/**
 * Hook pour couleur émotionnelle
 */
export function useEmotionalColor() {
  const profile = useSynestheticProfile();

  return {
    hue: profile.color.hue,
    saturation: profile.color.saturation,
    lightness: profile.color.lightness,
    name: profile.color.name,
    css: `hsl(${profile.color.hue}, ${profile.color.saturation}%, ${profile.color.lightness}%)`,
  };
}

/**
 * Hook pour profil vocal émotionnel
 */
export function useEmotionalVoice() {
  const profile = useSynestheticProfile();
  return profile.voice;
}

/**
 * Hook pour texture narrative
 */
export function useNarrativeTexture() {
  const profile = useSynestheticProfile();
  return profile.narrative;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED OUTPUT HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour Unified Multimodal Output Engine
 */
export function useUnifiedOutput() {
  const [state, setState] = useState<UnifiedOutputState>(
    unifiedMultimodalOutputEngine.getState()
  );
  const [lastOutput, setLastOutput] = useState<UnifiedMultimodalOutput | null>(null);

  useEffect(() => {
    const unsubscribe = unifiedMultimodalOutputEngine.subscribe(setLastOutput);

    const interval = setInterval(() => {
      setState(unifiedMultimodalOutputEngine.getState());
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    state,
    lastOutput,
    coherenceMetrics: state.coherenceMetrics,
    generateOutput: (context: { text?: string; duration?: number; intent?: string }) =>
      unifiedMultimodalOutputEngine.generateOutput(context),
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
  const [state, setState] = useState<AuraState>(auraEngine.getState());

  useEffect(() => {
    const unsubscribe = auraEngine.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    affective: state.affective,
    pattern: state.pattern,
    layers: state.layers,
    particles: state.particles,
    updateAudioLevel: (level: number) => auraEngine.updateAudioLevel(level),
    triggerInsight: () => auraEngine.triggerInsightFlash(),
    onWakeWord: () => auraEngine.onWakeWord(),
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
 * Hook pour couleur aura (CSS)
 */
export function useAuraColor() {
  const affective = useAffectiveVisual();

  return {
    hsl: affective.color,
    css: `hsl(${affective.color.hue}, ${affective.color.saturation}%, ${affective.color.lightness}%)`,
    intensity: affective.intensity,
    energy: affective.energy,
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
    emotion: emotion.state,
    currentEmotion: emotion.currentEmotion,
    emotionIntensity: emotion.intensity,
    setEmotion: emotion.setEmotion,
    syncWithUser: emotion.syncWithUser,

    // Output
    output: output.state,
    lastOutput: output.lastOutput,
    coherence: output.coherenceMetrics,
    generateOutput: output.generateOutput,

    // Aura
    aura: aura.state,
    auraColor: `hsl(${aura.affective.color.hue}, ${aura.affective.color.saturation}%, ${aura.affective.color.lightness}%)`,
    auraPattern: aura.pattern,
    updateAudio: aura.updateAudioLevel,
    triggerInsight: aura.triggerInsight,
  };
}
