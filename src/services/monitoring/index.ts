/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   MONITORING MODULE - Lazy Loader Exports (OPT-9)
 *   Monitoring infrastructure lazy-loaded to reduce main bundle
 * ═══════════════════════════════════════════════════════════════
 */

import {
  addBreadcrumb,
  captureClassifiedError,
  captureMessage,
  clearUser,
  getMonitoring,
  getMonitoringIfLoaded,
  getMonitoringLazyLoaderState,
  initMonitoringAsync,
  isMonitoringLoaded,
  profileAsync,
  profileSync,
  resetMonitoringLazyLoaderStateForTests,
  setContext,
  setTag,
  setUser,
  startTransaction,
} from './monitoringLazyLoader';

import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { safeInvoke } from '@/utils/invoke';
import { chatMetrics } from './chatMetrics';
import { alerting } from './alerting';
import { getMonitoringSyncSnapshot } from './syncSupervisor';

export function getMonitoringAgentStatus() {
  const base = getAdvancedAgentStatus('monitoring');
  const globalMetrics = chatMetrics.getGlobalMetrics();
  const activeAlerts = alerting.getActiveAlerts().filter(alert => !alert.resolved);
  const syncSnapshot = getMonitoringSyncSnapshot({
    activeAlertCount: activeAlerts.length,
  });
  const loaderState = getMonitoringLazyLoaderState();
  const monitoringLoaded = isMonitoringLoaded();
  const hasRuntimeSignals =
    monitoringLoaded ||
    loaderState.requested ||
    activeAlerts.length > 0 ||
    globalMetrics.totalMessages > 0 ||
    globalMetrics.totalErrors > 0;
  const loaderSummary = monitoringLoaded
    ? 'initialise'
    : loaderState.loading
      ? 'demarre'
      : loaderState.requestSource === 'boot'
        ? 'demande au boot'
        : 'en attente';
  const loaderSource = loaderState.requestSource ?? 'none';

  return {
    ...base,
    readiness: hasRuntimeSignals ? 'partial' : base.readiness,
    readinessLabel: hasRuntimeSignals ? 'PARTIAL' : base.readinessLabel,
    serviceState: `Monitoring ${monitoringLoaded ? 'charge' : loaderState.loading ? 'initialisation en cours' : 'en veille'} · Sync ${syncSnapshot.label} · ${activeAlerts.length} alertes actives · ${globalMetrics.totalMessages} messages traces`,
    evidence: [
      `Runtime Sync: ${syncSnapshot.label} (backend=${syncSnapshot.backendAgeMs === null ? 'n/a' : `${Math.round(syncSnapshot.backendAgeMs / 1000)}s`} · frontend=${syncSnapshot.frontendAgeMs === null ? 'n/a' : `${Math.round(syncSnapshot.frontendAgeMs / 1000)}s`} · drift=${syncSnapshot.driftMs === null ? 'n/a' : `${Math.round(syncSnapshot.driftMs / 1000)}s`}).`,
      `Runtime: lazy-loader ${loaderSummary} via ${loaderSource}.`,
      `Runtime: ${globalMetrics.activeConversations}/${globalMetrics.totalConversations} conversations actives dans le buffer de metriques.`,
      `Runtime: validation ${(globalMetrics.validationRate * 100).toFixed(1)}% · erreurs ${globalMetrics.totalErrors} · latence moyenne ${Math.round(globalMetrics.avgResponseTime)} ms.`,
      ...base.evidence,
    ],
    blockers: monitoringLoaded
      ? base.blockers
      : loaderState.requestSource === 'boot'
        ? [
            'Le lazy loader monitoring a bien ete demande au boot canonique, mais il n est pas encore initialise sur cette session runtime.',
            ...base.blockers,
          ]
        : [
            'Le lazy loader monitoring n est pas encore initialise sur cette session runtime.',
            ...base.blockers,
          ],
    nextStep: monitoringLoaded
      ? syncSnapshot.state === 'desync'
        ? 'Resynchroniser la source backend (system store) et les evenements monitoring frontend pour supprimer la derive runtime.'
        : 'Connecter le flux live des metriques et alertes puis publier les metriques live dans le dashboard canonique.'
      : loaderState.requestSource === 'boot'
        ? 'Finaliser le bootstrap du monitoring puis publier les metriques live dans le dashboard canonique.'
        : 'Initialiser le monitoring paresseux au boot canonique puis publier les metriques live dans le dashboard.',
    syncSnapshot,
  };
}

