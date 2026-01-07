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
  interests: string[];

  // Historique des sujets abordés
  topicsHistory: TopicEntry[];

  // Préférences techniques
  technical: {
    preferredLanguages: string[]; // Python, JavaScript, etc.
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
    lastInteraction: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  customPreferences: {},
};

/**
 * Moteur de préférences utilisateur
 */
class UserPreferencesEngine {
  private preferences: UserPreferences;
  private interactionBuffer: InteractionFeedback[] = [];

  constructor() {
    this.preferences = this.loadPreferences();
    logger.debug(
      'Initialized with',
      this.preferences.metrics.totalInteractions,
      'interactions'
    );
  }

  // ─────────────────────────────────────────────────────────────────
  //  Persistence
  // ─────────────────────────────────────────────────────────────────

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.warn('Failed to load preferences:', error);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  private savePreferences(): void {
    try {
      this.preferences.metrics.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      logger.error('Failed to save preferences:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  Getters
  // ─────────────────────────────────────────────────────────────────

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  getName(): string | undefined {
    return this.preferences.name;
  }

  getCommunicationStyle() {
    return { ...this.preferences.communicationStyle };
  }

  getInterests(): string[] {
    return [...this.preferences.interests];
  }

  getTechnicalPreferences() {
    return { ...this.preferences.technical };
  }

  getTopTopics(limit = 5): TopicEntry[] {
    return [...this.preferences.topicsHistory]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getRecentTopics(limit = 5): TopicEntry[] {
    return [...this.preferences.topicsHistory]
      .sort((a, b) => b.lastMentioned - a.lastMentioned)
      .slice(0, limit);
  }

  // ─────────────────────────────────────────────────────────────────
  //  Setters & Updates
  // ─────────────────────────────────────────────────────────────────

  setName(name: string): void {
    this.preferences.name = name;
    this.savePreferences();
    logger.debug('Name set to:', name);
  }

  updateCommunicationStyle(style: Partial<UserPreferences['communicationStyle']>): void {
    this.preferences.communicationStyle = {
      ...this.preferences.communicationStyle,
      ...style,
    };
    this.savePreferences();
  }

  addInterest(interest: string): void {
    const normalized = interest.toLowerCase().trim();
    if (!this.preferences.interests.includes(normalized)) {
      this.preferences.interests.push(normalized);
      this.savePreferences();
    }
  }

  removeInterest(interest: string): void {
    const normalized = interest.toLowerCase().trim();
    this.preferences.interests = this.preferences.interests.filter(i => i !== normalized);
    this.savePreferences();
  }

  updateTechnicalPreferences(prefs: Partial<UserPreferences['technical']>): void {
    this.preferences.technical = {
      ...this.preferences.technical,
      ...prefs,
    };
    this.savePreferences();
  }

  setCustomPreference(key: string, value: string | number | boolean): void {
    this.preferences.customPreferences[key] = value;
    this.savePreferences();
  }

  // ─────────────────────────────────────────────────────────────────
  //  Learning from Interactions
  // ─────────────────────────────────────────────────────────────────

  /**
   * Enregistre une interaction utilisateur et apprend de son contenu
   */
  recordInteraction(userMessage: string, aiResponse: string): void {
    // Mettre à jour les métriques
    this.preferences.metrics.totalInteractions++;
    this.preferences.metrics.lastInteraction = Date.now();

    // Calculer la longueur moyenne des réponses
    const currentAvg = this.preferences.metrics.averageResponseLength;
    const total = this.preferences.metrics.totalInteractions;
    this.preferences.metrics.averageResponseLength =
      (currentAvg * (total - 1) + aiResponse.length) / total;

    // Analyser le message pour extraire des préférences
    this.analyzeUserMessage(userMessage);

    // Extraire les sujets abordés
    this.extractTopics(userMessage);

    this.savePreferences();
  }

  /**
   * Enregistre un feedback positif ou négatif
   */
  recordFeedback(type: 'positive' | 'negative' | 'neutral', context?: string): void {
    const feedback: InteractionFeedback = {
      type,
      context,
      timestamp: Date.now(),
    };

    this.interactionBuffer.push(feedback);

    // Limiter le buffer
    if (this.interactionBuffer.length > MAX_INTERACTIONS) {
      this.interactionBuffer.shift();
    }

    // Mettre à jour les métriques
    if (type === 'positive') {
      this.preferences.metrics.positiveReactions++;
    } else if (type === 'negative') {
      this.preferences.metrics.negativeReactions++;
    }

    this.savePreferences();
  }

  /**
   * Analyse le message utilisateur pour découvrir des préférences
   */
  private analyzeUserMessage(message: string): void {
    const lower = message.toLowerCase();

    // Détecter le nom de l'utilisateur
    const namePatterns = [
      /(?:je m'appelle|mon nom est|je suis|appelle[z]?-moi|call me)\s+([A-Z][a-zÀ-ÿ]+)/i,
      /(?:my name is|i'm|i am)\s+([A-Z][a-zÀ-ÿ]+)/i,
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        this.setName(match[1]);
        break;
      }
    }

    // Détecter la préférence tu/vous
    if (
      lower.includes('tutoie') ||
      lower.includes('tutoyez') ||
      lower.includes('dis-moi tu')
    ) {
      this.updateCommunicationStyle({ formality: 'informal' });
    } else if (lower.includes('vouvoie') || lower.includes('dites-moi vous')) {
      this.updateCommunicationStyle({ formality: 'formal' });
    }

    // Détecter la préférence de verbosité
    if (
      lower.includes('plus de détails') ||
      lower.includes('explique plus') ||
      lower.includes('développe')
    ) {
      this.updateCommunicationStyle({ verbosity: 'detailed' });
    } else if (
      lower.includes('sois bref') ||
      lower.includes('résume') ||
      lower.includes('court')
    ) {
      this.updateCommunicationStyle({ verbosity: 'concise' });
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
    for (const lang of programmingLanguages) {
      if (lower.includes(lang)) {
        const current = this.preferences.technical.preferredLanguages;
        if (!current.includes(lang)) {
          this.updateTechnicalPreferences({
            preferredLanguages: [...current, lang],
          });
        }
      }
    }

    // Détecter le niveau technique
    if (
      lower.includes('débutant') ||
      lower.includes('novice') ||
      lower.includes('beginner')
    ) {
      this.updateTechnicalPreferences({ expertiseLevel: 'beginner' });
    } else if (
      lower.includes('expert') ||
      lower.includes('avancé') ||
      lower.includes('advanced')
    ) {
      this.updateTechnicalPreferences({ expertiseLevel: 'advanced' });
    }
  }

  /**
   * Extrait les sujets/thèmes d'un message
   */
  private extractTopics(message: string): void {
    const lower = message.toLowerCase();

    // Liste de sujets à détecter
    const topicKeywords: Record<string, string[]> = {
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

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          this.addTopic(topic);
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
    const existing = this.preferences.topicsHistory.find(t => t.topic === topic);

    if (existing) {
      existing.count++;
      existing.lastMentioned = Date.now();
      existing.sentiment = sentiment;
    } else {
      this.preferences.topicsHistory.push({
        topic,
        count: 1,
        lastMentioned: Date.now(),
        sentiment,
      });
    }

    // Limiter l'historique
    if (this.preferences.topicsHistory.length > MAX_TOPICS_HISTORY) {
      // Garder les plus fréquents et les plus récents
      this.preferences.topicsHistory = this.preferences.topicsHistory
        .sort(
          (a, b) =>
            b.count * 0.6 +
            b.lastMentioned * 0.4 -
            (a.count * 0.6 + a.lastMentioned * 0.4)
        )
        .slice(0, MAX_TOPICS_HISTORY);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  //  Context Generation for AI
  // ─────────────────────────────────────────────────────────────────

  /**
   * Génère un contexte de préférences pour l'IA
   */
  generateContextForAI(): string {
    const prefs = this.preferences;
    const parts: string[] = [];

    // Nom de l'utilisateur
    if (prefs.name) {
      parts.push(`L'utilisateur s'appelle ${prefs.name}.`);
    }

    // Style de communication
    const style = prefs.communicationStyle;
    if (style.formality === 'informal') {
      parts.push("L'utilisateur préfère le tutoiement.");
    } else if (style.formality === 'formal') {
      parts.push("L'utilisateur préfère le vouvoiement.");
    }

    if (style.verbosity === 'concise') {
      parts.push('Sois concis dans tes réponses.');
    } else if (style.verbosity === 'detailed') {
      parts.push('Donne des réponses détaillées.');
    }

    if (style.humor) {
      parts.push("L'utilisateur apprécie l'humour.");
    }

    // Intérêts
    if (prefs.interests.length > 0) {
      parts.push(`Centres d'intérêt: ${prefs.interests.join(', ')}.`);
    }

    // Niveau technique
    const tech = prefs.technical;
    if (tech.expertiseLevel !== 'intermediate') {
      const levels: Record<string, string> = {
        beginner: 'débutant (explications simples)',
        advanced: 'avancé',
        expert: 'expert',
      };
      parts.push(`Niveau technique: ${levels[tech.expertiseLevel]}.`);
    }

    if (tech.preferredLanguages.length > 0) {
      parts.push(`Langages préférés: ${tech.preferredLanguages.join(', ')}.`);
    }

    // Sujets fréquents
    const topTopics = this.getTopTopics(3);
    if (topTopics.length > 0) {
      parts.push(
        `Sujets fréquemment abordés: ${topTopics.map(t => t.topic).join(', ')}.`
      );
    }

    // Satisfaction
    const { positiveReactions, negativeReactions } = prefs.metrics;
    if (positiveReactions > negativeReactions * 2) {
      parts.push("L'utilisateur est généralement satisfait des réponses.");
    } else if (negativeReactions > positiveReactions) {
      parts.push("Essaie d'améliorer la qualité des réponses.");
    }

    return parts.length > 0 ? `[Préférences utilisateur: ${parts.join(' ')}]` : '';
  }

  // ─────────────────────────────────────────────────────────────────
  //  Reset & Debug
  // ─────────────────────────────────────────────────────────────────

  resetPreferences(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.interactionBuffer = [];
    this.savePreferences();
    logger.debug('Preferences reset');
  }

  getDebugInfo(): object {
    return {
      preferences: this.preferences,
      interactionBuffer: this.interactionBuffer.length,
      contextForAI: this.generateContextForAI(),
    };
  }
}

// Export singleton
export const userPreferencesEngine = new UserPreferencesEngine();
export default userPreferencesEngine;
