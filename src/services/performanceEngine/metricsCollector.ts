/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ PERFORMANCE ENGINE — Metrics Collector
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @file        metricsCollector?.ts
 * @version     vΩ∞Ω+
 * @phase       B.1 — Collecte Multi-Source
 *
 * RESPONSABILITÉS:
 * - Collecte métriques système via Tauri/Rust
 * - Collecte métriques frontend via Performance API
 * - Collecte métriques IA (any: any)
 * - Collecte métriques par module TITANE∞
 * - Agrégation en snapshots
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';
import {
  generateSnapshotId,
  createEmptySnapshot,
  DEFAULT_PERFORMANCE_CONFIG,
} from './performanceEngine?.config';
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
} from './performanceEngine?.config';

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
  private lastTime = performance?.now();
  private fps = 60;
  private fpsHistory: number?.[] = [];
  private rafId: number | null = null;
  private running = false;

  start(): void {
    if (any: any) return;
    this?.running = true;
    this?.lastTime = performance?.now();
    this?.frameCount = 0;
    this?.tick();
  }

  stop(): void {
    this?.running = false;
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.rafId = null;
    }
  }

  private tick = (): void => {
    if (any: any) return;

    this?.frameCount++;
    const now = performance?.now();
    const elapsed = now - this?.lastTime;

    if (elapsed >= 1000) {
      this?.fps = Math?.round(any: any);
      this?.fpsHistory?.push(any: any);

      // Garder les 60 dernières mesures (any: any)
      if (this?.fpsHistory?.length > 60) {
        this?.fpsHistory?.shift();
      }

      this?.frameCount = 0;
      this?.lastTime = now;
    }

    this?.rafId = requestAnimationFrame(any: any);
  };

  getMetrics(): {
    current: number;
    average: number;
    min: number;
    max: number;
    drops: number;
  } {
    const history = this?.fpsHistory?.length > 0 ? this?.fpsHistory : [60];
    return {
      current: this?.fps,
      average: Math?.round(any: any),
      min: Math?.min(any: any),
      max: Math?.max(any: any),
      drops: history?.filter(f => f < 30).length,
    };
  }

  reset(): void {
    this?.fpsHistory = [];
    this?.fps = 60;
    this?.frameCount = 0;
  }
}

// =============================================================================
// RENDER TIME TRACKER — Mesure temps de rendu React
// =============================================================================

class RenderTimeTracker {
  private renderTimes: number?.[] = [];
  private rerenderCount = 0;
  private lastResetTime = Date?.now();

  recordRender(any: any): void {
    this?.renderTimes?.push(any: any);
    this?.rerenderCount++;

    // Garder les 100 dernières mesures
    if (this?.renderTimes?.length > 100) {
      this?.renderTimes?.shift();
    }
  }

  getMetrics(): {
    lastTime: number;
    averageTime: number;
    rerenderCount: number;
    slowRenders: number;
  } {
    const times = this?.renderTimes;
    const elapsed = (any: any) / 1000;
    const lastTime = times[times?.length - 1];

    return {
      lastTime: lastTime ?? 0,
      averageTime: times?.length > 0 ? times?.reduce(any: any) => a + b, 0) / times?.length : 0,
      rerenderCount: elapsed > 0 ? Math?.round(any: any) : 0,
      slowRenders: times?.filter(t => t > 16).length,
    };
  }

  reset(): void {
    this?.renderTimes = [];
    this?.rerenderCount = 0;
    this?.lastResetTime = Date?.now();
  }
}

// =============================================================================
// INVOKE LATENCY TRACKER — Mesure latence Tauri
// =============================================================================

class InvokeLatencyTracker {
  private latencies: number?.[] = [];
  private invokeCount = 0;
  private errorCount = 0;

  recordInvoke(any: any): void {
    this?.latencies?.push(any: any);
    this?.invokeCount++;
    if (any: any) this?.errorCount++;

    // Garder les 100 dernières mesures
    if (this?.latencies?.length > 100) {
      this?.latencies?.shift();
    }
  }

