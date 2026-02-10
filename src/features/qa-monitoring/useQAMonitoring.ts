// ============================================================================
// TITANE∞ - QA Monitoring Center Hook - OPUS #7
// Copyright (c) 2024-2025 MUSIC Music Is The Music
// Licensed under MIT License
// ============================================================================

import { useCallback, useMemo } from 'react';
import { tauriClient } from '@/lib/tauriClient';
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
    return await tauriClient.qaGetState() as QASystemState;
  }, []);

  /**
   * Lister toutes les suites de tests
   */
  const listTestSuites = useCallback(async (): Promise<TestSuite[]> => {
    return await tauriClient.qaListTestSuites() as TestSuite[];
  }, []);

  /**
   * Exécuter une suite de tests
   */
  const runTestSuite = useCallback(async (suiteId: string): Promise<TestResult[]> => {
    return await tauriClient.qaRunTestSuite({ suiteId }) as TestResult[];
  }, []);

  /**
   * Obtenir un résultat de test spécifique
   */
  const getTestResult = useCallback(async (testId: string): Promise<TestResult> => {
    return await tauriClient.qaGetTestResult({ testId }) as TestResult;
  }, []);

  // =========================================================================
  // Monitoring
  // =========================================================================

  /**
   * Lister tous les moniteurs
   */
  const listMonitors = useCallback(async (): Promise<Monitor[]> => {
    return await tauriClient.qaListMonitors() as Monitor[];
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
      return await tauriClient.qaCreateMonitor({
        name,
        target,
        intervalMs,
        thresholdWarning,
        thresholdCritical,
      }) as Monitor;
    },
    []
  );

  /**
   * Activer/désactiver un moniteur
   */
  const toggleMonitor = useCallback(
    async (monitorId: string, active: boolean): Promise<Monitor> => {
      return await tauriClient.qaToggleMonitor({ monitorId, active }) as Monitor;
    },
    []
  );

  /**
   * Supprimer un moniteur
   */
  const deleteMonitor = useCallback(async (monitorId: string): Promise<boolean> => {
    return await tauriClient.qaDeleteMonitor({ monitorId }) as boolean;
  }, []);

  /**
   * Obtenir les métriques système
   */
  const getSystemMetrics = useCallback(async (): Promise<SystemMetrics> => {
    return await tauriClient.qaGetSystemMetrics() as SystemMetrics;
  }, []);

  // =========================================================================
  // Alertes
  // =========================================================================

  /**
   * Lister toutes les alertes
   */
  const listAlerts = useCallback(
    async (includeResolved: boolean = false): Promise<Alert[]> => {
      return await tauriClient.qaListAlerts({ includeResolved }) as Alert[];
    },
    []
  );

  /**
   * Acquitter une alerte
   */
  const acknowledgeAlert = useCallback(async (alertId: string): Promise<Alert> => {
    return await tauriClient.qaAcknowledgeAlert({ alertId }) as Alert;
  }, []);

  /**
   * Résoudre une alerte
   */
  const resolveAlert = useCallback(
    async (alertId: string, resolutionNote: string): Promise<Alert> => {
      return await tauriClient.qaResolveAlert({ alertId, resolutionNote }) as Alert;
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
    return await tauriClient.qaGetHardeningConfig() as HardeningConfig;
  }, []);

  /**
   * Mettre à jour la configuration hardening
   */
  const updateHardeningConfig = useCallback(
    async (config: HardeningConfig): Promise<HardeningConfig> => {
      return await tauriClient.qaUpdateHardeningConfig({
        config,
      }) as HardeningConfig;
    },
    []
  );

  /**
   * Exécuter un audit de sécurité
   */
  const runSecurityAudit = useCallback(async (): Promise<SecurityAuditResult> => {
    return await tauriClient.qaRunSecurityAudit() as SecurityAuditResult;
  }, []);

  // =========================================================================
  // Performance & Logs
  // =========================================================================

  /**
   * Obtenir un rapport de performance
   */
  const getPerformanceReport = useCallback(
    async (period: string): Promise<PerformanceReport> => {
      return await tauriClient.qaGetPerformanceReport({
        period,
      }) as PerformanceReport;
    },
    []
  );

  /**
   * Obtenir les logs
   */
  const getLogs = useCallback(
    async (level?: string, source?: string, limit?: number): Promise<LogEntry[]> => {
      return await tauriClient.qaGetLogs({ level, source, limit }) as LogEntry[];
    },
    []
  );

  /**
   * Exporter les métriques au format Prometheus
   */
  const exportPrometheus = useCallback(async (): Promise<string> => {
    return await tauriClient.qaExportMetricsPrometheus() as string;
  }, []);

  /**
   * Vérification de santé complète
   */
  const healthCheck = useCallback(async (): Promise<HealthCheckResult> => {
    return await tauriClient.qaHealthCheck() as HealthCheckResult;
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
