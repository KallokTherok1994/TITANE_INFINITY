import { isTauriAvailable } from '@/api/tauriClient';
import { tauriClient } from '@/lib/tauriClient';
import {
  getAdvancedAgentStatus,
  type AdvancedAgentStatus,
} from '@/services/agents/advancedAgentCatalog';
import { FEATURE_FLAGS, getActiveAIProviders } from '@/config/featureFlags';
import { getTransportMode } from '@/services/ai/transports/ollamaTransport';
import { aiHealthMonitor } from '@/services/ai/healthMonitor';
import { performanceAlerts } from '@/services/ai/performanceAlerts';
import { PredictiveAlerts } from '@/lib/predictiveAlerts';
import { uiLogger } from '@/lib/UILogger';
import { getGovernanceConnector } from '@/services/governance/GovernanceConnector';

const SECURITY_EVENT_HISTORY_KEY = 'titane_security_dashboard_event_history';
const SECURITY_ACKNOWLEDGED_EVENT_IDS_KEY = 'titane_security_dashboard_acknowledged';
const SECURITY_CORRELATION_EXPORT_KEY = 'titane_security_dashboard_correlation_export';
const SECURITY_HISTORY_LIMIT = 40;
const SECURITY_REFRESH_INTERVAL_MS = 10000;

type SecurityEventCategory = 'detection' | 'containment';
type SecurityEventSeverity = 'info' | 'warning' | 'critical';
export type SecurityAuditSeverityFilter = 'all' | SecurityEventSeverity;

function normalizeSecuritySeverity(
  severity: string | null | undefined
): SecurityEventSeverity {
  if (severity === 'critical') {
    return 'critical';
  }

  if (severity === 'warning') {
    return 'warning';
  }

  return 'info';
}

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
  sessionId?: string;
}

interface SecurityCorrelationSummary {
  key: string;
  detectionCount: number;
  containmentCount: number;
  openCount: number;
  highestSeverity: SecurityEventSeverity;
}

interface SecuritySessionSummary {
  sessionId: string;
  detectionCount: number;
  containmentCount: number;
  openCount: number;
  highestSeverity: SecurityEventSeverity;
  lastSeen: number;
}

interface SecurityAuditView {
  eventHistory: SecurityDashboardEvent[];
  filteredHistory: SecurityDashboardEvent[];
  activeDetectionEvents: SecurityDashboardEvent[];
  activeContainmentEvents: SecurityDashboardEvent[];
  correlationSummary: SecurityCorrelationSummary[];
  multiSessionFederation: SecuritySessionSummary[];
  unacknowledgedEvents: number;
  severityFilter: SecurityAuditSeverityFilter;
}

interface SecurityDashboardEventPayload {
  id: string;
  category: SecurityEventCategory;
  severity: SecurityEventSeverity;
  source: string;
  message: string;
  correlationKey: string;
  timestamp: number;
  lastSeen: number;
  acknowledged: boolean;
  sessionId?: string;
}

interface SecurityAuditPublishedExport {
  exportId: string;
  exportPath: string;
  sha256: string;
  signature: string;
  publicKey: string;
  fingerprint: string;
  publishedAt: string;
  severityFilter: string;
  eventCount: number;
  scope: string;
}

interface SecurityAuditSyncContent {
  storagePath: string;
  eventCount: number;
  federatedSessionCount: number;
  updatedAt: string;
  events: SecurityDashboardEventPayload[];
  lastPublishedExport?: SecurityAuditPublishedExport | null;
}

interface SecurityAuditGovernedSnapshot {
  status: ReturnType<typeof getSecurityActiveAgentStatus>;
  exportPayload: string | null;
}

interface GovernedSecurityExportMetadata {
  scope: string;
  exportId: string;
  exportPath: string;
  sha256: string;
  fingerprint: string;
  publishedAt: string;
  eventCount?: number;
  severityFilter?: string;
}

interface TauriIpcEnvelope<T> {
  ok: boolean;
  content?: T;
  error?: unknown;
}

const SECURITY_SEVERITY_ORDER: Record<SecurityEventSeverity, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

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

function loadSecurityCorrelationExport(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(SECURITY_CORRELATION_EXPORT_KEY);
  } catch {
    return null;
  }
}

function saveSecurityCorrelationExport(payload: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SECURITY_CORRELATION_EXPORT_KEY, payload);
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

function maxSecuritySeverity(
  current: SecurityEventSeverity,
  candidate: SecurityEventSeverity
): SecurityEventSeverity {
  return SECURITY_SEVERITY_ORDER[candidate] > SECURITY_SEVERITY_ORDER[current]
    ? candidate
    : current;
}

function matchesSeverityFilter(
  event: SecurityDashboardEvent,
  severityFilter: SecurityAuditSeverityFilter
): boolean {
  if (severityFilter === 'all') {
    return true;
  }

  return event.severity === severityFilter;
}

