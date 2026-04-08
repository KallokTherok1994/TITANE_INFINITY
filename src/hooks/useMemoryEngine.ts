/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — USE MEMORY ENGINE (Pipeline Hook)
 *   Système mémoire unifié: Court/Moyen/Long terme
 *   Auto-save conversations, tags extraction, context retrieval
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import type {
  MemoryContentType as PersistentMemoryContentType,
  MemoryEntry as PersistentMemoryEntry,
  MemoryLevel as PersistentMemoryLevel,
  MemoryStats as PersistentMemoryStats,
} from '@/services/memory/persistentMemory.config';
import {
  normalizePersistentMemoryReadResponse,
  normalizePersistentMemoryStats,
} from '@/services/memory/persistentMemory.normalize';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type MemoryType = 'short' | 'medium' | 'long';

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  timestamp: number;
  tags: string[];
  intentions: string[];
  emotions: {
    valence: number;
    intensity: number;
    energy: number;
  };
  metadata?: Record<string, unknown>;
}

export interface MemoryStats {
  total_entries: number;
  short_term: number;
  medium_term: number;
  long_term: number;
  total_size_bytes: number;
  last_compression: number | null;
  health_score: number;
}

export interface MemorySearchResult {
  entries: MemoryEntry[];
  relevance_scores: number[];
  total_found: number;
}

export interface UseMemoryEngineReturn {
  // État
  stats: MemoryStats | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  saveToMemory: (
    content: string,
    type: MemoryType,
    metadata?: Record<string, unknown>
  ) => Promise<string>; // Retourne ID
  getMemoryContext: (query: string, maxResults?: number) => Promise<MemoryEntry[]>;
  getMemory: (id: string) => Promise<MemoryEntry | null>;
  deleteMemory: (id: string) => Promise<void>;
  clearMemory: (type?: MemoryType) => Promise<void>;
  refreshStats: () => Promise<void>;
  compressMemory: () => Promise<void>;
}

