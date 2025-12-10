/**
 * TITANE∞ v20.0 — DevTools Mock Events
 * Super Prompt #3: DevTools UI Advanced Suite — Phase 4
 * Simulateur d'événements temps réel pour démo/développement
 * @license MIT
 */

import { emit } from '@tauri-apps/api/event';
import type { EngineStatus, LogLevel } from '../store/devtools.store';

/**
 * Envoie une mise à jour de statut d'engine
 */
export async function sendEngineStatusUpdate(
  engineId: string,
  updates: {
    status?: EngineStatus;
    cpuUsage?: number;
    memoryUsage?: number;
    errorCount?: number;
    lastExecutionTime?: string;
    lastExecutionDuration?: number;
  }
) {
  try {
    await emit('engine-status-update', {
      id: engineId,
      ...updates,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send engine status update:', error);
  }
}

/**
 * Envoie une mise à jour de métrique
 */
export async function sendMetricUpdate(metricId: string, value: number) {
  try {
    await emit('metrics-update', {
      id: metricId,
      value,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send metric update:', error);
  }
}

/**
 * Envoie une ligne de log
 */
export async function sendLogLine(
  level: LogLevel,
  message: string,
  source: string,
  details?: string
) {
  try {
    await emit('log-line', {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      level,
      message,
      source,
      timestamp: new Date().toISOString(),
      details,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send log line:', error);
  }
}

/**
 * Envoie une erreur
 */
export async function sendError(
  engine: string,
  message: string,
  impact: 'high' | 'medium' | 'low',
  stack?: string
) {
  try {
    await emit('error-raised', {
      id: `error-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      engine,
      message,
      impact,
      timestamp: new Date().toISOString(),
      resolved: false,
      stack,
    });
  } catch (error) {
    console.error('[MockEvents] Failed to send error:', error);
  }
}

/**
 * Démarre une simulation d'activité système
 *
 * @param intervalMs - Intervalle entre chaque événement (défaut: 2000ms)
 * @returns Fonction pour arrêter la simulation
 *
 * @example
 * ```tsx
 * const stopSimulation = startMockActivity(2000);
 * // Plus tard...
 * stopSimulation();
 * ```
 */
export function startMockActivity(intervalMs = 2000): () => void {
  const engines = [
    'helios',
    'nexus',
    'sentinel',
    'harmonia',
    'memoryCore',
    'orchestrator',
    'style',
    'coherence',
    'engine-omega',
  ];

  const logLevels: LogLevel[] = ['info', 'warn', 'error', 'debug'];
  const logMessages = [
    'Processing request',
    'Cache hit',
    'Memory optimized',
    'Connection established',
    'Task completed',
    'Warning: High CPU usage',
    'Error: Connection timeout',
    'Debug: State updated',
  ];

  let active = true;

  const tick = async () => {
    if (!active) return;

    try {
      // Random engine status update
      if (Math.random() > 0.7) {
        const engine = engines[Math.floor(Math.random() * engines.length)];
        await sendEngineStatusUpdate(engine, {
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 200,
        });
      }

      // Random metric update
      if (Math.random() > 0.5) {
        const metrics = [
          'ipc-latency-p50',
          'ipc-latency-p90',
          'omega-duration',
          'cpu-usage',
          'memory-usage',
        ];
        const metric = metrics[Math.floor(Math.random() * metrics.length)];
        const value = metric.includes('latency')
          ? Math.random() * 100
          : metric.includes('duration')
            ? Math.random() * 500
            : Math.random() * 100;
        await sendMetricUpdate(metric, value);
      }

      // Random log line
      if (Math.random() > 0.3) {
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const message = logMessages[Math.floor(Math.random() * logMessages.length)];
        const source = engines[Math.floor(Math.random() * engines.length)];
        await sendLogLine(level, message, source);
      }

      // Random error (rare)
      if (Math.random() > 0.95) {
        const engine = engines[Math.floor(Math.random() * engines.length)];
        const impacts: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
        const impact = impacts[Math.floor(Math.random() * impacts.length)];
        await sendError(
          engine,
          'Unexpected error occurred',
          impact,
          `Error at ${engine}:42:15\n  at handleRequest (engine.ts:42:15)\n  at process (core.ts:87:20)`
        );
      }
    } catch (error) {
      console.error('[MockEvents] Tick error:', error);
    }

    // Schedule next tick
    if (active) {
      setTimeout(tick, intervalMs);
    }
  };

  // Start simulation
  tick();

  // Return stop function
  return () => {
    active = false;
  };
}
