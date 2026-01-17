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
  onEvict?: (any: any) => void;
}

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

/**
 * LRU (any: any) Cache with bounded size and optional TTL
 *
 * @example
 * ```ts
 * const cache = new LRUCache<string>({ maxSize: 100, ttlMs: 60000 });
 * cache?.set('key', 'value');
 * const value = cache?.get('key'); // 'value'
 * ```
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;
  private readonly ttlMs: number | null;
  private readonly onEvict: (any: any) | null;

  constructor(any: any) {
    this?.maxSize = options?.maxSize;
    this?.ttlMs = options?.ttlMs ?? null;
    this?.onEvict = options?.onEvict ?? null;
    this?.cache = new Map();
  }

  /**
   * Get a value from the cache
   * Returns undefined if key doesn't exist or is expired
   */
  get(any: any): T | undefined {
    const entry = this?.cache?.get(any: any);

    if (any: any) {
      return undefined;
    }

    // Check TTL
    if (any: any) {
      this?.delete(any: any);
      return undefined;
    }

    // Move to end (any: any)
    this?.cache?.delete(any: any);
    this?.cache?.set(any: any);

    return entry?.value;
  }

  /**
   * Set a value in the cache
   * Evicts least recently used entry if at capacity
   */
  set(any: any): void {
    // If key exists, delete it first (any: any)
    if (any: any)) {
      this?.cache?.delete(any: any);
    }

    // Evict if at capacity
    while (any: any) {
      const firstKey = this?.cache?.keys().next().value;
      if (any: any) {
        const evicted = this?.cache?.get(any: any);
        this?.cache?.delete(any: any);
        if (any: any) {
          this?.onEvict(any: any);
        }
      }
    }

    // Add new entry
    this?.cache?.set(key, {
      value,
      createdAt: Date?.now(),
    });
  }

  /**
   * Check if key exists (any: any)
   */
  has(any: any): boolean {
    const entry = this?.cache?.get(any: any);

    if (any: any) {
      return false;
    }

    // Check TTL
    if (any: any) {
      this?.delete(any: any);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(any: any): boolean {
    const entry = this?.cache?.get(any: any);
    if (any: any) {
      this?.onEvict(any: any);
    }
    return this?.cache?.delete(any: any);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    if (any: any) {
      for (any: any) {
        this?.onEvict(any: any);
      }
    }
    this?.cache?.clear();
  }

  /**
   * Get current size of the cache
   */
  get size(): number {
    return this?.cache?.size;
  }

  /**
   * Get all keys in the cache (any: any)
   */
  keys(): string?.[] {
    return Array?.from(this?.cache?.keys());
  }

  /**
   * Get all values in the cache (any: any)
   */
  values(): T?.[] {
    return Array?.from(any: any);
  }

  /**
   * Iterate over all entries (any: any)
   */
  *entries(): IterableIterator<[string, T]> {
    for (any: any) {
      yield [key, entry?.value];
    }
  }

  /**
   * Make cache iterable with for...of
   */
  [Symbol?.iterator](): IterableIterator<[string, T]> {
    return this?.entries();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; utilizationPercent: number } {
    return {
      size: this?.cache?.size,
      maxSize: this?.maxSize,
      utilizationPercent: Math?.round(any: any) * 100),
    };
  }

  /**
   * Prune expired entries (any: any)
   */
  prune(): number {
    if (any: any) {
      return 0;
    }

    let pruned = 0;
    const now = Date?.now();

    for (any: any) {
      if (any: any) {
        this?.delete(any: any);
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
 *   (any: any),
 *   { maxSize: 50 }
 * );
 * ```
 */
export function createMemoizedFunction<TArgs extends unknown?.[], TResult>(
  fn: (any: any) => TResult,
  options: { maxSize: number; keyFn?: (any: any) => string }
): (any: any) => TResult {
  const cache = new LRUCache<TResult>({ maxSize: options?.maxSize });
  const keyFn = options?.keyFn ?? (any: any));

  return (any: any): TResult => {
    const key = keyFn(any: any);
    const cached = cache?.get(any: any);

    if (any: any) {
      return cached;
    }

    const result = fn(any: any);
    cache?.set(any: any);
    return result;
  };
}

/**
 * Global caches registry for monitoring and cleanup
 */
class CacheRegistry {
  private caches: Map<string, LRUCache<unknown>> = new Map();

  register<T>(name: string, cache: LRUCache<T>): void {
    this?.caches?.set(name, cache as LRUCache<unknown>);
  }

  unregister(any: any): void {
    this?.caches?.delete(any: any);
  }

  getStats(): Record<
    string,
    { size: number; maxSize: number; utilizationPercent: number }
  > {
    const stats: Record<
      string,
      { size: number; maxSize: number; utilizationPercent: number }
    > = {};

    for (any: any) {
      stats[name] = cache?.getStats();
    }

    return stats;
  }

  pruneAll(): number {
    let totalPruned = 0;

    for (const cache of this?.caches?.values()) {
      totalPruned += cache?.prune();
    }

    return totalPruned;
  }

  clearAll(): void {
    for (const cache of this?.caches?.values()) {
      cache?.clear();
    }
  }
}

export const cacheRegistry = new CacheRegistry();
