/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PERFORMANCE ENGINE — Metrics Collector
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @file        metricsCollector.ts
 * @version     vΩ∞Ω+
 * @phase       B.1 — Collecte Multi-Source
 *
 * RESPONSABILITÉS:
 * - Collecte métriques système via Tauri/Rust
 * - Collecte métriques frontend via Performance API
 * - Collecte métriques IA (Ollama, Gemini, Internal)
 * - Collecte métriques par module TITANE∞
 * - Agrégation en snapshots
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import {
  generateSnapshotId,
  createEmptySnapshot,
  DEFAULT_PERFORMANCE_CONFIG,
} from './performanceEngine.config';
import type {
  MetricsSnapshot,
  SystemMetrics,
  FrontendMetrics,
  IAMetrics,
  VoiceMetrics,
  ModuleMetricsMap,
  ModulePerformanceState,
  TitaneModule,
  PerformanceEvent,
  PerformanceEventListener,
} from './performanceEngine.config';

// =============================================================================
// TYPES COLLECTEUR
// =============================================================================

/**
 * Configuration du collecteur
 */
export interface CollectorConfig {
  intervalMs: number;
  systemEnabled: boolean;
  frontendEnabled: boolean;
  iaEnabled: boolean;
  modulesEnabled: boolean;
  historySize: number;
}

/**
 * État du collecteur
 */
export interface CollectorState {
  running: boolean;
  lastCollectionTime: number;
  collectionCount: number;
  errorCount: number;
  averageCollectionDuration: number;
}

/**
 * Statistiques du collecteur
 */
export interface CollectorStats {
  totalSnapshots: number;
  snapshotsPerMinute: number;
  averageDuration: number;
  errorsLast5Min: number;
  systemMetricsEnabled: boolean;
  frontendMetricsEnabled: boolean;
  iaMetricsEnabled: boolean;
}

// =============================================================================
// FPS MONITOR — Mesure via requestAnimationFrame
// =============================================================================

class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private fpsHistory: number[] = [];
  private rafId: number | null = null;
  private running = false;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (): void => {
    if (!this.running) return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.fpsHistory.push(this.fps);

      // Garder les 60 dernières mesures (1 minute)
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = now;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  getMetrics(): {
    current: number;
    average: number;
    min: number;
    max: number;
    drops: number;
  } {
    const history = this.fpsHistory.length > 0 ? this.fpsHistory : [60];
    return {
      current: this.fps,
      average: Math.round(history.reduce((a, b) => a + b, 0) / history.length),
      min: Math.min(...history),
      max: Math.max(...history),
      drops: history.filter(f => f < 30).length,
    };
  }

  reset(): void {
    this.fpsHistory = [];
    this.fps = 60;
    this.frameCount = 0;
  }
}

// =============================================================================
// RENDER TIME TRACKER — Mesure temps de rendu React
// =============================================================================

class RenderTimeTracker {
  private renderTimes: number[] = [];
  private rerenderCount = 0;
  private lastResetTime = Date.now();

  recordRender(duration: number): void {
    this.renderTimes.push(duration);
    this.rerenderCount++;

    // Garder les 100 dernières mesures
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }
  }

  getMetrics(): {
    lastTime: number;
    averageTime: number;
    rerenderCount: number;
    slowRenders: number;
  } {
    const times = this.renderTimes;
    const elapsed = (Date.now() - this.lastResetTime) / 1000;
    const lastTime = times[times.length - 1];

    return {
      lastTime: lastTime ?? 0,
      averageTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      rerenderCount: elapsed > 0 ? Math.round(this.rerenderCount / elapsed) : 0,
      slowRenders: times.filter(t => t > 16).length,
    };
  }

  reset(): void {
    this.renderTimes = [];
    this.rerenderCount = 0;
    this.lastResetTime = Date.now();
  }
}

// =============================================================================
// INVOKE LATENCY TRACKER — Mesure latence Tauri
// =============================================================================

class InvokeLatencyTracker {
  private latencies: number[] = [];
  private invokeCount = 0;
  private errorCount = 0;

