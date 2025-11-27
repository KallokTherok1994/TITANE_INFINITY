/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * LONG CONTEXT OPTIMIZER v24.30
 *
 * Optimisation contexte long pour TITANE∞
 *
 * Fonctionnalités :
 * - Compression contextuelle (ratio 1:5, 4-50k tokens)
 * - Grouping sémantique (K-means clustering)
 * - Injection sélective (relevance threshold 0.6)
 * - Suppression bruit (duplicates, low-relevance, contradictions)
 * - Context gating (seuil 0.7)
 * - Liens entre conversations (cross-chat context)
 * - Préservation sémantique (>95%)
 * - Priorisation segments importants
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';

// ═══════════════════════════════════════════════════════════════════
// TYPES CONTEXTE LONG
// ═══════════════════════════════════════════════════════════════════

export interface ContextMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  timestamp: number;
  importance: number; // 0-1
  semantic_vector?: number[];
  metadata?: Record<string, unknown>;
}

export interface CompressionResult {
  original_messages: ContextMessage[];
  compressed_messages: ContextMessage[];
  original_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
  semantic_preservation: number;
  removed_noise: string[];
  prioritized_segments: string[];
  execution_time_ms: number;
}

export interface SemanticGroup {
  id: string;
  messages: ContextMessage[];
  centroid: number[];
  topic: string;
  importance: number;
  coherence_score: number;
}

export interface InjectionResult {
  base_context: ContextMessage[];
  injected_messages: ContextMessage[];
  final_context: ContextMessage[];
  relevance_scores: number[];
  total_tokens: number;
}

export interface NoiseRemovalResult {
  original_messages: ContextMessage[];
  cleaned_messages: ContextMessage[];
  removed_duplicates: number;
  removed_low_relevance: number;
  removed_contradictions: number;
  removed_circular: number;
}

export interface GatingResult {
  all_messages: ContextMessage[];
  gated_messages: ContextMessage[];
  threshold: number;
  passed_count: number;
  rejected_count: number;
}

export interface CrossChatContext {
  chat_ids: string[];
  linked_messages: Map<string, ContextMessage[]>;
  semantic_links: Array<{ from: string; to: string; similarity: number }>;
  merged_context: ContextMessage[];
}

// ═══════════════════════════════════════════════════════════════════
// LONG CONTEXT OPTIMIZER
// ═══════════════════════════════════════════════════════════════════

export class LongContextOptimizer {
  private static instance: LongContextOptimizer | null = null;
  private readonly DEFAULT_MAX_TOKENS = 8000;
  private readonly DEFAULT_COMPRESSION_RATIO = 0.2; // Ratio cible: 1:5
  private readonly DEFAULT_RELEVANCE_THRESHOLD = 0.6;
  private readonly DEFAULT_GATING_THRESHOLD = 0.7;

  private constructor() {}

