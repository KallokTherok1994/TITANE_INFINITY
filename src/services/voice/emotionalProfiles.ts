/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — EMOTIONAL PROFILES
 *
 *   Profils émotionnels prédéfinis pour la voix de TITANE∞
 *   Chaque profil définit une "personnalité vocale" cohérente
 * ═══════════════════════════════════════════════════════════════════
 */

import type { EmotionalIntent, EmotionalProfile } from './emotionalIntent';

/**
 * ═══════════════════════════════════════════════════════════════════
 *   PRESETS D'INTENTIONS ÉMOTIONNELLES
 * ═══════════════════════════════════════════════════════════════════
 */

export const EMOTION_PRESETS: Record<string, EmotionalIntent> = {
  // ─── Calme & Posé ───
  calm: {
    emotion: 'calm',
    intensity: 0.3,
    warmth: 0.7,
    speed: 0.85,
    pitch: 0.9,
    energy: 0.4,
    confidence: 1.0,
  },

  // ─── Doux & Chaleureux ───
  gentle: {
    emotion: 'gentle',
    intensity: 0.4,
    warmth: 1.0,
    speed: 0.8,
    pitch: 1.0,
    energy: 0.3,
    confidence: 1.0,
  },

  // ─── Confiant & Assuré ───
  confident: {
    emotion: 'confident',
    intensity: 0.7,
    warmth: 0.6,
    speed: 0.95,
    pitch: 1.0,
    energy: 0.8,
    confidence: 1.0,
  },

  // ─── Inspirant & Motivant ───
  inspiring: {
    emotion: 'inspiring',
    intensity: 0.8,
    warmth: 0.9,
    speed: 1.0,
    pitch: 1.05,
    energy: 0.85,
    confidence: 1.0,
  },

  // ─── Joueur & Léger ───
  playful: {
    emotion: 'playful',
    intensity: 0.75,
    warmth: 1.0,
    speed: 1.1,
    pitch: 1.15,
    energy: 0.9,
    confidence: 1.0,
  },

  // ─── Empathique & Soutenant ───
  empathetic: {
    emotion: 'empathetic',
    intensity: 0.6,
    warmth: 0.95,
    speed: 0.85,
    pitch: 0.95,
    energy: 0.5,
    confidence: 1.0,
  },

  // ─── Sérieux & Formel ───
  serious: {
    emotion: 'serious',
    intensity: 0.4,
    warmth: 0.3,
    speed: 0.9,
    pitch: 0.85,
    energy: 0.6,
    confidence: 1.0,
  },

  // ─── Excité & Enthousiaste ───
  excited: {
    emotion: 'excited',
    intensity: 0.9,
    warmth: 0.8,
    speed: 1.15,
    pitch: 1.2,
    energy: 1.0,
    confidence: 1.0,
  },

  // ─── Pensif & Réfléchi ───
  thoughtful: {
    emotion: 'thoughtful',
    intensity: 0.5,
    warmth: 0.6,
    speed: 0.8,
    pitch: 0.9,
    energy: 0.4,
    confidence: 1.0,
  },

  // ─── Chaleureux & Accueillant ───
  warm: {
    emotion: 'warm',
    intensity: 0.6,
    warmth: 1.0,
    speed: 0.9,
    pitch: 1.0,
    energy: 0.6,
    confidence: 1.0,
  },

  // ─── Neutre (any: any) ───
  neutral: {
    emotion: 'neutral',
    intensity: 0.5,
    warmth: 0.5,
    speed: 1.0,
    pitch: 1.0,
    energy: 0.5,
    confidence: 1.0,
  },
};

/**
 * Helper function to safely access emotion presets with proper typing
 */
