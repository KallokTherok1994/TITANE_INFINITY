/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — EMOTIONAL STATE ESTIMATOR (ESEngine)
 *   Analyse l'état émotionnel de l'utilisateur en temps réel
 *   Input: Audio + Transcription + Contexte
 *   Output: EmotionalState (mood, energy, valence, intention)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * État d'humeur de l'utilisateur
 */
export type UserMood =
  | 'calm' // Calme, serein
  | 'curious' // Curieux, intéressé
  | 'focused' // Concentré, déterminé
  | 'excited' // Excité, enthousiaste
  | 'tired' // Fatigué, épuisé
  | 'stressed' // Stressé, anxieux
  | 'frustrated' // Frustré, irrité
  | 'happy' // Heureux, joyeux
  | 'sad' // Triste, mélancolique
  | 'neutral'; // Neutre, baseline

/**
 * Type d'intention détectée
 */
export type UserIntention =
  | 'question' // Pose une question
  | 'command' // Donne une commande
  | 'doubt' // Exprime un doute
  | 'affirmation' // Affirme quelque chose
  | 'urgency' // Besoin urgent
  | 'casual' // Conversation décontractée
  | 'reflection' // Réflexion, pensée
  | 'complaint' // Se plaint
  | 'thanks' // Remercie
  | 'unknown'; // Non déterminé

/**
 * État émotionnel complet de l'utilisateur
 */
export interface EmotionalState {
  /** Humeur générale détectée */
  mood: UserMood;

  /** Niveau d'énergie (0-1) */
  energy: number;

  /** Valence émotionnelle (-1 négatif, 0 neutre, +1 positif) */
  valence: number;

  /** Intention détectée */
  intention: UserIntention;

  /** Confiance de la détection (0-1) */
  confidence: number;

  /** Timestamp de la détection */
  timestamp: number;
}

/**
 * Indicateurs audio pour analyse émotionnelle
 */
export interface AudioIndicators {
  /** Moyenne du pitch (Hz) */
  avgPitch: number;

  /** Variance du pitch */
  pitchVariance: number;

  /** Vitesse de parole (mots/min) */
  speechRate: number;

  /** Intensité sonore moyenne (RMS) */
  intensity: number;

  /** Ratio de pauses/parole */
  pauseRatio: number;

  /** Détection de tremblement vocal */
  voiceTremor: boolean;
}

/**
 * Indicateurs textuels pour analyse émotionnelle
 */
export interface TextIndicators {
  /** Nombre de points d'exclamation */
  exclamationCount: number;

  /** Nombre de points d'interrogation */
  questionCount: number;

  /** Nombre de points de suspension */
  ellipsisCount: number;

  /** Mots en majuscules */
  capsWordsCount: number;

  /** Longueur moyenne des phrases */
  avgSentenceLength: number;

  /** Score de sentiment (-1 à +1) */
  sentimentScore: number;

  /** Présence de négations */
  negationCount: number;

  /** Mots d'émotion forte */
  strongEmotionWords: string[];
}

/**
 * Configuration de l'estimateur émotionnel
 */
export interface ESEngineConfig {
  /** Poids de l'analyse audio (0-1) */
  audioWeight?: number;

  /** Poids de l'analyse textuelle (0-1) */
  textWeight?: number;

  /** Poids de l'historique (0-1) */
  historyWeight?: number;

  /** Taille de l'historique émotionnel */
  historySize?: number;

  /** Seuil de confiance minimum */
  minConfidence?: number;
}

/**
 * Mots-clés émotionnels par catégorie
 */
const EMOTION_KEYWORDS: Record<UserMood, string[]> = {
  calm: ['calme', 'tranquille', 'paisible', 'serein', 'détendu', 'zen', 'ok', 'bien'],
  curious: [
    'pourquoi',
    'comment',
    'intéressant',
    'curieux',
    'découvrir',
    'savoir',
    'comprendre',
  ],
  focused: ['concentré', 'focus', 'important', 'priorité', 'urgent', 'faut que', 'dois'],
  excited: [
    'génial',
    'super',
    'incroyable',
    'wow',
    'excellent',
    'parfait',
    'top',
    'yeah',
  ],
  tired: ['fatigué', 'épuisé', 'crevé', 'las', 'sommeil', 'dormir', 'repos'],
  stressed: ['stressé', 'angoissé', 'anxieux', 'inquiet', 'peur', 'panique', 'tendu'],
  frustrated: ['frustré', 'énervé', 'irrité', 'agacé', 'marre', 'ras le bol', 'pfff'],
  happy: ['heureux', 'joyeux', 'content', 'ravi', 'enchanté', 'sourire', 'joie'],
  sad: ['triste', 'malheureux', 'désolé', 'peine', 'chagrin', 'mélancolique', 'déprimé'],
  neutral: [],
};

