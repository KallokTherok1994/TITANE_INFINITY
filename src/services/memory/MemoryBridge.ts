/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — Memory Bridge
 *   Pont entre les conversations chat et le système de mémoire unifiée
 *   Connecté au UnifiedMemoryService pour STM/MTM/LTM
 * ═══════════════════════════════════════════════════════════════
 */

import { getUnifiedMemory, MemoryEntry } from './UnifiedMemoryService';

export interface MemoryRetrievalResult {
  id: string;
  content: string;
  type:
    | 'fact'
    | 'preference'
    | 'context'
    | 'conversation'
    | 'knowledge'
    | 'decision'
    | 'project';
  relevance: number;
  timestamp: number;
  importance: number;
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
  /selon nos discussions/i,
  /comme convenu/i,
  /comme prévu/i,
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
  /c'est essentiel/i,
  /c'est crucial/i,
  /c'est vital/i,
];

// Patterns pour détecter demande de clarification
const CLARIFY_PATTERNS = [
  /qu'est-ce que/i,
  /c'est quoi/i,
  /explique[- ]?moi/i,
  /peux[- ]?tu clarifier/i,
  /je ne comprends pas/i,
  /qu'entends[- ]?tu par/i,
  /peux-tu d[eé]tailler/i,
  /comment ça marche/i,
];

/**
 * Memory Bridge v20.0Ω - Enhanced with Unified Memory Integration
 *
 * Responsabilités :
 * - Détection d'intention mémoire dans les messages
 * - Récupération de mémoires pertinentes (STM/MTM/LTM)
 * - Injection dans le contexte de prompt
 * - Stockage de nouvelles mémoires avec importance appropriée
 */
export class MemoryBridge {
  private unifiedMemory = getUnifiedMemory();

