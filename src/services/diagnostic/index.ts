import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { getActiveAIProviders } from '@/config/featureFlags';
import { ollamaProvider } from '@/services/ai/providers/ollama';
import { alerting, AlertSeverity } from '@/services/monitoring/alerting';
import { chatMetrics } from '@/services/monitoring/chatMetrics';

const DIAGNOSTIC_REPORT_HISTORY_KEY = 'titane_diagnostic_report_history';
const DIAGNOSTIC_REPORT_HISTORY_LIMIT = 6;

type DiagnosticSeverity = 'info' | 'warning' | 'critical';

interface DiagnosticRuntimeReport {
  id: string;
  timestamp: number;
  signature: string;
  severity: DiagnosticSeverity;
  diagnosticSignals: number;
  activeAlerts: number;
  totalErrors: number;
  ollamaHealth: string;
  ollamaErrorCount: number;
  activeProviders: string[];
}

type DiagnosticOllamaStats = {
  errorCount: number;
  endpointHealthy: boolean | null;
  config: {
    model: string;
    endpoint: string;
  };
};

function formatDiagnosticClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function loadDiagnosticReportHistory(): DiagnosticRuntimeReport[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DIAGNOSTIC_REPORT_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(entry => entry && typeof entry.timestamp === 'number');
  } catch {
    return [];
  }
}

function saveDiagnosticReportHistory(history: DiagnosticRuntimeReport[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DIAGNOSTIC_REPORT_HISTORY_KEY, JSON.stringify(history));
}

function updateDiagnosticReportHistory(
  report: DiagnosticRuntimeReport
): DiagnosticRuntimeReport[] {
  const history = loadDiagnosticReportHistory();
  const previous = history[history.length - 1];

  if (previous?.signature === report.signature) {
    return history;
  }

  const nextHistory = [...history, report].slice(-DIAGNOSTIC_REPORT_HISTORY_LIMIT);
  saveDiagnosticReportHistory(nextHistory);
  return nextHistory;
}

function resolveDiagnosticSeverity(params: {
  activeAlerts: number;
  totalErrors: number;
  ollamaErrorCount: number;
}): DiagnosticSeverity {
  const { activeAlerts, totalErrors, ollamaErrorCount } = params;

  if (activeAlerts > 0 || totalErrors > 0 || ollamaErrorCount > 0) {
    return totalErrors > 0 || ollamaErrorCount > 0 ? 'critical' : 'warning';
  }

  return 'info';
}

export function resetDiagnosticReportHistoryForTests(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(DIAGNOSTIC_REPORT_HISTORY_KEY);
}

