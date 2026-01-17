/**
 * TITANE∞ v24.2.1 — LRU Cache Implementation
 * Efficient bounded cache with automatic eviction
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 */

export interface LRUCacheOptions {
  /** Maximum number of entries in the cache */
  maxSize: number;
  /** Optional TTL in milliseconds for entries */
  ttlMs?: number;
  /** Callback when an entry is evicted */
  onEvict?: (key: string, value: unknown) => void;
}

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

/**
 * LRU (Least Recently Used) Cache with bounded size and optional TTL
 *
 * @example
 * ```ts
 * const cache = new LRUCache<string>({ maxSize: 100, ttlMs: 60000 });
 * cache.set('key', 'value');
 * const value = cache.get('key'); // 'value'
 * ```
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttlMs: number | null;
  private readonly onEvict: ((key: string, value: unknown) => void) | null;

  constructor(options: LRUCacheOptions) {
    this.maxSize = options.maxSize;
    this.ttlMs = options.ttlMs ?? null;
    this.onEvict = options.onEvict ?? null;
    this.cache = new Map();
  }

  /**
   * Get a value from the cache
   * Returns undefined if key doesn't exist or is expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check TTL
    if (this.ttlMs !== null && Date.now() - entry.createdAt > this.ttlMs) {
      this.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set a value in the cache
   * Evicts least recently used entry if at capacity
   */
  set(key: string, value: T): void {
    // If key exists, delete it first (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict if at capacity
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        const evicted = this.cache.get(firstKey);
        this.cache.delete(firstKey);
        if (this.onEvict && evicted) {
          this.onEvict(firstKey, evicted.value);
        }
      }
    }

    // Add new entry
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
    });
  }

  /**
   * Check if key exists (and is not expired)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check TTL
    if (this.ttlMs !== null && Date.now() - entry.createdAt > this.ttlMs) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry && this.onEvict) {
      this.onEvict(key, entry.value);
    }
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache) {
        this.onEvict(key, entry.value);
      }
    }
    this.cache.clear();
  }

  /**
   * Get current size of the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache (ordered by recency)
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values in the cache (ordered by recency)
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  /**
   * Iterate over all entries (for compatibility with Map-like usage)
   */
  *entries(): IterableIterator<[string, T]> {
    for (const [key, entry] of this.cache) {
      yield [key, entry.value];
    }
  }

  /**
   * Make cache iterable with for...of
   */
  [Symbol.iterator](): IterableIterator<[string, T]> {
    return this.entries();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; utilizationPercent: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationPercent: Math.round((this.cache.size / this.maxSize) * 100),
    };
  }

  /**
   * Prune expired entries (useful for periodic cleanup)
   */
  prune(): number {
    if (this.ttlMs === null) {
      return 0;
    }

    let pruned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache) {
      if (now - entry.createdAt > this.ttlMs) {
        this.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

/**
 * Create a simple memory-bounded cache for function memoization
 *
 * @example
 * ```ts
 * const memoizedFn = createMemoizedFunction(
 *   (a: number, b: number) => expensiveComputation(a, b),
 *   { maxSize: 50 }
 * );
 * ```
 */
export function createMemoizedFunction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  options: { maxSize: number; keyFn?: (...args: TArgs) => string }
): (...args: TArgs) => TResult {
  const cache = new LRUCache<TResult>({ maxSize: options.maxSize });
  const keyFn = options.keyFn ?? ((...args) => JSON.stringify(args));

  return (...args: TArgs): TResult => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Global caches registry for monitoring and cleanup
 */
class CacheRegistry {
  private caches: Map<string, LRUCache<unknown>> = new Map();

  register<T>(name: string, cache: LRUCache<T>): void {
    this.caches.set(name, cache as LRUCache<unknown>);
  }

  unregister(name: string): void {
    this.caches.delete(name);
  }

  getStats(): Record<
    string,
    { size: number; maxSize: number; utilizationPercent: number }
  > {
    const stats: Record<
      string,
      { size: number; maxSize: number; utilizationPercent: number }
    > = {};

    for (const [name, cache] of this.caches) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  pruneAll(): number {
    let totalPruned = 0;

    for (const cache of this.caches.values()) {
      totalPruned += cache.prune();
    }

    return totalPruned;
  }

  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }
}

export const cacheRegistry = new CacheRegistry();