function getCorrelationSummary(
  history: SecurityDashboardEvent[]
): SecurityCorrelationSummary[] {
  const groups = new Map<
    string,
    {
      detectionCount: number;
      containmentCount: number;
      openCount: number;
      highestSeverity: SecurityEventSeverity;
    }
  >();

  history.forEach(event => {
    const key = event.correlationKey;
    const existing = groups.get(key) ?? {
      detectionCount: 0,
      containmentCount: 0,
      openCount: 0,
      highestSeverity: event.severity,
    };

    if (event.category === 'detection') {
      existing.detectionCount += 1;
    } else {
      existing.containmentCount += 1;
    }

    if (!event.acknowledged) {
      existing.openCount += 1;
    }

    existing.highestSeverity = maxSecuritySeverity(
      existing.highestSeverity,
      event.severity
    );

    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort(
      (left, right) =>
        right.openCount - left.openCount ||
        right.detectionCount +
          right.containmentCount -
          (left.detectionCount + left.containmentCount)
    )
    .slice(0, 4);
}

function getMultiSessionFederation(
  history: SecurityDashboardEvent[]
): SecuritySessionSummary[] {
  const groups = new Map<string, SecuritySessionSummary>();

  history.forEach(event => {
    const sessionId = event.sessionId ?? 'runtime-shared';
    const existing = groups.get(sessionId) ?? {
      sessionId,
      detectionCount: 0,
      containmentCount: 0,
      openCount: 0,
      highestSeverity: event.severity,
      lastSeen: event.lastSeen,
    };

    if (event.category === 'detection') {
      existing.detectionCount += 1;
    } else {
      existing.containmentCount += 1;
    }

    if (!event.acknowledged) {
      existing.openCount += 1;
    }

    existing.highestSeverity = maxSecuritySeverity(
      existing.highestSeverity,
      event.severity
    );
    existing.lastSeen = Math.max(existing.lastSeen, event.lastSeen);
    groups.set(sessionId, existing);
  });

  return Array.from(groups.values())
    .sort(
      (left, right) =>
        right.openCount - left.openCount ||
        SECURITY_SEVERITY_ORDER[right.highestSeverity] -
          SECURITY_SEVERITY_ORDER[left.highestSeverity] ||
        right.lastSeen - left.lastSeen
    )
    .slice(0, 6);
}

function buildSecurityCorrelationExport(
  view: Pick<
    SecurityAuditView,
    'correlationSummary' | 'multiSessionFederation' | 'filteredHistory' | 'severityFilter'
  >
): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      severityFilter: view.severityFilter,
      containmentCorrelations: view.correlationSummary.map(summary => ({
        correlationKey: summary.key,
        detectionCount: summary.detectionCount,
        containmentCount: summary.containmentCount,
        openCount: summary.openCount,
        highestSeverity: summary.highestSeverity,
      })),
      sessions: view.multiSessionFederation.map(session => ({
        sessionId: session.sessionId,
        detectionCount: session.detectionCount,
        containmentCount: session.containmentCount,
        openCount: session.openCount,
        highestSeverity: session.highestSeverity,
        lastSeen: new Date(session.lastSeen).toISOString(),
      })),
      exportedEvents: view.filteredHistory
        .filter(event => event.category === 'containment')
        .slice(0, 12)
        .map(event => ({
          id: event.id,
          severity: event.severity,
          source: event.source,
          message: event.message,
          correlationKey: event.correlationKey,
          sessionId: event.sessionId ?? 'runtime-shared',
          acknowledged: event.acknowledged,
          lastSeen: new Date(event.lastSeen).toISOString(),
        })),
    },
    null,
    2
  );
}

function buildSecurityAuditView(
  currentEvents: SecurityDashboardEvent[],
  severityFilter: SecurityAuditSeverityFilter
): SecurityAuditView {
  const eventHistory = mergeSecurityEventHistory(currentEvents);
  return buildSecurityAuditViewFromHistory(eventHistory, severityFilter);
}

function buildSecurityAuditViewFromHistory(
  eventHistory: SecurityDashboardEvent[],
  severityFilter: SecurityAuditSeverityFilter
): SecurityAuditView {
  const filteredHistory = eventHistory.filter(event =>
    matchesSeverityFilter(event, severityFilter)
  );

  return {
    eventHistory,
    filteredHistory,
    activeDetectionEvents: filteredHistory
      .filter(event => event.category === 'detection')
      .slice(0, 6),
    activeContainmentEvents: filteredHistory
      .filter(event => event.category === 'containment')
      .slice(0, 6),
    correlationSummary: getCorrelationSummary(filteredHistory),
    multiSessionFederation: getMultiSessionFederation(filteredHistory),
    unacknowledgedEvents: filteredHistory.filter(event => !event.acknowledged).length,
    severityFilter,
  };
}

function unwrapTauriEnvelope<T>(result: T | TauriIpcEnvelope<T>): T {
  if (result && typeof result === 'object' && 'ok' in result) {
    const envelope = result as TauriIpcEnvelope<T>;

    if (!envelope.ok) {
      throw new Error(
        typeof envelope.error === 'string' ? envelope.error : 'Unknown governed IPC error'
      );
    }

    return envelope.content as T;
  }

  return result as T;
}

