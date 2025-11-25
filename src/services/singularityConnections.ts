/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SingularityState Subsystem Connections
 * Connecte Helios, Memory, Persona, AutoHeal, UI → SingularityState
 * ═══════════════════════════════════════════════════════════════
 */

// @ts-nocheck - Complex dynamic types from v∞ architecture
import { invoke } from '@tauri-apps/api/core';
import { SingularityBridge } from './singularityBridge';
import type {
  PhysicalLayer,
  CognitiveLayer,
  SymbolicLayer,
  AdaptiveLayer,
  MetaLayer,
} from '../types/singularityState';

// ═══════════════════════════════════════════════════════════════
//   TYPES BACKEND (from Rust)
// ═══════════════════════════════════════════════════════════════

interface HeliosState {
  cpu_usage: number;
  ram_usage: number;
  ram_total_gb: number;
  ram_used_gb: number;
  disk_usage: number;
  disk_total_gb: number;
  disk_used_gb: number;
  uptime_seconds: number;
  load_average: { one: number; five: number; fifteen: number };
  timestamp: number;
}

interface MemoryState {
  snapshots_count: number;
  log_entries_count: number;
  timeline_events: number;
  storage_size_mb: number;
  timestamp: number;
}

// interface PersonaState {
//   name: string;
//   mood: string;
//   intensity: number;
//   archetype: string;
//   stability: number;
//   evolution_level: number;
// }

// ═══════════════════════════════════════════════════════════════
//   SINGULARITY CONNECTIONS SERVICE
// ═══════════════════════════════════════════════════════════════

export class SingularityConnections {
  private static updateInterval: number | null = null;
  private static isRunning: boolean = false;
  private static disabledCommands: Set<string> = new Set();

  // ═══ v∞.A THROTTLE GLOBAL ═══
  private static lastCall: number = 0;
  private static readonly THROTTLE_DELAY = 2000; // 2000ms entre chaque sync

  /**
   * Throttle global pour éviter spam (2000ms minimum entre appels)
   */
  private static throttle(delay: number = this.THROTTLE_DELAY): boolean {
    const now = Date.now();
    if (now - this.lastCall < delay) {
      return false; // Trop tôt, skip
    }
    this.lastCall = now;
    return true; // OK pour continuer
  }

  /**
   * Safe invoke wrapper with "command not found" handling
   */
  private static async safeInvoke<T>(
    cmd: string,
    args?: any
  ): Promise<T | null> {
    // Skip if already marked as disabled
    if (this.disabledCommands.has(cmd)) {
      return null;
    }

    try {
      return await invoke<T>(cmd, args);
    } catch (err: any) {
      const msg = String(err?.message ?? err);

      // Gracefully disable command if not found
      if (msg.includes('command') && msg.includes('not found')) {
        console.warn(
          `[SingularityConnections] Command "${cmd}" not found. Disabling this sync.`
        );
        this.disabledCommands.add(cmd);
        return null;
      }

      // Log other errors but don't crash
      console.error(`[SingularityConnections] Error invoking ${cmd}:`, err);
      return null;
    }
  }

