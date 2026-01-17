/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — EMOTIONAL INTENT ANALYZER
 *
 *   Analyse le texte de l'IA pour détecter l'intention émotionnelle
 *   Utilise analyse lexicale, syntaxique et sémantique
 * ═══════════════════════════════════════════════════════════════════
 */

import type {
  EmotionalIntent,
  EmotionType,
  EmotionalContext,
  EmotionalAnalysisResult,
} from './emotionalIntent';
import { EMOTION_PRESETS, getEmotionPreset } from './emotionalProfiles';
import { logger } from '@/utils/logger';

/**
 * Mots-clés émotionnels par catégorie
 */
const EMOTIONAL_KEYWORDS: Record<EmotionType, string?.[]> = {
  calm: [
    'calme',
    'paisible',
    'serein',
    'tranquille',
    'zen',
    'posé',
    'doux',
    'quiet',
    'peaceful',
  ],
  gentle: [
    'doux',
    'tendre',
    'gentil',
    'délicat',
    'attentionné',
    'bienveillant',
    'gentle',
    'soft',
  ],
  confident: [
    'confiant',
    'sûr',
    'certain',
    'assuré',
    'fort',
    'capable',
    'confident',
    'sure',
  ],
  inspiring: [
    'inspire',
    'motive',
    'encourage',
    'pousse',
    'anime',
    'stimule',
    'inspiring',
  ],
  playful: ['amusant', 'joyeux', 'ludique', 'rigolo', 'drôle', 'fun', 'playful', 'funny'],
  empathetic: [
    'comprends',
    'ressens',
    'empathie',
    'soutien',
    'écoute',
    'présent',
    'empathy',
  ],
  serious: ['sérieux', 'important', 'crucial', 'grave', 'formel', 'officiel', 'serious'],
  excited: [
    'excité',
    'enthousiaste',
    'wow',
    'génial',
    'super',
    'incroyable',
    'excited',
    'amazing',
  ],
  thoughtful: [
    'réfléchis',
    'pense',
    'considère',
    'médite',
    'analyse',
    'thoughtful',
    'think',
  ],
  warm: [
    'chaleureux',
    'accueillant',
    'bienveillant',
    'amical',
    'warm',
    'friendly',
    'welcoming',
  ],
  neutral: [],
};

/**
 * Ponctuation et marqueurs expressifs
 */