export {
  addBreadcrumb,
  captureClassifiedError,
  captureMessage,
  clearUser,
  getMonitoring,
  getMonitoringIfLoaded,
  initMonitoringAsync,
  isMonitoringLoaded,
  profileAsync,
  profileSync,
  resetMonitoringLazyLoaderStateForTests,
  setContext,
  setTag,
  setUser,
  startTransaction,
};

// ═══════════════════════════════════════════════════════════════
// PROJECT HEALTH METRICS (Phase B2 — 2026-04-27)
// GAP 4 fix: cross-session metrics from autoheal + ui-events
// ═══════════════════════════════════════════════════════════════

/** Three cross-session health indicators derived from governance registries. */
export interface ProjectHealthMetrics {
  /** Rate of recurring autoheal incidents (0–1, higher = worse). */
  incidentRecurrenceRate: number;
  /** Ring layer most frequently appearing in ui-events.jsonl. */
  mostImpactedRing: string;
  /**
   * Approximate lead time from first phase commit to proof completion in minutes.
   * Classified as 'approximation' when no structured index is available.
   */
  avgLeadTimeMinutes: number;
  /** ISO timestamp of last computation. */
  computedAt: string;
  /** Evidence note for dashboard — honesty label on approximations. */
  evidenceNote: string;
}

let _projectHealthCache: ProjectHealthMetrics | null = null;
let _projectHealthComputedAt = 0;
const PROJECT_HEALTH_TTL_MS = 15 * 60 * 1000; // 15 min

/** Reset the health metrics cache. For use in unit tests only. */
export function resetProjectHealthMetricsCacheForTests(): void {
  _projectHealthCache = null;
  _projectHealthComputedAt = 0;
}

/**
 * Force a fresh computation of project health metrics, bypassing the 15-min TTL.
 * Use for manual dashboard refresh actions.
 */
export async function forceRefreshProjectHealthMetrics(): Promise<ProjectHealthMetrics> {
  _projectHealthCache = null;
  _projectHealthComputedAt = 0;
  return getProjectHealthMetrics();
}

/**
 * Read cross-session health metrics from governance registries.
 * Falls back to stubs with honest evidence labels when registries are unavailable
 * (desktop runtime without file access, or first boot).
 */
export async function getProjectHealthMetrics(): Promise<ProjectHealthMetrics> {
  const now = Date.now();
  if (_projectHealthCache && now - _projectHealthComputedAt < PROJECT_HEALTH_TTL_MS) {
    return _projectHealthCache;
  }

  try {
    const [autohealRaw, uiEventsRaw] = await Promise.allSettled([
      safeInvoke<string>('read_json_file', {
        path: 'scripts/autoheal/autoheal_rules.jsonl',
        relative: true,
      }),
      safeInvoke<string>('read_json_file', {
        path: 'registry/ui-events.jsonl',
        relative: true,
      }),
    ]);

    // ── Incident recurrence rate from autoheal ────────────────
    let incidentRecurrenceRate = 0;
    if (autohealRaw.status === 'fulfilled') {
      const lines = String(autohealRaw.value)
        .split('\n')
        .filter(l => l.trim().startsWith('{'));
      const entries = lines.flatMap(l => {
        try {
          return [JSON.parse(l) as { prevention_test?: string }];
        } catch {
          return [];
        }
      });
      const withRecurrence = entries.filter(e =>
        typeof e.prevention_test === 'string' && e.prevention_test.includes('detect_recurrence')
      ).length;
      incidentRecurrenceRate = entries.length > 0 ? withRecurrence / entries.length : 0;
    }

    // ── Most impacted ring from ui-events ─────────────────────
    let mostImpactedRing = 'unknown';
    if (uiEventsRaw.status === 'fulfilled') {
      const ringCounts: Record<string, number> = {};
      const lines = String(uiEventsRaw.value)
        .split('\n')
        .filter(l => l.trim().startsWith('{'));
      for (const line of lines) {
        try {
          const ev = JSON.parse(line) as { ring?: string };
          if (ev.ring) {
            ringCounts[ev.ring] = (ringCounts[ev.ring] ?? 0) + 1;
          }
        } catch {
          // skip malformed lines
        }
      }
      const sorted = Object.entries(ringCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        mostImpactedRing = sorted[0]![0];
      }
    }

    const metrics: ProjectHealthMetrics = {
      incidentRecurrenceRate: Math.round(incidentRecurrenceRate * 1000) / 1000,
      mostImpactedRing,
      // Lead time is approximated without structured phase index.
      avgLeadTimeMinutes: 0,
      computedAt: new Date().toISOString(),
      evidenceNote:
        'Incident recurrence derived from autoheal_rules.jsonl (detect_recurrence marker). ' +
        'Lead time: approximation only — no phase-to-proof index available.',
    };

    _projectHealthCache = metrics;
    _projectHealthComputedAt = now;
    return metrics;
  } catch {
    // Fallback for browser-only dev environments where Tauri IPC is unavailable.
    const fallback: ProjectHealthMetrics = {
      incidentRecurrenceRate: 0,
      mostImpactedRing: 'unavailable',
      avgLeadTimeMinutes: 0,
      computedAt: new Date().toISOString(),
      evidenceNote: 'IPC unavailable — running outside Tauri runtime or registries not found.',
    };
    return fallback;
  }
}

