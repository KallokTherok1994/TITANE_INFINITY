/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY BRIDGE (TypeScript)
 * Pont bidirectionnel Rust Backend ↔ React Frontend
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - Sync initial (Rust → React)
 * - Événements temps réel (listen Tauri events)
 * - Updates bidirectionnelles (invoke commands)
 * - Persistence automatique
 * - Latence < 50ms
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import type {
  SingularityState,
  PhysicalLayer,
  CognitiveLayer,
  SymbolicLayer,
  AdaptiveLayer,
  MetaLayer,
} from '@/types/singularityState';

// ═══════════════════════════════════════════════════════════════════
// SINGULARITY BRIDGE CLASS
// ═══════════════════════════════════════════════════════════════════

export class SingularityBridge {
  private static initialized = false;
  private static state: SingularityState | null = null;
  private static listeners: UnlistenFn[] = [];
  private static subscribers: Set<(state: SingularityState) => void> = new Set();

  /**
   * Initialiser le bridge (appelé au startup)
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[SingularityBridge] Already initialized');
      return;
    }

    console.log('[SingularityBridge] Initializing...');

    try {
      // 1. Sync initial state (Rust → React)
      this.state = await this.getFullState();
      console.log('[SingularityBridge] Initial state synced:', this.state);

      // 2. Listen for layer updates (événements Tauri)
      await this.setupEventListeners();

      this.initialized = true;
      console.log('[SingularityBridge] ✅ Initialized successfully');
    } catch (error) {
      console.error('[SingularityBridge] ❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * S'abonner aux changements d'état
   */
  static subscribe(callback: (state: SingularityState) => void): () => void {
    this.subscribers.add(callback);

    // Appel immédiat avec état actuel
    if (this.state) {
      callback(this.state);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notifier tous les subscribers
   */
  private static notifySubscribers(): void {
    if (!this.state) return;

    this.subscribers.forEach(callback => {
      try {
        if (this.state) {
          callback(this.state);
        }
      } catch (error) {
        console.error('[SingularityBridge] Subscriber error:', error);
      }
    });
  }

  /**
   * Configurer les listeners d'événements Tauri
   */
  private static async setupEventListeners(): Promise<void> {
    // Physical Layer
    const unlisten1 = await listen<PhysicalLayer>('singularity:physical:updated', (event) => {
      if (this.state) {
        this.state.physical = event.payload;
        this.notifySubscribers();
      }
    });

    // Cognitive Layer
    const unlisten2 = await listen<CognitiveLayer>('singularity:cognitive:updated', (event) => {
      if (this.state) {
        this.state.cognitive = event.payload;
        this.notifySubscribers();
      }
    });

    // Symbolic Layer
    const unlisten3 = await listen<SymbolicLayer>('singularity:symbolic:updated', (event) => {
      if (this.state) {
        this.state.symbolic = event.payload;
        this.notifySubscribers();
      }
    });

    // Adaptive Layer
    const unlisten4 = await listen<AdaptiveLayer>('singularity:adaptive:updated', (event) => {
      if (this.state) {
        this.state.adaptive = event.payload;
        this.notifySubscribers();
      }
    });

    // Meta Layer
    const unlisten5 = await listen<MetaLayer>('singularity:meta:updated', (event) => {
      if (this.state) {
        this.state.meta = event.payload;
        this.notifySubscribers();
      }
    });

    // Full State (full sync)
    const unlisten6 = await listen<SingularityState>('singularity:full:updated', (event) => {
      this.state = event.payload;
      this.notifySubscribers();
    });

    this.listeners = [unlisten1, unlisten2, unlisten3, unlisten4, unlisten5, unlisten6];
    console.log('[SingularityBridge] Event listeners configured ✅');
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUERY METHODS (Read-only)
  // ═══════════════════════════════════════════════════════════════════

  static async getFullState(): Promise<SingularityState> {
    return invoke<SingularityState>('singularity_get_full_state');
  }

  static async getPhysical(): Promise<PhysicalLayer> {
    return invoke<PhysicalLayer>('singularity_get_physical');
  }

  static async getCognitive(): Promise<CognitiveLayer> {
    return invoke<CognitiveLayer>('singularity_get_cognitive');
  }

  static async getSymbolic(): Promise<SymbolicLayer> {
    try {
      return await invoke<SymbolicLayer>('singularity_get_symbolic');
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes('command') && msg.includes('not found')) {
        console.warn('[SingularityBridge] singularity_get_symbolic not available, using fallback');
      } else {
        console.error('[SingularityBridge] Error getting symbolic layer:', err);
      }
      // Return safe default
      return {
        persona: {
          name: 'TITANE∞',
          mood: 'focused',
          intensity: 0.8,
          evolution_level: 5,
          last_interaction: Date.now(),
        },
        archetype: {
          primary: 'sentinel',
          secondary: 'sage',
          traits: ['vigilant', 'analytical', 'adaptive'],
          stability: 0.95,
        },
        visual: {
          active_theme: 'dark',
          animation_state: 'idle',
          effect_intensity: 0.7,
          last_transition: Date.now(),
        },
      };
    }
  }

  static async getAdaptive(): Promise<AdaptiveLayer> {
    try {
      return await invoke<AdaptiveLayer>('singularity_get_adaptive');
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes('command') && msg.includes('not found')) {
        console.warn('[SingularityBridge] singularity_get_adaptive not available, using fallback');
      } else {
        console.error('[SingularityBridge] Error getting adaptive layer:', err);
      }
      // Return safe default
      return {
        learning: {
          rate: 0.001,
          history: [],
          performance_trend: 'stable',
          last_update: Date.now(),
        },
        evolution: {
          generation: 0,
          fitness: 0.85,
          mutation_rate: 0.1,
          last_evolution: Date.now(),
        },
        auto_heal: {
          active: true,
          healing_capacity: 1.0,
          errors_healed: 0,
          last_heal: null,
        },
      };
    }
  }

  static async getMeta(): Promise<MetaLayer> {
    try {
      return await invoke<MetaLayer>('singularity_get_meta');
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes('command') && msg.includes('not found')) {
        console.warn('[SingularityBridge] singularity_get_meta not available, using fallback');
      } else {
        console.error('[SingularityBridge] Error getting meta layer:', err);
      }
      // Return safe default
      return {
        reflection: {
          depth: 2,
          insights: [],
          patterns: [],
          last_reflection: Date.now(),
        },
        ui: {
          active_page: window.location.pathname,
          sidebar_open: true,
          modal_open: false,
          theme: 'dark',
          last_interaction: Date.now(),
        },
        runtime: {
          version: '17.3.0',
          environment: import.meta.env.MODE,
          uptime: performance.now(),
          health: 0.95,
        },
      };
    }
  }

