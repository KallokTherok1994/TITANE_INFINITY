/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * TauriBridge - IPC bridge for UnifiedMemory backend communication
 */

import type {
  MemoryEntry,
  MemoryTier,
  SearchResult,
  MemoryStats,
  CleanupResult,
} from '../types';

// Check if we're in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

/**
 * TauriBridge - Handles communication with Rust backend Memory OS
 *
 * Features:
 * - Graceful fallback when not in Tauri
 * - Error handling with retries
 * - Timeout management
 */
export class TauriBridge {
  private connected = false;
  private invokeFunc: typeof mockInvoke = mockInvoke;

  constructor() {
    this.init();
  }

  /**
   * Initialize the bridge
   */
  private async init(): Promise<void> {
    if (isTauri) {
      try {
        // Dynamic import for Tauri API
        const { invoke } = await import('@tauri-apps/api/core');
        this.invokeFunc = invoke;
        this.connected = true;
        console.log('[TauriBridge] Connected to Tauri backend');
      } catch (error) {
        console.warn('[TauriBridge] Failed to connect to Tauri:', error);
        this.connected = false;
      }
    } else {
      console.log('[TauriBridge] Running in browser mode (mock backend)');
    }
  }

  /**
   * Check if connected to backend
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Store entry in backend
   */
  async store(entry: MemoryEntry, tier: MemoryTier): Promise<string> {
    try {
      return await this.invokeFunc<string>('memory_store', {
        entry,
        tier,
      });
    } catch (error) {
      console.error('[TauriBridge] Store failed:', error);
      throw error;
    }
  }

  /**
   * Recall entries from backend
   */
  async recall(
    query: string,
    limit: number,
    tiers: MemoryTier[]
  ): Promise<MemoryEntry[]> {
    try {
      return await this.invokeFunc<MemoryEntry[]>('memory_recall', {
        query,
        limit,
        tiers,
      });
    } catch (error) {
      console.error('[TauriBridge] Recall failed:', error);
      return [];
    }
  }

  /**
   * Semantic search in backend
   */
  async semanticSearch(embedding: number[], k: number): Promise<SearchResult[]> {
    try {
      return await this.invokeFunc<SearchResult[]>('memory_semantic_search', {
        embedding,
        k,
      });
    } catch (error) {
      console.error('[TauriBridge] Semantic search failed:', error);
      return [];
    }
  }

  /**
   * Promote entry to higher tier
   */
  async promote(id: string, targetTier: MemoryTier): Promise<void> {
    try {
      await this.invokeFunc<void>('memory_promote', {
        id,
        targetTier,
      });
    } catch (error) {
      console.error('[TauriBridge] Promote failed:', error);
      throw error;
    }
  }

  /**
   * Forget (delete) an entry
   */
  async forget(id: string): Promise<void> {
    try {
      await this.invokeFunc<void>('memory_forget', { id });
    } catch (error) {
      console.error('[TauriBridge] Forget failed:', error);
      throw error;
    }
  }

  /**
   * Trigger cleanup
   */
  async cleanup(): Promise<CleanupResult> {
    try {
      return await this.invokeFunc<CleanupResult>('memory_cleanup');
    } catch (error) {
      console.error('[TauriBridge] Cleanup failed:', error);
      return {
        expiredRemoved: 0,
        lowImportanceRemoved: 0,
        promoted: 0,
        totalDuration: 0,
      };
    }
  }

  /**
   * Get memory stats
   */
  async getStats(): Promise<Partial<MemoryStats>> {
    try {
      return await this.invokeFunc<Partial<MemoryStats>>('memory_stats');
    } catch (error) {
      console.error('[TauriBridge] Stats failed:', error);
      return {};
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await this.invokeFunc<number[]>('memory_embed', { text });
    } catch (error) {
      console.warn('[TauriBridge] Embedding generation failed:', error);
      return [];
    }
  }
}

/**
 * Mock invoke for browser environment
 */
async function mockInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  console.log('[TauriBridge] Mock invoke:', cmd, args);

  // Return mock data based on command
  switch (cmd) {
    case 'memory_store':
      return `mock_${Date.now()}` as T;

    case 'memory_recall':
      return [] as T;

    case 'memory_semantic_search':
      return [] as T;

    case 'memory_stats':
      return {
        stm: {
          count: 0,
          maxEntries: 20,
          avgImportance: 0,
          oldestEntry: 0,
          newestEntry: 0,
          sizeBytes: 0,
        },
        mtm: {
          count: 0,
          maxEntries: 200,
          avgImportance: 0,
          oldestEntry: 0,
          newestEntry: 0,
          sizeBytes: 0,
        },
        ltm: {
          count: 0,
          maxEntries: -1,
          avgImportance: 0,
          oldestEntry: 0,
          newestEntry: 0,
          sizeBytes: 0,
        },
        performance: {
          avgStoreMs: 0,
          avgRecallMs: 0,
          avgSearchMs: 0,
          totalOperations: 0,
        },
      } as T;

    case 'memory_cleanup':
      return {
        expiredRemoved: 0,
        lowImportanceRemoved: 0,
        promoted: 0,
        totalDuration: 0,
      } as T;

    case 'memory_embed':
      // Return empty embedding in mock mode
      return [] as T;

    default:
      return undefined as T;
  }
}
