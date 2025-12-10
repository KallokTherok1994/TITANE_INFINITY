/**
 * TITANE_INFINITY v21.0.0 — Visual Engine ULTIMATE
 * Next-generation visual orchestrator with multi-dimensional state system
 *
 * Features v21:
 * - Multi-dimensional state (Cognitive + Emotional + Load + Context)
 * - Advanced visual configuration calculation
 * - Smooth interpolation with cubic easing
 * - Real-time performance monitoring (60fps target)
 * - WebSocket integration for backend sync
 * - Callback system for state/config changes
 *
 * Architecture:
 * TitaneState (multi-dim) → calculateVisualConfig() → VisualConfig → interpolation → render
 */

import EventEmitter from 'eventemitter3';
import {
  TitaneState,
  VisualConfig,
  CognitiveState,
  EmotionalTone,
  ConversationContext,
  calculateVisualConfig,
  interpolateVisualConfig,
} from '@/design-system/visual-states';
import { IdentityPulse, type PulseWaveform } from './signature/IdentityPulse';
import { OrbitalSignature, type OrbitalSnapshot } from './signature/OrbitalSignature';
import {
  ParticleSignature,
  type ParticleEmissionEvent,
} from './signature/ParticleSignature';

export interface VisualEngineV21Config {
  enableParticles: boolean;
  enableEffects: boolean;
  targetFPS: number;
  performanceMode: 'high' | 'medium' | 'low';
  enableWebSocket: boolean;
  websocketUrl?: string;
  transitionDuration: number; // Default transition duration (ms)
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  effectsActive: number;
  memoryUsage: number;
  stateTransitions: number;
}

export type StateChangeCallback = (state: TitaneState) => void;
export type ConfigChangeCallback = (config: VisualConfig) => void;

/**
 * TITANE∞ Visual Engine v21 — Ultimate Edition
 * Manages multi-dimensional visual state and smooth transitions
 */
export class TitaneVisualEngineV21 extends EventEmitter {
  private config: VisualEngineV21Config;
  private isRunning = false;
  private websocket: WebSocket | null = null;

