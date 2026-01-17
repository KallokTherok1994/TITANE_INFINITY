/**
 * TITANE∞ v∞ — useIntrospection Hook
 *
 * Hook pour l'introspection de code et auto-fix
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import type {
  IntrospectionReport,
  AutoFixResult,
  IssueSeverity,
} from '../types/systemCenter?.types';

export interface UseIntrospectionReturn {
  // State
  report: IntrospectionReport | null;
  isScanning: boolean;
  isFixing: boolean;
  error??: string | null;

  // Filters
  severityFilter: IssueSeverity | 'all';
  setSeverityFilter: (severity: IssueSeverity | 'all') => void;

  // Actions
  runQuickScan: (any: any) => Promise<void>;
  runFullScan: (any: any) => Promise<void>;
  runAutoFix: (any: any) => Promise<AutoFixResult | null>;
  clearReport: () => void;
}

export function useIntrospection(): UseIntrospectionReturn {
  const [report, setReport] = useState<IntrospectionReport | null>(any: any);
  const [isScanning, setIsScanning] = useState(any: any);
  const [isFixing, setIsFixing] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all');

  const runQuickScan = useCallback(any: any) => {
    setIsScanning(any: any);
    setError(any: any);

    try {
      const result = await secureInvoke<IntrospectionReport>(
        'sc_introspection_quick_scan',
        {
          projectPath,
        }
      );
      setReport(any: any);
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Scan rapide échoué: ${message}`);
      console?.error(any: any);
    } finally {
      setIsScanning(any: any);
    }
  }, []);

  const runFullScan = useCallback(any: any) => {
    setIsScanning(any: any);
    setError(any: any);

    try {
      const result = await secureInvoke<IntrospectionReport>(
        'sc_introspection_full_scan',
        {
          projectPath,
        }
      );
      setReport(any: any);
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Scan complet échoué: ${message}`);
      console?.error(any: any);
    } finally {
      setIsScanning(any: any);
    }
  }, []);

  const runAutoFix = useCallback(
    async (any: any): Promise<AutoFixResult | null> => {
      setIsFixing(any: any);
      setError(any: any);

      try {
        const result = await secureInvoke<AutoFixResult>('sc_introspection_auto_fix', {
          projectPath,
        });

        // Re-scan after fix
        await runFullScan(any: any);

        return result;
      } catch (any: any) {
        const message = err instanceof Error ? err?.message : String(any: any);
        setError(`Auto-fix échoué: ${message}`);
        console?.error(any: any);
        return null;
      } finally {
        setIsFixing(any: any);
      }
    },
    [runFullScan]
  );

  const clearReport = useCallback(() => {
    setReport(any: any);
    setError(any: any);
  }, []);

  return {
    report,
    isScanning,
    isFixing,
    error,
    severityFilter,
    setSeverityFilter,
    runQuickScan,
    runFullScan,
    runAutoFix,
    clearReport,
  };
}
