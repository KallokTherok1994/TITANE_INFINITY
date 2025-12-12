/**
 * TITANE_INFINITY v19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   VECTOR STORE CLIENT — Frontend TypeScript → Backend Rust Bridge
 *   Replaces SQLiteVectorStore.ts (browser-incompatible)
 *
 *   Migration: better-sqlite3 → Tauri backend commands
 *   Performance: 3-5x faster (Rust vs Node.js)
 *   Architecture: Browser-safe, IPC-based
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { invoke } from '@tauri-apps/api/core';
import type {
  UnifiedMemoryEntry,
  UnifiedMemoryResult,
  UnifiedMemoryStats,
  UnifiedMemoryType,
  IVectorStore,
} from './UnifiedMemory';
import type { MemoryTier } from '../mcp/mcp.types';

/**
 * Configuration
 */
export interface VectorStoreClientConfig {
  dbPath: string;
  tableName: string;
  dimensions: number;
}

/**
 * Search options for vector queries
 */
export interface VectorSearchOptions {
  topK?: number;
  minScore?: number;
  tierFilter?: MemoryTier[];
  typeFilter?: UnifiedMemoryType[];
  ownerFilter?: string;
}

/**
 * Vector Store Client (Browser-Safe)
 *
 * Communicates with Rust backend via Tauri commands
 * Implements IVectorStore interface for drop-in replacement
 */
export class VectorStoreClient implements IVectorStore {
  private config: VectorStoreClientConfig;
  private storeId: string | null = null;
  private isInitialized = false;

  constructor(config: VectorStoreClientConfig) {
    this.config = config;
  }

  /**
   * Initialize vector store (creates/opens database on backend)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.storeId = await invoke<string>('vector_store_init', {
        config: {
          dbPath: this.config.dbPath,
          tableName: this.config.tableName,
          dimensions: this.config.dimensions,
        },
      });

      this.isInitialized = true;
      console.log('[VectorStoreClient] Initialized:', this.storeId);
    } catch (error) {
      console.error('[VectorStoreClient] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Insert vector entry
   */
  async insert(entry: UnifiedMemoryEntry): Promise<string> {
    this.ensureInitialized();

    try {
      await invoke('vector_store_insert', {
        storeId: this.storeId,
        entry: this.toBackendEntry(entry),
      });

      return entry.id;
    } catch (error) {
      console.error('[VectorStoreClient] Insert failed:', error);
      throw error;
    }
  }

  /**
   * Batch insert multiple entries
   */
  async insertBatch(entries: UnifiedMemoryEntry[]): Promise<void> {
    this.ensureInitialized();

    // Execute inserts in parallel for performance
    const promises = entries.map(entry => this.insert(entry));
    await Promise.all(promises);
  }

