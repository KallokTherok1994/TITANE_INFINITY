/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * UnifiedMemoryEngine - Unified Memory Management Engine
 * FUSION: Moteur #5 (Mémoire) + Memory Core + Singularity Memory OS
 *
 * This engine consolidates:
 * - Frontend unifiedMemory.ts (STM/MTM/LTM)
 * - Backend Memory OS vΩ (Rust)
 * - Vector store and semantic search
 * - Auto-consolidation and forgetting
 */

import { MemoryCache } from './frontend/memoryCache';
import { TauriBridge } from './bridge/tauriBridge';

import type {
  MemoryEntry,
  MemoryTier as _MemoryTier,
  MemoryType as _MemoryType,
  StoreOptions,
  RecallOptions,
  SearchResult,
  MemoryStats,
  CleanupResult,
  TierStats,
  PerformanceStats,
} from './types';

/**
 * UnifiedMemoryEngine - Central memory management system
 *
 * Responsibilities:
 * - Unified API for Frontend ↔ Backend memory
 * - Transparent STM → MTM → LTM hierarchy
 * - Semantic search via vector embeddings
 * - Automatic promotion based on importance
 * - Consolidation and garbage collection
 * - Intelligent forgetting (memory decay)
 */
class UnifiedMemoryImpl {
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  private cache: MemoryCache;
  private bridge: TauriBridge;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  private readonly config = {
    stm: { maxEntries: 20, maxAge: 5 * 60 * 1000 }, // 5 minutes
    mtm: { maxEntries: 200, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    ltm: { maxEntries: -1, maxAge: -1 }, // Unlimited
    promotionThreshold: 0.7,
    cleanupInterval: 60 * 1000, // 1 minute
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  private initialized = false;
  private performance: PerformanceStats = {
    avgStoreMs: 0,
    avgRecallMs: 0,
    avgSearchMs: 0,
    totalOperations: 0,
  };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.cache = new MemoryCache(100);
    this.bridge = new TauriBridge();

    console.log('[UnifiedMemory] Initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize the memory engine
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Start cleanup timer
    this.cleanupTimer = setInterval(() => {
      this.cleanup().catch(console.error);
    }, this.config.cleanupInterval);

    this.initialized = true;
    console.log('[UnifiedMemory] Engine started');
  }

  /**
   * Shutdown the memory engine
   */
  async shutdown(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Final cleanup
    await this.cleanup();

    this.initialized = false;
    console.log('[UnifiedMemory] Engine stopped');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Store a memory entry
   */
  async store(content: string, options: StoreOptions = {}): Promise<string> {
    const startTime = performance.now();

    const entry: MemoryEntry = {
      id: this.generateId(),
      content,
      type: options.type ?? 'conversation',
      tier: options.tier ?? 'stm',
      importance: options.importance ?? 0.5,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      metadata: options.metadata ?? {},
    };

    // Generate embedding if requested
    if (options.generateEmbedding) {
      entry.embedding = await this.bridge.generateEmbedding(content);
    }

    // Store in cache first (unless skipped)
    if (!options.skipCache) {
      this.cache.store(entry);
    }

    // Sync to backend
    try {
      const backendId = await this.bridge.store(entry, entry.tier);
      entry.id = backendId;
    } catch (error) {
      console.warn('[UnifiedMemory] Backend sync failed, using cache only');
    }

    this.updatePerformance('store', performance.now() - startTime);
    return entry.id;
  }

  /**
   * Store a full entry object
   */
  async storeEntry(entry: MemoryEntry): Promise<string> {
    const startTime = performance.now();

    // Ensure ID
    if (!entry.id) {
      entry.id = this.generateId();
    }

    // Cache
    this.cache.store(entry);

    // Backend
    try {
      await this.bridge.store(entry, entry.tier);
    } catch (error) {
      console.warn('[UnifiedMemory] Backend sync failed');
    }

    this.updatePerformance('store', performance.now() - startTime);
    return entry.id;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RETRIEVAL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Recall memories matching a query
   */
  async recall(query: string, options: RecallOptions = {}): Promise<MemoryEntry[]> {
    const startTime = performance.now();

    // Try cache first
    if (!options.forceBackend) {
      const cached = this.cache.query(query);
      if (cached.length > 0) {
        this.updatePerformance('recall', performance.now() - startTime);
        return this.filterResults(cached, options);
      }
    }

    // Fallback to backend
    const results = await this.bridge.recall(
      query,
      options.limit ?? 10,
      options.tiers ?? ['stm', 'mtm', 'ltm']
    );

    // Update access counts
    for (const entry of results) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }

    this.updatePerformance('recall', performance.now() - startTime);
    return this.filterResults(results, options);
  }

  /**
   * Get a specific entry by ID
   */
  async get(id: string): Promise<MemoryEntry | undefined> {
    // Try cache
    const cached = this.cache.get(id);
    if (cached) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return cached;
    }

    // Backend would need a get-by-id command
    return undefined;
  }

  /**
   * Semantic search using embeddings
   */
  async semanticSearch(query: string, k = 5): Promise<SearchResult[]> {
    const startTime = performance.now();

    // Generate query embedding
    const embedding = await this.bridge.generateEmbedding(query);
    if (embedding.length === 0) {
      console.warn('[UnifiedMemory] Could not generate embedding for query');
      return [];
    }

    // Search backend
    const results = await this.bridge.semanticSearch(embedding, k);

    this.updatePerformance('search', performance.now() - startTime);
    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Promote an entry to a higher tier
   */
  async promote(id: string, targetTier: 'mtm' | 'ltm'): Promise<void> {
    // Invalidate cache
    this.cache.invalidate(id);

    // Promote in backend
    await this.bridge.promote(id, targetTier);
  }

  /**
   * Forget (delete) a memory entry
   */
  async forget(id: string): Promise<void> {
    // Remove from cache
    this.cache.remove(id);

    // Remove from backend
    await this.bridge.forget(id);
  }

  /**
   * Run cleanup (expiration, promotion, garbage collection)
   */
  async cleanup(): Promise<CleanupResult> {
    // Clean cache
    const cacheRemoved = this.cache.cleanup();

    // Clean backend
    const backendResult = await this.bridge.cleanup();

    return {
      expiredRemoved: backendResult.expiredRemoved + cacheRemoved,
      lowImportanceRemoved: backendResult.lowImportanceRemoved,
      promoted: backendResult.promoted,
      totalDuration: backendResult.totalDuration,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get memory statistics
   */
  async getStats(): Promise<MemoryStats> {
    const backendStats = (await this.bridge.getStats()) ?? {};
    const cacheStats = this.cache.getStats();

    return {
      stm: backendStats.stm ?? this.createEmptyTierStats(20),
      mtm: backendStats.mtm ?? this.createEmptyTierStats(200),
      ltm: backendStats.ltm ?? this.createEmptyTierStats(-1),
      cache: cacheStats,
      performance: this.performance,
    };
  }

  /**
   * Check if backend is connected
   */
  isBackendConnected(): boolean {
    return this.bridge.isConnected();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Store multiple entries at once
   */
  async storeBatch(
    entries: Array<{ content: string; options?: StoreOptions }>
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const { content, options } of entries) {
      const id = await this.store(content, options);
      ids.push(id);
    }
    return ids;
  }

  /**
   * Clear all memories (use with caution!)
   */
  async clearAll(): Promise<void> {
    this.cache.clear();
    // Backend clear would need to be implemented
    console.warn('[UnifiedMemory] All memories cleared');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get recent conversation context
   */
  async getConversationContext(limit = 10): Promise<MemoryEntry[]> {
    return this.recall('', {
      limit,
      tiers: ['stm', 'mtm'],
      type: 'conversation',
    });
  }

  /**
   * Store a conversation message
   */
  async storeConversation(
    content: string,
    role: 'user' | 'assistant',
    sessionId?: string
  ): Promise<string> {
    return this.store(content, {
      type: 'conversation',
      tier: 'stm',
      importance: role === 'user' ? 0.6 : 0.5,
      metadata: {
        source: role,
        sessionId,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private filterResults(entries: MemoryEntry[], options: RecallOptions): MemoryEntry[] {
    let results = entries;

    // Filter by type
    if (options.type) {
      results = results.filter(e => e.type === options.type);
    }

    // Filter by importance
    if (options.minImportance !== undefined) {
      const minImportance = options.minImportance;
      results = results.filter(e => e.importance >= minImportance);
    }

    // Filter by age
    if (options.maxAge !== undefined) {
      const cutoff = Date.now() - options.maxAge;
      results = results.filter(e => e.timestamp >= cutoff);
    }

    // Limit results
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  private updatePerformance(
    operation: 'store' | 'recall' | 'search',
    durationMs: number
  ): void {
    const key =
      `avg${operation.charAt(0).toUpperCase() + operation.slice(1)}Ms` as keyof PerformanceStats;
    const currentAvg = this.performance[key] as number;
    const total = this.performance.totalOperations;

    // Running average
    (this.performance[key] as number) = (currentAvg * total + durationMs) / (total + 1);
    this.performance.totalOperations++;
  }

  private createEmptyTierStats(maxEntries: number): TierStats {
    return {
      count: 0,
      maxEntries,
      avgImportance: 0,
      oldestEntry: 0,
      newestEntry: 0,
      sizeBytes: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Global UnifiedMemory instance
 *
 * Usage:
 * ```typescript
 * import { unifiedMemory } from '@/engines/memory';
 *
 * // Store
 * await unifiedMemory.store('Important information', { importance: 0.9 });
 *
 * // Recall
 * const memories = await unifiedMemory.recall('important', { limit: 5 });
 *
 * // Semantic search
 * const results = await unifiedMemory.semanticSearch('similar concept');
 * ```
 */
export const unifiedMemory = new UnifiedMemoryImpl();

// Type export for consumers
export type UnifiedMemory = typeof unifiedMemory;
