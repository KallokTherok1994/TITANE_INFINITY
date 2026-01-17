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
const EMOTIONAL_KEYWORDS: Record<EmotionType, string[]> = {
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
  private history: EmotionType[] = [];
  private historySize: number = 10;

  /**
   * Analyser l'intention émotionnelle d'un texte
   */
  analyze(text: string, context?: EmotionalContext): EmotionalAnalysisResult {
    logger.debug('🎭 Analyzing:', text.substring(0, 60));

    // Analyse multi-facettes
    const lexicalScore = this.analyzeLexical(text);
    const syntacticScore = this.analyzeSyntactic(text);
    const semanticScore = this.analyzeSemantic(text, context);

    // Fusion des scores
    const emotionScores = this.fuseScores(lexicalScore, syntacticScore, semanticScore);

    // Sélection de l'émotion dominante
    const dominantEmotion = this.selectDominantEmotion(emotionScores);

    // Construction de l'intention
    const intent = this.buildIntent(dominantEmotion, emotionScores, text);

    // Mots-clés détectés
    const keywords = this.extractEmotionalKeywords(text);

    // Historique
    this.updateHistory(dominantEmotion);

    logger.debug(
      `[EmotionalAnalyzer] ✅ Detected: ${dominantEmotion} (intensity: ${intent.intensity.toFixed(2)})`
    );

    return {
      intent,
      keywords,
      indicators: {
        lexical:
          Object.values(lexicalScore).reduce((a, b) => a + b, 0) /
          Object.keys(lexicalScore).length,
        syntactic:
          Object.values(syntacticScore).reduce((a, b) => a + b, 0) /
          Object.keys(syntacticScore).length,
        semantic:
          Object.values(semanticScore).reduce((a, b) => a + b, 0) /
          Object.keys(semanticScore).length,
      },
    };
  }

  /**
   * Analyse lexicale (mots-clés émotionnels)
   */
  private analyzeLexical(text: string): Record<EmotionType, number> {
    const scores: Record<string, number> = {};
    const lowerText = text.toLowerCase();

    for (const [emotion, keywords] of Object.entries(EMOTIONAL_KEYWORDS)) {
      let count = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        count += matches ? matches.length : 0;
      }
      scores[emotion] = count / Math.max(1, keywords.length);
    }

    return scores as Record<EmotionType, number>;
  }

  /**
   * Analyse syntaxique (ponctuation, structure)
   */
  private analyzeSyntactic(text: string): Record<EmotionType, number> {
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
    const exclamations = (text.match(EXPRESSIVENESS_MARKERS.exclamation) || []).length;
    if (exclamations > 0) {
      scores.excited = (scores.excited ?? 0) + exclamations * 0.3;
      scores.playful = (scores.playful ?? 0) + exclamations * 0.2;
      scores.inspiring = (scores.inspiring ?? 0) + exclamations * 0.2;
    }

    // Questions → empathetic, thoughtful
    const questions = (text.match(EXPRESSIVENESS_MARKERS.question) || []).length;
    if (questions > 0) {
      scores.empathetic = (scores.empathetic ?? 0) + questions * 0.2;
      scores.thoughtful = (scores.thoughtful ?? 0) + questions * 0.2;
    }

    // Ellipses → thoughtful, calm
    const ellipsis = (text.match(EXPRESSIVENESS_MARKERS.ellipsis) || []).length;
    if (ellipsis > 0) {
      scores.thoughtful = (scores.thoughtful ?? 0) + ellipsis * 0.3;
      scores.calm = (scores.calm ?? 0) + ellipsis * 0.2;
    }

    // Emojis → playful, warm
    const emojis = (text.match(EXPRESSIVENESS_MARKERS.emoji) || []).length;
    if (emojis > 0) {
      scores.playful = (scores.playful ?? 0) + emojis * 0.3;
      scores.warm = (scores.warm ?? 0) + emojis * 0.2;
    }

    // CAPS → excited, confident
    const caps = (text.match(EXPRESSIVENESS_MARKERS.caps) || []).length;
    if (caps > 0) {
      scores.excited = (scores.excited ?? 0) + caps * 0.2;
      scores.confident = (scores.confident ?? 0) + caps * 0.2;
    }

    // Longueur des phrases (courtes = excited, longues = thoughtful)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgLength =
      sentences.reduce((sum, s) => sum + s.length, 0) / Math.max(1, sentences.length);
    if (avgLength < 30) {
      scores.excited = (scores.excited ?? 0) + 0.2;
      scores.playful = (scores.playful ?? 0) + 0.1;
    } else if (avgLength > 80) {
      scores.thoughtful = (scores.thoughtful ?? 0) + 0.2;
      scores.serious = (scores.serious ?? 0) + 0.1;
    }

    return scores as Record<EmotionType, number>;
  }

  /**
   * Analyse sémantique (contexte, historique)
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
    if (context?.userState) {
      switch (context.userState) {
        case 'stressed':
          scores.calm = (scores.calm ?? 0) + 0.5;
          scores.empathetic = (scores.empathetic ?? 0) + 0.4;
          scores.gentle = (scores.gentle ?? 0) + 0.3;
          break;
        case 'calm':
          scores.warm = (scores.warm ?? 0) + 0.3;
          scores.thoughtful = (scores.thoughtful ?? 0) + 0.2;
          break;
        case 'curious':
          scores.inspiring = (scores.inspiring ?? 0) + 0.3;
          scores.confident = (scores.confident ?? 0) + 0.2;
          break;
        case 'confused':
          scores.empathetic = (scores.empathetic ?? 0) + 0.4;
          scores.gentle = (scores.gentle ?? 0) + 0.3;
          break;
        case 'happy':
          scores.playful = (scores.playful ?? 0) + 0.4;
          scores.warm = (scores.warm ?? 0) + 0.3;
          break;
      }
    }

    // Moment de la journée
    if (context?.timeOfDay) {
      switch (context.timeOfDay) {
        case 'morning':
          scores.inspiring = (scores.inspiring ?? 0) + 0.2;
          scores.confident = (scores.confident ?? 0) + 0.2;
          break;
        case 'evening':
          scores.calm = (scores.calm ?? 0) + 0.3;
          scores.warm = (scores.warm ?? 0) + 0.2;
          break;
        case 'night':
          scores.gentle = (scores.gentle ?? 0) + 0.3;
          scores.calm = (scores.calm ?? 0) + 0.3;
          break;
      }
    }

    // Historique (cohérence émotionnelle)
    if (this.history.length > 0) {
      const recentEmotion = this.history[this.history.length - 1];
      if (recentEmotion) {
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

    for (const emotion of Object.keys(EMOTION_PRESETS) as EmotionType[]) {
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

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
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
    const baseIntent = getEmotionPreset(emotion);
    const intensity = Math.min(1.0, scores[emotion] || 0.5);

    // Modulation dynamique selon le texte
    const textLength = text.length;
    const speedModifier = textLength > 200 ? 0.9 : 1.0;

    return {
      ...baseIntent,
      intensity,
      speed: baseIntent.speed * speedModifier,
      confidence: intensity,
    };
  }

  /**
   * Extraire les mots-clés émotionnels
   */
  private extractEmotionalKeywords(text: string): string[] {
    const keywords: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [, emotionKeywords] of Object.entries(EMOTIONAL_KEYWORDS)) {
      for (const keyword of emotionKeywords) {
        if (lowerText.includes(keyword)) {
          keywords.push(keyword);
        }
      }
    }

    return [...new Set(keywords)]; // Dédupliquer
  }

  /**
   * Mettre à jour l'historique
   */
  private updateHistory(emotion: EmotionType): void {
    this.history.push(emotion);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }
  }

  /**
   * Obtenir l'historique des émotions
   */
  getHistory(): EmotionType[] {
    return [...this.history];
  }

  /**
   * Réinitialiser l'historique
   */
  resetHistory(): void {
    this.history = [];
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
  const result = emotionalAnalyzer.analyze(text, context);
  return result.intent;
}
