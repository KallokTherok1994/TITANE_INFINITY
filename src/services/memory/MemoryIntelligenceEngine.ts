/**
 * TITANE∞ v20.0Ω — Memory Intelligence Engine
 * ═══════════════════════════════════════════════════════════════
 * 
 * Moteur d'intelligence mémoire qui:
 * 1. Capture TOUTES les données importantes automatiquement
 * 2. Catégorise intelligemment par projet/domaine/thème
 * 3. Filtre, fusionne, résume et trie les données
 * 4. S'adapte aux préférences utilisateur
 * 5. Ne perd AUCUNE information pertinente
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// TODO(MEMORY-P2): migrate to canonical services/unified/UnifiedMemory.ts
// Blocked by interface incompatibility: MemoryEntry vs UnifiedMemoryEntry (different fields)
// Scope: ~20 usages across 1082 lines — requires dedicated migration session
import { getUnifiedMemory, MemoryEntry } from './UnifiedMemoryService';
import { awardExperience } from '../experienceService';
import { XPSource, XP_REWARDS } from '../../types/experience';

// ═══════════════════════════════════════════════════════════════
// TAXONOMIE DE CATÉGORIES INTELLIGENTE
// ═══════════════════════════════════════════════════════════════

export interface MemoryCategory {
  /** Catégorie principale */
  main: 'project' | 'domain' | 'theme' | 'user' | 'system';
  /** Sous-catégorie */
  sub: string;
  /** Tags associés */
  tags: string[];
  /** Score de confiance (0-1) */
  confidence: number;
}

export interface EnhancedMemoryEntry extends MemoryEntry {
  /** Catégorisation intelligente */
  categories: MemoryCategory[];
  /** Source de l'information */
  source: 'conversation' | 'file_analysis' | 'web_search' | 'reflection' | 'decision' | 'preference' | 'project';
  /** Métadonnées enrichies */
  enrichedMetadata: {
    /** Projet associé */
    projectId?: string;
    /** Domaine (technique, créatif, personnel, business) */
    domain?: string;
    /** Thème spécifique */
    theme?: string;
    /** Mots-clés extraits */
    keywords: string[];
    /** Sentiment (positif, neutre, négatif) */
    sentiment?: 'positive' | 'neutral' | 'negative';
    /** Niveau d'urgence */
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    /** Relation avec d'autres entrées */
    relatedIds: string[];
    /** Version de l'entrée (pour historique) */
    version: number;
    /** Hash de contenu pour déduplication */
    contentHash: string;
    /** Date de dernière modification */
    lastModified: number;
    /** Indique si l'entrée a été validée par l'utilisateur */
    userValidated: boolean;
    /** Indique si l'entrée doit être préservée (ne jamais supprimer) */
    preserve: boolean;
  };
}

export interface CaptureContext {
  /** Type de source */
  sourceType: 'chat_message' | 'file_analysis' | 'web_search' | 'reflection' | 'decision' | 'preference';
  /** ID de conversation */
  conversationId?: string;
  /** Métadonnées de contexte */
  context?: Record<string, unknown>;
  /** Forcer la capture même si faible importance */
  forceCapture?: boolean;
}

export interface ProcessingOptions {
  /** Filtrer les doublons */
  deduplicate: boolean;
  /** Fusionner les entrées liées */
  mergeRelated: boolean;
  /** Résumer les longues conversations */
  summarize: boolean;
  /** Trier par pertinence */
  sortByRelevance: boolean;
  /** Préserver les entrées importantes */
  preserveImportant: boolean;
}

export interface CategoryTaxonomy {
  /** Projets connus */
  projects: Array<{
    id: string;
    name: string;
    aliases: string[];
    domain: string;
  }>;
  /** Domaines */
  domains: Array<{
    id: string;
    name: string;
    keywords: string[];
  }>;
  /** Thèmes */
  themes: Array<{
    id: string;
    name: string;
    domain: string;
    keywords: string[];
  }>;
}