export function getDiagnosticAgentStatus() {
  const base = getAdvancedAgentStatus('diagnostic');
  const globalMetrics = chatMetrics.getGlobalMetrics();
  const activeAlerts = alerting.getActiveAlerts().filter(alert => !alert.resolved);
  const ollamaStats = (ollamaProvider.getStats?.() ?? {
    errorCount: 0,
    endpointHealthy: null,
    config: {
      model: 'unknown',
      endpoint: 'unknown',
    },
  }) as DiagnosticOllamaStats;
  const activeProviders = getActiveAIProviders();
  const diagnosticSignals = activeAlerts.length + globalMetrics.totalErrors;
  const ollamaHealth =
    ollamaStats.endpointHealthy === true
      ? 'sain'
      : ollamaStats.endpointHealthy === false
        ? 'degrade'
        : 'non sonde';
  const severity = resolveDiagnosticSeverity({
    activeAlerts: activeAlerts.length,
    totalErrors: globalMetrics.totalErrors,
    ollamaErrorCount: ollamaStats.errorCount,
  });
  const currentReport: DiagnosticRuntimeReport = {
    id: `diagnostic-${Date.now()}`,
    timestamp: Date.now(),
    signature: [
      diagnosticSignals,
      activeAlerts.length,
      globalMetrics.totalErrors,
      ollamaHealth,
      ollamaStats.errorCount,
      activeProviders.join(','),
    ].join('|'),
    severity,
    diagnosticSignals,
    activeAlerts: activeAlerts.length,
    totalErrors: globalMetrics.totalErrors,
    ollamaHealth,
    ollamaErrorCount: ollamaStats.errorCount,
    activeProviders,
  };
  const history = updateDiagnosticReportHistory(currentReport);
  const latestReport = history[history.length - 1] ?? currentReport;

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `Diagnostic passif actif · ${diagnosticSignals} signaux detectes · Ollama ${ollamaHealth} · ${history.length} rapports bornes`,
    evidence: [
      `Runtime: ${activeAlerts.length} alertes actives et ${globalMetrics.totalErrors} erreurs globales alimentent deja le diagnostic passif.`,
      `Runtime: Ollama cible ${ollamaStats.config.model} via ${ollamaStats.config.endpoint}.`,
      `Runtime: providers declares ${activeProviders.join(', ')} et exposes au diagnostic passif.`,
      `Runtime: dernier rapport ${formatDiagnosticClock(latestReport.timestamp)} · severite ${latestReport.severity} · historiques ${history.length}/${DIAGNOSTIC_REPORT_HISTORY_LIMIT}.`,
      ...base.evidence,
    ],
    blockers: [
      ...(history.length > 0
        ? [
            'Le rapport d anomalie structurel reste borne au navigateur courant et ne pilote pas encore une correction automatique reelle.',
          ]
        : base.blockers),
      ...(ollamaStats.errorCount > 0
        ? [
            `Le provider Ollama conserve ${ollamaStats.errorCount} erreurs recentes non resolues dans son etat runtime.`,
          ]
        : []),
      ...(history.length > 0 ? base.blockers : []),
    ],
    nextStep:
      'Transformer ces signaux passifs en rapport d anomalie structurel et pilotage de correction automatique depuis le service diagnostic.',
    detailSections: [
      {
        key: 'diagnostic-report',
        title: 'Rapport d anomalie structurel',
        items: [
          {
            id: 'diagnostic-report-severity',
            label: `Severite: ${latestReport.severity} · signaux=${latestReport.diagnosticSignals} · alertes=${latestReport.activeAlerts} · erreurs=${latestReport.totalErrors}`,
          },
          {
            id: 'diagnostic-report-ollama',
            label: `Ollama: ${latestReport.ollamaHealth} · erreurs recentes=${latestReport.ollamaErrorCount} · endpoint=${ollamaStats.config.endpoint}`,
          },
          {
            id: 'diagnostic-report-providers',
            label: `Providers observes: ${latestReport.activeProviders.join(', ') || 'none'}`,
          },
        ],
      },
      {
        key: 'diagnostic-history',
        title: 'Historique borne',
        items: history
          .slice()
          .reverse()
          .map(report => ({
            id: report.id,
            label: `${formatDiagnosticClock(report.timestamp)} · severity=${report.severity} · signaux=${report.diagnosticSignals} · ollama=${report.ollamaHealth} · providers=${report.activeProviders.join(', ') || 'none'}`,
          })),
      },
    ],
  };
}

export function startDiagnosticAgent() {
  return getDiagnosticAgentStatus();
}

// ═══════════════════════════════════════════════════════════════
// ACTIVE DIAGNOSTIC ENGINE — v31.2.14
// Scan actif périodique avec rapport structuré et actions correctives
// ═══════════════════════════════════════════════════════════════

export type DiagnosticCheckStatus = 'pass' | 'warn' | 'fail';

export interface DiagnosticCheckResult {
  id: string;
  label: string;
  status: DiagnosticCheckStatus;
  detail: string;
  suggestedAction?: string;
}

export interface ActiveDiagnosticScanResult {
  scanId: string;
  timestamp: number;
  durationMs: number;
  overallStatus: DiagnosticCheckStatus;
  checks: DiagnosticCheckResult[];
  correctiveActions: string[];
  rawSignals: {
    activeAlerts: number;
    totalErrors: number;
    ollamaHealth: string;
    ollamaErrorCount: number;
    activeProviders: string[];
  };
}

const ACTIVE_SCAN_HISTORY_KEY = 'titane_diagnostic_active_scan_history';
const ACTIVE_SCAN_HISTORY_LIMIT = 10;
const ACTIVE_SCAN_INTERVAL_MS = 60_000; // 1 min

let _activeScanTimer: ReturnType<typeof setInterval> | null = null;
let _activeScanListeners: Array<(result: ActiveDiagnosticScanResult) => void> = [];