// ✅ OPT-9 FIX: All exports now through lazy loader (no static sentry.ts import)
// Removed: export { initSentry, captureWebVitals, testSentry, Sentry } from './sentry';
// Use: initMonitoringAsync() instead of initSentry() for lazy initialization

// ═══════════════════════════════════════════════════════════════
// AGENT HEALTH MATRIX — v31.2.14
// Supervision croisée des 5 agents avancés avec heartbeat proactif
// ═══════════════════════════════════════════════════════════════

export type AgentHealthStatus = 'healthy' | 'degraded' | 'offline' | 'unknown';

export interface AgentHealthEntry {
  id: string;
  status: AgentHealthStatus;
  readiness: string;
  lastCheckedAt: number;
  lastChangedAt: number;
  consecutiveDegradations: number;
  blockers: string[];
  evidence: string;
}

export interface AgentHealthMatrix {
  agents: Record<string, AgentHealthEntry>;
  overallHealth: AgentHealthStatus;
  degradedCount: number;
  offlineCount: number;
  lastRefreshedAt: number;
  alertTriggers: string[];
}

type AgentStatusGetter = () => {
  readiness?: string;
  blockers?: string[];
  serviceState?: string;
  evidence?: string[];
};

const HEALTH_MATRIX_STORAGE_KEY = 'titane_agent_health_matrix';
const HEARTBEAT_INTERVAL_MS = 30_000; // 30 s
const DEGRADATION_ALERT_THRESHOLD = 2; // N consecutifs → alerte

let _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let _degradationCallbacks: Array<(entry: AgentHealthEntry) => void> = [];
let _healthMatrix: AgentHealthMatrix | null = null;

function resolveAgentHealth(readiness?: string): AgentHealthStatus {
  if (readiness === 'qualified') return 'healthy';
  if (readiness === 'partial') return 'degraded';
  if (readiness === 'planned') return 'offline';
  return 'unknown';
}

function loadStoredMatrix(): AgentHealthMatrix | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HEALTH_MATRIX_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AgentHealthMatrix) : null;
  } catch {
    return null;
  }
}

function saveMatrix(matrix: AgentHealthMatrix): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HEALTH_MATRIX_STORAGE_KEY, JSON.stringify(matrix));
  } catch {
    // storage full or blocked
  }
}

/**
 * Probe all 5 advanced agents and return the consolidated health matrix.
 * Uses dynamic imports to avoid circular deps.
 */
