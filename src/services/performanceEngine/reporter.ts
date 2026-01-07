/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY - Performance Engine - Reporter / Integrator                 ║
 * ║  Dashboard et intégration Self-Healing                                       ║
 * ║  Version: Ω∞Ω+ | SUPER PROMPT #8                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  formatBytes as _formatBytes,
  formatDuration as _formatDuration,
  calculateGrade,
  DEFAULT_PERFORMANCE_CONFIG,
} from './performanceEngine.config';
import type {
  MetricsSnapshot,
  PerformanceIssue,
  Recommendation,
  SeverityLevel,
  TitaneModule,
  PerformanceGrade,
  PerformanceEvent,
  PerformanceEventListener,
  SelfHealingIntegration,
} from './performanceEngine.config';
import type { AnalysisResult, TrendAnalysis, TrendDirection } from './analyzerEngine';
import type { AdvisorResult } from './advisorEngine';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES SPÉCIFIQUES AU REPORTER
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Rapport de performance complet
 */
export interface PerformanceReport {
  id: string;
  generatedAt: number;
  period: {
    start: number;
    end: number;
    durationMs: number;
  };
  summary: ReportSummary;
  metrics: MetricsSummaryReport;
  issues: IssuesSummaryReport;
  recommendations: RecommendationsSummaryReport;
  trends: TrendsSummaryReport;
  modules: ModulesSummaryReport;
}

/**
 * Résumé global du rapport
 */
interface ReportSummary {
  healthScore: number;
  grade: PerformanceGrade;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  headline: string;
  highlights: string[];
}

/**
 * Résumé des métriques
 */
interface MetricsSummaryReport {
  cpu: {
    current: number;
    average: number;
    peak: number;
    trend: TrendDirection;
  };
  ram: {
    current: number;
    average: number;
    peak: number;
    trend: TrendDirection;
  };
  fps: {
    current: number;
    average: number;
    min: number;
    drops: number;
    trend: TrendDirection;
  };
  tauri: {
    latency: number;
    invokes: number;
    errors: number;
  };
  ia: {
    latency: number;
    requests: number;
    errors: number;
    queueSize: number;
  };
}

/**
 * Résumé des problèmes
 */
interface IssuesSummaryReport {
  total: number;
  bySeverity: Record<SeverityLevel, number>;
  byModule: Partial<Record<TitaneModule | 'system' | 'frontend' | 'ia', number>>;
  topIssues: PerformanceIssue[];
  resolved: number;
  recurring: number;
}

/**
 * Résumé des recommandations
 */
interface RecommendationsSummaryReport {
  total: number;
  pending: number;
  applied: number;
  topPriority: Recommendation[];
  byCategory: Record<string, number>;
}

/**
 * Résumé des tendances
 */
interface TrendsSummaryReport {
  overall: TrendDirection;
  cpu: TrendDirection;
  ram: TrendDirection;
  fps: TrendDirection;
  iaLatency: TrendDirection;
  forecast: string;
}

/**
 * Résumé par module
 */
interface ModulesSummaryReport {
  healthyCount: number;
  unhealthyCount: number;
  modules: ModuleHealthReport[];
}

/**
 * Santé d'un module
 */
interface ModuleHealthReport {
  module: TitaneModule;
  healthy: boolean;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  issueCount: number;
}

/**
 * État du reporter
 */
interface ReporterState {
  lastReport: PerformanceReport | null;
  reportHistory: PerformanceReport[];
  snapshotBuffer: MetricsSnapshot[];
  analysisBuffer: AnalysisResult[];
  advisorBuffer: AdvisorResult[];
  selfHealingQueue: PerformanceIssue[];
}

/**
 * Configuration du reporter
 */
interface ReporterConfig {
  enabled: boolean;
  logLevel: 'silent' | 'error' | 'warn' | 'info' | 'debug';
  selfHealingIntegration: boolean;
  dashboardEnabled: boolean;
  reportIntervalMs: number;
  bufferSize: number;
  historySize: number;
}

/**
 * Message de log formaté
 */
