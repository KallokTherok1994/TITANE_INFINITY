/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v15 — SINGULARITY BRIDGE (TypeScript)
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
import { getResultOrDefault, safeInvoke } from '../utils/invoke';
import {
  createFallbackAdaptive,
  createFallbackCognitive,
  createFallbackMeta,
  createFallbackPhysical,
  createFallbackSingularityState,
  createFallbackSymbolic,
} from '@/utils/tauriProtector';
import { XP } from '../core/experience/XP_ENGINE'; // ✨ v∞.D6 - XP Engine
import type {
  SingularityState,
  PhysicalLayer,
  CognitiveLayer,
  SymbolicLayer,
  AdaptiveLayer,
  MetaLayer,
} from '@/types/singularityState';

// ═══════════════════════════════════════════════════════════════════
// SINGULARITY BRIDGE CLASS (v∞.Ω Enhanced)
// ═══════════════════════════════════════════════════════════════════

export class SingularityBridge {
  private static initialized = false;
  private static state: SingularityState | null = null;
  private static listeners: UnlistenFn[] = [];
  private static subscribers: Set<(state: SingularityState) => void> = new Set();

  // v∞.Ω: Cache intelligent avec TTL
  private static cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private static readonly CACHE_TTL_MS = 5000; // 5 secondes
  private static lastStateHash = '';
  private static updateCount = 0;

  /**
   * Initialiser le bridge (appelé au startup)
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('Already initialized');
      return;
    }

    logger.debug('Initializing...');

    try {
      // 1. Sync initial state (Rust → React)
      this.state = await this.getFullState();

      // ✨ v∞.D6 - Injecter l'état XP dans SingularityState
      this.syncXPToState();

      logger.debug('Initial state synced:', this.state);

      // 2. Listen for layer updates (événements Tauri)
      await this.setupEventListeners();

      // v24.20: Event-driven sync (no more setInterval polling)
      logger.debug('v24.20: Event-driven delta sync enabled');

      this.initialized = true;
      logger.debug('✅ Initialized successfully');
    } catch (error) {
      logger.error('❌ Initialization failed:', error);
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
   * Notifier tous les subscribers (v∞.Ω: avec debounce intelligent)
   */
  private static notifySubscribers(): void {
    if (!this.state) return;

    // Calcul rapide de hash pour détecter changements réels
    const stateHash = JSON.stringify({
      c: this.state.cognitive?.coherence,
      p: this.state.physical?.helios?.cpu_usage,
      m: this.state.meta?.runtime_health,
    });

    // Éviter notifications redondantes
    if (stateHash === this.lastStateHash) {
      return;
    }
    this.lastStateHash = stateHash;
    this.updateCount++;

    // Log périodique pour monitoring
    if (this.updateCount % 100 === 0) {
      logger.debug(`[SingularityBridge v∞.Ω] ${this.updateCount} state updates processed`);
    }

    this.subscribers.forEach(callback => {
      try {
        if (this.state) {
          callback(this.state);
        }
      } catch (error) {
        logger.error('Subscriber error:', error);
      }
    });
  }

