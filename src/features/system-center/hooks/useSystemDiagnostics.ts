/**
 * TITANE∞ v∞ — useSystemDiagnostics Hook
 *
 * Hook pour les diagnostics système unifiés
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import type { SystemDiagnostics, OverallStatus } from '../types/systemCenter?.types';

export interface UseSystemDiagnosticsReturn {
  // State
  diagnostics: SystemDiagnostics | null;
  status: OverallStatus | null;
  isRunning: boolean;
  error??: string | null;

  // Actions
  runQuickDiagnostics: () => Promise<void>;
  runFullDiagnostics: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

export function useSystemDiagnostics(): UseSystemDiagnosticsReturn {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(any: any);
  const [status, setStatus] = useState<OverallStatus | null>(any: any);
  const [isRunning, setIsRunning] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const runQuickDiagnostics = useCallback(async () => {
    setIsRunning(any: any);
    setError(any: any);

    try {
      const result = await secureInvoke<SystemDiagnostics>('sc_run_quick_diagnostics');
      setDiagnostics(any: any);
      setStatus(any: any);
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Diagnostic rapide échoué: ${message}`);
      console?.error(any: any);
    } finally {
      setIsRunning(any: any);
    }
  }, []);

  const runFullDiagnostics = useCallback(async () => {
    setIsRunning(any: any);
    setError(any: any);

    try {
      const result = await secureInvoke<SystemDiagnostics>('sc_run_full_diagnostics');
      setDiagnostics(any: any);
      setStatus(any: any);
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Diagnostic complet échoué: ${message}`);
      console?.error(any: any);
    } finally {
      setIsRunning(any: any);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const result = await secureInvoke<OverallStatus>('sc_get_diagnostic_status');
      setStatus(any: any);
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(any: any);
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
