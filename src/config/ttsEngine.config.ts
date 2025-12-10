/**
 * TITANE∞ vΩ∞ — CONFIGURATION TTS ENGINE
 * Super Prompt #4: Configuration ElevenLabs avancée
 *
 * B. Source de vérité pour:
 *    - Voix Rachel (FvmvwvObRqIHojkEGh5N)
 *    - 10 émotions avec paramètres
 *    - Configuration queue et cache
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  TTSEngineConfig,
  VoiceConfig,
  VoiceId,
  TTSModel,
  AudioFormat,
  TTSEmotion,
  EmotionIntensity,
  EmotionConfig,
  TTSPriority,
} from '@/types/ttsEngine';

// ============================================================================
// CONSTANTES PRINCIPALES
// ============================================================================

/**
 * ID de voix Rachel - Voix principale TITANE
 */
export const TITANE_VOICE_ID: VoiceId = 'FvmvwvObRqIHojkEGh5N';

/**
 * Modèle par défaut
 */
export const DEFAULT_TTS_MODEL: TTSModel = 'eleven_multilingual_v2';

/**
 * Format audio par défaut
 */
export const DEFAULT_AUDIO_FORMAT: AudioFormat = 'mp3_44100_128';

// ============================================================================
// CONFIGURATION GLOBALE
// ============================================================================

export const TTS_ENGINE_CONFIG: TTSEngineConfig = {
  // API ElevenLabs
  apiEndpoint: 'https://api.elevenlabs.io/v1',

  // Voix par défaut
  defaultVoiceId: TITANE_VOICE_ID,
  defaultModel: DEFAULT_TTS_MODEL,
  defaultFormat: DEFAULT_AUDIO_FORMAT,

  // Paramètres vocaux par défaut
  defaultStability: 0.5,
  defaultSimilarityBoost: 0.75,
  defaultStyle: 0.4,

  // Queue
  maxQueueSize: 50,
  maxRetries: 3,
  retryDelayMs: 1000,

  // Cache
  cacheEnabled: true,
  maxCacheEntries: 200,
  maxCacheSizeBytes: 100 * 1024 * 1024, // 100 MB
  cacheTTLMs: 24 * 60 * 60 * 1000, // 24h

  // Limites
  maxTextLength: 5000,
  rateLimitPerMinute: 30,

  // Audio
  preloadNextInQueue: true,
  crossfadeDurationMs: 100,
};

// ============================================================================
// CONFIGURATION VOIX RACHEL
// ============================================================================

export const RACHEL_VOICE_CONFIG: VoiceConfig = {
  id: TITANE_VOICE_ID,
  name: 'Rachel',
  description: 'Voix française naturelle et expressive - Voix principale TITANE∞',

  // Paramètres optimisés
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.4,
  useSpeakerBoost: true,

  // Préférences
  preferredEmotion: 'neutral',
  languageCode: 'fr-FR',
};

/**
 * Voix alternatives disponibles
 */
export const ALTERNATIVE_VOICES: Record<string, VoiceConfig> = {
  adam: {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Adam',
    description: 'Voix masculine profonde',
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.3,
    useSpeakerBoost: true,
    languageCode: 'fr-FR',
  },
  bella: {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    description: 'Voix féminine douce',
    stability: 0.6,
    similarityBoost: 0.7,
    style: 0.5,
    useSpeakerBoost: true,
    languageCode: 'fr-FR',
  },
};

// ============================================================================
// CONFIGURATION DES 10 ÉMOTIONS
// ============================================================================

/**
 * Configuration complète des 10 émotions TTS
 * Chaque émotion modifie les paramètres vocaux pour un rendu naturel
 */
export const EMOTION_CONFIGS: Record<
  TTSEmotion,
  Record<EmotionIntensity, EmotionConfig>