function isSecurityAuditSyncContent(value: unknown): value is SecurityAuditSyncContent {
  return Boolean(
    value &&
    typeof value === 'object' &&
    Array.isArray((value as SecurityAuditSyncContent).events) &&
    typeof (value as SecurityAuditSyncContent).storagePath === 'string'
  );
}

function isSecurityAuditPublishedExport(
  value: unknown
): value is SecurityAuditPublishedExport {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof (value as SecurityAuditPublishedExport).exportId === 'string' &&
    typeof (value as SecurityAuditPublishedExport).exportPath === 'string'
  );
}

function toSecurityDashboardEventPayload(
  event: SecurityDashboardEvent
): SecurityDashboardEventPayload {
  return {
    id: event.id,
    category: event.category,
    severity: event.severity,
    source: event.source,
    message: event.message,
    correlationKey: event.correlationKey,
    timestamp: event.timestamp,
    lastSeen: event.lastSeen,
    acknowledged: event.acknowledged,
    sessionId: event.sessionId,
  };
}

function fromSecurityDashboardEventPayload(
  event: SecurityDashboardEventPayload
): SecurityDashboardEvent {
  return {
    id: event.id,
    category: event.category,
    severity: event.severity,
    source: event.source,
    message: event.message,
    correlationKey: event.correlationKey,
    timestamp: event.timestamp,
    lastSeen: event.lastSeen,
    acknowledged: event.acknowledged,
    sessionId: event.sessionId,
  };
}

function buildGovernedSecurityExportPayload(
  localPayload: string,
  publishedExport: SecurityAuditPublishedExport
): string {
  let parsedLocalPayload: unknown = localPayload;

  try {
    parsedLocalPayload = JSON.parse(localPayload);
  } catch {
    parsedLocalPayload = localPayload;
  }

  return JSON.stringify(
    {
      governance: {
        scope: publishedExport.scope,
        signed: true,
        exportId: publishedExport.exportId,
        exportPath: publishedExport.exportPath,
        sha256: publishedExport.sha256,
        signature: publishedExport.signature,
        publicKey: publishedExport.publicKey,
        fingerprint: publishedExport.fingerprint,
        publishedAt: publishedExport.publishedAt,
      },
      content: parsedLocalPayload,
    },
    null,
    2
  );
}

function parseGovernedSecurityExportMetadata(
  exportPayload: string | null,
  governedSync: SecurityAuditSyncContent | null
): GovernedSecurityExportMetadata | null {
  const authoritativeExport = governedSync?.lastPublishedExport;
  if (authoritativeExport) {
    return {
      scope: authoritativeExport.scope,
      exportId: authoritativeExport.exportId,
      exportPath: authoritativeExport.exportPath,
      sha256: authoritativeExport.sha256,
      fingerprint: authoritativeExport.fingerprint,
      publishedAt: authoritativeExport.publishedAt,
      eventCount: authoritativeExport.eventCount,
      severityFilter: authoritativeExport.severityFilter,
    };
  }

  if (!exportPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(exportPayload) as {
      governance?: {
        scope?: string;
        exportId?: string;
        exportPath?: string;
        sha256?: string;
        fingerprint?: string;
        publishedAt?: string;
      };
      content?: {
        severityFilter?: string;
        exportedEvents?: unknown[];
      };
    };

    if (!parsed.governance?.exportId || !parsed.governance.exportPath) {
      return null;
    }

    return {
      scope: parsed.governance.scope ?? 'unknown',
      exportId: parsed.governance.exportId,
      exportPath: parsed.governance.exportPath,
      sha256: parsed.governance.sha256 ?? 'unknown',
      fingerprint: parsed.governance.fingerprint ?? 'unknown',
      publishedAt: parsed.governance.publishedAt ?? 'unknown',
      eventCount: Array.isArray(parsed.content?.exportedEvents)
        ? parsed.content.exportedEvents.length
        : undefined,
      severityFilter: parsed.content?.severityFilter,
    };
  } catch {
    return null;
  }
}

