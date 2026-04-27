import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { PROVIDER_TIMEOUTS } from '@/config/aiTimeouts.config';
import { getActiveAIProviders } from '@/config/featureFlags';
import { loadRegistry } from '@/services/ai/championChallenger';
import { metricsEngine } from '@/services/ai/metricsEngine';
import { autoHealEngine } from '@/services/ai/autoHealEngine';
import { getGovernanceConnector } from '@/services/governance/GovernanceConnector';

const ORCHESTRATOR_TIMELINE_KEY = 'titane_orchestrator_runtime_history';
const ORCHESTRATOR_SESSION_SNAPSHOTS_KEY = 'titane_orchestrator_session_snapshots';
const ORCHESTRATOR_SESSION_ID_KEY = 'titane_orchestrator_session_id';
const ORCHESTRATOR_TIMELINE_LIMIT = 8;
const ORCHESTRATOR_SESSION_LIMIT = 6;
const ORCHESTRATOR_REFRESH_INTERVAL_MS = 15000;

interface OrchestratorTimelinePoint {
  timestamp: number;
  totalRequests: number;
  successRate: number;
  healthyProviders: number;
  providerCount: number;
  totalFallbacks: number;
}

interface OrchestratorSessionSnapshot extends OrchestratorTimelinePoint {
  sessionId: string;
  topProvider: string;
}

function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function loadOrchestratorTimeline(): OrchestratorTimelinePoint[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ORCHESTRATOR_TIMELINE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(point => point && typeof point.timestamp === 'number');
  } catch {
    return [];
  }
}

function getOrchestratorSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const storage = window.sessionStorage;
  const existing = storage.getItem(ORCHESTRATOR_SESSION_ID_KEY);
  if (existing) {
    return existing;
  }

  const sessionId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `orchestrator-${Date.now()}`;
  storage.setItem(ORCHESTRATOR_SESSION_ID_KEY, sessionId);
  return sessionId;
}

function loadOrchestratorSessionSnapshots(): OrchestratorSessionSnapshot[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ORCHESTRATOR_SESSION_SNAPSHOTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      point =>
        point &&
        typeof point.timestamp === 'number' &&
        typeof point.sessionId === 'string'
    );
  } catch {
    return [];
  }
}

function saveOrchestratorSessionSnapshots(history: OrchestratorSessionSnapshot[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    ORCHESTRATOR_SESSION_SNAPSHOTS_KEY,
    JSON.stringify(history)
  );
}

function updateOrchestratorSessionSnapshots(
  snapshot: OrchestratorSessionSnapshot
): OrchestratorSessionSnapshot[] {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const history = loadOrchestratorSessionSnapshots().filter(
    entry => entry.timestamp >= oneDayAgo
  );
  const bySession = new Map(history.map(entry => [entry.sessionId, entry]));
  bySession.set(snapshot.sessionId, snapshot);

  const nextHistory = Array.from(bySession.values())
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, ORCHESTRATOR_SESSION_LIMIT);

  saveOrchestratorSessionSnapshots(nextHistory);
  return nextHistory;
}

function buildChampionBreakdown(
  registry: ReturnType<typeof loadRegistry>
): Array<{ id: string; label: string }> {
  const providerModes = new Map<string, number>();
  const challengerProviders = new Map<string, number>();

  Object.values(registry.champions).forEach(champion => {
    providerModes.set(champion.provider, (providerModes.get(champion.provider) ?? 0) + 1);
  });

  Object.values(registry.challengers)
    .flat()
    .forEach(challenger => {
      challengerProviders.set(
        challenger.provider,
        (challengerProviders.get(challenger.provider) ?? 0) + 1
      );
    });

  return Array.from(providerModes.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([provider, championCount]) => ({
      id: `champion-breakdown-${provider}`,
      label: `${provider}: champion=${championCount} modes · challengers=${challengerProviders.get(provider) ?? 0}`,
    }));
}

export function resetOrchestratorSessionSnapshotsForTests(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ORCHESTRATOR_SESSION_SNAPSHOTS_KEY);
  window.localStorage.removeItem(ORCHESTRATOR_TIMELINE_KEY);
  window.sessionStorage.removeItem(ORCHESTRATOR_SESSION_ID_KEY);
}

