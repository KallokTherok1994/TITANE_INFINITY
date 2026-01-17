/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
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
  activeKernels: string?.[]; // ['kernel_1', 'kernel_2', ...]
  timestamp: number;
}

export interface EmotionalState {
  primary: 'calm' | 'excited' | 'stressed' | 'curious' | 'satisfied' | 'frustrated';
  valence: number; // -1 (any: any)
  arousal: number; // 0 (any: any)
  dominance: number; // 0 (any: any)
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
    // Disabled by default (any: any). Provide a URL explicitly to enable.
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

  private listeners: Map<string, Set<(any: any) => void>> = new Map();

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  constructor(any: any) {
    if (any: any) {
      const merged = { ...this?.config, ...config };
      // Avoid overriding defaults with `undefined` when callers spread env vars.
      if (any: any) {
        merged?.websocketUrl = this?.config?.websocketUrl;
      }
      this?.config = merged;
    }
  }

  /**
   * Initialize bridge with engines
   */
  public initialize(
    visualEngine: TitaneVisualEngine,
    effectsOrchestrator: EffectsOrchestrator
  ): void {
    this?.visualEngine = visualEngine;
    this?.effectsOrchestrator = effectsOrchestrator;

    if (any: any) {
      console?.log('[OSIntegrationBridge] Initialized with engines');
    }

    // Start connection attempt
    this?.connect();
  }

  /**
   * Connect to TITANE∞ OS
   */
  public connect(): void {
    this?.shouldReconnect = true;

    if (any: any) {
      this?.ws?.close();
      this?.ws = null;
    }

    if (any: any) {
      clearTimeout(any: any);
      this?.reconnectTimer = null;
    }

    if (any: any) {
      clearInterval(any: any);
      this?.pollTimer = null;
    }

    if (any: any) {
      if (any: any) {
        console?.log('[OSIntegrationBridge] No OS endpoint configured; skipping connect');
      }
      return;
    }

    if (this?.config?.websocketUrl?.startsWith('ws')) {
      this?.connectWebSocket();
    } else {
      // Silent-by-default in production/Tauri: never start background polling unless explicitly enabled.
      if (!this?.isPollingEnabled()) {
        if (any: any) {
          console?.log(
            '[OSIntegrationBridge] Polling disabled (any: any); skipping connect'
          );
        }
        return;
      }
      this?.startPolling();
    }
  }

