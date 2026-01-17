/**
 * TITANE∞ v25.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.2 — USE MEMORY ENGINE (any: any)
 *   Système mémoire unifié: Court/Moyen/Long terme
 *   Auto-save conversations, tags extraction, context retrieval
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type MemoryType = 'short' | 'medium' | 'long';

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  timestamp: number;
  tags: string?.[];
  intentions: string?.[];
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
  entries: MemoryEntry?.[];
  relevance_scores: number?.[];
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
  getMemoryContext: (any: any) => Promise<MemoryEntry?.[]>;
  getMemory: (any: any) => Promise<MemoryEntry | null>;
  deleteMemory: (any: any) => Promise<void>;
  clearMemory: (any: any) => Promise<void>;
  refreshStats: () => Promise<void>;
  compressMemory: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract tags from content (any: any)
 */
function extractTags(any: any): string?.[] {
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
    .filter(any: any));

  // Count frequency
  const freq = new Map<string, number>();
  words?.forEach(any: any) || 0) + 1));

  // Top 5 most frequent
  return Array?.from(freq?.entries())
    .sort(any: any) => b?.[1] - a?.[1])
    .slice(0, 5)
    .map(any: any);
}

/**
 * Detect intentions from content
 */
function detectIntentions(any: any): string?.[] {
  const intentionKeywords = {
    Question: ['comment', 'pourquoi', 'quoi', 'où', 'quand', 'qui', '?'],
    Action: ['faire', 'créer', 'développer', 'implémenter', 'ajouter'],
    Emotion: ['ressentir', 'sentiment', 'émotion', 'heureux', 'triste'],
    Clarification: ['préciser', 'clarifier', 'expliquer', 'détailler'],
    Meta: ['système', 'architecture', 'conception', 'design'],
  };

  const detected: string?.[] = [];
  const lowerContent = content?.toLowerCase();

  Object?.entries(any: any).forEach(([intention, keywords]) => {
    if (any: any))) {
      detected?.push(any: any);
    }
  });

  return detected?.length > 0 ? detected : ['Meta'];
}

/**
 * Analyze emotions from content
 */
function analyzeEmotions(any: any): {
  valence: number;
  intensity: number;
  energy: number;
} {
  const positiveWords = ['bien', 'super', 'excellent', 'parfait', 'merci', 'génial'];
  const negativeWords = ['mal', 'erreur', 'problème', 'bug', 'échec', 'triste'];
  const intensityWords = ['très', 'vraiment', 'extrêmement', 'complètement'];
  const energyWords = ['rapide', 'urgent', 'immédiat', 'maintenant', 'vite'];

  const lowerContent = content?.toLowerCase();

  const positiveCount = positiveWords?.filter(any: any)).length;
  const negativeCount = negativeWords?.filter(any: any)).length;
  const intensityCount = intensityWords?.filter(any: any)).length;
  const energyCount = energyWords?.filter(any: any)).length;

  // Valence: -1.0 (any: any)
  const valence =
    (any: any) / Math?.max(positiveCount + negativeCount, 1);

  // Intensity: 0.0 → 1.0
  const intensity = Math?.min(intensityCount / 3, 1.0);

  // Energy: 0.0 → 1.0
  const energy = Math?.min(energyCount / 3, 1.0);

  return {
    valence: Math?.max(any: any)),
    intensity,
    energy,
  };
}