function loadActiveScanHistory(): ActiveDiagnosticScanResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ACTIVE_SCAN_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveActiveScanHistory(history: ActiveDiagnosticScanResult[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACTIVE_SCAN_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // storage full
  }
}

function appendActiveScanHistory(result: ActiveDiagnosticScanResult): void {
  const history = loadActiveScanHistory();
  const next = [...history, result].slice(-ACTIVE_SCAN_HISTORY_LIMIT);
  saveActiveScanHistory(next);
}

/**
 * Execute an active diagnostic scan across all observable signals.
 * Returns a structured report with check results and corrective actions.
 */
export function runActiveDiagnosticScan(): ActiveDiagnosticScanResult {
  const start = Date.now();
  const globalMetrics = chatMetrics.getGlobalMetrics();
  const activeAlerts = alerting.getActiveAlerts().filter(alert => !alert.resolved);
  const ollamaStats = (ollamaProvider.getStats?.() ?? {
    errorCount: 0,
    endpointHealthy: null,
    config: { model: 'unknown', endpoint: 'unknown' },
  }) as DiagnosticOllamaStats;
  const activeProviders = getActiveAIProviders();

  const checks: DiagnosticCheckResult[] = [];
  const correctiveActions: string[] = [];

  // ── Check 1: Active alerts ───────────────────────────────────
  if (activeAlerts.length === 0) {
    checks.push({ id: 'alerts', label: 'Alertes actives', status: 'pass', detail: 'Aucune alerte active' });
  } else {
    const sev = activeAlerts.some(a => a.severity === AlertSeverity.CRITICAL) ? 'fail' : 'warn';
    checks.push({
      id: 'alerts',
      label: 'Alertes actives',
      status: sev,
      detail: `${activeAlerts.length} alerte(s) active(s)`,
      suggestedAction: 'Résoudre les alertes actives dans le dashboard monitoring',
    });
    if (sev === 'fail') correctiveActions.push('RESOLVE_ACTIVE_ALERTS');
  }

  // ── Check 2: Erreurs globales ────────────────────────────────
  const errorRate = globalMetrics.totalMessages > 0
    ? globalMetrics.totalErrors / globalMetrics.totalMessages
    : 0;
  if (errorRate === 0) {
    checks.push({ id: 'error-rate', label: 'Taux d\'erreur', status: 'pass', detail: '0% erreurs' });
  } else if (errorRate < 0.1) {
    checks.push({ id: 'error-rate', label: 'Taux d\'erreur', status: 'warn', detail: `${(errorRate * 100).toFixed(1)}% erreurs`, suggestedAction: 'Surveiller la tendance des erreurs' });
    correctiveActions.push('MONITOR_ERROR_TREND');
  } else {
    checks.push({ id: 'error-rate', label: 'Taux d\'erreur', status: 'fail', detail: `${(errorRate * 100).toFixed(1)}% erreurs — seuil critique dépassé`, suggestedAction: 'Identifier et corriger la source d\'erreurs principale' });
    correctiveActions.push('INVESTIGATE_ERROR_SOURCE');
  }

  // ── Check 3: Ollama santé ────────────────────────────────────
  if (ollamaStats.endpointHealthy === true && ollamaStats.errorCount === 0) {
    checks.push({ id: 'ollama', label: 'Santé Ollama', status: 'pass', detail: `${ollamaStats.config.model} @ ${ollamaStats.config.endpoint} — sain` });
  } else if (ollamaStats.endpointHealthy === false || ollamaStats.errorCount > 0) {
    const sev: DiagnosticCheckStatus = ollamaStats.endpointHealthy === false ? 'fail' : 'warn';
    checks.push({
      id: 'ollama',
      label: 'Santé Ollama',
      status: sev,
      detail: `${ollamaStats.endpointHealthy === false ? 'endpoint inaccessible' : `${ollamaStats.errorCount} erreurs récentes`} — modèle ${ollamaStats.config.model}`,
      suggestedAction: 'Relancer Ollama: ollama serve && ollama pull gemma2:2b',
    });
    correctiveActions.push(ollamaStats.endpointHealthy === false ? 'RESTART_OLLAMA' : 'CLEAR_OLLAMA_ERRORS');
  } else {
    checks.push({ id: 'ollama', label: 'Santé Ollama', status: 'warn', detail: 'État Ollama non sondé' });
  }

  // ── Check 4: Providers actifs ────────────────────────────────
  if (activeProviders.length === 0) {
    checks.push({ id: 'providers', label: 'Providers actifs', status: 'fail', detail: 'Aucun provider IA actif', suggestedAction: 'Activer au minimum le provider Ollama local' });
    correctiveActions.push('ACTIVATE_LOCAL_PROVIDER');
  } else {
    checks.push({ id: 'providers', label: 'Providers actifs', status: 'pass', detail: `${activeProviders.join(', ')} actifs` });
  }

  // ── Check 5: Latence de réponse ──────────────────────────────
  const avgLatency = globalMetrics.avgResponseTime;
  if (avgLatency === 0 || globalMetrics.totalMessages === 0) {
    checks.push({ id: 'latency', label: 'Latence réponse', status: 'pass', detail: 'Pas encore de données de latence' });
  } else if (avgLatency < 3000) {
    checks.push({ id: 'latency', label: 'Latence réponse', status: 'pass', detail: `${Math.round(avgLatency)}ms moyenne` });
  } else if (avgLatency < 8000) {
    checks.push({ id: 'latency', label: 'Latence réponse', status: 'warn', detail: `${Math.round(avgLatency)}ms — latence élevée`, suggestedAction: 'Vérifier la charge réseau et la disponibilité Ollama' });
    correctiveActions.push('CHECK_NETWORK_LOAD');
  } else {
    checks.push({ id: 'latency', label: 'Latence réponse', status: 'fail', detail: `${Math.round(avgLatency)}ms — latence critique`, suggestedAction: 'Basculer vers le provider local, vérifier Ollama serve' });
    correctiveActions.push('SWITCH_TO_LOCAL_PROVIDER');
  }

  const overallStatus: DiagnosticCheckStatus =
    checks.some(c => c.status === 'fail') ? 'fail' :
    checks.some(c => c.status === 'warn') ? 'warn' :
    'pass';

  const scanResult: ActiveDiagnosticScanResult = {
    scanId: `diag-scan-${start}`,
    timestamp: start,
    durationMs: Date.now() - start,
    overallStatus,
    checks,
    correctiveActions: [...new Set(correctiveActions)],
    rawSignals: {
      activeAlerts: activeAlerts.length,
      totalErrors: globalMetrics.totalErrors,
      ollamaHealth: ollamaStats.endpointHealthy === true ? 'sain' : ollamaStats.endpointHealthy === false ? 'dégradé' : 'non sondé',
      ollamaErrorCount: ollamaStats.errorCount,
      activeProviders,
    },
  };

  appendActiveScanHistory(scanResult);
  _activeScanListeners.forEach(cb => cb(scanResult));
  return scanResult;
}

