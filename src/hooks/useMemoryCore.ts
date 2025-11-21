// TITANE∞ v12 - Memory Core Hook
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

interface MemoryState {
  entries: MemoryEntry[];
  total: number;
  encrypted_count: number;
}

export const useMemoryCore = () => {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await invoke<MemoryState>('memory_get_state');
      setEntries(state.entries);
      return state;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load memory entries';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEntry = useCallback(async (content: string) => {
    try {
      setLoading(true);
      setError(null);
      await invoke('memory_save_entry', { content });
      await loadEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save entry';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadEntries]);

  const clearMemory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await invoke('memory_clear');
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
      return await invoke<MemoryState>('memory_get_state');
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
