/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TITANE INFINITY - Performance Engine - Analyzer Engine                       ║
 * ║  Détection de problèmes et classification de sévérité                        ║
 * ║  Version: Ω∞Ω+ | SUPER PROMPT #8                                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  generateIssueId,
  determineSeverity,
  formatBytes,
  formatDuration,
  calculateGrade,
  DEFAULT_PERFORMANCE_CONFIG,
  RECOMMENDATION_TEMPLATES,
} from './performanceEngine.config';
import type {
  MetricsSnapshot,
  PerformanceIssue,
  SeverityLevel,
  TitaneModule,
  ThresholdConfig,
  MetricType,
  IssueType,
  PerformanceEvent,
  PerformanceEventListener,
  PerformanceGrade,
} from './performanceEngine.config';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES SPÉCIFIQUES À L'ANALYZER
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Résultat d'analyse
 */
export interface AnalysisResult {
  timestamp: number;
  snapshot: MetricsSnapshot;
  issues: PerformanceIssue[];
  healthScore: number;
  grade: PerformanceGrade;
  trends: TrendAnalysis;
  analysisTimeMs: number;
}

/**
 * Analyse des tendances
 */
export interface TrendAnalysis {
  cpu: TrendDirection;
  ram: TrendDirection;
  fps: TrendDirection;
  iaLatency: TrendDirection;
  overall: TrendDirection;
}

/**
 * Direction de tendance
 */
export type TrendDirection = 'improving' | 'stable' | 'degrading' | 'unknown';

/**
 * Pattern de problème détecté
 */
interface IssuePattern {
  id: string;
  issueType: IssueType;
  module?: TitaneModule;
  consecutiveCount: number;
  firstSeen: number;
  lastSeen: number;
  values: number[];
}

/**
 * État de l'analyzer
 */
interface AnalyzerState {
  activePatterns: Map<string, IssuePattern>;
  issues: PerformanceIssue[];
  lastAnalysis: number;
  analysisCount: number;
  snapshotHistory: MetricsSnapshot[];
}

/**
 * Configuration de l'analyzer
 */
interface AnalyzerConfig {
  historySize: number;
  trendDetectionThreshold: number;
  minSamplesForTrend: number;
  patternRetentionMs: number;
  thresholds: ThresholdConfig;
}

// ════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════════════════════

const DEFAULT_ANALYZER_CONFIG: AnalyzerConfig = {
  historySize: 60,
  trendDetectionThreshold: 10,
  minSamplesForTrend: 5,
  patternRetentionMs: 5 * 60 * 1000,
  thresholds: DEFAULT_PERFORMANCE_CONFIG.thresholds,
};

// Liste des modules TITANE
const TITANE_MODULES: TitaneModule[] = [
  'selfHealing',
  'cognitive',
  'memory',
  'tools',
  'search',
  'xp',
  'evolution',
  'prompt',
  'tts',
  'avatar',
  'chat',
  'performance',
];

// ════════════════════════════════════════════════════════════════════════════════
// CLASSE PRINCIPALE - PerformanceAnalyzer
// ════════════════════════════════════════════════════════════════════════════════

export class PerformanceAnalyzer {
  private state: AnalyzerState;
  private config: AnalyzerConfig;
  private eventListeners: Map<string, Set<PerformanceEventListener>>;
  private isRunning: boolean = false;

  constructor(config: Partial<AnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_ANALYZER_CONFIG, ...config };
    this.state = this.createInitialState();
    this.eventListeners = new Map();