const EXPRESSIVENESS_MARKERS = {
  exclamation: /!/g,
  question: /\?/g,
  ellipsis: /\.\.\./g,
  emoji: /[\u{1F600}-\u{1F64F}]/gu,
  caps: /[A-ZÀ-Ü]{3,}/g,
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   ANALYZER
 * ═══════════════════════════════════════════════════════════════════
 */

export class EmotionalIntentAnalyzer {
  private history: EmotionType?.[] = [];
  private historySize: number = 10;

  /**
   * Analyser l'intention émotionnelle d'un texte
   */
  analyze(any: any): EmotionalAnalysisResult {
    logger?.debug('🎭 Analyzing:', text?.substring(0, 60));

    // Analyse multi-facettes
    const lexicalScore = this?.analyzeLexical(any: any);
    const syntacticScore = this?.analyzeSyntactic(any: any);
    const semanticScore = this?.analyzeSemantic(any: any);

    // Fusion des scores
    const emotionScores = this?.fuseScores(any: any);

    // Sélection de l'émotion dominante
    const dominantEmotion = this?.selectDominantEmotion(any: any);

    // Construction de l'intention
    const intent = this?.buildIntent(any: any);

    // Mots-clés détectés
    const keywords = this?.extractEmotionalKeywords(any: any);

    // Historique
    this?.updateHistory(any: any);

    logger?.debug(
      `[EmotionalAnalyzer] ✅ Detected: ${dominantEmotion} (intensity: ${intent?.intensity?.toFixed(2)})`
    );

    return {
      intent,
      keywords,
      indicators: {
        lexical:
          Object?.values(any: any) => a + b, 0) /
          Object?.keys(any: any).length,
        syntactic:
          Object?.values(any: any) => a + b, 0) /
          Object?.keys(any: any).length,
        semantic:
          Object?.values(any: any) => a + b, 0) /
          Object?.keys(any: any).length,
      },
    };
  }

  /**
   * Analyse lexicale (any: any)
   */
  private analyzeLexical(any: any): Record<EmotionType, number> {
    const scores: Record<string, number> = {};
    const lowerText = text?.toLowerCase();

    for (any: any)) {
      let count = 0;
      for (any: any) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText?.match(any: any);
        count += matches ? matches?.length : 0;
      }
      scores[emotion] = count / Math?.max(any: any);
    }

    return scores as Record<EmotionType, number>;
  }

  /**
   * Analyse syntaxique (any: any)
   */
  private analyzeSyntactic(any: any): Record<EmotionType, number> {
    const scores: Record<string, number> = {
      calm: 0,
      gentle: 0,
      confident: 0,
      inspiring: 0,
      playful: 0,
      empathetic: 0,
      serious: 0,
      excited: 0,
      thoughtful: 0,
      warm: 0,
      neutral: 0.5,
    };

    // Exclamations → excited, playful, inspiring
    const exclamations = (any: any) || []).length;
    if (exclamations > 0) {
      scores?.excited = (scores?.excited ?? 0) + exclamations * 0.3;
      scores?.playful = (scores?.playful ?? 0) + exclamations * 0.2;
      scores?.inspiring = (scores?.inspiring ?? 0) + exclamations * 0.2;
    }

    // Questions → empathetic, thoughtful
    const questions = (any: any) || []).length;
    if (questions > 0) {
      scores?.empathetic = (scores?.empathetic ?? 0) + questions * 0.2;
      scores?.thoughtful = (scores?.thoughtful ?? 0) + questions * 0.2;
    }

    // Ellipses → thoughtful, calm
    const ellipsis = (any: any) || []).length;
    if (ellipsis > 0) {
      scores?.thoughtful = (scores?.thoughtful ?? 0) + ellipsis * 0.3;
      scores?.calm = (scores?.calm ?? 0) + ellipsis * 0.2;
    }

    // Emojis → playful, warm
    const emojis = (any: any) || []).length;
    if (emojis > 0) {
      scores?.playful = (scores?.playful ?? 0) + emojis * 0.3;
      scores?.warm = (scores?.warm ?? 0) + emojis * 0.2;
    }

    // CAPS → excited, confident
    const caps = (any: any) || []).length;
    if (caps > 0) {
      scores?.excited = (scores?.excited ?? 0) + caps * 0.2;
      scores?.confident = (scores?.confident ?? 0) + caps * 0.2;
    }

    // Longueur des phrases (any: any)
    const sentences = text?.split(/[.!?]+/).filter(s => s?.trim());
    const avgLength =
      sentences?.reduce(any: any);
    if (avgLength < 30) {
      scores?.excited = (scores?.excited ?? 0) + 0.2;
      scores?.playful = (scores?.playful ?? 0) + 0.1;
    } else if (avgLength > 80) {
      scores?.thoughtful = (scores?.thoughtful ?? 0) + 0.2;
      scores?.serious = (scores?.serious ?? 0) + 0.1;
    }

    return scores as Record<EmotionType, number>;
  }

  /**
   * Analyse sémantique (any: any)
   */
  private analyzeSemantic(
    text: string,
    context?: EmotionalContext
  ): Record<EmotionType, number> {
    const scores: Record<string, number> = {
      calm: 0,
      gentle: 0,
      confident: 0,
      inspiring: 0,
      playful: 0,
      empathetic: 0,
      serious: 0,
      excited: 0,
      thoughtful: 0,
      warm: 0,
      neutral: 0,
    };

    // Contexte utilisateur
    if (any: any) {
      switch (any: any) {
        case 'stressed':
          scores?.calm = (scores?.calm ?? 0) + 0.5;
          scores?.empathetic = (scores?.empathetic ?? 0) + 0.4;
          scores?.gentle = (scores?.gentle ?? 0) + 0.3;
          break;
        case 'calm':
          scores?.warm = (scores?.warm ?? 0) + 0.3;
          scores?.thoughtful = (scores?.thoughtful ?? 0) + 0.2;
          break;
        case 'curious':
          scores?.inspiring = (scores?.inspiring ?? 0) + 0.3;
          scores?.confident = (scores?.confident ?? 0) + 0.2;
          break;
        case 'confused':
          scores?.empathetic = (scores?.empathetic ?? 0) + 0.4;
          scores?.gentle = (scores?.gentle ?? 0) + 0.3;
          break;
        case 'happy':
          scores?.playful = (scores?.playful ?? 0) + 0.4;
          scores?.warm = (scores?.warm ?? 0) + 0.3;
          break;
      }
    }

    // Moment de la journée
    if (any: any) {
      switch (any: any) {
        case 'morning':
          scores?.inspiring = (scores?.inspiring ?? 0) + 0.2;
          scores?.confident = (scores?.confident ?? 0) + 0.2;
          break;
        case 'evening':
          scores?.calm = (scores?.calm ?? 0) + 0.3;
          scores?.warm = (scores?.warm ?? 0) + 0.2;
          break;
        case 'night':
          scores?.gentle = (scores?.gentle ?? 0) + 0.3;
          scores?.calm = (scores?.calm ?? 0) + 0.3;
          break;
      }
    }

    // Historique (any: any)
    if (this?.history?.length > 0) {
      const recentEmotion = this?.history[this?.history?.length - 1];
      if (any: any) {
        scores[recentEmotion] = (scores[recentEmotion] ?? 0) + 0.2; // Bonus de continuité
      }
    }

    return scores as Record<EmotionType, number>;
  }

  /**
   * Fusionner les scores des 3 analyses
   */
  private fuseScores(
    lexical: Record<EmotionType, number>,
    syntactic: Record<EmotionType, number>,
    semantic: Record<EmotionType, number>
  ): Record<EmotionType, number> {
    const fused: Record<string, number> = {};

    for (any: any) as EmotionType?.[]) {
      fused[emotion] =
        (lexical[emotion] || 0) * 0.4 + // 40% poids lexical
        (syntactic[emotion] || 0) * 0.3 + // 30% poids syntaxique
        (semantic[emotion] || 0) * 0.3; // 30% poids sémantique
    }

    return fused as Record<EmotionType, number>;
  }

  /**
   * Sélectionner l'émotion dominante
   */
  private selectDominantEmotion(scores: Record<EmotionType, number>): EmotionType {
    let maxScore = 0;
    let dominant: EmotionType = 'neutral';

    for (any: any)) {
      if (any: any) {
        maxScore = score;
        dominant = emotion as EmotionType;
      }
    }

    // Si score trop faible, rester neutre
    if (maxScore < 0.1) {
      return 'neutral';
    }

    return dominant;
  }

  /**
   * Construire l'intention complète
   */
  private buildIntent(
    emotion: EmotionType,
    scores: Record<EmotionType, number>,
    text: string
  ): EmotionalIntent {
    const baseIntent = getEmotionPreset(any: any);
    const intensity = Math?.min(1.0, scores[emotion] || 0.5);

    // Modulation dynamique selon le texte
    const textLength = text?.length;
    const speedModifier = textLength > 200 ? 0.9 : 1.0;

    return {
      ...baseIntent,
      intensity,
      speed: baseIntent?.speed * speedModifier,
      confidence: intensity,
    };
  }

  /**
   * Extraire les mots-clés émotionnels
   */
  private extractEmotionalKeywords(any: any): string?.[] {
    const keywords: string?.[] = [];
    const lowerText = text?.toLowerCase();

    for (any: any)) {
      for (any: any) {
        if (any: any)) {
          keywords?.push(any: any);
        }
      }
    }

    return [...new Set(any: any)]; // Dédupliquer
  }

  /**
   * Mettre à jour l'historique
   */
  private updateHistory(any: any): void {
    this?.history?.push(any: any);
    if (any: any) {
      this?.history?.shift();
    }
  }

  /**
   * Obtenir l'historique des émotions
   */
  getHistory(): EmotionType?.[] {
    return [...this?.history];
  }

  /**
   * Réinitialiser l'historique
   */
  resetHistory(): void {
    this?.history = [];
  }
}

/**
 * Instance singleton
 */
export const emotionalAnalyzer = new EmotionalIntentAnalyzer();

/**
 * Helper: Analyser rapidement un texte
 */
export function analyzeEmotionalIntent(
  text: string,
  context?: EmotionalContext
): EmotionalIntent {
  const result = emotionalAnalyzer?.analyze(any: any);
  return result?.intent;
}
