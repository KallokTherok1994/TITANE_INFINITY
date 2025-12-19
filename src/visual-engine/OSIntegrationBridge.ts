/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - OS Integration Bridge
 * Connecte le Visual Engine avec TITANE∞ OS Kernels
 *
 * Responsabilités:
 * - Recevoir états cognitifs (Kernel #1)
 * - Recevoir états émotionnels (Kernel #2)
 * - Recevoir métriques mémoire (Kernel #3)
 * - Recevoir status pipeline OMEGA (#1→#10)
 * - Propager vers TitaneVisualEngine
 * - Synchroniser avec EffectsOrchestrator
 * - Gérer WebSocket/EventSource connections
 * ═══════════════════════════════════════════════════════════════
 */

import type { TitaneVisualEngine } from './TitaneVisualEngine';
import type { EffectsOrchestrator } from './EffectsOrchestrator';
import type { VisualState } from './StateManager';

// ─────────────────────────────────────────────────────────────────
// TYPES - OS STATE
// ─────────────────────────────────────────────────────────────────

export interface CognitiveState {
  mode: 'focus' | 'creative' | 'analytical' | 'rest' | 'learning';
  intensity: number; // 0-1
  confidence: number; // 0-1
  loadLevel: number; // 0-1
  activeKernels: string[]; // ['kernel_1', 'kernel_2', ...]
  timestamp: number;
}

export interface EmotionalState {
  primary: 'calm' | 'excited' | 'stressed' | 'curious' | 'satisfied' | 'frustrated';
  valence: number; // -1 (negative) to 1 (positive)
  arousal: number; // 0 (low) to 1 (high)
  dominance: number; // 0 (low) to 1 (high)
  timestamp: number;
}

export interface MemoryMetrics {
  usagePercent: number; // 0-100
  vectorStoreSize: number; // bytes
  activeConnections: number;
  compressionRatio: number;
  retrievalLatency: number; // ms
  timestamp: number;
}

export interface PipelineStatus {
  stage: string; // 'input' | 'processing' | 'output' | 'idle'
  kernels: Record<
    string,
    {
      active: boolean;
      load: number; // 0-1
      latency: number; // ms
    }
  >;
  throughput: number; // ops/sec
  errorRate: number; // 0-1
  timestamp: number;
}

export interface SystemHealth {
  cpu: number; // 0-1
  memory: number; // 0-1
  disk: number; // 0-1
  network: number; // 0-1
  temperature: number; // celsius
  timestamp: number;
}

export interface OSState {
  cognitive: CognitiveState | null;
  emotional: EmotionalState | null;
  memory: MemoryMetrics | null;
  pipeline: PipelineStatus | null;
  health: SystemHealth | null;
}

// ─────────────────────────────────────────────────────────────────
// TYPES - BRIDGE CONFIG
// ─────────────────────────────────────────────────────────────────

export interface BridgeConfig {
  websocketUrl?: string;
  pollInterval?: number; // ms
  enableAutoEffects?: boolean; // trigger effects based on state
  debug?: boolean;
}

export interface BridgeMetrics {
  connected: boolean;
  messagesReceived: number;
  messagesProcessed: number;
  lastUpdateTime: number;
  reconnectAttempts: number;
}

// ─────────────────────────────────────────────────────────────────
// OS INTEGRATION BRIDGE CLASS
// ─────────────────────────────────────────────────────────────────

export class OSIntegrationBridge {
  private visualEngine: TitaneVisualEngine | null = null;
  private effectsOrchestrator: EffectsOrchestrator | null = null;

  private osState: OSState = {
    cognitive: null,
    emotional: null,
    memory: null,
    pipeline: null,
    health: null,
  };

  private config: Required<BridgeConfig> = {
    // Disabled by default (Tauri-only, local-first). Provide a URL explicitly to enable.
    websocketUrl: '',
    pollInterval: 1000,
    enableAutoEffects: true,
    debug: false,
  };

  private metrics: BridgeMetrics = {
    connected: false,
    messagesReceived: 0,
    messagesProcessed: 0,
    lastUpdateTime: 0,
    reconnectAttempts: 0,
  };

  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  private shouldReconnect = false;

  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  constructor(config?: BridgeConfig) {
    if (config) {
      const merged = { ...this.config, ...config };
      // Avoid overriding defaults with `undefined` when callers spread env vars.
      if (config.websocketUrl === undefined) {
        merged.websocketUrl = this.config.websocketUrl;
      }
      this.config = merged;
    }
  }

  /**
   * Initialize bridge with engines
   */
  public initialize(
    visualEngine: TitaneVisualEngine,
    effectsOrchestrator: EffectsOrchestrator
  ): void {
    this.visualEngine = visualEngine;
    this.effectsOrchestrator = effectsOrchestrator;

    if (this.config.debug) {
      console.log('[OSIntegrationBridge] Initialized with engines');
    }

    // Start connection attempt
    this.connect();
  }

  /**
   * Connect to TITANE∞ OS
   */
  public connect(): void {
    this.shouldReconnect = true;

    if (!this.config.websocketUrl) {
      if (this.config.debug) {
        console.log('[OSIntegrationBridge] No OS endpoint configured; skipping connect');
      }
      return;
    }

    if (this.config.websocketUrl.startsWith('ws')) {
      this.connectWebSocket();
    } else {
      this.startPolling();
    }
  }

  /**
   * Disconnect from TITANE∞ OS
   */
  public disconnect(): void {
    this.shouldReconnect = false;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.metrics.connected = false;

    if (this.config.debug) {
      console.log('[OSIntegrationBridge] Disconnected');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // STATE UPDATES (Manual API)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Update cognitive state
   */
  public updateCognitiveState(state: CognitiveState): void {
    this.osState.cognitive = state;
    this.metrics.messagesReceived++;
    this.metrics.lastUpdateTime = Date.now();

    // Propagate to visual engine
    if (this.visualEngine) {
      const visualState = this.mapCognitiveToVisualState(state);
      this.visualEngine.setState(visualState);
    }

    // Trigger adaptive effects
    if (this.config.enableAutoEffects && this.effectsOrchestrator) {
      this.triggerCognitiveEffects(state);
    }

    this.emit('cognitive', state);
    this.metrics.messagesProcessed++;
  }

  /**
   * Update emotional state
   */
  public updateEmotionalState(state: EmotionalState): void {
    this.osState.emotional = state;
    this.metrics.messagesReceived++;
    this.metrics.lastUpdateTime = Date.now();

    // Propagate to effects orchestrator
    if (this.config.enableAutoEffects && this.effectsOrchestrator) {
      this.triggerEmotionalEffects(state);
    }

    this.emit('emotional', state);
    this.metrics.messagesProcessed++;
  }

  /**
   * Update memory metrics
   */
  public updateMemoryMetrics(metrics: MemoryMetrics): void {
    this.osState.memory = metrics;
    this.metrics.messagesReceived++;
    this.metrics.lastUpdateTime = Date.now();

    // Visual feedback for high memory usage
    if (metrics.usagePercent > 80 && this.effectsOrchestrator) {
      this.effectsOrchestrator.requestEffect({
        type: 'glitchEffect',
        priority: 'high',
        duration: 300,
      });
    }

    this.emit('memory', metrics);
    this.metrics.messagesProcessed++;
  }

  /**
   * Update pipeline status
   */
  public updatePipelineStatus(status: PipelineStatus): void {
    this.osState.pipeline = status;
    this.metrics.messagesReceived++;
    this.metrics.lastUpdateTime = Date.now();

    this.emit('pipeline', status);
    this.metrics.messagesProcessed++;
  }

  /**
   * Update system health
   */
  public updateSystemHealth(health: SystemHealth): void {
    this.osState.health = health;
    this.metrics.messagesReceived++;
    this.metrics.lastUpdateTime = Date.now();

    // Visual feedback for critical health
    if ((health.cpu > 0.9 || health.memory > 0.9) && this.effectsOrchestrator) {
      this.effectsOrchestrator.requestEffect({
        type: 'glitchEffect',
        priority: 'critical',
        duration: 500,
      });
    }

    this.emit('health', health);
    this.metrics.messagesProcessed++;
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────

  public getOSState(): OSState {
    return { ...this.osState };
  }

  public getMetrics(): BridgeMetrics {
    return { ...this.metrics };
  }

  public isConnected(): boolean {
    return this.metrics.connected;
  }

  // ─────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────

  public on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(callback);
    }
  }

  public off(event: string, callback: (data: unknown) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - CONNECTION
  // ─────────────────────────────────────────────────────────────────

  private connectWebSocket(): void {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.ws = new WebSocket(this.config.websocketUrl);

      this.ws.onopen = () => {
        this.metrics.connected = true;
        this.metrics.reconnectAttempts = 0;

        if (this.config.debug) {
          console.log('[OSIntegrationBridge] WebSocket connected');
        }

        this.emit('connected', null);
      };

      this.ws.onmessage = event => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[OSIntegrationBridge] Failed to parse message:', error);
        }
      };

      this.ws.onerror = error => {
        console.error('[OSIntegrationBridge] WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        this.metrics.connected = false;

        if (this.config.debug) {
          console.log('[OSIntegrationBridge] WebSocket closed');
        }

        this.emit('disconnected', null);

        if (!this.shouldReconnect) {
          return;
        }

        // Attempt reconnect (bounded exponential backoff)
        const attempt = this.metrics.reconnectAttempts + 1;
        const delayMs = Math.min(5000 * 2 ** Math.min(attempt - 1, 4), 60000);

        this.reconnectTimer = setTimeout(() => {
          this.metrics.reconnectAttempts = attempt;
          if (this.config.debug) {
            console.log('[OSIntegrationBridge] Reconnect attempt', attempt, { delayMs });
          }
          this.connectWebSocket();
        }, delayMs);
      };
    } catch (error) {
      console.error('[OSIntegrationBridge] Failed to create WebSocket:', error);
      this.emit('error', error);
    }
  }

  private startPolling(): void {
    this.pollTimer = setInterval(() => {
      // IMPLEMENTATION: Polling logic to fetch OS state from REST API
      // 1. Endpoint: fetch('http://localhost:7890/api/os/state') or config.apiEndpoint
      // 2. Response: JSON { cpu_usage, memory_usage, disk_usage, network_stats, processes }
      // 3. Parse and update: this.updateOSState(data) to trigger state change events
      // 4. Error handling: Exponential backoff on failure, max 5 retries
      // 5. Timeout: 5s request timeout to avoid blocking
      // 6. Authentication: Optional API key in headers for secure environments
      if (this.config.debug) {
        console.log('[OSIntegrationBridge] Polling for OS state...');
      }
    }, this.config.pollInterval);
  }

  private handleMessage(message: { type: string; data: unknown }): void {
    switch (message.type) {
      case 'cognitive':
        this.updateCognitiveState(message.data as CognitiveState);
        break;
      case 'emotional':
        this.updateEmotionalState(message.data as EmotionalState);
        break;
      case 'memory':
        this.updateMemoryMetrics(message.data as MemoryMetrics);
        break;
      case 'pipeline':
        this.updatePipelineStatus(message.data as PipelineStatus);
        break;
      case 'health':
        this.updateSystemHealth(message.data as SystemHealth);
        break;
      default:
        if (this.config.debug) {
          console.warn('[OSIntegrationBridge] Unknown message type:', message.type);
        }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - STATE MAPPING
  // ─────────────────────────────────────────────────────────────────

  private mapCognitiveToVisualState(cognitive: CognitiveState): VisualState {
    // Map cognitive mode to visual state (return string directly)
    const stateMap: Record<CognitiveState['mode'], VisualState> = {
      focus: 'thinking', // Map to available VisualState values
      creative: 'quantum',
      analytical: 'processing',
      rest: 'idle',
      learning: 'thinking', // learning mode → thinking visual state
    };

    return stateMap[cognitive.mode] || 'idle';
  }

  private triggerCognitiveEffects(state: CognitiveState): void {
    if (!this.effectsOrchestrator) return;

    // High cognitive load → energy arcs
    if (state.loadLevel > 0.7) {
      this.effectsOrchestrator.requestEffect({
        type: 'energyArcs',
        priority: 'high',
      });
    }

    // Creative mode → spiral patterns
    if (state.mode === 'creative' && state.intensity > 0.6) {
      this.effectsOrchestrator.requestEffect({
        type: 'spiralPattern',
        priority: 'medium',
      });
    }

    // Focus mode → particles burst
    if (state.mode === 'focus' && state.intensity > 0.7) {
      this.effectsOrchestrator.requestEffect({
        type: 'particlesBurst',
        priority: 'high',
      });
    }
  }

  private triggerEmotionalEffects(state: EmotionalState): void {
    if (!this.effectsOrchestrator) return;

    // Calm → healing waves
    if (state.primary === 'calm' && state.valence > 0.5) {
      this.effectsOrchestrator.requestEffect({
        type: 'healingWaves',
        priority: 'medium',
      });
    }

    // Stressed → glitch
    if (state.primary === 'stressed' || state.arousal > 0.8) {
      this.effectsOrchestrator.requestEffect({
        type: 'glitchEffect',
        priority: 'high',
        duration: 400,
      });
    }

    // Excited → energy arcs
    if (state.primary === 'excited' && state.arousal > 0.7) {
      this.effectsOrchestrator.requestEffect({
        type: 'energyArcs',
        priority: 'high',
      });
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error('[OSIntegrationBridge] Listener error:', error);
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const osIntegrationBridge = new OSIntegrationBridge({
  debug: import.meta.env.DEV,
  websocketUrl:
    import.meta.env.VITE_TITANE_OS_WS_URL ?? import.meta.env.VITE_OS_WS_URL ?? '',
});
