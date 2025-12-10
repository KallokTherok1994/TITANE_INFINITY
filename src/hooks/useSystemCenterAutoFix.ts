/**
 * TITANE_INFINITY v21.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — useSystemCenterAutoFix Hook
 *   Hook React pour auto-réparation du Centre Système
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import {
  SystemAPI,
  type DiagnosticResult,
  type SystemHealth,
  type MonitoringMetrics,
} from '@/services/systemCenter/SystemAPI';
import {
  systemCenterAutoFix,
  type DetectedError,
  type AutoFixResult,
  SystemCenterUXGenerator,
  type SystemCenterUXOutput,
} from '@/services/systemCenter/SystemCenterAutoFix';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface UseSystemCenterAutoFixReturn {
  // States
  systemHealth: SystemHealth | null;
  monitoringMetrics: MonitoringMetrics | null;
  detectedErrors: DetectedError[];
  fixHistory: AutoFixResult[];
  uxOutput: SystemCenterUXOutput | null;

  // Loading & Error states
  loading: boolean;
  error: string | null;

  // Actions
  runDiagnostic: () => Promise<void>;
  getMonitoring: () => Promise<void>;
  autoRepair: () => Promise<void>;
  clearErrors: () => void;
  generateUX: () => void;

  // Utils
  hasErrors: boolean;
  hasAutoFixes: boolean;
  isHealthy: boolean;
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useSystemCenterAutoFix(): UseSystemCenterAutoFixReturn {
  // ─────────────────────────────────────────────────────────────
  // States
  // ─────────────────────────────────────────────────────────────

  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [monitoringMetrics, setMonitoringMetrics] = useState<MonitoringMetrics | null>(
    null
  );
  const [detectedErrors, setDetectedErrors] = useState<DetectedError[]>([]);
  const [fixHistory, setFixHistory] = useState<AutoFixResult[]>([]);
  const [uxOutput, setUxOutput] = useState<SystemCenterUXOutput | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────

  /**
   * Lancer diagnostic système
   */
  const runDiagnostic = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result: DiagnosticResult = await SystemAPI.getSystemHealth();

      if (result.success && result.data) {
        setSystemHealth(result.data as SystemHealth);
      } else {
        setError(result.error || 'Diagnostic échoué');
      }

      // Mettre à jour les erreurs détectées
      setDetectedErrors(SystemAPI.getDetectedErrors());
    } catch (err) {
      const _detectedError = systemCenterAutoFix.analyzeError(
        err as Error,
        'SystemCenter'
      );
      setDetectedErrors([...systemCenterAutoFix.getDetectedErrors()]);
      setError('Erreur lors du diagnostic');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtenir métriques monitoring
   */
  const getMonitoring = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SystemAPI.getMonitoringMetrics();

      if (result.success && result.data) {
        setMonitoringMetrics(result.data as MonitoringMetrics);
      }

      setDetectedErrors(SystemAPI.getDetectedErrors());
    } catch (err) {
      const _detectedError = systemCenterAutoFix.analyzeError(err as Error, 'Monitoring');
      setDetectedErrors([...systemCenterAutoFix.getDetectedErrors()]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Auto-réparer toutes les erreurs détectées
   */
  const autoRepair = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const errors = systemCenterAutoFix.getDetectedErrors();
      const fixes: AutoFixResult[] = [];

      for (const error of errors) {
        const fix = await systemCenterAutoFix.autoFix(error);
        fixes.push(fix);
      }

      setFixHistory(systemCenterAutoFix.getFixHistory());
      setDetectedErrors(systemCenterAutoFix.getDetectedErrors());

      // Relancer diagnostic après réparation
      await runDiagnostic();
    } catch (err) {
      setError("Erreur lors de l'auto-réparation");
    } finally {
      setLoading(false);
    }
  }, [runDiagnostic]);

  /**
   * Clear erreurs et historique
   */
  const clearErrors = useCallback(() => {
    SystemAPI.clearAutoFixHistory();
    setDetectedErrors([]);
    setFixHistory([]);
    setError(null);
  }, []);

  /**
   * Générer UX propre à partir des erreurs
   */
  const generateUX = useCallback(() => {
    const errors = systemCenterAutoFix.getDetectedErrors();
    const fixes = systemCenterAutoFix.getFixHistory();

    const output = SystemCenterUXGenerator.generateCleanUX(errors, fixes);
    setUxOutput(output);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────

  /**
   * Initialisation: lancer diagnostic au montage
   */
  useEffect(() => {
    runDiagnostic();
  }, [runDiagnostic]);

  /**
   * Auto-générer UX quand des erreurs sont détectées
   */
  useEffect(() => {
    if (detectedErrors.length > 0) {
      generateUX();
    }
  }, [detectedErrors.length, generateUX]);

  // ─────────────────────────────────────────────────────────────
  // Computed values
  // ─────────────────────────────────────────────────────────────

  const hasErrors = detectedErrors.length > 0;
  const hasAutoFixes = fixHistory.some(f => f.success);
  const isHealthy =
    systemHealth?.status === 'healthy' || systemHealth?.overallScore > 0.8;

  // ─────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────

  return {
    // States
    systemHealth,
    monitoringMetrics,
    detectedErrors,
    fixHistory,
    uxOutput,

    // Loading & Error
    loading,
    error,

    // Actions
    runDiagnostic,
    getMonitoring,
    autoRepair,
    clearErrors,
    generateUX,

    // Utils
    hasErrors,
    hasAutoFixes,
    isHealthy,
  };
}
