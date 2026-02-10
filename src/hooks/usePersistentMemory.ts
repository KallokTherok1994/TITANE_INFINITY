/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — HOOK MÉMOIRE PERSISTANTE 3-NIVEAUX (READ-ONLY)
 *   Accès Frontend à la Mémoire Hiérarchique via Tauri Commands
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   ⚠️ IMPORTANT: Ce hook ne fait AUCUNE écriture mémoire directe.
 *      Toutes les écritures passent par les Tauri Commands Rust.
 *
 *   🎯 Ce hook gère:
 *   - Niveau 1: Session (volatile, 24h max)
 *   - Niveau 2: Intermediate (persistant, 90 jours)
 *   - Niveau 3: LongTerm (permanent, chiffré)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { tauriClient } from '@/lib/tauriClient';
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
} from '../services/memory/persistentMemory.config';
import type { ChatModeId } from '../services/ai/chatModes.config';
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
  /** Auto-refresh interval (ms), 0 = désactivé */
  refreshInterval?: number;
  /** Niveaux à charger */
  levels?: MemoryLevel[];
  /** Sujets à filtrer */
  topics?: MemoryTopic[];
  /** ID de projet (optionnel) */
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
  topics?: MemoryTopic[];
  /** Types de contenu */
  contentTypes?: MemoryContentType[];
  /** Importance minimale */
  minImportance?: MemoryImportance;
}

export interface PersistentMemoryHookState {
  /** Entrées mémoire chargées */
  entries: MemoryEntry[];
  /** Résumés chargés */
  summaries: MemorySummary[];
  /** Bundles chargés */
  bundles: MemoryBundle[];
  /** Statistiques */
  stats: MemoryStats | null;
  /** Chargement en cours */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: string | null;
  /** Dernière mise à jour */
  lastUpdate: number | null;
}

export interface SaveEntryOptions {
  /** Niveau cible (défaut: session) */
  level?: MemoryLevel;
  /** Sujet (auto-classifié si omis) */
  topic?: MemoryTopic;
  /** Importance (auto-calculée si omise) */
  importance?: MemoryImportance;
  /** Type de contenu (auto-classifié si omis) */
  contentType?: MemoryContentType;
  /** Tags manuels */
  tags?: string[];
  /** Titre (optionnel) */
  title?: string;
  /** ID de projet associé */
  projectId?: string;
}

export interface UsePersistentMemoryReturn extends PersistentMemoryHookState {
  // Lecture
  refresh: () => Promise<void>;
  search: (options: PersistentMemorySearchOptions) => Promise<MemoryEntry[]>;
  getContextForPrompt: (
    query: string
  ) => Promise<{ context: string; usedEntries: string[] }>;
  getEntryById: (id: string) => MemoryEntry | undefined;
  getEntriesByTopic: (topic: MemoryTopic) => MemoryEntry[];
  getEntriesByLevel: (level: MemoryLevel) => MemoryEntry[];
  getRecentSummaries: (limit?: number) => MemorySummary[];

  // Écriture (via Tauri Commands)
  saveEntry: (content: string, options?: SaveEntryOptions) => Promise<string>;
  promoteEntry: (entryId: string) => Promise<boolean>;
  archiveEntry: (entryId: string) => Promise<boolean>;
  deleteEntry: (entryId: string) => Promise<boolean>;
  requestSummary: (entryIds: string[], title?: string) => Promise<string>;

  // Bundles
  createBundle: (
    name: string,
    entryIds: string[],
    topic?: MemoryTopic
  ) => Promise<string>;
  addToBundle: (bundleId: string, entryIds: string[]) => Promise<boolean>;

  // Utils
  clearCache: () => void;
  exportMemory: () => Promise<string>;

