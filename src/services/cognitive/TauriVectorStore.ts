/**
 * TITANE_INFINITY v19.5.3 - Tauri Vector Store Adapter
 *
 * Adaptateur pour VectorStore utilisant le backend Rust via Tauri
 * Remplace SQLiteVectorStore pour le mode navigateur
 */

import { secureInvoke } from '@/lib/security';
import type {
  SemanticMemoryEntry,
  SemanticMemoryResult,
  SemanticMemoryStats,
  VectorStore,
  SemanticMemoryType,
} from './semanticMemory.types';

/**
 * Configuration TauriVectorStore
 */
export interface TauriVectorStoreConfig {
  /** Chemin vers la base de données */
  dbPath: string;

  /** Nom de la collection */
  collectionName: string;

  /** Dimensions des vecteurs */
  dimensions: number;
}

/**
 * Tauri Vector Store Adapter
 *
 * Utilise le backend Rust pour toutes les opérations SQLite
 * Compatible avec le navigateur (pas de Node.js requis)
 */
export class TauriVectorStore implements VectorStore {
  private config: TauriVectorStoreConfig;
  private storeId: string | null = null;
  private isInitialized = false;

  constructor(config: TauriVectorStoreConfig) {
    this.config = config;
  }

  /**
   * Initialiser le store via backend Tauri
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialiser le VectorStore côté backend
      this.storeId = await invoke<string>('vector_store_init', {
        config: {
          db_path: this.config.dbPath,
          table_name: this.config.collectionName,
          dimensions: this.config.dimensions,
        },
      });

      this.isInitialized = true;
      console.log('[TauriVectorStore] Initialized:', this.storeId);
    } catch (error) {
      console.error('[TauriVectorStore] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Convertir SemanticMemoryEntry vers VectorEntry backend
   */
  private toVectorEntry(entry: SemanticMemoryEntry): Record<string, unknown> {
    return {
      id: entry.id,
      tier: 'LONG_TERM', // Default tier
      type: entry.type,
      summary: entry.summary,
      details: entry.details,
      embedding: entry.embedding,
      owner: entry.owner,
      tags: entry.tags,
      source_type: entry.source.type,
      source_id: entry.source.id,
      source_timestamp: new Date(entry.source.timestamp).getTime(),
      importance: entry.importance,
      access_count: entry.access_count,
      created_at: new Date(entry.created_at).getTime(),
      updated_at: Date.now(),
      last_accessed: entry.last_used_at
        ? new Date(entry.last_used_at).getTime()
        : Date.now(),
    };
  }

  /**
   * Convertir VectorEntry backend vers SemanticMemoryEntry
   */
  private fromVectorEntry(entry: Record<string, unknown>): SemanticMemoryEntry {
    return {
      id: entry.id as string,
      type: entry.type as SemanticMemoryType,
      owner: entry.owner as string,
      summary: entry.summary as string,
      details: entry.details as string | undefined,
      source: {
        type: entry.source_type as 'system' | 'manual' | 'conversation',
        id: entry.source_id as string | undefined,
        timestamp: new Date(entry.source_timestamp as number).toISOString(),
        context: undefined,
      },
      tags: entry.tags as string[],
      embedding: entry.embedding as number[],
      importance: entry.importance as number,
      created_at: new Date(entry.created_at as number).toISOString(),
      last_used_at: entry.last_accessed
        ? new Date(entry.last_accessed as number).toISOString()
        : undefined,
      access_count: entry.access_count as number,
      related_to: undefined,
      supersedes: undefined,
      valid_until: undefined,
      confidence: entry.importance as number,
    };
  }

  /**
   * Ajouter une entrée
   */
  async add(entry: SemanticMemoryEntry): Promise<void> {
    if (!this.storeId) throw new Error('Store not initialized');

    await secureInvoke('vector_store_insert', {
      storeId: this.storeId,
      entry: this.toVectorEntry(entry),
    });
  }

