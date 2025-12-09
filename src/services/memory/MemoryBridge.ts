/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — Memory Bridge
 *   Pont entre les conversations chat et le système de mémoire
 *   Phase 1 minimal : Détection d'intention, récupération, injection
 * ═══════════════════════════════════════════════════════════════
 */

export interface MemoryRetrievalResult {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'context' | 'conversation';
  relevance: number;
  timestamp: number;
}

export interface IntentDetectionResult {
  needsMemory: boolean;
  intent: 'recall' | 'store' | 'clarify' | 'none';
  keywords: string[];
  confidence: number;
}

export interface MemoryInjection {
  systemPromptAddition: string;
  relevantMemories: MemoryRetrievalResult[];
  contextSize: number;
}

// Patterns pour détecter l'intention de rappel de mémoire
const RECALL_PATTERNS = [
  /tu te souviens/i,
  /on avait parl[eé]/i,
  /comme (je|tu|on) (ai|as|a) dit/i,
  /la derni[eè]re fois/i,
  /avant[,\s]/i,
  /rappelle[- ]?toi/i,
  /souviens[- ]?toi/i,
  /tu sais que/i,
  /on [aé]tait/i,
  /j'avais mentionn[eé]/i,
  /concernant notre/i,
  /par rapport [aà]/i,
];

// Patterns pour détecter l'intention de stockage
const STORE_PATTERNS = [
  /retiens (que|ça)/i,
  /note (que|ça)/i,
  /souviens[- ]?toi (que|de)/i,
  /n'oublie pas/i,
  /garde en m[eé]moire/i,
  /important[:\s]/i,
  /pour info/i,
  /à retenir/i,
  /je pr[eé]f[eè]re/i,
  /je veux que tu/i,
  /dorénavant/i,
  /à partir de maintenant/i,
];

// Patterns pour détecter demande de clarification
const CLARIFY_PATTERNS = [
  /qu'est-ce que/i,
  /c'est quoi/i,
  /explique[- ]?moi/i,
  /peux[- ]?tu clarifier/i,
  /je ne comprends pas/i,
  /qu'entends[- ]?tu par/i,
];

/**
 * Memory Bridge v20.0Ω
 *
 * Responsabilités :
 * - Détection d'intention mémoire dans les messages
 * - Récupération de mémoires pertinentes
 * - Injection dans le contexte de prompt
 * - Stockage de nouvelles mémoires
 */
export class MemoryBridge {
  private memories: MemoryRetrievalResult[] = [];
  private maxMemories = 100;

  /**
   * Détecte l'intention mémoire dans un message utilisateur
   */
  detectIntent(message: string): IntentDetectionResult {
    const _lowerMessage = message.toLowerCase();

    // Extraire les mots-clés significatifs (> 3 caractères, pas stopwords)
    const stopwords = new Set(['que', 'qui', 'quoi', 'est', 'sont', 'les', 'des', 'une', 'pour', 'dans', 'avec', 'sur', 'par', 'plus', 'mais', 'comme', 'tout', 'peut', 'cette', 'fait', 'être', 'avoir', 'faire', 'dire']);
    const words = message.match(/\b[a-zA-ZÀ-ÿ]{4,}\b/g) || [];
    const keywords = words
      .map(w => w.toLowerCase())
      .filter(w => !stopwords.has(w))
      .slice(0, 5);

    // Vérifier les patterns de rappel
    for (const pattern of RECALL_PATTERNS) {
      if (pattern.test(message)) {
        return {
          needsMemory: true,
          intent: 'recall',
          keywords,
          confidence: 0.85,
        };
      }
    }

    // Vérifier les patterns de stockage
    for (const pattern of STORE_PATTERNS) {
      if (pattern.test(message)) {
        return {
          needsMemory: true,
          intent: 'store',
          keywords,
          confidence: 0.8,
        };
      }
    }

    // Vérifier les patterns de clarification
    for (const pattern of CLARIFY_PATTERNS) {
      if (pattern.test(message)) {
        return {
          needsMemory: false,
          intent: 'clarify',
          keywords,
          confidence: 0.7,
        };
      }
    }

    // Détection heuristique basée sur les questions
    const isQuestion = /\?$/.test(message.trim()) || /^(est-ce|y a-t-il|pourquoi|comment|quand|où)/i.test(message);

    if (isQuestion && keywords.length > 0) {
      return {
        needsMemory: true,
        intent: 'recall',
        keywords,
        confidence: 0.5,
      };
    }

    return {
      needsMemory: false,
      intent: 'none',
      keywords,
      confidence: 0.9,
    };
  }

  /**
   * Récupère les mémoires pertinentes pour un message
   */
  retrieve(keywords: string[], limit = 3): MemoryRetrievalResult[] {
    if (keywords.length === 0 || this.memories.length === 0) {
      return [];
    }

    // Score de pertinence basé sur les mots-clés
    const scored = this.memories.map(memory => {
      const contentLower = memory.content.toLowerCase();
      let matchCount = 0;

      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }

      const relevanceBoost = matchCount / keywords.length;
      const recencyBoost = Math.max(0, 1 - (Date.now() - memory.timestamp) / (7 * 24 * 60 * 60 * 1000)); // 7 jours

      return {
        memory,
        score: relevanceBoost * 0.7 + recencyBoost * 0.3,
      };
    });

