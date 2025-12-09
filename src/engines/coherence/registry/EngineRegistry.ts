/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * EngineRegistry - Centralized engine management for CoherenceEngine
 * Migrated from src/os/registry/EngineRegistry.ts
 */

import type { Engine, EngineState } from '../types';

/**
 * EngineRegistry - Manages all cognitive engines lifecycle
 *
 * Features:
 * - Engine registration and discovery
 * - Lifecycle management (start/stop)
 * - State tracking
 * - Dependency resolution
 */
export class EngineRegistry {
  private engines: Map<string, Engine> = new Map();
  private dependencies: Map<string, string[]> = new Map();
  private startOrder: string[] = [];

  /**
   * Register an engine
   */
  register(engine: Engine, dependencies?: string[]): void {
    if (this.engines.has(engine.id)) {
      console.warn(`[EngineRegistry] Engine ${engine.id} already registered, replacing`);
    }

    this.engines.set(engine.id, engine);

    if (dependencies && dependencies.length > 0) {
      this.dependencies.set(engine.id, dependencies);
    }

    // Recalculate start order
    this.calculateStartOrder();
  }

  /**
   * Unregister an engine
   */
  unregister(id: string): boolean {
    const removed = this.engines.delete(id);
    if (removed) {
      this.dependencies.delete(id);
      this.calculateStartOrder();
    }
    return removed;
  }

  /**
   * Get an engine by ID
   */
  get<T extends Engine>(id: string): T | undefined {
    return this.engines.get(id) as T | undefined;
  }

  /**
   * Get all engines
   */
  getAll(): Engine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Get all engine IDs
   */
  getIds(): string[] {
    return Array.from(this.engines.keys());
  }

  /**
   * Check if an engine is registered
   */
  has(id: string): boolean {
    return this.engines.has(id);
  }

  /**
   * Get engine state
   */
  getState(id: string): EngineState | undefined {
    const engine = this.engines.get(id);
    return engine?.getState();
  }

  /**
   * Get all engine states
   */
  getAllStates(): Map<string, EngineState> {
    const states = new Map<string, EngineState>();
    this.engines.forEach((engine, id) => {
      states.set(id, engine.getState());
    });
    return states;
  }

  /**
   * Start all engines in dependency order
   */
  async startAll(): Promise<void> {
    for (const id of this.startOrder) {
      const engine = this.engines.get(id);
      if (engine) {
        try {
          await engine.start();
          console.log(`[EngineRegistry] Started engine: ${id}`);
        } catch (error) {
          console.error(`[EngineRegistry] Failed to start engine ${id}:`, error);
          throw error;
        }
      }
    }
  }

  /**
   * Stop all engines in reverse order
   */
  async stopAll(): Promise<void> {
    const reverseOrder = [...this.startOrder].reverse();
    for (const id of reverseOrder) {
      const engine = this.engines.get(id);
      if (engine) {
        try {
          await engine.stop();
          console.log(`[EngineRegistry] Stopped engine: ${id}`);
        } catch (error) {
          console.error(`[EngineRegistry] Failed to stop engine ${id}:`, error);
        }
      }
    }
  }

  /**
   * Get engine count
   */
  get size(): number {
    return this.engines.size;
  }

  /**
   * Calculate topological order for engine startup
   */
  private calculateStartOrder(): void {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (id: string): void => {
      if (visited.has(id)) return;
      visited.add(id);

      // Visit dependencies first
      const deps = this.dependencies.get(id) ?? [];
      for (const dep of deps) {
        if (this.engines.has(dep)) {
          visit(dep);
        }
      }

      order.push(id);
    };

    // Visit all engines
    this.engines.forEach((_, id) => visit(id));
    this.startOrder = order;
  }
}