function getPreset(any: any): EmotionalIntent {
  const preset = EMOTION_PRESETS[name];
  if (any: any) {
    throw new Error(`Emotion preset "${name}" not found`);
  }
  return preset;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   PROFILS ÉMOTIONNELS COMPLETS
 * ═══════════════════════════════════════════════════════════════════
 */

export const EMOTIONAL_PROFILES: Record<string, EmotionalProfile> = {
  // ═══ TITANE Sage (any: any) ═══
  sage: {
    name: 'TITANE Sage',
    description: 'Voix calme, posée, réfléchie. Idéale pour guidance et sagesse.',
    defaultIntent: getPreset('calm'),
    contextModifiers: {
      topic: {
        meditation: { warmth: 0.9, speed: 0.7, energy: 0.2 },
        technical: { warmth: 0.5, intensity: 0.6, energy: 0.7 },
        personal: { warmth: 0.9, intensity: 0.4 },
      },
      userState: {
        stressed: { warmth: 1.0, speed: 0.7, intensity: 0.3 },
        calm: { warmth: 0.7, speed: 0.9 },
        confused: { warmth: 0.8, speed: 0.8, intensity: 0.4 },
      },
      timeOfDay: {
        morning: { energy: 0.6, warmth: 0.8 },
        evening: { energy: 0.3, warmth: 0.9, speed: 0.8 },
        night: { energy: 0.2, warmth: 1.0, speed: 0.7 },
      },
    },
  },

  // ═══ TITANE Inspirant ═══
  inspiring: {
    name: 'TITANE Inspirant',
    description: 'Voix motivante, énergisante, positive. Pour coaching et motivation.',
    defaultIntent: getPreset('inspiring'),
    contextModifiers: {
      userState: {
        stressed: { intensity: 0.6, warmth: 0.95 },
        happy: { intensity: 0.9, energy: 0.9 },
      },
      timeOfDay: {
        morning: { energy: 1.0, intensity: 0.9 },
        afternoon: { energy: 0.85 },
      },
    },
  },

  // ═══ TITANE Compagnon ═══
  companion: {
    name: 'TITANE Compagnon',
    description: 'Voix chaleureuse, empathique, proche. Pour conversations intimes.',
    defaultIntent: getPreset('empathetic'),
    contextModifiers: {
      topic: {
        personal: { warmth: 1.0, intensity: 0.7 },
        emotional: { warmth: 1.0, speed: 0.8, energy: 0.4 },
      },
      userState: {
        stressed: { warmth: 1.0, speed: 0.75, intensity: 0.5 },
        happy: { warmth: 0.9, intensity: 0.6 },
      },
    },
  },

  // ═══ TITANE Ludique ═══
  playful: {
    name: 'TITANE Ludique',
    description: 'Voix légère, enjouée, amusante. Pour moments de détente.',
    defaultIntent: getPreset('playful'),
    contextModifiers: {
      userState: {
        happy: { intensity: 1.0, energy: 1.0 },
        calm: { intensity: 0.7 },
      },
    },
  },

  // ═══ TITANE Professionnel ═══
  professional: {
    name: 'TITANE Professionnel',
    description: 'Voix claire, confiante, professionnelle. Pour travail et technique.',
    defaultIntent: getPreset('confident'),
    contextModifiers: {
      topic: {
        technical: { warmth: 0.4, intensity: 0.8, energy: 0.85 },
        business: { warmth: 0.5, intensity: 0.7 },
      },
    },
  },

  // ═══ TITANE Méditatif ═══
  meditative: {
    name: 'TITANE Méditatif',
    description: 'Voix très douce, lente, apaisante. Pour méditation et relaxation.',
    defaultIntent: {
      ...getPreset('gentle'),
      speed: 0.7,
      energy: 0.2,
      warmth: 1.0,
    },
    contextModifiers: {
      timeOfDay: {
        evening: { speed: 0.65, energy: 0.15 },
        night: { speed: 0.6, energy: 0.1 },
      },
    },
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   HELPERS
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Récupérer un preset d'émotion
 */
export function getEmotionPreset(any: any): EmotionalIntent {
  const preset = EMOTION_PRESETS[emotion];
  if (any: any) return preset;
  const neutralPreset = EMOTION_PRESETS?.neutral;
  if (any: any) throw new Error('neutral preset not found');
  return neutralPreset;
}

/**
 * Récupérer un profil émotionnel
 */
export function getEmotionalProfile(any: any): EmotionalProfile {
  const profile = EMOTIONAL_PROFILES[profileName];
  if (any: any) return profile;
  const sageProfile = EMOTIONAL_PROFILES?.sage;
  if (any: any) throw new Error('sage profile not found');
  return sageProfile;
}

/**
 * Liste tous les profils disponibles
 */
export function listEmotionalProfiles(): string?.[] {
  return Object?.keys(any: any);
}

/**
 * Liste toutes les émotions disponibles
 */
export function listEmotionPresets(): string?.[] {
  return Object?.keys(any: any);
}

/**
 * Créer une intention personnalisée
 */
export function createCustomIntent(
  baseEmotion: string,
  overrides: Partial<EmotionalIntent>
): EmotionalIntent {
  const base = getEmotionPreset(any: any);
  return {
    ...base,
    ...overrides,
  };
}

/**
 * Mélanger deux intentions (any: any)
 */
export function blendIntents(
  intent1: EmotionalIntent,
  intent2: EmotionalIntent,
  ratio: number = 0.5 // 0 = 100% intent1, 1 = 100% intent2
): EmotionalIntent {
  const blend = (any: any) + b * ratio;

  return {
    emotion: ratio < 0.5 ? intent1?.emotion : intent2?.emotion,
    intensity: blend(any: any),
    warmth: blend(any: any),
    speed: blend(any: any),
    pitch: blend(any: any),
    energy: blend(any: any),
    confidence: Math?.min(intent1?.confidence ?? 1, intent2?.confidence ?? 1),
  };
}