function saveOrchestratorTimeline(history: OrchestratorTimelinePoint[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ORCHESTRATOR_TIMELINE_KEY, JSON.stringify(history));
}

function updateOrchestratorTimeline(
  snapshot: OrchestratorTimelinePoint
): OrchestratorTimelinePoint[] {
  const history = loadOrchestratorTimeline();
  const previous = history[history.length - 1];

  if (!previous) {
    const nextHistory = [snapshot];
    saveOrchestratorTimeline(nextHistory);
    return nextHistory;
  }

  const hasMeaningfulChange =
    previous.totalRequests !== snapshot.totalRequests ||
    previous.successRate !== snapshot.successRate ||
    previous.healthyProviders !== snapshot.healthyProviders ||
    previous.totalFallbacks !== snapshot.totalFallbacks;
  const shouldAppend =
    snapshot.timestamp - previous.timestamp >= ORCHESTRATOR_REFRESH_INTERVAL_MS;

  const nextHistory = shouldAppend
    ? [...history, snapshot]
    : hasMeaningfulChange
      ? [...history.slice(0, -1), snapshot]
      : history;
  const boundedHistory = nextHistory.slice(-ORCHESTRATOR_TIMELINE_LIMIT);

  saveOrchestratorTimeline(boundedHistory);
  return boundedHistory;
}

export function getOrchestratorDashboardRefreshIntervalMs(): number {
  return ORCHESTRATOR_REFRESH_INTERVAL_MS;
}

