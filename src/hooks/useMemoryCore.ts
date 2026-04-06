/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - Memory Core Hook
// Compatibility bridge: now backed by persistent memory reads/writes for the
// active frontend path, while keeping the legacy hook surface stable.
import { useState, useCallback, useMemo } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { normalizePersistentMemoryReadResponse } from '@/services/memory/persistentMemory.normalize';
import type { MemoryEntry } from '../core/ARCHITECTURE_TYPES_v∞';

interface MemoryState {
  entries: MemoryEntry[];
  total: number;
  encrypted_count: number;
}

const ALL_PERSISTENT_LEVELS = ['session', 'intermediate', 'long_term'] as const;

/**
 * Normalize memory state with validation and type safety
 * @deprecated Use memoizedNormalizeMemoryState from useMemoryCore hook for v33.0.0 optimization
 */
const normalizeMemoryState = (
  state: Partial<MemoryState> | null | undefined
): MemoryState => {
  const rawEntries = Array.isArray(state?.entries) ? state.entries : [];
  const entries = rawEntries
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const candidate = item as Partial<MemoryEntry>;
      if (typeof candidate.id === 'string' && typeof candidate.content === 'string') {
        return item as MemoryEntry;
      }
      return null;
    })
    .filter((item): item is MemoryEntry => item !== null);
  const encryptedCount = entries.filter(item => {
    if (!item) return false;
    return Boolean(item.encrypted);
  }).length;

  return {
    entries,
    total: typeof state?.total === 'number' ? state.total : entries.length,
    encrypted_count:
      typeof state?.encrypted_count === 'number' ? state.encrypted_count : encryptedCount,
  };
};

const mapPersistentEntryToCoreEntry = (entry: Record<string, any>): MemoryEntry => ({
  id: typeof entry.id === 'string' ? entry.id : `memory-${Date.now()}`,
  content: typeof entry.content === 'string' ? entry.content : '',
  timestamp:
    typeof entry?.metadata?.createdAt === 'number'
      ? entry.metadata.createdAt
      : typeof entry?.metadata?.updatedAt === 'number'
        ? entry.metadata.updatedAt
        : Date.now(),
  encrypted: entry.level === 'long_term',
  tags: Array.isArray(entry.tags)
    ? entry.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
    : [],
  metadata:
    entry && typeof entry === 'object'
      ? {
          level: typeof entry.level === 'string' ? entry.level : 'session',
          topic: typeof entry.topic === 'string' ? entry.topic : 'general',
          contentType:
            typeof entry.contentType === 'string' ? entry.contentType : 'message',
        }
      : undefined,
});

export interface UseMemoryCoreReturn {
  entries: MemoryEntry[];
  loading: boolean;
  error: string | null;
  loadEntries: () => Promise<MemoryState>;
  saveEntry: (content: string) => Promise<void>;
  clearMemory: () => Promise<void>;
  getMemoryState: () => Promise<MemoryState>;
}

export const useMemoryCore = (): UseMemoryCoreReturn => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ═══ MEMOIZED NORMALIZATION (v33.0.0 Phase 2 optimization) ═══
  // Previously recalculated on every loadEntries/getMemoryState call
  // Now memoized to avoid redundant .map() + .filter() operations

  const memoizedNormalizeMemoryState = useCallback(
    (state: Partial<MemoryState> | null | undefined): MemoryState => {
      const rawEntries = Array.isArray(state?.entries) ? state.entries : [];
      const entries = rawEntries
        .map(item => {
          if (!item || typeof item !== 'object') {
            return null;
          }
          const candidate = item as Partial<MemoryEntry>;
          if (typeof candidate.id === 'string' && typeof candidate.content === 'string') {
            return item as MemoryEntry;
          }
          return null;
        })
        .filter((item): item is MemoryEntry => item !== null);
      const encryptedCount = entries.filter(item => {
        if (!item) return false;
        return Boolean(item.encrypted);
      }).length;

      return {
        entries,
        total: typeof state?.total === 'number' ? state.total : entries.length,
        encrypted_count:
          typeof state?.encrypted_count === 'number'
            ? state.encrypted_count
            : encryptedCount,
      };
    },
    []
  );

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = normalizePersistentMemoryReadResponse(
        await tauriClient.persistentMemoryRead({
          levels: [...ALL_PERSISTENT_LEVELS],
          currentMode: 'default',
          limit: 500,
          includeSummaries: false,
        })
      );
      const normalized = memoizedNormalizeMemoryState({
        entries: response.entries.map(entry =>
          mapPersistentEntryToCoreEntry(entry as Record<string, any>)
        ),
        total: response.totalCount,
        encrypted_count: response.entries.filter(entry => entry.level === 'long_term')
          .length,
      });
      setEntries(normalized.entries);
      return normalized;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load memory entries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [memoizedNormalizeMemoryState]);

  const saveEntry = useCallback(
    async (content: string) => {
      try {
        setLoading(true);
        setError(null);
        await tauriClient.persistentMemoryWriteEntry({
          level: 'session',
          contentType: 'message',
          content,
          topic: 'general',
          importance: 3,
          source: 'manual_save',
          tags: ['memory-core'],
          modeId: 'default',
        });
        await loadEntries();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save entry';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadEntries]
  );

  const clearMemory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = normalizePersistentMemoryReadResponse(
        await tauriClient.persistentMemoryRead({
          levels: [...ALL_PERSISTENT_LEVELS],
          currentMode: 'default',
          limit: 1000,
          includeSummaries: false,
        })
      );
      for (const entry of response.entries) {
        await tauriClient.persistentMemoryDeleteEntry({ entryId: entry.id });
      }
      setEntries([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear memory';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMemoryState = useCallback(async () => {
    try {
      const response = normalizePersistentMemoryReadResponse(
        await tauriClient.persistentMemoryRead({
          levels: [...ALL_PERSISTENT_LEVELS],
          currentMode: 'default',
          limit: 500,
          includeSummaries: false,
        })
      );
      const normalized = memoizedNormalizeMemoryState({
        entries: response.entries.map(entry =>
          mapPersistentEntryToCoreEntry(entry as Record<string, any>)
        ),
        total: response.totalCount,
        encrypted_count: response.entries.filter(entry => entry.level === 'long_term')
          .length,
      });
      setEntries(normalized.entries);
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get memory state';
      setError(message);
      throw err;
    }
  }, [memoizedNormalizeMemoryState]);

  return {
    entries,
    loading,
    error,
    loadEntries,
    saveEntry,
    clearMemory,
    getMemoryState,
  };
};