> = {
  neutral: {
    subtle: {
      emotion: 'neutral',
      intensity: 'subtle',
      stabilityModifier: 0,
      clarityModifier: 0,
      styleModifier: 0,
    },
    moderate: {
      emotion: 'neutral',
      intensity: 'moderate',
      stabilityModifier: 0,
      clarityModifier: 0,
      styleModifier: 0,
    },
    strong: {
      emotion: 'neutral',
      intensity: 'strong',
      stabilityModifier: 0.05,
      clarityModifier: 0.05,
      styleModifier: 0,
    },
  },

  joyful: {
    subtle: {
      emotion: 'joyful',
      intensity: 'subtle',
      stabilityModifier: -0.05,
      clarityModifier: 0.05,
      styleModifier: 0.1,
    },
    moderate: {
      emotion: 'joyful',
      intensity: 'moderate',
      stabilityModifier: -0.1,
      clarityModifier: 0.1,
      styleModifier: 0.2,
    },
    strong: {
      emotion: 'joyful',
      intensity: 'strong',
      stabilityModifier: -0.15,
      clarityModifier: 0.15,
      styleModifier: 0.3,
    },
  },

  empathetic: {
    subtle: {
      emotion: 'empathetic',
      intensity: 'subtle',
      stabilityModifier: 0.1,
      clarityModifier: -0.05,
      styleModifier: 0.05,
    },
    moderate: {
      emotion: 'empathetic',
      intensity: 'moderate',
      stabilityModifier: 0.15,
      clarityModifier: -0.1,
      styleModifier: 0.1,
    },
    strong: {
      emotion: 'empathetic',
      intensity: 'strong',
      stabilityModifier: 0.2,
      clarityModifier: -0.15,
      styleModifier: 0.15,
    },
  },

  serious: {
    subtle: {
      emotion: 'serious',
      intensity: 'subtle',
      stabilityModifier: 0.1,
      clarityModifier: 0.1,
      styleModifier: -0.1,
    },
    moderate: {
      emotion: 'serious',
      intensity: 'moderate',
      stabilityModifier: 0.15,
      clarityModifier: 0.15,
      styleModifier: -0.15,
    },
    strong: {
      emotion: 'serious',
      intensity: 'strong',
      stabilityModifier: 0.2,
      clarityModifier: 0.2,
      styleModifier: -0.2,
    },
  },

  curious: {
    subtle: {
      emotion: 'curious',
      intensity: 'subtle',
      stabilityModifier: -0.05,
      clarityModifier: 0.05,
      styleModifier: 0.1,
    },
    moderate: {
      emotion: 'curious',
      intensity: 'moderate',
      stabilityModifier: -0.1,
      clarityModifier: 0.1,
      styleModifier: 0.15,
    },
    strong: {
      emotion: 'curious',
      intensity: 'strong',
      stabilityModifier: -0.15,
      clarityModifier: 0.1,
      styleModifier: 0.2,
    },
  },

  confident: {
    subtle: {
      emotion: 'confident',
      intensity: 'subtle',
      stabilityModifier: 0.05,
      clarityModifier: 0.1,
      styleModifier: 0.05,
    },
    moderate: {
      emotion: 'confident',
      intensity: 'moderate',
      stabilityModifier: 0.1,
      clarityModifier: 0.15,
      styleModifier: 0.1,
    },
    strong: {
      emotion: 'confident',
      intensity: 'strong',
      stabilityModifier: 0.15,
      clarityModifier: 0.2,
      styleModifier: 0.15,
    },
  },

  calm: {
    subtle: {
      emotion: 'calm',
      intensity: 'subtle',
      stabilityModifier: 0.15,
      clarityModifier: -0.05,
      styleModifier: -0.1,
    },
    moderate: {
      emotion: 'calm',
      intensity: 'moderate',
      stabilityModifier: 0.2,
      clarityModifier: -0.1,
      styleModifier: -0.15,
    },
    strong: {
      emotion: 'calm',
      intensity: 'strong',
      stabilityModifier: 0.25,
      clarityModifier: -0.15,
      styleModifier: -0.2,
    },
  },

  urgent: {
    subtle: {
      emotion: 'urgent',
      intensity: 'subtle',
      stabilityModifier: -0.1,
      clarityModifier: 0.15,
      styleModifier: 0.1,
    },
    moderate: {
      emotion: 'urgent',
      intensity: 'moderate',
      stabilityModifier: -0.15,
      clarityModifier: 0.2,
      styleModifier: 0.15,
    },
    strong: {
      emotion: 'urgent',
      intensity: 'strong',
      stabilityModifier: -0.2,
      clarityModifier: 0.25,
      styleModifier: 0.2,
    },
  },

  playful: {
    subtle: {
      emotion: 'playful',
      intensity: 'subtle',
      stabilityModifier: -0.1,
      clarityModifier: 0,
      styleModifier: 0.15,
    },
    moderate: {
      emotion: 'playful',
      intensity: 'moderate',
      stabilityModifier: -0.15,
      clarityModifier: 0,
      styleModifier: 0.25,
    },
    strong: {
      emotion: 'playful',
      intensity: 'strong',
      stabilityModifier: -0.2,
      clarityModifier: 0.05,
      styleModifier: 0.3,
    },
  },

  thoughtful: {
    subtle: {
      emotion: 'thoughtful',
      intensity: 'subtle',
      stabilityModifier: 0.1,
      clarityModifier: 0,
      styleModifier: 0,
    },
    moderate: {
      emotion: 'thoughtful',
      intensity: 'moderate',
      stabilityModifier: 0.15,
      clarityModifier: -0.05,
      styleModifier: 0.05,
    },
    strong: {
      emotion: 'thoughtful',
      intensity: 'strong',
      stabilityModifier: 0.2,
      clarityModifier: -0.1,
      styleModifier: 0.1,
    },
  },
};

/**
 * Labels et icônes des émotions pour l'UI
 */
export const EMOTION_UI: Record<
  TTSEmotion,
  { label: string; icon: string; color: string }
