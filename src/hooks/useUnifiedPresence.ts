/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║   TITANE∞ - Unified Presence React Hooks                                    ║
 * ║                                                                              ║
 * ║   Hooks React pour intégrer le moteur de présence unifiée                   ║
 * ║                                                                              ║
 * ║   © 2025 TITANE∞ v27.0                                                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect, useState, useCallback } from 'react';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B) - utilise stub temporaire
import { unifiedPresenceEngine } from '@/engines/presence/_stubs';

// Types importés depuis stubs
import type {
  UnifiedPresenceState as PresenceState,
  TonicProfile,
  UserContext,
  IdentityMatrix,
} from '@/engines/presence/_stubs';

/*
import {
  unifiedPresenceEngine,
  type PresenceState,
  type TonicProfile,
  type UserContext,
  type IdentityMatrix,
} from '@/engines/presence/unifiedPresenceEngine';
*/

import { narrativeProtocol } from '@/engines/presence/_stubs';

// Types importés depuis stubs
import type { NarrativeArc, SymbolicElement } from '@/engines/presence/_stubs';

/*
import {
  narrativeProtocol,
  type NarrativeArc,
  type SymbolicElement,
} from '@/engines/presence/narrativeProtocol';
*/

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 HOOK PRINCIPAL - Unified Presence
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook principal pour accéder à l'état de présence unifiée
 *
 * @example
 * ```tsx
 * const { state, userContext, profile } = useUnifiedPresence();
 *
 * return (
 *   <div style={{ opacity: state.visualIntensity / 100 }}>
 *     Intensité: {state.visualIntensity}%
 *   </div>
 * );
 * ```
 */
