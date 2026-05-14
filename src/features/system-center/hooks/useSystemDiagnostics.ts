/**
 * TITANE∞ v∞ — useSystemDiagnostics Hook
 *
 * Hook pour les diagnostics système unifiés
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import type { SystemDiagnostics, OverallStatus } from '../types/systemCenter.types';

type IpcEnvelope<T> = {
  ok?: boolean;
  content?: T;
  error?: string | null;
};

type TauriFallbackResponse = {
  success?: boolean;
  fallback?: boolean;
  error?: unknown;
  timestamp?: unknown;
};

const isDiagnosticsShape = (value: unknown): value is SystemDiagnostics => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<SystemDiagnostics>;
  return Array.isArray(v.results) && typeof v.timestamp === 'number';
};

const isTauriFallbackResponse = (value: unknown): value is TauriFallbackResponse => {
  if (!value || typeof value !== 'object') return false;
  const fallback = value as TauriFallbackResponse;
  return fallback.fallback === true && fallback.success === false;
};

const getFallbackErrorMessage = (value: TauriFallbackResponse): string => {
  return typeof value.error === 'string' && value.error.trim().length > 0
    ? value.error
    : 'Transport Tauri indisponible';
};

const createFallbackDiagnostics = (value: TauriFallbackResponse): SystemDiagnostics => {
  return {
    timestamp: typeof value.timestamp === 'number' ? value.timestamp : Date.now(),
    overall_status: 'Degraded',
    total_duration_ms: 0,
    results: [
      {
        id: 'tauri-transport-fallback',
        title: 'Transport Tauri indisponible',
        status: 'Warning',
        message: getFallbackErrorMessage(value),
        duration_ms: 0,
        data: {
          fallback: true,
        },
      },
    ],
  };
};

const unwrapDiagnostics = (value: unknown): SystemDiagnostics => {
  if (isDiagnosticsShape(value)) return value;

  if (isTauriFallbackResponse(value)) {
    return createFallbackDiagnostics(value);
  }

  const envelope = value as IpcEnvelope<SystemDiagnostics>;
  if (envelope?.ok === true && isDiagnosticsShape(envelope.content)) {
    return envelope.content;
  }

  throw new Error('Format de diagnostic inattendu');
};

const unwrapStatus = (value: unknown): OverallStatus => {
  if (value === 'Healthy' || value === 'Degraded' || value === 'Critical') {
    return value;
  }

  if (isTauriFallbackResponse(value)) {
    return 'Degraded';
  }

  const envelope = value as IpcEnvelope<OverallStatus>;
  if (
    envelope?.ok === true &&
    (envelope.content === 'Healthy' ||
      envelope.content === 'Degraded' ||
      envelope.content === 'Critical')
  ) {
    return envelope.content;
  }

  throw new Error('Format de statut de diagnostic inattendu');
};

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
      const raw = await tauriClient.scRunQuickDiagnostics();
      const result = unwrapDiagnostics(raw);
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
      const raw = await tauriClient.scRunFullDiagnostics();
      const result = unwrapDiagnostics(raw);
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
      const raw = await tauriClient.scGetDiagnosticStatus();
      const result = unwrapStatus(raw);
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
