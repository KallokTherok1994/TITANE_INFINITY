/**
 * TITANE∞ v21 — useSystemDiagnostics Hook (FIXED VERSION)
 *
 * Hook pour les diagnostics système unifiés avec commandes whitelist
 *
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🔥 VERSION CORRIGÉE v21 - REMPLACE LES COMMANDES NON AUTORISÉES
 */

import { useState, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import {
  formatUserError,
  sanitizeErrorForUser,
  generateErrorId,
} from '../utils/errorMessages';
import type {
  SystemDiagnostics,
  OverallStatus,
  DiagnosticResult,
} from '../types/systemCenter.types';

export interface UseSystemDiagnosticsReturn {
  // State
  diagnostics: SystemDiagnostics | null;
  status: OverallStatus | null;
  isRunning: boolean;
  error: string | null;
  errorDetails: {
    userMessage: string;
    technicalDetails: string;
    suggestions: string[];
  } | null;

  // Actions
  runQuickDiagnostics: () => Promise<void>;
  runFullDiagnostics: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

/**
 * Compose un objet DiagnosticResult depuis les données brutes
 */
function createDiagnosticResult(
  id: string,
  title: string,
  data: unknown,
  isHealthy: boolean = true
): DiagnosticResult {
  return {
    id,
    title,
    status: isHealthy ? 'Success' : 'Warning',
    message: isHealthy ? `${title} : Fonctionnel` : `${title} : Dégradé`,
    data,
    duration_ms: 0,
  };
}

/**
 * Hook de diagnostics système avec commandes sécurisées
 */
export function useSystemDiagnostics(): UseSystemDiagnosticsReturn {
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [status, setStatus] = useState<OverallStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    userMessage: string;
    technicalDetails: string;
    suggestions: string[];
  } | null>(null);

  /**
   * Diagnostic rapide : santé système de base
   * ✅ UTILISE UNIQUEMENT DES COMMANDES WHITELIST
   */
  const runQuickDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setErrorDetails(null);

    const startTime = performance.now();
    const results: DiagnosticResult[] = [];

    try {
      // ═══════════════════════════════════════════════════════════════
      // 1. Santé système globale (get_system_health - WHITELIST ✅)
      // ═══════════════════════════════════════════════════════════════
      try {
        const healthResult = await secureInvoke<{
          healthy: boolean;
          status: string;
          issues?: string[];
        }>('get_system_health');

        results.push(
          createDiagnosticResult(
            'system-health',
            'Santé Système',
            healthResult,
            healthResult.healthy
          )
        );
      } catch (err) {
        results.push({
          id: 'system-health',
          title: 'Santé Système',
          status: 'Error',
          message: 'Impossible de vérifier la santé système',
          data: null,
          duration_ms: 0,
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // 2. Santé des modules (get_module_health - WHITELIST ✅)
      // ═══════════════════════════════════════════════════════════════
      try {
        const moduleResult = await secureInvoke<{
          all_healthy: boolean;
          healthy_count: number;
          total_count: number;
          unhealthy_modules?: string[];
        }>('get_module_health');

        results.push(
          createDiagnosticResult(
            'modules-health',
            'Santé Modules',
            moduleResult,
            moduleResult.all_healthy
          )
        );
      } catch (err) {
        results.push({
          id: 'modules-health',
          title: 'Santé Modules',
          status: 'Skipped',
          message: 'Diagnostic des modules non disponible',
          data: null,
          duration_ms: 0,
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // 3. Métriques système (get_helios_metrics - WHITELIST ✅)
      // ═══════════════════════════════════════════════════════════════
      try {
        const metricsResult =
          await secureInvoke<Record<string, unknown>>('get_helios_metrics');

        results.push(
          createDiagnosticResult(
            'system-metrics',
            'Métriques Système',
            metricsResult,
            true
          )
        );
      } catch (err) {
        results.push({
          id: 'system-metrics',
          title: 'Métriques Système',
          status: 'Skipped',
          message: 'Métriques non disponibles',
          data: null,
          duration_ms: 0,
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // Composer le résultat final
      // ═══════════════════════════════════════════════════════════════
      const endTime = performance.now();
      const totalDuration = Math.round(endTime - startTime);

      // Déterminer le statut global
      const hasErrors = results.some(r => r.status === 'Error');
      const hasWarnings = results.some(r => r.status === 'Warning');
      const overallStatus: OverallStatus = hasErrors
        ? 'Critical'
        : hasWarnings
          ? 'Degraded'
          : 'Healthy';

      const diagnosticsResult: SystemDiagnostics = {
        timestamp: Date.now(),
        overall_status: overallStatus,
        results,
        total_duration_ms: totalDuration,
      };

      setDiagnostics(diagnosticsResult);
      setStatus(overallStatus);
    } catch (err) {
      // Formater l'erreur pour l'utilisateur
      const formatted = formatUserError(err);
      const userMessage = sanitizeErrorForUser(formatted.userMessage);

      setError(userMessage);
      setErrorDetails({
        userMessage: formatted.userMessage,
        technicalDetails: formatted.technicalDetails,
        suggestions: formatted.suggestions,
      });

      console.error('[useSystemDiagnostics] Quick diagnostics failed:', err);
      console.error('[useSystemDiagnostics] Error ID:', generateErrorId(err));
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * Diagnostic complet : agrégation de multiples checks
   * ✅ UTILISE UNIQUEMENT DES COMMANDES WHITELIST
   */
  const runFullDiagnostics = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setErrorDetails(null);

    const startTime = performance.now();
    const results: DiagnosticResult[] = [];

    try {
      // ═══════════════════════════════════════════════════════════════
      // 1. Tous les checks du diagnostic rapide
      // ═══════════════════════════════════════════════════════════════
      const quickChecks = [
        { cmd: 'get_system_health', id: 'system-health', title: 'Santé Système' },
        { cmd: 'get_module_health', id: 'modules-health', title: 'Santé Modules' },
        { cmd: 'get_helios_metrics', id: 'system-metrics', title: 'Métriques Système' },
      ];

      for (const check of quickChecks) {
        try {
          const result = await secureInvoke<Record<string, unknown>>(check.cmd);
          results.push(createDiagnosticResult(check.id, check.title, result, true));
        } catch (err) {
          results.push({
            id: check.id,
            title: check.title,
            status: 'Error',
            message: `Impossible de vérifier ${check.title.toLowerCase()}`,
            data: null,
            duration_ms: 0,
          });
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // 2. Checks additionnels pour diagnostic complet
      // ═══════════════════════════════════════════════════════════════
      const fullChecks = [
        { cmd: 'get_singularity_state', id: 'singularity', title: 'État Singularité' },
        {
          cmd: 'engines_monitoring_get_health',
          id: 'monitoring',
          title: 'Monitoring Engines',
        },
        {
          cmd: 'engines_monitoring_get_metrics',
          id: 'engine-metrics',
          title: 'Métriques Engines',
        },
        { cmd: 'get_system_state', id: 'system-state', title: 'État Système' },
      ];

      for (const check of fullChecks) {
        try {
          const result = await secureInvoke<Record<string, unknown>>(check.cmd);
          results.push(createDiagnosticResult(check.id, check.title, result, true));
        } catch (err) {
          results.push({
            id: check.id,
            title: check.title,
            status: 'Skipped',
            message: `${check.title} non disponible`,
            data: null,
            duration_ms: 0,
          });
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // 3. QA & Tests (si disponible)
      // ═══════════════════════════════════════════════════════════════
      try {
        const qaResult = await secureInvoke<Record<string, unknown>>('qa_run_all');
        results.push(createDiagnosticResult('qa-tests', 'Tests QA', qaResult, true));
      } catch (err) {
        results.push({
          id: 'qa-tests',
          title: 'Tests QA',
          status: 'Skipped',
          message: 'Tests QA non disponibles',
          data: null,
          duration_ms: 0,
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // Composer le résultat final
      // ═══════════════════════════════════════════════════════════════
      const endTime = performance.now();
      const totalDuration = Math.round(endTime - startTime);

      const hasErrors = results.some(r => r.status === 'Error');
      const hasWarnings = results.some(r => r.status === 'Warning');
      const overallStatus: OverallStatus = hasErrors
        ? 'Critical'
        : hasWarnings
          ? 'Degraded'
          : 'Healthy';

      const diagnosticsResult: SystemDiagnostics = {
        timestamp: Date.now(),
        overall_status: overallStatus,
        results,
        total_duration_ms: totalDuration,
      };

      setDiagnostics(diagnosticsResult);
      setStatus(overallStatus);
    } catch (err) {
      const formatted = formatUserError(err);
      const userMessage = sanitizeErrorForUser(formatted.userMessage);

      setError(userMessage);
      setErrorDetails({
        userMessage: formatted.userMessage,
        technicalDetails: formatted.technicalDetails,
        suggestions: formatted.suggestions,
      });

      console.error('[useSystemDiagnostics] Full diagnostics failed:', err);
      console.error('[useSystemDiagnostics] Error ID:', generateErrorId(err));
    } finally {
      setIsRunning(false);
    }
  }, []);

  /**
   * Refresh du statut uniquement
   * ✅ UTILISE get_system_health (WHITELIST ✅)
   */
  const refreshStatus = useCallback(async () => {
    try {
      const result = await secureInvoke<{ healthy: boolean; status: string }>(
        'get_system_health'
      );
      const newStatus: OverallStatus = result.healthy ? 'Healthy' : 'Degraded';
      setStatus(newStatus);
    } catch (err) {
      console.error('[useSystemDiagnostics] Status refresh failed:', err);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
  }, []);

  return {
    diagnostics,
    status,
    isRunning,
    error,
    errorDetails,
    runQuickDiagnostics,
    runFullDiagnostics,
    refreshStatus,
    clearError,
  };
}
