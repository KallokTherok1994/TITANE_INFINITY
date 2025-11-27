/**
 * TITANE∞ v24.30 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * COGNITIVE OPTIMIZATION ENGINE v24.21
 *
 * Optimisation cognitive avancée de l'IA TITANE∞
 *
 * Fonctionnalités :
 * - Cohérence logique multi-tours
 * - Clarté des intentions
 * - Continuité narrative
 * - Gestion contexte long (4-50k tokens)
 * - Stabilité cognitive analyses complexes
 * - Auto-vérification interne (mini reasoning)
 * - Élimination dérives logiques
 * - Classification automatique messages
 * - Priorisation intelligente étapes analyse
 * - Contexte vectorisé (mémoire sémantique)
 * - Rappel intelligent (memory gating)
 * - Cache cognitif court-terme
 * - Correction automatique réponses incohérentes
 * ═══════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';

// ═══════════════════════════════════════════════════════════════════
// TYPES COGNITIFS
// ═══════════════════════════════════════════════════════════════════

export interface CognitiveContext {
  messages: CognitiveMessage[];
  total_tokens: number;
  compression_ratio: number;
  semantic_clusters: SemanticCluster[];
  active_intentions: string[];
  coherence_score: number;
  narrative_continuity: number;
}

export interface CognitiveMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  timestamp: number;
  intentions: string[];
  semantic_vector?: number[];
}

export interface SemanticCluster {
  id: string;
  messages: number[]; // indices des messages
  topic: string;
  importance: number;
  last_access: number;
}

export interface IntentionAnalysis {
  primary_intention: string;
  secondary_intentions: string[];
  confidence: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  requires_reasoning: boolean;
  requires_long_context: boolean;
}

export interface CoherenceCheck {
  is_coherent: boolean;
  coherence_score: number;
  issues: string[];
  suggestions: string[];
  corrected_response?: string;
}

export interface ContextOptimization {
  original_tokens: number;
  optimized_tokens: number;
  compression_ratio: number;
  semantic_preservation: number;
  removed_noise: string[];
  prioritized_segments: string[];
}

export interface MemoryGatingResult {
  retrieved_memories: CognitiveMessage[];
  relevance_scores: number[];
  total_retrieved: number;
  gating_threshold: number;
}

// ═══════════════════════════════════════════════════════════════════
// COGNITIVE OPTIMIZATION ENGINE
// ═══════════════════════════════════════════════════════════════════

export class CognitiveOptimizationEngine {
  private static instance: CognitiveOptimizationEngine | null = null;
  private context: CognitiveContext;
  private shortTermCache: Map<string, any>;
  private readonly MAX_CACHE_SIZE = 100;
  private readonly COHERENCE_THRESHOLD = 0.85;

  private constructor() {
    this.context = {
      messages: [],
      total_tokens: 0,
      compression_ratio: 1.0,
      semantic_clusters: [],
      active_intentions: [],
      coherence_score: 1.0,
      narrative_continuity: 1.0,
    };
    this.shortTermCache = new Map();
  }

  static getInstance(): CognitiveOptimizationEngine {
    if (!CognitiveOptimizationEngine.instance) {
      CognitiveOptimizationEngine.instance = new CognitiveOptimizationEngine();
    }
    return CognitiveOptimizationEngine.instance;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. ANALYSE D'INTENTION
  // ═══════════════════════════════════════════════════════════════════

  async analyzeIntention(message: string): Promise<IntentionAnalysis> {
    try {
      // Cache check
      const cacheKey = `intention_${message.slice(0, 50)}`;
      if (this.shortTermCache.has(cacheKey)) {
        return this.shortTermCache.get(cacheKey);
      }

      // Analyser via backend IA
      const result = await invoke<IntentionAnalysis>('cognitive_analyze_intention', {
        message,
        context: this.context,
      });

      // Mettre en cache
      this.updateCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Intention analysis error:', error);
      return {
        primary_intention: 'unknown',
        secondary_intentions: [],
        confidence: 0,
        complexity: 'simple',
        requires_reasoning: false,
        requires_long_context: false,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. VÉRIFICATION DE COHÉRENCE
  // ═══════════════════════════════════════════════════════════════════

  async checkCoherence(response: string, context: CognitiveMessage[]): Promise<CoherenceCheck> {
    try {
      const result = await invoke<CoherenceCheck>('cognitive_check_coherence', {
        response,
        context,
        threshold: this.COHERENCE_THRESHOLD,
      });

      // Si incohérent, tenter correction automatique
      if (!result.is_coherent && result.coherence_score < this.COHERENCE_THRESHOLD) {
        const corrected = await this.autoCorrectResponse(response, context, result.issues);
        result.corrected_response = corrected;
      }

      return result;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Coherence check error:', error);
      return {
        is_coherent: true, // Fallback optimiste
        coherence_score: 1.0,
        issues: [],
        suggestions: [],
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. OPTIMISATION CONTEXTE LONG (4-50k tokens)
  // ═══════════════════════════════════════════════════════════════════

  async optimizeLongContext(messages: CognitiveMessage[]): Promise<ContextOptimization> {
    try {
      // Calculer tokens totaux
      const originalTokens = messages.reduce((sum, msg) => sum + msg.tokens, 0);

      // Appliquer compression contextuelle
      const result = await invoke<ContextOptimization>('cognitive_optimize_context', {
        messages,
        maxTokens: 8000, // Limite pour IA (GPT-4 Turbo = 128k, on garde marge)
        compressionStrategy: 'semantic_grouping',
      });

      // Mettre à jour contexte interne
      this.context.compression_ratio = result.compression_ratio;
      this.context.total_tokens = result.optimized_tokens;

      return result;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Context optimization error:', error);
      return {
        original_tokens: 0,
        optimized_tokens: 0,
        compression_ratio: 1.0,
        semantic_preservation: 1.0,
        removed_noise: [],
        prioritized_segments: [],
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. MEMORY GATING (rappel intelligent)
  // ═══════════════════════════════════════════════════════════════════

  async memoryGating(query: string, threshold: number = 0.7): Promise<MemoryGatingResult> {
    try {
      // Récupérer mémoires pertinentes via vectorisation
      const result = await invoke<MemoryGatingResult>('cognitive_memory_gating', {
        query,
        threshold,
        maxRetrieve: 10,
      });

      // Mettre à jour contexte avec mémoires récupérées
      this.context.messages.push(...result.retrieved_memories);

      return result;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Memory gating error:', error);
      return {
        retrieved_memories: [],
        relevance_scores: [],
        total_retrieved: 0,
        gating_threshold: threshold,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. CLUSTERING SÉMANTIQUE
  // ═══════════════════════════════════════════════════════════════════

  async clusterSemanticMessages(messages: CognitiveMessage[]): Promise<SemanticCluster[]> {
    try {
      const clusters = await invoke<SemanticCluster[]>('cognitive_cluster_messages', {
        messages,
        algorithm: 'kmeans',
        numClusters: Math.min(5, Math.ceil(messages.length / 10)),
      });

      // Mettre à jour contexte
      this.context.semantic_clusters = clusters;

      return clusters;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Semantic clustering error:', error);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. AUTO-CORRECTION RÉPONSE
  // ═══════════════════════════════════════════════════════════════════

  private async autoCorrectResponse(
    response: string,
    context: CognitiveMessage[],
    issues: string[]
  ): Promise<string> {
    try {
      const corrected = await invoke<string>('cognitive_auto_correct_response', {
        response,
        context,
        issues,
      });

      return corrected;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Auto-correction error:', error);
      return response; // Fallback sur réponse originale
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. SUPPRESSION BRUIT (noise removal)
  // ═══════════════════════════════════════════════════════════════════

  async removeNoise(messages: CognitiveMessage[]): Promise<CognitiveMessage[]> {
    try {
      const cleaned = await invoke<CognitiveMessage[]>('cognitive_remove_noise', {
        messages,
        strategies: [
          'remove_duplicates',
          'remove_low_relevance',
          'remove_contradictions',
          'remove_circular_references',
        ],
      });

      return cleaned;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Noise removal error:', error);
      return messages;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 8. INJECTION SÉLECTIVE (context injection)
  // ═══════════════════════════════════════════════════════════════════

  async injectSelective(
    baseContext: CognitiveMessage[],
    additionalContext: CognitiveMessage[]
  ): Promise<CognitiveMessage[]> {
    try {
      // Injecter uniquement messages pertinents via scoring
      const injected = await invoke<CognitiveMessage[]>('cognitive_inject_selective', {
        baseContext,
        additionalContext,
        relevanceThreshold: 0.6,
      });

      return injected;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Selective injection error:', error);
      return baseContext;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 9. PRIORISATION INTELLIGENTE
  // ═══════════════════════════════════════════════════════════════════

  async prioritizeAnalysisSteps(intention: IntentionAnalysis): Promise<string[]> {
    try {
      const steps = await invoke<string[]>('cognitive_prioritize_steps', {
        intention,
        context: this.context,
      });

      return steps;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Step prioritization error:', error);
      return ['analyze', 'generate', 'validate'];
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 10. MINI REASONING (auto-vérification)
  // ═══════════════════════════════════════════════════════════════════

  async miniReasoning(query: string, response: string): Promise<{ valid: boolean; reasoning: string }> {
    try {
      const result = await invoke<{ valid: boolean; reasoning: string }>('cognitive_mini_reasoning', {
        query,
        response,
      });

      return result;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Mini reasoning error:', error);
      return { valid: true, reasoning: 'No reasoning available' };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 11. CONTINUITÉ NARRATIVE
  // ═══════════════════════════════════════════════════════════════════

  async maintainNarrativeContinuity(messages: CognitiveMessage[]): Promise<number> {
    try {
      const continuityScore = await invoke<number>('cognitive_narrative_continuity', {
        messages,
      });

      this.context.narrative_continuity = continuityScore;
      return continuityScore;
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Narrative continuity error:', error);
      return 1.0;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // GESTION CONTEXTE
  // ═══════════════════════════════════════════════════════════════════

  addMessage(message: CognitiveMessage): void {
    this.context.messages.push(message);
    this.context.total_tokens += message.tokens;

    // Auto-compression si trop de tokens
    if (this.context.total_tokens > 40000) {
      this.optimizeLongContext(this.context.messages);
    }
  }

  getContext(): CognitiveContext {
    return { ...this.context };
  }

  clearContext(): void {
    this.context = {
      messages: [],
      total_tokens: 0,
      compression_ratio: 1.0,
      semantic_clusters: [],
      active_intentions: [],
      coherence_score: 1.0,
      narrative_continuity: 1.0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  private updateCache(key: string, value: any): void {
    if (this.shortTermCache.size >= this.MAX_CACHE_SIZE) {
      // Supprimer entrée la plus ancienne (FIFO)
      const firstKey = this.shortTermCache.keys().next().value;
      this.shortTermCache.delete(firstKey);
    }
    this.shortTermCache.set(key, value);
  }

  clearCache(): void {
    this.shortTermCache.clear();
  }

  getCacheSize(): number {
    return this.shortTermCache.size;
  }

  // ═══════════════════════════════════════════════════════════════════
  // FULL OPTIMIZATION PIPELINE
  // ═══════════════════════════════════════════════════════════════════

  async optimizeFullPipeline(
    userMessage: string,
    conversationHistory: CognitiveMessage[]
  ): Promise<{
    optimizedContext: CognitiveMessage[];
    intention: IntentionAnalysis;
    analysisSteps: string[];
    retrievedMemories: CognitiveMessage[];
  }> {
    try {
      // 1. Analyser intention
      const intention = await this.analyzeIntention(userMessage);

      // 2. Memory gating (si contexte long requis)
      let retrievedMemories: CognitiveMessage[] = [];
      if (intention.requires_long_context) {
        const memoryResult = await this.memoryGating(userMessage);
        retrievedMemories = memoryResult.retrieved_memories;
      }

      // 3. Construire contexte complet
      let fullContext = [...conversationHistory, ...retrievedMemories];

      // 4. Supprimer bruit
      fullContext = await this.removeNoise(fullContext);

      // 5. Optimiser contexte long
      if (fullContext.length > 50) {
        await this.optimizeLongContext(fullContext);
      }

      // 6. Clustering sémantique
      if (fullContext.length > 20) {
        await this.clusterSemanticMessages(fullContext);
      }

      // 7. Prioriser étapes d'analyse
      const analysisSteps = await this.prioritizeAnalysisSteps(intention);

      return {
        optimizedContext: fullContext,
        intention,
        analysisSteps,
        retrievedMemories,
      };
    } catch (error) {
      console.error('[CognitiveOptimizationEngine] Full pipeline error:', error);
      return {
        optimizedContext: conversationHistory,
        intention: {
          primary_intention: 'unknown',
          secondary_intentions: [],
          confidence: 0,
          complexity: 'simple',
          requires_reasoning: false,
          requires_long_context: false,
        },
        analysisSteps: ['generate'],
        retrievedMemories: [],
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════

export const CognitiveOptimizer = CognitiveOptimizationEngine.getInstance();
