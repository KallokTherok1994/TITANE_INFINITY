import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { getActiveAIProviders } from '@/config/featureFlags';
import { ollamaProvider } from '@/services/ai/providers/ollama';
import { alerting } from '@/services/monitoring/alerting';
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
  const ollamaStats = ollamaProvider.getStats();
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
        ? [`Le provider Ollama conserve ${ollamaStats.errorCount} erreurs recentes non resolues dans son etat runtime.`]
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
