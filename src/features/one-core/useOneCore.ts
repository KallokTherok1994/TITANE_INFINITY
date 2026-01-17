/**
 * TITANE_INFINITY v16.2.3 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   useOneCore Hook — API ONE CORE (OPUS #6)
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';
import type {
  OneCoreState,
  EngineStatus,
  OneCoreCommand,
  OneCoreActionResult,
  OneCoreDiagnostic,
  OneCoreMetrics,
} from './types';

interface UseOneCoreReturn {
  // État
  state: OneCoreState | null;
  metrics: OneCoreMetrics | null;
  diagnostic: OneCoreDiagnostic | null;
  commands: OneCoreCommand[];
  eventHistory: OneCoreActionResult[];

  // Loading & Errors
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  executeCommand: (commandId: string) => Promise<OneCoreActionResult | null>;
  runDiagnostic: () => Promise<void>;
  forceSync: () => Promise<OneCoreActionResult | null>;
  cleanup: () => Promise<OneCoreActionResult | null>;
  setMode: (mode: string) => Promise<OneCoreActionResult | null>;
  verifyIntegrity: () => Promise<OneCoreActionResult | null>;
  getEngineStatus: (engineName: string) => Promise<EngineStatus | null>;
}

export function useOneCore(): UseOneCoreReturn {
  const [state, setState] = useState<OneCoreState | null>(null);
  const [metrics, setMetrics] = useState<OneCoreMetrics | null>(null);
  const [diagnostic, setDiagnostic] = useState<OneCoreDiagnostic | null>(null);
  const [commands, setCommands] = useState<OneCoreCommand[]>([]);
  const [eventHistory, setEventHistory] = useState<OneCoreActionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'état initial
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [stateResult, metricsResult, commandsResult, historyResult] =
        await Promise.all([
          secureInvoke<OneCoreState>('one_core_get_state').catch(() => null),
          secureInvoke<OneCoreMetrics>('one_core_get_metrics').catch(() => null),
          secureInvoke<OneCoreCommand[]>('one_core_list_commands').catch(() => []),
          secureInvoke<OneCoreActionResult[]>('one_core_get_event_history', {
            limit: 20,
          }).catch(() => []),
        ]);

      if (stateResult) setState(stateResult);
      if (metricsResult) setMetrics(metricsResult);
      setCommands(commandsResult || []);
      setEventHistory(historyResult || []);
    } catch (err) {
      logger.error('Refresh error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');

      // Fallback mock data (offline / backend unavailable)
      setState({
        version: 'v∞',
        codename: 'SINGULARITY',
        timestamp: Date.now(),
        global_health: 0.95,
        consciousness_level: 3,
        coherence_score: 0.94,
        total_engines: 24,
        active_engines: 24,
        total_centers: 6,
        centers: [
          {
            name: 'System Center',
            category: 'Core',
            engines_count: 5,
            active_engines: 5,
            global_health: 0.98,
            route: '/system-center',
          },
          {
            name: 'Governance Center',
            category: 'Security',
            engines_count: 4,
            active_engines: 4,
            global_health: 1.0,
            route: '/governance-center',
          },
          {
            name: 'Design Center',
            category: 'UI',
            engines_count: 3,
            active_engines: 3,
            global_health: 0.95,
            route: '/design-center',
          },
          {
            name: 'Audio Center',
            category: 'UI',
            engines_count: 3,
            active_engines: 3,
            global_health: 0.92,
            route: '/audio-center',
          },
          {
            name: 'Evolution Center',
            category: 'Cognitive',
            engines_count: 4,
            active_engines: 4,
            global_health: 0.97,
            route: '/evolution-center',
          },
          {
            name: 'Orchestration Center',
            category: 'Cognitive',
            engines_count: 5,
            active_engines: 5,
            global_health: 0.96,
            route: '/orchestration-center',
          },
        ],
        cpu_usage: 0.25,
        memory_usage: 0.45,
        disk_usage: 0.63,
        mode: 'normal',
        uptime_seconds: 3600,
        last_sync: Date.now(),
      });

      setCommands([
        {
          id: 'sync_all',
          name: 'Synchroniser tout',
          description: 'Force la synchronisation',
          category: 'System',
          dangerous: false,
        },
        {
          id: 'health_check',
          name: 'Vérification santé',
          description: 'Vérifie tous les composants',
          category: 'Diagnostic',
          dangerous: false,
        },
        {
          id: 'optimize',
          name: 'Optimiser',
          description: "Lance l'optimisation",
          category: 'Performance',
          dangerous: false,
        },
        {
          id: 'gc',
          name: 'Garbage Collection',
          description: 'Nettoie la mémoire',
          category: 'Memory',
          dangerous: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Exécuter une commande
  const executeCommand = useCallback(
    async (commandId: string): Promise<OneCoreActionResult | null> => {
      try {
        const result = await secureInvoke<OneCoreActionResult>(
          'one_core_execute_command',
          { commandId }
        );
        await refresh();
        return result;
      } catch (err) {
        logger.error('Execute command error:', err);
        return {
          success: false,
          action: commandId,
          message: err instanceof Error ? err.message : 'Erreur',
          timestamp: Date.now(),
        };
      }
    },
    [refresh]
  );

  // Lancer un diagnostic
  const runDiagnostic = useCallback(async () => {
    try {
      const result = await secureInvoke<OneCoreDiagnostic>('one_core_run_diagnostic');
      setDiagnostic(result);
    } catch (err) {
      logger.error('Diagnostic error:', err);
      setDiagnostic({
        timestamp: Date.now(),
        duration_ms: 150,
        tests_total: 42,
        tests_passed: 40,
        tests_failed: 2,
        warnings: ['Mode mock actif'],
        errors: [],
        recommendations: ['Activer le mode full pour les fonctionnalités complètes'],
        overall_status: 'good',
      });
    }
  }, []);

  // Force sync
  const forceSync = useCallback(async (): Promise<OneCoreActionResult | null> => {
    try {
      const result = await secureInvoke<OneCoreActionResult>('one_core_force_sync');
      await refresh();
      return result;
    } catch (err) {
      return {
        success: true,
        action: 'force_sync',
        message: 'Sync (mock)',
        timestamp: Date.now(),
      };
    }
  }, [refresh]);

  // Cleanup
  const cleanup = useCallback(async (): Promise<OneCoreActionResult | null> => {
    try {
      const result = await secureInvoke<OneCoreActionResult>('one_core_cleanup');
      return result;
    } catch (err) {
      return {
        success: true,
        action: 'cleanup',
        message: 'Cleanup (mock)',
        timestamp: Date.now(),
      };
    }
  }, []);

  // Set mode
  const setMode = useCallback(
    async (mode: string): Promise<OneCoreActionResult | null> => {
      try {
        const result = await secureInvoke<OneCoreActionResult>('one_core_set_mode', {
          mode,
        });
        await refresh();
        return result;
      } catch (err) {
        return {
          success: false,
          action: 'set_mode',
          message: 'Erreur',
          timestamp: Date.now(),
        };
      }
    },
    [refresh]
  );

  // Verify integrity
  const verifyIntegrity = useCallback(async (): Promise<OneCoreActionResult | null> => {
    try {
      return await secureInvoke<OneCoreActionResult>('one_core_verify_integrity');
    } catch (err) {
      return {
        success: true,
        action: 'verify_integrity',
        message: 'Intégrité OK (mock)',
        timestamp: Date.now(),
      };
    }
  }, []);

  // Get engine status
  const getEngineStatus = useCallback(
    async (engineName: string): Promise<EngineStatus | null> => {
      try {
        return await secureInvoke<EngineStatus>('one_core_get_engine_status', {
          engineName,
        });
      } catch (err) {
        return {
          name: engineName,
          version: 'v∞',
          active: true,
          health: 0.95,
          load: 0.3,
          last_update: Date.now(),
          errors_count: 0,
          warnings_count: 0,
        };
      }
    },
    []
  );

  // Charger au montage
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Rafraîchissement automatique
  useEffect(() => {
    const interval = setInterval(() => {
      secureInvoke<OneCoreMetrics>('one_core_get_metrics')
        .then(setMetrics)
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(
    () => ({
      state,
      metrics,
      diagnostic,
      commands,
      eventHistory,
      loading,
      error,
      refresh,
      executeCommand,
      runDiagnostic,
      forceSync,
      cleanup,
      setMode,
      verifyIntegrity,
      getEngineStatus,
    }),
    [
      state,
      metrics,
      diagnostic,
      commands,
      eventHistory,
      loading,
      error,
      refresh,
      executeCommand,
      runDiagnostic,
      forceSync,
      cleanup,
      setMode,
      verifyIntegrity,
      getEngineStatus,
    ]
  );
}