interface FormattedLog {
  level: 'error' | 'warn' | 'info' | 'debug';
  timestamp: number;
  message: string;
  context?: Record<string, unknown>;
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_REPORTER_CONFIG: ReporterConfig = {
  enabled: DEFAULT_PERFORMANCE_CONFIG.reporter.enabled,
  logLevel: DEFAULT_PERFORMANCE_CONFIG.reporter.logLevel,
  selfHealingIntegration: DEFAULT_PERFORMANCE_CONFIG.reporter.selfHealingIntegration,
  dashboardEnabled: DEFAULT_PERFORMANCE_CONFIG.reporter.dashboardEnabled,
  reportIntervalMs: 60 * 1000, // 1 minute
  bufferSize: 60,
  historySize: 24, // 24 rapports
};

const STATUS_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 50,
  poor: 25,
  critical: 0,
};

// ════════════════════════════════════════════════════════════════════════════════
// CLASSE PRINCIPALE - PerformanceReporter
// ════════════════════════════════════════════════════════════════════════════════

export class PerformanceReporter {
  private state: ReporterState;
  private config: ReporterConfig;
  private eventListeners: Map<string, Set<PerformanceEventListener>>;
  private selfHealing: SelfHealingIntegration | null = null;
  private reportTimer: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private logs: FormattedLog[] = [];

  constructor(config: Partial<ReporterConfig> = {}) {
    this.config = { ...DEFAULT_REPORTER_CONFIG, ...config };
    this.state = this.createInitialState();
    this.eventListeners = new Map();

    this.log('info', 'Initialisé');
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Démarre le reporter
   */
  start(): void {
    if (this.isRunning) {
      this.log('warn', "Déjà en cours d'exécution");
      return;
    }

    this.isRunning = true;

    // Démarrer le timer de génération de rapports
    if (this.config.reportIntervalMs > 0) {
      this.reportTimer = setInterval(() => {
        this.generatePeriodicReport();
      }, this.config.reportIntervalMs);
    }

    this.emit('engine_started', { component: 'reporter', timestamp: Date.now() });
    this.log('info', 'Démarré');
  }

  /**
   * Arrête le reporter
   */
  stop(): void {
    if (!this.isRunning) {
      this.log('warn', "Pas en cours d'exécution");
      return;
    }

    this.isRunning = false;

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    this.emit('engine_stopped', { component: 'reporter', timestamp: Date.now() });
    this.log('info', 'Arrêté');
  }

  /**
   * Configure l'intégration Self-Healing
   */
  setSelfHealingIntegration(integration: SelfHealingIntegration): void {
    this.selfHealing = integration;
    this.log('info', 'Self-Healing intégré');
  }

  /**
   * Reçoit un snapshot de métriques
   */
  receiveSnapshot(snapshot: MetricsSnapshot): void {
    this.addToBuffer('snapshot', snapshot);

    if (this.config.selfHealingIntegration && this.selfHealing) {
      this.selfHealing.reportMetrics(snapshot);
    }

    this.log('debug', `[PerformanceReporter] Snapshot reçu: ${snapshot.id}`);
  }

  /**
   * Reçoit un résultat d'analyse
   */
  receiveAnalysis(analysis: AnalysisResult): void {
    this.addToBuffer('analysis', analysis);

    // Traiter les issues critiques
    const criticalIssues = analysis.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      this.handleCriticalIssues(criticalIssues);
    }

    this.log(
      'debug',
      `[PerformanceReporter] Analyse reçue: score=${analysis.healthScore}`
    );
  }

  /**
   * Reçoit un résultat de l'advisor
   */
  receiveAdvisorResult(result: AdvisorResult): void {
    this.addToBuffer('advisor', result);

    if (result.priorityActions.length > 0) {
      this.log(
        'warn',
        `[PerformanceReporter] ${result.priorityActions.length} actions prioritaires`
      );
    }
  }

