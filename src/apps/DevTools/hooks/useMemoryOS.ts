// TITANE∞ vΩ — DevTools Memory Inspector Hook
// Integration avec Memory OS + Vector Store

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

export interface MemoryEntry {
  id: string;
  content: string;
  tier: 'STM' | 'MTM' | 'LTM';
  importance: number;
  tags: string[];
  created_at: number;
  accessed_count: number;
  last_accessed: number;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface ClusterResult {
  clusters: Cluster[];
  total_items: number;
  silhouette_score: number;
}

export interface Cluster {
  id: number;
  centroid: number[];
  item_ids: string[];
  size: number;
}

export interface MemoryOSStats {
  stm_count: number;
  mtm_count: number;
  ltm_count: number;
  total_memories: number;
  vector_entries?: number;
  vector_dimension?: number;
}

export function useMemoryOS() {
  const [stats, setStats] = useState<MemoryOSStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch memory statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await invoke<MemoryOSStats>('memory_os_stats');
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Semantic search
  const semanticSearch = useCallback(async (query: string, k: number = 10): Promise<VectorSearchResult[]> => {
    try {
      const results = await invoke<VectorSearchResult[]>('memory_semantic_search', {
        query,
        k,
      });
      return results;
    } catch (err) {
      console.error('Semantic search error:', err);
      return [];
    }
  }, []);

  // Get memory by tier
  const getMemoriesByTier = useCallback(async (tier: 'STM' | 'MTM' | 'LTM', limit: number = 50): Promise<MemoryEntry[]> => {
    try {
      const results = await invoke<MemoryEntry[]>('memory_get_by_tier', {
        tier,
        limit,
      });
      return results;
    } catch (err) {
      console.error('Get memories error:', err);
      return [];
    }
  }, []);

  // Cluster memories
  const clusterMemories = useCallback(async (): Promise<ClusterResult | null> => {
    try {
      const result = await invoke<ClusterResult>('memory_cluster');
      return result;
    } catch (err) {
      console.error('Cluster error:', err);
      return null;
    }
  }, []);

  // Compress similar memories
  const compressSimilar = useCallback(async (threshold: number = 0.95): Promise<number> => {
    try {
      const count = await invoke<number>('memory_compress_similar', { threshold });
      return count;
    } catch (err) {
      console.error('Compress error:', err);
      return 0;
    }
  }, []);

  // Get vector for memory ID
  const getVector = useCallback(async (id: string): Promise<number[] | null> => {
    try {
      const vector = await invoke<number[]>('memory_get_vector', { id });
      return vector;
    } catch (err) {
      console.error('Get vector error:', err);
      return null;
    }
  }, []);

  // Listen to memory promotion events
  useEffect(() => {
    const unlisten = listen<{ memory_id: string; from_tier: string; to_tier: string; reason: string }>(
      'memory_promotion',
      (event) => {
        console.log('Memory promoted:', event.payload);
        // Refresh stats
        fetchStats();
      }
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [fetchStats]);

  // Auto-refresh stats
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Every 5s

    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    semanticSearch,
    getMemoriesByTier,
    clusterMemories,
    compressSimilar,
    getVector,
  };
}