  /**
   * v∞.Ω: Cache avec TTL pour réduire appels backend
   */
  private static getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data as T;
    }
    return null;
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });

    // Nettoyage cache si trop grand
    if (this.cache.size > 50) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.CACHE_TTL_MS * 2) {
          this.cache.delete(k);
        }
      }
    }
  }

  /**
   * ✨ v∞.D6 - Synchroniser l'état XP dans SingularityState
   */
  private static syncXPToState(): void {
    if (!this.state) return;

    this.state.progression = {
      xp: XP.state.total,
      level: XP.state.level,
      events: XP.state.history,
    };

    this.notifySubscribers();
  }

  /**
   * Configurer les listeners d'événements Tauri
   */
  private static async setupEventListeners(): Promise<void> {
    // Physical Layer
    const unlisten1 = await listen<PhysicalLayer>(
      'singularity:physical:updated',
      event => {
        if (this.state) {
          this.state.physical = event.payload;
          this.notifySubscribers();
        }
      }
    );

    // Cognitive Layer
    const unlisten2 = await listen<CognitiveLayer>(
      'singularity:cognitive:updated',
      event => {
        if (this.state) {
          this.state.cognitive = event.payload;
          this.notifySubscribers();
        }
      }
    );

    // Symbolic Layer
    const unlisten3 = await listen<SymbolicLayer>(
      'singularity:symbolic:updated',
      event => {
        if (this.state) {
          this.state.symbolic = event.payload;
          this.notifySubscribers();
        }
      }
    );

    // Adaptive Layer
    const unlisten4 = await listen<AdaptiveLayer>(
      'singularity:adaptive:updated',
      event => {
        if (this.state) {
          this.state.adaptive = event.payload;
          this.notifySubscribers();
        }
      }
    );

    // Meta Layer
    const unlisten5 = await listen<MetaLayer>('singularity:meta:updated', event => {
      if (this.state) {
        this.state.meta = event.payload;
        this.notifySubscribers();
      }
    });

    // Full State (full sync - rare, only on init or major changes)
    const unlisten6 = await listen<SingularityState>(
      'singularity:full:updated',
      event => {
        logger.debug('v24.20: Full state update (rare)');
        this.state = event.payload;
        this.notifySubscribers();
      }
    );

    // v24.20: Delta updates (payload < 5KB instead of 500KB)
    const unlisten7 = await listen<Partial<SingularityState>>(
      'singularity:delta:updated',
      event => {
        if (this.state) {
          // Merge delta into current state (only changed fields)
          this.state = { ...this.state, ...event.payload };
          logger.debug(
            'v24.20: Delta update applied',
            Object.keys(event.payload)
          );
          this.notifySubscribers();
        }
      }
    );

    this.listeners = [
      unlisten1,
      unlisten2,
      unlisten3,
      unlisten4,
      unlisten5,
      unlisten6,
      unlisten7,
    ];
    logger.debug('Event listeners configured ✅');
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUERY METHODS (Read-only)
  // ═══════════════════════════════════════════════════════════════════

  static async getFullState(): Promise<SingularityState> {
    const state = await safeInvoke<SingularityState>('singularity_get_full_state');
    return getResultOrDefault(state, createFallbackSingularityState());
  }

  static async getPhysical(): Promise<PhysicalLayer> {
    const result = await safeInvoke<PhysicalLayer>('singularity_get_physical');
    return getResultOrDefault(result, createFallbackPhysical());
  }

  static async getCognitive(): Promise<CognitiveLayer> {
    const result = await safeInvoke<CognitiveLayer>('singularity_get_cognitive');
    return getResultOrDefault(result, createFallbackCognitive());
  }

  static async getSymbolic(): Promise<SymbolicLayer> {
    const result = await safeInvoke<SymbolicLayer>('singularity_get_symbolic');
    if (result) {
      return result;
    }

    logger.warn(
      'singularity_get_symbolic unavailable, using fallback state'
    );
    return createFallbackSymbolic();
  }

  static async getAdaptive(): Promise<AdaptiveLayer> {
    const result = await safeInvoke<AdaptiveLayer>('singularity_get_adaptive');
    if (result) {
      return result;
    }

    logger.warn(
      'singularity_get_adaptive unavailable, using fallback state'
    );
    return createFallbackAdaptive();
  }

  static async getMeta(): Promise<MetaLayer> {
    const result = await safeInvoke<MetaLayer>('singularity_get_meta');
    if (result) {
      return result;
    }

    logger.warn(
      'singularity_get_meta unavailable, using fallback state'
    );
    return createFallbackMeta();
  }

  static async getGlobalCoherence(): Promise<number> {
    const result = await safeInvoke<number>('singularity_get_global_coherence');
    return getResultOrDefault(result, 0.5);
  }

  static async isCritical(): Promise<boolean> {
    return (await safeInvoke<boolean>('singularity_is_critical')) || false;
  }

  // ═══════════════════════════════════════════════════════════════════
  // MUTATION METHODS (Write)
  // ═══════════════════════════════════════════════════════════════════

  static async updatePhysical(physical: PhysicalLayer): Promise<void> {
    await safeInvoke('singularity_update_physical', { physical });
  }

  static async updateCognitive(cognitive: CognitiveLayer): Promise<void> {
    await safeInvoke('singularity_update_cognitive', { cognitive });
  }

  static async updateSymbolic(symbolic: SymbolicLayer): Promise<void> {
    await safeInvoke('singularity_update_symbolic', { symbolic });
  }

  static async updateAdaptive(adaptive: AdaptiveLayer): Promise<void> {
    await safeInvoke('singularity_update_adaptive', { adaptive });
  }

  static async updateMeta(meta: MetaLayer): Promise<void> {
    await safeInvoke('singularity_update_meta', { meta });
  }

  static async updateFullState(state: SingularityState): Promise<void> {
    await secureInvoke('singularity_update_full_state', { state });
    this.state = state;
    this.notifySubscribers();
  }

  // ═══════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════

  static async saveState(): Promise<void> {
    await secureInvoke('singularity_save_state');
  }

  static async loadState(): Promise<void> {
    await secureInvoke('singularity_load_state');
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
    logger.debug('Destroyed ✅');
  }
}

// ═══════════════════════════════════════════════════════════════════
// ✅ v∞.C6 - FILE KNOWLEDGE INTEGRATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Intégrer la connaissance d'un fichier importé dans le SingularityState
 *
 * @param summary - Résumé IA du fichier
 * @param category - Catégorie du fichier (code-rust, code-react, etc.)
 * @param path - Chemin du fichier
 */
export function mergeFileKnowledge(
  summary: string,
  category: string,
  path: string
): void {
  // Removed getState() call - not used
  // Ajouter à la mémoire cognitive (connaissances)
  const __newKnowledge = {
    id: `file_${Date.now()}`,
    source: 'file_import',
    category,
    path,
    summary,
    timestamp: Date.now(),
  };

  logger.debug('✅ Integrated:', { category, path });

  // Notifier le backend pour persistence
  safeInvoke('store_file', {
    path,
    category,
    content: summary,
  }).catch(err => {
    logger.error('Storage failed:', err);
  });
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
    const unsubscribe = SingularityBridge.subscribe(newState => {
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