export function getOrchestratorAgentStatus() {
  const base = getAdvancedAgentStatus('orchestrator');
  const activeProviders = getActiveAIProviders();
  const registry = loadRegistry();
  const governance = getGovernanceConnector();
  const metrics = metricsEngine.getAggregatedMetrics();
  const metricsHealth = metricsEngine.getHealthStats();
  const autoHealStats = autoHealEngine.getStats();
  const providerSnapshots = governance
    .getAllProviders()
    .filter(
      provider => provider.isActive || provider.id === 'local' || provider.id === 'tauri'
    );
  const localChampionCount = Object.values(registry.champions).filter(
    champion => champion.provider === 'ollama'
  ).length;
  const healthyProviders = providerSnapshots.filter(
    provider => provider.isHealthy
  ).length;
  const currentSnapshot: OrchestratorTimelinePoint = {
    timestamp: Date.now(),
    totalRequests: metrics.totalRequests,
    successRate: Number(metrics.successRate.toFixed(1)),
    healthyProviders,
    providerCount: providerSnapshots.length,
    totalFallbacks: metrics.totalFallbacks,
  };
  const timeline = updateOrchestratorTimeline(currentSnapshot);
  const topProviderLoads = [...metrics.providers]
    .sort((left, right) => right.totalRequests - left.totalRequests)
    .slice(0, 3);
  const sessionSnapshots = updateOrchestratorSessionSnapshots({
    ...currentSnapshot,
    sessionId: getOrchestratorSessionId(),
    topProvider: topProviderLoads[0]?.provider ?? 'none',
  });
  const championBreakdown = buildChampionBreakdown(registry);

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `${activeProviders.length} providers actifs · ${healthyProviders}/${providerSnapshots.length} snapshots healthy · ${metrics.totalRequests} requetes tracees · ${sessionSnapshots.length} sessions locales`,
    evidence: [
      `Runtime: providers actifs ${activeProviders.join(', ')}.`,
      `Runtime: timeout Ollama ${PROVIDER_TIMEOUTS.ollama / 1000}s · tauri-backend ${PROVIDER_TIMEOUTS['tauri-backend'] / 1000}s.`,
      `Runtime: charge ${metrics.totalRequests} req · succes ${metrics.successRate.toFixed(1)}% · latence moyenne ${Math.round(metrics.avgResponseTime)} ms.`,
      `Runtime: refresh borne ${Math.round(ORCHESTRATOR_REFRESH_INTERVAL_MS / 1000)}s sur la serie temporelle locale du dashboard.`,
      `Runtime: federation locale ${sessionSnapshots.length}/${ORCHESTRATOR_SESSION_LIMIT} sessions comparees sans export backend partage.`,
      `Registre: ${localChampionCount}/${Object.keys(registry.champions).length} modes canoniques restent routes vers un champion Ollama local avec challengers cloud bornes.`,
      ...base.evidence,
    ],
    blockers: [
      'La comparaison multi-session et la ventilation champion/challenger restent locales au navigateur: aucun export compare ni federation backend n est encore publie.',
    ],
    nextStep:
      'Etendre la serie temporelle a des comparaisons multi-session et a une ventilation champion/challenger par provider.',
    detailSections: [
      {
        key: 'live-metrics',
        title: 'Metriques live',
        items: [
          {
            id: 'live-metrics-charge',
            label: `Charge: ${metrics.totalRequests} requetes totales · ${metrics.last24h.requests} sur 24h · ${metrics.totalFallbacks} fallbacks.`,
          },
          {
            id: 'live-metrics-health',
            label: `Sante: ${metricsHealth.overall} · succes ${metrics.successRate.toFixed(1)}% · latence moyenne ${Math.round(metrics.avgResponseTime)} ms.`,
          },
          {
            id: 'live-metrics-autoheal',
            label: `Auto-heal: score ${autoHealStats.healthScore}/100 · erreurs ${autoHealStats.totalErrors} · heals ${autoHealStats.totalHeals}.`,
          },
          {
            id: 'live-metrics-provider-load',
            label: `Charge providers: ${topProviderLoads.length > 0 ? topProviderLoads.map(provider => `${provider.provider}=${provider.totalRequests}`).join(' | ') : 'no provider traffic yet'}`,
          },
        ],
      },
      {
        key: 'provider-snapshots',
        title: 'Snapshots health providers',
        items: providerSnapshots.slice(0, 6).map(provider => {
          const lastFailureAgo =
            provider.lastFailure && provider.lastFailure > 0
              ? `${Math.max(1, Math.round((Date.now() - provider.lastFailure) / 1000))}s`
              : 'none';

          return {
            id: `provider-snapshot-${provider.id}`,
            label: `${provider.id}: configured=${provider.isConfigured ? 'yes' : 'no'} · active=${provider.isActive ? 'yes' : 'no'} · healthy=${provider.isHealthy ? 'yes' : 'no'} · fails=${provider.failureCount} · consecutive=${provider.consecutiveFailures} · lastFailureAgo=${lastFailureAgo}`,
          };
        }),
      },
      {
        key: 'live-timeline',
        title: 'Serie temporelle bornee',
        items: timeline.map(point => ({
          id: `timeline-${point.timestamp}`,
          label: `${formatClock(point.timestamp)} · req=${point.totalRequests} · success=${point.successRate.toFixed(1)}% · healthy=${point.healthyProviders}/${point.providerCount} · fallback=${point.totalFallbacks}`,
        })),
      },
      {
        key: 'multi-session-compare',
        title: 'Comparaison multi-session locale',
        items: sessionSnapshots.map(snapshot => ({
          id: `multi-session-${snapshot.sessionId}`,
          label: `${snapshot.sessionId}: ${formatClock(snapshot.timestamp)} · req=${snapshot.totalRequests} · success=${snapshot.successRate.toFixed(1)}% · healthy=${snapshot.healthyProviders}/${snapshot.providerCount} · topProvider=${snapshot.topProvider}`,
        })),
      },
      {
        key: 'champion-breakdown',
        title: 'Ventilation champion/challenger',
        items:
          championBreakdown.length > 0
            ? championBreakdown
            : [
                {
                  id: 'champion-breakdown-empty',
                  label:
                    'Aucune ventilation champion/challenger exploitable n est encore disponible.',
                },
              ],
      },
    ],
  };
}

export function startOrchestratorAgent() {
  return getOrchestratorAgentStatus();
}

// ═══════════════════════════════════════════════════════════════
// PARALLEL AGENT EVENT BUS (Phase B1 — 2026-04-27)
// GAP 1 fix: parallel dispatch via Promise.allSettled()
// ═══════════════════════════════════════════════════════════════

/** Classification of runtime event triggering a consensus round. */
export type AgentEventType =
  | 'build'
  | 'ring0_change'
  | 'ipc_tier3'
  | 'security_alert'
  | 'anomaly_detected'
  | 'health_check';

/** Structured event broadcast to all agents for consensus. */
export interface AgentEvent {
  type: AgentEventType;
  payload: unknown;
  timestamp: number;
  /** Source component or subsystem that emitted the event. */
  source: string;
}

