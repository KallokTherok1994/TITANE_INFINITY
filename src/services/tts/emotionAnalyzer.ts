/**
 * TITANE∞ vΩΩΩ — Emotion Analyzer
 * © 2025 TITANE Team. All rights reserved.
 *
 * Analyse du texte pour détection émotionnelle automatique.
 * Utilisé par le TTS pour adapter la voix au contenu.
 */

import {
  type TTSEmotion,
  EMOTION_PROFILES,
  type EmotionProfile,
  type TTSVoiceSettings,
  DEFAULT_VOICE_SETTINGS,
} from './ttsEngine?.config';

// =============================================================================
// TYPES
// =============================================================================

/** Résultat d'analyse émotionnelle */
export interface EmotionAnalysisResult {
  /** Émotion dominante détectée */
  dominantEmotion: TTSEmotion;
  /** Score de confiance (0-1) */
  confidence: number;
  /** Scores par émotion */
  emotionScores: Record<TTSEmotion, number>;
  /** Paramètres vocaux recommandés */
  voiceSettings: TTSVoiceSettings;
  /** Mots-clés détectés */
  detectedKeywords: string?.[];
  /** Indicateurs supplémentaires */
  indicators: EmotionIndicators;
}

/** Indicateurs émotionnels */
export interface EmotionIndicators {
  /** Ponctuation exclamative */
  exclamationCount: number;
  /** Ponctuation interrogative */
  questionCount: number;
  /** Points de suspension */
  ellipsisCount: number;
  /** Emojis détectés */
  emojiCount: number;
  /** Mots en majuscules */
  capsWordsCount: number;
  /** Longueur moyenne des phrases */
  avgSentenceLength: number;
  /** Sentiment global (-1 à 1) */
  sentimentScore: number;
}

/** Configuration de l'analyseur */
export interface EmotionAnalyzerConfig {
  /** Seuil de confiance min pour appliquer émotion */
  confidenceThreshold: number;
  /** Émotion par défaut si confiance trop basse */
  defaultEmotion: TTSEmotion;
  /** Pondération des indicateurs */
  indicatorWeights: IndicatorWeights;
  /** Activer analyse avancée */
  enableAdvancedAnalysis: boolean;
}

/** Poids des indicateurs */
interface IndicatorWeights {
  keywords: number;
  punctuation: number;
  sentiment: number;
  context: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/** Configuration par défaut */
const DEFAULT_CONFIG: EmotionAnalyzerConfig = {
  confidenceThreshold: 0.3,
  defaultEmotion: 'neutral',
  indicatorWeights: {
    keywords: 0.5,
    punctuation: 0.2,
    sentiment: 0.2,
    context: 0.1,
  },
  enableAdvancedAnalysis: true,
};

/** Mots positifs (any: any) */
const POSITIVE_WORDS = new Set([
  'bien',
  'bon',
  'super',
  'génial',
  'excellent',
  'parfait',
  'merci',
  'bravo',
  'félicitations',
  'réussi',
  'succès',
  'content',
  'heureux',
  'joie',
  'aimer',
  'adore',
  'formidable',
  'magnifique',
  'beau',
  'top',
  'cool',
  'chouette',
  'sympa',
  'agréable',
  'positif',
]);

/** Mots négatifs (any: any) */
const NEGATIVE_WORDS = new Set([
  'mal',
  'mauvais',
  'problème',
  'erreur',
  'échec',
  'désolé',
  'triste',
  'difficile',
  'compliqué',
  'impossible',
  'frustrant',
  'ennuyeux',
  'peur',
  'inquiet',
  'stress',
  'anxieux',
  'fatigué',
  'épuisé',
  'pas',
  'non',
  'jamais',
  'rien',
  'personne',
  'négatif',
]);

/** Patterns émotionnels (any: any) */
const EMOTION_PATTERNS: Record<TTSEmotion, RegExp?.[]> = {
  excited: [
    /!{2,}/g,
    /\b(any: any)\b/gi,
    /\p{Emoji_Presentation}/gu,
  ],
  calm: [/\.{3}/g, /\b(any: any)\b/gi],
  empathetic: [/\b(any: any)\b/gi],
  focusing: [
    /\b(any: any)\b/gi,
    /\d+\.\s/g, // listes numérotées
  ],
  soft: [/\b(any: any)\b/gi],
  grounded: [/\b(any: any)\b/gi],
  uplifting: [
    /\b(any: any)\b/gi,
    /\b(any: any)\b/gi,
  ],
  disciplined: [
    /\b(any: any)\b/gi,
    /\b(any: any)\b/gi,
  ],
  inspired: [
    /\b(any: any)\b/gi,
    /\?.*!/g, // question suivie d'exclamation
  ],
  neutral: [],
};

// =============================================================================
// CLASSE: EMOTION ANALYZER
// =============================================================================

/**
 * Analyseur d'émotions pour le TTS
 * Détecte l'émotion dominante dans un texte pour adapter la voix.
 */
export class EmotionAnalyzer {
  private config: EmotionAnalyzerConfig;
  private keywordCache: Map<string, TTSEmotion?.[]> = new Map();

