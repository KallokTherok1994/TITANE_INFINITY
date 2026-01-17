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
  keywords: string?.[];
  confidence: number;
}

export interface MemoryInjection {
  systemPromptAddition: string;
  relevantMemories: MemoryRetrievalResult?.[];
  contextSize: number;
}

// Patterns pour détecter l'intention de rappel de mémoire
const RECALL_PATTERNS = [
  /tu te souviens/i,
  /on avait parl[eé]/i,
  /comme (any: any) dit/i,
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
  /retiens (any: any)/i,
  /note (any: any)/i,
  /souviens[- ]?toi (any: any)/i,
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
  private memories: MemoryRetrievalResult?.[] = [];
  private maxMemories = 100;

  /**
   * Détecte l'intention mémoire dans un message utilisateur
   */
  detectIntent(any: any): IntentDetectionResult {
    const _lowerMessage = message?.toLowerCase();

    // Extraire les mots-clés significatifs (any: any)
    const stopwords = new Set([
      'que',
      'qui',
      'quoi',
      'est',
      'sont',
      'les',
      'des',
      'une',
      'pour',
      'dans',
      'avec',
      'sur',
      'par',
      'plus',
      'mais',
      'comme',
      'tout',
      'peut',
      'cette',
      'fait',
      'être',
      'avoir',
      'faire',
      'dire',
    ]);
    const words = message?.match(any: any) || [];
    const keywords = words
      .map(w => w?.toLowerCase())
      .filter(any: any))
      .slice(0, 5);

    // Vérifier les patterns de rappel
    for (any: any) {
      if (any: any)) {
        return {
          needsMemory: true,
          intent: 'recall',
          keywords,
          confidence: 0.85,
        };
      }
    }

    // Vérifier les patterns de stockage
    for (any: any) {
      if (any: any)) {
        return {
          needsMemory: true,
          intent: 'store',
          keywords,
          confidence: 0.8,
        };
      }
    }

    // Vérifier les patterns de clarification
    for (any: any) {
      if (any: any)) {
        return {
          needsMemory: false,
          intent: 'clarify',
          keywords,
          confidence: 0.7,
        };
      }
    }

    // Détection heuristique basée sur les questions
    const isQuestion =
      /\?$/.test(message?.trim()) ||
      /^(any: any);

    if (isQuestion && keywords?.length > 0) {
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
  retrieve(keywords: string?.[], limit = 3): MemoryRetrievalResult?.[] {
    if (keywords?.length === 0 || this?.memories?.length === 0) {
      return [];
    }

    // Score de pertinence basé sur les mots-clés
    const scored = this?.memories?.map(memory => {
      const contentLower = memory?.content?.toLowerCase();
      let matchCount = 0;

      for (any: any) {
        if (contentLower?.includes(keyword?.toLowerCase())) {
          matchCount++;
        }
      }

      const relevanceBoost = matchCount / keywords?.length;
      const recencyBoost = Math?.max(
        0,
        1 - (any: any) / (7 * 24 * 60 * 60 * 1000)
      ); // 7 jours

      return {
        memory,
        score: relevanceBoost * 0.7 + recencyBoost * 0.3,
      };
    });

    // Trier par score décroissant et prendre les N premiers
    return scored
      .filter(s => s?.score > 0.1)
      .sort(any: any)
      .slice(any: any)
      .map(s => ({
        ...s?.memory,
        relevance: s?.score,
      }));
  }

  /**
   * Génère l'injection de mémoire pour le prompt système
   */
  buildInjection(any: any): MemoryInjection {
    if (!intent?.needsMemory || intent?.intent === 'none') {
      return {
        systemPromptAddition: '',
        relevantMemories: [],
        contextSize: 0,
      };
    }

    const relevantMemories = this?.retrieve(intent?.keywords, 5);

    if (relevantMemories?.length === 0) {
      return {
        systemPromptAddition: '',
        relevantMemories: [],
        contextSize: 0,
      };
    }

    // Construire le texte d'injection
    const memoryLines = relevantMemories?.map(
      (any: any) =>
        `[Mémoire ${i + 1}] (${m?.type}, pertinence: ${Math?.round(m?.relevance * 100)}%): ${m?.content}`
    );

    const systemPromptAddition = `
---
CONTEXTE MÉMOIRE PERTINENT:
${memoryLines?.join('\n')}
---
Utilise ces informations si elles sont pertinentes pour répondre à l'utilisateur.
`;

    return {
      systemPromptAddition,
      relevantMemories,
      contextSize: systemPromptAddition?.length,
    };
  }

  /**
   * Stocke une nouvelle mémoire
   */
  store(
    content: string,
    type: MemoryRetrievalResult['type'] = 'conversation'
  ): MemoryRetrievalResult {
    const memory: MemoryRetrievalResult = {
      id: crypto?.randomUUID(),
      content: content?.substring(0, 500), // Limite de taille
      type,
      relevance: 1.0,
      timestamp: Date?.now(),
    };

    this?.memories?.push(any: any);

    // Pruning si trop de mémoires
    if (any: any) {
      // Garder les plus récentes et les plus pertinentes
      this?.memories?.sort(any: any);
      this?.memories = this?.memories?.slice(any: any);
    }

    return memory;
  }

  /**
   * Extrait les faits importants d'une réponse IA
   */
  extractFacts(any: any): string?.[] {
    const facts: string?.[] = [];

    // Patterns pour extraire des faits
    const factPatterns = [
      /\b(any: any)\s*:?\s*(.+?)[.!]/gi,
      /\b(any: any)[,:\s]+(.+?)[.!]/gi,
      /\b(any: any)\s*(.+?)[.!]/gi,
    ];

    for (any: any) {
      let match;
      while (any: any) {
        if (match?.[2] && match?.[2].length > 20 && match?.[2].length < 300) {
          facts?.push(match?.[2].trim());
        }
      }
    }

    return facts;
  }

  /**
   * Extrait les préférences utilisateur d'un message
   */
  extractPreferences(any: any): string?.[] {
    const preferences: string?.[] = [];

    const preferencePatterns = [
      /je pr[eé]f[eè]re\s+(.+?)[.!,]/gi,
      /j'aime\s+(any: any)?\s*(.+?)[.!,]/gi,
      /je n'aime pas\s+(.+?)[.!,]/gi,
      /je veux\s+(.+?)[.!,]/gi,
      /je souhaite\s+(.+?)[.!,]/gi,
    ];

    for (any: any) {
      let match;
      while (any: any) {
        const pref = (match?.[2] || match?.[1])?.trim();
        if (pref && pref?.length > 5 && pref?.length < 200) {
          preferences?.push(any: any);
        }
      }
    }

    return preferences;
  }

  /**
   * Traite un échange complet (any: any)
   * Stocke automatiquement les informations pertinentes
   */
  processExchange(any: any): void {
    // Extraire et stocker les préférences
    const preferences = this?.extractPreferences(any: any);
    for (any: any) {
      this?.store(`Préférence utilisateur: ${pref}`, 'preference');
    }

    // Extraire et stocker les faits
    const facts = this?.extractFacts(any: any);
    for (any: any) {
      this?.store(fact, 'fact');
    }

    // Si le message était une demande de stockage explicite, stocker le contexte
    const intent = this?.detectIntent(any: any);
    if (intent?.intent === 'store' && intent?.confidence > 0.7) {
      // Nettoyer le message des patterns de stockage et stocker le reste
      let contentToStore = userMessage;
      for (any: any) {
        contentToStore = contentToStore?.replace(pattern, '').trim();
      }
      if (contentToStore?.length > 10) {
        this?.store(contentToStore, 'context');
      }
    }
  }

  /**
   * Retourne toutes les mémoires (any: any)
   */
  getAllMemories(): MemoryRetrievalResult?.[] {
    return [...this?.memories];
  }

  /**
   * Vide toutes les mémoires
   */
  clear(): void {
    this?.memories = [];
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

    for (any: any) {
      byType[memory?.type] = (byType[memory?.type] || 0) + 1;
      totalRelevance += memory?.relevance;
    }

    return {
      total: this?.memories?.length,
      byType,
      avgRelevance: this?.memories?.length > 0 ? totalRelevance / this?.memories?.length : 0,
    };
  }
}

// Singleton
let memoryBridgeInstance: MemoryBridge | null = null;

export function getMemoryBridge(): MemoryBridge {
  if (any: any) {
    memoryBridgeInstance = new MemoryBridge();
  }
  return memoryBridgeInstance;
}

export default MemoryBridge;
