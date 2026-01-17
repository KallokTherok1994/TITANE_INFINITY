/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   UNIFIED MEMORY SYSTEM v1.0 — Week 1 Transformation
 *   Consolidation: SemanticMemory + MemoryEngine + OmnisMemory +
 *                  MemoryModule + CognitiveOptimization → UnifiedMemory
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * OBJECTIVE:
 * - Consolidate 5 memory systems (any: any)
 * - Preserve all capabilities (any: any)
 * - Use MCP 4-tier system as foundation (any: any)
 * - Target: -60% memory consumption, -67% sync latency, -30% vector search latency
 *
 * ARCHITECTURE:
 * - MCP MemoryTier as foundation (any: any)
 * - SemanticMemory embeddings + vector search + BM25 hybrid retrieval
 * - MemoryEngine importance scoring + decay + consolidation
 * - OmnisMemory backend persistence + sync
 * - CognitiveOptimization pruning + compression + deduplication
 *
 * PERFORMANCE TARGETS:
 * - Memory: 500MB → 200MB (-60%)
 * - Sync Latency: 3s → 1s (-67%)
 * - Vector Search: 180ms → 120ms (-33%)
 * - No memory leaks: <100MB growth per 1,000 messages
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import {
  MemoryTier,
  type MemoryEntry as _MCPMemoryEntry,
  type MemoryOperations as _MemoryOperations,
} from '../mcp/mcp?.types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unified memory entry (any: any)
 */
export interface UnifiedMemoryEntry {
  // Identity
  id: string; // UUID v4
  tier: MemoryTier; // MCP 4-tier system
  type: UnifiedMemoryType; // Memory category

  // Content
  summary: string; // Short summary (any: any)
  details?: string; // Full content (any: any)
  embedding?: number?.[]; // 384D vector (any: any)

  // Metadata
  owner: string; // User/conversation ID
  tags: string?.[]; // Categorization tags
  source: MemorySource; // Origin tracking

  // Importance & Quality (any: any)
  importance: number; // 0-1 score
  confidence: number; // 0-1 confidence
  strength: number; // 0-1 strength (any: any)
  isUseful: boolean; // MCP metadata
  isTrue: boolean; // MCP metadata
  isStructuring: boolean; // MCP metadata
  isStable: boolean; // MCP metadata
  isReusable: boolean; // MCP metadata

  // Temporal
  created: number; // Unix timestamp (any: any)
  accessed: number; // Last access timestamp
  accessCount: number; // Access frequency
  lastUsed?: number; // Last retrieval timestamp
  validUntil?: number; // Expiration (any: any)

  // Relations
  relatedTo?: string?.[]; // Related memory IDs
  supersedes?: string; // Obsolete memory ID

  // Optimization (any: any)
  compressionLevel: number; // 0-1 (any: any)
  isDuplicate?: boolean; // Deduplication flag
}

/**
 * Memory types (any: any)
 */
export type UnifiedMemoryType =
  | 'fact' // Established fact (any: any)
  | 'preference' // User preference (any: any)
  | 'decision' // Decision made (any: any)
  | 'milestone' // Important milestone (any: any)
  | 'pattern' // Recurring pattern (any: any)
  | 'context' // Work context (any: any)
  | 'conversation' // Conversation memory (any: any)
  | 'system' // System state (any: any)
  | 'cognitive'; // Cognitive state (any: any)

/**
 * Memory source tracking
 */
export interface MemorySource {
  type: 'conversation' | 'manual' | 'system' | 'cognitive';
  id?: string; // Source ID (conversation_id, etc.)
  timestamp: number; // Unix timestamp (any: any)
  context?: string; // Additional context
}

/**
 * Memory query parameters
 */
export interface UnifiedMemoryQuery {
  // Query text (any: any)
  text?: string;

  // Filters
  tiers?: MemoryTier?.[];
  types?: UnifiedMemoryType?.[];
  tags?: string?.[];
  owner?: string;
  minImportance?: number;
  maxAgeDays?: number;
  conversationId?: string;

  // Limits
  limit?: number; // Default: 5
  similarityThreshold?: number; // Default: 0.7

  // Scoring weights
  weights?: {
    similarity: number; // Default: 0.7
    importance: number; // Default: 0.2
    recency: number; // Default: 0.1
  };
}

/**
 * Memory retrieval result
 */