  // Stats par niveau
  sessionCount: number;
  intermediateCount: number;
  longTermCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// LRU CACHE IMPLEMENTATION (évite croissance infinie)
// ─────────────────────────────────────────────────────────────────────────────

class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  constructor(maxSize: number = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  values(): IterableIterator<V> {
    return this.cache.values();
  }

  get size(): number {
    return this.cache.size;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE LOCAL (IN-MEMORY avec LRU)
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
    if (enableCache && persistentMemoryCache.lastFetch) {
      const age = Date.now() - persistentMemoryCache.lastFetch;
      if (age < CACHE_TTL) {
        // Utiliser le cache
        setState(prev => ({
          ...prev,
          entries: Array.from(persistentMemoryCache.entries.values()),
          summaries: Array.from(persistentMemoryCache.summaries.values()),
          bundles: Array.from(persistentMemoryCache.bundles.values()),
          lastUpdate: persistentMemoryCache.lastFetch,
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

      const response = await tauriClient.persistentMemoryRead({
        request,
      }) as MemoryReadResponse;

      // Filtrer selon les permissions du mode
      const filteredEntries = filterByPermissions(response.entries, modeId);

      // Mettre à jour le cache
      if (enableCache) {
        persistentMemoryCache.entries.clear();
        filteredEntries.forEach(e => persistentMemoryCache.entries.set(e.id, e));

        if (response.summaries) {
          persistentMemoryCache.summaries.clear();
          response.summaries.forEach(s => persistentMemoryCache.summaries.set(s.id, s));
        }

        persistentMemoryCache.lastFetch = Date.now();
      }

      // Charger les bundles séparément
      const bundles = await tauriClient.persistentMemoryGetBundles() as MemoryBundle[];
      if (enableCache) {
        persistentMemoryCache.bundles.clear();
        bundles.forEach(b => persistentMemoryCache.bundles.set(b.id, b));
      }

      // Charger les stats
      const stats = await tauriClient.persistentMemoryGetStats() as MemoryStats;

      setState({
        entries: filteredEntries,
        summaries: response.summaries || [],
        bundles,
        stats,
        isLoading: false,
        error: null,
        lastUpdate: Date.now(),
      });
    } catch (err) {
      console.error('[usePersistentMemory] Erreur de chargement:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Erreur de chargement mémoire',
      }));
    }
  }, [modeId, levels, topics, projectId, enableCache]);

  const search = useCallback(
    async (searchOptions: PersistentMemorySearchOptions): Promise<MemoryEntry[]> => {
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

        const response = await tauriClient.persistentMemoryRead({
          request,
        }) as MemoryReadResponse;

        // Re-scorer et trier côté frontend pour plus de précision
        const ranked = rankByRelevance(response.entries, query);

        return ranked
          .filter(r => r.score >= minScore)
          .slice(0, limit)
          .map(r => r.entry);
      } catch (err) {
        console.error('[usePersistentMemory] Erreur de recherche:', err);

        // Fallback: recherche locale dans le cache
        if (enableCache) {
          const cached = Array.from(persistentMemoryCache.entries.values());
          const ranked = rankByRelevance(cached, query);
          return ranked
            .filter(r => r.score >= minScore)
            .slice(0, limit)
            .map(r => r.entry);
        }

        return [];
      }
    },
    [modeId, levels, enableCache]
  );

  const getContextForPrompt = useCallback(
    async (query: string): Promise<{ context: string; usedEntries: string[] }> => {
      // Utiliser les entrées en cache ou charger
      let entries = state.entries;

      if (entries.length === 0 && enableCache) {
        entries = Array.from(persistentMemoryCache.entries.values());
      }

      if (entries.length === 0) {
        // Charger depuis Rust
        try {
          const response = await tauriClient.persistentMemoryRead({
            request: {
              levels,
              currentMode: modeId,
              query,
              limit: 100,
            },
          }) as MemoryReadResponse;
          entries = response.entries;
        } catch {
          return { context: '', usedEntries: [] };
        }
      }

      return prepareContextInjection(entries, query, modeId);
    },
    [state.entries, modeId, levels, enableCache]
  );

  const getEntryById = useCallback(
    (id: string): MemoryEntry | undefined => {
      // D'abord chercher dans l'état
      const found = state.entries.find(e => e.id === id);
      if (found) return found;

      // Sinon dans le cache
      return persistentMemoryCache.entries.get(id);
    },
    [state.entries]
  );

  const getEntriesByTopic = useCallback(
    (topic: MemoryTopic): MemoryEntry[] => {
      return state.entries.filter(e => e.topic === topic);
    },
    [state.entries]
  );

  const getEntriesByLevel = useCallback(
    (level: MemoryLevel): MemoryEntry[] => {
      return state.entries.filter(e => e.level === level);
    },
    [state.entries]
  );

  const getRecentSummaries = useCallback(
    (limit: number = 10): MemorySummary[] => {
      return [...state.summaries]
        .sort((a, b) => b.generatedAt - a.generatedAt)
        .slice(0, limit);
    },
    [state.summaries]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FONCTIONS D'ÉCRITURE (via Tauri Commands)
  // ─────────────────────────────────────────────────────────────────────────

  const saveEntry = useCallback(
    async (content: string, saveOptions?: SaveEntryOptions): Promise<string> => {
      try {
        const entryId = (await tauriClient.persistentMemoryWriteEntry({
          content,
          level: saveOptions?.level || 'session',
          topic: saveOptions?.topic,
          importance: saveOptions?.importance,
          contentType: saveOptions?.contentType,
          tags: saveOptions?.tags,
          title: saveOptions?.title,
          projectId: saveOptions?.projectId,
          modeId,
        })) as string;

        // Rafraîchir après écriture
        await refresh();

        return entryId;
      } catch (err) {
        console.error('[usePersistentMemory] Erreur de sauvegarde:', err);
        throw err;
      }
    },
    [modeId, refresh]
  );

  const promoteEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      try {
        await tauriClient.persistentMemoryPromoteEntry({ entryId });
        await refresh();
        return true;
      } catch (err) {
        console.error('[usePersistentMemory] Erreur de promotion:', err);
        return false;
      }
    },
    [refresh]
  );

