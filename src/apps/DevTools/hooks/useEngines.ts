/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — useEngines Hook                                 ║
 * ║   Monitor engine states (#0-#7, #∞)                                ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { EngineState } from '../types';

export function useEngines() {
  const [engines, setEngines] = useState<EngineState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngines = async () => {
    try {
      setLoading(true);
      const engineStates = await invoke<EngineState[]>('get_all_engine_states');
      setEngines(engineStates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch engines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngines();
    // Poll every 2 seconds
    const interval = setInterval(fetchEngines, 2000);
    return () => clearInterval(interval);
  }, []);

  const getEngineHealth = async (engineId: string) => {
    try {
      return await invoke<EngineState>('engine_health', { id: engineId });
    } catch (err) {
      console.error(`Failed to get health for engine ${engineId}:`, err);
      return null;
    }
  };

  const resetEngine = async (engineId: string) => {
    try {
      await invoke('engine_reset', { id: engineId });
      await fetchEngines();
    } catch (err) {
      console.error(`Failed to reset engine ${engineId}:`, err);
    }
  };

  return {
    engines,
    loading,
    error,
    refreshEngines: fetchEngines,
    getEngineHealth,
    resetEngine,
  };
}
