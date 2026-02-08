/**
 * TITANE∞ v∞ — useSystemDiagnostics Hook
 *
 * Hook pour les diagnostics système unifiés
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import type { SystemDiagnostics, OverallStatus } from '../types/systemCenter.types';

export interface UseSystemDiagnosticsReturn {
  // State
  diagnostics: SystemDiagnostics | null;
  status: OverallStatus | null;
  isRunning: boolean;
  error: string | null;

  // Actions
  runQuickDiagnostics: () => Promise<void>;
  runFullDiagnostics: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

const isSystemDiagnostics = (value: unknown): value is SystemDiagnostics => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as SystemDiagnostics;
  return (
    typeof candidate.timestamp === 'number' &&
    typeof candidate.total_duration_ms === 'number' &&
    typeof candidate.overall_status === 'string' &&
    Array.isArray(candidate.results)
  );
};

const createFallbackDiagnostics = (): SystemDiagnostics => ({
  timestamp: Date.now(),
  results: [],
  overall_status: 'Degraded',
  total_duration_ms: 0,
});

export function useSystemDiagnostics(): UseSystemDiagnosticsReturn {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [status, setStatus] = useState<OverallStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuickDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    if (!isTauriRuntimeAvailable()) {
      setDiagnostics(createFallbackDiagnostics());
      setStatus('Degraded');
      setError('Diagnostics indisponibles en mode web (runtime Tauri absent).');
      setIsRunning(false);
      return;
    }

    try {
      const result = await secureInvoke<SystemDiagnostics>('sc_run_quick_diagnostics');
      if (!isSystemDiagnostics(result)) {
        setDiagnostics(null);
        setStatus(null);
        setError('Diagnostic rapide invalide (réponse inattendue).');
        return;
      }
      setDiagnostics(result);
      setStatus(result.overall_status);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Diagnostic rapide échoué: ${message}`);
      console.warn('[useSystemDiagnostics] Quick diagnostics failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runFullDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    if (!isTauriRuntimeAvailable()) {
      setDiagnostics(createFallbackDiagnostics());
      setStatus('Degraded');
      setError('Diagnostics indisponibles en mode web (runtime Tauri absent).');
      setIsRunning(false);
      return;
    }

    try {
      const result = await secureInvoke<SystemDiagnostics>('sc_run_full_diagnostics');
      if (!isSystemDiagnostics(result)) {
        setDiagnostics(null);
        setStatus(null);
        setError('Diagnostic complet invalide (réponse inattendue).');
        return;
      }
      setDiagnostics(result);
      setStatus(result.overall_status);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Diagnostic complet échoué: ${message}`);
      console.warn('[useSystemDiagnostics] Full diagnostics failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    if (!isTauriRuntimeAvailable()) {
      setStatus(null);
      return;
    }
    try {
      const result = await secureInvoke<OverallStatus>('sc_get_diagnostic_status');
      setStatus(result);
    } catch (err) {
      console.error('[useSystemDiagnostics] Status refresh failed:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    diagnostics,
    status,
    isRunning,
    error,
    runQuickDiagnostics,
    runFullDiagnostics,
    refreshStatus,
    clearError,
  };
}
