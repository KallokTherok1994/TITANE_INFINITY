import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { FEATURE_FLAGS, getActiveAIProviders } from '@/config/featureFlags';
import { getTransportMode } from '@/services/ai/transports/ollamaTransport';
import { aiHealthMonitor } from '@/services/ai/healthMonitor';
import { performanceAlerts } from '@/services/ai/performanceAlerts';
import { PredictiveAlerts } from '@/lib/predictiveAlerts';
import { uiLogger } from '@/lib/UILogger';
import { getGovernanceConnector } from '@/services/governance/GovernanceConnector';

const SECURITY_EVENT_HISTORY_KEY = 'titane_security_dashboard_event_history';
const SECURITY_ACKNOWLEDGED_EVENT_IDS_KEY = 'titane_security_dashboard_acknowledged';
const SECURITY_HISTORY_LIMIT = 40;
const SECURITY_REFRESH_INTERVAL_MS = 10000;

type SecurityEventCategory = 'detection' | 'containment';
type SecurityEventSeverity = 'info' | 'warning' | 'critical';

interface SecurityDashboardEvent {
  id: string;
  category: SecurityEventCategory;
  severity: SecurityEventSeverity;
  source: string;
  message: string;
  correlationKey: string;
  timestamp: number;
  lastSeen: number;
  acknowledged: boolean;
}

function loadSecurityAcknowledgedIds(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(SECURITY_ACKNOWLEDGED_EVENT_IDS_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function saveSecurityAcknowledgedIds(ids: Set<string>): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    SECURITY_ACKNOWLEDGED_EVENT_IDS_KEY,
    JSON.stringify(Array.from(ids))
  );
}

function loadSecurityEventHistory(): SecurityDashboardEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SECURITY_EVENT_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSecurityEventHistory(history: SecurityDashboardEvent[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SECURITY_EVENT_HISTORY_KEY, JSON.stringify(history));
}

function mergeSecurityEventHistory(
  currentEvents: SecurityDashboardEvent[]
): SecurityDashboardEvent[] {
  const now = Date.now();
  const acknowledgedIds = loadSecurityAcknowledgedIds();
  const history = loadSecurityEventHistory();
  const merged = new Map<string, SecurityDashboardEvent>();

  history.forEach(event => {
    merged.set(event.id, {
      ...event,
      acknowledged: event.acknowledged || acknowledgedIds.has(event.id),
    });
  });

  currentEvents.forEach(event => {
    const existing = merged.get(event.id);
    merged.set(event.id, {
      ...event,
      timestamp: existing?.timestamp ?? event.timestamp,
      lastSeen: now,
      acknowledged: existing?.acknowledged || acknowledgedIds.has(event.id),
    });
  });

  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const boundedHistory = Array.from(merged.values())
    .filter(event => event.lastSeen >= oneDayAgo)
    .sort((left, right) => right.lastSeen - left.lastSeen)
    .slice(0, SECURITY_HISTORY_LIMIT);

  saveSecurityEventHistory(boundedHistory);
  return boundedHistory;
}

function formatEventTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getCorrelationSummary(history: SecurityDashboardEvent[]): Array<{
  key: string;
  detectionCount: number;
  containmentCount: number;
  openCount: number;
}> {
  const groups = new Map<
    string,
    { detectionCount: number; containmentCount: number; openCount: number }
  >();

  history.forEach(event => {
    const key = event.correlationKey;
    const existing = groups.get(key) ?? {
      detectionCount: 0,
      containmentCount: 0,
      openCount: 0,
    };

    if (event.category === 'detection') {
      existing.detectionCount += 1;
    } else {
      existing.containmentCount += 1;
    }

    if (!event.acknowledged) {
      existing.openCount += 1;
    }

    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((left, right) => right.openCount - left.openCount || right.detectionCount + right.containmentCount - (left.detectionCount + left.containmentCount))
    .slice(0, 4);
}

export function acknowledgeSecurityDashboardEvent(eventId: string): void {
  const acknowledgedIds = loadSecurityAcknowledgedIds();
  acknowledgedIds.add(eventId);
  saveSecurityAcknowledgedIds(acknowledgedIds);

  const history = loadSecurityEventHistory().map(event =>
    event.id === eventId ? { ...event, acknowledged: true } : event
  );
  saveSecurityEventHistory(history);
}

export function getSecurityDashboardRefreshIntervalMs(): number {
  return SECURITY_REFRESH_INTERVAL_MS;
}

export function getSecurityActiveAgentStatus() {
  const base = getAdvancedAgentStatus('security_active');
  const transportMode = getTransportMode();
  const activeProviders = getActiveAIProviders();
  const governance = getGovernanceConnector();
  const healthAlerts = aiHealthMonitor.getActiveAlerts().slice(0, 3);
  const performanceEvents = performanceAlerts.getAlerts(3);
  const predictiveEvents = PredictiveAlerts.getAlerts('high').slice(0, 3);
  const securityLogs = uiLogger.getLogs({ level: 'security', limit: 3 });
  const containmentProviders = governance
    .getAllProviders()
    .filter(provider => !provider.isHealthy || !provider.isActive)
    .slice(0, 3);
  const oneDoorHealthy = transportMode.toUpperCase() === 'IPC';
  const now = Date.now();
  const currentEvents: SecurityDashboardEvent[] = [
    ...securityLogs.map((entry, index) => ({
      id: `ui-security-${entry.timestamp}-${index}`,
      category: 'detection' as const,
      severity: 'warning' as const,
      source: 'uiLogger',
      message: `UILogger:${entry.message}`,
      correlationKey: String(entry.context?.scope ?? entry.sessionId ?? 'ui-security'),
      timestamp: entry.timestamp,
      lastSeen: entry.timestamp,
      acknowledged: false,
    })),
    ...healthAlerts.map(alert => ({
      id: `health-${alert.id}`,
      category: 'detection' as const,
      severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info',
      source: 'health',
      message: `Health:${alert.severity}:${alert.title}`,
      correlationKey: alert.component,
      timestamp: alert.timestamp,
      lastSeen: alert.timestamp,
      acknowledged: false,
    })),
    ...performanceEvents.map(alert => ({
      id: `performance-${alert.id}`,
      category: 'detection' as const,
      severity: alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'info',
      source: 'performance',
      message: `Perf:${alert.severity}:${alert.metricName}:${alert.message}`,
      correlationKey: alert.metricName,
      timestamp: alert.timestamp,
      lastSeen: alert.timestamp,
      acknowledged: false,
    })),
    ...predictiveEvents.map(alert => ({
      id: `predictive-${alert.id}`,
      category: 'detection' as const,
      severity: alert.severity === 'critical' ? 'critical' : 'warning',
      source: 'predictive',
      message: `Predictive:${alert.severity}:${alert.service}/${alert.metric}`,
      correlationKey: alert.service,
      timestamp: alert.timestamp,
      lastSeen: alert.timestamp,
      acknowledged: false,
    })),
    {
      id: `containment-transport-${transportMode.toUpperCase()}`,
      category: 'containment' as const,
      severity: oneDoorHealthy ? 'info' as const : 'critical' as const,
      source: 'transport',
      message: `Transport gate: ${oneDoorHealthy ? 'IPC enforced' : 'IPC violation detected'}`,
      correlationKey: 'transport',
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
    },
    {
      id: `containment-external-${FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'enabled' : 'confined'}`,
      category: 'containment' as const,
      severity: FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'warning' as const : 'info' as const,
      source: 'policy',
      message: `External AI: ${FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'enabled' : 'confined'}`,
      correlationKey: 'external-ai',
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
    },
    {
      id: `containment-local-${FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'enabled' : 'disabled'}`,
      category: 'containment' as const,
      severity: FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'info' as const : 'warning' as const,
      source: 'policy',
      message: `Local LLM: ${FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'enabled' : 'disabled'}`,
      correlationKey: 'local-llm',
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
    },
    ...containmentProviders.map(provider => ({
      id: `containment-provider-${provider.id}-${provider.isActive ? 'active' : 'inactive'}-${provider.isHealthy ? 'healthy' : 'degraded'}`,
      category: 'containment' as const,
      severity: provider.isHealthy ? 'warning' as const : 'critical' as const,
      source: 'provider-governance',
      message: `Provider:${provider.id}: active=${provider.isActive ? 'yes' : 'no'} · healthy=${provider.isHealthy ? 'yes' : 'no'} · consecutiveFailures=${provider.consecutiveFailures}`,
      correlationKey: provider.id,
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
    })),
  ];
  const eventHistory = mergeSecurityEventHistory(currentEvents);
  const activeDetectionEvents = eventHistory.filter(event => event.category === 'detection').slice(0, 6);
  const activeContainmentEvents = eventHistory.filter(event => event.category === 'containment').slice(0, 6);
  const correlationSummary = getCorrelationSummary(eventHistory);
  const detectionCount =
    healthAlerts.length + performanceEvents.length + predictiveEvents.length + securityLogs.length;
  const containmentCount = containmentProviders.length + (oneDoorHealthy ? 1 : 0) + (FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 0 : 1);
  const unacknowledgedEvents = eventHistory.filter(event => !event.acknowledged).length;

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `Transport ${transportMode.toUpperCase()} · ${detectionCount} evenements detection publies · ${containmentCount} evenements confinement publies · ${unacknowledgedEvents} non acquittes`,
    evidence: [
      `One Door: la voie Ollama exposee au frontend passe par ${transportMode.toUpperCase()}.`,
      `Runtime: providers actifs ${activeProviders.join(', ')}.`,
      `Runtime: ${securityLogs.length} logs security UI · ${healthAlerts.length} alertes health · ${predictiveEvents.length} alertes predictives high+.`,
      `Runtime: journal local borne ${eventHistory.length}/${SECURITY_HISTORY_LIMIT} evenements avec acquittement persistant.`,
      ...base.evidence,
    ],
    blockers: [
      'Le journal securite reste local au navigateur: aucune federation multi-session ni export d audit n est encore branche.',
      ...(!oneDoorHealthy
        ? ['Le transport Ollama n est plus sur IPC, ce qui viole la voie canonique UI -> IPC -> services.']
        : []),
    ],
    nextStep: oneDoorHealthy
      ? 'Etendre l audit avec federation multi-session, filtres severite et export de correlations de confinement.'
      : 'Restaurer le transport IPC canonique avant d etendre la reponse securite active.',
    detailSections: [
      {
        key: 'detection-events',
        title: 'Evenements de detection',
        items: activeDetectionEvents.map(event => ({
          id: event.id,
          label: `${event.message} · at=${formatEventTime(event.lastSeen)} · ack=${event.acknowledged ? 'yes' : 'no'}`,
          acknowledged: event.acknowledged,
          correlationKey: event.correlationKey,
        })),
      },
      {
        key: 'containment-events',
        title: 'Evenements de confinement',
        items: activeContainmentEvents.map(event => ({
          id: event.id,
          label: `${event.message} · at=${formatEventTime(event.lastSeen)} · ack=${event.acknowledged ? 'yes' : 'no'}`,
          acknowledged: event.acknowledged,
          correlationKey: event.correlationKey,
        })),
      },
      {
        key: 'event-history',
        title: 'Historique borne',
        items: eventHistory.slice(0, 6).map(event => ({
          id: `history-${event.id}`,
          label: `${formatEventTime(event.lastSeen)} · ${event.category} · ${event.message} · correlation=${event.correlationKey} · ack=${event.acknowledged ? 'yes' : 'no'}`,
          acknowledged: event.acknowledged,
          correlationKey: event.correlationKey,
        })),
      },
      {
        key: 'correlation-summary',
        title: 'Correlation croisee',
        items: correlationSummary.length > 0
          ? correlationSummary.map(summary => ({
              id: `correlation-${summary.key}`,
              label: `${summary.key}: detection=${summary.detectionCount} · confinement=${summary.containmentCount} · open=${summary.openCount}`,
              correlationKey: summary.key,
            }))
          : [
              {
                id: 'correlation-empty',
                label: 'Aucune correlation croisee exploitable n est encore disponible sur le journal local.',
              },
            ],
      },
    ],
  };
}

export function startSecurityActiveAgent() {
  return getSecurityActiveAgentStatus();
}