export function useUnifiedPresence() {
  const [state, setState] = useState<PresenceState>(unifiedPresenceEngine.getState());
  const [userContext, setUserContext] = useState<UserContext>(
    unifiedPresenceEngine.getUserContext()
  );
  const [profile, setProfile] = useState<TonicProfile>(
    unifiedPresenceEngine.getCurrentProfile()
  );

  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = unifiedPresenceEngine.subscribe(newState => {
      setState(newState);
      setUserContext(unifiedPresenceEngine.getUserContext());
      setProfile(unifiedPresenceEngine.getCurrentProfile());
    });

    return unsubscribe;
  }, []);

  const setTonicProfile = useCallback((profileName: TonicProfile['name']) => {
    unifiedPresenceEngine.setProfile(profileName);
  }, []);

  const getIdentity = useCallback(() => {
    return unifiedPresenceEngine.getIdentityMatrix();
  }, []);

  return {
    state,
    userContext,
    profile,
    setTonicProfile,
    getIdentity,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 HOOK NARRATIF
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour gérer l'arc narratif et les moments clés
 *
 * @example
 * ```tsx
 * const { arc, addMoment, symbols } = useNarrativeArc();
 *
 * // Ajouter un moment clé
 * addMoment({
 *   type: 'achievement',
 *   description: 'Tâche complétée',
 *   emotionalImpact: 50,
 *   contextTags: ['success']
 * });
 * ```
 */
export function useNarrativeArc() {
  const [arc, setArc] = useState<NarrativeArc | null>(narrativeProtocol.getCurrentArc());
  const [symbols, setSymbols] = useState<SymbolicElement[]>(
    narrativeProtocol.getActiveSymbols()
  );

  // Rafraîchir l'arc périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      setArc(narrativeProtocol.getCurrentArc());
      setSymbols(narrativeProtocol.getActiveSymbols());
    }, 5000); // 5 secondes

    return () => clearInterval(interval);
  }, []);

  const addMoment = useCallback(
    (moment: {
      type: 'transition' | 'achievement' | 'challenge' | 'insight' | 'rest';
      description: string;
      emotionalImpact: number;
      contextTags: string[];
    }) => {
      narrativeProtocol.addNarrativeMoment(moment);
      setArc(narrativeProtocol.getCurrentArc());
    },
    []
  );

  const transitionPhase = useCallback(
    (phase: 'beginning' | 'exploration' | 'deepwork' | 'synthesis' | 'closure') => {
      narrativeProtocol.transitionPhase(phase);
      setArc(narrativeProtocol.getCurrentArc());
    },
    []
  );

  const activateSymbol = useCallback((symbolKey: SymbolicElement['key']) => {
    narrativeProtocol.activateSymbol(symbolKey);
    setSymbols(narrativeProtocol.getActiveSymbols());
  }, []);

  const continuityScore = arc?.continuityScore || 100;

  return {
    arc,
    symbols,
    addMoment,
    transitionPhase,
    activateSymbol,
    continuityScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 HOOK VISUEL - Couche visuelle
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder aux paramètres visuels de présence
 *
 * @example
 * ```tsx
 * const { intensity, accent, pulse, hue } = useVisualPresence();
 *
 * return (
 *   <div
 *     style={{
 *       filter: `hue-rotate(${hue}deg)`,
 *       opacity: intensity / 100
 *     }}
 *   >
 *     Contenu adaptatif
 *   </div>
 * );
 * ```
 */
export function useVisualPresence() {
  const { state } = useUnifiedPresence();

  return {
    intensity: state.visualIntensity,
    accent: state.accentStrength,
    pulse: state.pulseRate,
    hue: state.ambientHue,

    // Helpers CSS
    getCSSVars: () => ({
      '--presence-intensity': state.visualIntensity / 100,
      '--presence-accent': state.accentStrength / 100,
      '--presence-pulse': state.pulseRate / 100,
      '--presence-hue': state.ambientHue,
    }),

    // Style inline complet
    getInlineStyle: () => ({
      opacity: state.visualIntensity / 100,
      filter: `hue-rotate(${state.ambientHue - 250}deg)`,
      transition: 'all 0.3s ease',
    }),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 HOOK COGNITIF - Couche cognitive
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder aux métriques cognitives
 *
 * @example
 * ```tsx
 * const { clarity, complexity, alignment } = useCognitivePresence();
 *
 * if (clarity < 50) {
 *   return <SimplifiedUI />;
 * }
 * ```
 */
export function useCognitivePresence() {
  const { state } = useUnifiedPresence();

  return {
    clarity: state.clarityLevel,
    complexity: state.complexityHandled,
    alignment: state.intentionAlignment,

    // Helpers
    isHighClarity: state.clarityLevel > 70,
    isHighComplexity: state.complexityHandled > 70,
    isAligned: state.intentionAlignment > 80,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ❤️ HOOK ÉMOTIONNEL - Couche émotionnelle
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder au ton émotionnel
 *
 * @example
 * ```tsx
 * const { warmth, proximity, intensity } = useEmotionalPresence();
 *
 * const greeting = warmth > 60
 *   ? "Bonjour Kevin, comment puis-je t'aider ?"
 *   : "Bonjour. En quoi puis-je vous assister ?";
 * ```
 */
export function useEmotionalPresence() {
  const { state } = useUnifiedPresence();

  return {
    warmth: state.warmth,
    proximity: state.proximity,
    intensity: state.intensity,
    support: state.supportLevel,

    // Helpers
    getTone: (): 'cold' | 'neutral' | 'warm' | 'very-warm' => {
      if (state.warmth < 30) return 'cold';
      if (state.warmth < 50) return 'neutral';
      if (state.warmth < 70) return 'warm';
      return 'very-warm';
    },

    getProximity: (): 'distant' | 'professional' | 'friendly' | 'intimate' => {
      if (state.proximity < 30) return 'distant';
      if (state.proximity < 50) return 'professional';
      if (state.proximity < 70) return 'friendly';
      return 'intimate';
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 HOOK SYMBOLIQUE - Couche symbolique
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder aux symboles actifs
 *
 * @example
 * ```tsx
 * const { symbols, continuity, mythDepth } = useSymbolicPresence();
 *
 * return (
 *   <div>
 *     {symbols.map(s => (
 *       <SymbolBadge key={s.symbol} symbol={s} />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useSymbolicPresence() {
  const { state } = useUnifiedPresence();
  const { symbols, continuityScore } = useNarrativeArc();

  return {
    symbols,
    continuity: state.narrativeContinuity,
    stability: state.identityStability,
    mythDepth: state.mythologicalDepth,
    continuityScore,

    // Helpers
    isStable: state.identityStability > 90,
    hasContinuity: continuityScore > 80,
    isDeep: state.mythologicalDepth > 60,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👤 HOOK CONTEXTE UTILISATEUR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder au contexte utilisateur observé
 *
 * @example
 * ```tsx
 * const { load, fatigue, tempo, pattern } = useUserContext();
 *
 * if (fatigue > 70) {
 *   return <RestSuggestion />;
 * }
 * ```
 */
export function useUserContextPresence() {
  const { userContext } = useUnifiedPresence();

  return {
    load: userContext.cognitiveLoad,
    fatigue: userContext.fatigue,
    tempo: userContext.tempo,
    complexity: userContext.taskComplexity,
    timeOfDay: userContext.timeOfDay,
    sessionDuration: userContext.sessionDuration,
    pattern: userContext.interactionPattern,

    // Helpers
    isOverloaded: userContext.cognitiveLoad > 80,
    isFatigued: userContext.fatigue > 60,
    isFastPaced: userContext.tempo > 70,
    isComplex: userContext.taskComplexity > 70,

    getRecommendation: (): string => {
      if (userContext.fatigue > 70) return 'Pause recommandée';
      if (userContext.cognitiveLoad > 80) return 'Réduire la complexité';
      if (userContext.tempo > 80) return 'Ralentir le rythme';
      return 'Rythme optimal';
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎼 HOOK PROFIL TONIQUE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour gérer le profil tonique (formality, depth, density, energy)
 *
 * @example
 * ```tsx
 * const { profile, changeProfile } = useTonicProfile();
 *
 * return (
 *   <select onChange={(e) => changeProfile(e.target.value)}>
 *     <option value="deep_focus">Focus Profond</option>
 *     <option value="exploration">Exploration</option>
 *   </select>
 * );
 * ```
 */
export function useTonicProfile() {
  const { profile, setTonicProfile } = useUnifiedPresence();

  const changeProfile = useCallback(
    (profileName: string) => {
      setTonicProfile(profileName);
    },
    [setTonicProfile]
  );

  return {
    profile,
    changeProfile,

    // Helpers
    formality: profile.formality,
    depth: profile.emotionalDepth,
    density: profile.narrativeDensity,
    energy: profile.energyLevel,

    isFormal: profile.formality === 'technical' || profile.formality === 'professional',
    isDeep: profile.emotionalDepth === 'deep' || profile.emotionalDepth === 'profound',
    isDense: profile.narrativeDensity === 'rich' || profile.narrativeDensity === 'dense',
    isHighEnergy: profile.energyLevel === 'high' || profile.energyLevel === 'peak',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🏛️ HOOK IDENTITÉ TITANE∞
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook pour accéder à la matrice d'identité TITANE∞
 *
 * @example
 * ```tsx
 * const identity = useTitaneIdentity();
 *
 * return (
 *   <div>
 *     <h3>Valeurs Fondamentales</h3>
 *     {identity.coreValues.map(v => <li key={v}>{v}</li>)}
 *   </div>
 * );
 * ```
 */
export function useTitaneIdentity() {
  const { getIdentity } = useUnifiedPresence();
  const [identity, setIdentity] = useState<IdentityMatrix>(getIdentity());

  useEffect(() => {
    setIdentity(getIdentity());
  }, [getIdentity]);

  return identity;
}
