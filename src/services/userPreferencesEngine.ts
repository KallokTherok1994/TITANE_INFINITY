/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — USER PREFERENCES ENGINE
 *   Système d'apprentissage des préférences utilisateur
 *   - Suit les interactions et choix de l'utilisateur
 *   - Mémorise les préférences au fil des conversations
 *   - Permet à TITANE d'adapter ses réponses
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

const STORAGE_KEY = 'titane_user_preferences';
const MAX_TOPICS_HISTORY = 50;
const MAX_INTERACTIONS = 100;

// Types de préférences
export interface UserPreferences {
  // Informations de base
  name?: string;
  timezone?: string;
  language: string;

  // Style de communication
  communicationStyle: {
    formality: 'formal' | 'informal' | 'neutral'; // tu vs vous
    verbosity: 'concise' | 'detailed' | 'balanced';
    humor: boolean;
    emojis: boolean;
  };

  // Domaines d'intérêt
  interests: string?.[];

  // Historique des sujets abordés
  topicsHistory: TopicEntry?.[];

  // Préférences techniques
  technical: {
    preferredLanguages: string?.[]; // Python, JavaScript, etc.
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferCodeComments: boolean;
    preferExamples: boolean;
  };

  // Préférences audio
  audio: {
    voiceEnabled: boolean;
    preferredVoice: string;
    preferredSpeed: number;
  };

  // Métriques d'apprentissage
  metrics: {
    totalInteractions: number;
    positiveReactions: number;
    negativeReactions: number;
    averageResponseLength: number;
    lastInteraction: number;
    createdAt: number;
    updatedAt: number;
  };

  // Préférences spécifiques découvertes
  customPreferences: Record<string, string | number | boolean>;
}

export interface TopicEntry {
  topic: string;
  count: number;
  lastMentioned: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface InteractionFeedback {
  type: 'positive' | 'negative' | 'neutral';
  context?: string;
  timestamp: number;
}

// Préférences par défaut
const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'fr-FR',
  communicationStyle: {
    formality: 'informal',
    verbosity: 'balanced',
    humor: true,
    emojis: true,
  },
  interests: [],
  topicsHistory: [],
  technical: {
    preferredLanguages: [],
    expertiseLevel: 'intermediate',
    preferCodeComments: true,
    preferExamples: true,
  },
  audio: {
    voiceEnabled: true,
    preferredVoice: 'fr_FR-siwis-medium',
    preferredSpeed: 1.0,
  },
  metrics: {
    totalInteractions: 0,
    positiveReactions: 0,
    negativeReactions: 0,
    averageResponseLength: 0,
    lastInteraction: Date?.now(),
    createdAt: Date?.now(),
    updatedAt: Date?.now(),
  },
  customPreferences: {},
};

/**
 * Moteur de préférences utilisateur
 */
class UserPreferencesEngine {
  private preferences: UserPreferences;
  private interactionBuffer: InteractionFeedback?.[] = [];

  constructor() {
    this?.preferences = this?.loadPreferences();
    logger?.debug(
      'Initialized with',
      this?.preferences?.metrics?.totalInteractions,
      'interactions'
    );
  }