  static async getGlobalCoherence(): Promise<number> {
    return invoke<number>('singularity_get_global_coherence');
  }

  static async isCritical(): Promise<boolean> {
    return invoke<boolean>('singularity_is_critical');
  }

  // ═══════════════════════════════════════════════════════════════════
  // MUTATION METHODS (Write)
  // ═══════════════════════════════════════════════════════════════════

  static async updatePhysical(physical: PhysicalLayer): Promise<void> {
    await invoke('singularity_update_physical', { physical });
  }

  static async updateCognitive(cognitive: CognitiveLayer): Promise<void> {
    await invoke('singularity_update_cognitive', { cognitive });
  }

  static async updateSymbolic(symbolic: SymbolicLayer): Promise<void> {
    await invoke('singularity_update_symbolic', { symbolic });
  }

  static async updateAdaptive(adaptive: AdaptiveLayer): Promise<void> {
    await invoke('singularity_update_adaptive', { adaptive });
  }

  static async updateMeta(meta: MetaLayer): Promise<void> {
    await invoke('singularity_update_meta', { meta });
  }

  static async updateFullState(state: SingularityState): Promise<void> {
    await invoke('singularity_update_full_state', { state });
    this.state = state;
    this.notifySubscribers();
  }

  // ═══════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════

  static async saveState(): Promise<void> {
    await invoke('singularity_save_state');
  }

  static async loadState(): Promise<void> {
    await invoke('singularity_load_state');
    this.state = await this.getFullState();
    this.notifySubscribers();
  }

  // ═══════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════════

  static async destroy(): Promise<void> {
    this.listeners.forEach(unlisten => unlisten());
    this.listeners = [];
    this.subscribers.clear();
    this.initialized = false;
    console.log('[SingularityBridge] Destroyed ✅');
  }
}

// ═══════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';

/**
 * Hook React pour accéder à SingularityState
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, coherence, isCritical } = useSingularityState();
 *
 *   return (
 *     <div>
 *       <p>Global Coherence: {coherence}</p>
 *       <p>CPU: {state?.physical.metrics.cpu_usage}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSingularityState() {
  const [state, setState] = useState<SingularityState | null>(null);
  const [coherence, setCoherence] = useState<number>(0);
  const [critical, setCritical] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = SingularityBridge.subscribe((newState) => {
      setState(newState);
    });

    // Fetch initial coherence
    SingularityBridge.getGlobalCoherence().then(setCoherence);
    SingularityBridge.isCritical().then(setCritical);

    return unsubscribe;
  }, []);

  return {
    state,
    coherence,
    isCritical: critical,

    // Layers shortcuts
    physical: state?.physical,
    cognitive: state?.cognitive,
    symbolic: state?.symbolic,
    adaptive: state?.adaptive,
    meta: state?.meta,

    // Update methods
    updatePhysical: SingularityBridge.updatePhysical,
    updateCognitive: SingularityBridge.updateCognitive,
    updateSymbolic: SingularityBridge.updateSymbolic,
    updateAdaptive: SingularityBridge.updateAdaptive,
    updateMeta: SingularityBridge.updateMeta,

    // Persistence
    save: SingularityBridge.saveState,
    load: SingularityBridge.loadState,
  };
}