  /**
   * Ajouter plusieurs entrées en batch
   */
  async addBatch(entries: SemanticMemoryEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.add(entry);
    }
  }

  /**
   * Recherche par similarité
   */
  async search(
    embedding: number[],
    limit: number,
    filters?: Record<string, unknown>
  ): Promise<SemanticMemoryResult[]> {
    if (!this.storeId) throw new Error('Store not initialized');

    const results = await invoke<
      Array<{
        entry: Record<string, unknown>;
        score: number;
        distance: number;
      }>
    >('vector_search', {
      storeId: this.storeId,
      embedding,
      options: {
        top_k: limit,
        min_score: filters?.minScore as number | undefined,
        tier_filter: filters?.tiers as string[] | undefined,
        type_filter: filters?.types as string[] | undefined,
        owner_filter: filters?.owner as string | undefined,
      },
    });

    return results.map(r => ({
      entry: this.fromVectorEntry(r.entry),
      score: r.score,
      similarity: r.score,
    }));
  }

  /**
   * Récupérer par ID
   */
  async get(id: string): Promise<SemanticMemoryEntry | null> {
    if (!this.storeId) throw new Error('Store not initialized');

    const entry = await invoke<Record<string, unknown> | null>('vector_store_get', {
      storeId: this.storeId,
      id,
    });

    return entry ? this.fromVectorEntry(entry) : null;
  }

  /**
   * Mettre à jour une entrée
   */
  async update(id: string, updates: Partial<SemanticMemoryEntry>): Promise<void> {
    if (!this.storeId) throw new Error('Store not initialized');

    const updateData: Record<string, unknown> = {};

    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.details !== undefined) updateData.details = updates.details;
    if (updates.importance !== undefined) updateData.importance = updates.importance;
    if (updates.access_count !== undefined)
      updateData.access_count = updates.access_count;

    await secureInvoke('vector_store_update', {
      storeId: this.storeId,
      id,
      updates: updateData,
    });
  }

  /**
   * Supprimer une entrée
   */
  async delete(id: string): Promise<void> {
    if (!this.storeId) throw new Error('Store not initialized');

    await secureInvoke('vector_store_delete', {
      storeId: this.storeId,
      id,
    });
  }

  /**
   * Supprimer par filtre (non supporté côté backend, fallback)
   */
  async deleteWhere(_filters: Record<string, unknown>): Promise<number> {
    console.warn('[TauriVectorStore] deleteWhere not fully supported, returning 0');
    return 0;
  }

  /**
   * Obtenir les stats
   */
  async getStats(): Promise<SemanticMemoryStats> {
    if (!this.storeId) throw new Error('Store not initialized');

    const stats = await invoke<{
      total_entries: number;
      by_tier: Record<string, number>;
      by_type: Record<string, number>;
      avg_importance: number;
      db_size_bytes: number;
    }>('vector_store_get_stats', {
      storeId: this.storeId,
    });

    return {
      total_memories: stats.total_entries,
      by_type: stats.by_type as Record<SemanticMemoryType, number>,
      by_importance: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      avg_embedding_time_ms: 0,
      avg_retrieval_time_ms: 0,
      storage_size_mb: stats.db_size_bytes / (1024 * 1024),
      oldest_memory: '',
      newest_memory: '',
    };
  }

  /**
   * Nettoyer le store
   */
  async cleanup(): Promise<void> {
    // Backend handles cleanup automatically
    console.log('[TauriVectorStore] Cleanup requested');
  }

  /**
   * Fermer les connexions
   */
  async close(): Promise<void> {
    this.storeId = null;
    this.isInitialized = false;
    console.log('[TauriVectorStore] Closed');
  }
}

class InMemoryVectorStore implements VectorStore {
  private entries = new Map<string, SemanticMemoryEntry>();
  private initialized = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_dimensions: number) {}

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async add(entry: SemanticMemoryEntry): Promise<void> {
    if (!this.initialized) throw new Error('Store not initialized');
    this.entries.set(entry.id, entry);
  }

  async addBatch(entries: SemanticMemoryEntry[]): Promise<void> {
    if (!this.initialized) throw new Error('Store not initialized');
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
    }
  }

  async search(
    embedding: number[],
    limit: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filters?: Record<string, unknown>
  ): Promise<SemanticMemoryResult[]> {
    if (!this.initialized) throw new Error('Store not initialized');

    const scored: SemanticMemoryResult[] = [];
    for (const entry of this.entries.values()) {
      const score = cosineSimilarity(embedding, entry.embedding);
      scored.push({ entry, score, similarity: score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(0, limit));
  }

  async get(id: string): Promise<SemanticMemoryEntry | null> {
    if (!this.initialized) throw new Error('Store not initialized');
    return this.entries.get(id) ?? null;
  }

  async update(id: string, updates: Partial<SemanticMemoryEntry>): Promise<void> {
    if (!this.initialized) throw new Error('Store not initialized');
    const current = this.entries.get(id);
    if (!current) return;
    this.entries.set(id, { ...current, ...updates });
  }

  async delete(id: string): Promise<void> {
    if (!this.initialized) throw new Error('Store not initialized');
    this.entries.delete(id);
  }

  async deleteWhere(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filters: Record<string, unknown>
  ): Promise<number> {
    if (!this.initialized) throw new Error('Store not initialized');
    const count = this.entries.size;
    this.entries.clear();
    return count;
  }

  async getStats(): Promise<SemanticMemoryStats> {
    if (!this.initialized) throw new Error('Store not initialized');

    const byType: Record<SemanticMemoryType, number> = {
      fact: 0,
      preference: 0,
      decision: 0,
      milestone: 0,
      pattern: 0,
      context: 0,
    };

    let oldest = '';
    let newest = '';

    for (const entry of this.entries.values()) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1;

      if (!oldest || entry.created_at < oldest) oldest = entry.created_at;
      if (!newest || entry.created_at > newest) newest = entry.created_at;
    }

    return {
      total_memories: this.entries.size,
      by_type: byType,
      by_importance: { low: 0, medium: 0, high: 0, critical: 0 },
      avg_embedding_time_ms: 0,
      avg_retrieval_time_ms: 0,
      storage_size_mb: 0,
      oldest_memory: oldest,
      newest_memory: newest,
    };
  }

  async cleanup(): Promise<void> {
    // no-op
  }

  async close(): Promise<void> {
    this.initialized = false;
    this.entries.clear();
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i += 1) {
    const va = a[i] ?? 0;
    const vb = b[i] ?? 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Factory pour créer le bon VectorStore selon l'environnement
 */
export async function createVectorStore(
  config: TauriVectorStoreConfig
): Promise<VectorStore> {
  const isVitest = typeof (globalThis as unknown as { vi?: unknown }).vi !== 'undefined';
  const isTestMode = import.meta.env.MODE === 'test' || isVitest;

  if (isTestMode) {
    const store = new InMemoryVectorStore(config.dimensions);
    await store.initialize();
    return store;
  }

  // Essayer d'abord le backend Tauri
  try {
    const available = await invoke<boolean>('check_sqlite_available');
    if (available) {
      const store = new TauriVectorStore(config);
      await store.initialize();
      return store;
    }
  } catch {
    console.warn('[VectorStore] Backend Tauri not available');
  }

  // Fallback: lancer une erreur car SQLiteVectorStore nécessite Node.js
  throw new Error(
    'VectorStore not available. Backend Tauri is required for SQLite operations. ' +
      'Please run the application in Tauri mode.'
  );
}
