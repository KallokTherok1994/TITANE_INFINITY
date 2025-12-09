/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * UnifiedMemory Types - Fusion Moteur #5 + Memory Core + Singularity Memory OS
 */

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY TIERS
// ═══════════════════════════════════════════════════════════════════════════

export type MemoryTier = 'stm' | 'mtm' | 'ltm';

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  tier: MemoryTier;
  importance: number;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  metadata: MemoryMetadata;
  embedding?: number[];
}

export type MemoryType =
  | 'conversation'
  | 'knowledge'
  | 'preference'
  | 'context'
  | 'emotion'
  | 'behavior'
  | 'system';

export interface MemoryMetadata {
  source?: string;
  sessionId?: string;
  userId?: string;
  tags?: string[];
  relations?: string[];
  expiresAt?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STORE OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface StoreOptions {
  /** Target tier (default: stm) */
  tier?: MemoryTier;

  /** Importance score 0-1 (default: 0.5) */
  importance?: number;

  /** Memory type */
  type?: MemoryType;

  /** Additional metadata */
  metadata?: Partial<MemoryMetadata>;

  /** Generate embedding for semantic search */
  generateEmbedding?: boolean;

  /** Skip cache (write directly to backend) */
  skipCache?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// RECALL OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface RecallOptions {
  /** Maximum results */
  limit?: number;

  /** Tiers to search */
  tiers?: MemoryTier[];

  /** Filter by type */
  type?: MemoryType;

  /** Minimum importance */
  minImportance?: number;

  /** Maximum age in milliseconds */
  maxAge?: number;

  /** Force backend query (skip cache) */
  forceBackend?: boolean;

  /** Use semantic search instead of text match */
  semantic?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH RESULTS
// ═══════════════════════════════════════════════════════════════════════════

export interface SearchResult {
  entry: MemoryEntry;
  score: number;
  matchType: 'exact' | 'partial' | 'semantic';
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMORY STATS
// ═══════════════════════════════════════════════════════════════════════════

export interface MemoryStats {
  stm: TierStats;
  mtm: TierStats;
  ltm: TierStats;
  cache: CacheStats;
  performance: PerformanceStats;
}

export interface TierStats {
  count: number;
  maxEntries: number;
  avgImportance: number;
  oldestEntry: number;
  newestEntry: number;
  sizeBytes: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  hits: number;
  misses: number;
}

export interface PerformanceStats {
  avgStoreMs: number;
  avgRecallMs: number;
  avgSearchMs: number;
  totalOperations: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP & MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════

export interface CleanupResult {
  expiredRemoved: number;
  lowImportanceRemoved: number;
  promoted: number;
  totalDuration: number;
}

export interface PromotionCriteria {
  minAccessCount: number;
  minImportance: number;
  minAge: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// BACKEND COMMANDS (Tauri IPC)
// ═══════════════════════════════════════════════════════════════════════════

export interface BackendStoreCommand {
  entry: MemoryEntry;
  tier: MemoryTier;
}

export interface BackendRecallCommand {
  query: string;
  limit: number;
  tiers: MemoryTier[];
}

export interface BackendSearchCommand {
  embedding: number[];
  k: number;
}

export interface BackendPromoteCommand {
  id: string;
  targetTier: MemoryTier;
}
