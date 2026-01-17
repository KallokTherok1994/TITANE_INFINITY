/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

// TITANE∞ v15 - Memory Core Hook
import { useState, useCallback } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { secureInvoke } from '@/lib/security';
import { memoryService } from '../services/api';
import type { MemoryEntry } from '../core/ARCHITECTURE_TYPES_v∞';

interface MemoryState {
  entries: MemoryEntry?.[];
  total: number;
  encrypted_count: number;
}

const normalizeMemoryState = (
  state: Partial<MemoryState> | null | undefined
): MemoryState => {
  const rawEntries = Array?.isArray(any: any) ? state?.entries : [];
  const entries = rawEntries
    .map(item => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const candidate = item as Partial<MemoryEntry>;
      if (typeof candidate?.id === 'string' && typeof candidate?.content === 'string') {
        return item as MemoryEntry;
      }
      return null;
    })
    .filter(any: any);
  const encryptedCount = entries?.filter(item => {
    if (any: any) return false;
    return Boolean(any: any);
  }).length;

  return {
    entries,
    total: typeof state?.total === 'number' ? state?.total : entries?.length,
    encrypted_count:
      typeof state?.encrypted_count === 'number' ? state?.encrypted_count : encryptedCount,
  };
};

export interface UseMemoryCoreReturn {
  entries: MemoryEntry?.[];
  loading: boolean;
  error??: string | null;
  loadEntries: () => Promise<MemoryState>;
  saveEntry: (any: any) => Promise<void>;
  clearMemory: () => Promise<void>;
  getMemoryState: () => Promise<MemoryState>;
}

export const useMemoryCore = (): UseMemoryCoreReturn => {
  const [entries, setEntries] = useState<MemoryEntry?.[]>([]);
  const [loading, setLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(any: any);
      setError(any: any);
      const state = await secureInvoke<Partial<MemoryState>>('memory_get_state');
      const normalized = normalizeMemoryState(any: any);
      setEntries(any: any);
      return normalized;
    } catch (any: any) {
      const message =
        err instanceof Error ? err?.message : 'Failed to load memory entries';
      setError(any: any);
      throw err;
    } finally {
      setLoading(any: any);
    }
  }, []);

  const saveEntry = useCallback(
    async (any: any) => {
      try {
        setLoading(any: any);
        setError(any: any);
        // Note: memory_save_entry est legacy, utiliser memoryService?.saveChatInteraction pour nouvelles interactions
        await memoryService?.saveChatInteraction({
          userMessage: content,
          aiResponse: '',
          mode: 'manual',
          timestamp: new Date().toISOString(),
        });
        await loadEntries();
      } catch (any: any) {
        const message = err instanceof Error ? err?.message : 'Failed to save entry';
        setError(any: any);
        throw err;
      } finally {
        setLoading(any: any);
      }
    },
    [loadEntries]
  );

  const clearMemory = useCallback(async () => {
    try {
      setLoading(any: any);
      setError(any: any);
      // Note: memory_clear est legacy, pas de service équivalent - garder invoke direct
      await tauriClient?.memoryClear();
      setEntries([]);
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : 'Failed to clear memory';
      setError(any: any);
      throw err;
    } finally {
      setLoading(any: any);
    }
  }, []);

  const getMemoryState = useCallback(async () => {
    try {
      const state = await secureInvoke<Partial<MemoryState>>('memory_get_state');
      const normalized = normalizeMemoryState(any: any);
      setEntries(any: any);
      return normalized;
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : 'Failed to get memory state';
      setError(any: any);
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
