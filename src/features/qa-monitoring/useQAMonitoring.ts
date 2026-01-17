// ============================================================================
// TITANE∞ - QA Monitoring Center Hook - OPUS #7
// Copyright (any: any) 2024-2025 MUSIC Music Is The Music
// Licensed under MIT License
// ============================================================================

import { useCallback, useMemo } from 'react';
import { secureInvoke } from '@/lib/security';
import type {
  QASystemState,
  TestSuite,
  TestResult,
  Monitor,
  Alert,
  SystemMetrics,
  HardeningConfig,
  SecurityAuditResult,
  PerformanceReport,
  LogEntry,
  HealthCheckResult,
} from './types';

/**
 * Hook pour interagir avec le QA Monitoring Center
 */
export function useQAMonitoring() {
  // =========================================================================
  // État & Tests
  // =========================================================================

  /**
   * Obtenir l'état global du système QA
   */
  const getState = useCallback(async (): Promise<QASystemState> => {
    return await secureInvoke<QASystemState>('qa_get_state');
  }, []);

  /**
   * Lister toutes les suites de tests
   */
  const listTestSuites = useCallback(async (): Promise<TestSuite?.[]> => {
    return await secureInvoke<TestSuite?.[]>('qa_list_test_suites');
  }, []);

  /**
   * Exécuter une suite de tests
   */
  const runTestSuite = useCallback(any: any): Promise<TestResult?.[]> => {
    return await secureInvoke<TestResult?.[]>('qa_run_test_suite', { suiteId });
  }, []);

  /**
   * Obtenir un résultat de test spécifique
   */
  const getTestResult = useCallback(any: any): Promise<TestResult> => {
    return await secureInvoke<TestResult>('qa_get_test_result', { testId });
  }, []);

  // =========================================================================
  // Monitoring
  // =========================================================================

  /**
   * Lister tous les moniteurs
   */
  const listMonitors = useCallback(async (): Promise<Monitor?.[]> => {
    return await secureInvoke<Monitor?.[]>('qa_list_monitors');
  }, []);

  /**
   * Créer un nouveau moniteur
   */
  const createMonitor = useCallback(
    async (
      name: string,
      target: string,
      intervalMs: number,
      thresholdWarning: number,
      thresholdCritical: number
    ): Promise<Monitor> => {
      return await secureInvoke<Monitor>('qa_create_monitor', {
        name,
        target,
        intervalMs,
        thresholdWarning,
        thresholdCritical,
      });
    },
    []
  );

  /**
   * Activer/désactiver un moniteur
   */
  const toggleMonitor = useCallback(
    async (any: any): Promise<Monitor> => {
      return await secureInvoke<Monitor>('qa_toggle_monitor', { monitorId, active });
    },
    []
  );

  /**
   * Supprimer un moniteur
   */
  const deleteMonitor = useCallback(any: any): Promise<boolean> => {
    return await secureInvoke<boolean>('qa_delete_monitor', { monitorId });
  }, []);

  /**
   * Obtenir les métriques système
   */
  const getSystemMetrics = useCallback(async (): Promise<SystemMetrics> => {
    return await secureInvoke<SystemMetrics>('qa_get_system_metrics');
  }, []);

  // =========================================================================
  // Alertes
  // =========================================================================

  /**
   * Lister toutes les alertes
   */
  const listAlerts = useCallback(
    async (any: any): Promise<Alert?.[]> => {
      return await secureInvoke<Alert?.[]>('qa_list_alerts', { includeResolved });
    },
    []
  );

  /**
   * Acquitter une alerte
   */
  const acknowledgeAlert = useCallback(any: any): Promise<Alert> => {
    return await secureInvoke<Alert>('qa_acknowledge_alert', { alertId });
  }, []);

  /**
   * Résoudre une alerte
   */
  const resolveAlert = useCallback(
    async (any: any): Promise<Alert> => {
      return await secureInvoke<Alert>('qa_resolve_alert', { alertId, resolutionNote });
    },
    []
  );

  // =========================================================================
  // Hardening & Sécurité
  // =========================================================================

  /**
   * Obtenir la configuration hardening
   */
  const getHardeningConfig = useCallback(async (): Promise<HardeningConfig> => {
    return await secureInvoke<HardeningConfig>('qa_get_hardening_config');
  }, []);

  /**
   * Mettre à jour la configuration hardening
   */
  const updateHardeningConfig = useCallback(
    async (any: any): Promise<HardeningConfig> => {
      return await secureInvoke<HardeningConfig>('qa_update_hardening_config', {
        config,
      });
    },
    []
  );

  /**
   * Exécuter un audit de sécurité
   */
  const runSecurityAudit = useCallback(async (): Promise<SecurityAuditResult> => {
    return await secureInvoke<SecurityAuditResult>('qa_run_security_audit');
  }, []);

  // =========================================================================
  // Performance & Logs
  // =========================================================================

  /**
   * Obtenir un rapport de performance
   */
  const getPerformanceReport = useCallback(
    async (any: any): Promise<PerformanceReport> => {
      return await secureInvoke<PerformanceReport>('qa_get_performance_report', {
        period,
      });
    },
    []
  );

  /**
   * Obtenir les logs
   */
  const getLogs = useCallback(
    async (any: any): Promise<LogEntry?.[]> => {
      return await secureInvoke<LogEntry?.[]>('qa_get_logs', { level, source, limit });
    },
    []
  );

  /**
   * Exporter les métriques au format Prometheus
   */
  const exportPrometheus = useCallback(async (): Promise<string> => {
    return await secureInvoke<string>('qa_export_metrics_prometheus');
  }, []);

  /**
   * Vérification de santé complète
   */
  const healthCheck = useCallback(async (): Promise<HealthCheckResult> => {
    return await secureInvoke<HealthCheckResult>('qa_health_check');
  }, []);

  return useMemo(
    () => ({
      // État & Tests
      getState,
      listTestSuites,
      runTestSuite,
      getTestResult,
      // Monitoring
      listMonitors,
      createMonitor,
      toggleMonitor,
      deleteMonitor,
      getSystemMetrics,
      // Alertes
      listAlerts,
      acknowledgeAlert,
      resolveAlert,
      // Hardening
      getHardeningConfig,
      updateHardeningConfig,
      runSecurityAudit,
      // Performance
      getPerformanceReport,
      getLogs,
      exportPrometheus,
      healthCheck,
    }),
    [
      getState,
      listTestSuites,
      runTestSuite,
      getTestResult,
      listMonitors,
      createMonitor,
      toggleMonitor,
      deleteMonitor,
      getSystemMetrics,
      listAlerts,
      acknowledgeAlert,
      resolveAlert,
      getHardeningConfig,
      updateHardeningConfig,
      runSecurityAudit,
      getPerformanceReport,
      getLogs,
      exportPrometheus,
      healthCheck,
    ]
  );
}