export async function refreshAgentHealthMatrix(): Promise<AgentHealthMatrix> {
  const now = Date.now();
  const stored = _healthMatrix ?? loadStoredMatrix();
  const agents: Record<string, AgentHealthEntry> = {};

  const agentLoaders: Array<{ id: string; loader: () => Promise<AgentStatusGetter> }> = [
    { id: 'monitoring', loader: () => import('@/services/monitoring').then(m => m.getMonitoringAgentStatus as AgentStatusGetter) },
    { id: 'diagnostic', loader: () => import('@/services/diagnostic').then(m => m.getDiagnosticAgentStatus as AgentStatusGetter) },
    { id: 'explainability', loader: () => import('@/services/explainability').then(m => m.getExplainabilityAgentStatus as AgentStatusGetter) },
    { id: 'orchestrator', loader: () => import('@/services/orchestrator').then(m => m.getOrchestratorAgentStatus as AgentStatusGetter) },
    { id: 'security_active', loader: () => import('@/services/security_active').then(m => m.getSecurityActiveAgentStatus as AgentStatusGetter) },
  ];

  const results = await Promise.allSettled(
    agentLoaders.map(async ({ id, loader }) => {
      const fn = await loader();
      const status = fn();
      return { id, status };
    })
  );

  const alertTriggers: string[] = [];

  for (const result of results) {
    if (result.status === 'rejected') {
      const id = agentLoaders[results.indexOf(result)]?.id ?? 'unknown';
      const prev = stored?.agents?.[id];
      agents[id] = {
        id,
        status: 'offline',
        readiness: 'unknown',
        lastCheckedAt: now,
        lastChangedAt: prev?.status !== 'offline' ? now : (prev?.lastChangedAt ?? now),
        consecutiveDegradations: (prev?.consecutiveDegradations ?? 0) + 1,
        blockers: [`Agent ${id} load failed: ${String(result.reason)}`],
        evidence: 'Import failed',
      };
      continue;
    }

    const { id, status } = result.value;
    const healthStatus = resolveAgentHealth(status?.readiness);
    const prev = stored?.agents?.[id];
    const prevStatus = prev?.status ?? 'unknown';
    const consecutiveDegradations =
      healthStatus === 'healthy'
        ? 0
        : (prev?.consecutiveDegradations ?? 0) + 1;
    const lastChangedAt = prevStatus !== healthStatus ? now : (prev?.lastChangedAt ?? now);

    agents[id] = {
      id,
      status: healthStatus,
      readiness: status?.readiness ?? 'unknown',
      lastCheckedAt: now,
      lastChangedAt,
      consecutiveDegradations,
      blockers: status?.blockers?.slice(0, 3) ?? [],
      evidence: status?.evidence?.[0] ?? status?.serviceState ?? 'no evidence',
    };

    // Fire degradation callbacks
    if (
      consecutiveDegradations >= DEGRADATION_ALERT_THRESHOLD &&
      healthStatus !== 'healthy'
    ) {
      alertTriggers.push(`Agent ${id} dégradé x${consecutiveDegradations} (${healthStatus})`);
      _degradationCallbacks.forEach(cb => cb(agents[id]!));
    }
  }

  const healthStatuses = Object.values(agents).map(a => a.status);
  const offlineCount = healthStatuses.filter(s => s === 'offline').length;
  const degradedCount = healthStatuses.filter(s => s === 'degraded').length;
  const overallHealth: AgentHealthStatus =
    offlineCount > 0 ? 'offline' :
    degradedCount > 1 ? 'degraded' :
    degradedCount === 1 ? 'degraded' :
    'healthy';

  const matrix: AgentHealthMatrix = {
    agents,
    overallHealth,
    degradedCount,
    offlineCount,
    lastRefreshedAt: now,
    alertTriggers,
  };

  _healthMatrix = matrix;
  saveMatrix(matrix);
  return matrix;
}

/** Get the last known health matrix (synchronous, no probe). */
export function getLastAgentHealthMatrix(): AgentHealthMatrix | null {
  return _healthMatrix ?? loadStoredMatrix();
}

/** Register a callback fired when an agent reaches DEGRADATION_ALERT_THRESHOLD. */
export function onAgentDegraded(cb: (entry: AgentHealthEntry) => void): () => void {
  _degradationCallbacks.push(cb);
  return () => {
    _degradationCallbacks = _degradationCallbacks.filter(fn => fn !== cb);
  };
}

/**
 * Start the proactive heartbeat loop (30s interval).
 * Safe to call multiple times — idempotent.
 */
export function startAgentHeartbeatLoop(): void {
  if (_heartbeatTimer !== null) return;
  // Initial probe at start
  void refreshAgentHealthMatrix();
  _heartbeatTimer = setInterval(() => {
    void refreshAgentHealthMatrix();
  }, HEARTBEAT_INTERVAL_MS);
}

/** Stop the heartbeat loop. */
export function stopAgentHeartbeatLoop(): void {
  if (_heartbeatTimer !== null) {
    clearInterval(_heartbeatTimer);
    _heartbeatTimer = null;
  }
}

/** Reset for tests */
export function resetAgentHealthMatrixForTests(): void {
  stopAgentHeartbeatLoop();
  _healthMatrix = null;
  _degradationCallbacks = [];
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(HEALTH_MATRIX_STORAGE_KEY);
  }
}