function createSecurityActiveAgentStatus(
  severityFilter: SecurityAuditSeverityFilter,
  auditView: SecurityAuditView,
  options: {
    transportMode: string;
    activeProviders: string[];
    healthAlertCount: number;
    performanceEventCount: number;
    predictiveEventCount: number;
    securityLogCount: number;
    baseEvidence: string[];
    oneDoorHealthy: boolean;
    exportPayload: string | null;
    governedSync: SecurityAuditSyncContent | null;
  }
): AdvancedAgentStatus {
  const base = getAdvancedAgentStatus('security_active');
  const detectionCount =
    options.healthAlertCount +
    options.performanceEventCount +
    options.predictiveEventCount +
    options.securityLogCount;
  const containmentCount = auditView.eventHistory.filter(
    event => event.category === 'containment'
  ).length;
  const governedActive = Boolean(options.governedSync);
  const federationLabel = governedActive
    ? `federation gouvernee ${options.governedSync?.federatedSessionCount ?? auditView.multiSessionFederation.length} sessions via AppData`
    : `federation locale multi-session ${auditView.multiSessionFederation.length} sessions`;
  const exportLabel = governedActive
    ? options.governedSync?.lastPublishedExport
      ? 'export gouverne signe publie en AppData'
      : 'export gouverne signe pret a publier en AppData'
    : `export local des correlations de confinement ${options.exportPayload ? 'pret' : 'non genere'}`;
  const governedExportMetadata = parseGovernedSecurityExportMetadata(
    options.exportPayload,
    options.governedSync
  );

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `Transport ${options.transportMode.toUpperCase()} · filtre severite=${severityFilter} · ${detectionCount} evenements detection publies · ${containmentCount} evenements confinement publies · ${auditView.unacknowledgedEvents} non acquittes`,
    evidence: [
      `One Door: la voie Ollama exposee au frontend passe par ${options.transportMode.toUpperCase()}.`,
      `Runtime: providers actifs ${options.activeProviders.join(', ')}.`,
      `Runtime: ${options.securityLogCount} logs security UI · ${options.healthAlertCount} alertes health · ${options.performanceEventCount} alertes performance · ${options.predictiveEventCount} alertes predictives high+.`,
      `Runtime: journal borne ${auditView.eventHistory.length}/${SECURITY_HISTORY_LIMIT} evenements avec acquittement persistant.`,
      `Runtime: ${federationLabel} sur le filtre ${severityFilter}.`,
      `Runtime: ${exportLabel}.`,
      ...(governedExportMetadata
        ? [
            `Runtime: export signe ${governedExportMetadata.exportId} · fingerprint ${governedExportMetadata.fingerprint} · scope ${governedExportMetadata.scope}.`,
          ]
        : []),
      ...options.baseEvidence,
    ],
    blockers: [
      ...(governedActive
        ? [
            'La preuve desktop installee du lane signe n est pas encore rattachee a cette surface canonique.',
          ]
        : [
            'La federation et l export restent bornes au navigateur courant: aucun backend partage ni signature d audit n est encore branche.',
          ]),
      ...(!options.oneDoorHealthy
        ? [
            'Le transport Ollama n est plus sur IPC, ce qui viole la voie canonique UI -> IPC -> services.',
          ]
        : []),
    ],
    nextStep: !options.oneDoorHealthy
      ? 'Restaurer le transport IPC canonique avant d etendre la reponse securite active.'
      : governedActive
        ? 'Sceller une preuve desktop installee du journal partage signe pour fermer le lane gouverne jusqu au runtime Tauri.'
        : 'Publier un export gouverne signe et federer ce journal au-dela du navigateur courant sans rompre la voie canonique.',
    detailSections: [
      {
        key: 'detection-events',
        title: 'Evenements de detection',
        items: auditView.activeDetectionEvents.map(event => ({
          id: event.id,
          label: `${event.message} · severity=${event.severity} · at=${formatEventTime(event.lastSeen)} · ack=${event.acknowledged ? 'yes' : 'no'}`,
          acknowledged: event.acknowledged,
          correlationKey: event.correlationKey,
          severity: event.severity,
          sessionId: event.sessionId,
        })),
      },
      {
        key: 'containment-events',
        title: 'Evenements de confinement',
        items: auditView.activeContainmentEvents.map(event => ({
          id: event.id,
          label: `${event.message} · severity=${event.severity} · at=${formatEventTime(event.lastSeen)} · ack=${event.acknowledged ? 'yes' : 'no'}`,
          acknowledged: event.acknowledged,
          correlationKey: event.correlationKey,
          severity: event.severity,
          sessionId: event.sessionId,
        })),
      },
      {
        key: 'event-history',
        title: 'Historique borne',
        items: auditView.filteredHistory.slice(0, 6).map(event => ({
          id: `history-${event.id}`,
          label: `${formatEventTime(event.lastSeen)} · ${event.category} · severity=${event.severity} · ${event.message} · correlation=${event.correlationKey} · session=${event.sessionId ?? 'runtime-shared'} · ack=${event.acknowledged ? 'yes' : 'no'}`,
          acknowledged: event.acknowledged,
          correlationKey: event.correlationKey,
          severity: event.severity,
          sessionId: event.sessionId,
        })),
      },
      {
        key: 'correlation-summary',
        title: 'Correlation croisee',
        items:
          auditView.correlationSummary.length > 0
            ? auditView.correlationSummary.map(summary => ({
                id: `correlation-${summary.key}`,
                label: `${summary.key}: detection=${summary.detectionCount} · confinement=${summary.containmentCount} · open=${summary.openCount} · maxSeverity=${summary.highestSeverity}`,
                correlationKey: summary.key,
                severity: summary.highestSeverity,
              }))
            : [
                {
                  id: 'correlation-empty',
                  label:
                    'Aucune correlation croisee exploitable n est encore disponible sur le journal local.',
                },
              ],
      },
      {
        key: 'multi-session-federation',
        title: 'Federation multi-session',
        items:
          auditView.multiSessionFederation.length > 0
            ? auditView.multiSessionFederation.map(session => ({
                id: `session-${session.sessionId}`,
                label: `${session.sessionId}: detection=${session.detectionCount} · confinement=${session.containmentCount} · open=${session.openCount} · maxSeverity=${session.highestSeverity} · lastSeen=${formatEventTime(session.lastSeen)}`,
                severity: session.highestSeverity,
                sessionId: session.sessionId,
              }))
            : [
                {
                  id: 'session-empty',
                  label:
                    'Aucune federation multi-session exploitable n est encore disponible sur le filtre courant.',
                },
              ],
      },
      {
        key: 'governed-export',
        title: 'Export gouverne signe',
        items: governedExportMetadata
          ? [
              {
                id: 'governed-export-export-id',
                label: `exportId=${governedExportMetadata.exportId} · scope=${governedExportMetadata.scope} · severityFilter=${governedExportMetadata.severityFilter ?? severityFilter}`,
              },
              {
                id: 'governed-export-export-path',
                label: `exportPath=${governedExportMetadata.exportPath}`,
              },
              {
                id: 'governed-export-sha',
                label: `sha256=${governedExportMetadata.sha256} · fingerprint=${governedExportMetadata.fingerprint}`,
              },
              {
                id: 'governed-export-published-at',
                label: `publishedAt=${governedExportMetadata.publishedAt} · eventCount=${governedExportMetadata.eventCount ?? auditView.filteredHistory.length}`,
              },
            ]
          : [
              {
                id: 'governed-export-empty',
                label:
                  'Aucun export gouverne signe n est encore disponible sur cette surface.',
              },
            ],
      },
    ],
  };
}