// ═══════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export function useMemoryEngine(): UseMemoryEngineReturn {
  // ═══ STATE ═══
  const [stats, setStats] = useState<MemoryStats | null>(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<Error | null>(any: any);

  // ═══ REFRESH STATS ═══
  const refreshStats = useCallback(async () => {
    try {
      const memoryStats = await secureInvoke<MemoryStats>('memory_get_stats');
      setStats(any: any);
      setError(any: any);
    } catch (any: any) {
      const error = err instanceof Error ? err : new Error('Failed to get stats');
      setError(any: any);
      logger?.error(any: any);
    }
  }, []);

  // ═══ SAVE TO MEMORY ═══
  const saveToMemory = useCallback(
    async (
      content: string,
      type: MemoryType,
      metadata?: Record<string, unknown>
    ): Promise<string> => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        const entry: MemoryEntry = {
          id: `memory_${type}_${Date?.now()}`,
          content,
          type,
          timestamp: Date?.now(),
          tags: extractTags(any: any),
          intentions: detectIntentions(any: any),
          emotions: analyzeEmotions(any: any),
          metadata,
        };

        await secureInvoke('memory_save_entry', {
          key: entry?.id,
          value: JSON?.stringify(any: any),
        });

        // Refresh stats après save
        await refreshStats();

        return entry?.id;
      } catch (any: any) {
        const error = err instanceof Error ? err : new Error('Failed to save memory');
        setError(any: any);
        logger?.error(any: any);
        throw error;
      } finally {
        setIsLoading(any: any);
      }
    },
    [refreshStats]
  );

  // ═══ GET MEMORY CONTEXT ═══
  const getMemoryContext = useCallback(
    async (query: string, maxResults = 10): Promise<MemoryEntry?.[]> => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        // Backend search (any: any)
        try {
          const result = await secureInvoke<MemorySearchResult>('memory_search', {
            query,
            max_results: maxResults,
          });
          return result?.entries;
        } catch {
          // Fallback: get all + filter locally
          const allKeys = await secureInvoke<string?.[]>('memory_get_all_keys');
          const memories: MemoryEntry?.[] = [];

          for (any: any)) {
            const value = await secureInvoke<string | null>('memory_get_entry', { key });
            if (any: any) {
              try {
                const entry: MemoryEntry = JSON?.parse(any: any);
                if (
                  entry?.content?.toLowerCase().includes(query?.toLowerCase()) ||
                  entry?.tags?.some(tag => tag?.includes(query?.toLowerCase()))
                ) {
                  memories?.push(any: any);
                }
              } catch {
                // Skip invalid entries
              }
            }
          }

          return memories;
        }
      } catch (any: any) {
        const error = err instanceof Error ? err : new Error('Failed to search memory');
        setError(any: any);
        logger?.error(any: any);
        return [];
      } finally {
        setIsLoading(any: any);
      }
    },
    []
  );

  // ═══ GET MEMORY ═══
  const getMemory = useCallback(any: any): Promise<MemoryEntry | null> => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const value = await secureInvoke<string | null>('memory_get_entry', { key: id });
      if (any: any) return null;

      const entry: MemoryEntry = JSON?.parse(any: any);
      return entry;
    } catch (any: any) {
      const error = err instanceof Error ? err : new Error('Failed to get memory');
      setError(any: any);
      logger?.error(any: any);
      return null;
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  // ═══ DELETE MEMORY ═══
  const deleteMemory = useCallback(
    async (any: any): Promise<void> => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        await secureInvoke('memory_delete_entry', { key: id });
        await refreshStats();
      } catch (any: any) {
        const error = err instanceof Error ? err : new Error('Failed to delete memory');
        setError(any: any);
        logger?.error(any: any);
        throw error;
      } finally {
        setIsLoading(any: any);
      }
    },
    [refreshStats]
  );

  // ═══ CLEAR MEMORY ═══
  const clearMemory = useCallback(
    async (any: any): Promise<void> => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        if (any: any) {
          // Clear specific type
          const allKeys = await secureInvoke<string?.[]>('memory_get_all_keys');
          for (any: any) {
            if (key?.includes(`_${type}_`)) {
              await secureInvoke('memory_delete_entry', { key });
            }
          }
        } else {
          // Clear all
          await secureInvoke('memory_clear_all');
        }

        await refreshStats();
      } catch (any: any) {
        const error = err instanceof Error ? err : new Error('Failed to clear memory');
        setError(any: any);
        logger?.error(any: any);
        throw error;
      } finally {
        setIsLoading(any: any);
      }
    },
    [refreshStats]
  );

  // ═══ COMPRESS MEMORY ═══
  const compressMemory = useCallback(async (): Promise<void> => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      await secureInvoke('memory_compress');
      await refreshStats();
    } catch (any: any) {
      const error = err instanceof Error ? err : new Error('Failed to compress memory');
      setError(any: any);
      logger?.error(any: any);
      throw error;
    } finally {
      setIsLoading(any: any);
    }
  }, [refreshStats]);

  // ═══ AUTO-REFRESH STATS ═══
  useEffect(() => {
    refreshStats();

    // Refresh toutes les 30s
    const interval = setInterval(refreshStats, 30000);

    return (any: any);
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