  /**
   * Détecte l'intention mémoire dans un message utilisateur
   */
  detectIntent(message: string): IntentDetectionResult {
    const _lowerMessage = message.toLowerCase();

    // Extraire les mots-clés significatifs (> 3 caractères, pas stopwords)
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
      'très',
      'bien',
      'donc',
      'alors',
      'aussi',
      'encore',
      'toujours',
      'jamais',
      'rien',
      'personne',
      'quelque',
      'chaque',
      'autre',
      'même',
      'tel',
      'tellement',
    ]);
    const words = message.match(/\b[a-zA-ZÀ-ÿ]{4,}\b/g) || [];
    const keywords = words
      .map(w => w.toLowerCase())
      .filter(w => !stopwords.has(w))
      .slice(0, 8);

    // Vérifier les patterns de rappel
    for (const pattern of RECALL_PATTERNS) {
      if (pattern.test(message)) {
        return {
          needsMemory: true,
          intent: 'recall',
          keywords,
          confidence: 0.9,
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
          confidence: 0.85,
        };
      }
    }

    // Vérifier les patterns de clarification
    for (const pattern of CLARIFY_PATTERNS) {
      if (pattern.test(message)) {
        return {
          needsMemory: true,
          intent: 'recall',
          keywords,
          confidence: 0.75,
        };
      }
    }

    // Détection heuristique basée sur les questions
    const isQuestion =
      /\?$/.test(message.trim()) ||
      /^(est-ce|y a-t-il|pourquoi|comment|quand|où|combien|quel)/i.test(message);

    if (isQuestion && keywords.length > 0) {
      return {
        needsMemory: true,
        intent: 'recall',
        keywords,
        confidence: 0.6,
      };
    }

    // Détection basée sur la complexité et la longueur (information importante)
    const wordCount = message.split(/\s+/).length;
    const hasTechnicalTerms =
      /(?:configur|architect|syst[eè]me|m[eé]moire|projet|technolog)/i.test(message);

    if ((wordCount > 15 && hasTechnicalTerms) || message.length > 100) {
      return {
        needsMemory: true,
        intent: 'store',
        keywords,
        confidence: 0.55,
      };
    }

    return {
      needsMemory: false,
      intent: 'none',
      keywords,
      confidence: 0.95,
    };
  }

  /**
   * Récupère les mémoires pertinentes pour un message (depuis STM/MTM/LTM)
   */
  async retrieve(
    keywords: string[],
    limit = 5,
    minImportance = 0
  ): Promise<MemoryRetrievalResult[]> {
    if (keywords.length === 0) {
      return [];
    }

    // Utiliser le UnifiedMemoryService pour rechercher dans toutes les couches
    const memories = await this.unifiedMemory.recall({
      keywords,
      limit,
      minImportance,
    });

    // Convertir en MemoryRetrievalResult
    return memories.map(memory => ({
      id: memory.id,
      content: memory.content,
      type: memory.type,
      relevance: memory.importance, // Pour compatibilité
      timestamp: memory.timestamp,
      importance: memory.importance,
    }));
  }

  /**
   * Génère l'injection de mémoire pour le prompt système
   */
  async buildInjection(intent: IntentDetectionResult): Promise<MemoryInjection> {
    if (!intent.needsMemory || intent.intent === 'none') {
      return {
        systemPromptAddition: '',
        relevantMemories: [],
        contextSize: 0,
      };
    }

    const relevantMemories = await this.retrieve(intent.keywords, 8);

    if (relevantMemories.length === 0) {
      return {
        systemPromptAddition: '',
        relevantMemories: [],
        contextSize: 0,
      };
    }

    // Trier par importance et pertinence
    relevantMemories.sort((a, b) => {
      // Priorité aux mémoires les plus importantes et récentes
      const aScore =
        a.importance * 0.7 +
        (1 - (Date.now() - a.timestamp) / (24 * 60 * 60 * 1000)) * 0.3;
      const bScore =
        b.importance * 0.7 +
        (1 - (Date.now() - b.timestamp) / (24 * 60 * 60 * 1000)) * 0.3;
      return bScore - aScore;
    });

    // Construire le texte d'injection avec niveaux de mémoire
    const memoryLines = relevantMemories.map((m, i) => {
      const tier = m.importance < 0.3 ? 'STM' : m.importance < 0.7 ? 'MTM' : 'LTM';
      const importanceLabel =
        m.importance < 0.3
          ? 'temporaire'
          : m.importance < 0.7
            ? 'moyen terme'
            : 'long terme';
      return `[Mémoire ${tier}] (${m.type}, importance: ${Math.round(m.importance * 100)}%, ${importanceLabel}): ${m.content}`;
    });

    const systemPromptAddition = `
---
CONTEXTE MÉMOIRE PERTINENT (STM/MTM/LTM):
${memoryLines.join('\n')}
---
Utilise ces informations si elles sont pertinentes pour répondre à l'utilisateur. Les mémoires STM sont temporaires, MTM sont à moyen terme, et LTM sont des connaissances permanentes.
`;

    return {
      systemPromptAddition,
      relevantMemories,
      contextSize: systemPromptAddition.length,
    };
  }

  /**
   * Stocke une nouvelle mémoire avec l'importance appropriée
   */
  async store(
    content: string,
    type: MemoryEntry['type'] = 'conversation',
    conversationId?: string,
    metadata?: Record<string, unknown>
  ): Promise<MemoryEntry> {
    // Déterminer l'importance automatiquement
    let importance = 0.1; // Par défaut, faible importance

    // Heuristiques pour déterminer l'importance
    const contentLength = content.length;
    const wordCount = content.split(/\s+/).length;

    // Importance basée sur la longueur
    if (contentLength > 200) importance += 0.2;
    if (contentLength > 500) importance += 0.2;

    // Importance basée sur les mots-clés techniques
    const technicalKeywords = [
      'configur',
      'architect',
      'syst[eè]me',
      'm[eé]moire',
      'projet',
      'technolog',
      'important',
      'crucial',
      'essentiel',
    ];
    const hasTechnicalTerms = technicalKeywords.some(keyword =>
      new RegExp(keyword, 'i').test(content)
    );
    if (hasTechnicalTerms) importance += 0.3;

    // Importance basée sur le type
    const typeWeights: Record<string, number> = {
      knowledge: 0.4,
      decision: 0.5,
      project: 0.6,
      preference: 0.3,
      fact: 0.2,
      context: 0.1,
      conversation: 0.0,
    };
    importance += typeWeights[type] || 0;

    // Importance basée sur la conversation
    if (conversationId && conversationId.includes('current')) {
      importance += 0.1;
    }

    // Clamp entre 0 et 1
    importance = Math.min(1.0, Math.max(0.0, importance));

    // Utiliser le UnifiedMemoryService pour stocker
    const memoryEntry = await this.unifiedMemory.store(
      content,
      type,
      importance,
      conversationId,
      metadata
    );

    return memoryEntry;
  }

  /**
   * Extrait les faits importants d'une réponse IA
   */
  extractFacts(response: string): Array<{ content: string; importance: number }> {
    const facts: Array<{ content: string; importance: number }> = [];

    // Patterns pour extraire des faits avec niveaux d'importance
    const factPatterns = [
      {
        pattern:
          /\b(il est (tr[eè]s )?important de noter que|à noter que|rappelons que)\s*:?\s*(.+?)[.!]/gi,
        importance: 0.8,
      },
      {
        pattern: /\b(en r[eé]sum[eé]|pour r[eé]sumer)[,:\s]+(.+?)[.!]/gi,
        importance: 0.6,
      },
      {
        pattern: /\b(le point cl[eé] est que|l'essentiel est que)\s*(.+?)[.!]/gi,
        importance: 0.7,
      },
      {
        pattern: /\b(je vous rappelle que|rappelez-vous que)\s*(.+?)[.!]/gi,
        importance: 0.5,
      },
      {
        pattern: /\b(cela signifie que|cela implique que)\s*(.+?)[.!]/gi,
        importance: 0.6,
      },
    ];

    for (const { pattern, importance } of factPatterns) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        if (match[2] && match[2].length > 15 && match[2].length < 400) {
          facts.push({
            content: match[2].trim(),
            importance,
          });
        }
      }
    }

    return facts;
  }

  /**
   * Extrait les préférences utilisateur d'un message
   */
  extractPreferences(message: string): Array<{ content: string; importance: number }> {
    const preferences: Array<{ content: string; importance: number }> = [];

    const preferencePatterns = [
      { pattern: /je pr[eé]f[eè]re\s+(.+?)[.!,]/gi, importance: 0.4 },
      { pattern: /j'aime\s+(mieux|bien|beaucoup)?\s*(.+?)[.!,]/gi, importance: 0.3 },
      { pattern: /je n'aime pas\s+(.+?)[.!,]/gi, importance: 0.3 },
      { pattern: /je veux\s+(.+?)[.!,]/gi, importance: 0.5 },
      { pattern: /je souhaite\s+(.+?)[.!,]/gi, importance: 0.5 },
      { pattern: /il serait bon de\s+(.+?)[.!,]/gi, importance: 0.4 },
      { pattern: /il faudrait\s+(.+?)[.!,]/gi, importance: 0.4 },
    ];

    for (const { pattern, importance } of preferencePatterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        const pref = (match[2] || match[1])?.trim();
        if (pref && pref.length > 5 && pref.length < 200) {
          preferences.push({
            content: pref,
            importance,
          });
        }
      }
    }

    return preferences;
  }

  /**
   * Traite un échange complet (message user + réponse IA)
   * Stocke automatiquement les informations pertinentes
   */
  async processExchange(
    userMessage: string,
    aiResponse: string,
    conversationId?: string
  ): Promise<void> {
    // Extraire et stocker les préférences
    const preferences = this.extractPreferences(userMessage);
    for (const pref of preferences) {
      await this.store(
        `Préférence utilisateur: ${pref.content}`,
        'preference',
        conversationId,
        { extracted_importance: pref.importance }
      );
    }

    // Extraire et stocker les faits
    const facts = this.extractFacts(aiResponse);
    for (const fact of facts) {
      await this.store(fact.content, 'fact', conversationId, {
        extracted_importance: fact.importance,
      });
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
        await this.store(contentToStore, 'context', conversationId);
      }
    }

    // Stocker la réponse IA comme connaissance si elle contient des informations techniques
    if (aiResponse.length > 50) {
      const hasTechnicalContent =
        /(?:configur|architect|syst[eè]me|m[eé]moire|technolog|impl[eé]ment)/i.test(
          aiResponse
        );
      if (hasTechnicalContent) {
        await this.store(aiResponse, 'knowledge', conversationId, {
          source: 'ai_response',
          context: 'technical_info',
        });
      }
    }
  }

  /**
   * Retourne les statistiques de mémoire
   */
  async getStats(): Promise<any> {
    return this.unifiedMemory.getStats();
  }

  /**
   * Vide toutes les mémoires
   */
  async clear(): Promise<void> {
    await this.unifiedMemory.clear();
  }

  /**
   * Force la sauvegarde des mémoires
   */
  async flush(): Promise<void> {
    // La sauvegarde est automatique dans UnifiedMemoryService
    // Cette méthode est pour compatibilité
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