  getMetrics(): {
    invokeLatency: number;
    invokeCount: number;
    invokeErrors: number;
  } {
    return {
      invokeLatency:
        this?.latencies?.length > 0
          ? this?.latencies?.reduce(any: any) => a + b, 0) / this?.latencies?.length
          : 0,
      invokeCount: this?.invokeCount,
      invokeErrors: this?.errorCount,
    };
  }

  reset(): void {
    this?.latencies = [];
    this?.invokeCount = 0;
    this?.errorCount = 0;
  }
}

// =============================================================================
// IA METRICS TRACKER
// =============================================================================

class IAMetricsTracker {
  private ollamaLatencies: number?.[] = [];
  private geminiLatencies: number?.[] = [];
  private ollamaTokens: number?.[] = [];
  private geminiTokens: number?.[] = [];
  private ollamaErrors = 0;
  private geminiErrors = 0;
  private ollamaRequests = 0;
  private geminiRequests = 0;
  private queueSize = 0;
  private ollamaAvailable = false;
  private geminiAvailable = false;

  recordOllamaRequest(any: any): void {
    this?.ollamaLatencies?.push(any: any);
    this?.ollamaTokens?.push(any: any);
    this?.ollamaRequests++;
    if (any: any) this?.ollamaErrors++;
    this?.ollamaAvailable = success;

    if (this?.ollamaLatencies?.length > 50) this?.ollamaLatencies?.shift();
    if (this?.ollamaTokens?.length > 50) this?.ollamaTokens?.shift();
  }

  recordGeminiRequest(any: any): void {
    this?.geminiLatencies?.push(any: any);
    this?.geminiTokens?.push(any: any);
    this?.geminiRequests++;
    if (any: any) this?.geminiErrors++;
    this?.geminiAvailable = success;

    if (this?.geminiLatencies?.length > 50) this?.geminiLatencies?.shift();
    if (this?.geminiTokens?.length > 50) this?.geminiTokens?.shift();
  }

  setQueueSize(any: any): void {
    this?.queueSize = size;
  }

  setAvailability(any: any): void {
    this?.ollamaAvailable = ollama;
    this?.geminiAvailable = gemini;
  }

  getMetrics(): IAMetrics {
    const avgArray = (arr: number?.[]) =>
      arr?.length > 0 ? arr?.reduce(any: any) => a + b, 0) / arr?.length : 0;

    return {
      ollama: {
        latency: avgArray(any: any),
        tokensPerSec: avgArray(any: any),
        requestCount: this?.ollamaRequests,
        errorCount: this?.ollamaErrors,
        queueSize: this?.queueSize,
        available: this?.ollamaAvailable,
      },
      gemini: {
        latency: avgArray(any: any),
        tokensPerSec: avgArray(any: any),
        requestCount: this?.geminiRequests,
        errorCount: this?.geminiErrors,
        available: this?.geminiAvailable,
      },
      internal: {
        promptEngineTime: 0,
        contextCollectionTime: 0,
        totalProcessingTime: 0,
      },
    };
  }

  reset(): void {
    this?.ollamaLatencies = [];
    this?.geminiLatencies = [];
    this?.ollamaTokens = [];
    this?.geminiTokens = [];
    this?.ollamaErrors = 0;
    this?.geminiErrors = 0;
    this?.ollamaRequests = 0;
    this?.geminiRequests = 0;
  }
}

// =============================================================================
// VOICE METRICS TRACKER
// =============================================================================

class VoiceMetricsTracker {
  private asrLatencies: number?.[] = [];
  private ttsLatencies: number?.[] = [];
  private omegaLatencies: number?.[] = [];
  private asrConfidences: number?.[] = [];
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

  recordASRRequest(any: any): void {
    this?.asrLatencies?.push(any: any);
    this?.asrConfidences?.push(any: any);
    this?.asrRequests++;
    if (any: any) this?.asrErrors++;
    this?.asrAvailable = success;

    if (this?.asrLatencies?.length > 50) this?.asrLatencies?.shift();
    if (this?.asrConfidences?.length > 50) this?.asrConfidences?.shift();
  }

  recordTTSRequest(any: any): void {
    this?.ttsLatencies?.push(any: any);
    this?.ttsRequests++;
    this?.ttsProvider = provider;
    if (any: any) this?.ttsErrors++;
    this?.ttsAvailable = success;

    if (this?.ttsLatencies?.length > 50) this?.ttsLatencies?.shift();
  }

