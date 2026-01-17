/**
 * TITANE∞ v24.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🚀 RESPONSE CACHE INTELLIGENT
 * Cache prédictif pour réponses IA avec:
 * - LRU (Least Recently Used) éviction
 * - Prédiction basée sur patterns
 * - Préchargement intelligent
 * - Impact: -80% latence pour requêtes similaires
 */

import { logger } from '@/lib/logger';
import { cachePersistence } from './cachePersistence';

interface CacheEntry {
  content: string;
  provider: string;
  model: string;
  timestamp: number;
  hitCount: number;
  originalMessage: string; // Original message for fuzzy matching
  metadata?: Record<string, unknown>;
}

interface CacheKey {
  message: string;
  mode?: string;
  provider?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

/**
 * Cache intelligent avec LRU + prédiction
 * ✨ v24.3.6: Optimisation fuzzy matching avec index préfixe O(k) au lieu de O(n)
 */
export class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttlMs: number;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    fuzzyHits: 0, // ✨ v24.3.6: Track fuzzy match successes
  };

  // Pattern de détection pour recommandations
  private commonPatterns: Map<string, string[]> = new Map();

  // ✨ v24.3.6: Index par préfixe pour fuzzy matching rapide
  // Structure: préfixe (3 premiers mots normalisés) → Set<cacheKey>
  private prefixIndex: Map<string, Set<string>> = new Map();

  constructor(options: { maxSize?: number; ttlMs?: number } = {}) {
    this.maxSize = options.maxSize ?? 100; // 100 entrées max
    this.ttlMs = options.ttlMs ?? 1000 * 60 * 30; // 30 minutes TTL

    // Charger le cache depuis IndexedDB au démarrage
    this.loadFromPersistence();
  }

  /**
   * Charge le cache depuis IndexedDB
   */
  private async loadFromPersistence(): Promise<void> {
    try {
      const entries = await cachePersistence.loadAll();
      const now = Date.now();

      for (const [key, entry] of entries) {
        // Vérifier TTL
        if (now - entry.timestamp < this.ttlMs) {
          this.cache.set(key, entry);
        }
      }

      logger.debug('Cache loaded from persistence', {
        component: 'ResponseCache',
        action: 'loadFromPersistence',
        entries: this.cache.size,
      });
    } catch (error) {
      logger.warn('Failed to load cache from persistence', {
        component: 'ResponseCache',
        action: 'loadFromPersistence',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Génère une clé de cache normalisée
   */
  private generateKey(key: CacheKey): string {
    const normalized = key.message.toLowerCase().trim();
    // Normaliser les variations (singulier/pluriel, accents, etc.)
    const cleaned = normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '');

    return `${key.mode ?? 'default'}:${key.provider ?? 'auto'}:${cleaned}`;
  }

  /**
   * ✨ v24.3.6: Extract prefix for indexing (3 first words, normalized)
   */
  private extractPrefix(message: string): string {
    return message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 3)
      .join(' ');
  }

  /**
   * ✨ v24.3.6: Add entry to prefix index
   */
  private indexEntry(cacheKey: string, message: string): void {
    const prefix = this.extractPrefix(message);
    if (!prefix) return;

    let keys = this.prefixIndex.get(prefix);
    if (!keys) {
      keys = new Set();
      this.prefixIndex.set(prefix, keys);
    }
    keys.add(cacheKey);
  }

  /**
   * ✨ v24.3.6: Remove entry from prefix index
   */
  private unindexEntry(cacheKey: string, message: string): void {
    const prefix = this.extractPrefix(message);
    if (!prefix) return;

    const keys = this.prefixIndex.get(prefix);
    if (keys) {
      keys.delete(cacheKey);
      if (keys.size === 0) {
        this.prefixIndex.delete(prefix);
      }
    }
  }

  /**
   * Calcule un score de similarité entre deux messages (Jaccard)
   */
  private similarityScore(msg1: string, msg2: string): number {
    const words1 = new Set(msg1.toLowerCase().split(/\s+/));
    const words2 = new Set(msg2.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (const word of words1) {
      if (words2.has(word)) intersection++;
    }

    const union = words1.size + words2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Recherche une entrée similaire dans le cache
   * ✨ v24.3.6: Optimized with prefix index - O(k) instead of O(n)
   * ✨ v24.3.6: Single Date.now() call for all TTL checks
   */
  get(key: CacheKey): CacheEntry | null {
    const cacheKey = this.generateKey(key);
    const now = Date.now(); // ✨ v24.3.6: Single timestamp for all TTL checks

    // 1. Exact match (O(1))
    const exact = this.cache.get(cacheKey);
    if (exact && now - exact.timestamp < this.ttlMs) {
      exact.hitCount++;
      this.stats.hits++;
      return exact;
    }

    // 2. ✨ v24.3.6: Fuzzy match with prefix index (O(k) where k << n)
    const threshold = 0.8;
    const prefix = this.extractPrefix(key.message);
    const candidateKeys = this.prefixIndex.get(prefix);

    // If no candidates with same prefix, fall back to full scan (rare)
    const keysToCheck =
      candidateKeys && candidateKeys.size > 0
        ? Array.from(candidateKeys)
        : Array.from(this.cache.keys());

    let bestMatch: { key: string; entry: CacheEntry; score: number } | null = null;

    for (const storedKey of keysToCheck) {
      const entry = this.cache.get(storedKey);
      if (!entry || now - entry.timestamp > this.ttlMs) continue;

      const score = this.similarityScore(key.message, entry.originalMessage);
      if (score >= threshold && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { key: storedKey, entry, score };
      }
    }

    if (bestMatch) {
      bestMatch.entry.hitCount++;
      this.stats.hits++;
      this.stats.fuzzyHits++;
      return bestMatch.entry;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Stocke une réponse dans le cache
   * ✨ v24.3.6: Maintains prefix index for fast fuzzy matching
   */
  set(key: CacheKey, content: string, metadata: Partial<CacheEntry> = {}): void {
    const cacheKey = this.generateKey(key);

    // LRU eviction if full
    if (this.cache.size >= this.maxSize) {
      const lru = this.findLRU();
      if (lru) {
        const oldEntry = this.cache.get(lru);
        if (oldEntry) {
          this.unindexEntry(lru, oldEntry.originalMessage); // ✨ v24.3.6: Remove from index
        }
        this.cache.delete(lru);
        this.stats.evictions++;
      }
    }

    const entry: CacheEntry = {
      content,
      provider: metadata.provider ?? 'unknown',
      model: metadata.model ?? 'unknown',
      timestamp: Date.now(),
      hitCount: 0,
      originalMessage: key.message,
      metadata: metadata.metadata,
    };

    this.cache.set(cacheKey, entry);
    this.indexEntry(cacheKey, key.message); // ✨ v24.3.6: Add to prefix index

    // Sauvegarde asynchrone dans IndexedDB (non-bloquante)
    cachePersistence.save(key, entry).catch(err => {
      logger.warn('Failed to persist cache entry', {
        component: 'ResponseCache',
        action: 'set',
        error: (err as Error).message,
      });
    });

    // Enregistrer le pattern pour prédiction
    this.recordPattern(key.message);
  }

  /**
   * Trouve l'entrée LRU (Least Recently Used)
   * ✨ v24.3.6: Single Date.now() call for performance
   */
  private findLRU(): string | null {
    let lruKey: string | null = null;
    let lruScore = Infinity;
    const now = Date.now(); // ✨ v24.3.6: Single timestamp for all comparisons

    for (const [key, entry] of this.cache.entries()) {
      // Score = age / popularity (lower = LRU)
      const age = now - entry.timestamp;
      const score = age / (entry.hitCount + 1);

      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }

    return lruKey;
  }

  // ✨ v24.3.6: Max patterns to prevent unbounded growth
  private static readonly MAX_PATTERNS = 500;

  /**
   * Enregistre un pattern pour prédiction
   * ✨ v24.3.6: LRU eviction to prevent unbounded growth
   */
  private recordPattern(message: string): void {
    const words = message.toLowerCase().split(/\s+/).slice(0, 3);
    const pattern = words.join(' ');

    // ✨ v24.3.6: Evict oldest pattern if at capacity
    if (
      !this.commonPatterns.has(pattern) &&
      this.commonPatterns.size >= ResponseCache.MAX_PATTERNS
    ) {
      // Remove first (oldest) pattern - Map maintains insertion order
      const firstKey = this.commonPatterns.keys().next().value;
      if (firstKey) {
        this.commonPatterns.delete(firstKey);
      }
    }

    let variations = this.commonPatterns.get(pattern);
    if (!variations) {
      variations = [];
      this.commonPatterns.set(pattern, variations);
    }

    if (!variations.includes(message)) {
      variations.push(message);
      if (variations.length > 5) variations.shift();
    }
  }

  /**
   * Prédit des questions similaires pour préchargement
   */
  predictSimilar(message: string): string[] {
    const words = message.toLowerCase().split(/\s+/).slice(0, 3);
    const pattern = words.join(' ');

    return this.commonPatterns.get(pattern) ?? [];
  }

  /**
   * Nettoie les entrées expirées
   * ✨ v24.3.6: Also cleans prefix index
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        this.unindexEntry(key, entry.originalMessage); // ✨ v24.3.6: Remove from index
        this.cache.delete(key);
        removed++;
      }
    }

    // Nettoyer aussi IndexedDB (asynchrone)
    cachePersistence.cleanup(this.ttlMs).catch(err => {
      logger.warn('Failed to cleanup persistence', {
        component: 'ResponseCache',
        action: 'cleanup',
        error: (err as Error).message,
      });
    });

    return removed;
  }

  /**
   * Vide tout le cache
   * ✨ v24.3.6: Also clears prefix index
   */
  clear(): void {
    this.cache.clear();
    this.commonPatterns.clear();
    this.prefixIndex.clear(); // ✨ v24.3.6: Clear prefix index
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      fuzzyHits: 0,
    };

    // Vider IndexedDB aussi (asynchrone)
    cachePersistence.clear().catch(err => {
      logger.warn('Failed to clear persistence', {
        component: 'ResponseCache',
        action: 'clear',
        error: (err as Error).message,
      });
    });
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Retourne toutes les entrées (pour debug)
   */
  getAll(): Map<string, CacheEntry> {
    return new Map(this.cache);
  }

  /**
   * Warm-up: précharge des réponses communes
   */
  warmup(
    entries: Array<{ key: CacheKey; content: string; metadata?: Partial<CacheEntry> }>
  ): void {
    for (const entry of entries) {
      this.set(entry.key, entry.content, entry.metadata);
    }
  }

  /**
   * ✨ v24.3.4: Cleanup interval management
   */
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Démarre le nettoyage automatique
   */
  startAutoCleanup(): void {
    if (this.cleanupInterval) {
      logger.warn('Auto-cleanup already started', {
        component: 'ResponseCache',
        action: 'startAutoCleanup',
      });
      return;
    }

    this.cleanupInterval = setInterval(
      () => {
        const removed = this.cleanup();
        if (removed > 0) {
          logger.debug('Cleaned expired cache entries', {
            component: 'ResponseCache',
            action: 'autoCleanup',
            removed,
          });
        }
      },
      1000 * 60 * 5
    ); // 5 minutes

    logger.debug('Auto-cleanup started', {
      component: 'ResponseCache',
      action: 'startAutoCleanup',
      intervalMs: 300000,
    });
  }

  /**
   * Arrête le nettoyage automatique
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.debug('Auto-cleanup stopped', {
        component: 'ResponseCache',
        action: 'stopAutoCleanup',
      });
    }
  }

  /**
   * Destroy: cleanup + clear
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.clear();
    logger.debug('ResponseCache destroyed', {
      component: 'ResponseCache',
      action: 'destroy',
    });
  }
}

// Instance singleton
export const responseCache = new ResponseCache({
  maxSize: 100,
  ttlMs: 1000 * 60 * 30, // 30 minutes
});

// ✨ v24.3.4 FIX: Auto-cleanup géré via méthode (évite memory leak)
responseCache.startAutoCleanup();

// Export types
export type { CacheEntry, CacheKey, CacheStats };