async function syncGovernedSecurityAuditJournal(
  currentEvents: SecurityDashboardEvent[]
): Promise<SecurityAuditSyncContent | null> {
  if (!isTauriAvailable()) {
    return null;
  }

  try {
    const content = unwrapTauriEnvelope(
      (await tauriClient.securityAuditSyncJournal({
        events: currentEvents.map(toSecurityDashboardEventPayload),
      })) as SecurityAuditSyncContent | TauriIpcEnvelope<SecurityAuditSyncContent>
    );

    return isSecurityAuditSyncContent(content) ? content : null;
  } catch {
    return null;
  }
}

export async function getGovernedSecurityAuditSnapshot(
  severityFilter: SecurityAuditSeverityFilter = 'all'
): Promise<SecurityAuditGovernedSnapshot> {
  const transportMode = getTransportMode();
  const activeProviders = getActiveAIProviders();
  const healthAlerts = aiHealthMonitor.getActiveAlerts().slice(0, 3);
  const performanceEvents = performanceAlerts.getAlerts(3);
  const predictiveEvents = PredictiveAlerts.getAlerts('high').slice(0, 3);
  const securityLogs = uiLogger.getLogs({ level: 'security', limit: 12 });
  const oneDoorHealthy = transportMode.toUpperCase() === 'IPC';
  const currentEvents = collectCurrentSecurityEvents();
  const governedSync = await syncGovernedSecurityAuditJournal(currentEvents);
  const auditView = buildSecurityAuditViewFromHistory(
    governedSync
      ? governedSync.events.map(fromSecurityDashboardEventPayload)
      : buildSecurityAuditView(currentEvents, severityFilter).eventHistory,
    severityFilter
  );
  const exportPayload = loadSecurityCorrelationExport();

  return {
    status: createSecurityActiveAgentStatus(severityFilter, auditView, {
      transportMode,
      activeProviders,
      healthAlertCount: healthAlerts.length,
      performanceEventCount: performanceEvents.length,
      predictiveEventCount: predictiveEvents.length,
      securityLogCount: securityLogs.length,
      baseEvidence: getAdvancedAgentStatus('security_active').evidence,
      oneDoorHealthy,
      exportPayload,
      governedSync,
    }),
    exportPayload:
      governedSync?.lastPublishedExport && exportPayload
        ? buildGovernedSecurityExportPayload(
            exportPayload,
            governedSync.lastPublishedExport
          )
        : exportPayload,
  };
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

export function getLastSecurityContainmentCorrelationExport(): string | null {
  return loadSecurityCorrelationExport();
}

export function exportSecurityContainmentCorrelations(
  severityFilter: SecurityAuditSeverityFilter = 'all'
): Promise<string> {
  return publishSecurityContainmentCorrelations(severityFilter);
}

async function publishSecurityContainmentCorrelations(
  severityFilter: SecurityAuditSeverityFilter = 'all'
): Promise<string> {
  const currentEvents = collectCurrentSecurityEvents();
  const localView = buildSecurityAuditView(currentEvents, severityFilter);
  const localPayload = buildSecurityCorrelationExport(localView);
  saveSecurityCorrelationExport(localPayload);

  if (!isTauriAvailable()) {
    return localPayload;
  }

  const governedSync = await syncGovernedSecurityAuditJournal(currentEvents);
  const governedView = buildSecurityAuditViewFromHistory(
    governedSync
      ? governedSync.events.map(fromSecurityDashboardEventPayload)
      : localView.eventHistory,
    severityFilter
  );

  try {
    const publishedExport = unwrapTauriEnvelope(
      (await tauriClient.securityAuditPublishSignedExport({
        severityFilter,
        events: governedView.filteredHistory.map(toSecurityDashboardEventPayload),
        correlationSummaries: governedView.correlationSummary,
        sessionSummaries: governedView.multiSessionFederation,
      })) as SecurityAuditPublishedExport | TauriIpcEnvelope<SecurityAuditPublishedExport>
    );

    if (!isSecurityAuditPublishedExport(publishedExport)) {
      return localPayload;
    }

    const governedPayload = buildGovernedSecurityExportPayload(
      localPayload,
      publishedExport
    );
    saveSecurityCorrelationExport(governedPayload);
    return governedPayload;
  } catch {
    return localPayload;
  }
}

function collectCurrentSecurityEvents(): SecurityDashboardEvent[] {
  const transportMode = getTransportMode();
  const governance = getGovernanceConnector();
  const healthAlerts = aiHealthMonitor.getActiveAlerts().slice(0, 3);
  const performanceEvents = performanceAlerts.getAlerts(3);
  const predictiveEvents = PredictiveAlerts.getAlerts('high').slice(0, 3);
  const securityLogs = uiLogger.getLogs({ level: 'security', limit: 12 });
  const containmentProviders = governance
    .getAllProviders()
    .filter(provider => !provider.isHealthy || !provider.isActive)
    .slice(0, 3);
  const oneDoorHealthy = transportMode.toUpperCase() === 'IPC';
  const now = Date.now();

  return [
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
      sessionId: entry.sessionId,
    })),
    ...healthAlerts.map(alert => ({
      id: `health-${alert.id}`,
      category: 'detection' as const,
      severity: normalizeSecuritySeverity(alert.severity),
      source: 'health',
      message: `Health:${alert.severity}:${alert.title}`,
      correlationKey: alert.component,
      timestamp: alert.timestamp,
      lastSeen: alert.timestamp,
      acknowledged: false,
      sessionId: `health-${alert.component}`,
    })),
    ...performanceEvents.map(alert => ({
      id: `performance-${alert.id}`,
      category: 'detection' as const,
      severity: normalizeSecuritySeverity(alert.severity),
      source: 'performance',
      message: `Perf:${alert.severity}:${alert.metricName}:${alert.message}`,
      correlationKey: alert.metricName,
      timestamp: alert.timestamp,
      lastSeen: alert.timestamp,
      acknowledged: false,
      sessionId: `performance-${alert.metricName}`,
    })),
    ...predictiveEvents.map(alert => ({
      id: `predictive-${alert.id}`,
      category: 'detection' as const,
      severity: normalizeSecuritySeverity(alert.severity),
      source: 'predictive',
      message: `Predictive:${alert.severity}:${alert.service}/${alert.metric}`,
      correlationKey: alert.service,
      timestamp: alert.timestamp,
      lastSeen: alert.timestamp,
      acknowledged: false,
      sessionId: `predictive-${alert.service}`,
    })),
    {
      id: `containment-transport-${transportMode.toUpperCase()}`,
      category: 'containment' as const,
      severity: oneDoorHealthy ? ('info' as const) : ('critical' as const),
      source: 'transport',
      message: `Transport gate: ${oneDoorHealthy ? 'IPC enforced' : 'IPC violation detected'}`,
      correlationKey: 'transport',
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
      sessionId: 'runtime-transport',
    },
    {
      id: `containment-external-${FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'enabled' : 'confined'}`,
      category: 'containment' as const,
      severity: FEATURE_FLAGS.ENABLE_EXTERNAL_AI
        ? ('warning' as const)
        : ('info' as const),
      source: 'policy',
      message: `External AI: ${FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'enabled' : 'confined'}`,
      correlationKey: 'external-ai',
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
      sessionId: 'runtime-policy',
    },
    {
      id: `containment-local-${FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'enabled' : 'disabled'}`,
      category: 'containment' as const,
      severity: FEATURE_FLAGS.ENABLE_LOCAL_LLM ? ('info' as const) : ('warning' as const),
      source: 'policy',
      message: `Local LLM: ${FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'enabled' : 'disabled'}`,
      correlationKey: 'local-llm',
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
      sessionId: 'runtime-policy',
    },
    ...containmentProviders.map(provider => ({
      id: `containment-provider-${provider.id}-${provider.isActive ? 'active' : 'inactive'}-${provider.isHealthy ? 'healthy' : 'degraded'}`,
      category: 'containment' as const,
      severity: provider.isHealthy ? ('warning' as const) : ('critical' as const),
      source: 'provider-governance',
      message: `Provider:${provider.id}: active=${provider.isActive ? 'yes' : 'no'} · healthy=${provider.isHealthy ? 'yes' : 'no'} · consecutiveFailures=${provider.consecutiveFailures}`,
      correlationKey: provider.id,
      timestamp: now,
      lastSeen: now,
      acknowledged: false,
      sessionId: `provider-${provider.id}`,
    })),
  ];
}

