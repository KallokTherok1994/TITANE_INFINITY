/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — QUANTUM RENDERING LAYER v∞
 * SUPER PROMPT OPUS #17
 *
 * Superviseur principal du rendu quantique
 * Scheduler, arbitre, optimiseur dynamique
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { FrameHarmonizer, FrameMetrics } from './frame_harmonizer';
import { ComponentCache, CacheStats } from './component_cache';
import { GPUAccelerator, GPUMetrics } from './gpu_acceleration';
import { VSyncOrchestrator, VSyncState } from './vsync_orchestrator';
import { MotionFrameEngine, MotionState } from './motion_frame_engine';
import { AntiJitterEngine, JitterMetrics } from './anti_jitter';
import { TextStabilityEngine, type TextMetrics } from './text_stability';

// Quantum Rules - Configuration inline
const quantumRules = {
  max_reflow_per_frame: 2,
  allowed_transforms: ['opacity', 'transform'],
  cache_duration_ms: 6,
  motion_sync_hz: 120,
  layout_transition_ms: 140,
  max_re_renders_per_second: 45,
  gpu_acceleration_allowed: true,
  strict_text_stability: true,
  frame_budget: {
    target_fps: 120,
    max_frame_time_ms: 8.33,
    warning_threshold_ms: 12,
    critical_threshold_ms: 16.67,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface QuantumState {
  isActive: boolean;
  renderCycle: number;
  lastFrameTime: number;
  avgFrameTime: number;
  reRenderCount: number;
  stabilityScore: number;
  gpuUtilization: number;
  cacheHitRate: number;
  jitterLevel: number;
  textClarity: number;
}

export interface QuantumMetrics {
  frame: FrameMetrics;
  cache: CacheStats;
  gpu: GPUMetrics;
  vsync: VSyncState;
  motion: MotionState;
  jitter: JitterMetrics;
  text: TextMetrics;
  overall: OverallMetrics;
}

export interface OverallMetrics {
  performanceScore: number;
  stabilityScore: number;
  fluidityScore: number;
  premiumScore: number;
  timestamp: string;
}

export interface QuantumConfig {
  maxReflowPerFrame: number;
  allowedTransforms: string[];
  cacheDurationMs: number;
  motionSyncHz: number;
  layoutTransitionMs: number;
  maxReRendersPerSecond: number;
  gpuAccelerationAllowed: boolean;
  strictTextStability: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUANTUM RENDERER - MOTEUR PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export class QuantumRenderer {
  private static instance: QuantumRenderer | null = null;

  private frameHarmonizer: FrameHarmonizer;
  private componentCache: ComponentCache;
  private gpuAccelerator: GPUAccelerator;
  private vsyncOrchestrator: VSyncOrchestrator;
  private motionFrameEngine: MotionFrameEngine;
  private antiJitterEngine: AntiJitterEngine;
  private textStabilityEngine: TextStabilityEngine;

  private state: QuantumState;
  private config: QuantumConfig;
  private metricsHistory: QuantumMetrics[] = [];
  private rafId: number | null = null;
  private isRunning: boolean = false;

  private constructor() {
    this.config = this.loadConfig();
    this.state = this.initializeState();

    // Initialiser tous les sous-moteurs
    this.frameHarmonizer = new FrameHarmonizer(this.config.motionSyncHz);
    this.componentCache = new ComponentCache(this.config.cacheDurationMs);
    this.gpuAccelerator = new GPUAccelerator(this.config.gpuAccelerationAllowed);
    this.vsyncOrchestrator = new VSyncOrchestrator();
    this.motionFrameEngine = new MotionFrameEngine();
    this.antiJitterEngine = new AntiJitterEngine();
    this.textStabilityEngine = new TextStabilityEngine(this.config.strictTextStability);
  }

  static getInstance(): QuantumRenderer {
    if (!QuantumRenderer.instance) {
      QuantumRenderer.instance = new QuantumRenderer();
    }
    return QuantumRenderer.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  private loadConfig(): QuantumConfig {
    return {
      maxReflowPerFrame: quantumRules.max_reflow_per_frame ?? 2,
      allowedTransforms: quantumRules.allowed_transforms ?? ['opacity', 'transform'],
      cacheDurationMs: quantumRules.cache_duration_ms ?? 6,
      motionSyncHz: quantumRules.motion_sync_hz ?? 120,
      layoutTransitionMs: quantumRules.layout_transition_ms ?? 140,
      maxReRendersPerSecond: quantumRules.max_re_renders_per_second ?? 45,
      gpuAccelerationAllowed: quantumRules.gpu_acceleration_allowed ?? true,
      strictTextStability: quantumRules.strict_text_stability ?? true,
    };
  }

  private initializeState(): QuantumState {
    return {
      isActive: false,
      renderCycle: 0,
      lastFrameTime: 0,
      avgFrameTime: 16.67, // 60fps baseline
      reRenderCount: 0,
      stabilityScore: 1.0,
      gpuUtilization: 0,
      cacheHitRate: 0,
      jitterLevel: 0,
      textClarity: 1.0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.state.isActive = true;

    // Initialiser tous les sous-systèmes
    this.gpuAccelerator.initialize();
    this.vsyncOrchestrator.start();
    this.textStabilityEngine.apply();

    // Démarrer la boucle de rendu quantique
    this.startQuantumLoop();

    console.log('[QuantumRenderer] Started - Premium rendering active');
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.state.isActive = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.vsyncOrchestrator.stop();

    console.log('[QuantumRenderer] Stopped');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUANTUM RENDER LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  private startQuantumLoop(): void {
    let lastTime = performance.now();
    let _frameCount = 0;
    let reRenderCounter = 0;
    const reRenderWindow = 1000; // 1 seconde
    let reRenderWindowStart = performance.now();

    const quantumFrame = (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Reset re-render counter each second
      if (currentTime - reRenderWindowStart > reRenderWindow) {
        this.state.reRenderCount = reRenderCounter;
        reRenderCounter = 0;
        reRenderWindowStart = currentTime;
      }

      // Harmoniser les frames
      this.frameHarmonizer.harmonize(deltaTime);

      // Vérifier et corriger le jitter
      const jitterResult = this.antiJitterEngine.analyze();
      if (jitterResult.detected) {
        this.antiJitterEngine.correct(jitterResult);
      }

      // Synchroniser avec VSync
      this.vsyncOrchestrator.sync(currentTime);

      // Mettre à jour les métriques
      this.updateMetrics(deltaTime, currentTime);

      // Increment cycle
      this.state.renderCycle++;
      _frameCount++;

      // Schedule next frame
      this.rafId = requestAnimationFrame(quantumFrame);
    };

    this.rafId = requestAnimationFrame(quantumFrame);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIMISATION DU RENDU
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Optimise un composant avant son rendu
   */
  optimizeComponent(componentId: string, renderFn: () => void): void {
    // Vérifier le cache
    if (this.componentCache.has(componentId)) {
      const cached = this.componentCache.get(componentId);
      if (cached && !cached.needsUpdate) {
        return; // Skip render, use cache
      }
    }

    // Appliquer accélération GPU si nécessaire
    this.gpuAccelerator.prepareElement(componentId);

    // Exécuter le rendu avec harmonisation
    this.frameHarmonizer.scheduleRender(() => {
      renderFn();
      this.componentCache.set(componentId, { timestamp: Date.now(), needsUpdate: false });
    });
  }

  /**
   * Marque un composant comme nécessitant une mise à jour
   */
  invalidateComponent(componentId: string): void {
    this.componentCache.invalidate(componentId);
  }

  /**
   * Optimise une transition
   */
  optimizeTransition(element: HTMLElement, properties: string[]): void {
    // Filtrer les propriétés autorisées
    const allowedProps = properties.filter(p =>
      this.config.allowedTransforms.includes(p)
    );

    if (allowedProps.length === 0) return;

    // Appliquer will-change
    element.style.willChange = allowedProps.join(', ');

    // Activer GPU layer
    if (this.config.gpuAccelerationAllowed) {
      this.gpuAccelerator.activateLayer(element);
    }

    // Nettoyer après transition
    const cleanup = () => {
      element.style.willChange = 'auto';
      element.removeEventListener('transitionend', cleanup);
    };
    element.addEventListener('transitionend', cleanup, { once: true });
  }

  /**
   * Stabilise un layout
   */
  stabilizeLayout(container: HTMLElement): void {
    this.antiJitterEngine.stabilizeContainer(container);
    this.textStabilityEngine.stabilizeText(container);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // MÉTRIQUES
  // ═══════════════════════════════════════════════════════════════════════════════

  private updateMetrics(deltaTime: number, _currentTime: number): void {
    // Calculer frame time moyen (exponential moving average)
    const alpha = 0.1;
    this.state.avgFrameTime = alpha * deltaTime + (1 - alpha) * this.state.avgFrameTime;
    this.state.lastFrameTime = deltaTime;

    // Récupérer métriques des sous-systèmes
    this.state.cacheHitRate = this.componentCache.getHitRate();
    this.state.gpuUtilization = this.gpuAccelerator.getUtilization();
    this.state.jitterLevel = this.antiJitterEngine.getJitterLevel();
    this.state.textClarity = this.textStabilityEngine.getClarityScore();

    // Calculer score de stabilité
    this.state.stabilityScore = this.calculateStabilityScore();
  }

  private calculateStabilityScore(): number {
    const targetFrameTime = 1000 / this.config.motionSyncHz;
    const frameDeviation =
      Math.abs(this.state.avgFrameTime - targetFrameTime) / targetFrameTime;
    const frameScore = Math.max(0, 1 - frameDeviation);

    const jitterScore = 1 - this.state.jitterLevel;
    const cacheScore = this.state.cacheHitRate;
    const textScore = this.state.textClarity;

    // Score pondéré
    return frameScore * 0.3 + jitterScore * 0.25 + cacheScore * 0.2 + textScore * 0.25;
  }

  getMetrics(): QuantumMetrics {
    return {
      frame: this.frameHarmonizer.getMetrics(),
      cache: this.componentCache.getStats(),
      gpu: this.gpuAccelerator.getMetrics(),
      vsync: this.vsyncOrchestrator.getState(),
      motion: this.motionFrameEngine.getState(),
      jitter: this.antiJitterEngine.getMetrics(),
      text: this.textStabilityEngine.getMetrics(),
      overall: {
        performanceScore: this.calculatePerformanceScore(),
        stabilityScore: this.state.stabilityScore,
        fluidityScore: this.calculateFluidityScore(),
        premiumScore: this.calculatePremiumScore(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  private calculatePerformanceScore(): number {
    const targetFPS = this.config.motionSyncHz;
    const currentFPS = 1000 / this.state.avgFrameTime;
    return Math.min(1, currentFPS / targetFPS);
  }

  private calculateFluidityScore(): number {
    const motionScore = this.motionFrameEngine.getFluidityScore();
    const vsyncScore = this.vsyncOrchestrator.getSyncScore();
    return (motionScore + vsyncScore) / 2;
  }

  private calculatePremiumScore(): number {
    // Score global "sensation premium"
    return (
      this.state.stabilityScore * 0.25 +
      this.calculatePerformanceScore() * 0.25 +
      this.calculateFluidityScore() * 0.25 +
      (1 - this.state.jitterLevel) * 0.15 +
      this.state.textClarity * 0.1
    );
  }

  getState(): QuantumState {
    return { ...this.state };
  }

  getConfig(): QuantumConfig {
    return { ...this.config };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS REACT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Hook pour intégrer le Quantum Renderer dans React
   */
  createReactIntegration() {
    return {
      useQuantumOptimization: (componentId: string) => {
        return {
          onRender: () => this.componentCache.touch(componentId),
          onUnmount: () => this.componentCache.remove(componentId),
          shouldUpdate: () =>
            !this.componentCache.has(componentId) ||
            this.componentCache.get(componentId)?.needsUpdate,
        };
      },

      useQuantumTransition: () => {
        return {
          prepareTransition: (el: HTMLElement, props: string[]) =>
            this.optimizeTransition(el, props),
          scheduleAnimation: (fn: () => void) => this.frameHarmonizer.scheduleRender(fn),
        };
      },

      useQuantumStability: () => {
        return {
          stabilize: (container: HTMLElement) => this.stabilizeLayout(container),
          getJitterLevel: () => this.state.jitterLevel,
          getTextClarity: () => this.state.textClarity,
        };
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════

export const quantumRenderer = QuantumRenderer.getInstance();
export default QuantumRenderer;
