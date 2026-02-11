/**
 * TITANE∞ v∞ — useIntrospection Hook
 *
 * Hook pour l'introspection de code et auto-fix
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import type {
  IntrospectionReport,
  AutoFixResult,
  IssueSeverity,
} from '../types/systemCenter.types';

export interface UseIntrospectionReturn {
  // State
  report: IntrospectionReport | null;
  isScanning: boolean;
  isFixing: boolean;
  error: string | null;

  // Filters
  severityFilter: IssueSeverity | 'all';
  setSeverityFilter: (severity: IssueSeverity | 'all') => void;

  // Actions
  runQuickScan: (projectPath: string) => Promise<void>;
  runFullScan: (projectPath: string) => Promise<void>;
  runAutoFix: (projectPath: string) => Promise<AutoFixResult | null>;
  clearReport: () => void;
}

export function useIntrospection(): UseIntrospectionReturn {
  const [report, setReport] = useState<IntrospectionReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all');

  const runQuickScan = useCallback(async (projectPath: string) => {
    setIsScanning(true);
    setError(null);

    try {
      const result = (await tauriClient.scIntrospectionQuickScan({
        projectPath,
      })) as IntrospectionReport;
      setReport(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Scan rapide échoué: ${message}`);
      console.error('[useIntrospection] Quick scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const runFullScan = useCallback(async (projectPath: string) => {
    setIsScanning(true);
    setError(null);

    try {
      const result = (await tauriClient.scIntrospectionFullScan({
        projectPath,
      })) as IntrospectionReport;
      setReport(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Scan complet échoué: ${message}`);
      console.error('[useIntrospection] Full scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const runAutoFix = useCallback(
    async (projectPath: string): Promise<AutoFixResult | null> => {
      setIsFixing(true);
      setError(null);

      try {
        const result = (await tauriClient.scIntrospectionAutoFix({
          projectPath,
        })) as AutoFixResult;

        // Re-scan after fix
        await runFullScan(projectPath);

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Auto-fix échoué: ${message}`);
        console.error('[useIntrospection] Auto-fix failed:', err);
        return null;
      } finally {
        setIsFixing(false);
      }
    },
    [runFullScan]
  );

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
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