  /**
   * Génère un rapport complet
   */
  generateReport(): PerformanceReport {
    const now = Date.now();
    const snapshots = this.state.snapshotBuffer;
    const analyses = this.state.analysisBuffer;
    const advisorResults = this.state.advisorBuffer;

    // Période couverte
    const startTime = snapshots.length > 0 ? (snapshots[0]?.timestamp ?? now) : now;
    const endTime =
      snapshots.length > 0 ? (snapshots[snapshots.length - 1]?.timestamp ?? now) : now;

    // Dernier snapshot et analyse
    const latestSnapshot = snapshots[snapshots.length - 1];
    const latestAnalysis = analyses[analyses.length - 1];
    const _latestAdvisor = advisorResults[advisorResults.length - 1];

    // Calculer les métriques agrégées
    const metricsSummary = this.calculateMetricsSummary(
      snapshots,
      latestAnalysis?.trends
    );

    // Agréger les issues
    const issuesSummary = this.calculateIssuesSummary(analyses);

    // Agréger les recommandations
    const recommendationsSummary = this.calculateRecommendationsSummary(advisorResults);

    // Calculer les tendances
    const trendsSummary = this.calculateTrendsSummary(latestAnalysis?.trends);

    // Résumé des modules
    const modulesSummary = this.calculateModulesSummary(latestSnapshot);

    // Calculer le score de santé global
    const healthScore =
      latestAnalysis?.healthScore ?? this.estimateHealthScore(metricsSummary);
    const grade = calculateGrade(healthScore);
    const status = this.getStatusFromScore(healthScore);

    const report: PerformanceReport = {
      id: `report_${now}_${Math.random().toString(36).slice(2, 8)}`,
      generatedAt: now,
      period: {
        start: startTime,
        end: endTime,
        durationMs: endTime - startTime,
      },
      summary: {
        healthScore,
        grade,
        status,
        headline: this.generateHeadline(status, issuesSummary.total),
        highlights: this.generateHighlights(metricsSummary, issuesSummary, trendsSummary),
      },
      metrics: metricsSummary,
      issues: issuesSummary,
      recommendations: recommendationsSummary,
      trends: trendsSummary,
      modules: modulesSummary,
    };

    // Sauvegarder dans l'historique
    this.state.lastReport = report;
    this.state.reportHistory.push(report);
    while (this.state.reportHistory.length > this.config.historySize) {
      this.state.reportHistory.shift();
    }

    this.emit('snapshot_collected', { report });
    this.log('info', `[PerformanceReporter] Rapport généré: ${report.id}`);

    return report;
  }

  /**
   * Récupère le dernier rapport
   */
  getLastReport(): PerformanceReport | null {
    return this.state.lastReport;
  }

  /**
   * Récupère l'historique des rapports
   */
  getReportHistory(): PerformanceReport[] {
    return [...this.state.reportHistory];
  }

  /**
   * Récupère les données pour le dashboard
   */
  getDashboardData(): DashboardData {
    const latestSnapshot =
      this.state.snapshotBuffer[this.state.snapshotBuffer.length - 1] ?? null;
    const latestAnalysis =
      this.state.analysisBuffer[this.state.analysisBuffer.length - 1] ?? null;
    const latestAdvisor =
      this.state.advisorBuffer[this.state.advisorBuffer.length - 1] ?? null;

    return {
      timestamp: Date.now(),
      healthScore: latestAnalysis?.healthScore ?? 100,
      grade: latestAnalysis?.grade ?? 'S',
      metrics: latestSnapshot
        ? {
            cpu: latestSnapshot.system.cpu.global,
            ram: latestSnapshot.system.ram.system.percent,
            fps: latestSnapshot.frontend.fps.current,
            tauriLatency: latestSnapshot.frontend.tauri.invokeLatency,
            iaLatency: latestSnapshot.ia.ollama.available
              ? latestSnapshot.ia.ollama.latency
              : latestSnapshot.ia.gemini.latency,
          }
        : null,
      issues: latestAnalysis?.issues ?? [],
      recommendations: latestAdvisor?.recommendations ?? [],
      trends: latestAnalysis?.trends ?? {
        cpu: 'unknown',
        ram: 'unknown',
        fps: 'unknown',
        iaLatency: 'unknown',
        overall: 'unknown',
      },
      history: {
        cpu: this.state.snapshotBuffer.map(s => ({
          timestamp: s.timestamp,
          value: s.system.cpu.global,
        })),
        ram: this.state.snapshotBuffer.map(s => ({
          timestamp: s.timestamp,
          value: s.system.ram.system.percent,
        })),
        fps: this.state.snapshotBuffer.map(s => ({
          timestamp: s.timestamp,
          value: s.frontend.fps.current,
        })),
      },
    };
  }