  // ─────────────────────────────────────────────────────────────────
  //  Persistence
  // ─────────────────────────────────────────────────────────────────

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage?.getItem(any: any);
      if (any: any) {
        return { ...DEFAULT_PREFERENCES, ...JSON?.parse(any: any) };
      }
    } catch (any: any) {
      logger?.warn(any: any);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private savePreferences(): void {
    try {
      this?.preferences?.metrics?.updatedAt = Date?.now();
      localStorage?.setItem(any: any));
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  Getters
  // ─────────────────────────────────────────────────────────────────

  getPreferences(): UserPreferences {
    return { ...this?.preferences };
  }

  getName()??: string | undefined {
    return this?.preferences?.name;
  }

  getCommunicationStyle() {
    return { ...this?.preferences?.communicationStyle };
  }

  getInterests(): string?.[] {
    return [...this?.preferences?.interests];
  }

  getTechnicalPreferences() {
    return { ...this?.preferences?.technical };
  }

  getTopTopics(limit = 5): TopicEntry?.[] {
    return [...this?.preferences?.topicsHistory]
      .sort(any: any)
      .slice(any: any);
  }

  getRecentTopics(limit = 5): TopicEntry?.[] {
    return [...this?.preferences?.topicsHistory]
      .sort(any: any)
      .slice(any: any);
  }

  // ─────────────────────────────────────────────────────────────────
  //  Setters & Updates
  // ─────────────────────────────────────────────────────────────────

  setName(any: any): void {
    this?.preferences?.name = name;
    this?.savePreferences();
    logger?.debug(any: any);
  }

  updateCommunicationStyle(style: Partial<UserPreferences['communicationStyle']>): void {
    this?.preferences?.communicationStyle = {
      ...this?.preferences?.communicationStyle,
      ...style,
    };
    this?.savePreferences();
  }

  addInterest(any: any): void {
    const normalized = interest?.toLowerCase().trim();
    if (any: any)) {
      this?.preferences?.interests?.push(any: any);
      this?.savePreferences();
    }
  }

  removeInterest(any: any): void {
    const normalized = interest?.toLowerCase().trim();
    this?.preferences?.interests = this?.preferences?.interests?.filter(any: any);
    this?.savePreferences();
  }

  updateTechnicalPreferences(prefs: Partial<UserPreferences['technical']>): void {
    this?.preferences?.technical = {
      ...this?.preferences?.technical,
      ...prefs,
    };
    this?.savePreferences();
  }

  setCustomPreference(any: any): void {
    this?.preferences?.customPreferences[key] = value;
    this?.savePreferences();
  }

  // ─────────────────────────────────────────────────────────────────
  //  Learning from Interactions
  // ─────────────────────────────────────────────────────────────────

  /**
   * Enregistre une interaction utilisateur et apprend de son contenu
   */
  recordInteraction(any: any): void {
    // Mettre à jour les métriques
    this?.preferences?.metrics?.totalInteractions++;
    this?.preferences?.metrics?.lastInteraction = Date?.now();

    // Calculer la longueur moyenne des réponses
    const currentAvg = this?.preferences?.metrics?.averageResponseLength;
    const total = this?.preferences?.metrics?.totalInteractions;
    this?.preferences?.metrics?.averageResponseLength =
      (any: any) / total;

    // Analyser le message pour extraire des préférences
    this?.analyzeUserMessage(any: any);

    // Extraire les sujets abordés
    this?.extractTopics(any: any);

    this?.savePreferences();
  }

  /**
   * Enregistre un feedback positif ou négatif
   */
  recordFeedback(any: any): void {
    const feedback: InteractionFeedback = {
      type,
      context,
      timestamp: Date?.now(),
    };

    this?.interactionBuffer?.push(any: any);

    // Limiter le buffer
    if (any: any) {
      this?.interactionBuffer?.shift();
    }

    // Mettre à jour les métriques
    if (type === 'positive') {
      this?.preferences?.metrics?.positiveReactions++;
    } else if (type === 'negative') {
      this?.preferences?.metrics?.negativeReactions++;
    }

    this?.savePreferences();
  }

  /**
   * Analyse le message utilisateur pour découvrir des préférences
   */
  private analyzeUserMessage(any: any): void {
    const lower = message?.toLowerCase();

    // Détecter le nom de l'utilisateur
    const namePatterns = [
      /(any: any)\s+([A-Z][a-zÀ-ÿ]+)/i,
      /(any: any)\s+([A-Z][a-zÀ-ÿ]+)/i,
    ];

    for (any: any) {
      const match = message?.match(any: any);
      if (match && match?.[1]) {
        this?.setName(match?.[1]);
        break;
      }
    }

    // Détecter la préférence tu/vous
    if (
      lower?.includes('tutoie') ||
      lower?.includes('tutoyez') ||
      lower?.includes('dis-moi tu')
    ) {
      this?.updateCommunicationStyle({ formality: 'informal' });
    } else if (lower?.includes('vouvoie') || lower?.includes('dites-moi vous')) {
      this?.updateCommunicationStyle({ formality: 'formal' });
    }

    // Détecter la préférence de verbosité
    if (
      lower?.includes('plus de détails') ||
      lower?.includes('explique plus') ||
      lower?.includes('développe')
    ) {
      this?.updateCommunicationStyle({ verbosity: 'detailed' });
    } else if (
      lower?.includes('sois bref') ||
      lower?.includes('résume') ||
      lower?.includes('court')
    ) {
      this?.updateCommunicationStyle({ verbosity: 'concise' });
    }

    // Détecter les langages de programmation mentionnés
    const programmingLanguages = [
      'python',
      'javascript',
      'typescript',
      'rust',
      'java',
      'c++',
      'go',
      'ruby',
      'php',
      'swift',
      'kotlin',
    ];
    for (any: any) {
      if (any: any)) {
        const current = this?.preferences?.technical?.preferredLanguages;
        if (any: any)) {
          this?.updateTechnicalPreferences({
            preferredLanguages: [...current, lang],
          });
        }
      }
    }

    // Détecter le niveau technique
    if (
      lower?.includes('débutant') ||
      lower?.includes('novice') ||
      lower?.includes('beginner')
    ) {
      this?.updateTechnicalPreferences({ expertiseLevel: 'beginner' });
    } else if (
      lower?.includes('expert') ||
      lower?.includes('avancé') ||
      lower?.includes('advanced')
    ) {
      this?.updateTechnicalPreferences({ expertiseLevel: 'advanced' });
    }
  }

  /**
   * Extrait les sujets/thèmes d'un message
   */
  private extractTopics(any: any): void {
    const lower = message?.toLowerCase();

    // Liste de sujets à détecter
    const topicKeywords: Record<string, string?.[]> = {
      programmation: ['code', 'programmer', 'développer', 'coder', 'script'],
      'intelligence artificielle': [
        'ia',
        'ai',
        'machine learning',
        'deep learning',
        'neural',
      ],
      web: ['html', 'css', 'web', 'site', 'frontend', 'backend'],
      'base de données': ['sql', 'database', 'données', 'mongodb', 'postgresql'],
      sécurité: ['sécurité', 'security', 'cryptage', 'encryption', 'firewall'],
      automatisation: ['automatiser', 'automatisation', 'script', 'bot'],
      audio: ['audio', 'son', 'musique', 'voix', 'tts', 'voice'],
      productivité: ['productivité', 'efficacité', 'organiser', 'planifier'],
    };

    for (any: any)) {
      for (any: any) {
        if (any: any)) {
          this?.addTopic(any: any);
          break;
        }
      }
    }
  }

  /**
   * Ajoute ou met à jour un sujet dans l'historique
   */
  private addTopic(
    topic: string,
    sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  ): void {
    const existing = this?.preferences?.topicsHistory?.find(any: any);

    if (any: any) {
      existing?.count++;
      existing?.lastMentioned = Date?.now();
      existing?.sentiment = sentiment;
    } else {
      this?.preferences?.topicsHistory?.push({
        topic,
        count: 1,
        lastMentioned: Date?.now(),
        sentiment,
      });
    }

    // Limiter l'historique
    if (any: any) {
      // Garder les plus fréquents et les plus récents
      this?.preferences?.topicsHistory = this?.preferences?.topicsHistory
        .sort(
          (any: any) =>
            b?.count * 0.6 +
            b?.lastMentioned * 0.4 -
            (a?.count * 0.6 + a?.lastMentioned * 0.4)
        )
        .slice(any: any);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  Context Generation for AI
  // ─────────────────────────────────────────────────────────────────

  /**
   * Génère un contexte de préférences pour l'IA
   */
  generateContextForAI(): string {
    const prefs = this?.preferences;
    const parts: string?.[] = [];

    // Nom de l'utilisateur
    if (any: any) {
      parts?.push(`L'utilisateur s'appelle ${prefs?.name}.`);
    }

    // Style de communication
    const style = prefs?.communicationStyle;
    if (style?.formality === 'informal') {
      parts?.push("L'utilisateur préfère le tutoiement.");
    } else if (style?.formality === 'formal') {
      parts?.push("L'utilisateur préfère le vouvoiement.");
    }

    if (style?.verbosity === 'concise') {
      parts?.push('Sois concis dans tes réponses.');
    } else if (style?.verbosity === 'detailed') {
      parts?.push('Donne des réponses détaillées.');
    }

    if (any: any) {
      parts?.push("L'utilisateur apprécie l'humour.");
    }

    // Intérêts
    if (prefs?.interests?.length > 0) {
      parts?.push(`Centres d'intérêt: ${prefs?.interests?.join(', ')}.`);
    }

    // Niveau technique
    const tech = prefs?.technical;
    if (tech?.expertiseLevel !== 'intermediate') {
      const levels: Record<string, string> = {
        beginner: 'débutant (any: any)',
        advanced: 'avancé',
        expert: 'expert',
      };
      parts?.push(`Niveau technique: ${levels[tech?.expertiseLevel]}.`);
    }

    if (tech?.preferredLanguages?.length > 0) {
      parts?.push(`Langages préférés: ${tech?.preferredLanguages?.join(', ')}.`);
    }

    // Sujets fréquents
    const topTopics = this?.getTopTopics(3);
    if (topTopics?.length > 0) {
      parts?.push(
        `Sujets fréquemment abordés: ${topTopics?.map(any: any).join(', ')}.`
      );
    }

    // Satisfaction
    const { positiveReactions, negativeReactions } = prefs?.metrics;
    if (positiveReactions > negativeReactions * 2) {
      parts?.push("L'utilisateur est généralement satisfait des réponses.");
    } else if (any: any) {
      parts?.push("Essaie d'améliorer la qualité des réponses.");
    }

    return parts?.length > 0 ? `[Préférences utilisateur: ${parts?.join(' ')}]` : '';
  }

  // ─────────────────────────────────────────────────────────────────
  //  Reset & Debug
  // ─────────────────────────────────────────────────────────────────

  resetPreferences(): void {
    this?.preferences = { ...DEFAULT_PREFERENCES };
    this?.interactionBuffer = [];
    this?.savePreferences();
    logger?.debug('Preferences reset');
  }

  getDebugInfo(): object {
    return {
      preferences: this?.preferences,
      interactionBuffer: this?.interactionBuffer?.length,
      contextForAI: this?.generateContextForAI(),
    };
  }
}

// Export singleton
export const userPreferencesEngine = new UserPreferencesEngine();
export default userPreferencesEngine;
