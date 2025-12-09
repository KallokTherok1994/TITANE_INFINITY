/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MemoryCache - Fast local cache for UnifiedMemory
 */

import type { MemoryEntry, CacheStats } from '../types';

/**
 * MemoryCache - LRU cache for frequent memory access
 *
 * Features:
 * - LRU eviction policy
 * - Hit rate tracking
 * - Automatic expiration
 * - Size limits
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Store an entry in cache
   */
  store(entry: MemoryEntry): string {
    const id = entry.id || this.generateId();
    const cacheEntry: CacheEntry = {
      entry: { ...entry, id },
      cachedAt: Date.now(),
      lastAccessed: Date.now(),
    };

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(id, cacheEntry);
    return id;
  }

  /**
   * Get an entry by ID
   */
  get(id: string): MemoryEntry | undefined {
    const cacheEntry = this.cache.get(id);
    if (cacheEntry) {
      this.hits++;
      cacheEntry.lastAccessed = Date.now();
      return cacheEntry.entry;
    }
    this.misses++;
    return undefined;
  }

  /**
   * Query cache for matching entries
   */
  query(queryText: string): MemoryEntry[] {
    const results: MemoryEntry[] = [];
    const queryLower = queryText.toLowerCase();

    this.cache.forEach(cacheEntry => {
      if (cacheEntry.entry.content.toLowerCase().includes(queryLower)) {
        this.hits++;
        cacheEntry.lastAccessed = Date.now();
        results.push(cacheEntry.entry);
      }
    });

    if (results.length === 0) {
      this.misses++;
    }

    return results.slice(0, 10); // Limit results
  }

  /**
   * Check if entry exists
   */
  has(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Remove an entry
   */
  remove(id: string): boolean {
    return this.cache.delete(id);
  }

  /**
   * Invalidate an entry (marks for refresh)
   */
  invalidate(id: string): void {
    const entry = this.cache.get(id);
    if (entry) {
      entry.cachedAt = 0; // Mark as stale
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    let removed = 0;

    this.cache.forEach((entry, id) => {
      // Remove stale entries
      if (entry.cachedAt === 0) {
        this.cache.delete(id);
        removed++;
        return;
      }

      // Remove old entries
      if (now - entry.cachedAt > maxAge) {
        this.cache.delete(id);
        removed++;
      }
    });

    return removed;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get hit rate (0-1)
   */
  get hitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  /**
   * Get cache stats
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitRate,
      hits: this.hits,
      misses: this.misses,
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestId: string | undefined;
    let oldestTime = Infinity;

    this.cache.forEach((entry, id) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestId = id;
      }
    });

    if (oldestId) {
      this.cache.delete(oldestId);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

interface CacheEntry {
  entry: MemoryEntry;
  cachedAt: number;
  lastAccessed: number;
}