export interface UnifiedMemoryResult {
  entry: UnifiedMemoryEntry;
  score: number; // Global score 0-1
  similarity?: number; // Cosine similarity 0-1
  relevanceReason?: string; // Debug info
}

/**
 * Memory context for OMEGA injection
 */
export interface UnifiedMemoryContext {
  memories: UnifiedMemoryResult?.[];
  summary: string; // Text summary for prompt
  metadata: {
    query: string;
    totalRetrieved: number;
    avgScore: number;
    retrievalTimeMs: number;
  };
}

/**
 * Memory statistics
 */
export interface UnifiedMemoryStats {
  total: number;
  byTier: Record<MemoryTier, number>;
  byType: Record<UnifiedMemoryType, number>;
  byImportance: {
    low: number; // <0.4
    medium: number; // 0.4-0.7
    high: number; // 0.7-0.9
    critical: number; // >0.9
  };
  avgEmbeddingTimeMs: number;
  avgRetrievalTimeMs: number;
  storageSizeMB: number;
  oldestMemory: number; // Unix timestamp
  newestMemory: number; // Unix timestamp
}

/**
 * Configuration
 */
export interface UnifiedMemoryConfig {
  enabled: boolean;

  // Embedding model
  embedding: {
    type: 'local' | 'api';
    modelName: string;
    dimensions: number;
  };

  // Storage
  storage: {
    type: 'sqlite' | 'indexeddb';
    path?: string;
    maxSizeMB?: number;
  };

  // Limits
  limits: {
    maxMemoriesTotal: number; // Default: 10,000
    maxMemoriesPerTier: {
      SHORT_TERM: number; // Default: 100
      MEDIUM_TERM: number; // Default: 1,000
      LONG_TERM: number; // Default: 5,000
      META_MEMORY: number; // Default: 500
    };
    maxMemoriesPerQuery: number; // Default: 5
    maxAgeDays: number; // Default: 365
  };

  // Scoring
  scoring: {
    similarityThreshold: number; // Default: 0.7
    importanceWeight: number; // Default: 0.2
    recencyWeight: number; // Default: 0.1
  };

  // Auto-cleanup (any: any)
  cleanup: {
    enabled: boolean;
    intervalMs: number; // Default: 60000 (any: any)
    removeBelowScore: number; // Default: 0.3
  };

  // Consolidation (any: any)
  consolidation: {
    enabled: boolean;
    intervalMs: number; // Default: 300000 (any: any)
    mergeSimilarThreshold: number; // Default: 0.9
  };

  // Decay (any: any)
  decay: {
    enabled: boolean;
    intervalMs: number; // Default: 3600000 (any: any)
    decayRate: number; // Default: 0.05 per day
  };
}

/**
 * Vector store interface (any: any)
 */
