/**
 * TITANE∞ — useMetaEnergy hook
 * V32 Phase 10 — Métriques réelles MetaEnergy vers UI SingularityMonitor
 */
import { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';

interface MetaEnergyStateResponse {
  energy_level: number;
  max_capacity: number;
  normalized: number;
  fatigue_level: string;
  cognitive_multiplier: number;
  timestamp: number;
}

interface MetaEnergyDiagnosticsResponse {
  energy_level: number;
  fatigue_level: string;
  homeostasis_in_balance: boolean;
  homeostasis_deviation: number;
  history_entries: number;
  config_target_energy: number;
}

interface MetaEnergyData {
  state: MetaEnergyStateResponse | null;
  diagnostics: MetaEnergyDiagnosticsResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMetaEnergy(autoRefreshMs = 15_000): MetaEnergyData {
  const [state, setState] = useState<MetaEnergyStateResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<MetaEnergyDiagnosticsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stateResult, diagResult] = await Promise.all([
        secureInvoke<MetaEnergyStateResponse>('meta_energy_get_state'),
        secureInvoke<MetaEnergyDiagnosticsResponse>('meta_energy_get_diagnostics'),
      ]);
      setState(stateResult);
      setDiagnostics(diagResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'meta_energy IPC error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (autoRefreshMs > 0) {
      const id = setInterval(() => void refresh(), autoRefreshMs);
      return () => clearInterval(id);
    }
    return undefined;
  }, [refresh, autoRefreshMs]);

  return { state, diagnostics, isLoading, error, refresh };
}