export function getSecurityActiveAgentStatus(
  severityFilter: SecurityAuditSeverityFilter = 'all'
) {
  const transportMode = getTransportMode();
  const activeProviders = getActiveAIProviders();
  const healthAlerts = aiHealthMonitor.getActiveAlerts().slice(0, 3);
  const performanceEvents = performanceAlerts.getAlerts(3);
  const predictiveEvents = PredictiveAlerts.getAlerts('high').slice(0, 3);
  const securityLogs = uiLogger.getLogs({ level: 'security', limit: 12 });
  const oneDoorHealthy = transportMode.toUpperCase() === 'IPC';
  const auditView = buildSecurityAuditView(
    collectCurrentSecurityEvents(),
    severityFilter
  );
  const lastExport = loadSecurityCorrelationExport();
  return createSecurityActiveAgentStatus(severityFilter, auditView, {
    transportMode,
    activeProviders,
    healthAlertCount: healthAlerts.length,
    performanceEventCount: performanceEvents.length,
    predictiveEventCount: predictiveEvents.length,
    securityLogCount: securityLogs.length,
    baseEvidence: getAdvancedAgentStatus('security_active').evidence,
    oneDoorHealthy,
    exportPayload: lastExport,
    governedSync: null,
  });
}

export function startSecurityActiveAgent() {
  return getSecurityActiveAgentStatus();
}

