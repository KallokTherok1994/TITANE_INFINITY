/**
 * TITANE∞ v25.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.2 — USE MEMORY ENGINE (Pipeline Hook)
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

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Extract tags from content (keywords extraction)
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

  // ═══ REFRESH STATS ═══
  const refreshStats = useCallback(async () => {
    try {
      const memoryStats = await secureInvoke<MemoryStats>('memory_get_stats');
      setStats(memoryStats);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get stats');
      setError(error);
      logger.error('Stats error:', error);
    }
  }, []);

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
        const entry: MemoryEntry = {
          id: `memory_${type}_${Date.now()}`,
          content,
          type,
          timestamp: Date.now(),
          tags: extractTags(content),
          intentions: detectIntentions(content),
          emotions: analyzeEmotions(content),
          metadata,
        };

        await secureInvoke('memory_save_entry', {
          key: entry.id,
          value: JSON.stringify(entry),
        });

        // Refresh stats après save
        await refreshStats();

        return entry.id;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save memory');
        setError(error);
        logger.error('Save error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshStats]
  );

  // ═══ GET MEMORY CONTEXT ═══
  const getMemoryContext = useCallback(
    async (query: string, maxResults = 10): Promise<MemoryEntry[]> => {
      setIsLoading(true);
      setError(null);

      try {
        // Backend search (si disponible)
        try {
          const result = await secureInvoke<MemorySearchResult>('memory_search', {
            query,
            max_results: maxResults,
          });
          return result.entries;
        } catch {
          // Fallback: get all + filter locally
          const allKeys = await secureInvoke<string[]>('memory_get_all_keys');
          const memories: MemoryEntry[] = [];

          for (const key of allKeys.slice(0, maxResults)) {
            const value = await secureInvoke<string | null>('memory_get_entry', { key });
            if (value) {
              try {
                const entry: MemoryEntry = JSON.parse(value);
                if (
                  entry.content.toLowerCase().includes(query.toLowerCase()) ||
                  entry.tags.some(tag => tag.includes(query.toLowerCase()))
                ) {
                  memories.push(entry);
                }
              } catch {
                // Skip invalid entries
              }
            }
          }

          return memories;
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to search memory');
        setError(error);
        logger.error('Search error:', error);
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
      const value = await secureInvoke<string | null>('memory_get_entry', { key: id });
      if (!value) return null;

      const entry: MemoryEntry = JSON.parse(value);
      return entry;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get memory');
      setError(error);
      logger.error('Get error:', error);
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
        await secureInvoke('memory_delete_entry', { key: id });
        await refreshStats();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete memory');
        setError(error);
        logger.error('Delete error:', error);
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
        if (type) {
          // Clear specific type
          const allKeys = await secureInvoke<string[]>('memory_get_all_keys');
          for (const key of allKeys) {
            if (key.includes(`_${type}_`)) {
              await secureInvoke('memory_delete_entry', { key });
            }
          }
        } else {
          // Clear all
          await secureInvoke('memory_clear_all');
        }

        await refreshStats();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to clear memory');
        setError(error);
        logger.error('Clear error:', error);
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
      await secureInvoke('memory_compress');
      await refreshStats();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to compress memory');
      setError(error);
      logger.error('Compress error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  // ═══ AUTO-REFRESH STATS ═══
  useEffect(() => {
    refreshStats();

    // Refresh toutes les 30s
    const interval = setInterval(refreshStats, 30000);

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