  /**
   * Start automatic subsystem connections (polling 5s)
   */
  static async start(intervalMs: number = 5000): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ SingularityConnections already running');
      return;
    }

    console.log('🔗 Starting SingularityConnections (interval:', intervalMs, 'ms)');
    this.isRunning = true;

    // Initial sync
    await this.syncAll();

    // Polling loop
    this.updateInterval = window.setInterval(async () => {
      try {
        await this.syncAll();
      } catch (err) {
        console.error('❌ SingularityConnections sync error:', err);
      }
    }, intervalMs);
  }

  /**
   * Stop automatic connections
   */
  static stop(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️  SingularityConnections stopped');
  }

  /**
   * Sync all subsystems → SingularityState
   */
  static async syncAll(): Promise<void> {
    // v∞.A: Check throttle avant sync
    if (!this.throttle()) {
      return; // Skip si appelé trop tôt
    }

    await Promise.all([
      this.syncHelios(),
      this.syncMemory(),
      this.syncPersona(),
      this.syncAutoHeal(),
      this.syncUIState(),
    ]);
  }

  // ═══════════════════════════════════════════════════════════
  //   HELIOS → PHYSICAL LAYER
  // ═══════════════════════════════════════════════════════════

  static async syncHelios(): Promise<void> {
    // ✅ FIXED v18: get_helios_metrics → get_helios_state (to match Rust)
    const helios = await this.safeInvoke<HeliosState>('get_helios_state');
    if (!helios) return;

    try {
      const current = await SingularityBridge.getPhysical();

      const updated: PhysicalLayer = {
        ...current,
        helios: {
          active: true,
          cpu_usage: helios.cpu_usage / 100, // 0-100 → 0-1
          memory_usage: helios.ram_usage / 100,
          disk_usage: helios.disk_usage / 100,
          temperature: 0.0, // TODO: Add temperature sensor if available
          battery_level: 1.0, // TODO: Add battery API if available
          last_update: Date.now(),
        },
        system_health: {
          ...current.system_health,
          global_health: this.calculateHealthScore(helios),
          last_check: Date.now(),
        },
        metrics: {
          ...current.metrics,
          cpu_usage: helios.cpu_usage / 100,
          memory_usage: helios.ram_usage / 100,
          disk_usage: helios.disk_usage / 100,
          response_time: 0, // TODO: Measure API latency
          throughput: 0, // TODO: Measure data transfer rate
          performance_score: this.calculatePerformanceScore(helios),
        },
      };

      await SingularityBridge.updatePhysical(updated);
    } catch (err) {
      console.error('[SingularityConnections] Failed to update Helios state:', err);
    }
  }

  private static calculateHealthScore(helios: HeliosState): number {
    // Health = 1.0 if all metrics < 80%, 0.5 if < 95%, 0.0 if critical
    const cpuHealth = helios.cpu_usage < 80 ? 1.0 : helios.cpu_usage < 95 ? 0.5 : 0.0;
    const ramHealth = helios.ram_usage < 80 ? 1.0 : helios.ram_usage < 95 ? 0.5 : 0.0;
    const diskHealth = helios.disk_usage < 80 ? 1.0 : helios.disk_usage < 95 ? 0.5 : 0.0;
    return (cpuHealth + ramHealth + diskHealth) / 3;
  }

  private static calculatePerformanceScore(helios: HeliosState): number {
    // Performance = inverse of resource usage (lower usage = better performance)
    const avgUsage = (helios.cpu_usage + helios.ram_usage + helios.disk_usage) / 3;
    return Math.max(0, 1 - avgUsage / 100);
  }

  // ═══════════════════════════════════════════════════════════
  //   MEMORY → COGNITIVE LAYER
  // ═══════════════════════════════════════════════════════════

  static async syncMemory(): Promise<void> {
    // Changed: memory_get_state → get_memory_state (to match Rust)
    const memory = await this.safeInvoke<MemoryState>('get_memory_state');
    if (!memory) return;

    try {
      const current = await SingularityBridge.getCognitive();

      const totalEntries = memory.snapshots_count + memory.log_entries_count + memory.timeline_events;

      const updated: CognitiveLayer = {
        ...current,
        memory: {
          ...current.memory,
          total_memories: totalEntries,
          active_memories: memory.snapshots_count, // Snapshots = active context
          memory_usage: memory.storage_size_mb / 1024, // MB → GB
          last_retrieval: Date.now(),
          compression_ratio: 0.9, // TODO: Calculate from actual data
        },
        conversation: {
          ...current.conversation,
          active_threads: 1, // TODO: Get from conversation state
          message_count: memory.log_entries_count,
          context_depth: Math.min(10, memory.snapshots_count),
          last_message: Date.now(),
        },
        knowledge: {
          ...current.knowledge,
          graph_size: totalEntries,
          connections: memory.timeline_events,
          depth: Math.floor(Math.log2(totalEntries + 1)),
          last_update: Date.now(),
        },
      };

      await SingularityBridge.updateCognitive(updated);
    } catch (err) {
      console.error('[SingularityConnections] Failed to update Memory state:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //   PERSONA ENGINE → SYMBOLIC LAYER
  // ═══════════════════════════════════════════════════════════

  static async syncPersona(): Promise<void> {
    // Note: singularity_get_symbolic not available yet
    // Using mock data gracefully without crashing
    try {
      const current = await SingularityBridge.getSymbolic();

      // Mock data until backend command available
      const updated: SymbolicLayer = {
        ...current,
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
          ...current.visual,
          active_theme: 'dark',
          animation_state: 'idle',
          last_transition: Date.now(),
        },
      };

      await SingularityBridge.updateSymbolic(updated);
    } catch (err) {
      console.error('[SingularityConnections] Failed to update Persona state:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //   AUTO-HEAL → ADAPTIVE LAYER
  // ═══════════════════════════════════════════════════════════

  static async syncAutoHeal(): Promise<void> {
    // Note: singularity_get_adaptive not available yet
    // Using mock data gracefully without crashing
    try {
      const current = await SingularityBridge.getAdaptive();

      // Mock data until backend command available
      const updated: AdaptiveLayer = {
        ...current,
        evolution: {
          ...current.evolution,
          generation: current.evolution?.generation ?? 0, // ✅ Guard against undefined
          fitness: 0.85, // TODO: Calculate from system health
          mutation_rate: 0.1,
          last_evolution: Date.now(),
        },
        auto_heal: {
          active: true,
          healing_capacity: 1.0,
          errors_healed: 0, // TODO: Track from ErrorBoundary
          last_heal: null,
        },
      };

      await SingularityBridge.updateAdaptive(updated);
    } catch (err) {
      console.error('[SingularityConnections] Failed to update AutoHeal state:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //   UI ROUTER → META LAYER
  // ═══════════════════════════════════════════════════════════

  static async syncUIState(): Promise<void> {
    // Note: singularity_get_meta not available yet
    // Using client-side data gracefully
    try {
      const current = await SingularityBridge.getMeta();

      // Get current route from window.location
      const activePage = window.location.pathname;

      const updated: MetaLayer = {
        ...current,
        ui: {
          active_page: activePage,
          sidebar_open: true, // TODO: Track from sidebar state
          modal_open: false, // TODO: Track from modal state
          theme: 'dark',
          last_interaction: Date.now(),
        },
        runtime: {
          ...current.runtime,
          version: '17.3.0',
          environment: import.meta.env.MODE,
          uptime: performance.now(),
          health: this.calculateRuntimeHealth(),
        },
      };

      await SingularityBridge.updateMeta(updated);
    } catch (err) {
      console.error('[SingularityConnections] Failed to update UI state:', err);
    }
  }

  private static calculateRuntimeHealth(): number {
    // Runtime health based on performance metrics
    const perf = performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } };
    const memory = perf.memory;
    if (memory) {
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return Math.max(0, 1 - usage);
    }
    return 0.95; // Default healthy
  }
}

// ═══════════════════════════════════════════════════════════════
//   REACT HOOK
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react';

/**
 * Hook to enable SingularityConnections in a component
 * Usage: useSingularityConnections({ interval: 5000, autoStart: true })
 */
export function useSingularityConnections(options?: {
  interval?: number;
  autoStart?: boolean;
}) {
  const { interval = 5000, autoStart = true } = options || {};

  useEffect(() => {
    if (autoStart) {
      SingularityConnections.start(interval);
    }

    return () => {
      SingularityConnections.stop();
    };
  }, [interval, autoStart]);

  return {
    syncAll: SingularityConnections.syncAll,
    syncHelios: SingularityConnections.syncHelios,
    syncMemory: SingularityConnections.syncMemory,
    syncPersona: SingularityConnections.syncPersona,
    syncAutoHeal: SingularityConnections.syncAutoHeal,
    syncUIState: SingularityConnections.syncUIState,
  };
}
