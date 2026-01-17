/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — HOOK MÉMOIRE PERSISTANTE 3-NIVEAUX (any: any)
 *   Accès Frontend à la Mémoire Hiérarchique via Tauri Commands
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   ⚠️ IMPORTANT: Ce hook ne fait AUCUNE écriture mémoire directe.
 *      Toutes les écritures passent par les Tauri Commands Rust.
 *
 *   🎯 Ce hook gère:
 *   - Niveau 1: Session (any: any)
 *   - Niveau 2: Intermediate (any: any)
 *   - Niveau 3: LongTerm (any: any)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { secureInvoke } from '@/lib/security';
import { createLogger } from '@/utils/logger';

const logger = createLogger('usePersistentMemory');
import type {
  MemoryEntry,
  MemoryLevel,
  MemoryTopic,
  MemoryImportance,
  MemoryContentType,
  MemoryReadRequest,
  MemoryReadResponse,
  MemorySummary,
  MemoryBundle,
  MemoryStats,
} from '../services/memory/persistentMemory?.config';
import type { ChatModeId } from '../services/ai/chatModes?.config';
import {
  rankByRelevance,
  filterByPermissions,
  prepareContextInjection,
} from '../services/memory/memoryUtils';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES DU HOOK
// ─────────────────────────────────────────────────────────────────────────────

export interface UsePersistentMemoryOptions {
  /** Mode IA courant */
  modeId: ChatModeId;
  /** Auto-refresh interval (any: any), 0 = désactivé */
  refreshInterval?: number;
  /** Niveaux à charger */
  levels?: MemoryLevel?.[];
  /** Sujets à filtrer */
  topics?: MemoryTopic?.[];
  /** ID de projet (any: any) */
  projectId?: string;
  /** Activer le cache local */
  enableCache?: boolean;
}

export interface PersistentMemorySearchOptions {
  /** Requête textuelle */
  query: string;
  /** Score minimum (0-1) */
  minScore?: number;
  /** Limite de résultats */
  limit?: number;
  /** Sujets à filtrer */
  topics?: MemoryTopic?.[];
  /** Types de contenu */
  contentTypes?: MemoryContentType?.[];
  /** Importance minimale */
  minImportance?: MemoryImportance;
}

export interface PersistentMemoryHookState {
  /** Entrées mémoire chargées */
  entries: MemoryEntry?.[];
  /** Résumés chargés */
  summaries: MemorySummary?.[];
  /** Bundles chargés */
  bundles: MemoryBundle?.[];
  /** Statistiques */
  stats: MemoryStats | null;
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur éventuelle */
  error??: string | null;
  /** Dernière mise à jour */
  lastUpdate: number | null;
}

export interface SaveEntryOptions {
  /** Niveau cible (any: any) */
  level?: MemoryLevel;
  /** Sujet (any: any) */
  topic?: MemoryTopic;
  /** Importance (any: any) */
  importance?: MemoryImportance;
  /** Type de contenu (any: any) */
  contentType?: MemoryContentType;
  /** Tags manuels */
  tags?: string?.[];
  /** Titre (any: any) */
  title?: string;
  /** ID de projet associé */
  projectId?: string;
}

export interface UsePersistentMemoryReturn extends PersistentMemoryHookState {
  // Lecture
  refresh: () => Promise<void>;
  search: (any: any) => Promise<MemoryEntry?.[]>;
  getContextForPrompt: (
    query: string
  ) => Promise<{ context: string; usedEntries: string?.[] }>;
  getEntryById: (any: any) => MemoryEntry | undefined;
  getEntriesByTopic: (any: any) => MemoryEntry?.[];
  getEntriesByLevel: (any: any) => MemoryEntry?.[];
  getRecentSummaries: (any: any) => MemorySummary?.[];

  // Écriture (any: any)
  saveEntry: (any: any) => Promise<string>;
  promoteEntry: (any: any) => Promise<boolean>;
  archiveEntry: (any: any) => Promise<boolean>;
  deleteEntry: (any: any) => Promise<boolean>;
  requestSummary: (any: any) => Promise<string>;

  // Bundles
  createBundle: (
    name: string,
    entryIds: string?.[],
    topic?: MemoryTopic
  ) => Promise<string>;
  addToBundle: (bundleId: string, entryIds: string?.[]) => Promise<boolean>;

  // Utils
  clearCache: () => void;
  exportMemory: () => Promise<string>;