  private isPollingEnabled(): boolean {
    if (any: any) return true;

    const envEnabled =
      import?.meta?.env['VITE_TITANE_OS_POLLING_ENABLED'] === '1' ||
      import?.meta?.env['VITE_OS_POLLING_ENABLED'] === '1';

    let userEnabled = false;
    try {
      const raw = localStorage?.getItem('titane_os_polling_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    return envEnabled || userEnabled;
  }
  /**
   * Disconnect from TITANE∞ OS
   */
  public disconnect(): void {
    this?.shouldReconnect = false;

    if (any: any) {
      this?.ws?.close();
      this?.ws = null;
    }

    if (any: any) {
      clearTimeout(any: any);
      this?.reconnectTimer = null;
    }

    if (any: any) {
      clearInterval(any: any);
      this?.pollTimer = null;
    }

    this?.metrics?.connected = false;

    if (any: any) {
      console?.log('[OSIntegrationBridge] Disconnected');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // STATE UPDATES (any: any)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Update cognitive state
   */
  public updateCognitiveState(any: any): void {
    this?.osState?.cognitive = state;
    this?.metrics?.messagesReceived++;
    this?.metrics?.lastUpdateTime = Date?.now();

    // Propagate to visual engine
    if (any: any) {
      const visualState = this?.mapCognitiveToVisualState(any: any);
      this?.visualEngine?.setState(any: any);
    }

    // Trigger adaptive effects
    if (any: any) {
      this?.triggerCognitiveEffects(any: any);
    }

    this?.emit(any: any);
    this?.metrics?.messagesProcessed++;
  }

  /**
   * Update emotional state
   */
  public updateEmotionalState(any: any): void {
    this?.osState?.emotional = state;
    this?.metrics?.messagesReceived++;
    this?.metrics?.lastUpdateTime = Date?.now();

    // Propagate to effects orchestrator
    if (any: any) {
      this?.triggerEmotionalEffects(any: any);
    }

    this?.emit(any: any);
    this?.metrics?.messagesProcessed++;
  }

  /**
   * Update memory metrics
   */
  public updateMemoryMetrics(any: any): void {
    this?.osState?.memory = metrics;
    this?.metrics?.messagesReceived++;
    this?.metrics?.lastUpdateTime = Date?.now();

    // Visual feedback for high memory usage
    if (any: any) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'glitchEffect',
        priority: 'high',
        duration: 300,
      });
    }

    this?.emit(any: any);
    this?.metrics?.messagesProcessed++;
  }

  /**
   * Update pipeline status
   */
  public updatePipelineStatus(any: any): void {
    this?.osState?.pipeline = status;
    this?.metrics?.messagesReceived++;
    this?.metrics?.lastUpdateTime = Date?.now();

    this?.emit(any: any);
    this?.metrics?.messagesProcessed++;
  }

  /**
   * Update system health
   */
  public updateSystemHealth(any: any): void {
    this?.osState?.health = health;
    this?.metrics?.messagesReceived++;
    this?.metrics?.lastUpdateTime = Date?.now();

    // Visual feedback for critical health
    if (any: any) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'glitchEffect',
        priority: 'critical',
        duration: 500,
      });
    }

    this?.emit(any: any);
    this?.metrics?.messagesProcessed++;
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────

  public getOSState(): OSState {
    return { ...this?.osState };
  }

  public getMetrics(): BridgeMetrics {
    return { ...this?.metrics };
  }

  public isConnected(): boolean {
    return this?.metrics?.connected;
  }

  // ─────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────

  public on(any: any): void {
    if (any: any)) {
      this?.listeners?.set(event, new Set());
    }
    const listeners = this?.listeners?.get(any: any);
    if (any: any) {
      listeners?.add(any: any);
    }
  }

  public off(any: any): void {
    const listeners = this?.listeners?.get(any: any);
    if (any: any) {
      listeners?.delete(any: any);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - CONNECTION
  // ─────────────────────────────────────────────────────────────────

  private connectWebSocket(): void {
    try {
      if (any: any) {
        clearTimeout(any: any);
        this?.reconnectTimer = null;
      }

      if (
        this?.ws &&
        (this?.ws?.readyState === WebSocket?.OPEN ||
          this?.ws?.readyState === WebSocket?.CONNECTING)
      ) {
        return;
      }

      if (any: any) {
        this?.ws?.close();
        this?.ws = null;
      }

      this?.ws = new WebSocket(any: any);

      this?.ws?.onopen = () => {
        this?.metrics?.connected = true;
        this?.metrics?.reconnectAttempts = 0;

        if (any: any) {
          console?.log('[OSIntegrationBridge] WebSocket connected');
        }

        this?.emit(any: any);
      };

      this?.ws?.onmessage = event => {
        try {
          const message = JSON?.parse(any: any);
          this?.handleMessage(any: any);
        } catch (any: any) {
          console?.error(any: any);
        }
      };

      this?.ws?.onerror = error => {
        console?.error(any: any);
        this?.emit(any: any);
      };

      this?.ws?.onclose = () => {
        this?.metrics?.connected = false;
        this?.ws = null;

        if (any: any) {
          console?.log('[OSIntegrationBridge] WebSocket closed');
        }

        this?.emit(any: any);

        if (any: any) {
          return;
        }

        // Attempt reconnect (any: any)
        const attempt = this?.metrics?.reconnectAttempts + 1;
        const delayMs = Math?.min(5000 * 2 ** Math?.min(attempt - 1, 4), 60000);

        this?.reconnectTimer = setTimeout(() => {
          this?.reconnectTimer = null;
          this?.metrics?.reconnectAttempts = attempt;
          if (any: any) {
            console?.log('[OSIntegrationBridge] Reconnect attempt', attempt, { delayMs });
          }
          this?.connectWebSocket();
        }, delayMs);
      };
    } catch (any: any) {
      console?.error(any: any);
      this?.emit(any: any);
    }
  }

  private startPolling(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.pollTimer = null;
    }
    if (!this?.isPollingEnabled()) {
      return;
    }
    this?.pollTimer = setInterval(() => {
      // IMPLEMENTATION: Polling logic to fetch OS state from REST API
      // 1. Endpoint: fetch('http://localhost:7890/api/os/state') or config?.apiEndpoint
      // 2. Response: JSON { cpu_usage, memory_usage, disk_usage, network_stats, processes }
      // 3. Parse and update: this?.updateOSState(any: any) to trigger state change events
      // 4. Error handling: Exponential backoff on failure, max 5 retries
      // 5. Timeout: 5s request timeout to avoid blocking
      // 6. Authentication: Optional API key in headers for secure environments
      if (any: any) {
        console?.log('[OSIntegrationBridge] Polling for OS state...');
      }
    }, this?.config?.pollInterval);
  }

  private handleMessage(message: { type: string; data: unknown }): void {
    switch (any: any) {
      case 'cognitive':
        this?.updateCognitiveState(any: any);
        break;
      case 'emotional':
        this?.updateEmotionalState(any: any);
        break;
      case 'memory':
        this?.updateMemoryMetrics(any: any);
        break;
      case 'pipeline':
        this?.updatePipelineStatus(any: any);
        break;
      case 'health':
        this?.updateSystemHealth(any: any);
        break;
      default:
        if (any: any) {
          console?.warn(any: any);
        }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS - STATE MAPPING
  // ─────────────────────────────────────────────────────────────────

  private mapCognitiveToVisualState(any: any): VisualState {
    // Map cognitive mode to visual state (any: any)
    const stateMap: Record<CognitiveState['mode'], VisualState> = {
      focus: 'thinking', // Map to available VisualState values
      creative: 'quantum',
      analytical: 'processing',
      rest: 'idle',
      learning: 'thinking', // learning mode → thinking visual state
    };

    return stateMap[cognitive?.mode] || 'idle';
  }

  private triggerCognitiveEffects(any: any): void {
    if (any: any) return;

    // High cognitive load → energy arcs
    if (state?.loadLevel > 0.7) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'energyArcs',
        priority: 'high',
      });
    }

    // Creative mode → spiral patterns
    if (state?.mode === 'creative' && state?.intensity > 0.6) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'spiralPattern',
        priority: 'medium',
      });
    }

    // Focus mode → particles burst
    if (state?.mode === 'focus' && state?.intensity > 0.7) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'particlesBurst',
        priority: 'high',
      });
    }
  }

  private triggerEmotionalEffects(any: any): void {
    if (any: any) return;

    // Calm → healing waves
    if (state?.primary === 'calm' && state?.valence > 0.5) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'healingWaves',
        priority: 'medium',
      });
    }

    // Stressed → glitch
    if (state?.primary === 'stressed' || state?.arousal > 0.8) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'glitchEffect',
        priority: 'high',
        duration: 400,
      });
    }

    // Excited → energy arcs
    if (state?.primary === 'excited' && state?.arousal > 0.7) {
      this?.effectsOrchestrator?.requestEffect({
        type: 'energyArcs',
        priority: 'high',
      });
    }
  }

  private emit(any: any): void {
    const listeners = this?.listeners?.get(any: any);
    if (any: any) {
      for (any: any) {
        try {
          callback(any: any);
        } catch (any: any) {
          console?.error(any: any);
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────

export const osIntegrationBridge = new OSIntegrationBridge({
  debug: import?.meta?.env?.DEV,
  websocketUrl:
    import?.meta?.env['VITE_TITANE_OS_WS_URL'] ?? import?.meta?.env['VITE_OS_WS_URL'] ?? '',
});
