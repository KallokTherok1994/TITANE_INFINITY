/**
 * SEMANTIC MEMORY ENGINE v∞ — Core Implementation
 *
 * Moteur de mémoire longue durée sémantique pour TITANE∞
 *
 * Features:
 * - Embeddings vectoriels (local ou API)
 * - Retrieval par similarité cosine
 * - Scoring hybride (similarité + importance + récence)
 * - Auto-cleanup des mémoires obsolètes
 * - Intégration OMEGA transparente
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  SemanticMemoryEntry,
  SemanticMemoryQuery,
  SemanticMemoryResult,
  MemoryContext,
  SemanticMemoryConfig,
  SemanticMemoryStats,
  VectorStore,
  EmbeddingGenerator,
  MemoryEvent,
  MemoryEventHandler,
  SemanticMemoryType,
  MemoryImportance as _MemoryImportance,
} from './semanticMemory.types';

/**
 * Configuration par défaut
 */
const DEFAULT_CONFIG: SemanticMemoryConfig = {
  enabled: true,
  embedding_model: {
    type: 'local',
    model_name: 'all-MiniLM-L6-v2',
    dimensions: 384,
  },
  storage: {
    type: 'sqlite',
    path: './data/semantic_memory.db',
    collection_name: 'memories',
  },
  limits: {
    max_memories_total: 10000,
    max_memories_per_query: 5,
    max_age_days: 365,
  },
  scoring: {
    similarity_threshold: 0.7,
    importance_weight: 0.2,
    recency_weight: 0.1,
  },
  auto_cleanup: {
    enabled: true,
    interval_hours: 24,
    remove_below_score: 0.3,
  },
};

/**
 * Semantic Memory Engine
 */
export class SemanticMemoryEngine {
  private config: SemanticMemoryConfig;
  private vectorStore: VectorStore;
  private embeddingGenerator: EmbeddingGenerator;
  private eventHandlers: MemoryEventHandler[] = [];
  private cleanupInterval?: NodeJS.Timeout;
  private isInitialized = false;

  constructor(
    vectorStore: VectorStore,
    embeddingGenerator: EmbeddingGenerator,
    config?: Partial<SemanticMemoryConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.vectorStore = vectorStore;
    this.embeddingGenerator = embeddingGenerator;
  }

  /**
   * Initialiser le moteur
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialiser le vector store
      await this.vectorStore.initialize();

      // Initialiser le générateur d'embeddings
      await this.embeddingGenerator.initialize();

      // Démarrer auto-cleanup si activé
      if (this.config.auto_cleanup.enabled) {
        this.startAutoCleanup();
      }

      this.isInitialized = true;
      console.log('[SemanticMemory] Engine initialized');
    } catch (error) {
      console.error('[SemanticMemory] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Créer une entrée mémoire
   */
  async createMemory(params: {
    type: SemanticMemoryType;
    owner: string;
    summary: string;
    details?: string;
    source: SemanticMemoryEntry['source'];
    tags?: string[];
    importance?: number;
    related_to?: string[];
  }): Promise<SemanticMemoryEntry> {
    if (!this.config.enabled) {
      throw new Error('Semantic memory is disabled');
    }

    // Générer embedding
    const text = params.details || params.summary;
    const embedding = await this.embeddingGenerator.generate(text);

    // Créer l'entrée
    const entry: SemanticMemoryEntry = {
      id: uuidv4(),
      type: params.type,
      owner: params.owner,
      summary: params.summary,
      details: params.details,
      source: params.source,
      tags: params.tags || [],
      embedding,
      importance: params.importance || 0.5, // MemoryImportance.MEDIUM value
      created_at: new Date().toISOString(),
      access_count: 0,
      confidence: 0.9,
      related_to: params.related_to,
    };

    // Stocker
    await this.vectorStore.add(entry);

    // Émettre événement
    this.emitEvent({
      type: 'memory_added',
      timestamp: new Date().toISOString(),
      data: { memory_id: entry.id, type: entry.type },
    });

    return entry;
  }