/** Get the scan history (last N scans). */
export function getActiveScanHistory(): ActiveDiagnosticScanResult[] {
  return loadActiveScanHistory();
}

/**
 * Start periodic active diagnostic loop (1-min interval).
 * Idempotent — safe to call multiple times.
 */
export function startDiagnosticLoop(): void {
  if (_activeScanTimer !== null) return;
  void runActiveDiagnosticScan();
  _activeScanTimer = setInterval(() => {
    void runActiveDiagnosticScan();
  }, ACTIVE_SCAN_INTERVAL_MS);
}

/** Stop the periodic diagnostic loop. */
export function stopDiagnosticLoop(): void {
  if (_activeScanTimer !== null) {
    clearInterval(_activeScanTimer);
    _activeScanTimer = null;
  }
}

/** Subscribe to scan results in real time. Returns unsubscribe function. */
export function onDiagnosticScan(
  cb: (result: ActiveDiagnosticScanResult) => void
): () => void {
  _activeScanListeners.push(cb);
  return () => {
    _activeScanListeners = _activeScanListeners.filter(fn => fn !== cb);
  };
}

/** Reset for tests */
export function resetDiagnosticLoopForTests(): void {
  stopDiagnosticLoop();
  _activeScanListeners = [];
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ACTIVE_SCAN_HISTORY_KEY);
  }
}