> = {
  neutral: { label: 'Neutre', icon: '😐', color: '#808080' },
  joyful: { label: 'Joyeux', icon: '😊', color: '#FFD700' },
  empathetic: { label: 'Empathique', icon: '🤗', color: '#FF69B4' },
  serious: { label: 'Sérieux', icon: '😐', color: '#4A5568' },
  curious: { label: 'Curieux', icon: '🤔', color: '#9F7AEA' },
  confident: { label: 'Confiant', icon: '😎', color: '#48BB78' },
  calm: { label: 'Calme', icon: '😌', color: '#63B3ED' },
  urgent: { label: 'Urgent', icon: '⚡', color: '#F56565' },
  playful: { label: 'Joueur', icon: '😜', color: '#ED8936' },
  thoughtful: { label: 'Réfléchi', icon: '🧐', color: '#667EEA' },
};

// ============================================================================
// PRIORITÉS ET TIMING
// ============================================================================

/**
 * Configuration des priorités de queue
 */
export const PRIORITY_CONFIG: Record<
  TTSPriority,
  {
    weight: number;
    timeout: number;
    skipable: boolean;
  }
> = {
  low: {
    weight: 1,
    timeout: 30000,
    skipable: true,
  },
  normal: {
    weight: 5,
    timeout: 15000,
    skipable: true,
  },
  high: {
    weight: 10,
    timeout: 10000,
    skipable: false,
  },
  immediate: {
    weight: 100,
    timeout: 5000,
    skipable: false,
  },
};

// ============================================================================
// COMMANDES TAURI
// ============================================================================

export const TTS_COMMANDS = {
  speak: 'tts_speak',
  stop: 'tts_stop',
  pause: 'tts_pause',
  resume: 'tts_resume',
  setVolume: 'tts_set_volume',
  setRate: 'tts_set_rate',
  getVoices: 'tts_get_voices',
  getStatus: 'tts_get_status',
  testVoice: 'tts_test_voice',
  clearCache: 'tts_clear_cache',
  getMetrics: 'tts_get_metrics',
  isSpeaking: 'is_speaking',
} as const;

// ============================================================================
// TEXTES DE TEST
// ============================================================================

export const TEST_PHRASES: Record<TTSEmotion, string> = {
  neutral: 'Bonjour, je suis Rachel, votre assistante vocale TITANE.',
  joyful: "Quelle excellente nouvelle ! Je suis ravie de vous aider aujourd'hui !",
  empathetic: 'Je comprends parfaitement ce que vous ressentez. Je suis là pour vous.',
  serious: "C'est une situation importante qui nécessite toute notre attention.",
  curious: "Hmm, c'est vraiment intéressant... Pouvez-vous m'en dire plus ?",
  confident: 'Absolument, je connais parfaitement la réponse à votre question.',
  calm: 'Prenez votre temps, respirez profondément. Tout va bien se passer.',
  urgent: "Attention ! C'est urgent et requiert une action immédiate !",
  playful: "Ha ha ! Vous avez le sens de l'humour, j'adore ça !",
  thoughtful: "Laissez-moi réfléchir un instant... C'est une question profonde.",
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtient la configuration d'émotion
 */
export function getEmotionConfig(
  emotion: TTSEmotion = 'neutral',
  intensity: EmotionIntensity = 'moderate'
): EmotionConfig {
  return EMOTION_CONFIGS[emotion][intensity];
}

/**
 * Calcule les paramètres vocaux finaux avec émotion
 */
export function calculateVoiceParams(
  baseConfig: VoiceConfig,
  emotion?: EmotionConfig
): { stability: number; similarityBoost: number; style: number } {
  if (!emotion) {
    return {
      stability: baseConfig.stability,
      similarityBoost: baseConfig.similarityBoost,
      style: baseConfig.style,
    };
  }

  return {
    stability: clamp(baseConfig.stability + emotion.stabilityModifier, 0, 1),
    similarityBoost: clamp(baseConfig.similarityBoost + emotion.clarityModifier, 0, 1),
    style: clamp(baseConfig.style + emotion.styleModifier, 0, 1),
  };
}

/**
 * Génère une clé de cache pour un texte + config
 */
export function generateCacheKey(
  text: string,
  voiceId: VoiceId,
  emotion?: TTSEmotion
): string {
  const hash = simpleHash(`${text}|${voiceId}|${emotion || 'neutral'}`);
  return `tts_${hash}`;
}

/**
 * Estime la durée d'un texte en ms
 */
export function estimateDuration(text: string, rate: number = 1.0): number {
  // ~150 mots/minute en français
  const words = text.split(/\s+/).length;
  const baseMs = (words / 150) * 60 * 1000;
  return Math.round(baseMs / rate);
}

/**
 * Vérifie si un texte peut être synthétisé
 */
export function validateText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Texte vide' };
  }

  if (text.length > TTS_ENGINE_CONFIG.maxTextLength) {
    return {
      valid: false,
      error: `Texte trop long (max ${TTS_ENGINE_CONFIG.maxTextLength} caractères)`,
    };
  }

  return { valid: true };
}

// ============================================================================
// UTILS INTERNES
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