  /**
   * Retrieval sémantique
   */
  async retrieve(query: SemanticMemoryQuery): Promise<MemoryContext> {
    if (!this.config.enabled) {
      return this.createEmptyContext(query.text);
    }

    const startTime = Date.now();

    try {
      // Générer embedding de la query
      const queryEmbedding = await this.embeddingGenerator.generate(query.text);

      // Préparer les filtres
      const filters = this.buildFilters(query.filters);

      // Rechercher dans le vector store
      const limit = query.limit || this.config.limits.max_memories_per_query;
      const rawResults = await this.vectorStore.search(
        queryEmbedding,
        limit * 2, // Récupérer plus pour filtrer après
        filters
      );

      // Appliquer scoring hybride
      const scoredResults = this.applyHybridScoring(
        rawResults,
        query.scoring_weights || {
          similarity: 0.7,
          importance: 0.2,
          recency: 0.1,
        }
      );

      // Filtrer par seuil
      const threshold =
        query.similarity_threshold || this.config.scoring.similarity_threshold;
      const filteredResults = scoredResults
        .filter(r => r.score >= threshold)
        .slice(0, limit);

      // Mettre à jour last_used_at et access_count
      await this.updateAccessMetrics(filteredResults.map(r => r.entry.id));

      // Créer le contexte
      const context = this.createMemoryContext(
        filteredResults,
        query.text,
        Date.now() - startTime
      );

      // Émettre événement
      this.emitEvent({
        type: 'memory_retrieved',
        timestamp: new Date().toISOString(),
        data: {
          query: query.text,
          count: filteredResults.length,
          avg_score: context.metadata?.avg_score,
        },
      });

      return context;
    } catch (error) {
      console.error('[SemanticMemory] Retrieval failed:', error);
      return this.createEmptyContext(query.text);
    }
  }

  /**
   * Mettre à jour une mémoire
   */
  async updateMemory(
    id: string,
    updates: Partial<Omit<SemanticMemoryEntry, 'id' | 'created_at' | 'embedding'>>
  ): Promise<void> {
    // Si le contenu change, regénérer l'embedding
    if (updates.summary || updates.details) {
      const text = updates.details || updates.summary;
      if (text) {
        const embedding = await this.embeddingGenerator.generate(text);
        await this.vectorStore.update(id, { ...updates, embedding });
      } else {
        await this.vectorStore.update(id, updates);
      }
    } else {
      await this.vectorStore.update(id, updates);
    }

    this.emitEvent({
      type: 'memory_updated',
      timestamp: new Date().toISOString(),
      data: { memory_id: id, updates },
    });
  }

  /**
   * Supprimer une mémoire
   */
  async deleteMemory(id: string): Promise<void> {
    await this.vectorStore.delete(id);

    this.emitEvent({
      type: 'memory_deleted',
      timestamp: new Date().toISOString(),
      data: { memory_id: id },
    });
  }

  /**
   * Supersede: remplacer une ancienne mémoire par une nouvelle
   */
  async supersedeMemory(
    oldId: string,
    newMemory: Parameters<typeof this.createMemory>[0]
  ): Promise<SemanticMemoryEntry> {
    const entry = await this.createMemory(newMemory);
    await this.updateMemory(entry.id, { supersedes: oldId });
    await this.updateMemory(oldId, {
      valid_until: new Date().toISOString(),
      confidence: 0.3,
    });
    return entry;
  }

  /**
   * Obtenir les stats
   */
  async getStats(): Promise<SemanticMemoryStats> {
    return await this.vectorStore.getStats();
  }

  /**
   * Cleanup manuel
   */
  async cleanup(): Promise<void> {
    const threshold = this.config.auto_cleanup.remove_below_score;
    const maxAgeDays = this.config.limits.max_age_days;

    // Supprimer les mémoires obsolètes
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    await this.vectorStore.deleteWhere({
      $or: [
        { importance: { $lt: threshold } },
        { created_at: { $lt: cutoffDate.toISOString() } },
        { valid_until: { $lt: new Date().toISOString() } },
      ],
    });

    this.emitEvent({
      type: 'cleanup_performed',
      timestamp: new Date().toISOString(),
      data: { threshold, maxAgeDays },
    });
  }