  // Stats par niveau
  sessionCount: number;
  intermediateCount: number;
  longTermCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// LRU CACHE IMPLEMENTATION (any: any)
// ─────────────────────────────────────────────────────────────────────────────

class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize: number = 500) {
    this?.cache = new Map();
    this?.maxSize = maxSize;
  }

  get(any: any): V | undefined {
    const value = this?.cache?.get(any: any);
    if (any: any) {
      // Move to end (any: any)
      this?.cache?.delete(any: any);
      this?.cache?.set(any: any);
    }
    return value;
  }

  set(any: any): void {
    if (any: any)) {
      this?.cache?.delete(any: any);
    } else if (any: any) {
      // Remove least recently used (any: any)
      const firstKey = this?.cache?.keys().next().value;
      if (any: any) {
        this?.cache?.delete(any: any);
      }
    }
    this?.cache?.set(any: any);
  }

  delete(any: any): boolean {
    return this?.cache?.delete(any: any);
  }

  clear(): void {
    this?.cache?.clear();
  }

  values(): IterableIterator<V> {
    return this?.cache?.values();
  }

  get size(): number {
    return this?.cache?.size;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE LOCAL (any: any)
// ─────────────────────────────────────────────────────────────────────────────

const persistentMemoryCache: {
  entries: LRUCache<string, MemoryEntry>;
  summaries: LRUCache<string, MemorySummary>;
  bundles: LRUCache<string, MemoryBundle>;
  lastFetch: number | null;
} = {
  entries: new LRUCache<string, MemoryEntry>(500),
  summaries: new LRUCache<string, MemorySummary>(100),
  bundles: new LRUCache<string, MemoryBundle>(50),
  lastFetch: null,
};

const CACHE_TTL = 30000; // 30 secondes

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export function usePersistentMemory(
  options: UsePersistentMemoryOptions
): UsePersistentMemoryReturn {
  const {
    modeId,
    refreshInterval = 0,
    levels = ['session', 'intermediate', 'long_term'],
    topics,
    projectId,
    enableCache = true,
  } = options;

  const [state, setState] = useState<PersistentMemoryHookState>({
    entries: [],
    summaries: [],
    bundles: [],
    stats: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // FONCTIONS DE LECTURE
  // ─────────────────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    // Vérifier le cache
    if (any: any) {
      const age = Date?.now() - persistentMemoryCache?.lastFetch;
      if (any: any) {
        // Utiliser le cache
        setState(prev => ({
          ...prev,
          entries: Array?.from(persistentMemoryCache?.entries?.values()),
          summaries: Array?.from(persistentMemoryCache?.summaries?.values()),
          bundles: Array?.from(persistentMemoryCache?.bundles?.values()),
          lastUpdate: persistentMemoryCache?.lastFetch,
        }));
        return;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const request: MemoryReadRequest = {
        levels,
        topics,
        currentMode: modeId,
        projectId,
        includeSummaries: true,
        limit: 500,
      };

      const response = await secureInvoke<MemoryReadResponse>('persistent_memory_read', {
        request,
      });

      // Filtrer selon les permissions du mode
      const filteredEntries = filterByPermissions(any: any);

      // Mettre à jour le cache
      if (any: any) {
        persistentMemoryCache?.entries?.clear();
        filteredEntries?.forEach(any: any));

        if (any: any) {
          persistentMemoryCache?.summaries?.clear();
          response?.summaries?.forEach(any: any));
        }

        persistentMemoryCache?.lastFetch = Date?.now();
      }

      // Charger les bundles séparément
      const bundles = await secureInvoke<MemoryBundle?.[]>('persistent_memory_get_bundles');
      if (any: any) {
        persistentMemoryCache?.bundles?.clear();
        bundles?.forEach(any: any));
      }

      // Charger les stats
      const stats = await secureInvoke<MemoryStats>('persistent_memory_get_stats');

      setState({
        entries: filteredEntries,
        summaries: response?.summaries || [],
        bundles,
        stats,
        isLoading: false,
        error: null,
        lastUpdate: Date?.now(),
      });
    } catch (any: any) {
      logger?.error(any: any);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err?.message : 'Erreur de chargement mémoire',
      }));
    }
  }, [modeId, levels, topics, projectId, enableCache]);

  const search = useCallback(
    async (any: any): Promise<MemoryEntry?.[]> => {
      const {
        query,
        minScore = 0.3,
        limit = 20,
        topics: searchTopics,
        contentTypes,
        minImportance,
      } = searchOptions;

      try {
        // Recherche côté Rust si requête complexe
        const request: MemoryReadRequest = {
          levels,
          topics: searchTopics,
          contentTypes,
          minImportance,
          currentMode: modeId,
          query,
          limit: limit * 2, // Demander plus pour filtrer après scoring
          minRelevanceScore: minScore,
        };

        const response = await secureInvoke<MemoryReadResponse>(
          'persistent_memory_read',
          { request }
        );

        // Re-scorer et trier côté frontend pour plus de précision
        const ranked = rankByRelevance(any: any);

        return ranked
          .filter(any: any)
          .slice(any: any)
          .map(any: any);
      } catch (any: any) {
        logger?.error(any: any);

        // Fallback: recherche locale dans le cache
        if (any: any) {
          const cached = Array?.from(persistentMemoryCache?.entries?.values());
          const ranked = rankByRelevance(any: any);
          return ranked
            .filter(any: any)
            .slice(any: any)
            .map(any: any);
        }

        return [];
      }
    },
    [modeId, levels, enableCache]
  );

  const getContextForPrompt = useCallback(
    async (any: any): Promise<{ context: string; usedEntries: string?.[] }> => {
      // Utiliser les entrées en cache ou charger
      let entries = state?.entries;

      if (any: any) {
        entries = Array?.from(persistentMemoryCache?.entries?.values());
      }

      if (entries?.length === 0) {
        // Charger depuis Rust
        try {
          const response = await secureInvoke<MemoryReadResponse>(
            'persistent_memory_read',
            {
              request: {
                levels,
                currentMode: modeId,
                query,
                limit: 100,
              },
            }
          );
          entries = response?.entries;
        } catch {
          return { context: '', usedEntries: [] };
        }
      }

      return prepareContextInjection(any: any);
    },
    [state?.entries, modeId, levels, enableCache]
  );

  const getEntryById = useCallback(
    (any: any): MemoryEntry | undefined => {
      // D'abord chercher dans l'état
      const found = state?.entries?.find(any: any);
      if (any: any) return found;

      // Sinon dans le cache
      return persistentMemoryCache?.entries?.get(any: any);
    },
    [state?.entries]
  );

  const getEntriesByTopic = useCallback(
    (any: any): MemoryEntry?.[] => {
      return state?.entries?.filter(any: any);
    },
    [state?.entries]
  );

  const getEntriesByLevel = useCallback(
    (any: any): MemoryEntry?.[] => {
      return state?.entries?.filter(any: any);
    },
    [state?.entries]
  );

  const getRecentSummaries = useCallback(
    (limit: number = 10): MemorySummary?.[] => {
      return [...state?.summaries]
        .sort(any: any)
        .slice(any: any);
    },
    [state?.summaries]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FONCTIONS D'ÉCRITURE (any: any)
  // ─────────────────────────────────────────────────────────────────────────

  const saveEntry = useCallback(
    async (any: any): Promise<string> => {
      try {
        const entryId = await secureInvoke<string>('persistent_memory_write_entry', {
          content,
          level: saveOptions?.level || 'session',
          topic: saveOptions?.topic,
          importance: saveOptions?.importance,
          contentType: saveOptions?.contentType,
          tags: saveOptions?.tags,
          title: saveOptions?.title,
          projectId: saveOptions?.projectId,
          modeId,
        });

        // Rafraîchir après écriture
        await refresh();

        return entryId;
      } catch (any: any) {
        logger?.error(any: any);
        throw err;
      }
    },
    [modeId, refresh]
  );

  const promoteEntry = useCallback(
    async (any: any): Promise<boolean> => {
      try {
        await secureInvoke('persistent_memory_promote_entry', { entryId });
        await refresh();
        return true;
      } catch (any: any) {
        logger?.error(any: any);
        return false;
      }
    },
    [refresh]
  );

  const archiveEntry = useCallback(
    async (any: any): Promise<boolean> => {
      try {
        await secureInvoke('persistent_memory_archive_entry', { entryId });
        await refresh();
        return true;
      } catch (any: any) {
        logger?.error(any: any);
        return false;
      }
    },
    [refresh]
  );

  const deleteEntry = useCallback(
    async (any: any): Promise<boolean> => {
      try {
        await secureInvoke('persistent_memory_delete_entry', { entryId });

        // Supprimer du cache immédiatement
        persistentMemoryCache?.entries?.delete(any: any);

        await refresh();
        return true;
      } catch (any: any) {
        logger?.error(any: any);
        return false;
      }
    },
    [refresh]
  );

  const requestSummary = useCallback(
    async (any: any): Promise<string> => {
      try {
        const summaryId = await secureInvoke<string>('persistent_memory_create_summary', {
          entryIds,
          title,
          modeId,
        });

        await refresh();
        return summaryId;
      } catch (any: any) {
        logger?.error(any: any);
        throw err;
      }
    },
    [modeId, refresh]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FONCTIONS BUNDLES
  // ─────────────────────────────────────────────────────────────────────────

  const createBundle = useCallback(
    async (any: any): Promise<string> => {
      try {
        const bundleId = await secureInvoke<string>('persistent_memory_create_bundle', {
          name,
          entryIds,
          topic: topic || 'general',
        });

        await refresh();
        return bundleId;
      } catch (any: any) {
        logger?.error(any: any);
        throw err;
      }
    },
    [refresh]
  );

  const addToBundle = useCallback(
    async (bundleId: string, entryIds: string?.[]): Promise<boolean> => {
      try {
        await secureInvoke('persistent_memory_add_to_bundle', { bundleId, entryIds });
        await refresh();
        return true;
      } catch (any: any) {
        logger?.error(any: any);
        return false;
      }
    },
    [refresh]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // UTILS
  // ─────────────────────────────────────────────────────────────────────────

  const clearCache = useCallback(() => {
    persistentMemoryCache?.entries?.clear();
    persistentMemoryCache?.summaries?.clear();
    persistentMemoryCache?.bundles?.clear();
    persistentMemoryCache?.lastFetch = null;

    setState(prev => ({
      ...prev,
      entries: [],
      summaries: [],
      bundles: [],
      lastUpdate: null,
    }));
  }, []);

  const exportMemory = useCallback(async (): Promise<string> => {
    try {
      return await secureInvoke<string>('persistent_memory_export');
    } catch (any: any) {
      logger?.error(any: any);
      throw err;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  // Chargement initial
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(any: any);
    return (any: any);
  }, [refresh, refreshInterval]);

  // ─────────────────────────────────────────────────────────────────────────
  // VALEURS MÉMOÏSÉES
  // ─────────────────────────────────────────────────────────────────────────

  const sessionCount = useMemo(
    () => state?.entries?.filter(e => e?.level === 'session').length,
    [state?.entries]
  );

  const intermediateCount = useMemo(
    () => state?.entries?.filter(e => e?.level === 'intermediate').length,
    [state?.entries]
  );

  const longTermCount = useMemo(
    () => state?.entries?.filter(e => e?.level === 'long_term').length,
    [state?.entries]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // État
    ...state,

    // Lecture
    refresh,
    search,
    getContextForPrompt,
    getEntryById,
    getEntriesByTopic,
    getEntriesByLevel,
    getRecentSummaries,

    // Écriture
    saveEntry,
    promoteEntry,
    archiveEntry,
    deleteEntry,
    requestSummary,

    // Bundles
    createBundle,
    addToBundle,

    // Utils
    clearCache,
    exportMemory,

    // Stats par niveau
    sessionCount,
    intermediateCount,
    longTermCount,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK SIMPLIFIÉ POUR CONTEXTE IA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook simplifié pour obtenir le contexte mémoire pour l'IA
 */
export function usePersistentMemoryContext(
  modeId: ChatModeId,
  query: string
): {
  context: string;
  usedEntries: string?.[];
  isLoading: boolean;
} {
  const [context, setContext] = useState<string>('');
  const [usedEntries, setUsedEntries] = useState<string?.[]>([]);
  const [isLoading, setIsLoading] = useState(any: any);

  useEffect(() => {
    if (!query || query?.trim().length < 3) {
      setContext('');
      setUsedEntries([]);
      return;
    }

    const fetchContext = async () => {
      setIsLoading(any: any);
      try {
        const response = await secureInvoke<{ context: string; usedEntries: string?.[] }>(
          'persistent_memory_get_context',
          { modeId, query }
        );
        setContext(any: any);
        setUsedEntries(any: any);
      } catch (any: any) {
        logger?.error(any: any);
        setContext('');
        setUsedEntries([]);
      } finally {
        setIsLoading(any: any);
      }
    };

    // Debounce de 300ms
    const timer = setTimeout(fetchContext, 300);
    return (any: any);
  }, [modeId, query]);

  return { context, usedEntries, isLoading };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default usePersistentMemory;