// ═══════════════════════════════════════════════════════════════
// THREAT SCORING + IPC ANOMALY DETECTION — v31.2.14
// Score de menace 0–100 + détection de patterns IPC anormaux
// ═══════════════════════════════════════════════════════════════

export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface ThreatScore {
  /** Score global de menace 0–100. 0 = aucune menace, 100 = critique. */
  score: number;
  level: ThreatLevel;
  label: string;
  breakdown: {
    detectionEventScore: number;     // Nombre + sévérité des événements détection
    containmentViolations: number;   // Confinements actifs critiques
    oneDoorViolation: number;        // 0 ou 50 — violation One Door = toujours élevée
    unacknowledgedCritical: number;  // Événements critiques non acquittés
    consecutiveFailures: number;     // Providers avec erreurs consécutives
  };
  topThreats: string[];
  mitigations: string[];
  computedAt: number;
}

export interface IPCPatternAnomaly {
  id: string;
  pattern: 'BURST' | 'REPEATED_FAIL' | 'UNKNOWN_COMMAND' | 'RATE_EXCEEDED' | 'TRANSPORT_MISMATCH';
  severity: SecurityEventSeverity;
  detail: string;
  command?: string;
  count?: number;
  detectedAt: number;
}

export interface IPCAnomalyReport {
  anomalies: IPCPatternAnomaly[];
  totalAnomalies: number;
  highestSeverity: SecurityEventSeverity;
  summary: string;
  computedAt: number;
}

const IPC_CALL_WINDOW_KEY = 'titane_ipc_call_window';
const IPC_CALL_WINDOW_MS = 60_000; // 1 min

interface IPCCallRecord {
  command: string;
  timestamp: number;
  success: boolean;
}

function loadIPCCallWindow(): IPCCallRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(IPC_CALL_WINDOW_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IPCCallRecord[];
    const cutoff = Date.now() - IPC_CALL_WINDOW_MS;
    return parsed.filter(r => r.timestamp >= cutoff);
  } catch {
    return [];
  }
}

function saveIPCCallWindow(records: IPCCallRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(IPC_CALL_WINDOW_KEY, JSON.stringify(records.slice(-200)));
  } catch {
    // storage full
  }
}

/** Record an IPC call for anomaly detection (call from secureInvoke wrapper). */
export function recordIPCCall(command: string, success: boolean): void {
  const records = loadIPCCallWindow();
  records.push({ command, timestamp: Date.now(), success });
  saveIPCCallWindow(records);
}

/**
 * Analyze IPC call patterns for anomalies in the last 60s window.
 */
export function detectIPCAnomalies(): IPCAnomalyReport {
  const records = loadIPCCallWindow();
  const now = Date.now();
  const anomalies: IPCPatternAnomaly[] = [];

  // ── Pattern 1: Burst detection (>30 calls/min to same command) ──
  const byCommand = new Map<string, IPCCallRecord[]>();
  records.forEach(r => {
    const existing = byCommand.get(r.command) ?? [];
    existing.push(r);
    byCommand.set(r.command, existing);
  });

  byCommand.forEach((calls, command) => {
    if (calls.length > 30) {
      anomalies.push({
        id: `burst-${command}-${now}`,
        pattern: 'BURST',
        severity: calls.length > 60 ? 'critical' : 'warning',
        detail: `${calls.length} appels à "${command}" en < 60s`,
        command,
        count: calls.length,
        detectedAt: now,
      });
    }
  });

  // ── Pattern 2: Repeated failures (>5 failures same command) ───
  byCommand.forEach((calls, command) => {
    const failures = calls.filter(c => !c.success);
    if (failures.length >= 5) {
      anomalies.push({
        id: `fail-${command}-${now}`,
        pattern: 'REPEATED_FAIL',
        severity: failures.length >= 10 ? 'critical' : 'warning',
        detail: `${failures.length} échecs consécutifs sur "${command}"`,
        command,
        count: failures.length,
        detectedAt: now,
      });
    }
  });

  // ── Pattern 3: Rate exceeded (>100 total calls/min) ────────────
  if (records.length > 100) {
    anomalies.push({
      id: `rate-${now}`,
      pattern: 'RATE_EXCEEDED',
      severity: records.length > 200 ? 'critical' : 'warning',
      detail: `${records.length} appels IPC en < 60s — seuil 100 dépassé`,
      count: records.length,
      detectedAt: now,
    });
  }

  // ── Pattern 4: Transport mismatch detection ────────────────────
  const transportMode = getTransportMode();
  if (transportMode.toUpperCase() !== 'IPC') {
    anomalies.push({
      id: `transport-mismatch-${now}`,
      pattern: 'TRANSPORT_MISMATCH',
      severity: 'critical',
      detail: `Transport actif "${transportMode}" — violation One Door (IPC obligatoire)`,
      detectedAt: now,
    });
  }

  const highestSeverity: SecurityEventSeverity =
    anomalies.some(a => a.severity === 'critical') ? 'critical' :
    anomalies.some(a => a.severity === 'warning') ? 'warning' :
    'info';

  return {
    anomalies,
    totalAnomalies: anomalies.length,
    highestSeverity,
    summary: anomalies.length === 0
      ? `Aucune anomalie IPC détectée sur ${records.length} appels / 60s`
      : `${anomalies.length} anomalie(s) IPC — sévérité max ${highestSeverity}`,
    computedAt: now,
  };
}

