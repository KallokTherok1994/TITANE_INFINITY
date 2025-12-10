/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PROMPT ENGINE — Intent Parser
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Analyse et décode l'intention utilisateur à partir de l'entrée brute.
 *
 * Fonctionnalités:
 * - Détection de catégorie d'intention
 * - Extraction d'entités (noms, dates, etc.)
 * - Analyse de sentiment
 * - Estimation de complexité et urgence
 * - Suggestion de mode IA optimal
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  IntentProfile,
  ParsedIntent,
  IntentCategory,
  IntentEntity,
  IAMode,
  ContextSourceType,
  INTENT_KEYWORDS,
  generateContextId,
} from './promptEngine.config';

// =============================================================================
// TYPES INTERNES
// =============================================================================

interface IntentScore {
  category: IntentCategory;
  score: number;
  matches: string[];
}

interface EntityPattern {
  type: string;
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

/**
 * Patterns pour extraction d'entités
 */
const ENTITY_PATTERNS: EntityPattern[] = [
  // Fichiers
  {
    type: 'file',
    pattern: /[\w-]+\.(ts|tsx|js|jsx|json|md|css|scss|html|py|rs|toml|yaml|yml)/gi,
    extract: m => m[0],
  },
  // Chemins
  {
    type: 'path',
    pattern: /(\/[\w.-]+)+\/?/g,
    extract: m => m[0],
  },
  // URLs
  {
    type: 'url',
    pattern: /https?:\/\/[^\s]+/gi,
    extract: m => m[0],
  },
  // Nombres
  {
    type: 'number',
    pattern: /\b\d+(?:\.\d+)?\b/g,
    extract: m => m[0],
  },
  // Dates (format ISO ou FR)
  {
    type: 'date',
    pattern: /\b\d{4}-\d{2}-\d{2}\b|\b\d{2}\/\d{2}\/\d{4}\b/g,
    extract: m => m[0],
  },
  // Noms de fonctions/méthodes
  {
    type: 'function',
    pattern:
      /\b[a-z][a-zA-Z0-9]*(?:Function|Method|Handler|Callback)\b|\b[a-z][a-zA-Z0-9]*\(\)/g,
    extract: m => m[0].replace('()', ''),
  },
  // Noms de classes
  {
    type: 'class',
    pattern:
      /\b[A-Z][a-zA-Z0-9]+(?:Manager|Service|Engine|Controller|Component|Provider)\b/g,
    extract: m => m[0],
  },
  // Variables d'environnement
  {
    type: 'env_var',
    pattern: /\b[A-Z][A-Z0-9_]+\b/g,
    extract: m => m[0],
  },
  // Commandes
  {
    type: 'command',
    pattern: /`[^`]+`|npm\s+\w+|cargo\s+\w+|git\s+\w+/g,
    extract: m => m[0].replace(/`/g, ''),
  },
];

/**
 * Mots indicateurs de sentiment positif
 */
const POSITIVE_WORDS = [
  'bien',
  'super',
  'excellent',
  'parfait',
  'merci',
  'génial',
  'bravo',
  'good',
  'great',
  'excellent',
  'perfect',
  'thanks',
  'awesome',
  'amazing',
];

/**
 * Mots indicateurs de sentiment négatif
 */
const NEGATIVE_WORDS = [
  'problème',
  'erreur',
  'bug',
  'crash',
  'mal',
  'impossible',
  'échec',
  'problem',
  'error',
  'bug',
  'crash',
  'bad',
  'impossible',
  'fail',
  'broken',
];

/**
 * Mots indicateurs d'urgence
 */
const URGENCY_WORDS = [
  'urgent',
  'vite',
  'rapidement',
  'maintenant',
  'immédiatement',
  'asap',
  'urgent',
  'quick',
  'fast',
  'now',
  'immediately',
  'asap',
  'critical',
];

/**
 * Mapping intention → sources de contexte requises
 */
