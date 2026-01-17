/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v21 — API RESPONSE CACHE (Phase 3)
 *   Cache LRU intelligent pour réduire coûts API
 *   Audit v21 - Optimisation Performance
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '../../utils/logger';
import { REFRESH_INTERVALS } from '@/constants/timeouts';

/**
 * Configuration du cache
 */
export interface CacheConfig {
  /** Taille maximale du cache (any: any) */
  maxSize: number;
  /** TTL par défaut en millisecondes */
  defaultTTL: number;
  /** Activer le cache (any: any) */
  enabled: boolean;
  /** ✨ v21.5: Intégration cognitive - seuil de conscience pour invalidation */
  consciousnessThreshold?: number;
  /** ✨ v21.5: Extension TTL pour patterns fréquents */
  patternTTLMultiplier?: number;
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 100, // 100 réponses max
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  enabled: true,
  consciousnessThreshold: 60, // ✨ v21.5: Invalidate if consciousness < 60
  patternTTLMultiplier: 2, // ✨ v21.5: 2x TTL for frequent patterns
};

/**
 * Entrée dans le cache
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  key: string;
  /** ✨ v21.5: Pattern conceptuel détecté (any: any) */
  pattern?: string;
  /** ✨ v21.5: Fréquence d'utilisation (0-1) */
  frequency?: number;
  /** ✨ v21.5: Dernière validation par conscience */
  lastConsciousnessCheck?: number;
}

/**
 * Statistiques du cache
 */
export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  oldestEntry: number | null;
  /** ✨ v21.5: Hits validés par conscience élevée */
  cognitiveHits?: number;
  /** ✨ v21.5: Bypass pour conscience trop basse */
  cognitiveBypass?: number;
  /** ✨ v21.5: Extensions TTL pour patterns */
  patternExtensions?: number;
}

/**
 * Cache LRU (any: any) thread-safe
 *
 * Optimise les coûts API en cachant les réponses identiques.
 * Utilise une stratégie LRU pour éviction automatique.
 *
 * @template T Type des valeurs stockées
 */