  // State management
  private currentState: TitaneState;
  private currentConfig: VisualConfig;
  private targetConfig: VisualConfig | null = null;
  private transitionStartTime = 0;
  private transitionDuration = 0;
  private isTransitioningState = false;

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
    stateTransitions: 0,
  };

  // Animation frame ID
  private rafId: number | null = null;

  // Callbacks
  private stateChangeCallbacks: Set<StateChangeCallback> = new Set();
  private configChangeCallbacks: Set<ConfigChangeCallback> = new Set();

  // ✨ v21 SIGNATURE VISUELLE — TITANE∞ Polish Phase
  private identityPulse: IdentityPulse;
  private orbitalSignature: OrbitalSignature;
  private particleSignature: ParticleSignature;

  constructor(initialState: TitaneState, config: Partial<VisualEngineV21Config> = {}) {
    super();

    // Initialize configuration with defaults
    this.config = {
      enableParticles: true,
      enableEffects: true,
      targetFPS: 60,
      performanceMode: 'high',
      enableWebSocket: false,
      transitionDuration: 500,
      ...config,
    };

    // Initialize state
    this.currentState = { ...initialState };
    this.currentConfig = calculateVisualConfig(this.currentState);

    // ✨ Initialize TITANE∞ signature systems
    this.identityPulse = new IdentityPulse();
    this.orbitalSignature = new OrbitalSignature();
    this.particleSignature = new ParticleSignature();

    // Sync signature systems with initial state
    this.syncSignatureSystems(this.currentState);
  }

  /**
   * Start the visual engine
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[VisualEngineV21] Engine is already running');
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
    console.log('[VisualEngineV21] Engine started', {
      state: this.currentState,
      config: this.currentConfig,
    });
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
    console.log('[VisualEngineV21] Engine stopped');
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

      // Update transition if active
      if (this.isTransitioningState && this.targetConfig) {
        this.updateTransition(timestamp);
      }

      // ✨ Update TITANE∞ signature systems
      const pulseWaveform = this.identityPulse.update(timestamp);
      const orbitalSnapshot = this.orbitalSignature.update(deltaTime / 1000);
      const particleEvents = this.particleSignature.emit(timestamp, deltaTime / 1000);

      // Emit render event for subscribers (particle systems, effects, etc.)
      this.emit('render', {
        timestamp,
        deltaTime,
        state: this.currentState,
        config: this.currentConfig,
        isTransitioning: this.isTransitioningState,
        // ✨ Include signature data
        signature: {
          pulse: pulseWaveform,
          orbital: orbitalSnapshot,
          particles: particleEvents,
        },
      });

      // Continue loop
      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  /**
   * Update FPS calculation and performance metrics
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
   * Update transition interpolation
   */
  private updateTransition(timestamp: number): void {
    if (!this.targetConfig) return;

    const elapsed = timestamp - this.transitionStartTime;
    const progress = Math.min(elapsed / this.transitionDuration, 1);

    // Interpolate config with cubic easing
    const startConfig = this.currentConfig;
    this.currentConfig = interpolateVisualConfig(
      startConfig,
      this.targetConfig,
      progress,
      true // use cubic easing
    );

    // Notify config change
    this.notifyConfigChange(this.currentConfig);

    // Complete transition
    if (progress >= 1) {
      this.currentConfig = this.targetConfig;
      this.targetConfig = null;
      this.isTransitioningState = false;
      this.performanceMetrics.stateTransitions++;

      this.emit('transitionComplete', {
        state: this.currentState,
        config: this.currentConfig,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎯 STATE MANAGEMENT (v21 Multi-dimensional)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Set complete TitaneState with transition
   */
  setState(newState: TitaneState, duration?: number): void {
    // Calculate new config
    const newConfig = calculateVisualConfig(newState);

    // Start transition
    this.startTransition(newState, newConfig, duration || this.config.transitionDuration);
  }

  /**
   * Set cognitive state only (keep other dimensions)
   */
  setCognitiveState(cognitive: CognitiveState, duration?: number): void {
    this.setState({ ...this.currentState, cognitive }, duration);
  }

  /**
   * Set emotional tone only (keep other dimensions)
   */
  setEmotionalTone(emotional: EmotionalTone, duration?: number): void {
    this.setState({ ...this.currentState, emotional }, duration);
  }

  /**
   * Set system load percentage (0-100)
   */
  setSystemLoad(systemLoad: number, duration?: number): void {
    const clamped = Math.max(0, Math.min(100, systemLoad));
    this.setState({ ...this.currentState, systemLoad: clamped }, duration);
  }

  /**
   * Set conversation context only (keep other dimensions)
   */
  setConversationContext(context: ConversationContext, duration?: number): void {
    this.setState({ ...this.currentState, conversationContext: context }, duration);
  }

  /**
   * Set custom visual config override
   */
  setCustomConfig(override: Partial<VisualConfig>, duration?: number): void {
    this.setState({ ...this.currentState, customOverride: override }, duration);
  }

  /**
   * Clear custom config override
   */
  clearCustomConfig(duration?: number): void {
    const { customOverride: _customOverride, ...stateWithoutOverride } =
      this.currentState;
    this.setState(stateWithoutOverride, duration);
  }

  /**
   * Set state immediately without transition
   */
  setStateImmediate(newState: TitaneState): void {
    this.currentState = { ...newState };
    this.currentConfig = calculateVisualConfig(newState);
    this.targetConfig = null;
    this.isTransitioningState = false;

    this.notifyStateChange(this.currentState);
    this.notifyConfigChange(this.currentConfig);

    this.emit('stateChange', this.currentState);
    this.emit('configChange', this.currentConfig);
  }

  /**
   * Start a transition to new state/config
   */
  private startTransition(
    newState: TitaneState,
    newConfig: VisualConfig,
    duration: number
  ): void {
    this.currentState = { ...newState };
    this.targetConfig = newConfig;
    this.transitionStartTime = performance.now();
    this.transitionDuration = duration;
    this.isTransitioningState = true;

    // ✨ Sync signature systems with new state
    this.syncSignatureSystems(newState);

    this.notifyStateChange(this.currentState);

    this.emit('transitionStart', {
      from: this.currentConfig,
      to: this.targetConfig,
      duration,
    });
  }

  /**
   * ✨ v21 SIGNATURE — Synchronize signature systems with TitaneState
   */
  private syncSignatureSystems(state: TitaneState): void {
    // Update Identity Pulse based on cognitive state
    this.identityPulse.updateState(
      state.cognitive,
      state.emotional,
      Math.max(0.3, this.currentConfig.intensity || 0.5)
    );

    // Update Particle Signature based on cognitive state
    this.particleSignature.updateState(
      state.cognitive,
      state.emotional,
      Math.max(0.3, this.currentConfig.intensity || 0.5)
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 📡 CALLBACKS & EVENTS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Register callback for state changes
   */
  onStateChange(callback: StateChangeCallback): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  }

  /**
   * Register callback for config changes
   */
  onConfigChange(callback: ConfigChangeCallback): () => void {
    this.configChangeCallbacks.add(callback);
    return () => this.configChangeCallbacks.delete(callback);
  }

  /**
   * Notify all state change callbacks
   */
  private notifyStateChange(state: TitaneState): void {
    this.stateChangeCallbacks.forEach(cb => cb(state));
  }

  /**
   * Notify all config change callbacks
   */
  private notifyConfigChange(config: VisualConfig): void {
    this.configChangeCallbacks.forEach(cb => cb(config));
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🔍 GETTERS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get current TitaneState
   */
  getCurrentState(): TitaneState {
    return { ...this.currentState };
  }

  /**
   * Get current VisualConfig (interpolated during transitions)
   */
  getCurrentConfig(): VisualConfig {
    return { ...this.currentConfig };
  }

  /**
   * Check if engine is transitioning
   */
  isTransitioning(): boolean {
    return this.isTransitioningState;
  }

  /**
   * Get transition progress (0-1)
   */
  getTransitionProgress(): number {
    if (!this.isTransitioningState || !this.targetConfig) return 0;
    const elapsed = performance.now() - this.transitionStartTime;
    return Math.min(elapsed / this.transitionDuration, 1);
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * ✨ v21 SIGNATURE — Get current pulse waveform for external sync
   */
  getPulseWaveform(): PulseWaveform {
    return this.identityPulse.getCurrentWaveform();
  }

  /**
   * ✨ v21 SIGNATURE — Get current orbital snapshot
   */
  getOrbitalSnapshot(): OrbitalSnapshot {
    return this.orbitalSignature.getSnapshot();
  }

  /**
   * ✨ v21 SIGNATURE — Get signature systems (for advanced integrations)
   */
  getSignatureSystems() {
    return {
      identityPulse: this.identityPulse,
      orbitalSignature: this.orbitalSignature,
      particleSignature: this.particleSignature,
    };
  }

  /**
   * Get engine configuration
   */
  getConfig(): VisualEngineV21Config {
    return { ...this.config };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ⚙️ CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<VisualEngineV21Config>): void {
    this.config = { ...this.config, ...config };
    this.emit('configUpdate', this.config);
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

  // ═══════════════════════════════════════════════════════════════════
  // 🌐 WEBSOCKET INTEGRATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Connect to WebSocket for real-time backend sync
   */
  private connectWebSocket(url: string): void {
    try {
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        console.log('[VisualEngineV21] WebSocket connected');
        this.emit('websocketConnected');
      };

      this.websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('[VisualEngineV21] WebSocket message parse error:', error);
        }
      };

      this.websocket.onerror = error => {
        console.error('[VisualEngineV21] WebSocket error:', error);
        this.emit('websocketError', error);
      };

      this.websocket.onclose = () => {
        console.log('[VisualEngineV21] WebSocket disconnected');
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
      console.error('[VisualEngineV21] WebSocket connection error:', error);
      this.emit('websocketError', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: unknown): void {
    if (typeof data === 'object' && data !== null && 'type' in data) {
      const message = data as { type: string; payload?: unknown };

      switch (message.type) {
        case 'state_change':
          if (message.payload && typeof message.payload === 'object') {
            this.handleStateChangeMessage(message.payload);
          }
          break;

        case 'cognitive_state':
          if (
            message.payload &&
            typeof message.payload === 'object' &&
            'cognitive' in message.payload
          ) {
            this.setCognitiveState(message.payload.cognitive as CognitiveState);
          }
          break;

        case 'system_load':
          if (
            message.payload &&
            typeof message.payload === 'object' &&
            'load' in message.payload
          ) {
            this.setSystemLoad(message.payload.load as number);
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
          console.warn('[VisualEngineV21] Unknown WebSocket message type:', message.type);
      }
    }

    this.emit('websocketMessage', data);
  }

  /**
   * Handle state_change message from backend
   */
  private handleStateChangeMessage(payload: unknown): void {
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'cognitive' in payload &&
      'emotional' in payload &&
      'systemLoad' in payload &&
      'conversationContext' in payload
    ) {
      const newState: TitaneState = {
        cognitive: (payload as { cognitive: string }).cognitive as CognitiveState,
        emotional: (payload as { emotional: string }).emotional as EmotionalTone,
        systemLoad: (payload as { systemLoad: number }).systemLoad,
        conversationContext: (payload as { conversationContext: string })
          .conversationContext as ConversationContext,
      };
      this.setState(newState);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🧹 CLEANUP
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.stateChangeCallbacks.clear();
    this.configChangeCallbacks.clear();
    this.removeAllListeners();
    console.log('[VisualEngineV21] Engine destroyed');
  }
}

export default TitaneVisualEngineV21;
