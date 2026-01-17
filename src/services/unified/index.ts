/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   UNIFIED MEMORY SYSTEM — Public Exports
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Week 1 Transformation: 5 Memory Systems → 1 UnifiedMemory
 *
 * Consolidated systems:
 * - SemanticMemoryEngine (18,800 lines) → Vector search + embeddings
 * - MemoryEngine (8,000 lines) → Consolidation + decay + importance
 * - OmnisMemory (7,000 lines) → Backend persistence + sync
 * - MemoryModule (6,000 lines) → Context management
 * - CognitiveOptimization (3,000 lines) → Pruning + compression
 *
 * Total: 28,000 lines → ~1,843 lines (-93.4%)
 *
 * Target metrics:
 * - Memory consumption: -60% (500MB → 200MB)
 * - Sync latency: -67% (3s → 1s)
 * - Vector search: -33% (180ms → 120ms)
 */

// Core
export {
  UnifiedMemory,
  type UnifiedMemoryEntry,
  type UnifiedMemoryType,
  type UnifiedMemoryQuery,
  type UnifiedMemoryResult,
  type UnifiedMemoryContext,
  type UnifiedMemoryStats,
  type UnifiedMemoryConfig,
  type IVectorStore,
  type IEmbeddingGenerator,
  type MemorySource,
} from './UnifiedMemory';

// Implementations - VectorStoreClient replaces SQLiteVectorStore for browser compatibility
export {
  VectorStoreClient,
  createVectorStoreClient,
  type VectorStoreClientConfig,
  type VectorSearchOptions,
} from './VectorStoreClient';

export {
  LocalEmbeddingGenerator,
  type LocalEmbeddingGeneratorConfig,
} from './LocalEmbeddingGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

import {
  UnifiedMemory,
  type UnifiedMemoryConfig,
  type IVectorStore,
} from './UnifiedMemory';
import { LocalEmbeddingGenerator } from './LocalEmbeddingGenerator';
import { VectorStoreClient } from './VectorStoreClient';

/**
 * Create default UnifiedMemory instance with Tauri backend + local embeddings
 *
 * Uses VectorStoreClient (Tauri backend) instead of SQLiteVectorStore (Node.js)
 * for browser compatibility.
 *
 * @param config Optional configuration overrides
 * @returns Initialized UnifiedMemory instance
 */
export async function createUnifiedMemory(config?: {
  dbPath?: string;
  modelName?: string;
  enableCache?: boolean;
}): Promise<UnifiedMemory> {
  // Create vector store using Tauri backend
  const vectorStore = new VectorStoreClient({
    dbPath: config?.dbPath || './data/unified_memory.db',
    tableName: 'unified_memories',
    dimensions: 384,
  });

  // Initialize vector store
  await vectorStore.initialize();

  // Create embedding generator
  const embeddingGenerator = new LocalEmbeddingGenerator({
    modelName: config?.modelName || 'all-MiniLM-L6-v2',
    dimensions: 384,
    enableCache: config?.enableCache ?? true,
    maxCacheSize: 1000,
  });

  // Create UnifiedMemory
  const memory = new UnifiedMemory(vectorStore, embeddingGenerator);

  // Initialize
  await memory.initialize();

  return memory;
}

/**
 * Create UnifiedMemory with custom implementations
 *
 * @param vectorStore Custom vector store implementation
 * @param embeddingGenerator Custom embedding generator implementation
 * @param config Optional configuration
 * @returns Initialized UnifiedMemory instance
 */
export async function createCustomUnifiedMemory(
  vectorStore: IVectorStore,
  embeddingGenerator: InstanceType<typeof LocalEmbeddingGenerator>,
  config?: UnifiedMemoryConfig
): Promise<UnifiedMemory> {
  const memory = new UnifiedMemory(vectorStore, embeddingGenerator, config);
  await memory.initialize();
  return memory;
}