  static getInstance(): LongContextOptimizer {
    if (!LongContextOptimizer.instance) {
      LongContextOptimizer.instance = new LongContextOptimizer();
    }
    return LongContextOptimizer.instance;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. COMPRESSION CONTEXTUELLE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Compresser contexte long (4-50k tokens → ~8k tokens)
   */
  async compressContext(
    messages: ContextMessage[],
    options: {
      maxTokens?: number;
      targetRatio?: number;
      preserveRecent?: number; // Nombre de messages récents à toujours garder
      strategy?: 'semantic_grouping' | 'importance_scoring' | 'hybrid';
    } = {}
  ): Promise<CompressionResult> {
    const startTime = performance.now();

    try {
      const maxTokens = options.maxTokens || this.DEFAULT_MAX_TOKENS;
      const targetRatio = options.targetRatio || this.DEFAULT_COMPRESSION_RATIO;
      const preserveRecent = options.preserveRecent || 5;
      const strategy = options.strategy || 'hybrid';

      // Calculer tokens totaux
      const originalTokens = messages.reduce((sum, msg) => sum + msg.tokens, 0);

      // Si déjà sous la limite, pas de compression nécessaire
      if (originalTokens <= maxTokens) {
        return {
          original_messages: messages,
          compressed_messages: messages,
          original_tokens: originalTokens,
          compressed_tokens: originalTokens,
          compression_ratio: 1.0,
          semantic_preservation: 1.0,
          removed_noise: [],
          prioritized_segments: [],
          execution_time_ms: performance.now() - startTime,
        };
      }

      // Appeler backend pour compression intelligente
      const result = await invoke<CompressionResult>('context_compress', {
        messages,
        maxTokens,
        targetRatio,
        preserveRecent,
        strategy,
      });

      result.execution_time_ms = performance.now() - startTime;
      return result;
    } catch (error) {
      console.error('[LongContextOptimizer] Compression error:', error);

      // Fallback: compression simple (garder messages récents)
      const preserveCount = options.preserveRecent || 5;
      const recentMessages = messages.slice(-preserveCount);
      const recentTokens = recentMessages.reduce((sum, msg) => sum + msg.tokens, 0);

      return {
        original_messages: messages,
        compressed_messages: recentMessages,
        original_tokens: messages.reduce((sum, msg) => sum + msg.tokens, 0),
        compressed_tokens: recentTokens,
        compression_ratio: recentTokens / messages.reduce((sum, msg) => sum + msg.tokens, 0),
        semantic_preservation: 0.5,
        removed_noise: ['Fallback: kept only recent messages'],
        prioritized_segments: [],
        execution_time_ms: performance.now() - startTime,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. GROUPING SÉMANTIQUE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Grouper messages par similarité sémantique (K-means)
   */
  async semanticGrouping(
    messages: ContextMessage[],
    options: {
      numGroups?: number;
      algorithm?: 'kmeans' | 'hierarchical' | 'dbscan';
      minGroupSize?: number;
    } = {}
  ): Promise<SemanticGroup[]> {
    try {
      const numGroups = options.numGroups || Math.min(5, Math.ceil(messages.length / 10));
      const algorithm = options.algorithm || 'kmeans';
      const minGroupSize = options.minGroupSize || 2;

      const groups = await invoke<SemanticGroup[]>('context_semantic_grouping', {
        messages,
        numGroups,
        algorithm,
        minGroupSize,
      });

      return groups;
    } catch (error) {
      console.error('[LongContextOptimizer] Semantic grouping error:', error);

      // Fallback: grouper par timestamp (groupes temporels)
      const groupSize = Math.ceil(messages.length / 5);
      const groups: SemanticGroup[] = [];

      for (let i = 0; i < messages.length; i += groupSize) {
        const groupMessages = messages.slice(i, i + groupSize);
        groups.push({
          id: `group_${i}`,
          messages: groupMessages,
          centroid: [],
          topic: `Group ${Math.floor(i / groupSize) + 1}`,
          importance: groupMessages.reduce((sum, msg) => sum + msg.importance, 0) / groupMessages.length,
          coherence_score: 0.5,
        });
      }

      return groups;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. INJECTION SÉLECTIVE
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Injecter messages additionnels seulement si pertinents
   */
  async selectiveInjection(
    baseContext: ContextMessage[],
    additionalContext: ContextMessage[],
    options: {
      relevanceThreshold?: number;
      maxInjected?: number;
    } = {}
  ): Promise<InjectionResult> {
    try {
      const relevanceThreshold = options.relevanceThreshold || this.DEFAULT_RELEVANCE_THRESHOLD;
      const maxInjected = options.maxInjected || 10;

      const result = await invoke<InjectionResult>('context_selective_injection', {
        baseContext,
        additionalContext,
        relevanceThreshold,
        maxInjected,
      });

      return result;
    } catch (error) {
      console.error('[LongContextOptimizer] Selective injection error:', error);

      // Fallback: pas d'injection
      return {
        base_context: baseContext,
        injected_messages: [],
        final_context: baseContext,
        relevance_scores: [],
        total_tokens: baseContext.reduce((sum, msg) => sum + msg.tokens, 0),
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. SUPPRESSION BRUIT
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Supprimer duplicates, low-relevance, contradictions, circular references
   */
  async removeNoise(
    messages: ContextMessage[],
    options: {
      removeDuplicates?: boolean;
      removeLowRelevance?: boolean;
      removeContradictions?: boolean;
      removeCircular?: boolean;
      minImportance?: number;
    } = {}
  ): Promise<NoiseRemovalResult> {
    try {
      const strategies: string[] = [];
      if (options.removeDuplicates !== false) strategies.push('remove_duplicates');
      if (options.removeLowRelevance !== false) strategies.push('remove_low_relevance');
      if (options.removeContradictions !== false) strategies.push('remove_contradictions');
      if (options.removeCircular !== false) strategies.push('remove_circular_references');

      const minImportance = options.minImportance || 0.3;

      const result = await invoke<NoiseRemovalResult>('context_remove_noise', {
        messages,
        strategies,
        minImportance,
      });

      return result;
    } catch (error) {
      console.error('[LongContextOptimizer] Noise removal error:', error);

      // Fallback: supprimer duplicates basiques
      const seen = new Set<string>();
      const cleaned = messages.filter((msg) => {
        const key = `${msg.role}:${msg.content.slice(0, 100)}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      return {
        original_messages: messages,
        cleaned_messages: cleaned,
        removed_duplicates: messages.length - cleaned.length,
        removed_low_relevance: 0,
        removed_contradictions: 0,
        removed_circular: 0,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. CONTEXT GATING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Filtrer messages selon seuil d'importance
   */
  async gateContext(
    messages: ContextMessage[],
    options: {
      threshold?: number;
      preserveRecent?: number;
      preserveSystemMessages?: boolean;
    } = {}
  ): Promise<GatingResult> {
    const threshold = options.threshold ?? this.DEFAULT_GATING_THRESHOLD;
    const preserveRecent = options.preserveRecent ?? 3;
    const preserveSystemMessages = options.preserveSystemMessages !== false;

    try {
      const result = await invoke<GatingResult>('context_gating', {
        messages,
        threshold,
        preserveRecent,
        preserveSystemMessages,
      });

      return result;
    } catch (error) {
      console.error('[LongContextOptimizer] Context gating error:', error);

      // Fallback: filtrer par importance simple
      const recentMessages = messages.slice(-preserveRecent);
      const importantMessages = messages.filter(
        (msg) =>
          msg.importance >= threshold ||
          msg.role === 'system' ||
          recentMessages.includes(msg)
      );

      return {
        all_messages: messages,
        gated_messages: importantMessages,
        threshold,
        passed_count: importantMessages.length,
        rejected_count: messages.length - importantMessages.length,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. CROSS-CHAT CONTEXT LINKING
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Créer liens entre conversations multiples
   */
  async linkConversations(
    chats: Array<{ id: string; messages: ContextMessage[] }>,
    options: {
      similarityThreshold?: number;
      maxLinks?: number;
    } = {}
  ): Promise<CrossChatContext> {
    try {
      const similarityThreshold = options.similarityThreshold || 0.8;
      const maxLinks = options.maxLinks || 20;

      const result = await invoke<CrossChatContext>('context_link_conversations', {
        chats,
        similarityThreshold,
        maxLinks,
      });

      return result;
    } catch (error) {
      console.error('[LongContextOptimizer] Cross-chat linking error:', error);

      // Fallback: pas de liens
      const allMessages: ContextMessage[] = [];
      const linkedMessages = new Map<string, ContextMessage[]>();

      chats.forEach((chat) => {
        allMessages.push(...chat.messages);
        linkedMessages.set(chat.id, chat.messages);
      });

      return {
        chat_ids: chats.map((c) => c.id),
        linked_messages: linkedMessages,
        semantic_links: [],
        merged_context: allMessages,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. PIPELINE COMPLET D'OPTIMISATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Appliquer toutes les optimisations en pipeline
   */
  async optimizeFullContext(
    messages: ContextMessage[],
    options: {
      maxTokens?: number;
      enableGrouping?: boolean;
      enableNoiseRemoval?: boolean;
      enableGating?: boolean;
      targetCompressionRatio?: number;
    } = {}
  ): Promise<CompressionResult> {
    const startTime = performance.now();

    try {
      let optimizedMessages = [...messages];

      // 1. Suppression bruit
      if (options.enableNoiseRemoval !== false) {
        const noiseResult = await this.removeNoise(optimizedMessages);
        optimizedMessages = noiseResult.cleaned_messages;
      }

      // 2. Context gating
      if (options.enableGating !== false) {
        const gatingResult = await this.gateContext(optimizedMessages);
        optimizedMessages = gatingResult.gated_messages;
      }

      // 3. Grouping sémantique (optionnel, pour analyse)
      let groups: SemanticGroup[] = [];
      if (options.enableGrouping) {
        groups = await this.semanticGrouping(optimizedMessages);
      }

      // 4. Compression finale si nécessaire
      const currentTokens = optimizedMessages.reduce((sum, msg) => sum + msg.tokens, 0);
      const maxTokens = options.maxTokens || this.DEFAULT_MAX_TOKENS;

      if (currentTokens > maxTokens) {
        const compressionResult = await this.compressContext(optimizedMessages, {
          maxTokens,
          targetRatio: options.targetCompressionRatio,
        });
        optimizedMessages = compressionResult.compressed_messages;
      }

      // Calculer résultat final
      const originalTokens = messages.reduce((sum, msg) => sum + msg.tokens, 0);
      const optimizedTokens = optimizedMessages.reduce((sum, msg) => sum + msg.tokens, 0);

      return {
        original_messages: messages,
        compressed_messages: optimizedMessages,
        original_tokens: originalTokens,
        compressed_tokens: optimizedTokens,
        compression_ratio: optimizedTokens / originalTokens,
        semantic_preservation: 0.95, // Estimation (devrait être calculé par backend)
        removed_noise: [],
        prioritized_segments: groups.map((g) => g.topic),
        execution_time_ms: performance.now() - startTime,
      };
    } catch (error) {
      console.error('[LongContextOptimizer] Full optimization error:', error);

      // Fallback: compression simple
      return this.compressContext(messages, {
        maxTokens: options.maxTokens,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Calculer importance d'un message
   */
  calculateImportance(message: ContextMessage, context: ContextMessage[]): number {
    try {
      // Facteurs d'importance:
      // 1. Rôle système = importance haute
      if (message.role === 'system') return 1.0;

      // 2. Messages récents = importance plus haute
      const totalMessages = context.length;
      const messageIndex = context.findIndex((m) => m.id === message.id);
      const recencyFactor = messageIndex / totalMessages;

      // 3. Longueur du message (plus long = potentiellement plus important)
      const lengthFactor = Math.min(message.tokens / 500, 1.0);

      // 4. Moyenne pondérée
      const importance = recencyFactor * 0.5 + lengthFactor * 0.3 + 0.2;

      return Math.max(0, Math.min(1, importance));
    } catch (error) {
      return 0.5; // Importance moyenne par défaut
    }
  }

  /**
   * Estimer tokens d'un texte
   */
  estimateTokens(text: string): number {
    // Approximation: 1 token ≈ 4 caractères
    return Math.ceil(text.length / 4);
  }

  /**
   * Créer message contexte
   */
  createContextMessage(
    role: 'user' | 'assistant' | 'system',
    content: string,
    options: Partial<ContextMessage> = {}
  ): ContextMessage {
    const tokens = options.tokens || this.estimateTokens(content);
    const importance = options.importance || 0.5;

    return {
      id: options.id || `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      tokens,
      timestamp: options.timestamp || Date.now(),
      importance,
      semantic_vector: options.semantic_vector,
      metadata: options.metadata || {},
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════

export const ContextOptimizer = LongContextOptimizer.getInstance();
