/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - Visual Engine (Upgraded)
 * Central orchestrator for all visual effects and state management
 *
 * v21 Features:
 * - ✅ Centralized visual state management
 * - ✅ Effects orchestration integration (v21)
 * - ✅ OS integration bridge (v21)
 * - ✅ Performance monitoring (60fps target)
 * - ✅ Adaptive FPS throttling
 * - ✅ GPU load tracking
 * - ✅ Debug mode
 * - ✅ Particle system coordination
 * - ✅ Effect scheduling and management
 * ═══════════════════════════════════════════════════════════════
 */

import EventEmitter from 'eventemitter3';
import { StateManager } from './StateManager';
import type { VisualState, StateVisualConfig } from '@/design-system/visual-states';
import { effectsOrchestrator } from './EffectsOrchestrator';
import { osIntegrationBridge } from './OSIntegrationBridge';
import type { EffectsMetrics as _EffectsMetrics } from './EffectsOrchestrator';

export interface VisualEngineConfig {
  enableParticles: boolean;
  enableEffects: boolean;
  targetFPS: number;
  performanceMode: 'high' | 'medium' | 'low';
  enableWebSocket: boolean;
  websocketUrl?: string;
  enableOrchestration?: boolean; // v21: Enable effects orchestrator
  enableOSIntegration?: boolean; // v21: Enable OS bridge
  adaptiveFPS?: boolean; // v21: Auto-throttle on low FPS
  debug?: boolean; // v21: Debug mode
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  effectsActive: number;
  memoryUsage: number;
  gpuLoad: number; // v21: GPU load estimation (0-1)
  throttleActive: boolean; // v21: Is throttling active
}

export class TitaneVisualEngine extends EventEmitter {
  private static instance: TitaneVisualEngine | null = null;

  public static getInstance(
    config: Partial<VisualEngineConfig> = {}
  ): TitaneVisualEngine {
    const viteEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env;
    const viteMode = typeof viteEnv?.MODE === 'string' ? viteEnv.MODE : undefined;

    const isVitest =
      typeof process !== 'undefined' && typeof process.env?.VITEST === 'string';
    const isNodeTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    const isTestEnv = viteMode === 'test' || isVitest || isNodeTest;

    // En tests, on évite les fuites d'état d'un singleton entre suites.
    // On désactive aussi les intégrations OS/orchestration pour réduire les effets de bord.
    if (isTestEnv) {
      TitaneVisualEngine.instance = new TitaneVisualEngine({
        enableParticles: false,
        enableEffects: false,
        enableOrchestration: false,
        enableOSIntegration: false,
        adaptiveFPS: false,
        ...config,
      });
      return TitaneVisualEngine.instance;
    }

    if (!TitaneVisualEngine.instance) {
      TitaneVisualEngine.instance = new TitaneVisualEngine(config);
    }
    return TitaneVisualEngine.instance;
  }

  public static resetInstance(): void {
    TitaneVisualEngine.instance = null;
  }

  private stateManager: StateManager;
  private config: VisualEngineConfig;
  private isRunning = false;
  private websocket: WebSocket | null = null;
  private websocketReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private websocketReconnectAttempts = 0;
  private websocketConnectSeq = 0;

