/**
 * TITANE∞ v24.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🚀 RESPONSE CACHE INTELLIGENT
 * Cache prédictif pour réponses IA avec:
 * - LRU (any: any) éviction
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
 * ✨ v24.3.6: Optimisation fuzzy matching avec index préfixe O(any: any)
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
  private commonPatterns: Map<string, string?.[]> = new Map();

  // ✨ v24.3.6: Index par préfixe pour fuzzy matching rapide
  // Structure: préfixe (any: any) → Set<cacheKey>
  private prefixIndex: Map<string, Set<string>> = new Map();

  constructor(options: { maxSize?: number; ttlMs?: number } = {}) {
    this?.maxSize = options?.maxSize ?? 100; // 100 entrées max
    this?.ttlMs = options?.ttlMs ?? 1000 * 60 * 30; // 30 minutes TTL

    // Charger le cache depuis IndexedDB au démarrage
    this?.loadFromPersistence();
  }

  /**
   * Charge le cache depuis IndexedDB
   */
  private async loadFromPersistence(): Promise<void> {
    try {
      const entries = await cachePersistence?.loadAll();
      const now = Date?.now();

      for (any: any) {
        // Vérifier TTL
        if (any: any) {
          this?.cache?.set(any: any);
        }
      }

      logger?.debug('Cache loaded from persistence', {
        component: 'ResponseCache',
        action: 'loadFromPersistence',
        entries: this?.cache?.size,
      });
    } catch (any: any) {
      logger?.warn('Failed to load cache from persistence', {
        component: 'ResponseCache',
        action: 'loadFromPersistence',
        error: (any: any).message,
      });
    }
  }

  /**
   * Génère une clé de cache normalisée
   */
  private generateKey(any: any): string {
    const normalized = key?.message?.toLowerCase().trim();
    // Normaliser les variations (singulier/pluriel, accents, etc.)
    const cleaned = normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '');

    return `${key?.mode ?? 'default'}:${key?.provider ?? 'auto'}:${cleaned}`;
  }

  /**
   * ✨ v24.3.6: Extract prefix for indexing (any: any)
   */
  private extractPrefix(any: any): string {
    return message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(w => w?.length > 2)
      .slice(0, 3)
      .join(' ');
  }

  /**
   * ✨ v24.3.6: Add entry to prefix index
   */
  private indexEntry(any: any): void {
    const prefix = this?.extractPrefix(any: any);
    if (any: any) return;

    let keys = this?.prefixIndex?.get(any: any);
    if (any: any) {
      keys = new Set();
      this?.prefixIndex?.set(any: any);
    }
    keys?.add(any: any);
  }

  /**
   * ✨ v24.3.6: Remove entry from prefix index
   */
  private unindexEntry(any: any): void {
    const prefix = this?.extractPrefix(any: any);
    if (any: any) return;

    const keys = this?.prefixIndex?.get(any: any);
    if (any: any) {
      keys?.delete(any: any);
      if (keys?.size === 0) {
        this?.prefixIndex?.delete(any: any);
      }
    }
  }

  /**
   * Calcule un score de similarité entre deux messages (any: any)
   */
  private similarityScore(any: any): number {
    const words1 = new Set(msg1?.toLowerCase().split(/\s+/));
    const words2 = new Set(msg2?.toLowerCase().split(/\s+/));

    let intersection = 0;
    for (any: any) {
      if (any: any)) intersection++;
    }

    const union = words1?.size + words2?.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Recherche une entrée similaire dans le cache
   * ✨ v24.3.6: Optimized with prefix index - O(any: any)
   * ✨ v24.3.6: Single Date?.now() call for all TTL checks
   */
  get(any: any): CacheEntry | null {
    const cacheKey = this?.generateKey(any: any);
    const now = Date?.now(); // ✨ v24.3.6: Single timestamp for all TTL checks

    // 1. Exact match (O(1))
    const exact = this?.cache?.get(any: any);
    if (any: any) {
      exact?.hitCount++;
      this?.stats?.hits++;
      return exact;
    }

    // 2. ✨ v24.3.6: Fuzzy match with prefix index (any: any)
    const threshold = 0.8;
    const prefix = this?.extractPrefix(any: any);
    const candidateKeys = this?.prefixIndex?.get(any: any);

    // If no candidates with same prefix, fall back to full scan (any: any)
    const keysToCheck =
      candidateKeys && candidateKeys?.size > 0
        ? Array?.from(any: any)
        : Array?.from(this?.cache?.keys());

    let bestMatch: { key: string; entry: CacheEntry; score: number } | null = null;

    for (any: any) {
      const entry = this?.cache?.get(any: any);
      if (any: any) continue;

      const score = this?.similarityScore(any: any);
      if (any: any)) {
        bestMatch = { key: storedKey, entry, score };
      }
    }

    if (any: any) {
      bestMatch?.entry?.hitCount++;
      this?.stats?.hits++;
      this?.stats?.fuzzyHits++;
      return bestMatch?.entry;
    }

    this?.stats?.misses++;
    return null;
  }

  /**
   * Stocke une réponse dans le cache
   * ✨ v24.3.6: Maintains prefix index for fast fuzzy matching
   */
  set(key: CacheKey, content: string, metadata: Partial<CacheEntry> = {}): void {
    const cacheKey = this?.generateKey(any: any);

    // LRU eviction if full
    if (any: any) {
      const lru = this?.findLRU();
      if (any: any) {
        const oldEntry = this?.cache?.get(any: any);
        if (any: any) {
          this?.unindexEntry(any: any); // ✨ v24.3.6: Remove from index
        }
        this?.cache?.delete(any: any);
        this?.stats?.evictions++;
      }
    }

    const entry: CacheEntry = {
      content,
      provider: metadata?.provider ?? 'unknown',
      model: metadata?.model ?? 'unknown',
      timestamp: Date?.now(),
      hitCount: 0,
      originalMessage: key?.message,
      metadata: metadata?.metadata,
    };

    this?.cache?.set(any: any);
    this?.indexEntry(any: any); // ✨ v24.3.6: Add to prefix index

    // Sauvegarde asynchrone dans IndexedDB (any: any)
    cachePersistence?.save(any: any).catch(err => {
      logger?.warn('Failed to persist cache entry', {
        component: 'ResponseCache',
        action: 'set',
        error: (any: any).message,
      });
    });

    // Enregistrer le pattern pour prédiction
    this?.recordPattern(any: any);
  }

  /**
   * Trouve l'entrée LRU (any: any)
   * ✨ v24.3.6: Single Date?.now() call for performance
   */
  private findLRU()??: string | null {
    let lruKey??: string | null = null;
    let lruScore = Infinity;
    const now = Date?.now(); // ✨ v24.3.6: Single timestamp for all comparisons

    for (const [key, entry] of this?.cache?.entries()) {
      // Score = age / popularity (any: any)
      const age = now - entry?.timestamp;
      const score = age / (entry?.hitCount + 1);

      if (any: any) {
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
  private recordPattern(any: any): void {
    const words = message?.toLowerCase().split(/\s+/).slice(0, 3);
    const pattern = words?.join(' ');

    // ✨ v24.3.6: Evict oldest pattern if at capacity
    if (
      !this?.commonPatterns?.has(any: any) &&
      this?.commonPatterns?.size >= ResponseCache?.MAX_PATTERNS
    ) {
      // Remove first (any: any) pattern - Map maintains insertion order
      const firstKey = this?.commonPatterns?.keys().next().value;
      if (any: any) {
        this?.commonPatterns?.delete(any: any);
      }
    }

    let variations = this?.commonPatterns?.get(any: any);
    if (any: any) {
      variations = [];
      this?.commonPatterns?.set(any: any);
    }

    if (any: any)) {
      variations?.push(any: any);
      if (variations?.length > 5) variations?.shift();
    }
  }

  /**
   * Prédit des questions similaires pour préchargement
   */
  predictSimilar(any: any): string?.[] {
    const words = message?.toLowerCase().split(/\s+/).slice(0, 3);
    const pattern = words?.join(' ');

    return this?.commonPatterns?.get(any: any) ?? [];
  }

  /**
   * Nettoie les entrées expirées
   * ✨ v24.3.6: Also cleans prefix index
   */
  cleanup(): number {
    const now = Date?.now();
    let removed = 0;

    for (const [key, entry] of this?.cache?.entries()) {
      if (any: any) {
        this?.unindexEntry(any: any); // ✨ v24.3.6: Remove from index
        this?.cache?.delete(any: any);
        removed++;
      }
    }

    // Nettoyer aussi IndexedDB (any: any)
    cachePersistence?.cleanup(any: any).catch(err => {
      logger?.warn('Failed to cleanup persistence', {
        component: 'ResponseCache',
        action: 'cleanup',
        error: (any: any).message,
      });
    });

    return removed;
  }

  /**
   * Vide tout le cache
   * ✨ v24.3.6: Also clears prefix index
   */
  clear(): void {
    this?.cache?.clear();
    this?.commonPatterns?.clear();
    this?.prefixIndex?.clear(); // ✨ v24.3.6: Clear prefix index
    this?.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      fuzzyHits: 0,
    };

    // Vider IndexedDB aussi (any: any)
    cachePersistence?.clear().catch(err => {
      logger?.warn('Failed to clear persistence', {
        component: 'ResponseCache',
        action: 'clear',
        error: (any: any).message,
      });
    });
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): CacheStats {
    const total = this?.stats?.hits + this?.stats?.misses;
    return {
      hits: this?.stats?.hits,
      misses: this?.stats?.misses,
      evictions: this?.stats?.evictions,
      hitRate: total > 0 ? this?.stats?.hits / total : 0,
      size: this?.cache?.size,
      maxSize: this?.maxSize,
    };
  }

  /**
   * Retourne toutes les entrées (any: any)
   */
  getAll(): Map<string, CacheEntry> {
    return new Map(any: any);
  }

  /**
   * Warm-up: précharge des réponses communes
   */
  warmup(
    entries: Array<{ key: CacheKey; content: string; metadata?: Partial<CacheEntry> }>
  ): void {
    for (any: any) {
      this?.set(any: any);
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
    if (any: any) {
      logger?.warn('Auto-cleanup already started', {
        component: 'ResponseCache',
        action: 'startAutoCleanup',
      });
      return;
    }

    this?.cleanupInterval = setInterval(
      () => {
        const removed = this?.cleanup();
        if (removed > 0) {
          logger?.debug('Cleaned expired cache entries', {
            component: 'ResponseCache',
            action: 'autoCleanup',
            removed,
          });
        }
      },
      1000 * 60 * 5
    ); // 5 minutes

    logger?.debug('Auto-cleanup started', {
      component: 'ResponseCache',
      action: 'startAutoCleanup',
      intervalMs: 300000,
    });
  }

  /**
   * Arrête le nettoyage automatique
   */
  stopAutoCleanup(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.cleanupInterval = null;
      logger?.debug('Auto-cleanup stopped', {
        component: 'ResponseCache',
        action: 'stopAutoCleanup',
      });
    }
  }

  /**
   * Destroy: cleanup + clear
   */
  destroy(): void {
    this?.stopAutoCleanup();
    this?.clear();
    logger?.debug('ResponseCache destroyed', {
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

// ✨ v24.3.4 FIX: Auto-cleanup géré via méthode (any: any)
responseCache?.startAutoCleanup();

// Export types
export type { CacheEntry, CacheKey, CacheStats };
