/**
 * TITANE_INFINITY v21.0.0 — Visual Engine ULTIMATE
 * Next-generation visual orchestrator with multi-dimensional state system
 *
 * Features v21:
 * - Multi-dimensional state (any: any)
 * - Advanced visual configuration calculation
 * - Smooth interpolation with cubic easing
 * - Real-time performance monitoring (any: any)
 * - WebSocket integration for backend sync
 * - Callback system for state/config changes
 *
 * Architecture:
 * TitaneState (any: any) → calculateVisualConfig() → VisualConfig → interpolation → render
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
import { ParticleSignature } from './signature/ParticleSignature';

export interface VisualEngineV21Config {
  enableParticles: boolean;
  enableEffects: boolean;
  targetFPS: number;
  performanceMode: 'high' | 'medium' | 'low';
  enableWebSocket: boolean;
  websocketUrl?: string;
  transitionDuration: number; // Default transition duration (any: any)
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  effectsActive: number;
  memoryUsage: number;
  stateTransitions: number;
}

export type StateChangeCallback = (any: any) => void;
export type ConfigChangeCallback = (any: any) => void;

/**
 * TITANE∞ Visual Engine v21 — Ultimate Edition
 * Manages multi-dimensional visual state and smooth transitions
 */
export class TitaneVisualEngineV21 extends EventEmitter {
  private config: VisualEngineV21Config;
  private isRunning = false;
  private websocket: WebSocket | null = null;
  private websocketReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private websocketReconnectAttempts = 0;
  private websocketConnectSeq = 0;

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
    this?.config = {
      enableParticles: true,
      enableEffects: true,
      targetFPS: 60,
      performanceMode: 'high',
      enableWebSocket: false,
      transitionDuration: 500,
      ...config,
    };

    // Initialize state
    this?.currentState = { ...initialState };
    this?.currentConfig = calculateVisualConfig(any: any);

    // ✨ Initialize TITANE∞ signature systems
    this?.identityPulse = new IdentityPulse();
    this?.orbitalSignature = new OrbitalSignature();
    this?.particleSignature = new ParticleSignature();