/**
 * Compute a consolidated threat score (0–100) combining:
 * - Detection events (count + severity)
 * - Containment violations
 * - One Door transport integrity
 * - Unacknowledged critical events
 * - Provider consecutive failures
 */
export function computeThreatScore(
  severityFilter: SecurityAuditSeverityFilter = 'all'
): ThreatScore {
  const now = Date.now();
  const auditView = buildSecurityAuditView(collectCurrentSecurityEvents(), severityFilter);
  const governance = getGovernanceConnector();
  const transportMode = getTransportMode();

  // 1. Detection events scoring
  const criticalDetections = auditView.activeDetectionEvents.filter(e => e.severity === 'critical').length;
  const warnDetections = auditView.activeDetectionEvents.filter(e => e.severity === 'warning').length;
  const detectionEventScore = Math.min(40, criticalDetections * 15 + warnDetections * 5);

  // 2. Containment violations (critical containment events)
  const criticalContainment = auditView.activeContainmentEvents.filter(e => e.severity === 'critical').length;
  const containmentViolations = Math.min(20, criticalContainment * 10);

  // 3. One Door violation
  const oneDoorOk = transportMode.toUpperCase() === 'IPC';
  const oneDoorViolation = oneDoorOk ? 0 : 50;

  // 4. Unacknowledged critical events
  const unackCritical = auditView.filteredHistory.filter(e => !e.acknowledged && e.severity === 'critical').length;
  const unacknowledgedCritical = Math.min(20, unackCritical * 5);

  // 5. Provider consecutive failures
  const providers = governance.getAllProviders();
  const highFailureProviders = providers.filter(p => p.consecutiveFailures >= 3).length;
  const consecutiveFailures = Math.min(20, highFailureProviders * 10);

  const rawScore = detectionEventScore + containmentViolations + oneDoorViolation +
    unacknowledgedCritical + consecutiveFailures;
  const score = Math.min(100, rawScore);

  const level: ThreatLevel =
    score === 0 ? 'none' :
    score < 20 ? 'low' :
    score < 40 ? 'medium' :
    score < 70 ? 'high' :
    'critical';

  const topThreats: string[] = [];
  const mitigations: string[] = [];

  if (!oneDoorOk) {
    topThreats.push(`⚠ One Door violation: transport actuel "${transportMode}" (IPC requis)`);
    mitigations.push('Restaurer le transport IPC canonique immédiatement');
  }
  if (criticalDetections > 0) {
    topThreats.push(`${criticalDetections} événement(s) détection critique(s) actif(s)`);
    mitigations.push('Acquitter et traiter les événements critiques dans le dashboard sécurité');
  }
  if (highFailureProviders > 0) {
    topThreats.push(`${highFailureProviders} provider(s) avec ≥3 échecs consécutifs`);
    mitigations.push('Vérifier la santé des providers AI et réinitialiser les circuit-breakers');
  }
  if (unackCritical > 0) {
    topThreats.push(`${unackCritical} alerte(s) critique(s) non acquittée(s)`);
    mitigations.push('Acquitter les alertes critiques depuis le panneau de sécurité');
  }

  return {
    score,
    level,
    label: `${score}/100 (${level.toUpperCase()}) — ${
      level === 'none' ? 'Aucune menace détectée' :
      level === 'low' ? 'Menace faible — surveillance normale' :
      level === 'medium' ? 'Menace modérée — attention requise' :
      level === 'high' ? 'Menace élevée — action recommandée' :
      'Menace critique — intervention immédiate'
    }`,
    breakdown: { detectionEventScore, containmentViolations, oneDoorViolation, unacknowledgedCritical, consecutiveFailures },
    topThreats,
    mitigations,
    computedAt: now,
  };
}

/** Reset for tests */
export function resetIPCCallWindowForTests(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(IPC_CALL_WINDOW_KEY);
  }
}
