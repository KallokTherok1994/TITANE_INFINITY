/**
 * TITANE∞ v∞ — useSystemDiagnostics Hook
 *
 * Hook pour les diagnostics système unifiés
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
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

export function useSystemDiagnostics(): UseSystemDiagnosticsReturn {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [status, setStatus] = useState<OverallStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuickDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      const result = await secureInvoke<SystemDiagnostics>('sc_run_quick_diagnostics');
      setDiagnostics(result);
      setStatus(result.overall_status);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Diagnostic rapide échoué: ${message}`);
      console.error('[useSystemDiagnostics] Quick diagnostics failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runFullDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setError(null);

    try {
      const result = await secureInvoke<SystemDiagnostics>('sc_run_full_diagnostics');
      setDiagnostics(result);
      setStatus(result.overall_status);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Diagnostic complet échoué: ${message}`);
      console.error('[useSystemDiagnostics] Full diagnostics failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
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