/** Per-agent classification returned after consensus round. */
export type AgentVerdict = 'PASS' | 'FAIL' | 'BLOCKED' | 'UNKNOWN';

/** Aggregated consensus across all agents for a given AgentEvent. */
export interface AgentConsensus {
  /** Per-agent verdicts keyed by agent name. */
  verdicts: Record<string, AgentVerdict>;
  /** Aggregated verdict: FAIL if any agent fails, BLOCKED if any is blocked, else PASS. */
  aggregated: 'PASS' | 'FAIL' | 'BLOCKED';
  /** Human-readable blocker descriptions collected from FAIL/BLOCKED agents. */
  blockers: string[];
  timestamp: number;
}

type AgentStatusFn = () => { readiness?: string; blockers?: string[] };

/**
 * Dispatch an AgentEvent to all registered agents in parallel.
 * Uses Promise.allSettled() so a failing agent never blocks the verdict.
 */
export async function dispatchToAgents(event: AgentEvent): Promise<AgentConsensus> {
  // Lazy dynamic imports to avoid circular deps and keep bundle lean.
  const [monitoringMod, diagnosticMod, securityMod] = await Promise.allSettled([
    import('@/services/monitoring').then(m => m.getMonitoringAgentStatus as AgentStatusFn),
    import('@/services/diagnostic').then(m => m.getDiagnosticAgentStatus as AgentStatusFn),
    import('@/services/security_active').then(m => m.getSecurityActiveAgentStatus as AgentStatusFn),
  ]);

  const agentMap: Record<string, PromiseSettledResult<AgentStatusFn>> = {
    monitoring: monitoringMod,
    diagnostic: diagnosticMod,
    security: securityMod,
  };

  const verdicts: Record<string, AgentVerdict> = {};
  const blockers: string[] = [];

  for (const [name, result] of Object.entries(agentMap)) {
    if (result.status === 'rejected') {
      verdicts[name] = 'UNKNOWN';
      blockers.push(`Agent ${name} load failed: ${String(result.reason)}`);
      continue;
    }

    try {
      const statusFn = result.value;
      const status = statusFn();
      const readiness = status?.readiness ?? 'unknown';

      if (readiness === 'ready' || readiness === 'partial') {
        verdicts[name] = 'PASS';
      } else if (readiness === 'blocked') {
        verdicts[name] = 'BLOCKED';
        (status?.blockers ?? []).forEach(b => blockers.push(`[${name}] ${b}`));
      } else {
        verdicts[name] = 'FAIL';
        blockers.push(`Agent ${name} readiness: ${readiness}`);
      }
    } catch (err) {
      verdicts[name] = 'UNKNOWN';
      blockers.push(`Agent ${name} threw: ${String(err)}`);
    }
  }

  // Aggregation: FAIL > BLOCKED > PASS
  let aggregated: 'PASS' | 'FAIL' | 'BLOCKED' = 'PASS';
  const vals = Object.values(verdicts);
  if (vals.includes('FAIL')) aggregated = 'FAIL';
  else if (vals.includes('BLOCKED')) aggregated = 'BLOCKED';

  return {
    verdicts,
    aggregated,
    blockers,
    timestamp: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase F3 — Timeout-aware dispatch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatch an AgentEvent with a per-agent timeout guard.
 * If the overall dispatch exceeds `timeoutMs`, the consensus is returned with
 * a BLOCKED verdict and a timeout blocker entry.
 *
 * @param event     - The AgentEvent to dispatch.
 * @param timeoutMs - Max milliseconds to wait (default: 5000ms).
 */
export async function dispatchToAgentsWithTimeout(
  event: AgentEvent,
  timeoutMs = 5000
): Promise<AgentConsensus> {
  const timeoutPromise: Promise<AgentConsensus> = new Promise(resolve =>
    setTimeout(
      () =>
        resolve({
          verdicts: { timeout: 'BLOCKED' },
          aggregated: 'BLOCKED',
          blockers: [`dispatchToAgents timed out after ${timeoutMs}ms`],
          timestamp: Date.now(),
        }),
      timeoutMs
    )
  );

  return Promise.race([dispatchToAgents(event), timeoutPromise]);
}