const INTENT_REQUIRED_CONTEXT: Record<IntentCategory, ContextSourceType[]> = {
  question: ['memory_session', 'memory_summarized', 'user_profile'],
  command: ['memory_session', 'tools_state', 'ia_config'],
  creation: ['memory_session', 'tools_result', 'user_preferences'],
  modification: ['memory_session', 'memory_summarized', 'tools_state'],
  analysis: ['memory_session', 'memory_summarized', 'memory_longterm', 'tools_result'],
  search: ['memory_session', 'search_result', 'search_cache'],
  conversation: ['memory_session', 'user_profile'],
  system: ['memory_session', 'vitals_cpu', 'vitals_ram', 'system_state', 'ia_config'],
  help: ['memory_session', 'memory_summarized'],
  unknown: ['memory_session'],
};

/**
 * Mapping intention → mode IA suggéré
 */
const INTENT_SUGGESTED_MODE: Record<IntentCategory, IAMode> = {
  question: 'standard',
  command: 'dev',
  creation: 'dev',
  modification: 'dev',
  analysis: 'architect',
  search: 'standard',
  conversation: 'standard',
  system: 'architect',
  help: 'standard',
  unknown: 'standard',
};

// =============================================================================
// CLASSE INTENT PARSER
// =============================================================================

/**
 * Parseur d'intentions utilisateur
 * Singleton pattern pour cohérence globale
 */
export class IntentParser {
  private static instance: IntentParser | null = null;

  private cache: Map<string, IntentProfile> = new Map();
  private cacheMaxSize = 100;
  private stats = {
    totalParsed: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageProcessingTime: 0,
  };