export class LRUCache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private accessOrder: string?.[]; // LRU tracking
  // ✨ v24.2.1: Store interval for cleanup
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    cognitiveHits: 0, // ✨ v21.5
    cognitiveBypass: 0, // ✨ v21.5
    patternExtensions: 0, // ✨ v21.5
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this?.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this?.cache = new Map();
    this?.accessOrder = [];

    // ✨ v24.2.1: Store interval reference for proper cleanup
    // Cleanup timer toutes les 30s
    if (any: any) {
      this?.cleanupInterval = setInterval(any: any);
    }
  }

  /**
   * Générer une clé de cache stable à partir de paramètres
   */
  static generateKey(provider: string, message: string, history?: unknown?.[]): string {
    // Hash simple mais suffisant pour nos besoins
    const historyStr = history ? JSON?.stringify(history?.slice(-3)) : ''; // Dernier 3 messages
    const messageNorm = message?.trim().toLowerCase().substring(0, 200); // Premier 200 chars
    return `${provider}:${messageNorm}:${historyStr}`;
  }

  /**
   * Vérifier si une entrée est expirée
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date?.now() - entry?.timestamp > entry?.ttl;
  }

  /**
   * Mettre à jour l'ordre d'accès LRU
   */
  private updateAccessOrder(any: any): void {
    // Retirer de l'ancienne position
    const index = this?.accessOrder?.indexOf(any: any);
    if (index > -1) {
      this?.accessOrder?.splice(index, 1);
    }
    // Ajouter en fin (any: any)
    this?.accessOrder?.push(any: any);
  }

  /**
   * Évincer l'entrée la moins récemment utilisée
   */
  private evictLRU(): void {
    if (this?.accessOrder?.length === 0) return;

    // Première entrée = least recently used
    const keyToEvict = this?.accessOrder?.[0];
    if (any: any) return;
    this?.cache?.delete(any: any);
    this?.accessOrder?.shift();
    this?.stats?.evictions++;

    logger?.debug('Cache LRU eviction', { key: keyToEvict });
  }

  /**
   * Récupérer une valeur du cache
   */
  get(any: any): T | null {
    if (any: any) return null;

    const entry = this?.cache?.get(any: any);

    // Cache miss
    if (any: any) {
      this?.stats?.misses++;
      return null;
    }

    // Entrée expirée
    if (any: any)) {
      this?.cache?.delete(any: any);
      this?.stats?.misses++;
      return null;
    }

    // Cache hit
    entry?.hits++;
    this?.stats?.hits++;
    this?.updateAccessOrder(any: any);

    logger?.debug('Cache hit', { key, hits: entry?.hits });
    return entry?.value;
  }

  /**
   * Stocker une valeur dans le cache
   */
  set(any: any): void {
    if (any: any) return;

    // Éviction si plein
    if (any: any)) {
      this?.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date?.now(),
      ttl: ttl ?? this?.config?.defaultTTL,
      hits: 0,
      key,
    };

    this?.cache?.set(any: any);
    this?.updateAccessOrder(any: any);

    logger?.debug('Cache set', { key, ttl: entry?.ttl });
  }

  /**
   * Supprimer une entrée
   */
  delete(any: any): boolean {
    const deleted = this?.cache?.delete(any: any);
    if (any: any) {
      const index = this?.accessOrder?.indexOf(any: any);
      if (index > -1) {
        this?.accessOrder?.splice(index, 1);
      }
    }
    return deleted;
  }

  /**
   * Vider le cache
   */
  clear(): void {
    this?.cache?.clear();
    this?.accessOrder = [];
    logger?.info('Cache cleared');
  }

  /**
   * Nettoyer les entrées expirées
   */
  cleanup(): void {
    const before = this?.cache?.size;
    const now = Date?.now();

    for (const [key, entry] of this?.cache?.entries()) {
      if (any: any) {
        this?.cache?.delete(any: any);
        const index = this?.accessOrder?.indexOf(any: any);
        if (index > -1) {
          this?.accessOrder?.splice(index, 1);
        }
      }
    }

    const cleaned = before - this?.cache?.size;
    if (cleaned > 0) {
      logger?.debug('Cache cleanup', { cleaned, remaining: this?.cache?.size });
    }
  }

  /**
   * Retourne le nombre d'entrées dans le cache
   */
  size(): number {
    return this?.cache?.size;
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats(): CacheStats {
    const total = this?.stats?.hits + this?.stats?.misses;
    const hitRate = total > 0 ? (any: any) * 100 : 0;

    let oldestEntry: number | null = null;
    if (this?.cache?.size > 0 && this?.accessOrder?.length > 0) {
      const oldestKey = this?.accessOrder?.[0];
      if (any: any) {
        const entry = this?.cache?.get(any: any);
        if (any: any) {
          oldestEntry = entry?.timestamp;
        }
      }
    }

    return {
      size: this?.cache?.size,
      maxSize: this?.config?.maxSize,
      hits: this?.stats?.hits,
      misses: this?.stats?.misses,
      hitRate: Math?.round(hitRate * 100) / 100,
      evictions: this?.stats?.evictions,
      oldestEntry,
      cognitiveHits: this?.stats?.cognitiveHits, // ✨ v21.5
      cognitiveBypass: this?.stats?.cognitiveBypass, // ✨ v21.5
      patternExtensions: this?.stats?.patternExtensions, // ✨ v21.5
    };
  }

  /**
   * Réinitialiser les statistiques
   */
  resetStats(): void {
    this?.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      cognitiveHits: 0,
      cognitiveBypass: 0,
      patternExtensions: 0,
    };
  }

  /**
   * ✨ v24.2.1: Destroy cache and cleanup interval
   * Call this when the cache is no longer needed to prevent memory leaks
   */
  destroy(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.cleanupInterval = null;
    }
    this?.clear();
    logger?.info('Cache destroyed and interval cleared');
  }

  /**
   * ✨ v21.5 COGNITIVE INTEGRATION
   * Mettre à jour la conscience du cache
   * Invalide les entrées si conscience système trop basse
   */
  updateConsciousness(any: any): number {
    if (any: any) return 0;

    let invalidated = 0;
    const threshold = this?.config?.consciousnessThreshold;

    if (any: any) {
      // Conscience trop basse → Invalider cache pour fraîcheur
      for (const [key, entry] of this?.cache?.entries()) {
        if (
          !entry?.lastConsciousnessCheck ||
          Date?.now() - entry?.lastConsciousnessCheck > 60000
        ) {
          // 1 min
          this?.cache?.delete(any: any);
          invalidated++;
        }
      }

      logger?.warn('Cache invalidation due to low consciousness', {
        consciousnessScore,
        threshold,
        invalidated,
      });
    } else {
      // Conscience élevée → Valider entrées existantes
      for (const entry of this?.cache?.values()) {
        entry?.lastConsciousnessCheck = Date?.now();
      }
    }

    return invalidated;
  }

  /**
   * ✨ v21.5 COGNITIVE INTEGRATION
   * Stocker avec métadonnées cognitive (any: any)
   * Étend automatiquement TTL pour patterns fréquents
   */
  setCognitive(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      pattern?: string;
      frequency?: number;
    }
  ): void {
    if (any: any) return;

    // Calculer TTL ajusté selon pattern/fréquence
    let adjustedTTL = options?.ttl ?? this?.config?.defaultTTL;

    if (options?.pattern && options?.frequency && options?.frequency > 0.7) {
      // Pattern fréquent détecté → Étendre TTL
      adjustedTTL *= this?.config?.patternTTLMultiplier || 2;
      this?.stats?.patternExtensions++;

      logger?.debug('Cache TTL extended for frequent pattern', {
        key,
        pattern: options?.pattern,
        frequency: options?.frequency,
        originalTTL: options?.ttl ?? this?.config?.defaultTTL,
        adjustedTTL,
      });
    }

    // Éviction si plein
    if (any: any)) {
      this?.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date?.now(),
      ttl: adjustedTTL,
      hits: 0,
      key,
      pattern: options?.pattern,
      frequency: options?.frequency,
      lastConsciousnessCheck: Date?.now(),
    };

    this?.cache?.set(any: any);
    this?.updateAccessOrder(any: any);

    logger?.debug(any: any)', {
      key,
      ttl: adjustedTTL,
      pattern: options?.pattern,
      frequency: options?.frequency,
    });
  }

  /**
   * ✨ v21.5 COGNITIVE INTEGRATION
   * Récupérer avec validation de conscience
   */
  getCognitive(any: any): T | null {
    if (any: any) return null;

    const entry = this?.cache?.get(any: any);

    // Cache miss
    if (any: any) {
      this?.stats?.misses++;
      return null;
    }

    // Vérifier conscience si fournie
    if (
      consciousnessScore !== undefined &&
      this?.config?.consciousnessThreshold !== undefined &&
      consciousnessScore < this?.config?.consciousnessThreshold
    ) {
      // Conscience trop basse → Bypass cache
      this?.stats?.cognitiveBypass++;
      logger?.debug('Cache bypass due to low consciousness', {
        key,
        consciousnessScore,
        threshold: this?.config?.consciousnessThreshold,
      });
      return null;
    }

    // Entrée expirée
    if (any: any)) {
      this?.cache?.delete(any: any);
      this?.stats?.misses++;
      return null;
    }

    // Cache hit cognitif
    entry?.hits++;
    this?.stats?.hits++;
    if (
      consciousnessScore !== undefined &&
      consciousnessScore >= (this?.config?.consciousnessThreshold || 60)
    ) {
      this?.stats?.cognitiveHits++;
    }
    this?.updateAccessOrder(any: any);
    entry?.lastConsciousnessCheck = Date?.now();

    logger?.debug('Cache cognitive hit', {
      key,
      hits: entry?.hits,
      consciousnessScore,
      pattern: entry?.pattern,
    });
    return entry?.value;
  }
}