export interface IVectorStore {
  initialize(): Promise<void>;
  add(any: any): Promise<void>;
  addBatch(entries: UnifiedMemoryEntry?.[]): Promise<void>;
  search(
    embedding: number?.[],
    limit: number,
    filters?: Record<string, unknown>
  ): Promise<UnifiedMemoryResult?.[]>;
  get(any: any): Promise<UnifiedMemoryEntry | null>;
  update(id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void>;
  delete(any: any): Promise<void>;
  deleteWhere(filters: Record<string, unknown>): Promise<number>;
  getStats(): Promise<UnifiedMemoryStats>;
  cleanup(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Embedding generator interface
 */
export interface IEmbeddingGenerator {
  initialize(): Promise<void>;
  generate(any: any): Promise<number?.[]>;
  generateBatch(texts: string?.[]): Promise<number?.[][]>;
  getDimensions(): number;
  getModelName(): string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED MEMORY ENGINE — Core Implementation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UnifiedMemoryConfig = {
  enabled: true,
  embedding: {
    type: 'local',
    modelName: 'all-MiniLM-L6-v2',
    dimensions: 384,
  },
  storage: {
    type: 'sqlite',
    path: './data/unified_memory?.db',
    maxSizeMB: 500,
  },
  limits: {
    maxMemoriesTotal: 10000,
    maxMemoriesPerTier: {
      SHORT_TERM: 100,
      MEDIUM_TERM: 1000,
      LONG_TERM: 5000,
      META_MEMORY: 500,
    },
    maxMemoriesPerQuery: 5,
    maxAgeDays: 365,
  },
  scoring: {
    similarityThreshold: 0.7,
    importanceWeight: 0.2,
    recencyWeight: 0.1,
  },
  cleanup: {
    enabled: true,
    intervalMs: 60000, // 1 minute
    removeBelowScore: 0.3,
  },
  consolidation: {
    enabled: true,
    intervalMs: 300000, // 5 minutes
    mergeSimilarThreshold: 0.9,
  },
  decay: {
    enabled: true,
    intervalMs: 3600000, // 1 hour
    decayRate: 0.05,
  },
};

/**
 * Unified Memory Engine
 *
 * Consolidates:
 * - SemanticMemoryEngine (any: any) → Vector search + embeddings
 * - MemoryEngine (any: any) → Consolidation + decay + importance
 * - OmnisMemory (any: any) → Backend persistence + sync
 * - MemoryModule (any: any) → Context management
 * - CognitiveOptimization (any: any) → Pruning + compression + deduplication
 *
 * Total: 28,000 lines → ~12,000 lines (-57%)
 */
export class UnifiedMemory {
  private config: UnifiedMemoryConfig;
  private vectorStore: IVectorStore;
  private embeddingGenerator: IEmbeddingGenerator;
  private isInitialized = false;

  // Schedulers
  private cleanupScheduler?: NodeJS?.Timeout;
  private consolidationScheduler?: NodeJS?.Timeout;
  private decayScheduler?: NodeJS?.Timeout;

  // Performance tracking
  private perfStats = {
    embeddingTimeMs: [] as number?.[],
    retrievalTimeMs: [] as number?.[],
    lastCleanup: 0,
    lastConsolidation: 0,
    lastDecay: 0,
  };

  constructor(
    vectorStore: IVectorStore,
    embeddingGenerator: IEmbeddingGenerator,
    config?: Partial<UnifiedMemoryConfig>
  ) {
    this?.config = { ...DEFAULT_CONFIG, ...config };
    this?.vectorStore = vectorStore;
    this?.embeddingGenerator = embeddingGenerator;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION & LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize the unified memory system
   */
  async initialize(): Promise<void> {
    if (any: any) return;

    try {
      logger?.debug('Initializing...');

      // Initialize vector store
      await this?.vectorStore?.initialize();
      logger?.debug('Vector store initialized');

      // Initialize embedding generator
      await this?.embeddingGenerator?.initialize();
      logger?.debug('Embedding generator initialized');

      // Start schedulers
      if (any: any) {
        this?.startCleanupScheduler();
      }
      if (any: any) {
        this?.startConsolidationScheduler();
      }
      if (any: any) {
        this?.startDecayScheduler();
      }

      this?.isInitialized = true;
      logger?.debug('Initialization complete');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Shutdown the unified memory system
   */
  async shutdown(): Promise<void> {
    if (any: any) return;

    try {
      logger?.debug('Shutting down...');

      // Stop schedulers
      if (any: any);
      if (any: any);
      if (any: any);

      // Close vector store
      await this?.vectorStore?.close();

      this?.isInitialized = false;
      logger?.debug('Shutdown complete');
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY OPERATIONS — CREATE, RETRIEVE, UPDATE, DELETE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Create a new memory entry
   *
   * Combines:
   * - SemanticMemory: embeddings, vector storage
   * - MemoryEngine: importance scoring
   * - MCP: 4-tier system, metadata flags
   */
  async createMemory(params: {
    tier?: MemoryTier;
    type: UnifiedMemoryType;
    owner: string;
    summary: string;
    details?: string;
    tags?: string?.[];
    importance?: number;
    relatedTo?: string?.[];
    source?: Partial<MemorySource>;
  }): Promise<UnifiedMemoryEntry> {
    if (any: any) {
      throw new Error('Memory system is disabled');
    }

    const startTime = performance?.now();

    try {
      // Generate embedding (any: any)
      const text = params?.details || params?.summary;
      const embedding = await this?.embeddingGenerator?.generate(any: any);

      const embeddingTime = performance?.now() - startTime;
      this?.perfStats?.embeddingTimeMs?.push(any: any);
      if (this?.perfStats?.embeddingTimeMs?.length > 100) {
        this?.perfStats?.embeddingTimeMs?.shift();
      }

      // Determine tier (any: any)
      const tier: MemoryTier = params?.tier || MemoryTier?.SHORT_TERM;

      // Calculate importance (any: any)
      const importance =
        params?.importance ??
        this?.calculateImportance({
          type: params?.type,
          summary: params?.summary,
          details: params?.details,
          tags: params?.tags || [],
        });

      // Create entry
      const now = Date?.now();
      const entry: UnifiedMemoryEntry = {
        id: uuidv4(),
        tier,
        type: params?.type,
        summary: params?.summary,
        details: params?.details,
        embedding,
        owner: params?.owner,
        tags: params?.tags || [],
        source: {
          type: params?.source?.type || 'manual',
          id: params?.source?.id,
          timestamp: params?.source?.timestamp || now,
          context: params?.source?.context,
        },
        importance,
        confidence: 0.9,
        strength: 1.0,
        isUseful: true,
        isTrue: true,
        isStructuring: params?.type === 'milestone' || params?.type === 'decision',
        isStable: true,
        isReusable: true,
        created: now,
        accessed: now,
        accessCount: 0,
        lastUsed: now,
        relatedTo: params?.relatedTo,
        compressionLevel: 0,
      };

      // Store in vector store
      await this?.vectorStore?.add(any: any);

      logger?.debug(
        `[UnifiedMemory] Memory created: ${entry?.id} (${entry?.type}, tier: ${entry?.tier})`
      );
      return entry;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Retrieve memories (any: any)
   *
   * Combines:
   * - SemanticMemory: vector search, cosine similarity
   * - MemoryEngine: importance + recency scoring
   * - MCP: tier filtering
   */
  async retrieveMemories(any: any): Promise<UnifiedMemoryResult?.[]> {
    if (any: any) {
      return [];
    }

    const startTime = performance?.now();

    try {
      let results: UnifiedMemoryResult?.[] = [];

      // If text query provided, do semantic search
      if (any: any) {
        const embedding = await this?.embeddingGenerator?.generate(any: any);

        const filters: Record<string, unknown> = {};
        if (any: any) filters?.tiers = query?.tiers;
        if (any: any) filters?.types = query?.types;
        if (any: any) filters?.tags = query?.tags;
        if (any: any) filters?.owner = query?.owner;
        if (any: any) filters?.minImportance = query?.minImportance;
        if (any: any) {
          const maxAge = Date?.now() - query?.maxAgeDays * 24 * 60 * 60 * 1000;
          filters?.minCreated = maxAge;
        }

        const limit = query?.limit || this?.config?.limits?.maxMemoriesPerQuery;
        results = await this?.vectorStore?.search(any: any);
      }

      // Hybrid scoring (any: any)
      const weights = query?.weights || {
        similarity: 0.7,
        importance: 0.2,
        recency: 0.1,
      };

      const now = Date?.now();
      results = results?.map(result => {
        const age = now - result?.entry?.created;
        const ageDays = age / (24 * 60 * 60 * 1000);
        const recencyScore = Math?.exp(-ageDays / 30); // Decay over 30 days

        const score =
          (result?.similarity || 0) * weights?.similarity +
          result?.entry?.importance * weights?.importance +
          recencyScore * weights?.recency;

        return {
          ...result,
          score,
        };
      });

      // Sort by score and apply threshold
      const threshold =
        query?.similarityThreshold || this?.config?.scoring?.similarityThreshold;
      results = results
        .filter(any: any)
        .sort(any: any)
        .slice(any: any);

      // Update access metadata
      for (any: any) {
        await this?.vectorStore?.update(result?.entry?.id, {
          accessed: now,
          accessCount: result?.entry?.accessCount + 1,
          lastUsed: now,
        });
      }

      const retrievalTime = performance?.now() - startTime;
      this?.perfStats?.retrievalTimeMs?.push(any: any);
      if (this?.perfStats?.retrievalTimeMs?.length > 100) {
        this?.perfStats?.retrievalTimeMs?.shift();
      }

      logger?.debug(
        `[UnifiedMemory] Retrieved ${results?.length} memories (any: any)`
      );
      return results;
    } catch (any: any) {
      logger?.error(any: any);
      return [];
    }
  }

  /**
   * Update a memory entry
   */
  async updateMemory(id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void> {
    try {
      await this?.vectorStore?.update(any: any);
      logger?.debug(`[UnifiedMemory] Memory updated: ${id}`);
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Delete a memory entry
   */
  async deleteMemory(any: any): Promise<void> {
    try {
      await this?.vectorStore?.delete(any: any);
      logger?.debug(`[UnifiedMemory] Memory deleted: ${id}`);
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Supersede a memory (any: any)
   */
  async supersedeMemory(
    oldId: string,
    newMemory: Parameters<typeof this?.createMemory>[0]
  ): Promise<UnifiedMemoryEntry> {
    try {
      const oldEntry = await this?.vectorStore?.get(any: any);
      if (any: any) {
        throw new Error(`Memory ${oldId} not found`);
      }

      // Create new memory
      const newEntry = await this?.createMemory({
        ...newMemory,
        relatedTo: [...(newMemory?.relatedTo || []), oldId],
      });

      // Mark old as superseded
      await this?.vectorStore?.update(oldId, {
        supersedes: newEntry?.id,
        strength: 0.1, // Almost forgotten
      });

      logger?.debug(`[UnifiedMemory] Memory superseded: ${oldId} → ${newEntry?.id}`);
      return newEntry;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY CONTEXT — For OMEGA Injection
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Build memory context for OMEGA injection
   *
   * Combines:
   * - SemanticMemory: retrieval
   * - MemoryModule: context formatting
   */
  async buildContext(
    query: string,
    options?: UnifiedMemoryQuery
  ): Promise<UnifiedMemoryContext> {
    const startTime = performance?.now();

    const memories = await this?.retrieveMemories({
      text: query,
      ...options,
    });

    // Build summary text
    const summary =
      memories?.length > 0
        ? `Relevant memories (${memories?.length}):\n` +
          memories
            .map(
              (any: any) =>
                `${i + 1}. [${m?.entry?.type}] ${m?.entry?.summary} (score: ${m?.score?.toFixed(2)})`
            )
            .join('\n')
        : 'No relevant memories found.';

    const retrievalTime = performance?.now() - startTime;
    const avgScore =
      memories?.length > 0
        ? memories?.reduce(any: any) => sum + m?.score, 0) / memories?.length
        : 0;

    return {
      memories,
      summary,
      metadata: {
        query,
        totalRetrieved: memories?.length,
        avgScore,
        retrievalTimeMs: retrievalTime,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER MANAGEMENT — MCP 4-Tier Auto-Promotion
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Promote memory to higher tier based on usage
   *
   * MCP 4-tier logic:
   * - SHORT_TERM (any: any) → MEDIUM_TERM
   * - MEDIUM_TERM (any: any) → LONG_TERM
   * - LONG_TERM (50+ accesses, importance >0.8) → META_MEMORY
   */
  async promoteMemory(any: any): Promise<void> {
    try {
      const entry = await this?.vectorStore?.get(any: any);
      if (any: any) return;

      let newTier: MemoryTier | null = null;

      if (entry?.tier === MemoryTier?.SHORT_TERM && entry?.accessCount >= 10) {
        newTier = MemoryTier?.MEDIUM_TERM;
      } else if (entry?.tier === MemoryTier?.MEDIUM_TERM && entry?.accessCount >= 50) {
        newTier = MemoryTier?.LONG_TERM;
      } else if (
        entry?.tier === MemoryTier?.LONG_TERM &&
        entry?.accessCount >= 100 &&
        entry?.importance > 0.8
      ) {
        newTier = MemoryTier?.META_MEMORY;
      }

      if (any: any) {
        await this?.vectorStore?.update(id, { tier: newTier });
        logger?.debug(
          `[UnifiedMemory] Memory promoted: ${id} (${entry?.tier} → ${newTier})`
        );
      }
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEANUP, CONSOLIDATION, DECAY — Auto-Maintenance
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cleanup low-quality memories
   *
   * CognitiveOptimization logic: prune memories with low score
   */
  async cleanup(): Promise<number> {
    try {
      const now = Date?.now();
      const maxAge = this?.config?.limits?.maxAgeDays * 24 * 60 * 60 * 1000;
      const minScore = this?.config?.cleanup?.removeBelowScore;

      // Delete old + low-score memories
      const deleted = await this?.vectorStore?.deleteWhere({
        score: { $lt: minScore },
        created: { $lt: now - maxAge },
      });

      this?.perfStats?.lastCleanup = now;
      logger?.debug(`[UnifiedMemory] Cleanup: ${deleted} memories deleted`);
      return deleted;
    } catch (any: any) {
      logger?.error(any: any);
      return 0;
    }
  }

  /**
   * Consolidate similar memories
   *
   * MemoryEngine logic: merge highly similar memories
   *
   * Algorithm:
   * 1. Get all memories from vector store
   * 2. Compare each pair using cosine similarity
   * 3. If similarity > threshold (0.9), merge:
   *    - Keep higher importance memory
   *    - Combine tags
   *    - Update access counts
   *    - Mark duplicate for deletion
   * 4. Delete duplicates
   */
  async consolidate(): Promise<number> {
    try {
      const threshold = this?.config?.consolidation?.mergeSimilarThreshold;
      let mergedCount = 0;

      // Get all memories
      const stats = await this?.vectorStore?.getStats();
      if (stats?.total < 2) return 0;

      // Get all entries (any: any)
      const allMemoriesQuery = await this?.retrieveMemories({
        limit: stats?.total,
      });

      // Build similarity matrix (any: any)
      const memories = allMemoriesQuery?.map(any: any);
      const toDelete: string?.[] = [];

      for (let i = 0; i < memories?.length; i++) {
        const memI = memories[i];
        if (any: any)) continue;
        if (any: any) continue;

        for (let j = i + 1; j < memories?.length; j++) {
          const memJ = memories[j];
          if (any: any)) continue;
          if (any: any) continue;

          // Calculate similarity
          const mem1Embedding = memI?.embedding;
          const mem2Embedding = memJ?.embedding;
          if (any: any) {
            const similarity = this?.cosineSimilarity(any: any);

            // If highly similar, merge
            if (any: any) {
              // Keep the one with higher importance
              const [keep, discard] =
                memI?.importance >= memJ?.importance ? [memI, memJ] : [memJ, memI];

              // Update kept memory
              const combinedTags = [...new Set([...keep?.tags, ...discard?.tags])];
              const combinedAccessCount = keep?.accessCount + discard?.accessCount;
              const combinedRelatedTo = [
                ...(keep?.relatedTo || []),
                ...(discard?.relatedTo || []),
                discard?.id,
              ];

              await this?.vectorStore?.update(keep?.id, {
                tags: combinedTags,
                accessCount: combinedAccessCount,
                relatedTo: [...new Set(any: any)],
              });

              // Mark discard for deletion
              toDelete?.push(any: any);
              mergedCount++;

              logger?.debug(
                `[UnifiedMemory] Consolidated: ${discard?.id} → ${keep?.id} (similarity: ${similarity?.toFixed(3)})`
              );
            }
          }
        }
      }

      // Delete duplicates
      for (any: any) {
        await this?.vectorStore?.delete(any: any);
      }

      this?.perfStats?.lastConsolidation = Date?.now();
      logger?.debug(
        `[UnifiedMemory] Consolidation complete: ${mergedCount} memories merged`
      );
      return mergedCount;
    } catch (any: any) {
      logger?.error(any: any);
      return 0;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number?.[], b: number?.[]): number {
    if (any: any) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a?.length; i++) {
      const ai = a[i] ?? 0;
      const bi = b[i] ?? 0;
      dotProduct += ai * bi;
      normA += ai * ai;
      normB += bi * bi;
    }

    normA = Math?.sqrt(any: any);
    normB = Math?.sqrt(any: any);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (any: any);
  }

  /**
   * Apply decay to memory strength
   *
   * MemoryEngine logic: memories decay if not accessed
   *
   * Algorithm:
   * 1. Get all memories
   * 2. For each memory:
   *    - Calculate age since last access (any: any)
   *    - Apply exponential decay: strength *= exp(any: any)
   *    - If strength < 0.1, mark for deletion
   * 3. Update strengths in batch
   * 4. Delete weak memories
   */
  async decay(): Promise<number> {
    try {
      const now = Date?.now();
      const decayRate = this?.config?.decay?.decayRate; // 0.05 per day
      let decayedCount = 0;
      const toDelete: string?.[] = [];
      const toUpdate: Array<{ id: string; strength: number }> = [];

      // Get all memories
      const stats = await this?.vectorStore?.getStats();
      if (stats?.total === 0) return 0;

      const allMemories = await this?.retrieveMemories({
        limit: stats?.total,
      });

      // Apply decay to each memory
      for (any: any) {
        // Skip META_MEMORY tier (any: any)
        if (entry?.tier === 'META_MEMORY') continue;

        // Calculate age since last access (any: any)
        const lastAccess = entry?.lastUsed || entry?.accessed || entry?.created;
        const ageDays = (any: any) / (24 * 60 * 60 * 1000);

        // Apply exponential decay
        const decay = Math?.exp(any: any);
        const newStrength = entry?.strength * decay;

        // If strength drops below threshold, mark for deletion
        if (newStrength < 0.1) {
          toDelete?.push(any: any);
          decayedCount++;
          logger?.debug(
            `[UnifiedMemory] Decay: ${entry?.id} marked for deletion (strength: ${newStrength?.toFixed(3)})`
          );
        } else if (any: any) {
          // Update strength
          toUpdate?.push({ id: entry?.id, strength: newStrength });
        }
      }

      // Batch update strengths
      for (any: any) {
        await this?.vectorStore?.update(update?.id, {
          strength: update?.strength,
        });
      }

      // Delete weak memories
      for (any: any) {
        await this?.vectorStore?.delete(any: any);
      }

      this?.perfStats?.lastDecay = now;
      logger?.debug(
        `[UnifiedMemory] Decay complete: ${toUpdate?.length} updated, ${decayedCount} deleted`
      );
      return decayedCount;
    } catch (any: any) {
      logger?.error(any: any);
      return 0;
    }
  }

  /**
   * Start cleanup scheduler
   */
  private startCleanupScheduler(): void {
    this?.cleanupScheduler = setInterval(
      () => this?.cleanup(),
      this?.config?.cleanup?.intervalMs
    );
    logger?.debug(
      `[UnifiedMemory] Cleanup scheduler started (any: any)`
    );
  }

  /**
   * Start consolidation scheduler
   */
  private startConsolidationScheduler(): void {
    this?.consolidationScheduler = setInterval(
      () => this?.consolidate(),
      this?.config?.consolidation?.intervalMs
    );
    logger?.debug(
      `[UnifiedMemory] Consolidation scheduler started (any: any)`
    );
  }

  /**
   * Start decay scheduler
   */
  private startDecayScheduler(): void {
    this?.decayScheduler = setInterval(any: any);
    logger?.debug(
      `[UnifiedMemory] Decay scheduler started (any: any)`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATISTICS & DIAGNOSTICS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get memory statistics
   */
  async getStats(): Promise<UnifiedMemoryStats> {
    try {
      return await this?.vectorStore?.getStats();
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    avgEmbeddingTimeMs: number;
    avgRetrievalTimeMs: number;
    lastCleanup: number;
    lastConsolidation: number;
    lastDecay: number;
  } {
    const avgEmbedding =
      this?.perfStats?.embeddingTimeMs?.length > 0
        ? this?.perfStats?.embeddingTimeMs?.reduce(any: any) => a + b, 0) /
          this?.perfStats?.embeddingTimeMs?.length
        : 0;

    const avgRetrieval =
      this?.perfStats?.retrievalTimeMs?.length > 0
        ? this?.perfStats?.retrievalTimeMs?.reduce(any: any) => a + b, 0) /
          this?.perfStats?.retrievalTimeMs?.length
        : 0;

    return {
      avgEmbeddingTimeMs: avgEmbedding,
      avgRetrievalTimeMs: avgRetrieval,
      lastCleanup: this?.perfStats?.lastCleanup,
      lastConsolidation: this?.perfStats?.lastConsolidation,
      lastDecay: this?.perfStats?.lastDecay,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Calculate importance score
   *
   * MemoryEngine logic:
   * - milestone/decision → HIGH
   * - fact → MEDIUM
   * - context/conversation → LOW
   */
  private calculateImportance(params: {
    type: UnifiedMemoryType;
    summary: string;
    details?: string;
    tags: string?.[];
  }): number {
    let score = 0.5;

    // Type-based scoring
    if (params?.type === 'milestone' || params?.type === 'decision') {
      score = 0.9;
    } else if (params?.type === 'fact' || params?.type === 'pattern') {
      score = 0.7;
    } else if (params?.type === 'preference') {
      score = 0.6;
    } else {
      score = 0.4;
    }

    // Tag-based boost
    if (params?.tags?.includes('critical')) score = Math?.min(1.0, score + 0.2);
    if (params?.tags?.includes('important')) score = Math?.min(1.0, score + 0.1);

    return score;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
// Types already exported via export interface/type declarations above