    console.log('[PerformanceAnalyzer] Initialisé avec config:', this.config);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PUBLIQUES
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Démarre l'analyzer
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[PerformanceAnalyzer] Déjà en cours d'exécution");
      return;
    }

    this.isRunning = true;
    this.emit('engine_started', { component: 'analyzer', timestamp: Date.now() });
    console.log('[PerformanceAnalyzer] Démarré');
  }

  /**
   * Arrête l'analyzer
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn("[PerformanceAnalyzer] Pas en cours d'exécution");
      return;
    }

    this.isRunning = false;
    this.emit('engine_stopped', { component: 'analyzer', timestamp: Date.now() });
    console.log('[PerformanceAnalyzer] Arrêté');
  }

  /**
   * Analyse un snapshot de métriques
   */
  analyze(snapshot: MetricsSnapshot): AnalysisResult {
    const startTime = performance.now();

    // Ajouter à l'historique
    this.addToHistory(snapshot);

    // Détecter les problèmes
    const issues = this.detectIssues(snapshot);

    // Analyser les tendances
    const trends = this.analyzeTrends();

    // Calculer le score de santé global
    const healthScore = this.calculateHealthScore(snapshot, issues);
    const grade = calculateGrade(healthScore);

    // Construire le résultat
    const result: AnalysisResult = {
      timestamp: Date.now(),
      snapshot,
      issues,
      healthScore,
      grade,
      trends,
      analysisTimeMs: performance.now() - startTime,
    };

    // Mettre à jour l'état
    this.state.issues = issues;
    this.state.lastAnalysis = result.timestamp;
    this.state.analysisCount++;

    // Émettre les événements appropriés
    this.emitAnalysisEvents(result);

    return result;
  }

  /**
   * Récupère les problèmes actifs
   */
  getActiveIssues(): PerformanceIssue[] {
    return [...this.state.issues];
  }

  /**
   * Récupère les problèmes par sévérité
   */
  getIssuesBySeverity(severity: SeverityLevel): PerformanceIssue[] {
    return this.state.issues.filter(issue => issue.severity === severity);
  }

  /**
   * Récupère les problèmes par module
   */
  getIssuesByModule(
    module: TitaneModule | 'system' | 'frontend' | 'ia'
  ): PerformanceIssue[] {
    return this.state.issues.filter(issue => issue.module === module);
  }

  /**
   * Récupère les statistiques de l'analyzer
   */
  getStats(): Record<string, unknown> {
    return {
      isRunning: this.isRunning,
      analysisCount: this.state.analysisCount,
      lastAnalysis: this.state.lastAnalysis,
      activeIssuesCount: this.state.issues.length,
      activePatternsCount: this.state.activePatterns.size,
      historySize: this.state.snapshotHistory.length,
      issuesBySeverity: {
        critical: this.getIssuesBySeverity('critical').length,
        major: this.getIssuesBySeverity('major').length,
        warning: this.getIssuesBySeverity('warning').length,
        info: this.getIssuesBySeverity('info').length,
      },
    };
  }

  /**
   * Met à jour les thresholds
   */
  updateThresholds(thresholds: Partial<ThresholdConfig>): void {
    this.config.thresholds = { ...this.config.thresholds, ...thresholds };
    console.log('[PerformanceAnalyzer] Thresholds mis à jour:', thresholds);
  }

  /**
   * Réinitialise l'état de l'analyzer
   */
  reset(): void {
    this.state = this.createInitialState();
    console.log('[PerformanceAnalyzer] État réinitialisé');
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
  // MÉTHODES PRIVÉES - ÉTAT & HISTORIQUE
  // ══════════════════════════════════════════════════════════════════════════════

  private createInitialState(): AnalyzerState {
    return {
      activePatterns: new Map(),
      issues: [],
      lastAnalysis: 0,
      analysisCount: 0,
      snapshotHistory: [],
    };
  }

  private addToHistory(snapshot: MetricsSnapshot): void {
    this.state.snapshotHistory.push(snapshot);

    while (this.state.snapshotHistory.length > this.config.historySize) {
      this.state.snapshotHistory.shift();
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - DÉTECTION DE PROBLÈMES
  // ══════════════════════════════════════════════════════════════════════════════

  private detectIssues(snapshot: MetricsSnapshot): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    // Analyser les métriques système
    issues.push(...this.analyzeSystemMetrics(snapshot));

    // Analyser les métriques frontend
    issues.push(...this.analyzeFrontendMetrics(snapshot));

    // Analyser les métriques IA
    issues.push(...this.analyzeIAMetrics(snapshot));

    // Analyser les métriques par module
    issues.push(...this.analyzeModuleMetrics(snapshot));

    // Trier par sévérité (critical first)
    return this.sortIssuesBySeverity(issues);
  }

  /**
   * Analyse les métriques système
   */
  private analyzeSystemMetrics(snapshot: MetricsSnapshot): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const { system } = snapshot;
    const { thresholds } = this.config;

    // CPU Global
    if (system.cpu.global >= thresholds.system.cpuGlobalWarning) {
      issues.push(
        this.createIssue(
          'cpu_spike',
          'system',
          system.cpu.global,
          thresholds.system.cpuGlobalWarning,
          thresholds.system.cpuGlobalCritical,
          'cpu_global',
          `CPU global: ${system.cpu.global.toFixed(1)}%`
        )
      );
    }

    // CPU Process
    if (system.cpu.process >= thresholds.system.cpuProcessWarning) {
      issues.push(
        this.createIssue(
          'cpu_spike',
          'system',
          system.cpu.process,
          thresholds.system.cpuProcessWarning,
          thresholds.system.cpuProcessCritical,
          'cpu_process',
          `CPU processus: ${system.cpu.process.toFixed(1)}%`
        )
      );
    }

    // RAM Process (en MB)
    const ramProcessMB = system.ram.process.resident / (1024 * 1024);
    if (ramProcessMB >= thresholds.system.ramProcessWarning) {
      issues.push(
        this.createIssue(
          'ram_overflow',
          'system',
          ramProcessMB,
          thresholds.system.ramProcessWarning,
          thresholds.system.ramProcessCritical,
          'ram_process',
          `RAM processus: ${formatBytes(system.ram.process.resident)}`
        )
      );
    }

    // RAM System (%)
    if (system.ram.system.percent >= thresholds.system.ramSystemWarning) {
      issues.push(
        this.createIssue(
          'ram_overflow',
          'system',
          system.ram.system.percent,
          thresholds.system.ramSystemWarning,
          thresholds.system.ramSystemCritical,
          'ram_system',
          `RAM système: ${system.ram.system.percent.toFixed(1)}%`
        )
      );
    }

    // I/O Read (MB/s)
    const ioReadMBps = system.io.readBytes / (1024 * 1024);
    if (ioReadMBps >= thresholds.system.ioReadWarning) {
      issues.push(
        this.createIssue(
          'io_saturation',
          'system',
          ioReadMBps,
          thresholds.system.ioReadWarning,
          thresholds.system.ioReadWarning * 2,
          'io_read',
          `Lecture I/O: ${formatBytes(system.io.readBytes)}/s`
        )
      );
    }

    // I/O Write (MB/s)
    const ioWriteMBps = system.io.writeBytes / (1024 * 1024);
    if (ioWriteMBps >= thresholds.system.ioWriteWarning) {
      issues.push(
        this.createIssue(
          'io_saturation',
          'system',
          ioWriteMBps,
          thresholds.system.ioWriteWarning,
          thresholds.system.ioWriteWarning * 2,
          'io_write',
          `Écriture I/O: ${formatBytes(system.io.writeBytes)}/s`
        )
      );
    }

    return issues;
  }

  /**
   * Analyse les métriques frontend
   */
  private analyzeFrontendMetrics(snapshot: MetricsSnapshot): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const { frontend } = snapshot;
    const { thresholds } = this.config;

    // FPS (warning when BELOW threshold)
    if (frontend.fps.current <= thresholds.frontend.fpsWarning) {
      const severity = this.calculateFPSSeverity(
        frontend.fps.current,
        thresholds.frontend.fpsWarning,
        thresholds.frontend.fpsCritical
      );
      issues.push({
        id: generateIssueId('fps_drop'),
        type: 'fps_drop',
        severity,
        module: 'frontend',
        title: 'Chute de FPS détectée',
        description: `FPS actuel: ${frontend.fps.current.toFixed(1)} (min: ${thresholds.frontend.fpsCritical})`,
        detectedAt: snapshot.timestamp,
        metrics: [],
        threshold: {
          metric: 'fps_webview',
          threshold: thresholds.frontend.fpsWarning,
          actual: frontend.fps.current,
          exceeded: thresholds.frontend.fpsWarning - frontend.fps.current,
          percentage:
            ((thresholds.frontend.fpsWarning - frontend.fps.current) /
              thresholds.frontend.fpsWarning) *
            100,
        },
        recommendations: RECOMMENDATION_TEMPLATES.fps_drop.suggestions,
        autoFixable: false,
      });
    }

    // Render time
    if (frontend.render.averageTime >= thresholds.frontend.renderTimeWarning) {
      issues.push(
        this.createIssue(
          'render_loop',
          'frontend',
          frontend.render.averageTime,
          thresholds.frontend.renderTimeWarning,
          thresholds.frontend.renderTimeCritical,
          'render_time',
          `Temps de rendu: ${formatDuration(frontend.render.averageTime)}`
        )
      );
    }

    // Rerenders excessifs
    if (frontend.render.rerenderCount >= thresholds.frontend.rerenderWarning) {
      issues.push(
        this.createIssue(
          'excessive_rerenders',
          'frontend',
          frontend.render.rerenderCount,
          thresholds.frontend.rerenderWarning,
          thresholds.frontend.rerenderCritical,
          'rerender_count',
          `Re-renders: ${frontend.render.rerenderCount}/s`
        )
      );
    }

    // Latence Tauri invoke
    if (frontend.tauri.invokeLatency >= thresholds.frontend.invokeLatencyWarning) {
      issues.push(
        this.createIssue(
          'slow_invoke',
          'frontend',
          frontend.tauri.invokeLatency,
          thresholds.frontend.invokeLatencyWarning,
          thresholds.frontend.invokeLatencyCritical,
          'invoke_latency',
          `Latence Tauri: ${formatDuration(frontend.tauri.invokeLatency)}`
        )
      );
    }

    return issues;
  }

  /**
   * Analyse les métriques IA
   */
  private analyzeIAMetrics(snapshot: MetricsSnapshot): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const { ia } = snapshot;
    const { thresholds } = this.config;

    // Latence Ollama
    if (ia.ollama.available && ia.ollama.latency >= thresholds.ia.latencyWarning) {
      issues.push(
        this.createIssue(
          'ia_timeout',
          'ia',
          ia.ollama.latency,
          thresholds.ia.latencyWarning,
          thresholds.ia.latencyCritical,
          'ia_latency_ollama',
          `Latence Ollama: ${formatDuration(ia.ollama.latency)}`
        )
      );
    }

    // Latence Gemini
    if (ia.gemini.available && ia.gemini.latency >= thresholds.ia.latencyWarning) {
      issues.push(
        this.createIssue(
          'ia_timeout',
          'ia',
          ia.gemini.latency,
          thresholds.ia.latencyWarning,
          thresholds.ia.latencyCritical,
          'ia_latency_gemini',
          `Latence Gemini: ${formatDuration(ia.gemini.latency)}`
        )
      );
    }

    // Taux d'erreur Ollama
    if (ia.ollama.requestCount > 0) {
      const ollamaErrorRate = (ia.ollama.errorCount / ia.ollama.requestCount) * 100;
      if (ollamaErrorRate >= thresholds.ia.errorRateWarning) {
        issues.push(
          this.createIssue(
            'ia_error_spike',
            'ia',
            ollamaErrorRate,
            thresholds.ia.errorRateWarning,
            thresholds.ia.errorRateCritical,
            'ia_error_rate',
            `Taux d'erreur Ollama: ${ollamaErrorRate.toFixed(1)}%`
          )
        );
      }
    }

    // Queue Ollama
    if (ia.ollama.queueSize >= thresholds.ia.queueSizeWarning) {
      issues.push(
        this.createIssue(
          'ia_queue_overflow',
          'ia',
          ia.ollama.queueSize,
          thresholds.ia.queueSizeWarning,
          thresholds.ia.queueSizeCritical,
          'ia_queue_size',
          `File Ollama: ${ia.ollama.queueSize} requêtes en attente`
        )
      );
    }

    return issues;
  }

  /**
   * Analyse les métriques par module
   */
  private analyzeModuleMetrics(snapshot: MetricsSnapshot): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    const { modules } = snapshot;

    for (const moduleId of TITANE_MODULES) {
      const moduleState = modules[moduleId];
      if (!moduleState) continue;

      // Module non healthy
      if (!moduleState.healthy) {
        issues.push({
          id: generateIssueId('module_unresponsive'),
          type: 'module_unresponsive',
          severity: 'major',
          module: moduleId,
          title: `Module ${moduleId} non réactif`,
          description: `Le module ${moduleId} ne répond pas correctement`,
          detectedAt: snapshot.timestamp,
          metrics: [],
          threshold: {
            metric: 'cpu_global',
            threshold: 0,
            actual: 1,
            exceeded: 1,
            percentage: 100,
          },
          recommendations: RECOMMENDATION_TEMPLATES.module_unresponsive.suggestions,
          autoFixable: true,
        });
      }

      // Taux d'erreur du module
      if (moduleState.errorRate >= 10) {
        const severity = moduleState.errorRate >= 30 ? 'critical' : 'major';
        issues.push({
          id: generateIssueId('performance_degradation'),
          type: 'performance_degradation',
          severity,
          module: moduleId,
          title: `Taux d'erreur élevé: ${moduleId}`,
          description: `Taux d'erreur du module: ${moduleState.errorRate.toFixed(1)}%`,
          detectedAt: snapshot.timestamp,
          metrics: [],
          threshold: {
            metric: 'cpu_global',
            threshold: 10,
            actual: moduleState.errorRate,
            exceeded: moduleState.errorRate - 10,
            percentage: ((moduleState.errorRate - 10) / 10) * 100,
          },
          recommendations: RECOMMENDATION_TEMPLATES.performance_degradation.suggestions,
          autoFixable: false,
        });
      }

      // Temps de réponse élevé
      if (moduleState.responseTime >= 1000) {
        const severity = moduleState.responseTime >= 5000 ? 'critical' : 'warning';
        issues.push({
          id: generateIssueId('performance_degradation'),
          type: 'performance_degradation',
          severity,
          module: moduleId,
          title: `Temps de réponse lent: ${moduleId}`,
          description: `Temps de réponse: ${formatDuration(moduleState.responseTime)}`,
          detectedAt: snapshot.timestamp,
          metrics: [],
          threshold: {
            metric: 'cpu_global',
            threshold: 1000,
            actual: moduleState.responseTime,
            exceeded: moduleState.responseTime - 1000,
            percentage: ((moduleState.responseTime - 1000) / 1000) * 100,
          },
          recommendations: RECOMMENDATION_TEMPLATES.performance_degradation.suggestions,
          autoFixable: false,
        });
      }
    }

    return issues;
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - TENDANCES
  // ══════════════════════════════════════════════════════════════════════════════

  private analyzeTrends(): TrendAnalysis {
    const history = this.state.snapshotHistory;

    if (history.length < this.config.minSamplesForTrend) {
      return {
        cpu: 'unknown',
        ram: 'unknown',
        fps: 'unknown',
        iaLatency: 'unknown',
        overall: 'unknown',
      };
    }

    const cpuValues = history.map(s => s.system.cpu.global);
    const ramValues = history.map(s => s.system.ram.system.percent);
    const fpsValues = history.map(s => s.frontend.fps.current);
    const iaLatencyValues = history.map(s =>
      s.ia.ollama.available ? s.ia.ollama.latency : s.ia.gemini.latency
    );

    const cpuTrend = this.calculateTrend(cpuValues, 'above');
    const ramTrend = this.calculateTrend(ramValues, 'above');
    const fpsTrend = this.calculateTrend(fpsValues, 'below'); // FPS inversé
    const iaLatencyTrend = this.calculateTrend(iaLatencyValues, 'above');

    // Trend global basé sur la majorité
    const trends = [cpuTrend, ramTrend, fpsTrend, iaLatencyTrend];
    const degradingCount = trends.filter(t => t === 'degrading').length;
    const improvingCount = trends.filter(t => t === 'improving').length;

    let overall: TrendDirection = 'stable';
    if (degradingCount >= 2) overall = 'degrading';
    else if (improvingCount >= 2) overall = 'improving';

    return {
      cpu: cpuTrend,
      ram: ramTrend,
      fps: fpsTrend,
      iaLatency: iaLatencyTrend,
      overall,
    };
  }

  private calculateTrend(
    values: number[],
    warningDirection: 'above' | 'below'
  ): TrendDirection {
    if (values.length < 2) return 'unknown';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (avgFirst === 0) return avgSecond > 0 ? 'degrading' : 'stable';

    const changePercent = ((avgSecond - avgFirst) / avgFirst) * 100;
    const threshold = this.config.trendDetectionThreshold;

    if (warningDirection === 'above') {
      // Higher is worse (CPU, RAM, latency)
      if (changePercent > threshold) return 'degrading';
      if (changePercent < -threshold) return 'improving';
    } else {
      // Lower is worse (FPS)
      if (changePercent < -threshold) return 'degrading';
      if (changePercent > threshold) return 'improving';
    }

    return 'stable';
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - CALCULS
  // ══════════════════════════════════════════════════════════════════════════════

  private calculateHealthScore(
    snapshot: MetricsSnapshot,
    issues: PerformanceIssue[]
  ): number {
    let score = 100;

    // Pénalité par type de problème
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'warning':
          score -= 8;
          break;
        case 'info':
          score -= 2;
          break;
      }
    }

    // Bonus si les métriques sont bien en dessous des seuils
    const { system, frontend } = snapshot;
    const { thresholds } = this.config;

    if (system.cpu.global < thresholds.system.cpuGlobalWarning * 0.5) score += 2;
    if (system.ram.system.percent < thresholds.system.ramSystemWarning * 0.5) score += 2;
    if (frontend.fps.current > thresholds.frontend.fpsWarning * 1.5) score += 3;
    if (frontend.tauri.invokeLatency < thresholds.frontend.invokeLatencyWarning * 0.5)
      score += 2;

    return Math.max(0, Math.min(100, score));
  }

  private calculateFPSSeverity(
    fps: number,
    warning: number,
    critical: number
  ): SeverityLevel {
    if (fps <= critical) return 'critical';
    if (fps <= warning * 0.6) return 'major';
    if (fps <= warning * 0.8) return 'warning';
    return 'info';
  }

  private createIssue(
    type: IssueType,
    module: TitaneModule | 'system' | 'frontend' | 'ia',
    value: number,
    warningThreshold: number,
    criticalThreshold: number,
    metricType: MetricType,
    description: string
  ): PerformanceIssue {
    const severity = determineSeverity(value, warningThreshold, criticalThreshold);
    const template = RECOMMENDATION_TEMPLATES[type];

    return {
      id: generateIssueId(type),
      type,
      severity,
      module,
      title: template.title,
      description,
      detectedAt: Date.now(),
      metrics: [],
      threshold: {
        metric: metricType,
        threshold: warningThreshold,
        actual: value,
        exceeded: value - warningThreshold,
        percentage: ((value - warningThreshold) / warningThreshold) * 100,
      },
      recommendations: template.suggestions,
      autoFixable: false,
    };
  }

  private sortIssuesBySeverity(issues: PerformanceIssue[]): PerformanceIssue[] {
    const severityOrder: Record<SeverityLevel, number> = {
      critical: 0,
      major: 1,
      warning: 2,
      info: 3,
    };

    return issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MÉTHODES PRIVÉES - ÉVÉNEMENTS
  // ══════════════════════════════════════════════════════════════════════════════

  private emit(eventType: string, data: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: PerformanceEvent = {
        type: eventType as PerformanceEvent['type'],
        timestamp: Date.now(),
        data,
        source: 'analyzer',
      };

      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(
            `[PerformanceAnalyzer] Erreur dans listener pour ${eventType}:`,
            error
          );
        }
      }
    }
  }

  private emitAnalysisEvents(result: AnalysisResult): void {
    this.emit('snapshot_collected', result);

    for (const issue of result.issues) {
      this.emit('issue_detected', {
        issue,
        snapshot: result.snapshot,
      });

      if (issue.severity === 'critical') {
        this.emit('threshold_exceeded', {
          issue,
          healthScore: result.healthScore,
        });
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export { DEFAULT_ANALYZER_CONFIG, TITANE_MODULES };
export type { AnalyzerConfig, AnalyzerState, IssuePattern };