/**
 * Mots-clés d'intention
 */
const INTENTION_KEYWORDS: Record<UserIntention, string[]> = {
  question: [
    'pourquoi',
    'comment',
    'quoi',
    'qui',
    'quand',
    'où',
    'quel',
    'quelle',
    'est-ce que',
  ],
  command: [
    'fais',
    'fait',
    'lance',
    'ouvre',
    'ferme',
    'arrête',
    'commence',
    'démarre',
    'stop',
  ],
  doubt: ['peut-être', 'je sais pas', 'pas sûr', 'doute', 'hésit', 'vraiment', 'certain'],
  affirmation: [
    'oui',
    'exactement',
    'voilà',
    'tout à fait',
    'absolument',
    "c'est ça",
    'évidemment',
  ],
  urgency: [
    'urgent',
    'vite',
    'rapidement',
    'maintenant',
    'immédiatement',
    'tout de suite',
    'aide',
  ],
  casual: ['salut', 'coucou', 'hey', 'ça va', 'quoi de neuf', 'alors', 'bon'],
  reflection: ['je pense', 'je crois', 'il me semble', 'réfléchis', 'médite', 'imagine'],
  complaint: ['problème', 'bug', 'marche pas', 'fonctionne pas', 'erreur', 'nul', 'déçu'],
  thanks: ['merci', 'remercie', 'sympa', 'gentil', 'cool', 'top', 'parfait'],
  unknown: [],
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   EMOTIONAL STATE ESTIMATOR (ESEngine)
 * ═══════════════════════════════════════════════════════════════════
 */
export class EmotionalStateEstimator {
  private config: Required<ESEngineConfig>;
  private history: EmotionalState[] = [];

  constructor(config?: ESEngineConfig) {
    this.config = {
      audioWeight: config?.audioWeight ?? 0.4,
      textWeight: config?.textWeight ?? 0.5,
      historyWeight: config?.historyWeight ?? 0.1,
      historySize: config?.historySize ?? 10,
      minConfidence: config?.minConfidence ?? 0.3,
    };
  }

  /**
   * Analyse complète de l'état émotionnel
   */
  analyze(
    text: string,
    audioIndicators?: AudioIndicators,
    _contextHistory?: string[]
  ): EmotionalState {
    const textIndicators = this.extractTextIndicators(text);

    // Score par mood
    const moodScores = this.calculateMoodScores(text, textIndicators, audioIndicators);

    // Score par intention
    const intentionScores = this.calculateIntentionScores(text, textIndicators);

    // Mood dominant
    const dominantMood = this.getDominant(moodScores) as UserMood;

    // Intention dominante
    const dominantIntention = this.getDominant(intentionScores) as UserIntention;

    // Energy level (basé sur audio + text)
    const energy = this.calculateEnergy(audioIndicators, textIndicators);

    // Valence (positif/négatif)
    const valence = this.calculateValence(dominantMood, textIndicators);

    // Confiance
    const confidence = this.calculateConfidence(moodScores, intentionScores);

    const state: EmotionalState = {
      mood: dominantMood,
      energy,
      valence,
      intention: dominantIntention,
      confidence,
      timestamp: Date.now(),
    };

    // Ajouter à l'historique
    this.addToHistory(state);

    return state;
  }

  /**
   * Analyse rapide (text-only)
   */
  analyzeText(text: string): EmotionalState {
    return this.analyze(text);
  }

  /**
   * Obtenir l'état émotionnel dominant récent
   */
  getRecentState(): EmotionalState | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1] ?? null;
  }

  /**
   * Obtenir l'historique émotionnel
   */
  getHistory(): EmotionalState[] {
    return [...this.history];
  }

  /**
   * Clear l'historique
   */
  clearHistory(): void {
    this.history = [];
  }

  // ═══════════════════════════════════════════════════════════════
  //   PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Extraction des indicateurs textuels
   */
  private extractTextIndicators(text: string): TextIndicators {
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    const ellipsisCount = (text.match(/\.{3}/g) || []).length;
    const capsWordsCount = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
    const negationCount = (text.match(/\b(ne|pas|non|rien|jamais|aucun)\b/gi) || [])
      .length;

    // Phrases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength =
      sentences.length > 0
        ? sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
        : 0;

    // Sentiment
    const sentimentScore = this.calculateTextSentiment(text);

    // Mots d'émotion forte
    const strongEmotionWords = this.detectStrongEmotionWords(text);

    return {
      exclamationCount,
      questionCount,
      ellipsisCount,
      capsWordsCount,
      avgSentenceLength,
      sentimentScore,
      negationCount,
      strongEmotionWords,
    };
  }

  /**
   * Calcul du sentiment textuel (-1 à +1)
   */
  private calculateTextSentiment(text: string): number {
    const lower = text.toLowerCase();
    let score = 0;

    // Mots positifs
    const positiveWords = [
      'bien',
      'bon',
      'génial',
      'super',
      'excellent',
      'parfait',
      'top',
    ];
    const negativeWords = ['mal', 'mauvais', 'nul', 'horrible', 'terrible', 'pire'];

    positiveWords.forEach(word => {
      if (lower.includes(word)) score += 0.2;
    });

    negativeWords.forEach(word => {
      if (lower.includes(word)) score -= 0.2;
    });

    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Détection de mots d'émotion forte
   */
  private detectStrongEmotionWords(text: string): string[] {
    const lower = text.toLowerCase();
    const strong: string[] = [];

    const strongWords = [
      'incroyable',
      'génial',
      'horrible',
      'terrible',
      'urgent',
      'critique',
    ];
    strongWords.forEach(word => {
      if (lower.includes(word)) strong.push(word);
    });

    return strong;
  }

  /**
   * Calcul des scores de mood
   */
  private calculateMoodScores(
    text: string,
    textIndicators: TextIndicators,
    audioIndicators?: AudioIndicators
  ): Record<UserMood, number> {
    const scores: Record<UserMood, number> = {
      calm: 0,
      curious: 0,
      focused: 0,
      excited: 0,
      tired: 0,
      stressed: 0,
      frustrated: 0,
      happy: 0,
      sad: 0,
      neutral: 0.5,
    };

    const lower = text.toLowerCase();

    // Score basé sur mots-clés
    Object.entries(EMOTION_KEYWORDS).forEach(([mood, keywords]) => {
      keywords.forEach(keyword => {
        if (lower.includes(keyword)) {
          scores[mood as UserMood] += 0.3;
        }
      });
    });

    // Score basé sur ponctuation
    if (textIndicators.exclamationCount > 0) {
      scores.excited += 0.2 * textIndicators.exclamationCount;
      scores.happy += 0.1 * textIndicators.exclamationCount;
    }

    if (textIndicators.questionCount > 0) {
      scores.curious += 0.2 * textIndicators.questionCount;
    }

    if (textIndicators.ellipsisCount > 0) {
      scores.tired += 0.15 * textIndicators.ellipsisCount;
      scores.calm += 0.1 * textIndicators.ellipsisCount;
    }

    if (textIndicators.capsWordsCount > 0) {
      scores.excited += 0.25 * textIndicators.capsWordsCount;
      scores.frustrated += 0.15 * textIndicators.capsWordsCount;
    }

    // Score basé sur sentiment
    if (textIndicators.sentimentScore > 0.3) {
      scores.happy += textIndicators.sentimentScore;
      scores.excited += textIndicators.sentimentScore * 0.5;
    } else if (textIndicators.sentimentScore < -0.3) {
      scores.sad += Math.abs(textIndicators.sentimentScore);
      scores.frustrated += Math.abs(textIndicators.sentimentScore) * 0.5;
    }

    // Score basé sur audio (si disponible)
    if (audioIndicators) {
      // Pitch élevé + variance → excited/stressed
      if (audioIndicators.avgPitch > 200) {
        scores.excited += 0.2;
        scores.stressed += 0.15;
      }

      // Pitch bas → calm/tired
      if (audioIndicators.avgPitch < 120) {
        scores.calm += 0.15;
        scores.tired += 0.2;
      }

      // Speech rate rapide → excited/focused
      if (audioIndicators.speechRate > 180) {
        scores.excited += 0.2;
        scores.focused += 0.15;
      }

      // Speech rate lent → tired/calm
      if (audioIndicators.speechRate < 100) {
        scores.tired += 0.25;
        scores.calm += 0.15;
      }

      // Intensity élevée → excited/frustrated
      if (audioIndicators.intensity > 0.7) {
        scores.excited += 0.2;
        scores.frustrated += 0.15;
      }

      // Tremor → stressed/nervous
      if (audioIndicators.voiceTremor) {
        scores.stressed += 0.3;
      }
    }

    // Normaliser
    const maxScore = Math.max(...Object.values(scores), 0.1);
    Object.keys(scores).forEach(key => {
      scores[key as UserMood] /= maxScore;
    });

    return scores;
  }

  /**
   * Calcul des scores d'intention
   */
  private calculateIntentionScores(
    text: string,
    textIndicators: TextIndicators
  ): Record<UserIntention, number> {
    const scores: Record<UserIntention, number> = {
      question: 0,
      command: 0,
      doubt: 0,
      affirmation: 0,
      urgency: 0,
      casual: 0,
      reflection: 0,
      complaint: 0,
      thanks: 0,
      unknown: 0.5,
    };

    const lower = text.toLowerCase();

    // Score basé sur mots-clés
    Object.entries(INTENTION_KEYWORDS).forEach(([intention, keywords]) => {
      keywords.forEach(keyword => {
        if (lower.includes(keyword)) {
          scores[intention as UserIntention] += 0.4;
        }
      });
    });

    // Question marks → question
    if (textIndicators.questionCount > 0) {
      scores.question += 0.5 * textIndicators.questionCount;
    }

    // Exclamation + imperative → command
    if (textIndicators.exclamationCount > 0 && lower.match(/\b(fais|fait|lance)\b/)) {
      scores.command += 0.4;
    }

    // Strong emotion words → urgency
    if (textIndicators.strongEmotionWords.length > 0) {
      scores.urgency += 0.3 * textIndicators.strongEmotionWords.length;
    }

    // Negative sentiment → complaint
    if (textIndicators.sentimentScore < -0.4) {
      scores.complaint += Math.abs(textIndicators.sentimentScore);
    }

    // Normaliser
    const maxScore = Math.max(...Object.values(scores), 0.1);
    Object.keys(scores).forEach(key => {
      scores[key as UserIntention] /= maxScore;
    });

    return scores;
  }

  /**
   * Obtenir l'élément dominant d'un score
   */
  private getDominant<T extends string>(scores: Record<T, number>): T {
    let maxKey: T = Object.keys(scores)[0] as T;
    let maxValue = scores[maxKey];

    Object.entries(scores).forEach(([key, value]) => {
      if ((value as number) > maxValue) {
        maxKey = key as T;
        maxValue = value as number;
      }
    });

    return maxKey;
  }

  /**
   * Calcul du niveau d'énergie
   */
  private calculateEnergy(
    audioIndicators?: AudioIndicators,
    textIndicators?: TextIndicators
  ): number {
    let energy = 0.5; // baseline

    if (audioIndicators) {
      // Speech rate influence
      const rateNorm = Math.min(audioIndicators.speechRate / 200, 1);
      energy += rateNorm * 0.3;

      // Intensity influence
      energy += audioIndicators.intensity * 0.2;
    }

    if (textIndicators) {
      // Exclamations → high energy
      energy += textIndicators.exclamationCount * 0.05;

      // Caps words → high energy
      energy += textIndicators.capsWordsCount * 0.05;

      // Ellipsis → low energy
      energy -= textIndicators.ellipsisCount * 0.05;
    }

    return Math.max(0, Math.min(1, energy));
  }

  /**
   * Calcul de la valence émotionnelle
   */
  private calculateValence(mood: UserMood, textIndicators: TextIndicators): number {
    // Valence par mood
    const moodValence: Record<UserMood, number> = {
      calm: 0.3,
      curious: 0.4,
      focused: 0.2,
      excited: 0.8,
      tired: -0.2,
      stressed: -0.6,
      frustrated: -0.7,
      happy: 0.9,
      sad: -0.8,
      neutral: 0,
    };

    let valence = moodValence[mood];

    // Ajustement par sentiment textuel
    valence += textIndicators.sentimentScore * 0.3;

    return Math.max(-1, Math.min(1, valence));
  }

  /**
   * Calcul de la confiance de la détection
   */
  private calculateConfidence(
    moodScores: Record<UserMood, number>,
    intentionScores: Record<UserIntention, number>
  ): number {
    const moodValues = Object.values(moodScores);
    const intentionValues = Object.values(intentionScores);

    const moodMax = Math.max(...moodValues);
    const moodSecond = moodValues.sort((a, b) => b - a)[1] || 0;

    const intentionMax = Math.max(...intentionValues);
    const intentionSecond = intentionValues.sort((a, b) => b - a)[1] || 0;

    // Confiance = écart entre 1er et 2ème
    const moodConfidence = moodMax - moodSecond;
    const intentionConfidence = intentionMax - intentionSecond;

    const avgConfidence = (moodConfidence + intentionConfidence) / 2;

    return Math.max(0, Math.min(1, avgConfidence));
  }

  /**
   * Ajouter à l'historique émotionnel
   */
  private addToHistory(state: EmotionalState): void {
    this.history.push(state);

    // Limite taille historique
    if (this.history.length > this.config.historySize) {
      this.history.shift();
    }
  }
}

/**
 * Instance singleton
 */
export const emotionalStateEstimator = new EmotionalStateEstimator();

/**
 * Helper: Analyse rapide d'un texte
 */
export function analyzeEmotionalState(text: string): EmotionalState {
  return emotionalStateEstimator.analyzeText(text);
}

/**
 * Helper: Obtenir l'état récent
 */
export function getRecentEmotionalState(): EmotionalState | null {
  return emotionalStateEstimator.getRecentState();
}
