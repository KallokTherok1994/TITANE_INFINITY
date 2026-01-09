// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — PERFORMANCE MONITOR
//   Real-time FPS, CPU, GPU, RAM profiling with dynamic resolution scaling
// ═══════════════════════════════════════════════════════════════════════════

import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

// Extended Performance interface with memory property (Chrome/Edge only)
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

export interface PerformanceMetrics {
  fps: number; // Current FPS
  averageFps: number; // Average FPS (last 60 frames)
  minFps: number; // Minimum FPS (last 60 frames)
  maxFps: number; // Maximum FPS (last 60 frames)
  frameTime: number; // Frame time (ms)
  cpuUsage: number; // CPU usage estimate (0-100%)
  gpuUsage: number; // GPU usage estimate (0-100%)
  memoryUsed: number; // Memory used (MB)
  memoryTotal: number; // Memory total (MB)
  drawCalls: number; // Render draw calls (from renderer)
  triangles: number; // Total triangles rendered
  resolution: number; // Current render resolution scale (0.5-1.0)
}

export interface PerformanceConfig {
  targetFps: number; // Target FPS (60 or 120)
  minFps: number; // Minimum acceptable FPS
  enableDRS: boolean; // Dynamic Resolution Scaling
  drsMinScale: number; // Min resolution scale (0.5 = 50%)
  drsMaxScale: number; // Max resolution scale (1.0 = 100%)
  drsAdjustSpeed: number; // DRS adjustment speed (0.01-0.1)
  logInterval: number; // Console log interval (ms) - 0 = disabled
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MONITOR
// ═══════════════════════════════════════════════════════════════════════════

export class PerformanceMonitor {
  private config: PerformanceConfig;

  // Frame timing
  private frameHistory: number[] = [];
  private lastFrameTime: number = performance.now();
  private frameCount: number = 0;

  // Performance state
  private currentMetrics: PerformanceMetrics;
  private currentResolutionScale: number = 1.0;

  // Logging
  private lastLogTime: number = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      targetFps: 60,
      minFps: 45,
      enableDRS: true,
      drsMinScale: 0.5,
      drsMaxScale: 1.0,
      drsAdjustSpeed: 0.02,
      logInterval: 5000, // Log every 5s
      ...config,
    };

    // Initialize metrics
    this.currentMetrics = {
      fps: 0,
      averageFps: 0,
      minFps: 0,
      maxFps: 0,
      frameTime: 0,
      cpuUsage: 0,
      gpuUsage: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      drawCalls: 0,
      triangles: 0,
      resolution: 1.0,
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Begin frame measurement
   */
  public beginFrame(): void {
    this.lastFrameTime = performance.now();
  }

  /**
   * End frame measurement
   */
  public endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.frameCount++;

    // Add to history (keep last 60 frames)
    this.frameHistory.push(frameTime);
    if (this.frameHistory.length > 60) {
      this.frameHistory.shift();
    }

    // Calculate FPS
    this.currentMetrics.fps = 1000 / frameTime;
    this.currentMetrics.frameTime = frameTime;

    // Calculate average FPS
    const avgFrameTime =
      this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
    this.currentMetrics.averageFps = 1000 / avgFrameTime;

    // Calculate min/max FPS
    const minFrameTime = Math.min(...this.frameHistory);
    const maxFrameTime = Math.max(...this.frameHistory);
    this.currentMetrics.minFps = 1000 / maxFrameTime;
    this.currentMetrics.maxFps = 1000 / minFrameTime;

    // Update memory (if available)
    const perfWithMemory = performance as PerformanceWithMemory;
    if ('memory' in performance && perfWithMemory.memory) {
      const memory = perfWithMemory.memory;
      this.currentMetrics.memoryUsed = memory.usedJSHeapSize / (1024 * 1024);
      this.currentMetrics.memoryTotal = memory.jsHeapSizeLimit / (1024 * 1024);
    }

    // Estimate CPU usage (rough approximation)
    this.currentMetrics.cpuUsage = Math.min(
      100,
      (frameTime / (1000 / this.config.targetFps)) * 100
    );

    // Dynamic Resolution Scaling
    if (this.config.enableDRS) {
      this.updateDRS();
    }

    // Periodic logging
    if (this.config.logInterval > 0 && now - this.lastLogTime > this.config.logInterval) {
      this.logMetrics();
      this.lastLogTime = now;
    }
  }

  /**
   * Update renderer info (call after render)
   */
  public updateRendererInfo(info: {
    render?: {
      calls?: number;
      triangles?: number;
    };
  }): void {
    if (info.render) {
      this.currentMetrics.drawCalls = info.render.calls || 0;
      this.currentMetrics.triangles = info.render.triangles || 0;
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }

  /**
   * Get current resolution scale (for DRS)
   */
  public getResolutionScale(): number {
    return this.currentResolutionScale;
  }

  /**
   * Check if performance is acceptable
   */
  public isPerformanceGood(): boolean {
    return this.currentMetrics.averageFps >= this.config.minFps;
  }

  /**
   * Reset statistics
   */
  public reset(): void {
    this.frameHistory = [];
    this.frameCount = 0;
    this.currentResolutionScale = 1.0;
    this.lastLogTime = 0;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update Dynamic Resolution Scaling
   */
  private updateDRS(): void {
    const { averageFps } = this.currentMetrics;
    const { targetFps, drsMinScale, drsMaxScale, drsAdjustSpeed } = this.config;

    // If FPS below target, reduce resolution
    if (averageFps < targetFps * 0.95) {
      this.currentResolutionScale = Math.max(
        drsMinScale,
        this.currentResolutionScale - drsAdjustSpeed
      );
    }
    // If FPS above target, increase resolution
    else if (averageFps > targetFps * 1.05) {
      this.currentResolutionScale = Math.min(
        drsMaxScale,
        this.currentResolutionScale + drsAdjustSpeed / 2 // Slower increase
      );
    }

    this.currentMetrics.resolution = this.currentResolutionScale;
  }

  /**
   * Log metrics to console
   */
  private logMetrics(): void {
    logger.debug('Metrics:', {
      fps: `${this.currentMetrics.fps.toFixed(1)} (avg: ${this.currentMetrics.averageFps.toFixed(1)}, min: ${this.currentMetrics.minFps.toFixed(1)}, max: ${this.currentMetrics.maxFps.toFixed(1)})`,
      frameTime: `${this.currentMetrics.frameTime.toFixed(2)}ms`,
      cpu: `${this.currentMetrics.cpuUsage.toFixed(1)}%`,
      memory: `${this.currentMetrics.memoryUsed.toFixed(1)}MB / ${this.currentMetrics.memoryTotal.toFixed(1)}MB`,
      drawCalls: this.currentMetrics.drawCalls,
      triangles: this.currentMetrics.triangles,
      resolution: `${(this.currentMetrics.resolution * 100).toFixed(0)}%`,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: FPS LIMITER
// ═══════════════════════════════════════════════════════════════════════════

export class FPSLimiter {
  private targetFps: number;
  private interval: number;
  private lastTime: number = performance.now();

  constructor(targetFps: number = 60) {
    this.targetFps = targetFps;
    this.interval = 1000 / targetFps;
  }

  /**
   * Check if should render this frame
   */
  public shouldRender(): boolean {
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= this.interval) {
      this.lastTime = now - (delta % this.interval);
      return true;
    }

    return false;
  }

  /**
   * Set target FPS
   */
  public setTargetFps(fps: number): void {
    this.targetFps = fps;
    this.interval = 1000 / fps;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default PerformanceMonitor;