  recordInvoke(duration: number, success: boolean): void {
    this.latencies.push(duration);
    this.invokeCount++;
    if (!success) this.errorCount++;

    // Garder les 100 dernières mesures
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
  }

  getMetrics(): {
    invokeLatency: number;
    invokeCount: number;
    invokeErrors: number;
  } {
    return {
      invokeLatency:
        this.latencies.length > 0
          ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
          : 0,
      invokeCount: this.invokeCount,
      invokeErrors: this.errorCount,
    };
  }

  reset(): void {
    this.latencies = [];
    this.invokeCount = 0;
    this.errorCount = 0;
  }
}

// =============================================================================
// IA METRICS TRACKER
// =============================================================================

class IAMetricsTracker {
  private ollamaLatencies: number[] = [];
  private geminiLatencies: number[] = [];
  private ollamaTokens: number[] = [];
  private geminiTokens: number[] = [];
  private ollamaErrors = 0;
  private geminiErrors = 0;
  private ollamaRequests = 0;
  private geminiRequests = 0;
  private queueSize = 0;
  private ollamaAvailable = false;
  private geminiAvailable = false;

  recordOllamaRequest(latency: number, tokens: number, success: boolean): void {
    this.ollamaLatencies.push(latency);
    this.ollamaTokens.push(tokens);
    this.ollamaRequests++;
    if (!success) this.ollamaErrors++;
    this.ollamaAvailable = success;

    if (this.ollamaLatencies.length > 50) this.ollamaLatencies.shift();
    if (this.ollamaTokens.length > 50) this.ollamaTokens.shift();
  }

  recordGeminiRequest(latency: number, tokens: number, success: boolean): void {
    this.geminiLatencies.push(latency);
    this.geminiTokens.push(tokens);
    this.geminiRequests++;
    if (!success) this.geminiErrors++;
    this.geminiAvailable = success;

    if (this.geminiLatencies.length > 50) this.geminiLatencies.shift();
    if (this.geminiTokens.length > 50) this.geminiTokens.shift();
  }

  setQueueSize(size: number): void {
    this.queueSize = size;
  }

  setAvailability(ollama: boolean, gemini: boolean): void {
    this.ollamaAvailable = ollama;
    this.geminiAvailable = gemini;
  }

  getMetrics(): IAMetrics {
    const avgArray = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      ollama: {
        latency: avgArray(this.ollamaLatencies),
        tokensPerSec: avgArray(this.ollamaTokens),
        requestCount: this.ollamaRequests,
        errorCount: this.ollamaErrors,
        queueSize: this.queueSize,
        available: this.ollamaAvailable,
      },
      gemini: {
        latency: avgArray(this.geminiLatencies),
        tokensPerSec: avgArray(this.geminiTokens),
        requestCount: this.geminiRequests,
        errorCount: this.geminiErrors,
        available: this.geminiAvailable,
      },
      internal: {
        promptEngineTime: 0,
        contextCollectionTime: 0,
        totalProcessingTime: 0,
      },
    };
  }

  reset(): void {
    this.ollamaLatencies = [];
    this.geminiLatencies = [];
    this.ollamaTokens = [];
    this.geminiTokens = [];
    this.ollamaErrors = 0;
    this.geminiErrors = 0;
    this.ollamaRequests = 0;
    this.geminiRequests = 0;
  }
}

// =============================================================================
// VOICE METRICS TRACKER
// =============================================================================

class VoiceMetricsTracker {
  private asrLatencies: number[] = [];
  private ttsLatencies: number[] = [];
  private omegaLatencies: number[] = [];
  private asrConfidences: number[] = [];
  private asrErrors = 0;
  private ttsErrors = 0;
  private omegaErrors = 0;
  private asrRequests = 0;
  private ttsRequests = 0;
  private omegaRequests = 0;
  private feedbackDetections = 0;
  private feedbackFalsePositives = 0;
  private vadSuspensions = 0;
  private ttsProvider = 'none';
  private asrAvailable = false;
  private ttsAvailable = false;
  private omegaBreakdowns: Array<{ asrMs: number; iaMs: number; ttsMs: number }> = [];

