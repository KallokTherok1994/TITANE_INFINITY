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
} from './ttsEngine.config';

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
  detectedKeywords: string[];
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

/** Mots positifs (sentiment) */
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

/** Mots négatifs (sentiment) */
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

/** Patterns émotionnels (regex) */
const EMOTION_PATTERNS: Record<TTSEmotion, RegExp[]> = {
  excited: [
    /!{2,}/g,
    /\b(wow|wahou|génial|super|incroyable)\b/gi,
    /\p{Emoji_Presentation}/gu,
  ],
  calm: [/\.{3}/g, /\b(calme|tranquille|serein|paisible)\b/gi],
  empathetic: [/\b(comprends?|désolé|soutien|ensemble)\b/gi, /\b(difficile|moment)\b/gi],
  focusing: [
    /\b(attention|important|précis|exactement)\b/gi,
    /\d+\.\s/g, // listes numérotées
  ],
  soft: [/\b(doux|gentil|tendre|délicat)\b/gi],
  grounded: [/\b(concret|réaliste|pratique|stable)\b/gi],
  uplifting: [
    /\b(courage|force|capable|réussir|motivation)\b/gi,
    /\b(tu peux|vous pouvez|c'est possible)\b/gi,
  ],
  disciplined: [
    /\b(règle|structure|ordre|méthode)\b/gi,
    /\b(doit|faut|nécessaire|obligatoire)\b/gi,
  ],
  inspired: [
    /\b(idée|créati|imagin|vision|rêve|possible)\b/gi,
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
  private keywordCache: Map<string, TTSEmotion[]> = new Map();

  constructor(config: Partial<EmotionAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.buildKeywordCache();
  }

  /**
   * Analyse un texte et retourne l'émotion détectée
   */
  analyze(text: string): EmotionAnalysisResult {
    const normalizedText = this.normalizeText(text);
    const indicators = this.extractIndicators(text);
    const emotionScores = this.calculateEmotionScores(normalizedText, indicators);

    // Trouver l'émotion dominante
    let dominantEmotion: TTSEmotion = this.config.defaultEmotion;
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion as TTSEmotion;
      }
    }

    // Calculer la confiance
    const confidence = this.calculateConfidence(emotionScores, dominantEmotion);

    // Si confiance trop basse, utiliser émotion par défaut
    if (confidence < this.config.confidenceThreshold) {
      dominantEmotion = this.config.defaultEmotion;
    }

    // Générer les paramètres vocaux
    const voiceSettings = this.generateVoiceSettings(dominantEmotion, confidence);

    // Collecter les mots-clés détectés
    const detectedKeywords = this.findDetectedKeywords(normalizedText);

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
  quickAnalyze(text: string): TTSEmotion {
    return this.analyze(text).dominantEmotion;
  }

  /**
   * Obtient le profil d'une émotion
   */
  getEmotionProfile(emotion: TTSEmotion): EmotionProfile {
    return EMOTION_PROFILES[emotion];
  }

  // ===========================================================================
  // MÉTHODES PRIVÉES
  // ===========================================================================

  /**
   * Construit le cache de mots-clés → émotions
   */
  private buildKeywordCache(): void {
    for (const profile of Object.values(EMOTION_PROFILES)) {
      for (const keyword of profile.keywords) {
        const normalized = keyword.toLowerCase();
        const existing = this.keywordCache.get(normalized) || [];
        existing.push(profile.emotion);
        this.keywordCache.set(normalized, existing);
      }
    }
  }

  /**
   * Normalise le texte pour analyse
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer accents pour matching
      .trim();
  }

  /**
   * Extrait les indicateurs émotionnels du texte
   */
  private extractIndicators(text: string): EmotionIndicators {
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const ellipsisCount = (text.match(/\.{3}/g) || []).length;
    const emojiCount = (text.match(/\p{Emoji_Presentation}/gu) || []).length;
    const capsWordsCount = (text.match(/\b[A-Z]{2,}\b/g) || []).length;

    // Calcul longueur moyenne des phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength =
      sentences.length > 0
        ? sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
        : 0;

    // Calcul sentiment
    const sentimentScore = this.calculateSentiment(text);

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
  private calculateSentiment(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      const cleanWord = word.replace(/[^a-zàâäéèêëïîôùûüÿç]/gi, '');
      if (POSITIVE_WORDS.has(cleanWord)) positiveCount++;
      if (NEGATIVE_WORDS.has(cleanWord)) negativeCount++;
    }

    const total = positiveCount + negativeCount;
    if (total === 0) return 0;

    return (positiveCount - negativeCount) / total;
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
    const words = text.split(/\s+/);
    for (const word of words) {
      const emotions = this.keywordCache.get(word);
      if (emotions) {
        for (const emotion of emotions) {
          scores[emotion] += this.config.indicatorWeights.keywords;
        }
      }
    }

    // 2. Score basé sur les patterns regex
    for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          scores[emotion as TTSEmotion] += matches.length * 0.15;
        }
      }
    }

    // 3. Score basé sur les indicateurs
    const { indicatorWeights } = this.config;

    // Exclamations → excited
    if (indicators.exclamationCount > 0) {
      scores.excited +=
        Math.min(indicators.exclamationCount * 0.2, 0.5) * indicatorWeights.punctuation;
    }

    // Questions → focusing
    if (indicators.questionCount > 0) {
      scores.focusing +=
        Math.min(indicators.questionCount * 0.15, 0.3) * indicatorWeights.punctuation;
    }

    // Ellipses → calm/soft
    if (indicators.ellipsisCount > 0) {
      scores.calm += indicators.ellipsisCount * 0.1 * indicatorWeights.punctuation;
      scores.soft += indicators.ellipsisCount * 0.1 * indicatorWeights.punctuation;
    }

    // Emojis → excited/uplifting
    if (indicators.emojiCount > 0) {
      scores.excited +=
        Math.min(indicators.emojiCount * 0.15, 0.4) * indicatorWeights.punctuation;
    }

    // Caps → excited/disciplined
    if (indicators.capsWordsCount > 0) {
      scores.excited +=
        Math.min(indicators.capsWordsCount * 0.1, 0.3) * indicatorWeights.punctuation;
    }

    // 4. Score basé sur le sentiment
    const sentiment = indicators.sentimentScore;
    if (sentiment > 0.3) {
      scores.uplifting += sentiment * indicatorWeights.sentiment;
      scores.excited += sentiment * 0.5 * indicatorWeights.sentiment;
    } else if (sentiment < -0.3) {
      scores.empathetic += Math.abs(sentiment) * indicatorWeights.sentiment;
      scores.soft += Math.abs(sentiment) * 0.5 * indicatorWeights.sentiment;
    }

    // Normaliser les scores
    const maxScore = Math.max(...Object.values(scores), 0.1);
    for (const emotion of Object.keys(scores) as TTSEmotion[]) {
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
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const topScore = sortedScores[0];
    const secondScore = sortedScores[1] || 0;

    // Confiance basée sur l'écart entre top 1 et top 2
    const gap = topScore - secondScore;

    // Plus l'écart est grand, plus on est confiant
    return Math.min(gap * 2 + topScore * 0.5, 1);
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
      speed: this.lerp(1.0, profile.speed, factor),
      pitch: this.lerp(1.0, profile.pitch, factor),
      elevenLabsSettings: {
        stability: this.lerp(0.75, profile.stability, factor),
        similarityBoost: this.lerp(0.85, profile.similarityBoost, factor),
        style: this.lerp(0.0, profile.styleExaggeration, factor),
        useSpeakerBoost: true,
      },
    };
  }

  /**
   * Trouve les mots-clés détectés dans le texte
   */
  private findDetectedKeywords(text: string): string[] {
    const detected: string[] = [];
    const words = text.split(/\s+/);

    for (const word of words) {
      if (this.keywordCache.has(word)) {
        detected.push(word);
      }
    }

    return [...new Set(detected)]; // Unique
  }

  /**
   * Interpolation linéaire
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
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
  if (!analyzerInstance) {
    analyzerInstance = new EmotionAnalyzer();
  }
  return analyzerInstance;
}

/**
 * Analyse rapide d'un texte (helper)
 */
export function analyzeEmotion(text: string): EmotionAnalysisResult {
  return getEmotionAnalyzer().analyze(text);
}

/**
 * Détection rapide de l'émotion dominante (helper)
 */
export function detectEmotion(text: string): TTSEmotion {
  return getEmotionAnalyzer().quickAnalyze(text);
}