    // Trier par score décroissant et prendre les N premiers
    return scored
      .filter(s => s.score > 0.1)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => ({
        ...s.memory,
        relevance: s.score,
      }));
  }

  /**
   * Génère l'injection de mémoire pour le prompt système
   */
  buildInjection(intent: IntentDetectionResult): MemoryInjection {
    if (!intent.needsMemory || intent.intent === 'none') {
      return {
        systemPromptAddition: '',
        relevantMemories: [],
        contextSize: 0,
      };
    }

    const relevantMemories = this.retrieve(intent.keywords, 5);

    if (relevantMemories.length === 0) {
      return {
        systemPromptAddition: '',
        relevantMemories: [],
        contextSize: 0,
      };
    }

    // Construire le texte d'injection
    const memoryLines = relevantMemories.map((m, i) =>
      `[Mémoire ${i + 1}] (${m.type}, pertinence: ${Math.round(m.relevance * 100)}%): ${m.content}`
    );

    const systemPromptAddition = `
---
CONTEXTE MÉMOIRE PERTINENT:
${memoryLines.join('\n')}
---
Utilise ces informations si elles sont pertinentes pour répondre à l'utilisateur.
`;

    return {
      systemPromptAddition,
      relevantMemories,
      contextSize: systemPromptAddition.length,
    };
  }

  /**
   * Stocke une nouvelle mémoire
   */
  store(content: string, type: MemoryRetrievalResult['type'] = 'conversation'): MemoryRetrievalResult {
    const memory: MemoryRetrievalResult = {
      id: crypto.randomUUID(),
      content: content.substring(0, 500), // Limite de taille
      type,
      relevance: 1.0,
      timestamp: Date.now(),
    };

    this.memories.push(memory);

    // Pruning si trop de mémoires
    if (this.memories.length > this.maxMemories) {
      // Garder les plus récentes et les plus pertinentes
      this.memories.sort((a, b) => b.timestamp - a.timestamp);
      this.memories = this.memories.slice(0, this.maxMemories);
    }

    return memory;
  }

  /**
   * Extrait les faits importants d'une réponse IA
   */
  extractFacts(response: string): string[] {
    const facts: string[] = [];

    // Patterns pour extraire des faits
    const factPatterns = [
      /\b(il est important de noter que|à noter que|rappelons que)\s*:?\s*(.+?)[.!]/gi,
      /\b(en résumé|pour résumer)[,:\s]+(.+?)[.!]/gi,
      /\b(le point clé est que|l'essentiel est que)\s*(.+?)[.!]/gi,
    ];

    for (const pattern of factPatterns) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        if (match[2] && match[2].length > 20 && match[2].length < 300) {
          facts.push(match[2].trim());
        }
      }
    }

    return facts;
  }

  /**
   * Extrait les préférences utilisateur d'un message
   */
  extractPreferences(message: string): string[] {
    const preferences: string[] = [];

    const preferencePatterns = [
      /je pr[eé]f[eè]re\s+(.+?)[.!,]/gi,
      /j'aime\s+(mieux|bien|beaucoup)?\s*(.+?)[.!,]/gi,
      /je n'aime pas\s+(.+?)[.!,]/gi,
      /je veux\s+(.+?)[.!,]/gi,
      /je souhaite\s+(.+?)[.!,]/gi,
    ];

    for (const pattern of preferencePatterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const pref = (match[2] || match[1])?.trim();
        if (pref && pref.length > 5 && pref.length < 200) {
          preferences.push(pref);
        }
      }
    }

    return preferences;
  }

  /**
   * Traite un échange complet (message user + réponse IA)
   * Stocke automatiquement les informations pertinentes
   */
  processExchange(userMessage: string, aiResponse: string): void {
    // Extraire et stocker les préférences
    const preferences = this.extractPreferences(userMessage);
    for (const pref of preferences) {
      this.store(`Préférence utilisateur: ${pref}`, 'preference');
    }

    // Extraire et stocker les faits
    const facts = this.extractFacts(aiResponse);
    for (const fact of facts) {
      this.store(fact, 'fact');
    }

    // Si le message était une demande de stockage explicite, stocker le contexte
    const intent = this.detectIntent(userMessage);
    if (intent.intent === 'store' && intent.confidence > 0.7) {
      // Nettoyer le message des patterns de stockage et stocker le reste
      let contentToStore = userMessage;
      for (const pattern of STORE_PATTERNS) {
        contentToStore = contentToStore.replace(pattern, '').trim();
      }
      if (contentToStore.length > 10) {
        this.store(contentToStore, 'context');
      }
    }
  }

  /**
   * Retourne toutes les mémoires (pour debug/export)
   */
  getAllMemories(): MemoryRetrievalResult[] {
    return [...this.memories];
  }

  /**
   * Vide toutes les mémoires
   */
  clear(): void {
    this.memories = [];
  }

  /**
   * Statistiques
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    avgRelevance: number;
  } {
    const byType: Record<string, number> = {};
    let totalRelevance = 0;

    for (const memory of this.memories) {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
      totalRelevance += memory.relevance;
    }

    return {
      total: this.memories.length,
      byType,
      avgRelevance: this.memories.length > 0 ? totalRelevance / this.memories.length : 0,
    };
  }
}

// Singleton
let memoryBridgeInstance: MemoryBridge | null = null;

export function getMemoryBridge(): MemoryBridge {
  if (!memoryBridgeInstance) {
    memoryBridgeInstance = new MemoryBridge();
  }
  return memoryBridgeInstance;
}

export default MemoryBridge;