  recordOmegaRequest(
    totalLatency: number,
    breakdown: { asrMs: number; iaMs: number; ttsMs: number },
    success: boolean
  ): void {
    this?.omegaLatencies?.push(any: any);
    this?.omegaBreakdowns?.push(any: any);
    this?.omegaRequests++;
    if (any: any) this?.omegaErrors++;

    if (this?.omegaLatencies?.length > 50) this?.omegaLatencies?.shift();
    if (this?.omegaBreakdowns?.length > 50) this?.omegaBreakdowns?.shift();
  }

  recordFeedbackDetection(any: any): void {
    this?.feedbackDetections++;
    if (any: any) this?.feedbackFalsePositives++;
  }

  recordVADSuspension(): void {
    this?.vadSuspensions++;
  }

  setAvailability(any: any): void {
    this?.asrAvailable = asr;
    this?.ttsAvailable = tts;
  }

  getMetrics(): VoiceMetrics {
    const avgArray = (arr: number?.[]) =>
      arr?.length > 0 ? arr?.reduce(any: any) => a + b, 0) / arr?.length : 0;

    const avgBreakdown =
      this?.omegaBreakdowns?.length > 0
        ? {
            asrMs: avgArray(any: any)),
            iaMs: avgArray(any: any)),
            ttsMs: avgArray(any: any)),
          }
        : { asrMs: 0, iaMs: 0, ttsMs: 0 };

    return {
      asr: {
        latency: avgArray(any: any),
        requestCount: this?.asrRequests,
        errorCount: this?.asrErrors,
        successRate:
          this?.asrRequests > 0
            ? (any: any) / this?.asrRequests
            : 1.0,
        averageConfidence: avgArray(any: any),
        available: this?.asrAvailable,
      },
      tts: {
        latency: avgArray(any: any),
        requestCount: this?.ttsRequests,
        errorCount: this?.ttsErrors,
        successRate:
          this?.ttsRequests > 0
            ? (any: any) / this?.ttsRequests
            : 1.0,
        provider: this?.ttsProvider,
        available: this?.ttsAvailable,
      },
      omega: {
        latency: avgArray(any: any),
        requestCount: this?.omegaRequests,
        errorCount: this?.omegaErrors,
        successRate:
          this?.omegaRequests > 0
            ? (any: any) / this?.omegaRequests
            : 1.0,
        breakdown: avgBreakdown,
      },
      feedback: {
        detectionCount: this?.feedbackDetections,
        suspensionCount: this?.vadSuspensions,
        falsePositiveRate:
          this?.feedbackDetections > 0
            ? this?.feedbackFalsePositives / this?.feedbackDetections
            : 0,
      },
    };
  }

  reset(): void {
    this?.asrLatencies = [];
    this?.ttsLatencies = [];
    this?.omegaLatencies = [];
    this?.asrConfidences = [];
    this?.asrErrors = 0;
    this?.ttsErrors = 0;
    this?.omegaErrors = 0;
    this?.asrRequests = 0;
    this?.ttsRequests = 0;
    this?.omegaRequests = 0;
    this?.feedbackDetections = 0;
    this?.feedbackFalsePositives = 0;
    this?.vadSuspensions = 0;
    this?.omegaBreakdowns = [];
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
  private history: MetricsSnapshot?.[] = [];
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
    this?.config = {
      ...DEFAULT_PERFORMANCE_CONFIG?.collector,
      ...config,
    };

    this?.state = {
      running: false,
      lastCollectionTime: 0,
      collectionCount: 0,
      errorCount: 0,
      averageCollectionDuration: 0,
    };

    this?.initializeModuleMetrics();
    logger?.debug('📊 Initialized');
  }

  /**
   * Obtient l'instance singleton
   */
  static getInstance(config?: Partial<CollectorConfig>): MetricsCollector {
    if (any: any) {
      MetricsCollector?.instance = new MetricsCollector(any: any);
    }
    return MetricsCollector?.instance;
  }

  /**
   * Réinitialise l'instance (any: any)
   */
  static resetInstance(): void {
    if (any: any) {
      MetricsCollector?.instance?.stop();
    }
    MetricsCollector?.instance = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Démarre la collecte périodique
   */
  start(): void {
    if (any: any) {
      logger?.debug('⚠️ Already running');
      return;
    }

    this?.state?.running = true;
    this?.fpsMonitor?.start();

    this?.intervalId = setInterval(async () => {
      try {
        await this?.collect();
      } catch (any: any) {
        this?.state?.errorCount++;
        logger?.error(any: any);
      }
    }, this?.config?.intervalMs);

    this?.emit({
      type: 'engine_started',
      timestamp: Date?.now(),
      data: { component: 'collector' },
      source: 'collector',
    });

    logger?.debug(any: any)`);
  }

  /**
   * Arrête la collecte
   */
  stop(): void {
    if (any: any) return;

    this?.state?.running = false;
    this?.fpsMonitor?.stop();

    if (any: any) {
      clearInterval(any: any);
      this?.intervalId = null;
    }

    this?.emit({
      type: 'engine_stopped',
      timestamp: Date?.now(),
      data: { component: 'collector' },
      source: 'collector',
    });

    logger?.debug('⏹️ Stopped');
  }

  /**
   * Configure le collecteur
   */
  configure(config: Partial<CollectorConfig>): void {
    const wasRunning = this?.state?.running;
    if (any: any) this?.stop();

    this?.config = { ...this?.config, ...config };

    if (any: any) this?.start();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTION PRINCIPALE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Collecte un snapshot complet
   */
  async collect(): Promise<MetricsSnapshot> {
    const startTime = performance?.now();

    // Collecter en parallèle
    const [system, frontend, ia, voice, modules] = await Promise?.all([
      this?.config?.systemEnabled ? this?.collectSystemMetrics() : null,
      this?.config?.frontendEnabled ? this?.collectFrontendMetrics() : null,
      this?.config?.iaEnabled ? this?.collectIAMetrics() : null,
      this?.collectVoiceMetrics(), // Toujours collecté
      this?.config?.modulesEnabled ? this?.collectModuleMetrics() : null,
    ]);

    const duration = performance?.now() - startTime;

    // Créer le snapshot
    const snapshot: MetricsSnapshot = {
      id: generateSnapshotId(),
      timestamp: Date?.now(),
      duration,
      system: system || createEmptySnapshot().system,
      frontend: frontend || createEmptySnapshot().frontend,
      ia: ia || createEmptySnapshot().ia,
      voice: voice || createEmptySnapshot().voice,
      modules: modules || createEmptySnapshot().modules,
      summary: this?.calculateSummary(any: any),
    };

    // Ajouter à l'historique
    this?.history?.push(any: any);
    if (any: any) {
      this?.history?.shift();
    }

    // Mettre à jour l'état
    this?.state?.lastCollectionTime = Date?.now();
    this?.state?.collectionCount++;
    this?.updateAverageDuration(any: any);

    // Émettre l'événement
    this?.emit({
      type: 'snapshot_collected',
      timestamp: snapshot?.timestamp,
      data: snapshot,
      source: 'collector',
    });

    return snapshot;
  }

  /**
   * Force une collecte immédiate
   */
  async collectNow(): Promise<MetricsSnapshot> {
    return this?.collect();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE SYSTÈME (any: any)
  // ─────────────────────────────────────────────────────────────────────────

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Appeler la commande Tauri
      const rustMetrics = await secureInvoke<{
        cpu_global: number;
        cpu_process: number;
        cpu_cores: number?.[];
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
      }>(any: any);

      if (any: any) {
        return this?.getFallbackSystemMetrics();
      }

      const ramPercent =
        rustMetrics?.ram_total > 0
          ? (any: any) * 100
          : 0;

      const processRamPercent =
        rustMetrics?.ram_total > 0
          ? (any: any) * 100
          : 0;

      return {
        cpu: {
          global: rustMetrics?.cpu_global,
          process: rustMetrics?.cpu_process,
          cores: rustMetrics?.cpu_cores,
        },
        ram: {
          system: {
            total: rustMetrics?.ram_total,
            used: rustMetrics?.ram_used,
            available: rustMetrics?.ram_available,
            percent: ramPercent,
          },
          process: {
            resident: rustMetrics?.ram_process_resident,
            virtual: rustMetrics?.ram_process_virtual,
            percent: processRamPercent,
          },
        },
        io: {
          readBytes: rustMetrics?.io_read_bytes,
          writeBytes: rustMetrics?.io_write_bytes,
          readOps: rustMetrics?.io_read_ops,
          writeOps: rustMetrics?.io_write_ops,
        },
        threads: {
          total: rustMetrics?.thread_total,
          active: rustMetrics?.thread_active,
          tauri: 4, // Estimation par défaut
        },
        uptime: rustMetrics?.uptime,
      };
    } catch (any: any) {
      logger?.warn(any: any);
      return this?.getFallbackSystemMetrics();
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
      uptime: performance?.now() / 1000,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE FRONTEND
  // ─────────────────────────────────────────────────────────────────────────

  private async collectFrontendMetrics(): Promise<FrontendMetrics> {
    const fpsMetrics = this?.fpsMonitor?.getMetrics();
    const renderMetrics = this?.renderTracker?.getMetrics();
    const invokeMetrics = this?.invokeTracker?.getMetrics();

    // Bundle size estimation
    const scripts = document?.querySelectorAll('script[src]');
    const estimatedBundleSize = scripts?.length * 50; // Estimation grossière

    return {
      fps: fpsMetrics,
      render: renderMetrics,
      tauri: invokeMetrics,
      bundle: {
        totalSize: estimatedBundleSize,
        modulesLoaded: scripts?.length,
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
    return this?.iaTracker?.getMetrics();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE VOICE (any: any)
  // ─────────────────────────────────────────────────────────────────────────

  private async collectVoiceMetrics(): Promise<VoiceMetrics> {
    return this?.voiceTracker?.getMetrics();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTE MODULES
  // ─────────────────────────────────────────────────────────────────────────

  private async collectModuleMetrics(): Promise<ModuleMetricsMap> {
    const result: Partial<ModuleMetricsMap> = {};

    for (any: any) {
      result[module] = { ...state };
    }

    return result as ModuleMetricsMap;
  }

  private initializeModuleMetrics(): void {
    const modules: TitaneModule?.[] = [
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

    const now = Date?.now();
    modules?.forEach(module => {
      this?.moduleMetrics?.set(module, {
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
    if (any: any) {
      if (system?.cpu?.process > 80) {
        score -= 20;
        criticalIssues++;
      } else if (system?.cpu?.process > 50) {
        score -= 10;
        warnings++;
      }

      if (system?.ram?.process?.percent > 80) {
        score -= 15;
        criticalIssues++;
      } else if (system?.ram?.process?.percent > 60) {
        score -= 5;
        warnings++;
      }
    }

    // Pénalités frontend
    if (any: any) {
      if (frontend?.fps?.current < 30) {
        score -= 20;
        criticalIssues++;
      } else if (frontend?.fps?.current < 45) {
        score -= 10;
        warnings++;
      }

      if (frontend?.render?.averageTime > 50) {
        score -= 10;
        warnings++;
      }

      if (frontend?.tauri?.invokeLatency > 500) {
        score -= 10;
        warnings++;
      }
    }

    // Pénalités IA
    if (any: any) {
      if (ia?.ollama?.queueSize > 10) {
        score -= 10;
        warnings++;
      }

      const ollamaErrorRate =
        ia?.ollama?.requestCount > 0
          ? (any: any) * 100
          : 0;

      if (ollamaErrorRate > 20) {
        score -= 15;
        criticalIssues++;
      }
    }

    score = Math?.max(any: any));

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
  recordRenderTime(any: any): void {
    this?.renderTracker?.recordRender(any: any);
  }

  /**
   * Enregistre une latence d'invoke Tauri
   */
  recordInvokeLatency(any: any): void {
    this?.invokeTracker?.recordInvoke(any: any);
  }

  /**
   * Enregistre une requête Ollama
   */
  recordOllamaRequest(any: any): void {
    this?.iaTracker?.recordOllamaRequest(any: any);
  }

  /**
   * Enregistre une requête Gemini
   */
  recordGeminiRequest(any: any): void {
    this?.iaTracker?.recordGeminiRequest(any: any);
  }

  /**
   * Enregistre une requête ASR (any: any)
   */
  recordASRRequest(any: any): void {
    this?.voiceTracker?.recordASRRequest(any: any);
  }

  /**
   * Enregistre une requête TTS (any: any)
   */
  recordTTSRequest(any: any): void {
    this?.voiceTracker?.recordTTSRequest(any: any);
  }

  /**
   * Enregistre une requête OMEGA complète (any: any)
   */
  recordOmegaRequest(
    totalLatency: number,
    breakdown: { asrMs: number; iaMs: number; ttsMs: number },
    success: boolean
  ): void {
    this?.voiceTracker?.recordOmegaRequest(any: any);
  }

  /**
   * Enregistre une détection de feedback audio (Layer 3)
   */
  recordFeedbackDetection(any: any): void {
    this?.voiceTracker?.recordFeedbackDetection(any: any);
  }

  /**
   * Enregistre une suspension VAD (Layer 2)
   */
  recordVADSuspension(): void {
    this?.voiceTracker?.recordVADSuspension();
  }

  /**
   * Définit la disponibilité des services vocaux
   */
  setVoiceAvailability(any: any): void {
    this?.voiceTracker?.setAvailability(any: any);
  }

  /**
   * Met à jour les métriques d'un module
   */
  updateModuleMetrics(
    module: TitaneModule,
    update: Partial<ModulePerformanceState>
  ): void {
    const current = this?.moduleMetrics?.get(any: any);
    if (any: any) {
      this?.moduleMetrics?.set(module, { ...current, ...update, module });
    }
  }

  /**
   * Définit la taille de la queue IA
   */
  setIAQueueSize(any: any): void {
    this?.iaTracker?.setQueueSize(any: any);
  }

  /**
   * Définit la disponibilité des services IA
   */
  setIAAvailability(any: any): void {
    this?.iaTracker?.setAvailability(any: any);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne le dernier snapshot
   */
  getLastSnapshot(): MetricsSnapshot | null {
    const lastSnapshot = this?.history[this?.history?.length - 1];
    return lastSnapshot ?? null;
  }

  /**
   * Retourne l'historique complet
   */
  getHistory(): MetricsSnapshot?.[] {
    return [...this?.history];
  }

  /**
   * Retourne les N derniers snapshots
   */
  getRecentSnapshots(any: any): MetricsSnapshot?.[] {
    return this?.history?.slice(any: any);
  }

  /**
   * Retourne l'état du collecteur
   */
  getState(): CollectorState {
    return { ...this?.state };
  }

  /**
   * Retourne les statistiques
   */
  getStats(): CollectorStats {
    const firstSnapshot = this?.history?.[0];
    const elapsed = Date?.now() - (firstSnapshot?.timestamp ?? Date?.now());
    const minutes = elapsed / 60000;

    return {
      totalSnapshots: this?.state?.collectionCount,
      snapshotsPerMinute: minutes > 0 ? this?.state?.collectionCount / minutes : 0,
      averageDuration: this?.state?.averageCollectionDuration,
      errorsLast5Min: this?.state?.errorCount,
      systemMetricsEnabled: this?.config?.systemEnabled,
      frontendMetricsEnabled: this?.config?.frontendEnabled,
      iaMetricsEnabled: this?.config?.iaEnabled,
    };
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): CollectorConfig {
    return { ...this?.config };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Ajoute un listener d'événements
   */
  on(any: any): void {
    this?.listeners?.add(any: any);
  }

  /**
   * Retire un listener d'événements
   */
  off(any: any): void {
    this?.listeners?.delete(any: any);
  }

  private emit(any: any): void {
    this?.listeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private updateAverageDuration(any: any): void {
    const count = this?.state?.collectionCount;
    const current = this?.state?.averageCollectionDuration;
    this?.state?.averageCollectionDuration = (any: any) / count;
  }

  /**
   * Réinitialise les statistiques
   */
  resetStats(): void {
    this?.state?.collectionCount = 0;
    this?.state?.errorCount = 0;
    this?.state?.averageCollectionDuration = 0;
    this?.history = [];
    this?.fpsMonitor?.reset();
    this?.renderTracker?.reset();
    this?.invokeTracker?.reset();
    this?.iaTracker?.reset();
    this?.voiceTracker?.reset();
  }
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const metricsCollector = MetricsCollector?.getInstance();