const DEFAULT_MEMORY_MODE = 'default';
const ALL_PERSISTENT_LEVELS: PersistentMemoryLevel[] = [
  'session',
  'intermediate',
  'long_term',
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toPersistentLevel(type: MemoryType): PersistentMemoryLevel {
  switch (type) {
    case 'short':
      return 'session';
    case 'medium':
      return 'intermediate';
    case 'long':
      return 'long_term';
  }
}

function toLegacyType(level: PersistentMemoryLevel): MemoryType {
  switch (level) {
    case 'session':
      return 'short';
    case 'intermediate':
      return 'medium';
    case 'long_term':
      return 'long';
  }
}

function toPersistentContentType(type: MemoryType): PersistentMemoryContentType {
  switch (type) {
    case 'short':
      return 'message';
    case 'medium':
      return 'summary';
    case 'long':
      return 'knowledge';
  }
}

function deriveLegacyHealthScore(stats: PersistentMemoryStats): number {
  const baseScore =
    stats.health.status === 'healthy'
      ? 0.95
      : stats.health.status === 'degraded'
        ? 0.65
        : stats.health.status === 'critical'
          ? 0.3
          : 0.5;

  const corruptionPenalty = Math.min(0.3, stats.health.corruptedFiles * 0.1);
  const diskPenalty =
    stats.health.diskSpacePercent >= 95
      ? 0.2
      : stats.health.diskSpacePercent >= 85
        ? 0.1
        : 0;

  return clamp(baseScore - corruptionPenalty - diskPenalty, 0, 1);
}

function toLegacyStats(stats: PersistentMemoryStats): MemoryStats {
  const shortTerm = stats.countByLevel.session ?? 0;
  const mediumTerm = stats.countByLevel.intermediate ?? 0;
  const longTerm = stats.countByLevel.long_term ?? 0;

  return {
    total_entries: shortTerm + mediumTerm + longTerm,
    short_term: shortTerm,
    medium_term: mediumTerm,
    long_term: longTerm,
    total_size_bytes: stats.totalSize,
    last_compression: stats.health.lastIntegrityCheck || null,
    health_score: deriveLegacyHealthScore(stats),
  };
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (DEPRECATED - see useCallback in hook for v33.0.0)
// ═══════════════════════════════════════════════════════════════════
// These functions are kept for backward compatibility but are no longer
// used directly. Instead, memoized versions are created in useMemoryEngine
// using useCallback to prevent redundant computations on every call.

/**
 * Extract tags from content (keywords extraction)
 * @deprecated Use memoizedExtractTags from useMemoryEngine hook instead
 */
function extractTags(content: string): string[] {
  // Remove common words
  const stopWords = new Set([
    'le',
    'la',
    'les',
    'un',
    'une',
    'des',
    'et',
    'ou',
    'mais',
    'donc',
    'car',
    'de',
    'du',
    'à',
    'au',
    'en',
    'pour',
    'par',
    'sur',
    'dans',
  ]);

  const words = content
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Count frequency
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));

  // Top 5 most frequent
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Detect intentions from content
 * @deprecated Use memoizedDetectIntentions from useMemoryEngine hook instead
 */
function detectIntentions(content: string): string[] {
  const intentionKeywords = {
    Question: ['comment', 'pourquoi', 'quoi', 'où', 'quand', 'qui', '?'],
    Action: ['faire', 'créer', 'développer', 'implémenter', 'ajouter'],
    Emotion: ['ressentir', 'sentiment', 'émotion', 'heureux', 'triste'],
    Clarification: ['préciser', 'clarifier', 'expliquer', 'détailler'],
    Meta: ['système', 'architecture', 'conception', 'design'],
  };

  const detected: string[] = [];
  const lowerContent = content.toLowerCase();

  Object.entries(intentionKeywords).forEach(([intention, keywords]) => {
    if (keywords.some(kw => lowerContent.includes(kw))) {
      detected.push(intention);
    }
  });

  return detected.length > 0 ? detected : ['Meta'];
}

/**
 * Analyze emotions from content
 * @deprecated Use memoizedAnalyzeEmotions from useMemoryEngine hook instead
 */
function analyzeEmotions(content: string): {
  valence: number;
  intensity: number;
  energy: number;
} {
  const positiveWords = ['bien', 'super', 'excellent', 'parfait', 'merci', 'génial'];
  const negativeWords = ['mal', 'erreur', 'problème', 'bug', 'échec', 'triste'];
  const intensityWords = ['très', 'vraiment', 'extrêmement', 'complètement'];
  const energyWords = ['rapide', 'urgent', 'immédiat', 'maintenant', 'vite'];

  const lowerContent = content.toLowerCase();

  const positiveCount = positiveWords.filter(w => lowerContent.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length;
  const intensityCount = intensityWords.filter(w => lowerContent.includes(w)).length;
  const energyCount = energyWords.filter(w => lowerContent.includes(w)).length;

  // Valence: -1.0 (négatif) → 1.0 (positif)
  const valence =
    (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);

  // Intensity: 0.0 → 1.0
  const intensity = Math.min(intensityCount / 3, 1.0);

  // Energy: 0.0 → 1.0
  const energy = Math.min(energyCount / 3, 1.0);

  return {
    valence: Math.max(-1, Math.min(1, valence)),
    intensity,
    energy,
  };
}

// ═══════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export function useMemoryEngine(): UseMemoryEngineReturn {
  // ═══ STATE ═══
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const statsRefreshPromiseRef = useRef<Promise<void> | null>(null);

  // ═══ MEMOIZED ANALYSIS FUNCTIONS (v33.0.0 optimization) ═══
  // These were previously recalculated on every saveToMemory call
  // Now they're memoized to avoid redundant computations

  const memoizedExtractTags = useCallback((content: string): string[] => {
    const stopWords = new Set([
      'le',
      'la',
      'les',
      'un',
      'une',
      'des',
      'et',
      'ou',
      'mais',
      'donc',
      'car',
      'de',
      'du',
      'à',
      'au',
      'en',
      'pour',
      'par',
      'sur',
      'dans',
    ]);

    const words = content
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    const freq = new Map<string, number>();
    words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }, []);

  const memoizedDetectIntentions = useCallback((content: string): string[] => {
    const intentionKeywords = {
      Question: ['comment', 'pourquoi', 'quoi', 'où', 'quand', 'qui', '?'],
      Action: ['faire', 'créer', 'développer', 'implémenter', 'ajouter'],
      Emotion: ['ressentir', 'sentiment', 'émotion', 'heureux', 'triste'],
      Clarification: ['préciser', 'clarifier', 'expliquer', 'détailler'],
      Meta: ['système', 'architecture', 'conception', 'design'],
    };

    const detected: string[] = [];
    const lowerContent = content.toLowerCase();

    Object.entries(intentionKeywords).forEach(([intention, keywords]) => {
      if (keywords.some(kw => lowerContent.includes(kw))) {
        detected.push(intention);
      }
    });

    return detected.length > 0 ? detected : ['Meta'];
  }, []);

  const memoizedAnalyzeEmotions = useCallback(
    (
      content: string
    ): {
      valence: number;
      intensity: number;
      energy: number;
    } => {
      const positiveWords = ['bien', 'super', 'excellent', 'parfait', 'merci', 'génial'];
      const negativeWords = ['mal', 'erreur', 'problème', 'bug', 'échec', 'triste'];
      const intensityWords = ['très', 'vraiment', 'extrêmement', 'complètement'];
      const energyWords = ['rapide', 'urgent', 'immédiat', 'maintenant', 'vite'];

      const lowerContent = content.toLowerCase();

      const positiveCount = positiveWords.filter(w => lowerContent.includes(w)).length;
      const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length;
      const intensityCount = intensityWords.filter(w => lowerContent.includes(w)).length;
      const energyCount = energyWords.filter(w => lowerContent.includes(w)).length;

      const valence =
        (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);

      const intensity = Math.min(intensityCount / 3, 1.0);
      const energy = Math.min(energyCount / 3, 1.0);

      return {
        valence: Math.max(-1, Math.min(1, valence)),
        intensity,
        energy,
      };
    },
    []
  );

  const mapPersistentEntryToLegacy = useCallback(
    (entry: PersistentMemoryEntry): MemoryEntry => ({
      id: entry.id,
      content: entry.content,
      type: toLegacyType(entry.level),
      timestamp: entry.metadata?.createdAt ?? entry.metadata?.updatedAt ?? Date.now(),
      tags: entry.tags ?? [],
      intentions: memoizedDetectIntentions(entry.content),
      emotions: memoizedAnalyzeEmotions(entry.content),
      metadata: {
        level: entry.level,
        topic: entry.topic,
        contentType: entry.contentType,
        importance: entry.importance,
        status: 'status' in entry ? entry.status : undefined,
        title: 'title' in entry ? entry.title : undefined,
        persistentMetadata: entry.metadata,
      },
    }),
    [memoizedAnalyzeEmotions, memoizedDetectIntentions]
  );

  // ═══ REFRESH STATS ═══
  const runRefreshStats = useCallback(async (force = false): Promise<void> => {
    if (statsRefreshPromiseRef.current) {
      if (!force) {
        return statsRefreshPromiseRef.current;
      }

      await statsRefreshPromiseRef.current;
    }

    let request: Promise<void> | null = null;

    request = (async () => {
      try {
        const persistentStats = normalizePersistentMemoryStats(
          await tauriClient.persistentMemoryGetStats()
        );

        if (mountedRef.current) {
          setStats(toLegacyStats(persistentStats));
          setError(null);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get stats');
        if (mountedRef.current) {
          setError(error);
        }
        console.error('[useMemoryEngine] Stats error:', error);
      } finally {
        if (statsRefreshPromiseRef.current === request) {
          statsRefreshPromiseRef.current = null;
        }
      }
    })();

    statsRefreshPromiseRef.current = request;
    return request;
  }, []);

  const refreshStats = useCallback(async () => {
    await runRefreshStats(false);
  }, [runRefreshStats]);

  // ═══ SAVE TO MEMORY ═══
  const saveToMemory = useCallback(
    async (
      content: string,
      type: MemoryType,
      metadata?: Record<string, unknown>
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const id = await tauriClient.persistentMemoryWriteEntry({
          content,
          level: toPersistentLevel(type),
          topic:
            metadata?.topic === 'coding' ||
            metadata?.topic === 'project' ||
            metadata?.topic === 'personal' ||
            metadata?.topic === 'technical' ||
            metadata?.topic === 'creative' ||
            metadata?.topic === 'learning' ||
            metadata?.topic === 'decisions' ||
            metadata?.topic === 'preferences' ||
            metadata?.topic === 'automation' ||
            metadata?.topic === 'system'
              ? metadata.topic
              : metadata?.source === 'singularity' || metadata?.source === 'system'
                ? 'system'
                : 'general',
          importance:
            typeof metadata?.importance === 'number' &&
            metadata.importance >= 1 &&
            metadata.importance <= 5
              ? metadata.importance
              : 3,
          contentType:
            metadata?.contentType === 'message' ||
            metadata?.contentType === 'summary' ||
            metadata?.contentType === 'knowledge' ||
            metadata?.contentType === 'preference' ||
            metadata?.contentType === 'project_context' ||
            metadata?.contentType === 'code_snippet' ||
            metadata?.contentType === 'decision' ||
            metadata?.contentType === 'reference' ||
            metadata?.contentType === 'identity' ||
            metadata?.contentType === 'automation_result' ||
            metadata?.contentType === 'milestone'
              ? metadata.contentType
              : toPersistentContentType(type),
          tags: Array.from(
            new Set([
              ...memoizedExtractTags(content),
              ...(Array.isArray(metadata?.tags)
                ? metadata.tags.filter((tag): tag is string => typeof tag === 'string')
                : []),
            ])
          ),
          title: typeof metadata?.title === 'string' ? metadata.title : undefined,
          projectId:
            typeof metadata?.projectId === 'string' ? metadata.projectId : undefined,
          modeId:
            typeof metadata?.modeId === 'string' ? metadata.modeId : DEFAULT_MEMORY_MODE,
        });

        // Refresh stats après save
        await runRefreshStats(true);

        return typeof id === 'string' && id.length > 0
          ? id
          : `memory_${type}_${Date.now()}`;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save memory');
        setError(error);
        console.error('[useMemoryEngine] Save error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [memoizedExtractTags, memoizedDetectIntentions, memoizedAnalyzeEmotions, refreshStats]
  );

  // ═══ GET MEMORY CONTEXT ═══
  const getMemoryContext = useCallback(
    async (query: string, maxResults = 10): Promise<MemoryEntry[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = normalizePersistentMemoryReadResponse(
          await tauriClient.persistentMemoryRead({
            levels: ALL_PERSISTENT_LEVELS,
            currentMode: DEFAULT_MEMORY_MODE,
            query,
            limit: maxResults,
            includeSummaries: false,
          })
        );
        return result.entries.map(mapPersistentEntryToLegacy).slice(0, maxResults);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to search memory');
        setError(error);
        console.error('[useMemoryEngine] Search error:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ═══ GET MEMORY ═══
  const getMemory = useCallback(async (id: string): Promise<MemoryEntry | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = normalizePersistentMemoryReadResponse(
        await tauriClient.persistentMemoryRead({
          levels: ALL_PERSISTENT_LEVELS,
          currentMode: DEFAULT_MEMORY_MODE,
          limit: 500,
          includeSummaries: false,
        })
      );

      const entry = response.entries.find(candidate => candidate.id === id);
      return entry ? mapPersistentEntryToLegacy(entry) : null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get memory');
      setError(error);
      console.error('[useMemoryEngine] Get error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ═══ DELETE MEMORY ═══
  const deleteMemory = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await tauriClient.persistentMemoryDeleteEntry({ entryId: id });
        await runRefreshStats(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete memory');
        setError(error);
        console.error('[useMemoryEngine] Delete error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshStats]
  );

  // ═══ CLEAR MEMORY ═══
  const clearMemory = useCallback(
    async (type?: MemoryType): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = normalizePersistentMemoryReadResponse(
          await tauriClient.persistentMemoryRead({
            levels: type ? [toPersistentLevel(type)] : ALL_PERSISTENT_LEVELS,
            currentMode: DEFAULT_MEMORY_MODE,
            limit: 1000,
            includeSummaries: false,
          })
        );

        for (const entry of response.entries) {
          await tauriClient.persistentMemoryDeleteEntry({ entryId: entry.id });
        }

        await runRefreshStats(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to clear memory');
        setError(error);
        console.error('[useMemoryEngine] Clear error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshStats]
  );

  // ═══ COMPRESS MEMORY ═══
  const compressMemory = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      throw new Error(
        'Persistent memory compression is not available through the legacy memory evolution engine.'
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to compress memory');
      setError(error);
      console.error('[useMemoryEngine] Compress error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      statsRefreshPromiseRef.current = null;
    };
  }, []);

  // ═══ AUTO-REFRESH STATS ═══
  useEffect(() => {
    void refreshStats();

    // Refresh toutes les 30s
    const interval = setInterval(() => {
      void refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshStats]);

  // ═══ RETURN ═══
  return {
    stats,
    isLoading,
    error,
    saveToMemory,
    getMemoryContext,
    getMemory,
    deleteMemory,
    clearMemory,
    refreshStats,
    compressMemory,
  };
}

export default useMemoryEngine;
