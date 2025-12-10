/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * EngineCoordinator - Inter-engine coordination for CoherenceEngine
 * Logic extracted from Nexus Engine
 */

import type { Engine, CoordinationResult, Conflict, EngineState } from '../types';
import type { EngineRegistry } from '../registry/EngineRegistry';

/**
 * EngineCoordinator - Coordinates multiple cognitive engines
 *
 * Features:
 * - Conflict detection and resolution
 * - Resource allocation
 * - State synchronization
 * - Load balancing between engines
 */
export class EngineCoordinator {
  private registry: EngineRegistry;

  constructor(registry: EngineRegistry) {
    this.registry = registry;
  }

  /**
   * Coordinate a set of engines for a task
   */
  coordinate(engines: Engine[]): CoordinationResult {
    const conflicts = this.detectConflicts(engines);
    const coordinated: string[] = [];
    let resolution: string | undefined;

    if (conflicts.length > 0) {
      resolution = this.resolveConflicts(conflicts);
    }

    // Verify all engines are in coordinated state
    for (const engine of engines) {
      const state = engine.getState();
      if (state.status === 'active' || state.status === 'idle') {
        coordinated.push(engine.id);
      }
    }

    return {
      success: coordinated.length === engines.length,
      coordinatedEngines: coordinated,
      conflicts,
      resolution,
    };
  }

  /**
   * Detect conflicts between engines
   */
  private detectConflicts(engines: Engine[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (let i = 0; i < engines.length; i++) {
      for (let j = i + 1; j < engines.length; j++) {
        const engineA = engines[i];
        const engineB = engines[j];
        const stateA = engineA.getState();
        const stateB = engineB.getState();

        // Check for resource conflicts
        if (this.hasResourceConflict(stateA, stateB)) {
          conflicts.push({
            engines: [engineA.id, engineB.id],
            type: 'resource',
            description: 'Competing for shared resources',
          });
        }

        // Check for state conflicts
        if (this.hasStateConflict(stateA, stateB)) {
          conflicts.push({
            engines: [engineA.id, engineB.id],
            type: 'state',
            description: 'Incompatible engine states',
          });
        }

        // Check for priority conflicts
        if (this.hasPriorityConflict(stateA, stateB)) {
          conflicts.push({
            engines: [engineA.id, engineB.id],
            type: 'priority',
            description: 'Priority order conflict',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve detected conflicts
   */
  private resolveConflicts(conflicts: Conflict[]): string {
    const resolutions: string[] = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'resource':
          resolutions.push(
            `Resource conflict between ${conflict.engines.join(' and ')}: ` +
              `Serializing access`
          );
          break;
        case 'state':
          resolutions.push(
            `State conflict between ${conflict.engines.join(' and ')}: ` +
              `Waiting for stable state`
          );
          break;
        case 'priority':
          resolutions.push(
            `Priority conflict between ${conflict.engines.join(' and ')}: ` +
              `Using default priority order`
          );
          break;
      }
    }

    return resolutions.join('; ');
  }

  /**
   * Check for resource conflicts
   */
  private hasResourceConflict(_stateA: EngineState, _stateB: EngineState): boolean {
    // Both engines are actively processing
    return (
      _stateA.status === 'active' &&
      _stateB.status === 'active' &&
      _stateA.metrics.requestCount > 10 &&
      _stateB.metrics.requestCount > 10
    );
  }

  /**
   * Check for state conflicts
   */
  private hasStateConflict(stateA: EngineState, stateB: EngineState): boolean {
    // One engine in error while other is active
    return (
      (stateA.status === 'error' && stateB.status === 'active') ||
      (stateA.status === 'active' && stateB.status === 'error')
    );
  }

  /**
   * Check for priority conflicts
   */
  private hasPriorityConflict(_stateA: EngineState, _stateB: EngineState): boolean {
    // This would check priority metadata if available
    return false;
  }

  /**
   * Get load balancing recommendations
   */
  getLoadBalanceRecommendations(): Map<string, number> {
    const recommendations = new Map<string, number>();
    const states = this.registry.getAllStates();

    let totalLoad = 0;
    states.forEach(state => {
      totalLoad += state.metrics.requestCount;
    });

    const avgLoad = totalLoad / Math.max(1, states.size);

    states.forEach((state, id) => {
      const currentLoad = state.metrics.requestCount;
      const targetLoad = avgLoad;
      // Recommendation: positive = reduce load, negative = can take more
      recommendations.set(id, currentLoad - targetLoad);
    });

    return recommendations;
  }

  /**
   * Synchronize state across engines
   */
  async synchronizeState(engineIds: string[]): Promise<void> {
    const engines = engineIds
      .map(id => this.registry.get(id))
      .filter((e): e is Engine => e !== undefined);

    // Get baseline state from first engine
    if (engines.length === 0) return;

    const baselineTime = Date.now();

    // Log synchronization
    console.log(
      '[EngineCoordinator] Synchronizing',
      engines.length,
      'engines at',
      baselineTime
    );

    // In a real implementation, this would coordinate state updates
    // For now, we just verify all engines are accessible
    for (const engine of engines) {
      engine.getState();
    }
  }
}
