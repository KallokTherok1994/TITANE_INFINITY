/**
 * TITANE_INFINITY v19.3.0 — Visual Engine
 * Central orchestrator for all visual effects and state management
 *
 * Features:
 * - Centralized visual state management
 * - WebSocket integration for real-time updates
 * - Performance monitoring (60fps target)
 * - Particle system coordination
 * - Effect scheduling and management
 */

import EventEmitter from 'eventemitter3';
import { StateManager } from './StateManager';
import type { VisualState, StateVisualConfig } from '@/design-system/visual-states';

export interface VisualEngineConfig {
  enableParticles: boolean;
  enableEffects: boolean;
  targetFPS: number;
  performanceMode: 'high' | 'medium' | 'low';
  enableWebSocket: boolean;
  websocketUrl?: string;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  effectsActive: number;
  memoryUsage: number;
}

export class TitaneVisualEngine extends EventEmitter {
  private stateManager: StateManager;
  private config: VisualEngineConfig;
  private isRunning = false;
  private websocket: WebSocket | null = null;

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
  };

  // Animation frame ID
  private rafId: number | null = null;

  constructor(config: Partial<VisualEngineConfig> = {}) {
    super();

    // Initialize configuration with defaults
    this.config = {
      enableParticles: true,
      enableEffects: true,
      targetFPS: 60,
      performanceMode: 'high',
      enableWebSocket: false,
      ...config,
    };

    // Initialize state manager
    this.stateManager = new StateManager('idle');

    // Subscribe to state changes
    this.stateManager.on('stateChange', (state: VisualState) => {
      this.emit('visualStateChange', state);
    });

    this.stateManager.on('transitionStart', (data) => {
      this.emit('transitionStart', data);
    });

    this.stateManager.on('transitionComplete', (data) => {
      this.emit('transitionComplete', data);
    });
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

    // Stop render loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Disconnect WebSocket
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
   * Update FPS calculation
   */
  private updateFPS(deltaTime: number): void {
    this.frameCount++;

    // Update FPS every second
    if (this.frameCount >= 60) {
      this.fps = Math.round(1000 / deltaTime);
      this.performanceMetrics.fps = this.fps;
      this.performanceMetrics.frameTime = deltaTime;
      this.frameCount = 0;

      // Emit performance metrics
      this.emit('performanceUpdate', this.performanceMetrics);

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
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        console.log('[VisualEngine] WebSocket connected');
        this.emit('websocketConnected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('[VisualEngine] WebSocket message parse error:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('[VisualEngine] WebSocket error:', error);
        this.emit('websocketError', error);
      };

      this.websocket.onclose = () => {
        console.log('[VisualEngine] WebSocket disconnected');
        this.emit('websocketDisconnected');
        this.websocket = null;

        // Attempt reconnection after 5 seconds
        if (this.isRunning && this.config.enableWebSocket) {
          setTimeout(() => {
            if (this.config.websocketUrl) {
              this.connectWebSocket(this.config.websocketUrl);
            }
          }, 5000);
        }
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