  /**
   * Récupère les logs
   */
  getLogs(level?: FormattedLog['level'], limit?: number): FormattedLog[] {
    let logs = [...this.logs];

    if (level) {
      logs = logs.filter(l => l.level === level);
    }

    if (limit) {
      logs = logs.slice(-limit);
    }

    return logs;
  }

  /**
   * Récupère les statistiques du reporter
   */
  getStats(): Record<string, unknown> {
    return {
      isRunning: this.isRunning,
      snapshotBufferSize: this.state.snapshotBuffer.length,
      analysisBufferSize: this.state.analysisBuffer.length,
      advisorBufferSize: this.state.advisorBuffer.length,
      reportHistorySize: this.state.reportHistory.length,
      lastReportId: this.state.lastReport?.id,
      selfHealingConnected: this.selfHealing !== null,
      selfHealingQueueSize: this.state.selfHealingQueue.length,
      logsCount: this.logs.length,
    };
  }

  /**
   * Réinitialise l'état du reporter
   */
  reset(): void {
    this.state = this.createInitialState();
    this.logs = [];
    this.log('info', 'État réinitialisé');
  }

  /**
   * S'abonner à un événement
   */
  on(event: string, listener: PerformanceEventListener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }

    return () => {
      this.eventListeners.get(event)?.delete(listener);
    };
  }

  /**
   * Se désabonner d'un événement
   */
  off(event: string, listener: PerformanceEventListener): void {
    this.eventListeners.get(event)?.delete(listener);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉTAT
  // ══════════════════════════════════════════════════════════════════════════════

  private createInitialState(): ReporterState {
    return {
      lastReport: null,
      reportHistory: [],
      snapshotBuffer: [],
      analysisBuffer: [],
      advisorBuffer: [],
      selfHealingQueue: [],
    };
  }

  private addToBuffer(
    type: 'snapshot' | 'analysis' | 'advisor',
    data: MetricsSnapshot | AnalysisResult | AdvisorResult
  ): void {
    switch (type) {
      case 'snapshot':
        this.state.snapshotBuffer.push(data as MetricsSnapshot);
        while (this.state.snapshotBuffer.length > this.config.bufferSize) {
          this.state.snapshotBuffer.shift();
        }
        break;
      case 'analysis':
        this.state.analysisBuffer.push(data as AnalysisResult);
        while (this.state.analysisBuffer.length > this.config.bufferSize) {
          this.state.analysisBuffer.shift();
        }
        break;
      case 'advisor':
        this.state.advisorBuffer.push(data as AdvisorResult);
        while (this.state.advisorBuffer.length > this.config.bufferSize) {
          this.state.advisorBuffer.shift();
        }
        break;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - CALCULS
  // ══════════════════════════════════════════════════════════════════════════════

  private calculateMetricsSummary(
    snapshots: MetricsSnapshot[],
    trends?: TrendAnalysis
  ): MetricsSummaryReport {
    if (snapshots.length === 0) {
      return this.getEmptyMetricsSummary();
    }

    const latest = snapshots[snapshots.length - 1];
    if (!latest) {
      return this.getEmptyMetricsSummary();
    }

    // CPU
    const cpuValues = snapshots.map(s => s.system.cpu.global);
    const cpuAvg = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
    const cpuPeak = Math.max(...cpuValues);

    // RAM
    const ramValues = snapshots.map(s => s.system.ram.system.percent);
    const ramAvg = ramValues.reduce((a, b) => a + b, 0) / ramValues.length;
    const ramPeak = Math.max(...ramValues);

    // FPS
    const fpsValues = snapshots.map(s => s.frontend.fps.current);
    const fpsAvg = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    const fpsMin = Math.min(...fpsValues);
    const fpsDrops = snapshots.reduce((sum, s) => sum + s.frontend.fps.drops, 0);

    // Tauri
    const tauriLatency =
      snapshots.reduce((sum, s) => sum + s.frontend.tauri.invokeLatency, 0) /
      snapshots.length;
    const tauriInvokes = snapshots.reduce(
      (sum, s) => sum + s.frontend.tauri.invokeCount,
      0
    );
    const tauriErrors = snapshots.reduce(
      (sum, s) => sum + s.frontend.tauri.invokeErrors,
      0
    );

    // IA
    const iaLatencyValues = snapshots.map(s =>
      s.ia.ollama.available ? s.ia.ollama.latency : s.ia.gemini.latency
    );
    const iaLatency = iaLatencyValues.reduce((a, b) => a + b, 0) / iaLatencyValues.length;
    const iaRequests = snapshots.reduce(
      (sum, s) => sum + s.ia.ollama.requestCount + s.ia.gemini.requestCount,
      0
    );
    const iaErrors = snapshots.reduce(
      (sum, s) => sum + s.ia.ollama.errorCount + s.ia.gemini.errorCount,
      0
    );
    const iaQueueSize = latest.ia.ollama.queueSize;

    return {
      cpu: {
        current: latest.system.cpu.global,
        average: cpuAvg,
        peak: cpuPeak,
        trend: trends?.cpu ?? 'unknown',
      },
      ram: {
        current: latest.system.ram.system.percent,
        average: ramAvg,
        peak: ramPeak,
        trend: trends?.ram ?? 'unknown',
      },
      fps: {
        current: latest.frontend.fps.current,
        average: fpsAvg,
        min: fpsMin,
        drops: fpsDrops,
        trend: trends?.fps ?? 'unknown',
      },
      tauri: {
        latency: tauriLatency,
        invokes: tauriInvokes,
        errors: tauriErrors,
      },
      ia: {
        latency: iaLatency,
        requests: iaRequests,
        errors: iaErrors,
        queueSize: iaQueueSize,
      },
    };
  }

  private getEmptyMetricsSummary(): MetricsSummaryReport {
    return {
      cpu: { current: 0, average: 0, peak: 0, trend: 'unknown' },
      ram: { current: 0, average: 0, peak: 0, trend: 'unknown' },
      fps: { current: 60, average: 60, min: 60, drops: 0, trend: 'unknown' },
      tauri: { latency: 0, invokes: 0, errors: 0 },
      ia: { latency: 0, requests: 0, errors: 0, queueSize: 0 },
    };
  }

  private calculateIssuesSummary(analyses: AnalysisResult[]): IssuesSummaryReport {
    const allIssues = analyses.flatMap(a => a.issues);

    const bySeverity: Record<SeverityLevel, number> = {
      critical: 0,
      major: 0,
      warning: 0,
      info: 0,
    };

    const byModule: Partial<Record<TitaneModule | 'system' | 'frontend' | 'ia', number>> =
      {};

    for (const issue of allIssues) {
      bySeverity[issue.severity]++;
      byModule[issue.module] = (byModule[issue.module] ?? 0) + 1;
    }

    // Top issues (les plus récentes et sévères)
    const topIssues = allIssues
      .sort((a, b) => {
        const severityOrder: Record<SeverityLevel, number> = {
          critical: 0,
          major: 1,
          warning: 2,
          info: 3,
        };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 5);

    return {
      total: allIssues.length,
      bySeverity,
      byModule,
      topIssues,
      resolved: allIssues.filter(i => i.resolvedAt !== undefined).length,
      recurring: 0, // À implémenter avec tracking
    };
  }

  private calculateRecommendationsSummary(
    advisorResults: AdvisorResult[]
  ): RecommendationsSummaryReport {
    const allRecs = advisorResults.flatMap(r => r.recommendations);
    const applied = advisorResults.reduce((sum, r) => sum + r.appliedCount, 0);

    const byCategory: Record<string, number> = {};
    for (const rec of allRecs) {
      byCategory[rec.category] = (byCategory[rec.category] ?? 0) + 1;
    }

    const topPriority = allRecs.sort((a, b) => b.priority - a.priority).slice(0, 5);

    return {
      total: allRecs.length,
      pending: allRecs.length - applied,
      applied,
      topPriority,
      byCategory,
    };
  }

  private calculateTrendsSummary(trends?: TrendAnalysis): TrendsSummaryReport {
    const defaultTrend: TrendDirection = 'unknown';

    const summary: TrendsSummaryReport = {
      overall: trends?.overall ?? defaultTrend,
      cpu: trends?.cpu ?? defaultTrend,
      ram: trends?.ram ?? defaultTrend,
      fps: trends?.fps ?? defaultTrend,
      iaLatency: trends?.iaLatency ?? defaultTrend,
      forecast: this.generateForecast(trends),
    };

    return summary;
  }

  private calculateModulesSummary(snapshot?: MetricsSnapshot): ModulesSummaryReport {
    if (!snapshot) {
      return { healthyCount: 0, unhealthyCount: 0, modules: [] };
    }

    const modules: ModuleHealthReport[] = [];
    let healthyCount = 0;
    let unhealthyCount = 0;

    for (const [moduleId, state] of Object.entries(snapshot.modules)) {
      if (state.healthy) {
        healthyCount++;
      } else {
        unhealthyCount++;
      }

      modules.push({
        module: moduleId as TitaneModule,
        healthy: state.healthy,
        cpuUsage: state.cpuUsage,
        memoryUsage: state.memoryUsage,
        responseTime: state.responseTime,
        errorRate: state.errorRate,
        issueCount: 0, // À calculer avec les issues
      });
    }

    return { healthyCount, unhealthyCount, modules };
  }

  private estimateHealthScore(metrics: MetricsSummaryReport): number {
    let score = 100;

    // Pénalités CPU
    if (metrics.cpu.current > 80) score -= 15;
    else if (metrics.cpu.current > 60) score -= 8;

    // Pénalités RAM
    if (metrics.ram.current > 85) score -= 15;
    else if (metrics.ram.current > 70) score -= 8;

    // Pénalités FPS
    if (metrics.fps.current < 20) score -= 20;
    else if (metrics.fps.current < 30) score -= 10;

    // Pénalités latence
    if (metrics.tauri.latency > 500) score -= 10;
    if (metrics.ia.latency > 5000) score -= 10;

    return Math.max(0, score);
  }

  private getStatusFromScore(score: number): ReportSummary['status'] {
    if (score >= STATUS_THRESHOLDS.excellent) return 'excellent';
    if (score >= STATUS_THRESHOLDS.good) return 'good';
    if (score >= STATUS_THRESHOLDS.fair) return 'fair';
    if (score >= STATUS_THRESHOLDS.poor) return 'poor';
    return 'critical';
  }

  private generateHeadline(status: ReportSummary['status'], issueCount: number): string {
    switch (status) {
      case 'excellent':
        return 'Performances excellentes - Système optimal';
      case 'good':
        return 'Bonnes performances - Quelques optimisations possibles';
      case 'fair':
        return `Performances acceptables - ${issueCount} problème(s) détecté(s)`;
      case 'poor':
        return `Performances dégradées - ${issueCount} problème(s) à traiter`;
      case 'critical':
        return `⚠️ Performances critiques - Action immédiate requise`;
    }
  }

  private generateHighlights(
    metrics: MetricsSummaryReport,
    issues: IssuesSummaryReport,
    trends: TrendsSummaryReport
  ): string[] {
    const highlights: string[] = [];

    // CPU
    if (metrics.cpu.current > 70) {
      highlights.push(`CPU élevé: ${metrics.cpu.current.toFixed(1)}%`);
    }

    // RAM
    if (metrics.ram.current > 80) {
      highlights.push(`RAM élevée: ${metrics.ram.current.toFixed(1)}%`);
    }

    // FPS
    if (metrics.fps.current < 30) {
      highlights.push(`FPS bas: ${metrics.fps.current.toFixed(0)}`);
    }

    // Issues critiques
    if (issues.bySeverity.critical > 0) {
      highlights.push(`${issues.bySeverity.critical} problème(s) critique(s)`);
    }

    // Tendances négatives
    if (trends.overall === 'degrading') {
      highlights.push('Tendance globale dégradante détectée');
    }

    if (highlights.length === 0) {
      highlights.push('Aucun problème majeur détecté');
    }

    return highlights;
  }

  private generateForecast(trends?: TrendAnalysis): string {
    if (!trends) return 'Données insuffisantes pour une prévision';

    const degradingCount = [trends.cpu, trends.ram, trends.fps, trends.iaLatency].filter(
      t => t === 'degrading'
    ).length;

    if (degradingCount >= 3) {
      return 'Prévision: Dégradation probable sans intervention';
    } else if (degradingCount >= 1) {
      return 'Prévision: Surveillance recommandée';
    } else if (trends.overall === 'improving') {
      return 'Prévision: Amélioration continue attendue';
    }

    return 'Prévision: Performances stables';
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - SELF-HEALING
  // ══════════════════════════════════════════════════════════════════════════════

  private handleCriticalIssues(issues: PerformanceIssue[]): void {
    if (!this.config.selfHealingIntegration || !this.selfHealing) {
      return;
    }

    for (const issue of issues) {
      this.selfHealing.reportIssue(issue);
      this.state.selfHealingQueue.push(issue);

      if (issue.autoFixable) {
        this.requestHealing(issue.id);
      }
    }
  }

  private async requestHealing(issueId: string): Promise<void> {
    if (!this.selfHealing) return;

    try {
      const success = await this.selfHealing.requestHealing(issueId);
      this.log(
        success ? 'info' : 'warn',
        `[PerformanceReporter] Healing ${issueId}: ${success ? 'initié' : 'refusé'}`
      );
    } catch (error) {
      this.log('error', `[PerformanceReporter] Erreur healing ${issueId}: ${error}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - LOGGING & ÉVÉNEMENTS
  // ══════════════════════════════════════════════════════════════════════════════

  private log(
    level: FormattedLog['level'],
    message: string,
    context?: Record<string, unknown>
  ): void {
    const logLevels: Record<ReporterConfig['logLevel'], number> = {
      silent: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    };

    const levelNumbers: Record<FormattedLog['level'], number> = {
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    };

    if (logLevels[this.config.logLevel] >= levelNumbers[level]) {
      const log: FormattedLog = {
        level,
        timestamp: Date.now(),
        message,
        context,
      };

      this.logs.push(log);

      // Limiter la taille des logs
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(-500);
      }

      // Output console
      switch (level) {
        case 'error':
          logger.error(message, context ?? '');
          break;
        case 'warn':
          logger.warn(message, context ?? '');
          break;
        case 'info':
          logger.debug(message, context ?? '');
          break;
        case 'debug':
          console.debug(message, context ?? '');
          break;
      }
    }
  }

  private emit(eventType: string, data: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: PerformanceEvent = {
        type: eventType as PerformanceEvent['type'],
        timestamp: Date.now(),
        data,
        source: 'reporter',
      };

      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          this.log('error', `[PerformanceReporter] Erreur listener ${eventType}`, {
            error,
          });
        }
      }
    }
  }

  private generatePeriodicReport(): void {
    if (this.state.snapshotBuffer.length === 0) {
      return;
    }

    this.generateReport();
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TYPES ADDITIONNELS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Données pour le dashboard
 */
export interface DashboardData {
  timestamp: number;
  healthScore: number;
  grade: PerformanceGrade;
  metrics: {
    cpu: number;
    ram: number;
    fps: number;
    tauriLatency: number;
    iaLatency: number;
  } | null;
  issues: PerformanceIssue[];
  recommendations: Recommendation[];
  trends: TrendAnalysis;
  history: {
    cpu: { timestamp: number; value: number }[];
    ram: { timestamp: number; value: number }[];
    fps: { timestamp: number; value: number }[];
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export { DEFAULT_REPORTER_CONFIG, STATUS_THRESHOLDS };
export type {
  ReporterConfig,
  ReporterState,
  ReportSummary,
  MetricsSummaryReport,
  IssuesSummaryReport,
  RecommendationsSummaryReport,
  TrendsSummaryReport,
  ModulesSummaryReport,
  ModuleHealthReport,
  FormattedLog,
};
