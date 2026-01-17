/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - Memory Core Hook
import { useState, useCallback } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { secureInvoke } from '@/lib/security';
import { memoryService } from '../services/api';
import type { MemoryEntry } from '../core/ARCHITECTURE_TYPES_v∞';

interface MemoryState {
  entries: MemoryEntry[];
  total: number;
  encrypted_count: number;
}

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

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await secureInvoke<Partial<MemoryState>>('memory_get_state');
      const normalized = normalizeMemoryState(state);
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
  }, []);

  const saveEntry = useCallback(
    async (content: string) => {
      try {
        setLoading(true);
        setError(null);
        // Note: memory_save_entry est legacy, utiliser memoryService.saveChatInteraction pour nouvelles interactions
        await memoryService.saveChatInteraction({
          userMessage: content,
          aiResponse: '',
          mode: 'manual',
          timestamp: new Date().toISOString(),
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
      // Note: memory_clear est legacy, pas de service équivalent - garder invoke direct
      await tauriClient.memoryClear();
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
      const state = await secureInvoke<Partial<MemoryState>>('memory_get_state');
      const normalized = normalizeMemoryState(state);
      setEntries(normalized.entries);
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get memory state';
      setError(message);
      throw err;
    }
  }, []);

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