  // Performance tracking
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;
  private performanceMetrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    effectsActive: 0,
    memoryUsage: 0,
    gpuLoad: 0,
    throttleActive: false,
  };

  // Animation frame ID
  private rafId: number | null = null;

  // v21: FPS throttling state
  private throttleLevel = 0; // 0 = none, 1 = light, 2 = medium, 3 = heavy
  private lowFPSFrames = 0; // Count of consecutive low FPS frames

  constructor(config: Partial<VisualEngineConfig> = {}) {
    super();

    // Initialize configuration with defaults (v21 enhanced)
    this.config = {
      enableParticles: true,
      enableEffects: true,
      targetFPS: 60,
      performanceMode: 'high',
      enableWebSocket: false,
      enableOrchestration: true, // v21: Auto-enabled
      enableOSIntegration: true, // v21: Auto-enabled
      adaptiveFPS: true, // v21: Auto-throttle
      debug: false,
      ...config,
    };

    // Initialize state manager
    this.stateManager = new StateManager('idle');

    // Subscribe to state changes
    this.stateManager.on('stateChange', (state: VisualState) => {
      this.emit('visualStateChange', state);

      // v21: Update effects orchestrator with new state
      if (this.config.enableOrchestration) {
        effectsOrchestrator.updateVisualState(state);
      }
    });

    this.stateManager.on('transitionStart', data => {
      this.emit('transitionStart', data);
    });

    this.stateManager.on('transitionComplete', data => {
      this.emit('transitionComplete', data);
    });

    // v21: Initialize OS integration bridge
    if (this.config.enableOSIntegration) {
      osIntegrationBridge.initialize(this, effectsOrchestrator);
    }

    if (this.config.debug) {
      console.log('[TitaneVisualEngine] v21 initialized with config:', this.config);
    }
  }

  /**
   * Start the visual engine
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Visual engine is already running');
      return;
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();

    // Connect WebSocket if enabled
    if (this.config.enableWebSocket && this.config.websocketUrl) {
      this.connectWebSocket(this.config.websocketUrl);
    }

    // Start render loop
    this.startRenderLoop();

    this.emit('engineStart');
  }

  /**
   * Stop the visual engine
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // v21: Disconnect OS integration bridge
    if (this.config.enableOSIntegration) {
      osIntegrationBridge.disconnect();
    }

    // Stop render loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Disconnect WebSocket
    if (this.websocketReconnectTimer) {
      clearTimeout(this.websocketReconnectTimer);
      this.websocketReconnectTimer = null;
    }
    this.websocketReconnectAttempts = 0;

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.emit('engineStop');
  }

  /**
   * Main render loop (60fps target)
   */
  private startRenderLoop(): void {
    const render = (timestamp: number) => {
      if (!this.isRunning) {
        return;
      }

      // Calculate delta time
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      // Update FPS calculation
      this.updateFPS(deltaTime);

      // Emit render event for subscribers
      this.emit('render', {
        timestamp,
        deltaTime,
        state: this.stateManager.getCurrentState(),
        visuals: this.stateManager.getCurrentVisuals(),
      });

      // Continue loop
      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  /**
   * Update FPS calculation (v21 enhanced with adaptive throttling)
   */
  private updateFPS(deltaTime: number): void {
    this.frameCount++;

    // Update FPS every second
    if (this.frameCount >= 60) {
      this.fps = Math.round(1000 / deltaTime);
      this.performanceMetrics.fps = this.fps;
      this.performanceMetrics.frameTime = deltaTime;
      this.frameCount = 0;

      // v21: Get effects orchestrator metrics
      if (this.config.enableOrchestration) {
        const effectsMetrics = effectsOrchestrator.getMetrics();
        this.performanceMetrics.effectsActive = effectsMetrics.activeCount;
        this.performanceMetrics.gpuLoad = effectsMetrics.gpuLoad;

        // Update orchestrator with performance data
        effectsOrchestrator.updateMetrics(deltaTime, effectsMetrics.gpuLoad);
      }

      // Emit performance metrics
      this.emit('performanceUpdate', this.performanceMetrics);

      // v21: Adaptive FPS throttling
      if (this.config.adaptiveFPS) {
        this.applyAdaptiveThrottling();
      }

      // Check if performance is degraded
      if (this.fps < this.config.targetFPS * 0.8) {
        this.emit('performanceWarning', {
          fps: this.fps,
          target: this.config.targetFPS,
        });
      }
    }
  }

  /**
   * v21: Apply adaptive throttling based on FPS
   */
  private applyAdaptiveThrottling(): void {
    const targetFPS = this.config.targetFPS;
    const threshold = targetFPS * 0.9; // 90% of target (54 FPS for 60 FPS target)

    if (this.fps < threshold) {
      this.lowFPSFrames++;

      // Only throttle if low FPS persists for 3+ seconds
      if (this.lowFPSFrames >= 3) {
        this.increaseThrottling();
      }
    } else {
      // Good FPS, decrease throttling
      if (this.lowFPSFrames > 0) {
        this.lowFPSFrames--;
      }
      if (this.throttleLevel > 0 && this.fps >= targetFPS) {
        this.decreaseThrottling();
      }
    }
  }

  /**
   * v21: Increase throttling level
   */
  private increaseThrottling(): void {
    if (this.throttleLevel >= 3) return;

    this.throttleLevel++;
    this.performanceMetrics.throttleActive = true;

    if (this.config.debug) {
      console.log(
        `[TitaneVisualEngine] Throttling increased to level ${this.throttleLevel}`
      );
    }

    switch (this.throttleLevel) {
      case 1: // Light throttling
        // Reduce max concurrent effects slightly
        break;
      case 2: // Medium throttling
        // Stop low-priority effects
        if (this.config.enableOrchestration) {
          effectsOrchestrator.stopEffectsByType('auraGlow');
          effectsOrchestrator.stopEffectsByType('audioWaveform');
        }
        break;
      case 3: // Heavy throttling
        // Stop all non-critical effects
        if (this.config.enableOrchestration) {
          effectsOrchestrator.stopEffectsByType('auraGlow');
          effectsOrchestrator.stopEffectsByType('audioWaveform');
          effectsOrchestrator.stopEffectsByType('healingWaves');
        }
        this.config.enableParticles = false;
        break;
    }

    this.emit('throttleChange', { level: this.throttleLevel, active: true });
  }

  /**
   * v21: Decrease throttling level
   */
  private decreaseThrottling(): void {
    if (this.throttleLevel <= 0) return;

    this.throttleLevel--;

    if (this.config.debug) {
      console.log(
        `[TitaneVisualEngine] Throttling decreased to level ${this.throttleLevel}`
      );
    }

    switch (this.throttleLevel) {
      case 0: // No throttling
        this.performanceMetrics.throttleActive = false;
        this.config.enableParticles = true;
        break;
      case 1: // Light throttling
        this.config.enableParticles = true;
        break;
      case 2: // Medium throttling
        // Still keep particles disabled from level 3
        break;
    }

    this.emit('throttleChange', {
      level: this.throttleLevel,
      active: this.throttleLevel > 0,
    });
  }

  /**
   * Set visual state with transition
   */
  setState(state: VisualState, duration?: number): void {
    this.stateManager.setState(state, duration);
  }

  /**
   * Set visual state immediately without transition
   */
  setStateImmediate(state: VisualState): void {
    this.stateManager.setStateImmediate(state);
  }

  /**
   * Get current visual state
   */
  getCurrentState(): VisualState {
    return this.stateManager.getCurrentState();
  }

  /**
   * Get current visual configuration
   */
  getCurrentVisuals(): StateVisualConfig {
    return this.stateManager.getCurrentVisuals();
  }

  /**
   * Get current transition progress (0-1)
   */
  getTransitionProgress(): number {
    return this.stateManager.getTransitionProgress();
  }

  /**
   * Check if engine is transitioning between states
   */
  isTransitioning(): boolean {
    return this.stateManager.isTransitioning();
  }

  /**
   * Connect to WebSocket for real-time state updates
   */
  private connectWebSocket(url: string): void {
    try {
      if (this.websocketReconnectTimer) {
        clearTimeout(this.websocketReconnectTimer);
        this.websocketReconnectTimer = null;
      }

      if (
        this.websocket &&
        (this.websocket.readyState === WebSocket.OPEN ||
          this.websocket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }

      const connectSeq = ++this.websocketConnectSeq;
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        console.log('[VisualEngine] WebSocket connected');
        this.websocketReconnectAttempts = 0;
        this.emit('websocketConnected');
      };

      this.websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('[VisualEngine] WebSocket message parse error:', error);
        }
      };

      this.websocket.onerror = error => {
        console.error('[VisualEngine] WebSocket error:', error);
        this.emit('websocketError', error);
      };

      this.websocket.onclose = () => {
        console.log('[VisualEngine] WebSocket disconnected');
        this.emit('websocketDisconnected');
        this.websocket = null;

        if (
          !this.isRunning ||
          !this.config.enableWebSocket ||
          !this.config.websocketUrl
        ) {
          return;
        }

        if (this.websocketReconnectTimer) {
          return;
        }

        const attempt = this.websocketReconnectAttempts + 1;
        const delayMs = Math.min(5000 * 2 ** Math.min(attempt - 1, 4), 60000);

        this.websocketReconnectTimer = setTimeout(() => {
          this.websocketReconnectTimer = null;
          if (
            !this.isRunning ||
            !this.config.enableWebSocket ||
            !this.config.websocketUrl ||
            connectSeq !== this.websocketConnectSeq
          ) {
            return;
          }

          this.websocketReconnectAttempts = attempt;
          this.connectWebSocket(this.config.websocketUrl);
        }, delayMs);
      };
    } catch (error) {
      console.error('[VisualEngine] WebSocket connection error:', error);
      this.emit('websocketError', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: unknown): void {
    // Type guard for WebSocket message
    if (typeof data === 'object' && data !== null && 'type' in data) {
      const message = data as { type: string; payload?: unknown };

      switch (message.type) {
        case 'state_change':
          if (
            message.payload &&
            typeof message.payload === 'object' &&
            'state' in message.payload
          ) {
            this.setState(message.payload.state as VisualState);
          }
          break;

        case 'performance_mode':
          if (
            message.payload &&
            typeof message.payload === 'object' &&
            'mode' in message.payload
          ) {
            this.setPerformanceMode(message.payload.mode as 'high' | 'medium' | 'low');
          }
          break;

        default:
          console.warn('[VisualEngine] Unknown WebSocket message type:', message.type);
      }
    }

    this.emit('websocketMessage', data);
  }

  /**
   * Update performance mode
   */
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.config.performanceMode = mode;

    // Adjust settings based on performance mode
    switch (mode) {
      case 'low':
        this.config.enableParticles = false;
        this.config.enableEffects = false;
        break;
      case 'medium':
        this.config.enableParticles = true;
        this.config.enableEffects = false;
        break;
      case 'high':
        this.config.enableParticles = true;
        this.config.enableEffects = true;
        break;
    }

    this.emit('performanceModeChange', mode);
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update particle count for metrics
   */
  setParticleCount(count: number): void {
    this.performanceMetrics.particleCount = count;
  }

  /**
   * Update active effects count for metrics
   */
  setEffectsCount(count: number): void {
    this.performanceMetrics.effectsActive = count;
  }

  /**
   * Get engine configuration
   */
  getConfig(): VisualEngineConfig {
    return { ...this.config };
  }

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<VisualEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('configUpdate', this.config);
  }

  /**
   * Get state history
   */
  getStateHistory() {
    return this.stateManager.getHistory();
  }

  /**
   * Get state statistics
   */
  getStateStats() {
    return this.stateManager.getStats();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.stateManager.destroy();
    this.removeAllListeners();
  }
}

export default TitaneVisualEngine;
