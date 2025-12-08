/**
 * TITANE∞ v20Ω — DevTools OS vΩ
 * Hub principal du système de développement
 */

import { MetricsHub, type MetricsSnapshot } from './MetricsHub';
import { Debugger, type DebugBreakpoint } from './Debugger';
import { PipelineInspector, type PipelineTrace } from './PipelineInspector';
import { MemoryExplorer, type MemorySnapshot } from './MemoryExplorer';
import { EngineProfiler, type EngineProfile } from './EngineProfiler';
import { EventTimeline, type TimelineEvent } from './EventTimeline';

export interface DevSnapshot {
  timestamp: number;
  metrics: MetricsSnapshot;
  engines: EngineProfile[];
  memory: MemorySnapshot;
  timeline: TimelineEvent[];
  breakpoints: DebugBreakpoint[];
}

export interface DevToolsConfig {
  enabled: boolean;
  metricsInterval: number;
  maxHistorySize: number;
  autoSnapshot: boolean;
}

const DEFAULT_CONFIG: DevToolsConfig = {
  enabled: true,
  metricsInterval: 500,
  maxHistorySize: 1000,
  autoSnapshot: true,
};

/**
 * DevTools OS vΩ — Hub principal
 * Orchestrateur d'observabilité pour TITANE∞
 */
export class DevToolsOS {
  private config: DevToolsConfig;
  private metrics: MetricsHub;
  private debugger: Debugger;
  private pipeline: PipelineInspector;
  private memory: MemoryExplorer;
  private profiler: EngineProfiler;
  private timeline: EventTimeline;
  private intervalId: number | null = null;

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = new MetricsHub();
    this.debugger = new Debugger();
    this.pipeline = new PipelineInspector();
    this.memory = new MemoryExplorer();
    this.profiler = new EngineProfiler();
    this.timeline = new EventTimeline(this.config.maxHistorySize);
  }

  /**
   * Démarre la collecte automatique
   */
  start(): void {
    if (!this.config.enabled || this.intervalId !== null) return;

    this.timeline.add('system', 'DevTools OS started');

    if (this.config.autoSnapshot) {
      this.intervalId = window.setInterval(() => {
        this.metrics.tick();
      }, this.config.metricsInterval);
    }
  }

  /**
   * Arrête la collecte
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.timeline.add('system', 'DevTools OS stopped');
  }

  /**
   * Prend un snapshot complet
   */
  async snapshot(): Promise<DevSnapshot> {
    return {
      timestamp: Date.now(),
      metrics: this.metrics.snapshot(),
      engines: this.profiler.getAllProfiles(),
      memory: await this.memory.snapshot(),
      timeline: this.timeline.recent(100),
      breakpoints: this.debugger.listBreakpoints(),
    };
  }

  /**
   * Enregistre une latence moteur
   */
  recordEngineLatency(engineId: string, latencyMs: number): void {
    this.metrics.recordLatency(engineId, latencyMs);
    this.profiler.record(engineId, latencyMs);
    this.timeline.add('engine', `${engineId}: ${latencyMs}ms`);
  }

  /**
   * Enregistre une erreur
   */
  recordError(source: string, error: string): void {
    this.metrics.recordError(source);
    this.timeline.add('error', `[${source}] ${error}`);
  }

  /**
   * Enregistre un événement pipeline
   */
  recordPipelineEvent(stage: string, data: unknown): void {
    this.pipeline.record(stage, data);
    this.timeline.add('pipeline', `Stage: ${stage}`);
  }

  /**
   * Définit un breakpoint
   */
  setBreakpoint(id: string, type: DebugBreakpoint['type']): void {
    this.debugger.setBreakpoint(id, type);
    this.timeline.add('debug', `Breakpoint set: ${id}`);
  }

  /**
   * Supprime un breakpoint
   */
  removeBreakpoint(id: string): void {
    this.debugger.removeBreakpoint(id);
  }

  /**
   * Accès aux sous-systèmes
   */
  getMetrics(): MetricsHub {
    return this.metrics;
  }

  getDebugger(): Debugger {
    return this.debugger;
  }

  getPipeline(): PipelineInspector {
    return this.pipeline;
  }

  getMemory(): MemoryExplorer {
    return this.memory;
  }

  getProfiler(): EngineProfiler {
    return this.profiler;
  }

  getTimeline(): EventTimeline {
    return this.timeline;
  }

  /**
   * Export JSON
   */
  async exportJSON(): Promise<string> {
    const snapshot = await this.snapshot();
    return JSON.stringify(snapshot, null, 2);
  }

  /**
   * Réinitialise tout
   */
  reset(): void {
    this.metrics.reset();
    this.debugger.clearAll();
    this.pipeline.clear();
    this.memory.clear();
    this.profiler.reset();
    this.timeline.clear();
    this.timeline.add('system', 'DevTools OS reset');
  }
}

// Singleton
let devToolsInstance: DevToolsOS | null = null;

export function getDevTools(config?: Partial<DevToolsConfig>): DevToolsOS {
  if (!devToolsInstance) {
    devToolsInstance = new DevToolsOS(config);
  }
  return devToolsInstance;
}

export default DevToolsOS;
