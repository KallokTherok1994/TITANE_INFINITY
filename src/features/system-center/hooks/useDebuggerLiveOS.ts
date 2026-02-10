/**
 * TITANE∞ v21 — Debugger Live OS Hook
 *
 * Hook unifié pour le débogage temps réel du système TITANE∞
 *
 * © 2025 TITANE Team. All rights reserved.
 *
 * ✅ UTILISE UNIQUEMENT DES COMMANDES WHITELIST
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import {
  formatUserError,
  sanitizeErrorForUser,
  generateErrorId,
} from '../utils/errorMessages';
import type {
  DebuggerMode,
  DebuggerModeConfig,
  DebuggerState,
  DebuggerAPI,
  LiveMetrics,
  TraceEntry,
  TraceSession,
  RiskAssessmentReport,
  RiskFactor,
  RiskLevel,
  RiskCategory as _RiskCategory,
  CognitiveSnapshot,
  ReplaySession,
  OSSnapshot,
  SnapshotDiff,
  VisualSyncState,
  AutoFixResult,
  SanityCheckReport,
  ExportData,
} from '../types/debuggerLiveOS.types';

// ══════════════════════════════════════════════════════════════════
// HOOK INTERFACE
// ══════════════════════════════════════════════════════════════════

export interface UseDebuggerLiveOSReturn extends DebuggerAPI {
  // State
  state: DebuggerState;
  isActive: boolean;
  currentMode: DebuggerMode;

  // Error handling
  error: string | null;
  errorDetails: {
    userMessage: string;
    technicalDetails: string;
    suggestions: string[];
  } | null;
  clearError: () => void;

  // Loading states
  isLoading: boolean;
  isCapturing: boolean;
}

// ══════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ══════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: DebuggerModeConfig = {
  mode: 'LiveMonitor',
  autoRefresh: true,
  refreshInterval: 2000,
  captureStackTraces: false,
  maxHistorySize: 1000,
};

// ══════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════

export function useDebuggerLiveOS(): UseDebuggerLiveOSReturn {
  // ─────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────

  const [state, setState] = useState<DebuggerState>({
    mode: 'LiveMonitor',
    config: DEFAULT_CONFIG,
    is_active: false,
    history: [],
    stats: {
      total_traces: 0,
      total_snapshots: 0,
      total_errors: 0,
      total_fixes_applied: 0,
      uptime_ms: 0,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    userMessage: string;
    technicalDetails: string;
    suggestions: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // REFS
  // ─────────────────────────────────────────────────────────────────

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const traceBuffer = useRef<TraceEntry[]>([]);
  const snapshotBuffer = useRef<OSSnapshot[]>([]);

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  const handleError = useCallback((err: unknown) => {
    const formatted = formatUserError(err);
    const userMessage = sanitizeErrorForUser(formatted.userMessage);

    setError(userMessage);
    setErrorDetails({
      userMessage: formatted.userMessage,
      technicalDetails: formatted.technicalDetails,
      suggestions: formatted.suggestions,
    });

    console.error('[useDebuggerLiveOS] Error:', err);
    console.error('[useDebuggerLiveOS] Error ID:', generateErrorId(err));

    // Update stats
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        total_errors: prev.stats.total_errors + 1,
      },
    }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
  }, []);

  const addToHistory = useCallback((action: string, data?: unknown) => {
    setState(prev => ({
      ...prev,
      history: [
        ...prev.history.slice(-(prev.config.maxHistorySize - 1)),
        {
          timestamp: Date.now(),
          mode: prev.mode,
          action,
          data,
        },
      ],
    }));
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // MODE: LIVE MONITOR
  // ─────────────────────────────────────────────────────────────────

  const captureLiveMetrics = useCallback(async (): Promise<LiveMetrics> => {
    const timestamp = Date.now();
    const metrics: Partial<LiveMetrics> = { timestamp };

    try {
      // ✅ System Health (WHITELIST)
      const systemHealth = (await tauriClient.getSystemHealth()) as {
        healthy: boolean;
        status: string;
        issues?: string[];
      };
      metrics.systemHealth = systemHealth;
    } catch (err) {
      console.warn('[LiveMonitor] System health not available:', err);
    }

    try {
      // ✅ Module Health (WHITELIST)
      const moduleHealth = (await tauriClient.getModuleHealth()) as {
        all_healthy: boolean;
        healthy_count: number;
        total_count: number;
        unhealthy_modules?: string[];
      };
      metrics.moduleHealth = moduleHealth;
    } catch (err) {
      console.warn('[LiveMonitor] Module health not available:', err);
    }

    try {
      // ✅ Helios Metrics (WHITELIST)
      const heliosMetrics = (await tauriClient.getHeliosMetrics()) as Record<
        string,
        unknown
      >;
      metrics.heliosMetrics = heliosMetrics;
    } catch (err) {
      console.warn('[LiveMonitor] Helios metrics not available:', err);
    }

    try {
      // ✅ Singularity State (WHITELIST)
      const singularityState = (await tauriClient.getSingularityState()) as Record<
        string,
        unknown
      >;
      metrics.singularityState = singularityState;
    } catch (err) {
      console.warn('[LiveMonitor] Singularity state not available:', err);
    }

    try {
      // ✅ Engines Health (WHITELIST)
      const enginesHealth = (await tauriClient.enginesMonitoringGetHealth()) as {
        overall_health: number;
        engines: Array<{
          name: string;
          healthy: boolean;
          load: number;
          errors: number;
        }>;
      };
      metrics.enginesHealth = enginesHealth;
    } catch (err) {
      console.warn('[LiveMonitor] Engines health not available:', err);
    }

    return metrics as LiveMetrics;
  }, []);

  const refreshLiveMetrics = useCallback(async () => {
    if (!state.is_active || state.mode !== 'LiveMonitor') return;

    try {
      const metrics = await captureLiveMetrics();
      setState(prev => ({
        ...prev,
        liveMetrics: metrics,
      }));
    } catch (err) {
      handleError(err);
    }
  }, [state.is_active, state.mode, captureLiveMetrics, handleError]);

  // ─────────────────────────────────────────────────────────────────
  // MODE: DEEP TRACE
  // ─────────────────────────────────────────────────────────────────

  const _addTraceEntry = useCallback(
    (entry: Omit<TraceEntry, 'id' | 'timestamp'>) => {
      const traceEntry: TraceEntry = {
        ...entry,
        id: `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      traceBuffer.current.push(traceEntry);

      if (state.mode === 'DeepTrace' && state.traceSession) {
        setState(prev => ({
          ...prev,
          traceSession: prev.traceSession
            ? {
                ...prev.traceSession,
                entries: [...prev.traceSession.entries, traceEntry],
                commandCount:
                  entry.type === 'command'
                    ? prev.traceSession.commandCount + 1
                    : prev.traceSession.commandCount,
                errorCount:
                  entry.type === 'error'
                    ? prev.traceSession.errorCount + 1
                    : prev.traceSession.errorCount,
              }
            : undefined,
          stats: {
            ...prev.stats,
            total_traces: prev.stats.total_traces + 1,
          },
        }));
      }
    },
    [state.mode, state.traceSession]
  );

  // ─────────────────────────────────────────────────────────────────
  // MODE: RISK ASSESSMENT
  // ─────────────────────────────────────────────────────────────────

  const assessRisks = useCallback(async (): Promise<RiskAssessmentReport> => {
    const factors: RiskFactor[] = [];
    let riskScore = 0;

    try {
      // Capture current metrics
      const metrics = await captureLiveMetrics();

      // Check system health
      if (metrics.systemHealth && !metrics.systemHealth.healthy) {
        factors.push({
          id: 'system_unhealthy',
          category: 'StateInconsistency',
          level: 'High',
          description: 'Le système global est marqué comme non sain',
          detected_at: Date.now(),
          metrics: { healthy: 0 },
          threshold: { healthy: 1 },
          mitigation: 'Vérifier les modules défaillants et relancer le système',
          auto_fixable: false,
        });
        riskScore += 30;
      }

      // Check unhealthy modules
      if (metrics.moduleHealth && !metrics.moduleHealth.all_healthy) {
        const unhealthyCount =
          metrics.moduleHealth.total_count - metrics.moduleHealth.healthy_count;
        const severity: RiskLevel =
          unhealthyCount > 5 ? 'Critical' : unhealthyCount > 2 ? 'High' : 'Medium';

        factors.push({
          id: 'modules_unhealthy',
          category: 'StateInconsistency',
          level: severity,
          description: `${unhealthyCount} module(s) non sain(s) détecté(s)`,
          detected_at: Date.now(),
          metrics: { unhealthy: unhealthyCount },
          threshold: { unhealthy: 0 },
          mitigation: 'Redémarrer les modules défaillants',
          auto_fixable: true,
        });
        riskScore += unhealthyCount * 5;
      }

      // Check CPU/Memory usage
      if (metrics.heliosMetrics?.cpu_usage && metrics.heliosMetrics.cpu_usage > 0.8) {
        factors.push({
          id: 'high_cpu',
          category: 'HighCPU',
          level: metrics.heliosMetrics.cpu_usage > 0.95 ? 'Critical' : 'High',
          description: `Utilisation CPU élevée: ${(metrics.heliosMetrics.cpu_usage * 100).toFixed(1)}%`,
          detected_at: Date.now(),
          metrics: { cpu_usage: metrics.heliosMetrics.cpu_usage },
          threshold: { cpu_usage: 0.8 },
          mitigation: 'Optimiser les processus actifs ou augmenter les ressources',
          auto_fixable: false,
        });
        riskScore += 20;
      }

      if (
        metrics.heliosMetrics?.memory_usage &&
        metrics.heliosMetrics.memory_usage > 0.85
      ) {
        factors.push({
          id: 'high_memory',
          category: 'HighMemory',
          level: metrics.heliosMetrics.memory_usage > 0.95 ? 'Critical' : 'High',
          description: `Utilisation mémoire élevée: ${(metrics.heliosMetrics.memory_usage * 100).toFixed(1)}%`,
          detected_at: Date.now(),
          metrics: { memory_usage: metrics.heliosMetrics.memory_usage },
          threshold: { memory_usage: 0.85 },
          mitigation: 'Nettoyer la mémoire ou redémarrer les services',
          auto_fixable: true,
        });
        riskScore += 25;
      }

      // Check engines health
      if (metrics.enginesHealth) {
        const unhealthyEngines =
          metrics.enginesHealth.engines?.filter(e => !e.healthy) || [];
        if (unhealthyEngines.length > 0) {
          factors.push({
            id: 'engines_unhealthy',
            category: 'StateInconsistency',
            level: unhealthyEngines.length > 3 ? 'Critical' : 'High',
            description: `${unhealthyEngines.length} engine(s) défaillant(s)`,
            detected_at: Date.now(),
            metrics: { unhealthy_engines: unhealthyEngines.length },
            threshold: { unhealthy_engines: 0 },
            mitigation: 'Redémarrer les engines défaillants',
            auto_fixable: true,
          });
          riskScore += unhealthyEngines.length * 10;
        }
      }

      // Determine overall risk level
      const overall_risk: RiskLevel =
        riskScore >= 80
          ? 'Critical'
          : riskScore >= 50
            ? 'High'
            : riskScore >= 25
              ? 'Medium'
              : riskScore > 0
                ? 'Low'
                : 'None';

      // Generate recommendations
      const recommendations: string[] = [];
      if (factors.some(f => f.category === 'HighCPU')) {
        recommendations.push('Optimiser les processus actifs');
      }
      if (factors.some(f => f.category === 'HighMemory')) {
        recommendations.push('Nettoyer la mémoire ou augmenter les ressources');
      }
      if (factors.some(f => f.category === 'StateInconsistency')) {
        recommendations.push("Vérifier l'intégrité du système");
      }
      if (factors.length === 0) {
        recommendations.push('Système en bonne santé, continuer la surveillance');
      }

      const auto_fixes_available = factors.filter(f => f.auto_fixable).length;

      return {
        timestamp: Date.now(),
        overall_risk,
        risk_score: Math.min(riskScore, 100),
        factors,
        recommendations,
        auto_fixes_available,
      };
    } catch (err) {
      handleError(err);
      return {
        timestamp: Date.now(),
        overall_risk: 'Medium',
        risk_score: 50,
        factors: [
          {
            id: 'assessment_error',
            category: 'DataCorruption',
            level: 'Medium',
            description: "Impossible de compléter l'évaluation des risques",
            detected_at: Date.now(),
            metrics: {},
            threshold: {},
            auto_fixable: false,
          },
        ],
        recommendations: ["Réessayer l'évaluation", 'Vérifier les services backend'],
        auto_fixes_available: 0,
      };
    }
  }, [captureLiveMetrics, handleError]);

  // ─────────────────────────────────────────────────────────────────
  // MODE: COGNITIVE REPLAY
  // ─────────────────────────────────────────────────────────────────

  const _captureCognitiveSnapshot = useCallback(async (): Promise<CognitiveSnapshot> => {
    try {
      // ✅ Get cognitive state (WHITELIST)
      const cognitiveState = await tauriClient.getCognitiveState() as Record<string, unknown>;

      // ✅ Get singularity state (WHITELIST)
      const singularity = await tauriClient.singularityGetFullState() as {
        physical: Record<string, unknown>;
        cognitive: Record<string, unknown>;
        symbolic: Record<string, unknown>;
        adaptive: Record<string, unknown>;
        meta: Record<string, unknown>;
      };

      // ✅ Get memory state (WHITELIST)
      const memoryState = await tauriClient.memoryGetState() as {
        usage_percent: number;
        active_connections: number;
      };

      return {
        id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        cognitive_mode: (cognitiveState.mode as string) || 'unknown',
        confidence: (cognitiveState.confidence as number) || 0,
        intensity: (cognitiveState.intensity as number) || 0,
        active_kernels: (cognitiveState.active_kernels as string[]) || [],
        memory_state: {
          usage_percent: memoryState.usage_percent || 0,
          active_connections: memoryState.active_connections || 0,
        },
        singularity,
        decision_context: cognitiveState.context as Record<string, unknown> | undefined,
      };
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  // ─────────────────────────────────────────────────────────────────
  // MODE: OS SNAPSHOT DIFF
  // ─────────────────────────────────────────────────────────────────

  const captureOSSnapshot = useCallback(
    async (label?: string): Promise<OSSnapshot> => {
      const startTime = performance.now();

      try {
        // Capture all system state
        const [health, modules, metrics, singularity, runtimeConfig] = await Promise.all([
          (tauriClient.getSystemHealth() as Promise<Record<string, unknown>>).catch(() => ({})),
          (tauriClient.getModuleHealth() as Promise<Record<string, unknown>>).catch(() => ({})),
          (tauriClient.getHeliosMetrics() as Promise<Record<string, unknown>>).catch(() => ({})),
          (tauriClient.getSingularityState() as Promise<Record<string, unknown>>).catch(
            () => ({})
          ),
          (tauriClient.getRuntimeConfig() as Promise<Record<string, unknown>>).catch(() => ({})),
        ]);

        const endTime = performance.now();

        // Try to get persistence info
        let persistence;
        try {
          const persistenceStatus = await tauriClient.titanGetPersistenceStatus() as {
            snapshot_id: string;
            events_count: number;
            integrity_hash: string;
          };
          persistence = persistenceStatus;
        } catch (err) {
          // Persistence not available
        }

        const snapshot: OSSnapshot = {
          id: `os_snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          label,
          systemState: {
            health,
            modules,
            metrics,
            singularity,
            runtime_config: runtimeConfig,
          },
          persistence,
          size_bytes: JSON.stringify({
            health,
            modules,
            metrics,
            singularity,
            runtimeConfig,
          }).length,
          capture_duration_ms: endTime - startTime,
        };

        // Store in buffer
        snapshotBuffer.current.push(snapshot);
        if (snapshotBuffer.current.length > 10) {
          snapshotBuffer.current.shift();
        }

        // Update state
        setState(prev => ({
          ...prev,
          snapshots: snapshotBuffer.current,
          stats: {
            ...prev.stats,
            total_snapshots: prev.stats.total_snapshots + 1,
          },
        }));

        addToHistory('snapshot_captured', { id: snapshot.id, label });

        return snapshot;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [handleError, addToHistory]
  );

  const compareSnapshots = useCallback(
    async (id_a: string, id_b: string): Promise<SnapshotDiff> => {
      const snapshot_a = snapshotBuffer.current.find(s => s.id === id_a);
      const snapshot_b = snapshotBuffer.current.find(s => s.id === id_b);

      if (!snapshot_a || !snapshot_b) {
        throw new Error('Snapshot introuvable');
      }

      // Simple deep diff implementation
      const changes: SnapshotDiff['changes'] = [];
      const checkDiff = (
        path: string,
        a: unknown,
        b: unknown,
        impact: 'critical' | 'major' | 'minor'
      ) => {
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          if (a === undefined) {
            changes.push({ path, type: 'added', new_value: b, impact });
          } else if (b === undefined) {
            changes.push({ path, type: 'removed', old_value: a, impact });
          } else {
            changes.push({ path, type: 'modified', old_value: a, new_value: b, impact });
          }
        }
      };

      // Compare major sections
      checkDiff(
        'health',
        snapshot_a.systemState.health,
        snapshot_b.systemState.health,
        'critical'
      );
      checkDiff(
        'modules',
        snapshot_a.systemState.modules,
        snapshot_b.systemState.modules,
        'major'
      );
      checkDiff(
        'metrics',
        snapshot_a.systemState.metrics,
        snapshot_b.systemState.metrics,
        'minor'
      );
      checkDiff(
        'singularity',
        snapshot_a.systemState.singularity,
        snapshot_b.systemState.singularity,
        'major'
      );
      checkDiff(
        'runtime_config',
        snapshot_a.systemState.runtime_config,
        snapshot_b.systemState.runtime_config,
        'minor'
      );

      const summary = {
        added_count: changes.filter(c => c.type === 'added').length,
        removed_count: changes.filter(c => c.type === 'removed').length,
        modified_count: changes.filter(c => c.type === 'modified').length,
        total_changes: changes.length,
      };

      return {
        snapshot_a,
        snapshot_b,
        changes,
        summary,
      };
    },
    []
  );

  // ─────────────────────────────────────────────────────────────────
  // MODE: VISUAL SYNC
  // ─────────────────────────────────────────────────────────────────

  const captureVisualSyncState = useCallback(async (): Promise<VisualSyncState> => {
    try {
      // Get OS state
      const cognitiveState = (await (tauriClient.getCognitiveState() as Promise<{
        mode: string;
      }>).catch(() => ({ mode: 'unknown' })));

      const systemState = (await (tauriClient.getSystemState() as Promise<{
        cpu_usage: number;
      }>).catch(() => ({ cpu_usage: 0 })));

      // Visual Engine state would be captured from the Visual Engine instance
      // For now, we'll use placeholder values
      const visualEngineState = {
        active: true,
        current_state: 'calm',
        intensity: 0.5,
        particle_count: 0,
        effects_active: 0,
      };

      return {
        visualEngine: visualEngineState,
        osState: {
          cognitive_mode: cognitiveState.mode,
          emotional_state: 'neutral',
          system_load: systemState.cpu_usage || 0,
        },
        sync: {
          is_synced: true,
          last_sync_at: Date.now(),
          drift_ms: 0,
          sync_quality: 1.0,
        },
        performance: {
          fps: 60,
          frame_time_ms: 16.67,
          render_latency_ms: 1,
        },
      };
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError]);

  // ─────────────────────────────────────────────────────────────────
  // DEBUGGER API IMPLEMENTATION
  // ─────────────────────────────────────────────────────────────────

  const start = useCallback(
    async (mode: DebuggerMode, config?: Partial<DebuggerModeConfig>) => {
      try {
        setIsLoading(true);
        clearError();

        const newConfig: DebuggerModeConfig = {
          ...DEFAULT_CONFIG,
          mode,
          ...config,
        };

        setState({
          mode,
          config: newConfig,
          is_active: true,
          started_at: Date.now(),
          history: [],
          stats: {
            total_traces: 0,
            total_snapshots: 0,
            total_errors: 0,
            total_fixes_applied: 0,
            uptime_ms: 0,
          },
        });

        // Initialize mode-specific data
        if (mode === 'LiveMonitor') {
          const metrics = await captureLiveMetrics();
          setState(prev => ({ ...prev, liveMetrics: metrics }));
        } else if (mode === 'DeepTrace') {
          const session: TraceSession = {
            id: `session_${Date.now()}`,
            started_at: Date.now(),
            entries: [],
            totalDuration: 0,
            errorCount: 0,
            commandCount: 0,
          };
          setState(prev => ({ ...prev, traceSession: session }));
        } else if (mode === 'RiskAssessment') {
          const assessment = await assessRisks();
          setState(prev => ({ ...prev, riskAssessment: assessment }));
        } else if (mode === 'CognitiveReplay') {
          const session: ReplaySession = {
            id: `replay_${Date.now()}`,
            snapshots: [],
            started_at: Date.now(),
            duration_ms: 0,
            current_index: 0,
            is_playing: false,
            playback_speed: 1.0,
          };
          setState(prev => ({ ...prev, replaySession: session }));
        } else if (mode === 'VisualSync') {
          const syncState = await captureVisualSyncState();
          setState(prev => ({ ...prev, visualSync: syncState }));
        }

        addToHistory('debugger_started', { mode });

        // Setup auto-refresh if enabled
        if (newConfig.autoRefresh && newConfig.refreshInterval) {
          refreshIntervalRef.current = setInterval(() => {
            if (mode === 'LiveMonitor') {
              refreshLiveMetrics();
            } else if (mode === 'RiskAssessment') {
              assessRisks().then(assessment => {
                setState(prev => ({ ...prev, riskAssessment: assessment }));
              });
            } else if (mode === 'VisualSync') {
              captureVisualSyncState().then(syncState => {
                setState(prev => ({ ...prev, visualSync: syncState }));
              });
            }
          }, newConfig.refreshInterval);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      clearError,
      captureLiveMetrics,
      assessRisks,
      captureVisualSyncState,
      refreshLiveMetrics,
      addToHistory,
      handleError,
    ]
  );

  const stop = useCallback(async () => {
    try {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      const uptime = state.started_at ? Date.now() - state.started_at : 0;

      setState(prev => ({
        ...prev,
        is_active: false,
        stats: {
          ...prev.stats,
          uptime_ms: uptime,
        },
      }));

      addToHistory('debugger_stopped', { uptime_ms: uptime });
    } catch (err) {
      handleError(err);
    }
  }, [state.started_at, addToHistory, handleError]);

  const switchMode = useCallback(
    async (mode: DebuggerMode) => {
      await stop();
      await start(mode);
    },
    [stop, start]
  );

  const snapshot = useCallback(
    async (label?: string): Promise<OSSnapshot> => {
      setIsCapturing(true);
      try {
        return await captureOSSnapshot(label);
      } finally {
        setIsCapturing(false);
      }
    },
    [captureOSSnapshot]
  );

  const exportData = useCallback(
    async (format: 'json' | 'csv' | 'html'): Promise<string> => {
      try {
        const exportData: ExportData = {
          format,
          timestamp: Date.now(),
          mode: state.mode,
          data: state,
          metadata: {
            version: 'v21',
            generated_by: 'TITANE∞ Debugger Live OS',
            duration_captured_ms: state.started_at ? Date.now() - state.started_at : 0,
          },
        };

        if (format === 'json') {
          return JSON.stringify(exportData, null, 2);
        } else if (format === 'csv') {
          // Simple CSV export
          return (
            'timestamp,mode,action,data\n' +
            state.history
              .map(
                h => `${h.timestamp},${h.mode},${h.action},"${JSON.stringify(h.data)}"`
              )
              .join('\n')
          );
        } else {
          // HTML export
          return `
<!DOCTYPE html>
<html>
<head>
  <title>TITANE∞ Debugger Export</title>
  <style>
    body { font-family: monospace; background: #0a0a0a; color: #00ff00; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>TITANE∞ Debugger Live OS Export</h1>
  <p>Mode: ${state.mode}</p>
  <p>Generated: ${new Date().toISOString()}</p>
  <pre>${JSON.stringify(exportData, null, 2)}</pre>
</body>
</html>
          `.trim();
        }
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [state, handleError]
  );

  const autoFix = useCallback(
    async (riskId?: string): Promise<AutoFixResult> => {
      const startTime = performance.now();

      try {
        const fixed_risks: string[] = [];
        const errors: string[] = [];
        let fixes_applied = 0;
        let fixes_failed = 0;

        // Get current risk assessment
        const assessment = state.riskAssessment || (await assessRisks());

        // Get risks to fix
        const risksToFix = riskId
          ? assessment.factors.filter(f => f.id === riskId && f.auto_fixable)
          : assessment.factors.filter(f => f.auto_fixable);

        for (const risk of risksToFix) {
          try {
            // Apply fixes based on category
            if (risk.category === 'HighMemory') {
              // ✅ Use whitelist commands
              await tauriClient.memoryPrune();
              fixes_applied++;
              fixed_risks.push(risk.id);
            } else if (risk.category === 'StateInconsistency') {
              // Try to sync singularity
              await tauriClient.singularitySelfCheck();
              fixes_applied++;
              fixed_risks.push(risk.id);
            }
          } catch (err) {
            fixes_failed++;
            errors.push(`Failed to fix ${risk.id}: ${err}`);
          }
        }

        const endTime = performance.now();

        const result: AutoFixResult = {
          success: fixes_failed === 0,
          fixes_applied,
          fixes_failed,
          fixed_risks,
          errors,
          recommendations:
            fixes_applied > 0
              ? ["Réexécuter l'évaluation des risques pour vérifier les améliorations"]
              : ['Aucun fix automatique disponible'],
          duration_ms: endTime - startTime,
        };

        setState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            total_fixes_applied: prev.stats.total_fixes_applied + fixes_applied,
          },
        }));

        addToHistory('auto_fix_executed', { result });

        return result;
      } catch (err) {
        handleError(err);
        throw err;
      }
    },
    [state.riskAssessment, assessRisks, handleError, addToHistory]
  );

  const getState = useCallback(() => state, [state]);

  const getTimeline = useCallback(() => traceBuffer.current, []);

  const explain = useCallback(async (traceId: string): Promise<string> => {
    const trace = traceBuffer.current.find(t => t.id === traceId);
    if (!trace) {
      return 'Trace introuvable';
    }

    return `
Trace ID: ${trace.id}
Type: ${trace.type}
Source: ${trace.source}
Timestamp: ${new Date(trace.timestamp).toISOString()}
${trace.command ? `Command: ${trace.command}` : ''}
${trace.duration_ms ? `Duration: ${trace.duration_ms}ms` : ''}
${trace.error ? `Error: ${trace.error}` : ''}
${trace.result ? `Result: ${JSON.stringify(trace.result, null, 2)}` : ''}
    `.trim();
  }, []);

  const sanityCheck = useCallback(async (): Promise<SanityCheckReport> => {
    const checks: SanityCheckReport['checks'] = [];

    try {
      // Check system health
      const health = await tauriClient.getSystemHealth() as { healthy: boolean; status: string };
      checks.push({
        id: 'system_health',
        name: 'Santé Système',
        status: health.healthy ? 'Pass' : 'Fail',
        message: health.status,
      });
    } catch (err) {
      checks.push({
        id: 'system_health',
        name: 'Santé Système',
        status: 'Fail',
        message: 'Impossible de vérifier la santé système',
        details: String(err),
      });
    }

    try {
      // Check module health
      const modules = await tauriClient.getModuleHealth() as { all_healthy: boolean };
      checks.push({
        id: 'module_health',
        name: 'Santé Modules',
        status: modules.all_healthy ? 'Pass' : 'Warning',
        message: modules.all_healthy
          ? 'Tous les modules sont sains'
          : 'Certains modules sont défaillants',
      });
    } catch (err) {
      checks.push({
        id: 'module_health',
        name: 'Santé Modules',
        status: 'Fail',
        message: 'Impossible de vérifier les modules',
      });
    }

    const overallStatus: SanityCheckReport['overall_status'] = checks.every(
      c => c.status === 'Pass'
    )
      ? 'Healthy'
      : checks.some(c => c.status === 'Fail')
        ? 'Critical'
        : 'Warning';

    const recommendations =
      overallStatus === 'Healthy'
        ? ['Système en bonne santé']
        : ['Vérifier les checks en échec', "Exécuter l'auto-fix si disponible"];

    return {
      timestamp: Date.now(),
      overall_status: overallStatus,
      checks,
      recommendations,
      auto_fixes_available: checks.filter(c => c.status !== 'Pass').length,
    };
  }, []);

  const syncWithSingularity = useCallback(async () => {
    try {
      await tauriClient.singularitySelfCheck();
      addToHistory('synced_with_singularity');
    } catch (err) {
      handleError(err);
    }
  }, [addToHistory, handleError]);

  const syncWithVisualEngine = useCallback(async () => {
    try {
      const syncState = await captureVisualSyncState();
      setState(prev => ({ ...prev, visualSync: syncState }));
      addToHistory('synced_with_visual_engine');
    } catch (err) {
      handleError(err);
    }
  }, [captureVisualSyncState, addToHistory, handleError]);

  // ─────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────

  return {
    // State
    state,
    isActive: state.is_active,
    currentMode: state.mode,

    // Error handling
    error,
    errorDetails,
    clearError,

    // Loading states
    isLoading,
    isCapturing,

    // API
    start,
    stop,
    switchMode,
    snapshot,
    compareSnapshots,
    export: exportData,
    autoFix,
    getState,
    getTimeline,
    explain,
    sanityCheck,
    syncWithSingularity,
    syncWithVisualEngine,
  };
}
