import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { safeInvoke, safeInvokeCanonical } from '@/utils/invoke';

const LOG_ANALYSIS_REPORT_KEY = 'titane_log_analysis_report_latest';
const LOG_ANALYSIS_HISTORY_KEY = 'titane_log_analysis_report_history';
const LOG_ANALYSIS_HISTORY_LIMIT = 12;
const DEFAULT_SCAN_LIMIT = 600;
const DEFAULT_WINDOW_MINUTES = 180;

export type LogIssueSeverity = 'info' | 'warning' | 'critical';

export interface LogAnalysisIssue {
  id: string;
  severity: LogIssueSeverity;
  source: string;
  message: string;
  timestamp: string;
}

export interface LogAnalysisReport {
  reportId: string;
  generatedAt: string;
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  anomalyScore: number;
  trendSummary: string;
  anomalies: LogAnalysisIssue[];
  inconsistencies: string[];
  improvementOpportunities: string[];
}

export interface LogAnalysisSnapshot {
  report: LogAnalysisReport | null;
  freshnessSeconds: number | null;
  source: 'backend' | 'fallback' | 'cache' | 'none';
}

type BackendIssue = {
  id?: string;
  severity?: string;
  source?: string;
  message?: string;
  timestamp?: string;
};

type BackendReport = {
  report_id?: string;
  generated_at?: string;
  total_logs?: number;
  error_count?: number;
  warning_count?: number;
  anomaly_score?: number;
  trend_summary?: string;
  inconsistencies?: string[];
  improvement_opportunities?: string[];
  anomalies?: BackendIssue[];
};

type RawLogEntry = {
  id?: string;
  level?: string;
  source_core?: string;
  message?: string;
  timestamp?: string;
};

type GetLogsResponse = {
  logs?: RawLogEntry[];
  total?: number;
};

function toIso(value: string | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function clampSeverity(value: string | undefined): LogIssueSeverity {
  if (value === 'critical' || value === 'warning' || value === 'info') {
    return value;
  }
  return 'info';
}

function loadStoredReport(): LogAnalysisReport | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOG_ANALYSIS_REPORT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as LogAnalysisReport;
    return parsed && typeof parsed.generatedAt === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function saveStoredReport(report: LogAnalysisReport): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOG_ANALYSIS_REPORT_KEY, JSON.stringify(report));

    const historyRaw = window.localStorage.getItem(LOG_ANALYSIS_HISTORY_KEY);
    const history = historyRaw ? (JSON.parse(historyRaw) as LogAnalysisReport[]) : [];
    const nextHistory = [...history, report].slice(-LOG_ANALYSIS_HISTORY_LIMIT);
    window.localStorage.setItem(LOG_ANALYSIS_HISTORY_KEY, JSON.stringify(nextHistory));
  } catch {
    // Ignore storage errors; dashboard can still render in-memory snapshot.
  }
}

function normalizeBackendReport(report: BackendReport): LogAnalysisReport {
  return {
    reportId: report.report_id ?? `log-analysis-${Date.now()}`,
    generatedAt: toIso(report.generated_at),
    totalLogs: report.total_logs ?? 0,
    errorCount: report.error_count ?? 0,
    warningCount: report.warning_count ?? 0,
    anomalyScore: Number((report.anomaly_score ?? 0).toFixed(2)),
    trendSummary: report.trend_summary ?? 'Aucune tendance significative détectée.',
    inconsistencies: report.inconsistencies ?? [],
    improvementOpportunities: report.improvement_opportunities ?? [],
    anomalies: (report.anomalies ?? []).map((entry, index) => ({
      id: entry.id ?? `backend-${index}`,
      severity: clampSeverity(entry.severity),
      source: entry.source ?? 'unknown',
      message: entry.message ?? 'Anomalie sans message',
      timestamp: toIso(entry.timestamp),
    })),
  };
}