  const archiveEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      try {
        await tauriClient.persistentMemoryArchiveEntry({ entryId });
        await refresh();
        return true;
      } catch (err) {
        console.error("[usePersistentMemory] Erreur d'archivage:", err);
        return false;
      }
    },
    [refresh]
  );

  const deleteEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      try {
        await tauriClient.persistentMemoryDeleteEntry({ entryId });

        // Supprimer du cache immédiatement
        persistentMemoryCache.entries.delete(entryId);

        await refresh();
        return true;
      } catch (err) {
        console.error('[usePersistentMemory] Erreur de suppression:', err);
        return false;
      }
    },
    [refresh]
  );

  const requestSummary = useCallback(
    async (entryIds: string[], title?: string): Promise<string> => {
      try {
        const summaryId = (await tauriClient.persistentMemoryCreateSummary({
          entryIds,
          title,
          modeId,
        })) as string;

        await refresh();
        return summaryId;
      } catch (err) {
        console.error('[usePersistentMemory] Erreur de création résumé:', err);
        throw err;
      }
    },
    [modeId, refresh]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FONCTIONS BUNDLES
  // ─────────────────────────────────────────────────────────────────────────

  const createBundle = useCallback(
    async (name: string, entryIds: string[], topic?: MemoryTopic): Promise<string> => {
      try {
        const bundleId = (await tauriClient.persistentMemoryCreateBundle({
          name,
          entryIds,
          topic: topic || 'general',
        })) as string;

        await refresh();
        return bundleId;
      } catch (err) {
        console.error('[usePersistentMemory] Erreur de création bundle:', err);
        throw err;
      }
    },
    [refresh]
  );

  const addToBundle = useCallback(
    async (bundleId: string, entryIds: string[]): Promise<boolean> => {
      try {
        await tauriClient.persistentMemoryAddToBundle({ bundleId, entryIds });
        await refresh();
        return true;
      } catch (err) {
        console.error("[usePersistentMemory] Erreur d'ajout au bundle:", err);
        return false;
      }
    },
    [refresh]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // UTILS
  // ─────────────────────────────────────────────────────────────────────────

  const clearCache = useCallback(() => {
    persistentMemoryCache.entries.clear();
    persistentMemoryCache.summaries.clear();
    persistentMemoryCache.bundles.clear();
    persistentMemoryCache.lastFetch = null;

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
      return (await tauriClient.persistentMemoryExport()) as string;
    } catch (err) {
      console.error("[usePersistentMemory] Erreur d'export:", err);
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

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  // ─────────────────────────────────────────────────────────────────────────
  // VALEURS MÉMOÏSÉES
  // ─────────────────────────────────────────────────────────────────────────

  const sessionCount = useMemo(
    () => state.entries.filter(e => e.level === 'session').length,
    [state.entries]
  );

  const intermediateCount = useMemo(
    () => state.entries.filter(e => e.level === 'intermediate').length,
    [state.entries]
  );

  const longTermCount = useMemo(
    () => state.entries.filter(e => e.level === 'long_term').length,
    [state.entries]
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
  usedEntries: string[];
  isLoading: boolean;
} {
  const [context, setContext] = useState<string>('');
  const [usedEntries, setUsedEntries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setContext('');
      setUsedEntries([]);
      return;
    }

    const fetchContext = async () => {
      setIsLoading(true);
      try {
        const response = await tauriClient.persistentMemoryGetContext({
          modeId,
          query,
        }) as { context: string; usedEntries: string[] };
        setContext(response.context);
        setUsedEntries(response.usedEntries);
      } catch (err) {
        console.error('[usePersistentMemoryContext] Erreur:', err);
        setContext('');
        setUsedEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce de 300ms
    const timer = setTimeout(fetchContext, 300);
    return () => clearTimeout(timer);
  }, [modeId, query]);

  return { context, usedEntries, isLoading };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export default usePersistentMemory;
