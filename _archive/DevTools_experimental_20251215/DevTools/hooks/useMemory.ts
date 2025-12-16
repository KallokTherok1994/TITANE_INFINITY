/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — useMemory Hook                                  ║
 * ║   Interact with UnifiedMemory (STM/MTM/LTM)                        ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { MemorySnapshot, MemoryNode } from '../types';

export function useMemory() {
  const [snapshot, setSnapshot] = useState<MemorySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    try {
      setLoading(true);
      const stm = await invoke<MemoryNode[]>('memory_get_stm');
      const mtm = await invoke<MemoryNode[]>('memory_get_mtm');
      const ltm = await invoke<MemoryNode[]>('memory_get_ltm');

      setSnapshot({
        stm_count: stm.length,
        mtm_count: mtm.length,
        ltm_count: ltm.length,
        stm_nodes: stm,
        mtm_nodes: mtm,
        ltm_nodes: ltm,
        total_nodes: stm.length + mtm.length + ltm.length,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  const searchMemory = async (query: string): Promise<MemoryNode[]> => {
    try {
      return await invoke<MemoryNode[]>('memory_search', { query });
    } catch (err) {
      console.error('Memory search failed:', err);
      return [];
    }
  };

  const promoteNode = async (nodeId: string) => {
    try {
      await invoke('memory_promote', { nodeId });
      await fetchSnapshot();
    } catch (err) {
      console.error('Failed to promote node:', err);
    }
  };

  const demoteNode = async (nodeId: string) => {
    try {
      await invoke('memory_demote', { nodeId });
      await fetchSnapshot();
    } catch (err) {
      console.error('Failed to demote node:', err);
    }
  };

  const deleteNode = async (nodeId: string) => {
    try {
      await invoke('memory_delete', { nodeId });
      await fetchSnapshot();
    } catch (err) {
      console.error('Failed to delete node:', err);
    }
  };

  return {
    snapshot,
    loading,
    error,
    refreshSnapshot: fetchSnapshot,
    searchMemory,
    promoteNode,
    demoteNode,
    deleteNode,
  };
}