  recordASRRequest(latency: number, confidence: number, success: boolean): void {
    this.asrLatencies.push(latency);
    this.asrConfidences.push(confidence);
    this.asrRequests++;
    if (!success) this.asrErrors++;
    this.asrAvailable = success;

    if (this.asrLatencies.length > 50) this.asrLatencies.shift();
    if (this.asrConfidences.length > 50) this.asrConfidences.shift();
  }

  recordTTSRequest(latency: number, provider: string, success: boolean): void {
    this.ttsLatencies.push(latency);
    this.ttsRequests++;
    this.ttsProvider = provider;
    if (!success) this.ttsErrors++;
    this.ttsAvailable = success;

    if (this.ttsLatencies.length > 50) this.ttsLatencies.shift();
  }

  recordOmegaRequest(
    totalLatency: number,
    breakdown: { asrMs: number; iaMs: number; ttsMs: number },
    success: boolean
  ): void {
    this.omegaLatencies.push(totalLatency);
    this.omegaBreakdowns.push(breakdown);
    this.omegaRequests++;
    if (!success) this.omegaErrors++;

    if (this.omegaLatencies.length > 50) this.omegaLatencies.shift();
    if (this.omegaBreakdowns.length > 50) this.omegaBreakdowns.shift();
  }

  recordFeedbackDetection(isFalsePositive: boolean): void {
    this.feedbackDetections++;
    if (isFalsePositive) this.feedbackFalsePositives++;
  }

  recordVADSuspension(): void {
    this.vadSuspensions++;
  }

  setAvailability(asr: boolean, tts: boolean): void {
    this.asrAvailable = asr;
    this.ttsAvailable = tts;
  }

  getMetrics(): VoiceMetrics {
    const avgArray = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const avgBreakdown =
      this.omegaBreakdowns.length > 0
        ? {
            asrMs: avgArray(this.omegaBreakdowns.map(b => b.asrMs)),
            iaMs: avgArray(this.omegaBreakdowns.map(b => b.iaMs)),
            ttsMs: avgArray(this.omegaBreakdowns.map(b => b.ttsMs)),
          }
        : { asrMs: 0, iaMs: 0, ttsMs: 0 };

    return {
      asr: {
        latency: avgArray(this.asrLatencies),
        requestCount: this.asrRequests,
        errorCount: this.asrErrors,
        successRate:
          this.asrRequests > 0
            ? (this.asrRequests - this.asrErrors) / this.asrRequests
            : 1.0,
        averageConfidence: avgArray(this.asrConfidences),
        available: this.asrAvailable,
      },
      tts: {
        latency: avgArray(this.ttsLatencies),
        requestCount: this.ttsRequests,
        errorCount: this.ttsErrors,
        successRate:
          this.ttsRequests > 0
            ? (this.ttsRequests - this.ttsErrors) / this.ttsRequests
            : 1.0,
        provider: this.ttsProvider,
        available: this.ttsAvailable,
      },
      omega: {
        latency: avgArray(this.omegaLatencies),
        requestCount: this.omegaRequests,
        errorCount: this.omegaErrors,
        successRate:
          this.omegaRequests > 0
            ? (this.omegaRequests - this.omegaErrors) / this.omegaRequests
            : 1.0,
        breakdown: avgBreakdown,
      },
      feedback: {
        detectionCount: this.feedbackDetections,
        suspensionCount: this.vadSuspensions,
        falsePositiveRate:
          this.feedbackDetections > 0
            ? this.feedbackFalsePositives / this.feedbackDetections
            : 0,
      },
    };
  }

  reset(): void {
    this.asrLatencies = [];
    this.ttsLatencies = [];
    this.omegaLatencies = [];
    this.asrConfidences = [];
    this.asrErrors = 0;
    this.ttsErrors = 0;
    this.omegaErrors = 0;
    this.asrRequests = 0;
    this.ttsRequests = 0;
    this.omegaRequests = 0;
    this.feedbackDetections = 0;
    this.feedbackFalsePositives = 0;
    this.vadSuspensions = 0;
    this.omegaBreakdowns = [];
  }
}

// =============================================================================
// METRICS COLLECTOR — SINGLETON
// =============================================================================