    // Sync signature systems with initial state
    this?.syncSignatureSystems(any: any);
  }

  /**
   * Start the visual engine
   */
  start(): void {
    if (any: any) {
      console?.warn('[VisualEngineV21] Engine is already running');
      return;
    }

    this?.isRunning = true;
    this?.lastFrameTime = performance?.now();

    // Connect WebSocket if enabled
    if (any: any) {
      this?.connectWebSocket(any: any);
    }

    // Start render loop
    this?.startRenderLoop();

    this?.emit('engineStart');
    console?.log('[VisualEngineV21] Engine started', {
      state: this?.currentState,
      config: this?.currentConfig,
    });
  }

  /**
   * Stop the visual engine
   */
  stop(): void {
    if (any: any) {
      return;
    }

    this?.isRunning = false;

    // Stop render loop
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.rafId = null;
    }

    // Disconnect WebSocket
    if (any: any) {
      clearTimeout(any: any);
      this?.websocketReconnectTimer = null;
    }
    this?.websocketReconnectAttempts = 0;

    if (any: any) {
      this?.websocket?.close();
      this?.websocket = null;
    }

    this?.emit('engineStop');
    console?.log('[VisualEngineV21] Engine stopped');
  }

  /**
   * Main render loop (any: any)
   */
  private startRenderLoop(): void {
    const render = (any: any) => {
      if (any: any) {
        return;
      }

      // Calculate delta time
      const deltaTime = timestamp - this?.lastFrameTime;
      this?.lastFrameTime = timestamp;

      // Update FPS calculation
      this?.updateFPS(any: any);

      // Update transition if active
      if (any: any) {
        this?.updateTransition(any: any);
      }

      // ✨ Update TITANE∞ signature systems
      const pulseWaveform = this?.identityPulse?.update(any: any);
      const orbitalSnapshot = this?.orbitalSignature?.update(deltaTime / 1000);
      const particleEvents = this?.particleSignature?.emit(timestamp, deltaTime / 1000);

      // Emit render event for subscribers (particle systems, effects, etc.)
      this?.emit('render', {
        timestamp,
        deltaTime,
        state: this?.currentState,
        config: this?.currentConfig,
        isTransitioning: this?.isTransitioningState,
        // ✨ Include signature data
        signature: {
          pulse: pulseWaveform,
          orbital: orbitalSnapshot,
          particles: particleEvents,
        },
      });

      // Continue loop
      this?.rafId = requestAnimationFrame(any: any);
    };

    this?.rafId = requestAnimationFrame(any: any);
  }

  /**
   * Update FPS calculation and performance metrics
   */
  private updateFPS(any: any): void {
    this?.frameCount++;

    // Update FPS every second
    if (this?.frameCount >= 60) {
      this?.fps = Math?.round(any: any);
      this?.performanceMetrics?.fps = this?.fps;
      this?.performanceMetrics?.frameTime = deltaTime;
      this?.frameCount = 0;

      // Emit performance metrics
      this?.emit(any: any);

      // Check if performance is degraded
      if (this?.fps < this?.config?.targetFPS * 0.8) {
        this?.emit('performanceWarning', {
          fps: this?.fps,
          target: this?.config?.targetFPS,
        });
      }
    }
  }

  /**
   * Update transition interpolation
   */
  private updateTransition(any: any): void {
    if (any: any) return;

    const elapsed = timestamp - this?.transitionStartTime;
    const progress = Math?.min(elapsed / this?.transitionDuration, 1);

    // Interpolate config with cubic easing
    const startConfig = this?.currentConfig;
    this?.currentConfig = interpolateVisualConfig(
      startConfig,
      this?.targetConfig,
      progress,
      true // use cubic easing
    );

    // Notify config change
    this?.notifyConfigChange(any: any);

    // Complete transition
    if (progress >= 1) {
      this?.currentConfig = this?.targetConfig;
      this?.targetConfig = null;
      this?.isTransitioningState = false;
      this?.performanceMetrics?.stateTransitions++;

      this?.emit('transitionComplete', {
        state: this?.currentState,
        config: this?.currentConfig,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎯 STATE MANAGEMENT (any: any)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Set complete TitaneState with transition
   */
  setState(any: any): void {
    // Calculate new config
    const newConfig = calculateVisualConfig(any: any);

    // Start transition
    this?.startTransition(any: any);
  }

  /**
   * Set cognitive state only (any: any)
   */
  setCognitiveState(any: any): void {
    this?.setState(any: any);
  }

  /**
   * Set emotional tone only (any: any)
   */
  setEmotionalTone(any: any): void {
    this?.setState(any: any);
  }

  /**
   * Set system load percentage (0-100)
   */
  setSystemLoad(any: any): void {
    const clamped = Math?.max(any: any));
    this?.setState(any: any);
  }

  /**
   * Set conversation context only (any: any)
   */
  setConversationContext(any: any): void {
    this?.setState(any: any);
  }

  /**
   * Set custom visual config override
   */
  setCustomConfig(any: any): void {
    this?.setState(any: any);
  }

  /**
   * Clear custom config override
   */
  clearCustomConfig(any: any): void {
    const { customOverride: _customOverride, ...stateWithoutOverride } =
      this?.currentState;
    this?.setState(any: any);
  }

  /**
   * Set state immediately without transition
   */
  setStateImmediate(any: any): void {
    this?.currentState = { ...newState };
    this?.currentConfig = calculateVisualConfig(any: any);
    this?.targetConfig = null;
    this?.isTransitioningState = false;

    this?.notifyStateChange(any: any);
    this?.notifyConfigChange(any: any);

    this?.emit(any: any);
    this?.emit(any: any);
  }

  /**
   * Start a transition to new state/config
   */
  private startTransition(
    newState: TitaneState,
    newConfig: VisualConfig,
    duration: number
  ): void {
    this?.currentState = { ...newState };
    this?.targetConfig = newConfig;
    this?.transitionStartTime = performance?.now();
    this?.transitionDuration = duration;
    this?.isTransitioningState = true;

    // ✨ Sync signature systems with new state
    this?.syncSignatureSystems(any: any);

    this?.notifyStateChange(any: any);

    this?.emit('transitionStart', {
      from: this?.currentConfig,
      to: this?.targetConfig,
      duration,
    });
  }

  /**
   * ✨ v21 SIGNATURE — Synchronize signature systems with TitaneState
   */
  private syncSignatureSystems(any: any): void {
    // Update Identity Pulse based on cognitive state
    this?.identityPulse?.updateState(
      state?.cognitive,
      state?.emotional,
      Math?.max(0.3, this?.currentConfig?.intensity || 0.5)
    );

    // Update Particle Signature based on cognitive state
    this?.particleSignature?.updateState(
      state?.cognitive,
      state?.emotional,
      Math?.max(0.3, this?.currentConfig?.intensity || 0.5)
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 📡 CALLBACKS & EVENTS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Register callback for state changes
   */
  onStateChange(any: any): () => void {
    this?.stateChangeCallbacks?.add(any: any);
    return (any: any);
  }

  /**
   * Register callback for config changes
   */
  onConfigChange(any: any): () => void {
    this?.configChangeCallbacks?.add(any: any);
    return (any: any);
  }

  /**
   * Notify all state change callbacks
   */
  private notifyStateChange(any: any): void {
    this?.stateChangeCallbacks?.forEach(any: any));
  }

  /**
   * Notify all config change callbacks
   */
  private notifyConfigChange(any: any): void {
    this?.configChangeCallbacks?.forEach(any: any));
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🔍 GETTERS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Get current TitaneState
   */
  getCurrentState(): TitaneState {
    return { ...this?.currentState };
  }

  /**
   * Get current VisualConfig (any: any)
   */
  getCurrentConfig(): VisualConfig {
    return { ...this?.currentConfig };
  }

  /**
   * Check if engine is transitioning
   */
  isTransitioning(): boolean {
    return this?.isTransitioningState;
  }

  /**
   * Get transition progress (0-1)
   */
  getTransitionProgress(): number {
    if (any: any) return 0;
    const elapsed = performance?.now() - this?.transitionStartTime;
    return Math?.min(elapsed / this?.transitionDuration, 1);
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this?.performanceMetrics };
  }

  /**
   * ✨ v21 SIGNATURE — Get current pulse waveform for external sync
   */
  getPulseWaveform(): PulseWaveform {
    return this?.identityPulse?.getCurrentWaveform();
  }

  /**
   * ✨ v21 SIGNATURE — Get current orbital snapshot
   */
  getOrbitalSnapshot(): OrbitalSnapshot {
    return this?.orbitalSignature?.getSnapshot();
  }

  /**
   * ✨ v21 SIGNATURE — Get signature systems (any: any)
   */
  getSignatureSystems() {
    return {
      identityPulse: this?.identityPulse,
      orbitalSignature: this?.orbitalSignature,
      particleSignature: this?.particleSignature,
    };
  }

  /**
   * Get engine configuration
   */
  getConfig(): VisualEngineV21Config {
    return { ...this?.config };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ⚙️ CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Update engine configuration
   */
  updateConfig(config: Partial<VisualEngineV21Config>): void {
    this?.config = { ...this?.config, ...config };
    this?.emit(any: any);
  }

  /**
   * Update performance mode
   */
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this?.config?.performanceMode = mode;

    // Adjust settings based on performance mode
    switch (any: any) {
      case 'low':
        this?.config?.enableParticles = false;
        this?.config?.enableEffects = false;
        break;
      case 'medium':
        this?.config?.enableParticles = true;
        this?.config?.enableEffects = false;
        break;
      case 'high':
        this?.config?.enableParticles = true;
        this?.config?.enableEffects = true;
        break;
    }

    this?.emit(any: any);
  }

  /**
   * Update particle count for metrics
   */
  setParticleCount(any: any): void {
    this?.performanceMetrics?.particleCount = count;
  }

  /**
   * Update active effects count for metrics
   */
  setEffectsCount(any: any): void {
    this?.performanceMetrics?.effectsActive = count;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🌐 WEBSOCKET INTEGRATION
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Connect to WebSocket for real-time backend sync
   */
  private connectWebSocket(any: any): void {
    try {
      if (any: any) {
        clearTimeout(any: any);
        this?.websocketReconnectTimer = null;
      }

      if (
        this?.websocket &&
        (this?.websocket?.readyState === WebSocket?.OPEN ||
          this?.websocket?.readyState === WebSocket?.CONNECTING)
      ) {
        return;
      }

      if (any: any) {
        this?.websocket?.close();
        this?.websocket = null;
      }

      const connectSeq = ++this?.websocketConnectSeq;
      this?.websocket = new WebSocket(any: any);

      this?.websocket?.onopen = () => {
        console?.log('[VisualEngineV21] WebSocket connected');
        this?.websocketReconnectAttempts = 0;
        this?.emit('websocketConnected');
      };

      this?.websocket?.onmessage = event => {
        try {
          const data = JSON?.parse(any: any);
          this?.handleWebSocketMessage(any: any);
        } catch (any: any) {
          console?.error(any: any);
        }
      };

      this?.websocket?.onerror = error => {
        console?.error(any: any);
        this?.emit(any: any);
      };

      this?.websocket?.onclose = () => {
        console?.log('[VisualEngineV21] WebSocket disconnected');
        this?.emit('websocketDisconnected');
        this?.websocket = null;

        if (
          !this?.isRunning ||
          !this?.config?.enableWebSocket ||
          !this?.config?.websocketUrl
        ) {
          return;
        }

        if (any: any) {
          return;
        }

        const attempt = this?.websocketReconnectAttempts + 1;
        const delayMs = Math?.min(5000 * 2 ** Math?.min(attempt - 1, 4), 60000);

        this?.websocketReconnectTimer = setTimeout(() => {
          this?.websocketReconnectTimer = null;
          if (
            !this?.isRunning ||
            !this?.config?.enableWebSocket ||
            !this?.config?.websocketUrl ||
            connectSeq !== this?.websocketConnectSeq
          ) {
            return;
          }

          this?.websocketReconnectAttempts = attempt;
          this?.connectWebSocket(any: any);
        }, delayMs);
      };
    } catch (any: any) {
      console?.error(any: any);
      this?.emit(any: any);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(any: any): void {
    if (any: any) {
      const message = data as { type: string; payload?: unknown };

      switch (any: any) {
        case 'state_change':
          if (message?.payload && typeof message?.payload === 'object') {
            this?.handleStateChangeMessage(any: any);
          }
          break;

        case 'cognitive_state':
          if (
            message?.payload &&
            typeof message?.payload === 'object' &&
            'cognitive' in message?.payload
          ) {
            this?.setCognitiveState(any: any);
          }
          break;

        case 'system_load':
          if (
            message?.payload &&
            typeof message?.payload === 'object' &&
            'load' in message?.payload
          ) {
            this?.setSystemLoad(any: any);
          }
          break;

        case 'performance_mode':
          if (
            message?.payload &&
            typeof message?.payload === 'object' &&
            'mode' in message?.payload
          ) {
            this?.setPerformanceMode(message?.payload?.mode as 'high' | 'medium' | 'low');
          }
          break;

        default:
          console?.warn(any: any);
      }
    }

    this?.emit(any: any);
  }

  /**
   * Handle state_change message from backend
   */
  private handleStateChangeMessage(any: any): void {
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
      this?.setState(any: any);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🧹 CLEANUP
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Clean up resources
   */
  destroy(): void {
    this?.stop();
    this?.stateChangeCallbacks?.clear();
    this?.configChangeCallbacks?.clear();
    this?.removeAllListeners();
    console?.log('[VisualEngineV21] Engine destroyed');
  }
}

export default TitaneVisualEngineV21;