// ═══════════════════════════════════════════════════════════════
// TAXONOMIE PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TAXONOMY: CategoryTaxonomy = {
  projects: [
    {
      id: 'titane',
      name: 'TITANE∞',
      aliases: ['titane', 'titan', 'système cognitif', 'cognitive system'],
      domain: 'technical',
    },
    {
      id: 'humain-total',
      name: 'Humain Total',
      aliases: ['humain total', 'ht', 'transformation', 'coaching'],
      domain: 'personal',
    },
    {
      id: 'kallok-arts',
      name: "Kallok's Arts",
      aliases: ['kallok', 'arts', 'boutique', 'pod', 'print on demand'],
      domain: 'creative',
    },
    {
      id: 'livre',
      name: 'Là où tout s\'éclaircit',
      aliases: ['livre', 'book', 'éclaircit', '12 chapitres'],
      domain: 'creative',
    },
  ],
  domains: [
    {
      id: 'technical',
      name: 'Technique',
      keywords: ['code', 'développement', 'architecture', 'système', 'configuration', 'bug', 'fix', 'api', 'rust', 'typescript', 'react', 'tauri'],
    },
    {
      id: 'creative',
      name: 'Créatif',
      keywords: ['design', 'art', 'création', 'écriture', 'poésie', 'esthétique', 'style', 'couleur'],
    },
    {
      id: 'personal',
      name: 'Personnel',
      keywords: ['préférence', 'goût', 'habitude', 'routine', 'bien-être', 'santé', 'émotion'],
    },
    {
      id: 'business',
      name: 'Business',
      keywords: ['stratégie', 'positionnement', 'offre', 'client', 'revenu', 'marketing', 'vente'],
    },
    {
      id: 'learning',
      name: 'Apprentissage',
      keywords: ['apprendre', 'comprendre', 'découvrir', 'expérimenter', 'méthode', 'technique'],
    },
  ],
  themes: [
    {
      id: 'architecture',
      name: 'Architecture',
      domain: 'technical',
      keywords: ['architecture', 'structure', 'modulaire', 'ring', 'boundary', 'ipc', 'gateway'],
    },
    {
      id: 'memory',
      name: 'Mémoire',
      domain: 'technical',
      keywords: ['mémoire', 'memory', 'stm', 'mtm', 'ltm', 'souvenir', 'rappel'],
    },
    {
      id: 'ai',
      name: 'Intelligence Artificielle',
      domain: 'technical',
      keywords: ['ia', 'ai', 'llm', 'modèle', 'prompt', 'ollama', 'gemini', 'claude'],
    },
    {
      id: 'coaching',
      name: 'Coaching',
      domain: 'personal',
      keywords: ['coaching', 'accompagnement', 'guidance', 'développement', 'transformation'],
    },
    {
      id: 'strategy',
      name: 'Stratégie',
      domain: 'business',
      keywords: ['stratégie', 'vision', 'plan', 'objectif', 'gisement', 'positionnement'],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// MOTEUR D'INTELLIGENCE MÉMOIRE
// ═══════════════════════════════════════════════════════════════

export class MemoryIntelligenceEngine {
  private unifiedMemory = getUnifiedMemory();
  private taxonomy: CategoryTaxonomy = DEFAULT_TAXONOMY;
  private userPreferences: Map<string, number> = new Map();
  private captureHistory: Map<string, number> = new Map();

  constructor() {
    this.loadUserPreferences();
  }

  /**
   * Charge les préférences utilisateur depuis le stockage
   */
  private async loadUserPreferences(): Promise<void> {
    try {
      const memories = await this.unifiedMemory.recall({
        types: ['preference'],
        limit: 100,
      });
      for (const memory of memories) {
        const prefKey = memory.content.toLowerCase();
        this.userPreferences.set(prefKey, memory.importance);
      }
    } catch {
      // Ignore errors
    }
  }

  /**
   * Capture intelligente de TOUTES les données importantes
   */
  async capture(
    content: string,
    context: CaptureContext,
    importance?: number
  ): Promise<EnhancedMemoryEntry | null> {
    // Ne pas capturer si le contenu est vide ou trop court
    if (!content || content.trim().length < 10) {
      return null;
    }

    // Calculer l'importance si non fournie
    const calculatedImportance = importance !== undefined ? importance : this.calculateImportance(content, context);

    // Ne pas capturer si trop peu important (sauf si forcé)
    if (calculatedImportance < 0.15 && !context.forceCapture) {
      return null;
    }

    // Catégoriser intelligemment
    const categories = this.categorize(content, context);

    // Extraire les mots-clés
    const keywords = this.extractKeywords(content);

    // Détecter le sentiment
    const sentiment = this.detectSentiment(content);

    // Détecter l'urgence
    const urgency = this.detectUrgency(content, context);

    // Calculer le hash de contenu
    const contentHash = this.hashContent(content);

    // Vérifier les doublons
    if (await this.isDuplicate(contentHash, context.conversationId)) {
      return null;
    }

    // Déterminer la source
    const source = this.determineSource(context);

    // Trouver les entrées liées
    const relatedIds = await this.findRelatedEntries(keywords, categories);

    // Créer l'entrée enrichie
    const entry: EnhancedMemoryEntry = {
      id: crypto.randomUUID(),
      content,
      type: this.determineType(context.sourceType),
      importance: calculatedImportance,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      conversationId: context.conversationId,
      metadata: {
        source: context.sourceType,
        ...context.context,
      },
      categories,
      source,
      enrichedMetadata: {
        projectId: this.extractProjectId(categories),
        domain: this.extractDomain(categories),
        theme: this.extractTheme(categories),
        keywords,
        sentiment,
        urgency,
        relatedIds,
        version: 1,
        contentHash,
        lastModified: Date.now(),
        userValidated: false,
        preserve: urgency === 'critical' || calculatedImportance > 0.8,
      },
    };

    // Stocker dans le service unifié
    const stored = await this.unifiedMemory.store(
      entry.content,
      entry.type,
      entry.importance,
      entry.conversationId,
      {
        ...entry.metadata,
        categories: entry.categories,
        enrichedMetadata: entry.enrichedMetadata,
      }
    );

    // Mettre à jour l'historique de capture
    this.captureHistory.set(stored.id, Date.now());

    // Mettre à jour les préférences utilisateur si pertinent
    if (entry.type === 'preference') {
      this.userPreferences.set(content.toLowerCase(), entry.importance);
    }

    return { ...entry, ...stored };
  }

  /**
   * Capture automatique d'un échange conversationnel complet
   */
  async captureExchange(
    userMessage: string,
    aiResponse: string,
    conversationId: string,
    metadata?: Record<string, unknown>
  ): Promise<EnhancedMemoryEntry[]> {
    const captured: EnhancedMemoryEntry[] = [];

    // 1. Capturer le message utilisateur
    const userEntry = await this.capture(userMessage, {
      sourceType: 'chat_message',
      conversationId,
      context: { role: 'user', ...metadata },
    });
    if (userEntry) captured.push(userEntry);

    // 2. Capturer la réponse IA
    const aiEntry = await this.capture(aiResponse, {
      sourceType: 'chat_message',
      conversationId,
      context: { role: 'assistant', ...metadata },
    });
    if (aiEntry) captured.push(aiEntry);

    // 3. Extraire et capturer les préférences utilisateur
    const preferences = this.extractPreferences(userMessage);
    for (const pref of preferences) {
      const prefEntry = await this.capture(pref.content, {
        sourceType: 'preference',
        conversationId,
        context: { extracted_importance: pref.importance },
        forceCapture: true,
      });
      if (prefEntry) captured.push(prefEntry);
    }

    // 4. Extraire et capturer les faits importants de la réponse IA
    const facts = this.extractFacts(aiResponse);
    for (const fact of facts) {
      const factEntry = await this.capture(fact.content, {
        sourceType: 'reflection',
        conversationId,
        context: { extracted_importance: fact.importance },
      });
      if (factEntry) captured.push(factEntry);
    }

    // 5. Décisions et engagements
    const decisions = this.extractDecisions(userMessage);
    for (const decision of decisions) {
      const decisionEntry = await this.capture(decision, {
        sourceType: 'decision',
        conversationId,
        forceCapture: true,
      });
      if (decisionEntry) captured.push(decisionEntry);
    }

    return captured;
  }

  /**
   * Capture de résultats d'analyse de fichier
   */
  async captureFileAnalysis(
    filePath: string,
    analysisResult: string,
    conversationId?: string
  ): Promise<EnhancedMemoryEntry | null> {
    return this.capture(
      `Analyse de ${filePath}: ${analysisResult}`,
      {
        sourceType: 'file_analysis',
        conversationId,
        context: { filePath, analysisType: 'file' },
      }
    );
  }

  /**
   * Capture de résultats de recherche web
   */
  async captureWebSearch(
    query: string,
    results: Array<{ title: string; url: string; snippet: string }>,
    conversationId?: string
  ): Promise<EnhancedMemoryEntry[]> {
    const captured: EnhancedMemoryEntry[] = [];

    // Capturer la requête
    const queryEntry = await this.capture(
      `Recherche web: ${query}`,
      {
        sourceType: 'web_search',
        conversationId,
        context: { query, resultCount: results.length },
      }
    );
    if (queryEntry) captured.push(queryEntry);

    // Capturer les résultats importants
    for (const result of results.slice(0, 3)) {
      if (result.snippet && result.snippet.length > 50) {
        const resultEntry = await this.capture(
          `${result.title}: ${result.snippet}`,
          {
            sourceType: 'web_search',
            conversationId,
            context: { url: result.url, title: result.title },
          }
        );
        if (resultEntry) captured.push(resultEntry);
      }
    }

    return captured;
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTHODES DE CALCUL ET ANALYSE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calcule l'importance d'un contenu
   */
  private calculateImportance(content: string, context: CaptureContext): number {
    let importance = 0.1;

    // Longueur du contenu
    if (content.length > 200) importance += 0.15;
    if (content.length > 500) importance += 0.15;

    // Type de source
    const sourceWeights: Record<string, number> = {
      decision: 0.4,
      preference: 0.3,
      file_analysis: 0.25,
      web_search: 0.2,
      reflection: 0.15,
      chat_message: 0.05,
    };
    importance += sourceWeights[context.sourceType] || 0;

    // Mots-clés importants
    const importantPatterns = [
      /important/i, /crucial/i, /essentiel/i, /décision/i,
      /préférence/i, /projet/i, /configuration/i, /architecture/i,
      /bug/i, /fix/i, /solution/i, /méthode/i,
    ];
    for (const pattern of importantPatterns) {
      if (pattern.test(content)) {
        importance += 0.15;
        break;
      }
    }

    // Ajustement selon préférences utilisateur
    const lowerContent = content.toLowerCase();
    for (const [pref, weight] of this.userPreferences) {
      if (lowerContent.includes(pref)) {
        importance += weight * 0.1;
      }
    }

    return Math.min(1.0, Math.max(0.0, importance));
  }

  /**
   * Catégorise un contenu intelligemment
   */
  private categorize(content: string, context: CaptureContext): MemoryCategory[] {
    const categories: MemoryCategory[] = [];
    if (!content) return categories;
    const lowerContent = content.toLowerCase();

    // Détecter les projets
    for (const project of this.taxonomy.projects) {
      if (!project || !project.aliases) continue;
      const matches = project.aliases.some(alias => lowerContent.includes(alias.toLowerCase()));
      if (matches) {
        categories.push({
          main: 'project',
          sub: project.id,
          tags: [project.name, project.domain],
          confidence: 0.8,
        });
      }
    }

    // Détecter les domaines
    for (const domain of this.taxonomy.domains) {
      if (!domain || !domain.keywords) continue;
      const matchCount = domain.keywords.filter(kw => lowerContent.includes(kw)).length;
      if (matchCount > 0) {
        categories.push({
          main: 'domain',
          sub: domain.id,
          tags: domain.keywords.filter(kw => lowerContent.includes(kw)),
          confidence: Math.min(1.0, matchCount * 0.2),
        });
      }
    }

    // Détecter les thèmes
    for (const theme of this.taxonomy.themes) {
      if (!theme || !theme.keywords) continue;
      const matchCount = theme.keywords.filter(kw => lowerContent.includes(kw)).length;
      if (matchCount > 0) {
        categories.push({
          main: 'theme',
          sub: theme.id,
          tags: theme.keywords.filter(kw => lowerContent.includes(kw)),
          confidence: Math.min(1.0, matchCount * 0.25),
        });
      }
    }

    // Catégorie par défaut si rien détecté
    if (categories.length === 0) {
      categories.push({
        main: 'system',
        sub: 'uncategorized',
        tags: [],
        confidence: 0.3,
      });
    }

    return categories;
  }

  /**
   * Extrait les mots-clés significatifs
   */
  private extractKeywords(content: string): string[] {
    if (!content) return [];
    
    const stopwords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc',
      'car', 'ni', 'que', 'qui', 'quoi', 'quel', 'quelle', 'quels', 'quelles',
      'est', 'sont', 'être', 'avoir', 'faire', 'dit', 'avec', 'dans', 'sur',
      'pour', 'par', 'en', 'au', 'aux', 'ce', 'ces', 'cette', 'mon', 'ma',
      'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'votre',
      'vos', 'leur', 'leurs', 'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous',
      'ils', 'elles', 'me', 'te', 'se', 'lui', 'leur', 'y', 'ne', 'pas',
      'plus', 'très', 'tout', 'tous', 'toute', 'toutes', 'autre', 'autres',
      'même', 'mêmes', 'si', 'alors', 'aussi', 'bien', 'peut', 'peu',
      'après', 'avant', 'depuis', 'pendant', 'entre', 'sous', 'vers',
      'chez', 'c\'est', 'il\'est', 'elle\'est', 'nous\'sommes', 'vous\'êtes',
    ]);

    const words = content.toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿçœæ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopwords.has(w));

    // Compter les fréquences
    const freq = new Map<string, number>();
    for (const word of words) {
      freq.set(word, (freq.get(word) || 0) + 1);
    }

    // Retourner les mots les plus fréquents
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Détecte le sentiment du contenu
   */
  private detectSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const lower = content.toLowerCase();
    const positiveWords = ['bon', 'bien', 'excellent', 'parfait', 'super', 'génial', 'merci', 'content', 'heureux', 'réussi'];
    const negativeWords = ['mauvais', 'mal', 'problème', 'bug', 'erreur', 'échec', 'difficile', 'impossible', 'frustrant'];

    const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lower.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Détecte le niveau d'urgence
   */
  private detectUrgency(content: string, context: CaptureContext): 'low' | 'medium' | 'high' | 'critical' {
    const lower = content.toLowerCase();

    if (context.sourceType === 'decision') return 'high';
    if (lower.includes('urgent') || lower.includes('immédiat') || lower.includes('critique')) return 'critical';
    if (lower.includes('important') || lower.includes('nécessaire') || lower.includes('bientôt')) return 'high';
    if (lower.includes('préférence') || lower.includes('suggestion')) return 'medium';
    return 'low';
  }

  /**
   * Calcule un hash simple du contenu
   */
  private hashContent(content: string): string {
    if (!content) return '0';
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Vérifie si un contenu est un doublon
   */
  private async isDuplicate(contentHash: string, conversationId?: string): Promise<boolean> {
    try {
      const existing = await this.unifiedMemory.recall({
        keywords: [contentHash],
        limit: 1,
      });
      return existing.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Détermine la source de l'entrée
   */
  private determineSource(context: CaptureContext): EnhancedMemoryEntry['source'] {
    const sourceMap: Record<string, EnhancedMemoryEntry['source']> = {
      chat_message: 'conversation',
      file_analysis: 'file_analysis',
      web_search: 'web_search',
      reflection: 'reflection',
      decision: 'decision',
    };
    return sourceMap[context.sourceType] || 'conversation';
  }

  /**
   * Trouve les entrées liées
   */
  private async findRelatedEntries(keywords: string[], categories: MemoryCategory[]): Promise<string[]> {
    if (keywords.length === 0) return [];

    try {
      const related = await this.unifiedMemory.recall({
        keywords: keywords.slice(0, 3),
        limit: 5,
      });
      return related.map(e => e.id);
    } catch {
      return [];
    }
  }

  /**
   * Détermine le type d'entrée
   */
  private determineType(sourceType: CaptureContext['sourceType']): MemoryEntry['type'] {
    const typeMap: Record<string, MemoryEntry['type']> = {
      chat_message: 'conversation',
      file_analysis: 'knowledge',
      web_search: 'knowledge',
      reflection: 'knowledge',
      decision: 'decision',
    };
    return typeMap[sourceType] || 'context';
  }

  /**
   * Extrait l'ID du projet des catégories
   */
  private extractProjectId(categories: MemoryCategory[]): string | undefined {
    const projectCat = categories.find(c => c.main === 'project');
    return projectCat?.sub;
  }

  /**
   * Extrait le domaine des catégories
   */
  private extractDomain(categories: MemoryCategory[]): string | undefined {
    const domainCat = categories.find(c => c.main === 'domain');
    return domainCat?.sub;
  }

  /**
   * Extrait le thème des catégories
   */
  private extractTheme(categories: MemoryCategory[]): string | undefined {
    const themeCat = categories.find(c => c.main === 'theme');
    return themeCat?.sub;
  }

  /**
   * Extrait les préférences utilisateur d'un message
   */
  private extractPreferences(message: string): Array<{ content: string; importance: number }> {
    const preferences: Array<{ content: string; importance: number }> = [];

    const patterns = [
      { pattern: /je pr[eé]f[eè]re\s+(.+?)[.!]/gi, importance: 0.4 },
      { pattern: /j'aime\s+(mieux|bien|beaucoup)?\s*(.+?)[.!]/gi, importance: 0.3 },
      { pattern: /je n'aime pas\s+(.+?)[.!]/gi, importance: 0.3 },
      { pattern: /je veux\s+(.+?)[.!]/gi, importance: 0.5 },
      { pattern: /dorénavant\s+(.+?)[.!]/gi, importance: 0.4 },
      { pattern: /à partir de maintenant\s+(.+?)[.!]/gi, importance: 0.4 },
    ];

    for (const { pattern, importance } of patterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const pref = (match[2] || match[1])?.trim();
        if (pref && pref.length > 5 && pref.length < 200) {
          preferences.push({ content: pref, importance });
        }
      }
    }

    return preferences;
  }

  /**
   * Extrait les faits importants d'une réponse
   */
  private extractFacts(response: string): Array<{ content: string; importance: number }> {
    const facts: Array<{ content: string; importance: number }> = [];

    const patterns = [
      { pattern: /\b(il est important de noter que|à noter que)\s*:?\s*(.+?)[.!]/gi, importance: 0.8 },
      { pattern: /\b(en résumé|pour résumer)[,:\s]+(.+?)[.!]/gi, importance: 0.6 },
      { pattern: /\b(le point clé est que|l'essentiel est que)\s*(.+?)[.!]/gi, importance: 0.7 },
    ];

    for (const { pattern, importance } of patterns) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        const fact = match[2]?.trim();
        if (fact && fact.length > 15 && fact.length < 400) {
          facts.push({ content: fact, importance });
        }
      }
    }

    return facts;
  }

  /**
   * Extrait les décisions d'un message
   */
  private extractDecisions(message: string): string[] {
    const decisions: string[] = [];

    const patterns = [
      /décidé\s+(?:de|que|d')\s*(.+?)[.!]/gi,
      /c'est\s+(?:décidé|convenu|validé)\s*(?:de|que)?\s*(.+?)[.!]/gi,
      /on\s+(?:va|va faire|fait)\s+(.+?)[.!]/gi,
      /je\s+(?:vais|va)\s+(.+?)[.!]/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const decision = match[1]?.trim();
        if (decision && decision.length > 5) {
          decisions.push(decision);
        }
      }
    }

    return decisions;
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTHODES DE TRAITEMENT INTELLIGENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Filtre, fusionne et trie les mémoires
   */
  async processAndOptimize(
    entries: MemoryEntry[],
    options: ProcessingOptions
  ): Promise<MemoryEntry[]> {
    let processed = [...entries];

    // Dédoublonnage
    if (options.deduplicate) {
      processed = this.deduplicateEntries(processed);
    }

    // Fusion des entrées liées
    if (options.mergeRelated) {
      processed = await this.mergeRelatedEntries(processed);
    }

    // Tri par pertinence
    if (options.sortByRelevance) {
      processed = this.sortByRelevance(processed);
    }

    // Préservation des entrées importantes
    if (options.preserveImportant) {
      processed = this.preserveImportantEntries(processed);
    }

    return processed;
  }

  /**
   * Dédoublonne les entrées
   */
  private deduplicateEntries(entries: MemoryEntry[]): MemoryEntry[] {
    const seen = new Map<string, MemoryEntry>();

    for (const entry of entries) {
      if (!entry) continue;
      const hash = this.hashContent(entry.content);
      const existing = seen.get(hash);

      if (existing) {
        // Fusionner avec l'entrée existante
        existing.accessCount += (entry.accessCount ?? 0);
        existing.lastAccessed = Math.max(existing.lastAccessed ?? 0, entry.lastAccessed ?? 0);
        if ((entry.importance ?? 0) > (existing.importance ?? 0)) {
          existing.importance = entry.importance;
        }
      } else {
        seen.set(hash, entry);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Fusionne les entrées liées
   */
  private async mergeRelatedEntries(entries: MemoryEntry[]): Promise<MemoryEntry[]> {
    if (entries.length < 2) return entries;

    const merged: MemoryEntry[] = [];
    const processed = new Set<string>();

    for (const entry of entries) {
      if (!entry || !entry.id) continue;
      if (processed.has(entry.id)) continue;

      // Chercher les entrées liées
      const related = entries.filter(e =>
        e && e.id && e.id !== entry.id &&
        !processed.has(e.id) &&
        this.areRelated(entry, e)
      );

      if (related.length > 0) {
        // Fusionner
        const mergedEntry = this.mergeEntries(entry, related);
        merged.push(mergedEntry);
        processed.add(entry.id);
        related.forEach(e => {
          if (e && e.id) processed.add(e.id);
        });
      } else {
        merged.push(entry);
        processed.add(entry.id);
      }
    }

    return merged;
  }

  /**
   * Vérifie si deux entrées sont liées
   */
  private areRelated(a: MemoryEntry | undefined | null, b: MemoryEntry | undefined | null): boolean {
    if (!a || !b) return false;
    
    // Même conversation
    if (a.conversationId && b.conversationId && a.conversationId === b.conversationId) {
      return true;
    }

    // Mots-clés similaires
    const aKeywords = a.content ? this.extractKeywords(a.content) : [];
    const bKeywords = b.content ? this.extractKeywords(b.content) : [];
    
    if (!aKeywords || !bKeywords || aKeywords.length === 0 || bKeywords.length === 0) {
      return false;
    }
    
    const aWords = new Set(aKeywords);
    const bWords = new Set(bKeywords);
    
    const intersection = new Set([...aWords].filter(x => bWords.has(x)));
    const similarity = intersection.size / Math.max(aWords.size, bWords.size);

    return similarity > 0.3;
  }

  /**
   * Fusionne plusieurs entrées en une seule
   */
  private mergeEntries(primary: MemoryEntry, others: MemoryEntry[]): MemoryEntry {
    const all = [primary, ...others].filter(e => e != null);

    // Prendre la plus haute importance
    const maxImportance = Math.max(...all.map(e => e?.importance ?? 0));

    // Combiner les contenus
    const combinedContent = all
      .filter(e => e?.content)
      .map(e => e.content)
      .join(' | ');

    // Prendre le plus récent timestamp
    const maxTimestamp = Math.max(...all.map(e => e?.timestamp ?? 0));

    return {
      ...primary,
      content: combinedContent.length > 500
        ? combinedContent.slice(0, 500) + '...'
        : combinedContent,
      importance: maxImportance,
      timestamp: maxTimestamp,
      lastAccessed: Date.now(),
      accessCount: all.reduce((sum, e) => sum + (e?.accessCount ?? 0), 0),
    };
  }

  /**
   * Trie par pertinence
   */
  private sortByRelevance(entries: MemoryEntry[]): MemoryEntry[] {
    const now = Date.now();
    return entries.filter(e => e != null).sort((a, b) => {
      if (!a || !b) return 0;
      const aRecency = Math.max(0, 1 - (now - (a.lastAccessed ?? 0)) / (7 * 24 * 60 * 60 * 1000));
      const bRecency = Math.max(0, 1 - (now - (b.lastAccessed ?? 0)) / (7 * 24 * 60 * 60 * 1000));
      const aScore = (a.importance ?? 0) * 0.7 + aRecency * 0.3;
      const bScore = (b.importance ?? 0) * 0.7 + bRecency * 0.3;
      return bScore - aScore;
    });
  }

  /**
   * Préserve les entrées importantes
   */
  private preserveImportantEntries(entries: MemoryEntry[]): MemoryEntry[] {
    return entries.filter(e => {
      if (!e) return false;
      // Toujours garder les entrées avec importance > 0.8
      if ((e.importance ?? 0) > 0.8) return true;
      // Toujours garder les entrées de type decision ou knowledge
      if (e.type === 'decision' || e.type === 'knowledge') return true;
      // Garder les entrées récentes (< 7 jours)
      const age = Date.now() - (e.timestamp ?? 0);
      if (age < 7 * 24 * 60 * 60 * 1000) return true;
      // Garder les entrées fréquemment accédées
      if ((e.accessCount ?? 0) > 5) return true;
      return true; // Pour l'instant, ne rien supprimer
    });
  }

  /**
   * Génère un résumé des entrées
   */
  async summarizeEntries(entries: MemoryEntry[]): Promise<string> {
    if (entries.length === 0) return '';
    if (entries.length === 1) return entries[0]?.content ?? '';

    // Grouper par type
    const byType = new Map<string, MemoryEntry[]>();
    for (const entry of entries) {
      const type = entry.type;
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type)!.push(entry);
    }

    // Générer le résumé
    const parts: string[] = [];
    for (const [type, typeEntries] of byType) {
      if (!typeEntries || typeEntries.length === 0) continue;
      
      const sortedEntries = [...typeEntries]
        .filter(e => e && e.content)
        .sort((a, b) => {
          const aImp = a?.importance ?? 0;
          const bImp = b?.importance ?? 0;
          return bImp - aImp;
        });
      const top3 = sortedEntries.slice(0, 3);

      parts.push(`**${type}** (${typeEntries.length} entrées):`);
      for (const entry of top3) {
        if (!entry || !entry.content) continue;
        const truncated = entry.content.length > 100
          ? entry.content.slice(0, 100) + '...'
          : entry.content;
        parts.push(`  - ${truncated}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Obtient les statistiques du moteur
   */
  getStats(): {
    totalCaptures: number;
    userPreferences: number;
    taxonomyProjects: number;
    taxonomyDomains: number;
    taxonomyThemes: number;
  } {
    return {
      totalCaptures: this.captureHistory.size,
      userPreferences: this.userPreferences.size,
      taxonomyProjects: this.taxonomy.projects.length,
      taxonomyDomains: this.taxonomy.domains.length,
      taxonomyThemes: this.taxonomy.themes.length,
    };
  }
}

// Singleton
let engineInstance: MemoryIntelligenceEngine | null = null;

export function getMemoryIntelligenceEngine(): MemoryIntelligenceEngine {
  if (!engineInstance) {
    engineInstance = new MemoryIntelligenceEngine();
  }
  return engineInstance;
}

export default MemoryIntelligenceEngine;