  /**
   * Search vectors by similarity (IVectorStore interface implementation)
   * Converts positional params to options object
   */
  async search(
    embedding: number[],
    limit: number,
    filters?: Record<string, any>
  ): Promise<UnifiedMemoryResult[]>;
  /**
   * Search vectors by similarity (preferred signature)
   */
  async search(
    queryEmbedding: number[],
    options: {
      topK?: number;
      minScore?: number;
      tierFilter?: MemoryTier[];
      typeFilter?: UnifiedMemoryType[];
      ownerFilter?: string;
    }
  ): Promise<UnifiedMemoryResult[]>;
  /**
   * Implementation (handles both signatures)
   */
  async search(
    queryEmbedding: number[],
    optionsOrLimit?:
      | number
      | {
          topK?: number;
          minScore?: number;
          tierFilter?: MemoryTier[];
          typeFilter?: UnifiedMemoryType[];
          ownerFilter?: string;
        },
    filters?: Record<string, any>
  ): Promise<UnifiedMemoryResult[]> {
    this.ensureInitialized();

    // Convert IVectorStore signature to options object
    let options: {
      topK?: number;
      minScore?: number;
      tierFilter?: MemoryTier[];
      typeFilter?: UnifiedMemoryType[];
      ownerFilter?: string;
    } = {};

    if (typeof optionsOrLimit === 'number') {
      options.topK = optionsOrLimit;
      if (filters) {
        // Map generic filters to specific options
        if (filters.tierFilter) options.tierFilter = filters.tierFilter;
        if (filters.typeFilter) options.typeFilter = filters.typeFilter;
        if (filters.ownerFilter) options.ownerFilter = filters.ownerFilter;
        if (filters.minScore) options.minScore = filters.minScore;
      }
    } else if (optionsOrLimit) {
      options = optionsOrLimit;
    }

    try {
      const searchOptions: VectorSearchOptions = {
        topK: options.topK,
        minScore: options.minScore,
        tierFilter: options.tierFilter,
        typeFilter: options.typeFilter,
        ownerFilter: options.ownerFilter,
      };

      const results = await invoke<
        Array<{
          entry: any;
          score: number;
          distance: number;
        }>
      >('vector_search', {
        storeId: this.storeId,
        embedding: queryEmbedding,
        options: searchOptions,
      });

      return results.map(r => ({
        entry: this.fromBackendEntry(r.entry),
        score: r.score,
        distance: r.distance,
      }));
    } catch (error) {
      console.error('[VectorStoreClient] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get entry by ID
   */
  async get(id: string): Promise<UnifiedMemoryEntry | null> {
    this.ensureInitialized();

    try {
      const entry = await invoke<any | null>('vector_store_get', {
        storeId: this.storeId,
        id,
      });

      return entry ? this.fromBackendEntry(entry) : null;
    } catch (error) {
      console.error('[VectorStoreClient] Get failed:', error);
      return null;
    }
  }

  /**
   * Update entry
   */
  async update(id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void> {
    this.ensureInitialized();

    try {
      await invoke('vector_store_update', {
        storeId: this.storeId,
        id,
        updates,
      });
    } catch (error) {
      console.error('[VectorStoreClient] Update failed:', error);
      throw error;
    }
  }

  /**
   * Delete entry
   */
  async delete(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      await invoke('vector_store_delete', {
        storeId: this.storeId,
        id,
      });
    } catch (error) {
      console.error('[VectorStoreClient] Delete failed:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<UnifiedMemoryStats> {
    this.ensureInitialized();

    try {
      const stats = await invoke<{
        totalEntries: number;
        byTier: Record<string, number>;
        byType: Record<string, number>;
        avgImportance: number;
        dbSizeBytes: number;
      }>('vector_store_get_stats', {
        storeId: this.storeId,
      });

      return {
        total: stats.totalEntries || 0,
        byTier: stats.byTier as Record<MemoryTier, number>,
        byType: stats.byType as Record<UnifiedMemoryType, number>,
        byImportance: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
        avgEmbeddingTimeMs: 0,
        avgRetrievalTimeMs: 0,
        storageSizeMB: (stats.dbSizeBytes || 0) / (1024 * 1024),
        oldestMemory: 0,
        newestMemory: Date.now(),
      };
    } catch (error) {
      console.error('[VectorStoreClient] GetStats failed:', error);
      throw error;
    }
  }

  /**
   * Clear all entries (not implemented - for safety)
   */
  async clear(): Promise<void> {
    throw new Error('Clear operation not available via client (use backend directly)');
  }

  /**
   * Close connection (cleanup)
   */
  async close(): Promise<void> {
    this.isInitialized = false;
    this.storeId = null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.storeId) {
      throw new Error('VectorStoreClient not initialized. Call initialize() first.');
    }
  }

  /**
   * Convert frontend entry to backend format
   */
  private toBackendEntry(entry: UnifiedMemoryEntry): any {
    return {
      id: entry.id,
      tier: entry.tier,
      type: entry.type,
      summary: entry.summary,
      details: entry.details,
      embedding: entry.embedding,
      owner: entry.owner,
      tags: entry.tags,
      source: entry.source, // MemorySource object
      importance: entry.importance,
      accessCount: entry.accessCount,
      created: entry.created,
      accessed: entry.accessed,
    };
  }

  /**
   * Convert backend entry to frontend format
   */
  private fromBackendEntry(entry: any): UnifiedMemoryEntry {
    return {
      id: entry.id,
      tier: entry.tier,
      type: entry.entry_type || entry.type,
      summary: entry.summary,
      details: entry.details ?? undefined,
      embedding: entry.embedding,
      owner: entry.owner,
      tags: entry.tags,
      source: entry.source || {
        type: entry.source_type || 'system',
        id: entry.source_id,
        timestamp: entry.source_timestamp || Date.now(),
      },
      importance: entry.importance,
      confidence: entry.confidence ?? 0.5,
      strength: entry.strength ?? 0.5,
      isUseful: entry.is_useful ?? true,
      isTrue: entry.is_true ?? true,
      isStructuring: entry.is_structuring ?? false,
      isStable: entry.is_stable ?? true,
      isReusable: entry.is_reusable ?? true,
      accessCount: entry.access_count || entry.accessCount,
      created: entry.created_at || entry.created || Date.now(),
      accessed: entry.last_accessed || entry.accessed || Date.now(),
      compressionLevel: entry.compression_level ?? 0,
      relatedTo: entry.related_to ?? undefined,
      supersedes: entry.supersedes ?? undefined,
    };
  }

  /**
   * Add single entry (IVectorStore interface stub)
   * Delegates to insert()
   */
  async add(entry: UnifiedMemoryEntry): Promise<void> {
    await this.insert(entry);
  }

  /**
   * Add multiple entries (IVectorStore interface stub)
   * Delegates to insertBatch()
   */
  async addBatch(entries: UnifiedMemoryEntry[]): Promise<void> {
    return this.insertBatch(entries);
  }

  /**
   * Delete entries matching filters (IVectorStore interface stub)
   */
  async deleteWhere(_filters: Record<string, unknown>): Promise<number> {
    this.ensureInitialized();
    // TODO: Implement backend command for filtered deletion
    console.warn('VectorStoreClient.deleteWhere not yet implemented');
    return 0;
  }

  /**
   * Cleanup old entries (IVectorStore interface stub)
   */
  async cleanup(): Promise<void> {
    this.ensureInitialized();
    // TODO: Implement backend cleanup command
    console.warn('VectorStoreClient.cleanup not yet implemented');
  }
}

/**
 * Create vector store client with default config
 */
export function createVectorStoreClient(
  config: VectorStoreClientConfig
): VectorStoreClient {
  return new VectorStoreClient(config);
}
