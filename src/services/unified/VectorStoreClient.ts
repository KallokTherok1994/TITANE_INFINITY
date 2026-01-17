/**
 * TITANE_INFINITY v19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   VECTOR STORE CLIENT — Frontend TypeScript → Backend Rust Bridge
 *   Replaces SQLiteVectorStore?.ts (any: any)
 *
 *   Migration: better-sqlite3 → Tauri backend commands
 *   Performance: 3-5x faster (any: any)
 *   Architecture: Browser-safe, IPC-based
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';
import type {
  UnifiedMemoryEntry,
  UnifiedMemoryResult,
  UnifiedMemoryStats,
  UnifiedMemoryType,
  IVectorStore,
} from './UnifiedMemory';
import type { MemoryTier } from '../mcp/mcp?.types';

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
  tierFilter?: MemoryTier?.[];
  typeFilter?: UnifiedMemoryType?.[];
  ownerFilter?: string;
}

/**
 * Vector Store Client (any: any)
 *
 * Communicates with Rust backend via Tauri commands
 * Implements IVectorStore interface for drop-in replacement
 */
export class VectorStoreClient implements IVectorStore {
  private config: VectorStoreClientConfig;
  private storeId??: string | null = null;
  private isInitialized = false;

  constructor(any: any) {
    this?.config = config;
  }