  private constructor() {
    console.log('[IntentParser] 🧠 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(): IntentParser {
    if (!IntentParser.instance) {
      IntentParser.instance = new IntentParser();
    }
    return IntentParser.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    IntentParser.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PARSING PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Parse une entrée utilisateur et retourne un profil d'intention
   */
  parseIntent(userInput: string): IntentProfile {
    const startTime = performance.now();

    // Vérifier cache
    const cacheKey = this.getCacheKey(userInput);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }
    this.stats.cacheMisses++;

    // Normaliser l'entrée
    const normalized = this.normalizeInput(userInput);

    // Détecter la catégorie
    const categoryScores = this.scoreCategories(normalized);
    const topCategory = this.getTopCategory(categoryScores);

    // Extraire les entités
    const entities = this.extractEntities(userInput);

    // Analyser sentiment
    const sentiment = this.analyzeSentiment(normalized);

    // Calculer urgence
    const urgency = this.calculateUrgency(normalized);

    // Calculer complexité
    const complexity = this.calculateComplexity(userInput, entities);

    // Construire le profil
    const parsed: ParsedIntent = {
      primary: topCategory.category,
      secondary: categoryScores[1]?.category,
      keywords: this.extractKeywords(normalized),
      entities,
      sentiment,
      urgency,
      complexity,
    };

    const profile: IntentProfile = {
      id: generateContextId('intent'),
      raw: userInput,
      parsed,
      category: topCategory.category,
      confidence: topCategory.score,
      requiredContext: INTENT_REQUIRED_CONTEXT[topCategory.category],
      suggestedMode: this.suggestMode(parsed),
      timestamp: Date.now(),
    };

    // Mettre en cache
    this.addToCache(cacheKey, profile);

    // Stats
    this.stats.totalParsed++;
    const processingTime = performance.now() - startTime;
    this.stats.averageProcessingTime =
      (this.stats.averageProcessingTime * (this.stats.totalParsed - 1) + processingTime) /
      this.stats.totalParsed;

    console.log(
      `[IntentParser] 📝 Parsed: "${userInput.substring(0, 50)}..." → ${topCategory.category} (${(topCategory.score * 100).toFixed(1)}%)`
    );

    return profile;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DÉTECTION DE CATÉGORIE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Score toutes les catégories pour l'entrée donnée
   */
  private scoreCategories(input: string): IntentScore[] {
    const scores: IntentScore[] = [];
    const inputLower = input.toLowerCase();

    for (const [category, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (category === 'unknown') continue;

      let matchCount = 0;
      const matches: string[] = [];

      for (const keyword of keywords) {
        if (inputLower.includes(keyword)) {
          matchCount++;
          matches.push(keyword);
        }
      }

      // Score basé sur le ratio de matches
      const score =
        keywords.length > 0
          ? Math.min(matchCount / Math.max(keywords.length * 0.3, 1), 1)
          : 0;

      scores.push({
        category: category as IntentCategory,
        score,
        matches,
      });
    }

    // Trier par score décroissant
    scores.sort((a, b) => b.score - a.score);

    // Si aucun score significatif, marquer comme unknown
    if (scores[0].score < 0.1) {
      scores.unshift({
        category: 'unknown',
        score: 0.5,
        matches: [],
      });
    }

    return scores;
  }

  /**
   * Obtient la catégorie la plus probable
   */
  private getTopCategory(scores: IntentScore[]): IntentScore {
    // Bonus pour '?' → question
    if (scores.some(s => s.matches.includes('?'))) {
      const questionScore = scores.find(s => s.category === 'question');
      if (questionScore) {
        questionScore.score = Math.min(questionScore.score + 0.3, 1);
      }
    }

    // Re-trier
    scores.sort((a, b) => b.score - a.score);
    return scores[0];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXTRACTION D'ENTITÉS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Extrait les entités de l'entrée
   */
  private extractEntities(input: string): IntentEntity[] {
    const entities: IntentEntity[] = [];
    const seen = new Set<string>();

    for (const pattern of ENTITY_PATTERNS) {
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(input)) !== null) {
        const value = pattern.extract(match);
        const key = `${pattern.type}:${value}`;

        if (!seen.has(key)) {
          seen.add(key);
          entities.push({
            type: pattern.type,
            value,
            confidence: 0.8,
            position: {
              start: match.index,
              end: match.index + match[0].length,
            },
          });
        }
      }
    }

    return entities;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYSE DE SENTIMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Analyse le sentiment de l'entrée (-1 à 1)
   */
  private analyzeSentiment(input: string): number {
    const lower = input.toLowerCase();
    let score = 0;

    for (const word of POSITIVE_WORDS) {
      if (lower.includes(word)) {
        score += 0.2;
      }
    }

    for (const word of NEGATIVE_WORDS) {
      if (lower.includes(word)) {
        score -= 0.2;
      }
    }

    // Points d'exclamation = plus intense
    const exclamations = (input.match(/!/g) || []).length;
    if (exclamations > 0) {
      score *= 1 + exclamations * 0.1;
    }

    // Clamper entre -1 et 1
    return Math.max(-1, Math.min(1, score));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALCUL D'URGENCE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calcule le niveau d'urgence (0 à 1)
   */
  private calculateUrgency(input: string): number {
    const lower = input.toLowerCase();
    let urgency = 0;

    for (const word of URGENCY_WORDS) {
      if (lower.includes(word)) {
        urgency += 0.25;
      }
    }

    // Points d'exclamation = plus urgent
    const exclamations = (input.match(/!/g) || []).length;
    urgency += exclamations * 0.1;

    // CAPS = plus urgent
    const capsRatio = (input.match(/[A-Z]/g) || []).length / input.length;
    if (capsRatio > 0.5) {
      urgency += 0.2;
    }

    return Math.min(1, urgency);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALCUL DE COMPLEXITÉ
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calcule la complexité de la requête (0 à 1)
   */
  private calculateComplexity(input: string, entities: IntentEntity[]): number {
    let complexity = 0;

    // Longueur du texte
    if (input.length > 200) complexity += 0.2;
    if (input.length > 500) complexity += 0.2;

    // Nombre de mots
    const wordCount = input.split(/\s+/).length;
    if (wordCount > 20) complexity += 0.15;
    if (wordCount > 50) complexity += 0.15;

    // Nombre d'entités
    if (entities.length > 3) complexity += 0.15;
    if (entities.length > 7) complexity += 0.15;

    // Présence de code
    if (input.includes('```') || input.includes('`')) {
      complexity += 0.2;
    }

    // Mots techniques
    const technicalWords = [
      'api',
      'database',
      'algorithm',
      'architecture',
      'backend',
      'frontend',
      'deploy',
    ];
    for (const word of technicalWords) {
      if (input.toLowerCase().includes(word)) {
        complexity += 0.05;
      }
    }

    return Math.min(1, complexity);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUGGESTION DE MODE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Suggère le mode IA optimal
   */
  private suggestMode(parsed: ParsedIntent): IAMode {
    let mode = INTENT_SUGGESTED_MODE[parsed.primary];

    // Si complexité élevée, upgrade le mode
    if (parsed.complexity > 0.7) {
      if (mode === 'standard') mode = 'dev';
      else if (mode === 'dev') mode = 'architect';
    }

    // Si urgence élevée, upgrade aussi
    if (parsed.urgency > 0.8) {
      if (mode === 'standard') mode = 'dev';
    }

    // Si beaucoup d'entités techniques, upgrade
    const technicalEntities = ['file', 'path', 'function', 'class', 'command'];
    const techCount = parsed.entities.filter(e =>
      technicalEntities.includes(e.type)
    ).length;
    if (techCount > 3 && mode === 'standard') {
      mode = 'dev';
    }

    return mode;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITAIRES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Normalise l'entrée utilisateur
   */
  private normalizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  /**
   * Extrait les mots-clés significatifs
   */
  private extractKeywords(input: string): string[] {
    const stopWords = new Set([
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'de',
      'du',
      'à',
      'au',
      'aux',
      'et',
      'ou',
      'mais',
      'donc',
      'car',
      'ni',
      'que',
      'qui',
      'quoi',
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'so',
      'for',
      'of',
      'to',
      'in',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'je',
      'tu',
      'il',
      'elle',
      'nous',
      'vous',
      'ils',
      'elles',
      'i',
      'you',
      'he',
      'she',
      'it',
      'we',
      'they',
      'ce',
      'cette',
      'ces',
      'mon',
      'ma',
      'mes',
      'ton',
      'ta',
      'tes',
      'this',
      'that',
      'these',
      'those',
      'my',
      'your',
      'his',
      'her',
      'its',
    ]);

    const words = input.split(/\s+/);
    return words.filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 10);
  }

  /**
   * Génère une clé de cache
   */
  private getCacheKey(input: string): string {
    // Hash simple de l'entrée
    let hash = 0;
    const normalized = input.toLowerCase().trim();
    for (let i = 0; i < normalized.length; i++) {
      hash = (hash << 5) - hash + normalized.charCodeAt(i);
      hash = hash & hash;
    }
    return `intent_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Ajoute au cache avec gestion de taille
   */
  private addToCache(key: string, profile: IntentProfile): void {
    if (this.cache.size >= this.cacheMaxSize) {
      // Supprimer l'entrée la plus ancienne
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, profile);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API PUBLIQUE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne les statistiques du parser
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[IntentParser] 🗑️ Cache cleared');
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalParsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageProcessingTime: 0,
    };
  }

  /**
   * Analyse rapide de catégorie (sans profil complet)
   */
  quickCategorize(input: string): IntentCategory {
    const normalized = this.normalizeInput(input);
    const scores = this.scoreCategories(normalized);
    return this.getTopCategory(scores).category;
  }

  /**
   * Vérifie si l'entrée est une question
   */
  isQuestion(input: string): boolean {
    return this.quickCategorize(input) === 'question' || input.includes('?');
  }

  /**
   * Vérifie si l'entrée est une commande
   */
  isCommand(input: string): boolean {
    const cat = this.quickCategorize(input);
    return cat === 'command' || cat === 'creation' || cat === 'modification';
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const intentParser = IntentParser.getInstance();