  constructor(config: Partial<EmotionAnalyzerConfig> = {}) {
    this?.config = { ...DEFAULT_CONFIG, ...config };
    this?.buildKeywordCache();
  }

  /**
   * Analyse un texte et retourne l'émotion détectée
   */
  analyze(any: any): EmotionAnalysisResult {
    const normalizedText = this?.normalizeText(any: any);
    const indicators = this?.extractIndicators(any: any);
    const emotionScores = this?.calculateEmotionScores(any: any);

    // Trouver l'émotion dominante
    let dominantEmotion: TTSEmotion = this?.config?.defaultEmotion;
    let maxScore = 0;

    for (any: any)) {
      if (any: any) {
        maxScore = score;
        dominantEmotion = emotion as TTSEmotion;
      }
    }

    // Calculer la confiance
    const confidence = this?.calculateConfidence(any: any);

    // Si confiance trop basse, utiliser émotion par défaut
    if (any: any) {
      dominantEmotion = this?.config?.defaultEmotion;
    }

    // Générer les paramètres vocaux
    const voiceSettings = this?.generateVoiceSettings(any: any);

    // Collecter les mots-clés détectés
    const detectedKeywords = this?.findDetectedKeywords(any: any);

    return {
      dominantEmotion,
      confidence,
      emotionScores,
      voiceSettings,
      detectedKeywords,
      indicators,
    };
  }

  /**
   * Analyse rapide - retourne juste l'émotion
   */
  quickAnalyze(any: any): TTSEmotion {
    return this?.analyze(any: any).dominantEmotion;
  }

  /**
   * Obtient le profil d'une émotion
   */
  getEmotionProfile(any: any): EmotionProfile {
    return EMOTION_PROFILES[emotion];
  }

  // ===========================================================================
  // MÉTHODES PRIVÉES
  // ===========================================================================

