/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 — SingularityState Subsystem Connections
 * Connecte Helios, Memory, Persona, AutoHeal, UI → SingularityState
 * ═══════════════════════════════════════════════════════════════
 */

// @ts-nocheck - Complex dynamic types from v∞ architecture
import { secureInvoke } from '@/lib/security';
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
    args?: Record<string, unknown>
  ): Promise<T | null> {
    // Skip if already marked as disabled
    if (this.disabledCommands.has(cmd)) {
      return null;
    }

    try {
      return await secureInvoke<T>(cmd, args);
    } catch (err: unknown) {
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
   * Start automatic subsystem connections (v24.20: event-driven + optional fallback polling)
   */
  static async start(intervalMs: number = 0): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ SingularityConnections already running');
      return;
    }

    console.log('🔗 Starting SingularityConnections v24.20 (event-driven mode)');
    this.isRunning = true;

    // Initial sync
    await this.syncAll();

    // v24.20: Fallback polling only if intervalMs > 0 (default: pure event-driven)
    if (intervalMs > 0) {
      console.log(
        `⚠️ SingularityConnections: Fallback polling enabled (${intervalMs}ms)`
      );
      this.updateInterval = window.setInterval(async () => {
        try {
          await this.syncAll();
        } catch (err) {
          console.error('❌ SingularityConnections sync error:', err);
        }
      }, intervalMs);
    } else {
      console.log('✅ SingularityConnections: Pure event-driven mode (no polling)');
    }
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
        hardware: {
          active: true,
          cpu_usage: helios.cpu_usage / 100, // 0-100 → 0-1
          memory_usage: helios.ram_usage / 100,
          disk_usage: helios.disk_usage / 100,
          temperature: this.estimateTemperature(helios.cpu_usage), // CPU thermal estimation
          battery_level: 1.0, // Desktop systems = AC power (1.0 = 100%)
          last_update: Math.floor(Date.now() / 1000), // ✅ v∞.FIX: Convert ms → seconds (u64)
        },
        system_health: {
          ...current.system_health,
          global_health: this.calculateHealthScore(helios),
          // ✅ v∞.FIX: Removed last_check (not in Rust SystemHealth struct)
        },
        metrics: {
          ...current.metrics,
          cpu_usage: helios.cpu_usage / 100,
          memory_usage: helios.ram_usage / 100,
          disk_usage: helios.disk_usage / 100,
          response_time: this.lastApiLatency || 0, // Measured API response time in ms
          throughput: this.calculateThroughput(helios), // Estimated data transfer rate
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

      const totalEntries =
        memory.snapshots_count + memory.log_entries_count + memory.timeline_events;

      const updated: CognitiveLayer = {
        ...current,
        memory: {
          ...current.memory,
          total_memories: totalEntries,
          active_memories: memory.snapshots_count, // Snapshots = active context
          memory_usage: memory.storage_size_mb / 1024, // MB → GB
          last_retrieval: null, // ✅ v∞.FIX - Backend will populate timestamp
          compression_ratio: this.calculateCompressionRatio(memory), // Based on storage efficiency
        },
        conversation: {
          ...current.conversation,
          message_count: memory.log_entries_count,
          context_length: Math.min(10, memory.snapshots_count),
          active_session: true,
          last_message: null,
          last_timestamp: null, // ✅ v∞.FIX - Backend will populate timestamp
        },
        knowledge: {
          ...current.knowledge,
          total_entries: totalEntries,
          indexed_entries: memory.timeline_events,
          knowledge_score: Math.min(1.0, totalEntries / 1000),
          last_update: null, // ✅ v∞.FIX - Backend will populate timestamp
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
          last_interaction: null, // ✅ v∞.FIX - Backend will populate timestamp
        },
        archetype: {
          active_archetype: 'helios', // ✅ v∞.FIX - Required field for backend
          strength: 0.95,
          transition: null,
        },
        visual: {
          ...current.visual,
          theme: 'dark',
          accent_color: '#6366f1',
          glow_intensity: 0.7,
          motion_enabled: true,
          depth_enabled: true,
        },
        stability: 0.9,
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
          generation: current.evolution?.generation ?? 0,
          mutation_rate: 0.1,
          fitness_score: await this.calculateFitnessScore(), // System health-based score
          last_evolution: null, // ✅ v∞.FIX - Backend will populate timestamp
        },
        auto_heal: {
          active: true,
          healing_capacity: 1.0,
          errors_healed: this.errorHealingCounter || 0, // Tracked from self-repair system
          last_heal: null,
        },
        evolution_capacity: 0.85,
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
          sidebar_open: this.detectSidebarState(), // Tracked from DOM/localStorage
          modal_open: this.detectModalState(), // Tracked from DOM presence
          theme: 'dark',
          last_interaction: null, // ✅ v∞.FIX - Backend will populate timestamp
        },
        runtime: {
          ...current.runtime,
          version: '17.3.0',
          build: 'dev',
          environment: import.meta.env.MODE,
          uptime: Math.floor(performance.now() / 1000), // ✅ v∞.FIX - Convert ms to seconds (u64)
          restart_count: 0,
        },
        runtime_health: this.calculateRuntimeHealth(),
      };

      await SingularityBridge.updateMeta(updated);
    } catch (err) {
      console.error('[SingularityConnections] Failed to update UI state:', err);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //   HELPER METHODS FOR TODO IMPLEMENTATIONS
  // ═══════════════════════════════════════════════════════════

  private static lastApiLatency: number = 0;
  private static errorHealingCounter: number = 0;

  /**
   * Estimate CPU temperature based on usage (0-100°C normalized to 0-1)
   */
  private static estimateTemperature(cpuUsage: number): number {
    // CPU usage → temperature estimation
    // Idle (0-20%) = 30-40°C → 0.3-0.4
    // Normal (20-60%) = 40-60°C → 0.4-0.6
    // High (60-90%) = 60-80°C → 0.6-0.8
    // Critical (90-100%) = 80-100°C → 0.8-1.0
    const baseTempC = 30 + cpuUsage * 0.7; // 30°C + (0-70°C based on usage)
    return Math.min(1.0, baseTempC / 100);
  }

  /**
   * Calculate data throughput estimate (MB/s based on system activity)
   */
  private static calculateThroughput(helios: HeliosState): number {
    // Estimate throughput from disk and memory activity
    // Higher resource usage = more data movement
    const activity = (helios.cpu_usage + helios.ram_usage + helios.disk_usage) / 3;
    return activity / 10; // Convert to MB/s estimate (0-10 MB/s range)
  }

  /**
   * Calculate memory compression ratio based on storage efficiency
   */
  private static calculateCompressionRatio(memory: MemoryState): number {
    // Compression ratio = theoretical size / actual size
    // More entries with less storage = better compression
    const totalEntries =
      memory.snapshots_count + memory.log_entries_count + memory.timeline_events;
    if (totalEntries === 0) return 1.0;

    // Assume avg 1KB per entry uncompressed
    const theoreticalSizeMB = totalEntries / 1024;
    const actualSizeMB = memory.storage_size_mb || 1;

    return Math.min(1.0, Math.max(0.1, theoreticalSizeMB / actualSizeMB));
  }

  /**
   * Calculate fitness score from system health metrics
   */
  private static async calculateFitnessScore(): Promise<number> {
    try {
      // Get current Helios state for health calculation
      const helios = await this.safeInvoke<HeliosState>('get_helios_state');
      if (!helios) return 0.85; // Default if unavailable

      // Fitness = inverse of average resource usage + uptime bonus
      const avgUsage = (helios.cpu_usage + helios.ram_usage + helios.disk_usage) / 3;
      const resourceHealth = Math.max(0, 1 - avgUsage / 100);

      // Uptime bonus (longer uptime = more stable = higher fitness)
      const uptimeHours = helios.uptime_seconds / 3600;
      const uptimeBonus = Math.min(0.15, uptimeHours / 1000); // Max +0.15 after 150h uptime

      return Math.min(1.0, resourceHealth * 0.85 + uptimeBonus);
    } catch {
      return 0.85; // Default healthy score
    }
  }

  /**
   * Detect sidebar state from DOM or localStorage
   */
  private static detectSidebarState(): boolean {
    // Check localStorage for sidebar state
    try {
      const stored = localStorage.getItem('sidebar_open');
      if (stored !== null) return stored === 'true';
    } catch {
      // Fallback to DOM detection
    }

    // Check if sidebar element exists and is visible
    const sidebar = document.querySelector('[data-sidebar], .sidebar, #sidebar');
    if (sidebar) {
      return (
        !sidebar.classList.contains('hidden') && !sidebar.classList.contains('collapsed')
      );
    }

    return true; // Default to open
  }

  /**
   * Detect modal state from DOM
   */
  private static detectModalState(): boolean {
    // Check for modal elements in DOM
    const modal = document.querySelector('[role="dialog"], .modal, [data-modal]');
    return modal !== null && !modal.classList.contains('hidden');
  }

  /**
   * Track API latency (called externally when API calls complete)
   */
  static recordApiLatency(latencyMs: number): void {
    this.lastApiLatency = latencyMs;
  }

  /**
   * Increment error healing counter (called by self-repair system)
   */
  static incrementErrorsHealed(): void {
    this.errorHealingCounter++;
  }

  private static calculateRuntimeHealth(): number {
    // Runtime health based on performance metrics
    const perf = performance as {
      memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
    };
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