/**
 * Collecteur de métriques de performance
 * Singleton gérant la collecte multi-source
 */
export class MetricsCollector {
  private static instance: MetricsCollector | null = null;

  private config: CollectorConfig;
  private state: CollectorState;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private history: MetricsSnapshot[] = [];
  private listeners: Set<PerformanceEventListener> = new Set();

  // Trackers spécialisés
  private fpsMonitor = new FPSMonitor();
  private renderTracker = new RenderTimeTracker();
  private invokeTracker = new InvokeLatencyTracker();
  private iaTracker = new IAMetricsTracker();
  private voiceTracker = new VoiceMetricsTracker();

  // Module metrics cache
  private moduleMetrics: Map<TitaneModule, ModulePerformanceState> = new Map();

  private constructor(config?: Partial<CollectorConfig>) {
    this.config = {
      ...DEFAULT_PERFORMANCE_CONFIG.collector,
      ...config,
    };

    this.state = {
      running: false,
      lastCollectionTime: 0,
      collectionCount: 0,
      errorCount: 0,
      averageCollectionDuration: 0,
    };

    this.initializeModuleMetrics();
    logger.debug('📊 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(config?: Partial<CollectorConfig>): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector(config);
    }
    return MetricsCollector.instance;
  }

  /**
   * Réinitialise l'instance (pour tests)
   */
  static resetInstance(): void {
    if (MetricsCollector.instance) {
      MetricsCollector.instance.stop();
    }
    MetricsCollector.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Démarre la collecte périodique
   */
  start(): void {
    if (this.state.running) {
      logger.debug('⚠️ Already running');
      return;
    }

    this.state.running = true;
    this.fpsMonitor.start();

    this.intervalId = setInterval(async () => {
      try {
        await this.collect();
      } catch (error) {
        this.state.errorCount++;
        logger.error('❌ Collection error:', error);
      }
    }, this.config.intervalMs);

    this.emit({
      type: 'engine_started',
      timestamp: Date.now(),
      data: { component: 'collector' },
      source: 'collector',
    });

    logger.debug(`[MetricsCollector] ▶️ Started (interval: ${this.config.intervalMs}ms)`);
  }

  /**
   * Arrête la collecte
   */
  stop(): void {
    if (!this.state.running) return;

    this.state.running = false;
    this.fpsMonitor.stop();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.emit({
      type: 'engine_stopped',
      timestamp: Date.now(),
      data: { component: 'collector' },
      source: 'collector',
    });

    logger.debug('⏹️ Stopped');
  }

  /**
   * Configure le collecteur
   */
  configure(config: Partial<CollectorConfig>): void {
    const wasRunning = this.state.running;
    if (wasRunning) this.stop();

    this.config = { ...this.config, ...config };

    if (wasRunning) this.start();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTION PRINCIPALE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Collecte un snapshot complet
   */
  async collect(): Promise<MetricsSnapshot> {
    const startTime = performance.now();

    // Collecter en parallèle
    const [system, frontend, ia, voice, modules] = await Promise.all([
      this.config.systemEnabled ? this.collectSystemMetrics() : null,
      this.config.frontendEnabled ? this.collectFrontendMetrics() : null,
      this.config.iaEnabled ? this.collectIAMetrics() : null,
      this.collectVoiceMetrics(), // Toujours collecté
      this.config.modulesEnabled ? this.collectModuleMetrics() : null,
    ]);

    const duration = performance.now() - startTime;

    // Créer le snapshot
    const snapshot: MetricsSnapshot = {
      id: generateSnapshotId(),
      timestamp: Date.now(),
      duration,
      system: system || createEmptySnapshot().system,
      frontend: frontend || createEmptySnapshot().frontend,
      ia: ia || createEmptySnapshot().ia,
      voice: voice || createEmptySnapshot().voice,
      modules: modules || createEmptySnapshot().modules,
      summary: this.calculateSummary(system, frontend, ia),
    };

    // Ajouter à l'historique
    this.history.push(snapshot);
    if (this.history.length > this.config.historySize) {
      this.history.shift();
    }

    // Mettre à jour l'état
    this.state.lastCollectionTime = Date.now();
    this.state.collectionCount++;
    this.updateAverageDuration(duration);

    // Émettre l'événement
    this.emit({
      type: 'snapshot_collected',
      timestamp: snapshot.timestamp,
      data: snapshot,
      source: 'collector',
    });

    return snapshot;
  }

  /**
   * Force une collecte immédiate
   */
  async collectNow(): Promise<MetricsSnapshot> {
    return this.collect();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE SYSTÈME (via Tauri)
  // ─────────────────────────────────────────────────────────────────────────

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Appeler la commande Tauri
      const rustMetrics = await secureInvoke<{
        cpu_global: number;
        cpu_process: number;
        cpu_cores: number[];
        ram_total: number;
        ram_used: number;
        ram_available: number;
        ram_process_resident: number;
        ram_process_virtual: number;
        io_read_bytes: number;
        io_write_bytes: number;
        io_read_ops: number;
        io_write_ops: number;
        thread_total: number;
        thread_active: number;
        uptime: number;
      }>('get_system_metrics').catch(() => null);

      if (!rustMetrics) {
        return this.getFallbackSystemMetrics();
      }

      const ramPercent =
        rustMetrics.ram_total > 0
          ? (rustMetrics.ram_used / rustMetrics.ram_total) * 100
          : 0;

      const processRamPercent =
        rustMetrics.ram_total > 0
          ? (rustMetrics.ram_process_resident / rustMetrics.ram_total) * 100
          : 0;

      return {
        cpu: {
          global: rustMetrics.cpu_global,
          process: rustMetrics.cpu_process,
          cores: rustMetrics.cpu_cores,
        },
        ram: {
          system: {
            total: rustMetrics.ram_total,
            used: rustMetrics.ram_used,
            available: rustMetrics.ram_available,
            percent: ramPercent,
          },
          process: {
            resident: rustMetrics.ram_process_resident,
            virtual: rustMetrics.ram_process_virtual,
            percent: processRamPercent,
          },
        },
        io: {
          readBytes: rustMetrics.io_read_bytes,
          writeBytes: rustMetrics.io_write_bytes,
          readOps: rustMetrics.io_read_ops,
          writeOps: rustMetrics.io_write_ops,
        },
        threads: {
          total: rustMetrics.thread_total,
          active: rustMetrics.thread_active,
          tauri: 4, // Estimation par défaut
        },
        uptime: rustMetrics.uptime,
      };
    } catch (error) {
      logger.warn('System metrics fallback:', error);
      return this.getFallbackSystemMetrics();
    }
  }

  private getFallbackSystemMetrics(): SystemMetrics {
    // Métriques de fallback basées sur Performance API si disponible
    const memory = (
      performance as unknown as {
        memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
      }
    ).memory;

    return {
      cpu: { global: 0, process: 0, cores: [] },
      ram: {
        system: { total: 0, used: 0, available: 0, percent: 0 },
        process: {
          resident: memory?.usedJSHeapSize || 0,
          virtual: memory?.totalJSHeapSize || 0,
          percent: 0,
        },
      },
      io: { readBytes: 0, writeBytes: 0, readOps: 0, writeOps: 0 },
      threads: { total: 0, active: 0, tauri: 0 },
      uptime: performance.now() / 1000,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE FRONTEND
  // ─────────────────────────────────────────────────────────────────────────

  private async collectFrontendMetrics(): Promise<FrontendMetrics> {
    const fpsMetrics = this.fpsMonitor.getMetrics();
    const renderMetrics = this.renderTracker.getMetrics();
    const invokeMetrics = this.invokeTracker.getMetrics();

    // Bundle size estimation
    const scripts = document.querySelectorAll('script[src]');
    const estimatedBundleSize = scripts.length * 50; // Estimation grossière

    return {
      fps: fpsMetrics,
      render: renderMetrics,
      tauri: invokeMetrics,
      bundle: {
        totalSize: estimatedBundleSize,
        modulesLoaded: scripts.length,
        lazyLoaded: 0,
      },
      vite: {
        watchersActive: 0,
        hmrUpdates: 0,
        buildTime: 0,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE IA
  // ─────────────────────────────────────────────────────────────────────────

  private async collectIAMetrics(): Promise<IAMetrics> {
    return this.iaTracker.getMetrics();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE VOICE (ASR/TTS/OMEGA)
  // ─────────────────────────────────────────────────────────────────────────

  private async collectVoiceMetrics(): Promise<VoiceMetrics> {
    return this.voiceTracker.getMetrics();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE MODULES
  // ─────────────────────────────────────────────────────────────────────────

  private async collectModuleMetrics(): Promise<ModuleMetricsMap> {
    const result: Partial<ModuleMetricsMap> = {};

    for (const [module, state] of this.moduleMetrics) {
      result[module] = { ...state };
    }

    return result as ModuleMetricsMap;
  }

  private initializeModuleMetrics(): void {
    const modules: TitaneModule[] = [
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

    const now = Date.now();
    modules.forEach(module => {
      this.moduleMetrics.set(module, {
        module,
        healthy: true,
        cpuUsage: 0,
        memoryUsage: 0,
        responseTime: 0,
        errorRate: 0,
        lastActivity: now,
        operationCount: 0,
        pendingOperations: 0,
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALCUL SUMMARY
  // ─────────────────────────────────────────────────────────────────────────

  private calculateSummary(
    system: SystemMetrics | null,
    frontend: FrontendMetrics | null,
    ia: IAMetrics | null
  ): MetricsSnapshot['summary'] {
    let score = 100;
    let criticalIssues = 0;
    let warnings = 0;

    // Pénalités système
    if (system) {
      if (system.cpu.process > 80) {
        score -= 20;
        criticalIssues++;
      } else if (system.cpu.process > 50) {
        score -= 10;
        warnings++;
      }

      if (system.ram.process.percent > 80) {
        score -= 15;
        criticalIssues++;
      } else if (system.ram.process.percent > 60) {
        score -= 5;
        warnings++;
      }
    }

    // Pénalités frontend
    if (frontend) {
      if (frontend.fps.current < 30) {
        score -= 20;
        criticalIssues++;
      } else if (frontend.fps.current < 45) {
        score -= 10;
        warnings++;
      }

      if (frontend.render.averageTime > 50) {
        score -= 10;
        warnings++;
      }

      if (frontend.tauri.invokeLatency > 500) {
        score -= 10;
        warnings++;
      }
    }

    // Pénalités IA
    if (ia) {
      if (ia.ollama.queueSize > 10) {
        score -= 10;
        warnings++;
      }

      const ollamaErrorRate =
        ia.ollama.requestCount > 0
          ? (ia.ollama.errorCount / ia.ollama.requestCount) * 100
          : 0;

      if (ollamaErrorRate > 20) {
        score -= 15;
        criticalIssues++;
      }
    }

    score = Math.max(0, Math.min(100, score));

    let grade: MetricsSnapshot['summary']['grade'];
    if (score >= 95) grade = 'S';
    else if (score >= 85) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 30) grade = 'D';
    else grade = 'F';

    return {
      healthScore: score,
      grade,
      criticalIssues,
      warnings,
      optimizationsApplied: 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API EXTERNE — Enregistrement de métriques
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Enregistre un temps de rendu React
   */
  recordRenderTime(duration: number): void {
    this.renderTracker.recordRender(duration);
  }

  /**
   * Enregistre une latence d'invoke Tauri
   */
  recordInvokeLatency(duration: number, success: boolean): void {
    this.invokeTracker.recordInvoke(duration, success);
  }

  /**
   * Enregistre une requête Ollama
   */
  recordOllamaRequest(latency: number, tokens: number, success: boolean): void {
    this.iaTracker.recordOllamaRequest(latency, tokens, success);
  }

  /**
   * Enregistre une requête Gemini
   */
  recordGeminiRequest(latency: number, tokens: number, success: boolean): void {
    this.iaTracker.recordGeminiRequest(latency, tokens, success);
  }

  /**
   * Enregistre une requête ASR (reconnaissance vocale)
   */
  recordASRRequest(latency: number, confidence: number, success: boolean): void {
    this.voiceTracker.recordASRRequest(latency, confidence, success);
  }

  /**
   * Enregistre une requête TTS (synthèse vocale)
   */
  recordTTSRequest(latency: number, provider: string, success: boolean): void {
    this.voiceTracker.recordTTSRequest(latency, provider, success);
  }

  /**
   * Enregistre une requête OMEGA complète (ASR+IA+TTS)
   */
  recordOmegaRequest(
    totalLatency: number,
    breakdown: { asrMs: number; iaMs: number; ttsMs: number },
    success: boolean
  ): void {
    this.voiceTracker.recordOmegaRequest(totalLatency, breakdown, success);
  }

  /**
   * Enregistre une détection de feedback audio (Layer 3)
   */
  recordFeedbackDetection(isFalsePositive: boolean = false): void {
    this.voiceTracker.recordFeedbackDetection(isFalsePositive);
  }

  /**
   * Enregistre une suspension VAD (Layer 2)
   */
  recordVADSuspension(): void {
    this.voiceTracker.recordVADSuspension();
  }

  /**
   * Définit la disponibilité des services vocaux
   */
  setVoiceAvailability(asr: boolean, tts: boolean): void {
    this.voiceTracker.setAvailability(asr, tts);
  }

  /**
   * Met à jour les métriques d'un module
   */
  updateModuleMetrics(
    module: TitaneModule,
    update: Partial<ModulePerformanceState>
  ): void {
    const current = this.moduleMetrics.get(module);
    if (current) {
      this.moduleMetrics.set(module, { ...current, ...update, module });
    }
  }

  /**
   * Définit la taille de la queue IA
   */
  setIAQueueSize(size: number): void {
    this.iaTracker.setQueueSize(size);
  }

  /**
   * Définit la disponibilité des services IA
   */
  setIAAvailability(ollama: boolean, gemini: boolean): void {
    this.iaTracker.setAvailability(ollama, gemini);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne le dernier snapshot
   */
  getLastSnapshot(): MetricsSnapshot | null {
    const lastSnapshot = this.history[this.history.length - 1];
    return lastSnapshot ?? null;
  }

  /**
   * Retourne l'historique complet
   */
  getHistory(): MetricsSnapshot[] {
    return [...this.history];
  }

  /**
   * Retourne les N derniers snapshots
   */
  getRecentSnapshots(count: number): MetricsSnapshot[] {
    return this.history.slice(-count);
  }

  /**
   * Retourne l'état du collecteur
   */
  getState(): CollectorState {
    return { ...this.state };
  }

  /**
   * Retourne les statistiques
   */
  getStats(): CollectorStats {
    const firstSnapshot = this.history[0];
    const elapsed = Date.now() - (firstSnapshot?.timestamp ?? Date.now());
    const minutes = elapsed / 60000;

    return {
      totalSnapshots: this.state.collectionCount,
      snapshotsPerMinute: minutes > 0 ? this.state.collectionCount / minutes : 0,
      averageDuration: this.state.averageCollectionDuration,
      errorsLast5Min: this.state.errorCount,
      systemMetricsEnabled: this.config.systemEnabled,
      frontendMetricsEnabled: this.config.frontendEnabled,
      iaMetricsEnabled: this.config.iaEnabled,
    };
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): CollectorConfig {
    return { ...this.config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Ajoute un listener d'événements
   */
  on(listener: PerformanceEventListener): void {
    this.listeners.add(listener);
  }

  /**
   * Retire un listener d'événements
   */
  off(listener: PerformanceEventListener): void {
    this.listeners.delete(listener);
  }

  private emit(event: PerformanceEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Listener error:', error);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private updateAverageDuration(duration: number): void {
    const count = this.state.collectionCount;
    const current = this.state.averageCollectionDuration;
    this.state.averageCollectionDuration = (current * (count - 1) + duration) / count;
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this.state.collectionCount = 0;
    this.state.errorCount = 0;
    this.state.averageCollectionDuration = 0;
    this.history = [];
    this.fpsMonitor.reset();
    this.renderTracker.reset();
    this.invokeTracker.reset();
    this.iaTracker.reset();
    this.voiceTracker.reset();
  }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const metricsCollector = MetricsCollector.getInstance();