  /**
   * Abonner un handler d'événements
   */
  onEvent(handler: MemoryEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Fermer le moteur
   */
  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    await this.vectorStore.close();
    this.isInitialized = false;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Construire les filtres pour le vector store
   */
  private buildFilters(filters?: SemanticMemoryQuery['filters']): Record<string, any> {
    if (!filters) return {};

    const result: Record<string, any> = {};

    if (filters.types) {
      result.type = { $in: filters.types };
    }

    if (filters.tags) {
      result.tags = { $contains: filters.tags };
    }

    if (filters.owner) {
      result.owner = filters.owner;
    }

    if (filters.min_importance !== undefined) {
      result.importance = { $gte: filters.min_importance };
    }

    if (filters.max_age_days !== undefined) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filters.max_age_days);
      result.created_at = { $gte: cutoff.toISOString() };
    }

    if (filters.conversation_id) {
      result['source.id'] = filters.conversation_id;
    }

    return result;
  }

  /**
   * Appliquer le scoring hybride
   * Score = (w1 * similarité) + (w2 * importance) + (w3 * récence)
   */
  private applyHybridScoring(
    results: SemanticMemoryResult[],
    weights: { similarity: number; importance: number; recency: number }
  ): SemanticMemoryResult[] {
    const now = Date.now();
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 an en ms

    return results
      .map(result => {
        const { entry, similarity } = result;

        // Score de récence (1.0 = aujourd'hui, 0.0 = 1 an ou plus)
        const ageMs = now - new Date(entry.last_used_at || entry.created_at).getTime();
        const recencyScore = Math.max(0, 1 - ageMs / maxAge);

        // Score hybride
        const hybridScore =
          weights.similarity * similarity +
          weights.importance * entry.importance +
          weights.recency * recencyScore;

        return {
          ...result,
          score: Math.min(1, Math.max(0, hybridScore)),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Créer le contexte mémoire pour injection OMEGA
   */
  private createMemoryContext(
    results: SemanticMemoryResult[],
    query: string,
    retrievalTimeMs: number
  ): MemoryContext {
    // Créer le résumé textuel
    const summary = this.createTextualSummary(results);

    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

    return {
      memories: results,
      summary,
      metadata: {
        query,
        total_retrieved: results.length,
        avg_score: avgScore,
        retrieval_time_ms: retrievalTimeMs,
      },
    };
  }

  /**
   * Créer le résumé textuel pour injection
   */
  private createTextualSummary(results: SemanticMemoryResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const lines = ['**Souvenirs pertinents:**\n'];

    results.forEach((result, index) => {
      const { entry } = result;
      const icon = this.getTypeIcon(entry.type);
      lines.push(`${index + 1}. ${icon} ${entry.summary}`);
      if (entry.details && entry.details.length < 200) {
        lines.push(`   → ${entry.details}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * Icône par type de mémoire
   */
  private getTypeIcon(type: SemanticMemoryType): string {
    const icons: Record<SemanticMemoryType, string> = {
      fact: '📌',
      preference: '⭐',
      decision: '✅',
      milestone: '🎯',
      pattern: '🔄',
      context: '📍',
    };
    return icons[type] || '•';
  }

  /**
   * Créer un contexte vide
   */
  private createEmptyContext(query: string): MemoryContext {
    return {
      memories: [],
      summary: '',
      metadata: {
        query,
        total_retrieved: 0,
        avg_score: 0,
        retrieval_time_ms: 0,
      },
    };
  }

  /**
   * Mettre à jour les métriques d'accès
   */
  private async updateAccessMetrics(ids: string[]): Promise<void> {
    const now = new Date().toISOString();

    for (const id of ids) {
      const entry = await this.vectorStore.get(id);
      if (entry) {
        await this.vectorStore.update(id, {
          last_used_at: now,
          access_count: entry.access_count + 1,
        });
      }
    }
  }

  /**
   * Démarrer l'auto-cleanup
   */
  private startAutoCleanup(): void {
    const intervalMs = this.config.auto_cleanup.interval_hours * 60 * 60 * 1000;

    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch(error => {
        console.error('[SemanticMemory] Auto-cleanup failed:', error);
      });
    }, intervalMs);
  }

  /**
   * Émettre un événement
   */
  private emitEvent(event: MemoryEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('[SemanticMemory] Event handler error:', error);
      }
    });
  }
}

/**
 * Helper: calculer la similarité cosine
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const aVal = a[i] ?? 0;
    const bVal = b[i] ?? 0;
    dotProduct += aVal * bVal;
    normA += aVal * aVal;
    normB += bVal * bVal;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}
