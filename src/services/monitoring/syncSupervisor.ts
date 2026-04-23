/**
 * TITANE∞ — Monitoring Sync Supervisor
 * Supervise la cohérence runtime entre les signaux backend (system store)
 * et les signaux frontend monitoring (métriques + alertes).
 */

import { useSystemStore } from '@/stores/systemStore';
import { chatMetrics } from './chatMetrics';
import { logger } from './logger';

export type MonitoringSyncState = 'synced' | 'stale' | 'desync';

export interface MonitoringSyncSnapshot {
  state: MonitoringSyncState;
  label: 'SYNCED' | 'STALE' | 'DESYNC';
  backendLastUpdateAt: number | null;
  frontendLastEventAt: number | null;
  backendAgeMs: number | null;
  frontendAgeMs: number | null;
  driftMs: number | null;
  desyncCount: number;
  reason: string;
}

const BACKEND_STALE_AFTER_MS = 45_000;
const FRONTEND_STALE_AFTER_MS = 45_000;
const DESYNC_DRIFT_MS = 30_000;

let lastState: MonitoringSyncState | null = null;
let desyncCount = 0;

function resolveLabel(state: MonitoringSyncState): MonitoringSyncSnapshot['label'] {
  switch (state) {
    case 'synced':
      return 'SYNCED';
    case 'stale':
      return 'STALE';
    case 'desync':
      return 'DESYNC';
  }
}

function parseIsoTimestamp(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return null;
  }

  return timestamp;
}

export function getMonitoringSyncSnapshot(params?: {
  activeAlertCount?: number;
}): MonitoringSyncSnapshot {
  const now = Date.now();
  const systemState = useSystemStore.getState();
  const backendLastUpdateAt = systemState.lastUpdate ?? null;
  const frontendLastEvent = chatMetrics.getRecentEvents(1)[0];
  const frontendLastEventAt = parseIsoTimestamp(frontendLastEvent?.timestamp);

  const backendAgeMs =
    backendLastUpdateAt === null ? null : Math.max(0, now - backendLastUpdateAt);
  const frontendAgeMs =
    frontendLastEventAt === null ? null : Math.max(0, now - frontendLastEventAt);
  const driftMs =
    backendLastUpdateAt !== null && frontendLastEventAt !== null
      ? Math.abs(backendLastUpdateAt - frontendLastEventAt)
      : null;

  const backendMissing = backendLastUpdateAt === null;
  const frontendMissing = frontendLastEventAt === null;
  const backendStale = backendAgeMs !== null && backendAgeMs > BACKEND_STALE_AFTER_MS;
  const frontendStale = frontendAgeMs !== null && frontendAgeMs > FRONTEND_STALE_AFTER_MS;
  const driftDetected = driftMs !== null && driftMs > DESYNC_DRIFT_MS;
  const hasActiveAlerts = (params?.activeAlertCount ?? 0) > 0;

  let state: MonitoringSyncState = 'synced';
  let reason = 'Synchronisation active entre heartbeat backend et événements monitoring.';

  if (
    driftDetected ||
    (backendLastUpdateAt !== null && frontendMissing && hasActiveAlerts)
  ) {
    state = 'desync';
    reason =
      'Desynchronisation detectee entre le heartbeat backend et la timeline monitoring frontend.';
  } else if (backendMissing || frontendMissing || backendStale || frontendStale) {
    state = 'stale';
    reason =
      'Synchronisation partielle: au moins un signal runtime est manquant ou trop ancien.';
  }

  if (state === 'desync' && lastState !== 'desync') {
    desyncCount += 1;
    logger.warn(
      'Desynchronisation UI/backend detectee par le monitoring sync supervisor',
      'monitoring.syncSupervisor',
      {
        backendLastUpdateAt,
        frontendLastEventAt,
        backendAgeMs,
        frontendAgeMs,
        driftMs,
      }
    );
  }

  if (state !== lastState) {
    logger.info('Monitoring sync supervisor state updated', 'monitoring.syncSupervisor', {
      previous: lastState,
      next: state,
      reason,
    });
    lastState = state;
  }

  return {
    state,
    label: resolveLabel(state),
    backendLastUpdateAt,
    frontendLastEventAt,
    backendAgeMs,
    frontendAgeMs,
    driftMs,
    desyncCount,
    reason,
  };
}

export function resetMonitoringSyncSupervisorForTests(): void {
  lastState = null;
  desyncCount = 0;
}