export function analyzeLogsLocally(logs: RawLogEntry[]): LogAnalysisReport {
  const totalLogs = logs.length;
  const errorLogs = logs.filter(log => String(log.level).toLowerCase() === 'error');
  const warningLogs = logs.filter(log => String(log.level).toLowerCase() === 'warn');

  const anomalies: LogAnalysisIssue[] = logs
    .filter(log => {
      const msg = String(log.message ?? '').toLowerCase();
      return (
        msg.includes('fail') ||
        msg.includes('timeout') ||
        msg.includes('panic') ||
        msg.includes('undefined') ||
        msg.includes('violation')
      );
    })
    .slice(-8)
    .map((log, index) => ({
      id: log.id ?? `local-${index}`,
      severity:
        String(log.level).toLowerCase() === 'error'
          ? 'critical'
          : String(log.level).toLowerCase() === 'warn'
            ? 'warning'
            : 'info',
      source: log.source_core ?? 'unknown',
      message: log.message ?? 'Anomalie détectée sans message',
      timestamp: toIso(log.timestamp),
    }));

  const inconsistencies: string[] = [];
  if (totalLogs > 0 && errorLogs.length === 0 && warningLogs.length > 35) {
    inconsistencies.push(
      'Volume élevé de warnings sans erreurs: vérifier une saturation silencieuse des retries.'
    );
  }
  if (anomalies.length === 0 && errorLogs.length > 0) {
    inconsistencies.push(
      'Des erreurs existent mais aucune anomalie textuelle n a été corrélée: enrichir les messages d erreur.'
    );
  }

  const anomalyScoreRaw =
    totalLogs === 0 ? 0 : (errorLogs.length * 2 + warningLogs.length + anomalies.length) / totalLogs;

  const improvementOpportunities: string[] = [
    'Uniformiser correlation_id/session_id sur les erreurs critiques pour accélérer l analyse croisée.',
    'Ajouter des messages d erreur orientés action (cause probable + next step) dans les logs runtime.',
    'Surveiller le ratio warn/error et déclencher une alerte proactive au-delà du seuil configuré.',
  ];

  const trendSummary =
    totalLogs === 0
      ? 'Aucune donnée de log disponible dans la fenêtre demandée.'
      : errorLogs.length > warningLogs.length
        ? 'Tendance dégradée: les erreurs dominent les warnings dans la fenêtre courante.'
        : 'Tendance contrôlée: les warnings dominent ou restent proches des erreurs.';

  return {
    reportId: `log-analysis-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    totalLogs,
    errorCount: errorLogs.length,
    warningCount: warningLogs.length,
    anomalyScore: Number(anomalyScoreRaw.toFixed(2)),
    trendSummary,
    anomalies,
    inconsistencies,
    improvementOpportunities,
  };
}

export async function runLogAnalysisScan(params?: {
  limit?: number;
  windowMinutes?: number;
}): Promise<LogAnalysisSnapshot> {
  const limit = params?.limit ?? DEFAULT_SCAN_LIMIT;
  const windowMinutes = params?.windowMinutes ?? DEFAULT_WINDOW_MINUTES;

  const backend = await safeInvokeCanonical<BackendReport>('analyze_logs_intelligent', {
    limit,
    windowMinutes,
  });

  if (backend.ok && backend.content) {
    const normalized = normalizeBackendReport(backend.content);
    saveStoredReport(normalized);
    return {
      report: normalized,
      freshnessSeconds: 0,
      source: 'backend',
    };
  }

  const logsResponse = await safeInvoke<GetLogsResponse>('get_logs', {
    limit,
    offset: 0,
  });

  const fallbackLogs = Array.isArray(logsResponse?.logs) ? logsResponse.logs : [];
  const fallbackReport = analyzeLogsLocally(fallbackLogs);
  saveStoredReport(fallbackReport);

  return {
    report: fallbackReport,
    freshnessSeconds: 0,
    source: 'fallback',
  };
}

export function getLogAnalysisSnapshot(): LogAnalysisSnapshot {
  const report = loadStoredReport();
  if (!report) {
    return { report: null, freshnessSeconds: null, source: 'none' };
  }

  const freshnessSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(report.generatedAt).getTime()) / 1000)
  );

  return {
    report,
    freshnessSeconds,
    source: 'cache',
  };
}

export function getLogAnalysisReportMarkdown(report: LogAnalysisReport): string {
  const lines: string[] = [];
  lines.push(`# TITANE Log Analysis Report — ${report.reportId}`);
  lines.push('');
  lines.push(`- Generated at: ${report.generatedAt}`);
  lines.push(`- Total logs: ${report.totalLogs}`);
  lines.push(`- Errors: ${report.errorCount}`);
  lines.push(`- Warnings: ${report.warningCount}`);
  lines.push(`- Anomaly score: ${report.anomalyScore}`);
  lines.push('');
  lines.push('## Trend');
  lines.push(report.trendSummary);
  lines.push('');
  lines.push('## Inconsistencies');
  if (report.inconsistencies.length === 0) {
    lines.push('- None');
  } else {
    for (const inconsistency of report.inconsistencies) {
      lines.push(`- ${inconsistency}`);
    }
  }
  lines.push('');
  lines.push('## Improvement Opportunities');
  for (const suggestion of report.improvementOpportunities) {
    lines.push(`- ${suggestion}`);
  }
  lines.push('');
  lines.push('## Anomalies');
  if (report.anomalies.length === 0) {
    lines.push('- None');
  } else {
    for (const anomaly of report.anomalies) {
      lines.push(
        `- [${anomaly.severity.toUpperCase()}] ${anomaly.source} :: ${anomaly.message} (${anomaly.timestamp})`
      );
    }
  }

  return lines.join('\n');
}

export function getLogAnalysisAgentStatus() {
  const base = getAdvancedAgentStatus('log_analysis');
  const snapshot = getLogAnalysisSnapshot();
  const report = snapshot.report;

  if (!report) {
    return {
      ...base,
      readiness: 'partial' as const,
      readinessLabel: 'PARTIAL',
      serviceState: 'Analyse logs en attente de premier scan.',
      evidence: [
        'Aucun rapport log-analysis disponible pour cette session.',
        ...base.evidence,
      ],
      blockers: [
        'Lancer un scan pour générer le premier rapport intelligent des anomalies.',
        ...base.blockers,
      ],
      nextStep:
        'Lancer un scan manuel puis activer le rafraîchissement automatique 60s sur le dashboard canonique.',
    };
  }

  return {
    ...base,
    readiness: 'partial' as const,
    readinessLabel: 'PARTIAL',
    serviceState: `Rapport ${report.reportId} · anomalies=${report.anomalies.length} · score=${report.anomalyScore} · fraicheur=${snapshot.freshnessSeconds ?? 0}s`,
    evidence: [
      `Rapport intelligent actif: ${report.totalLogs} logs analysés (${report.errorCount} erreurs, ${report.warningCount} warnings).`,
      `Tendance: ${report.trendSummary}`,
      ...base.evidence,
    ],
    blockers:
      report.inconsistencies.length > 0
        ? [
            `Incohérences détectées (${report.inconsistencies.length}) à investiguer avant qualification.`,
            ...base.blockers,
          ]
        : base.blockers,
    nextStep:
      'Connecter la publication de rapport à un pipeline gouverné append-only pour audit cross-session.',
  };
}