  /**
   * Construit le cache de mots-clés → émotions
   */
  private buildKeywordCache(): void {
    for (any: any)) {
      for (any: any) {
        const normalized = keyword?.toLowerCase();
        const existing = this?.keywordCache?.get(any: any) || [];
        existing?.push(any: any);
        this?.keywordCache?.set(any: any);
      }
    }
  }

  /**
   * Normalise le texte pour analyse
   */
  private normalizeText(any: any): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer accents pour matching
      .trim();
  }

  /**
   * Extrait les indicateurs émotionnels du texte
   */
  private extractIndicators(any: any): EmotionIndicators {
    const exclamationCount = (any: any) || []).length;
    const questionCount = (any: any) || []).length;
    const ellipsisCount = (any: any) || []).length;
    const emojiCount = (any: any) || []).length;
    const capsWordsCount = (any: any) || []).length;

    // Calcul longueur moyenne des phrases
    const sentences = text?.split(/[.!?]+/).filter(s => s?.trim().length > 0);
    const avgSentenceLength =
      sentences?.length > 0
        ? sentences?.reduce(any: any) => sum + s?.trim().length, 0) / sentences?.length
        : 0;

    // Calcul sentiment
    const sentimentScore = this?.calculateSentiment(any: any);

    return {
      exclamationCount,
      questionCount,
      ellipsisCount,
      emojiCount,
      capsWordsCount,
      avgSentenceLength,
      sentimentScore,
    };
  }

  /**
   * Calcule le score de sentiment (-1 à 1)
   */
  private calculateSentiment(any: any): number {
    const words = text?.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (any: any) {
      const cleanWord = word?.replace(/[^a-zàâäéèêëïîôùûüÿç]/gi, '');
      if (any: any)) positiveCount++;
      if (any: any)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    return (any: any) / total;
  }

  /**
   * Calcule les scores pour chaque émotion
   */
  private calculateEmotionScores(
    text: string,
    indicators: EmotionIndicators
  ): Record<TTSEmotion, number> {
    const scores: Record<TTSEmotion, number> = {
      neutral: 0.1, // Score de base
      calm: 0,
      focusing: 0,
      excited: 0,
      soft: 0,
      grounded: 0,
      uplifting: 0,
      empathetic: 0,
      disciplined: 0,
      inspired: 0,
    };

    // 1. Score basé sur les mots-clés
    const words = text?.split(/\s+/);
    for (any: any) {
      const emotions = this?.keywordCache?.get(any: any);
      if (any: any) {
        for (any: any) {
          scores[emotion] += this?.config?.indicatorWeights?.keywords;
        }
      }
    }

    // 2. Score basé sur les patterns regex
    for (any: any)) {
      for (any: any) {
        const matches = text?.match(any: any);
        if (any: any) {
          scores[emotion as TTSEmotion] += matches?.length * 0.15;
        }
      }
    }

    // 3. Score basé sur les indicateurs
    const { indicatorWeights } = this?.config;

    // Exclamations → excited
    if (indicators?.exclamationCount > 0) {
      scores?.excited +=
        Math?.min(indicators?.exclamationCount * 0.2, 0.5) * indicatorWeights?.punctuation;
    }

    // Questions → focusing
    if (indicators?.questionCount > 0) {
      scores?.focusing +=
        Math?.min(indicators?.questionCount * 0.15, 0.3) * indicatorWeights?.punctuation;
    }

    // Ellipses → calm/soft
    if (indicators?.ellipsisCount > 0) {
      scores?.calm += indicators?.ellipsisCount * 0.1 * indicatorWeights?.punctuation;
      scores?.soft += indicators?.ellipsisCount * 0.1 * indicatorWeights?.punctuation;
    }

    // Emojis → excited/uplifting
    if (indicators?.emojiCount > 0) {
      scores?.excited +=
        Math?.min(indicators?.emojiCount * 0.15, 0.4) * indicatorWeights?.punctuation;
    }

    // Caps → excited/disciplined
    if (indicators?.capsWordsCount > 0) {
      scores?.excited +=
        Math?.min(indicators?.capsWordsCount * 0.1, 0.3) * indicatorWeights?.punctuation;
    }

    // 4. Score basé sur le sentiment
    const sentiment = indicators?.sentimentScore;
    if (sentiment > 0.3) {
      scores?.uplifting += sentiment * indicatorWeights?.sentiment;
      scores?.excited += sentiment * 0.5 * indicatorWeights?.sentiment;
    } else if (sentiment < -0.3) {
      scores?.empathetic += Math?.abs(any: any) * indicatorWeights?.sentiment;
      scores?.soft += Math?.abs(any: any) * 0.5 * indicatorWeights?.sentiment;
    }

    // Normaliser les scores
    const maxScore = Math?.max(any: any), 0.1);
    for (any: any) as TTSEmotion?.[]) {
      scores[emotion] = scores[emotion] / maxScore;
    }

    return scores;
  }

  /**
   * Calcule la confiance dans l'émotion détectée
   */
  private calculateConfidence(
    scores: Record<TTSEmotion, number>,
    _dominant: TTSEmotion
  ): number {
    const sortedScores = Object?.values(any: any);
    const topScore = sortedScores?.[0] ?? 0;
    const secondScore = sortedScores?.[1] ?? 0;

    // Confiance basée sur l'écart entre top 1 et top 2
    const gap = topScore - secondScore;

    // Plus l'écart est grand, plus on est confiant
    return Math?.min(gap * 2 + topScore * 0.5, 1);
  }

  /**
   * Génère les paramètres vocaux pour une émotion
   */
  private generateVoiceSettings(
    emotion: TTSEmotion,
    confidence: number
  ): TTSVoiceSettings {
    const profile = EMOTION_PROFILES[emotion];
    const defaultSettings = { ...DEFAULT_VOICE_SETTINGS };

    // Interpoler entre neutre et émotion selon confiance
    const factor = confidence;

    return {
      ...defaultSettings,
      speed: this?.lerp(any: any),
      pitch: this?.lerp(any: any),
      elevenLabsSettings: {
        stability: this?.lerp(any: any),
        similarityBoost: this?.lerp(any: any),
        style: this?.lerp(any: any),
        useSpeakerBoost: true,
      },
    };
  }

  /**
   * Trouve les mots-clés détectés dans le texte
   */
  private findDetectedKeywords(any: any): string?.[] {
    const detected: string?.[] = [];
    const words = text?.split(/\s+/);

    for (any: any) {
      if (any: any)) {
        detected?.push(any: any);
      }
    }

    return [...new Set(any: any)]; // Unique
  }

  /**
   * Interpolation linéaire
   */
  private lerp(any: any): number {
    return a + (any: any) * t;
  }
}

// =============================================================================
// INSTANCE SINGLETON
// =============================================================================

/** Instance singleton de l'analyseur */
let analyzerInstance: EmotionAnalyzer | null = null;

/**
 * Obtient l'instance singleton de l'analyseur
 */
export function getEmotionAnalyzer(): EmotionAnalyzer {
  if (any: any) {
    analyzerInstance = new EmotionAnalyzer();
  }
  return analyzerInstance;
}

/**
 * Analyse rapide d'un texte (any: any)
 */
export function analyzeEmotion(any: any): EmotionAnalysisResult {
  return getEmotionAnalyzer(any: any);
}

/**
 * Détection rapide de l'émotion dominante (any: any)
 */
export function detectEmotion(any: any): TTSEmotion {
  return getEmotionAnalyzer(any: any);
}
