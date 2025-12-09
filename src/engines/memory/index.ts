/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * UnifiedMemory - Public API
 * FUSION: Moteur #5 (Mémoire) + Memory Core + Singularity Memory OS
 */

// Main engine export
export { unifiedMemory } from './UnifiedMemoryEngine';
export type { UnifiedMemory } from './UnifiedMemoryEngine';

// Types
export type {
  // Core types
  MemoryEntry,
  MemoryTier,
  MemoryType,
  MemoryMetadata,

  // Options
  StoreOptions,
  RecallOptions,

  // Results
  SearchResult,
  CleanupResult,

  // Stats
  MemoryStats,
  TierStats,
  CacheStats,
  PerformanceStats,

  // Promotion
  PromotionCriteria,
} from './types';

// Sub-components (for advanced usage)
export { MemoryCache } from './frontend/memoryCache';
export { TauriBridge } from './bridge/tauriBridge';