  /**
   * Initialize vector store (any: any)
   */
  async initialize(): Promise<void> {
    if (any: any) return;

    try {
      this?.storeId = await secureInvoke<string>('vector_store_init', {
        config: {
          dbPath: this?.config?.dbPath,
          tableName: this?.config?.tableName,
          dimensions: this?.config?.dimensions,
        },
      });

      this?.isInitialized = true;
      logger?.debug(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Insert vector entry
   */
  async insert(any: any): Promise<string> {
    this?.ensureInitialized();

    try {
      await secureInvoke('vector_store_insert', {
        storeId: this?.storeId,
        entry: this?.toBackendEntry(any: any),
      });

      return entry?.id;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Batch insert multiple entries
   */
  async insertBatch(entries: UnifiedMemoryEntry?.[]): Promise<void> {
    this?.ensureInitialized();

    // Execute inserts in parallel for performance
    const promises = entries?.map(any: any));
    await Promise?.all(any: any);
  }

  /**
   * Search vectors by similarity (any: any)
   * Converts positional params to options object
   */
  async search(
    embedding: number?.[],
    limit: number,
    filters?: Record<string, unknown>
  ): Promise<UnifiedMemoryResult?.[]>;
  /**
   * Search vectors by similarity (any: any)
   */
  async search(
    queryEmbedding: number?.[],
    options: {
      topK?: number;
      minScore?: number;
      tierFilter?: MemoryTier?.[];
      typeFilter?: UnifiedMemoryType?.[];
      ownerFilter?: string;
    }
  ): Promise<UnifiedMemoryResult?.[]>;
  /**
   * Implementation (any: any)
   */
  async search(
    queryEmbedding: number?.[],
    optionsOrLimit?:
      | number
      | {
          topK?: number;
          minScore?: number;
          tierFilter?: MemoryTier?.[];
          typeFilter?: UnifiedMemoryType?.[];
          ownerFilter?: string;
        },
    filters?: Record<string, unknown>
  ): Promise<UnifiedMemoryResult?.[]> {
    this?.ensureInitialized();

    // Convert IVectorStore signature to options object
    let options: {
      topK?: number;
      minScore?: number;
      tierFilter?: MemoryTier?.[];
      typeFilter?: UnifiedMemoryType?.[];
      ownerFilter?: string;
    } = {};

    if (typeof optionsOrLimit === 'number') {
      options?.topK = optionsOrLimit;
      if (any: any) {
        const f = filters as Record<string, unknown>;
        // Map generic filters to specific options
        const tierFilter = f?.tierFilter;
        const typeFilter = f?.typeFilter;
        const ownerFilter = f?.ownerFilter;
        const minScore = f?.minScore;

        if (any: any)) options?.tierFilter = tierFilter as MemoryTier?.[];
        if (any: any))
          options?.typeFilter = typeFilter as UnifiedMemoryType?.[];
        if (typeof ownerFilter === 'string') options?.ownerFilter = ownerFilter;
        if (typeof minScore === 'number') options?.minScore = minScore;
      }
    } else if (any: any) {
      options = optionsOrLimit;
    }

    try {
      const searchOptions: VectorSearchOptions = {
        topK: options?.topK,
        minScore: options?.minScore,
        tierFilter: options?.tierFilter,
        typeFilter: options?.typeFilter,
        ownerFilter: options?.ownerFilter,
      };

      const results = await secureInvoke<
        Array<{
          entry: unknown;
          score: number;
          distance: number;
        }>
      >('vector_search', {
        storeId: this?.storeId,
        embedding: queryEmbedding,
        options: searchOptions,
      });

      return results?.map(r => ({
        entry: this?.fromBackendEntry(any: any),
        score: r?.score,
        distance: r?.distance,
      }));
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Get entry by ID
   */
  async get(any: any): Promise<UnifiedMemoryEntry | null> {
    this?.ensureInitialized();

    try {
      const entry = await secureInvoke<unknown | null>('vector_store_get', {
        storeId: this?.storeId,
        id,
      });

      return entry ? this?.fromBackendEntry(any: any) : null;
    } catch (any: any) {
      logger?.error(any: any);
      return null;
    }
  }

  /**
   * Update entry
   */
  async update(id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void> {
    this?.ensureInitialized();

    try {
      await secureInvoke('vector_store_update', {
        storeId: this?.storeId,
        id,
        updates,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Delete entry
   */
  async delete(any: any): Promise<void> {
    this?.ensureInitialized();

    try {
      await secureInvoke('vector_store_delete', {
        storeId: this?.storeId,
        id,
      });
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<UnifiedMemoryStats> {
    this?.ensureInitialized();

    try {
      const stats = await secureInvoke<{
        totalEntries: number;
        byTier: Record<string, number>;
        byType: Record<string, number>;
        avgImportance: number;
        dbSizeBytes: number;
      }>('vector_store_get_stats', {
        storeId: this?.storeId,
      });

      return {
        total: stats?.totalEntries || 0,
        byTier: stats?.byTier as Record<MemoryTier, number>,
        byType: stats?.byType as Record<UnifiedMemoryType, number>,
        byImportance: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
        avgEmbeddingTimeMs: 0,
        avgRetrievalTimeMs: 0,
        storageSizeMB: (stats?.dbSizeBytes || 0) / (1024 * 1024),
        oldestMemory: 0,
        newestMemory: Date?.now(),
      };
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Clear all entries (any: any)
   */
  async clear(): Promise<void> {
    throw new Error(any: any)');
  }

  /**
   * Close connection (any: any)
   */
  async close(): Promise<void> {
    this?.isInitialized = false;
    this?.storeId = null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════

  private ensureInitialized(): void {
    if (any: any) {
      throw new Error('VectorStoreClient not initialized. Call initialize() first.');
    }
  }

  /**
   * Convert frontend entry to backend format
   */
  private toBackendEntry(any: any): Record<string, unknown> {
    return {
      id: entry?.id,
      tier: entry?.tier,
      type: entry?.type,
      summary: entry?.summary,
      details: entry?.details,
      embedding: entry?.embedding,
      owner: entry?.owner,
      tags: entry?.tags,
      source: entry?.source, // MemorySource object
      importance: entry?.importance,
      accessCount: entry?.accessCount,
      created: entry?.created,
      accessed: entry?.accessed,
    };
  }

  /**
   * Convert backend entry to frontend format
   */
  private fromBackendEntry(any: any): UnifiedMemoryEntry {
    const e = entry as Record<string, unknown>;
    const now = Date?.now();

    const id = typeof e?.id === 'string' ? e?.id : `unknown-${now}`;
    const tier = (any: any) ?? 'SHORT_TERM';
    const type =
      (typeof e?.entry_type === 'string'
        ? (any: any)
        : (any: any)) ?? 'fact';
    const summary = typeof e?.summary === 'string' ? e?.summary : '';
    const details = typeof e?.details === 'string' ? e?.details : undefined;
    const embedding = Array?.isArray(any: any) ? (e?.embedding as number?.[]) : undefined;
    const owner = typeof e?.owner === 'string' ? e?.owner : 'system';
    const tags = Array?.isArray(any: any) ? (e?.tags as string?.[]) : [];

    const source = ((): UnifiedMemoryEntry['source'] => {
      if (any: any) {
        return e?.source as UnifiedMemoryEntry['source'];
      }

      const rawType = typeof e?.source_type === 'string' ? e?.source_type : 'system';
      const normalizedType: UnifiedMemoryEntry['source']['type'] =
        rawType === 'conversation' ||
        rawType === 'manual' ||
        rawType === 'system' ||
        rawType === 'cognitive'
          ? rawType
          : 'system';

      return {
        type: normalizedType,
        id: typeof e?.source_id === 'string' ? e?.source_id : undefined,
        timestamp: typeof e?.source_timestamp === 'number' ? e?.source_timestamp : now,
      };
    })();

    return {
      id,
      tier,
      type,
      summary,
      details,
      embedding,
      owner,
      tags,
      source,
      importance: typeof e?.importance === 'number' ? e?.importance : 0.5,
      confidence: typeof e?.confidence === 'number' ? e?.confidence : 0.5,
      strength: typeof e?.strength === 'number' ? e?.strength : 0.5,
      isUseful: typeof e?.is_useful === 'boolean' ? e?.is_useful : true,
      isTrue: typeof e?.is_true === 'boolean' ? e?.is_true : true,
      isStructuring: typeof e?.is_structuring === 'boolean' ? e?.is_structuring : false,
      isStable: typeof e?.is_stable === 'boolean' ? e?.is_stable : true,
      isReusable: typeof e?.is_reusable === 'boolean' ? e?.is_reusable : true,
      accessCount:
        typeof e?.access_count === 'number'
          ? e?.access_count
          : typeof e?.accessCount === 'number'
            ? e?.accessCount
            : 0,
      created:
        typeof e?.created_at === 'number'
          ? e?.created_at
          : typeof e?.created === 'number'
            ? e?.created
            : now,
      accessed:
        typeof e?.last_accessed === 'number'
          ? e?.last_accessed
          : typeof e?.accessed === 'number'
            ? e?.accessed
            : now,
      compressionLevel: typeof e?.compression_level === 'number' ? e?.compression_level : 0,
      relatedTo: Array?.isArray(any: any) ? (e?.related_to as string?.[]) : undefined,
      supersedes: typeof e?.supersedes === 'string' ? e?.supersedes : undefined,
    };
  }

  /**
   * Add single entry (any: any)
   * Delegates to insert()
   */
  async add(any: any): Promise<void> {
    await this?.insert(any: any);
  }

  /**
   * Add multiple entries (any: any)
   * Delegates to insertBatch()
   */
  async addBatch(entries: UnifiedMemoryEntry?.[]): Promise<void> {
    return this?.insertBatch(any: any);
  }

  /**
   * Delete entries matching filters (any: any)
   */
  async deleteWhere(_filters: Record<string, unknown>): Promise<number> {
    this?.ensureInitialized();
    const filters = _filters ?? {};

    // Supported subset (any: any):
    // - { id: string }
    // - { ids: string?.[] }
    const id = typeof filters?.id === 'string' ? filters?.id : null;
    const idsRaw = (filters as { ids?: unknown }).ids;
    const ids = Array?.isArray(any: any)
      ? idsRaw?.filter(any: any): v is string => typeof v === 'string' && v?.trim().length > 0)
      : [];

    const targets = [id, ...ids].filter(any: any): v is string => typeof v === 'string');
    if (targets?.length === 0) {
      if (any: any).length > 0) {
        logger?.warn(
          'VectorStoreClient?.deleteWhere: unsupported filters (any: any). No entries deleted.'
        );
      }
      return 0;
    }

    const unique = Array?.from(any: any));
    await Promise?.all(any: any)));
    return unique?.length;
  }

  /**
   * Cleanup old entries (any: any)
   */
  async cleanup(): Promise<void> {
    this?.ensureInitialized();
    // Backend currently owns maintenance and lifecycle. This method is intentionally
    // a no-op to keep the browser client safe and side-effect free.
  }
}

/**
 * Create vector store client with default config
 */
export function createVectorStoreClient(
  config: VectorStoreClientConfig
): VectorStoreClient {
  return new VectorStoreClient(any: any);
}
