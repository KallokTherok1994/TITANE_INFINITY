/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — COMPONENT CACHE
 * Memoization profonde et micro-cache intelligent
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface CacheEntry {
  timestamp: number;
  needsUpdate: boolean;
  hitCount: number;
  lastAccess: number;
  data?: unknown;
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  avgAge: number;
  memoryEstimate: number;
}

export class ComponentCache {
  private cache: Map<string, CacheEntry> = new Map();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private cacheDurationMs: number;
  private maxEntries = 500;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cacheDurationMs: number = 6) {
    this.cacheDurationMs = cacheDurationMs;
    this.startCleanupInterval();
  }

  /**
   * Vérifie si un composant est en cache
   */
  has(componentId: string): boolean {
    const entry = this.cache.get(componentId);
    if (!entry) return false;

    // Vérifier expiration
    const now = Date.now();
    if (now - entry.timestamp > this.cacheDurationMs) {
      this.cache.delete(componentId);
      return false;
    }

    return true;
  }

  /**
   * Récupère une entrée du cache
   */
  get(componentId: string): CacheEntry | null {
    const entry = this.cache.get(componentId);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // Vérifier expiration
    const now = Date.now();
    if (now - entry.timestamp > this.cacheDurationMs) {
      this.cache.delete(componentId);
      this.missCount++;
      return null;
    }

    // Mettre à jour stats
    entry.hitCount++;
    entry.lastAccess = now;
    this.hitCount++;

    return entry;
  }

  /**
   * Ajoute une entrée au cache
   */
  set(componentId: string, entry: Partial<CacheEntry>): void {
    // Éviction si max atteint
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    const now = Date.now();
    this.cache.set(componentId, {
      timestamp: now,
      needsUpdate: false,
      hitCount: 0,
      lastAccess: now,
      ...entry,
    });
  }

  /**
   * Marque une entrée comme touchée (refresh timestamp)
   */
  touch(componentId: string): void {
    const entry = this.cache.get(componentId);
    if (entry) {
      entry.timestamp = Date.now();
      entry.lastAccess = Date.now();
    }
  }

  /**
   * Invalide une entrée
   */
  invalidate(componentId: string): void {
    const entry = this.cache.get(componentId);
    if (entry) {
      entry.needsUpdate = true;
    }
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (pattern.test(key)) {
        entry.needsUpdate = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Supprime une entrée
   */
  remove(componentId: string): boolean {
    return this.cache.delete(componentId);
  }

  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Éviction de l'entrée la plus ancienne
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictionCount++;
    }
  }

  /**
   * Nettoyage des entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheDurationMs * 10) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.evictionCount++;
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => this.cleanup(), 1000);
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Calcule le taux de hit
   */
  getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  /**
   * Récupère les statistiques
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    const totalAge = entries.reduce((sum, e) => sum + (now - e.timestamp), 0);
    const avgAge = entries.length > 0 ? totalAge / entries.length : 0;

    // Estimation mémoire (rough)
    const memoryEstimate = this.cache.size * 200; // ~200 bytes par entrée

    return {
      totalEntries: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.getHitRate(),
      evictionCount: this.evictionCount,
      avgAge,
      memoryEstimate,
    };
  }

  /**
   * Précharge un ensemble de composants
   */
  preload(componentIds: string[]): void {
    const now = Date.now();
    for (const id of componentIds) {
      if (!this.cache.has(id)) {
        this.set(id, { timestamp: now, needsUpdate: false });
      }
    }
  }
}

export default ComponentCache;