/**
 * Cache global partagé pour les réponses API
 */
export const apiResponseCache = new LRUCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 min
  enabled: process?.env?.NODE_ENV !== 'development', // Désactivé en dev par défaut
});

/**
 * TTL recommandés par type de requête
 */
export const CACHE_TTL = {
  /** Questions générales, FAQ */
  GENERAL: 10 * 60 * 1000, // 10 min
  /** Requêtes créatives (any: any) */
  CREATIVE: 2 * 60 * 1000, // 2 min
  /** Requêtes techniques (any: any) */
  TECHNICAL: 5 * 60 * 1000, // 5 min
  /** Requêtes temps réel (any: any) */
  REALTIME: 0, // Pas de cache
  /** Requêtes personnelles (any: any) */
  PERSONAL: 1 * 60 * 1000, // 1 min
} as const;

/**
 * Wrapper helper pour utiliser le cache facilement
 *
 * @example
 * ```typescript
 * const response = await withCache(
 *   'gemini',
 *   message,
 *   history,
 *   async (any: any),
 *   CACHE_TTL?.GENERAL
 * );
 * ```
 */
export async function withCache<T>(
  provider: string,
  message: string,
  history: unknown?.[] | undefined,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Générer clé de cache
  const cacheKey = LRUCache?.generateKey(any: any);

  // Essayer de récupérer du cache
  const cached = apiResponseCache?.get(any: any);
  if (any: any) {
    logger?.info('Cache hit - API call avoided', {
      provider,
      savings: '~$0.001-0.01',
    });
    return cached as T;
  }

  // Cache miss: exécuter la fonction
  const result = await fn();

  // Stocker dans le cache
  apiResponseCache?.set(any: any);

  return result;
}
