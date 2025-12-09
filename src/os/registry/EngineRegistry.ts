/**
 * TITANE∞ v20Ω — Engine Registry
 * Registre des moteurs cognitifs
 */

import type { EngineId, Engine, EngineMetadata as _EngineMetadata, EngineState as _EngineState, EngineStatus, EngineMetrics } from '../types';

/**
 * Registre des moteurs
 */
export class EngineRegistry {
  private engines: Map<EngineId, Engine> = new Map();
  private startOrder: EngineId[] = [];

  /**
   * Enregistre un moteur
   */
  register(engine: Engine): void {
    const id = engine.metadata.id;

    if (this.engines.has(id)) {
      throw new Error(`Engine ${id} is already registered`);
    }

    // Vérifier les dépendances
    for (const depId of engine.metadata.dependencies ?? []) {
      if (!this.engines.has(depId)) {
        console.warn(`[EngineRegistry] Dependency ${depId} not found for engine ${id}`);
      }
    }

    this.engines.set(id, engine);
    this.updateStartOrder();
  }

  /**
   * Désenregistre un moteur
   */
  unregister(id: EngineId): boolean {
    // Vérifier si d'autres moteurs dépendent de celui-ci
    for (const engine of this.engines.values()) {
      if (engine.metadata.dependencies?.includes(id)) {
        throw new Error(`Cannot unregister ${id}: engine ${engine.metadata.id} depends on it`);
      }
    }

    const result = this.engines.delete(id);
    if (result) {
      this.updateStartOrder();
    }
    return result;
  }

  /**
   * Récupère un moteur
   */
  get(id: EngineId): Engine | undefined {
    return this.engines.get(id);
  }

  /**
   * Vérifie si un moteur existe
   */
  has(id: EngineId): boolean {
    return this.engines.has(id);
  }

  /**
   * Retourne tous les moteurs
   */
  getAll(): Engine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Retourne les IDs dans l'ordre de démarrage
   */
  getStartOrder(): EngineId[] {
    return [...this.startOrder];
  }

  /**
   * Met à jour l'ordre de démarrage (tri topologique)
   */
  private updateStartOrder(): void {
    const visited = new Set<EngineId>();
    const order: EngineId[] = [];

    const visit = (id: EngineId) => {
      if (visited.has(id)) return;
      visited.add(id);

      const engine = this.engines.get(id);
      if (engine) {
        // Visiter d'abord les dépendances
        for (const depId of engine.metadata.dependencies ?? []) {
          visit(depId);
        }
        order.push(id);
      }
    };

    // Trier par priorité décroissante, puis visiter
    const sorted = Array.from(this.engines.values())
      .sort((a, b) => b.metadata.priority - a.metadata.priority);

    for (const engine of sorted) {
      visit(engine.metadata.id);
    }

    this.startOrder = order;
  }

  /**
   * Initialise tous les moteurs
   */
  async initAll(): Promise<void> {
    for (const id of this.startOrder) {
      const engine = this.engines.get(id);
      if (engine) {
        try {
          await engine.init();
        } catch (error) {
          console.error(`[EngineRegistry] Failed to init engine ${id}:`, error);
          engine.state.status = 'error';
          engine.state.errorCount++;
        }
      }
    }
  }

  /**
   * Démarre tous les moteurs
   */
  async startAll(): Promise<void> {
    for (const id of this.startOrder) {
      const engine = this.engines.get(id);
      if (engine && engine.state.status !== 'error') {
        try {
          engine.state.status = 'starting';
          await engine.start();
          engine.state.status = 'running';
          engine.state.lastActivity = Date.now();
        } catch (error) {
          console.error(`[EngineRegistry] Failed to start engine ${id}:`, error);
          engine.state.status = 'error';
          engine.state.errorCount++;
        }
      }
    }
  }

  /**
   * Arrête tous les moteurs (ordre inverse)
   */
  async stopAll(): Promise<void> {
    const reverseOrder = [...this.startOrder].reverse();

    for (const id of reverseOrder) {
      const engine = this.engines.get(id);
      if (engine && engine.state.status === 'running') {
        try {
          engine.state.status = 'stopping';
          await engine.stop();
          engine.state.status = 'stopped';
        } catch (error) {
          console.error(`[EngineRegistry] Failed to stop engine ${id}:`, error);
          engine.state.status = 'error';
          engine.state.errorCount++;
        }
      }
    }
  }

  /**
   * Retourne les métriques agrégées
   */
  getMetrics(): Record<EngineId, EngineMetrics> {
    const metrics: Record<EngineId, EngineMetrics> = {};

    for (const [id, engine] of this.engines) {
      metrics[id] = { ...engine.state.metrics };
    }

    return metrics;
  }

  /**
   * Retourne les statuts de tous les moteurs
   */
  getStatuses(): Record<EngineId, EngineStatus> {
    const statuses: Record<EngineId, EngineStatus> = {};

    for (const [id, engine] of this.engines) {
      statuses[id] = engine.state.status;
    }

    return statuses;
  }

  /**
   * Compte les moteurs par statut
   */
  countByStatus(): Record<EngineStatus, number> {
    const counts: Record<EngineStatus, number> = {
      idle: 0,
      starting: 0,
      running: 0,
      stopping: 0,
      stopped: 0,
      error: 0,
    };

    for (const engine of this.engines.values()) {
      counts[engine.state.status]++;
    }

    return counts;
  }

  /**
   * Retourne les moteurs en erreur
   */
  getErrorEngines(): Engine[] {
    return Array.from(this.engines.values()).filter(e => e.state.status === 'error');
  }

  /**
   * Enregistre une activation de moteur
   */
  recordActivation(id: EngineId, latencyMs: number, isError = false): void {
    const engine = this.engines.get(id);
    if (engine) {
      const metrics = engine.state.metrics;
      metrics.activationCount++;
      metrics.lastLatency = latencyMs;
      metrics.totalLatency += latencyMs;
      metrics.averageLatency = metrics.totalLatency / metrics.activationCount;

      if (isError) {
        metrics.errorRate = (metrics.errorRate * (metrics.activationCount - 1) + 1) / metrics.activationCount;
      } else {
        metrics.errorRate = (metrics.errorRate * (metrics.activationCount - 1)) / metrics.activationCount;
      }

      engine.state.lastActivity = Date.now();
    }
  }

  /**
   * Taille du registre
   */
  get size(): number {
    return this.engines.size;
  }

  /**
   * Efface le registre
   */
  clear(): void {
    this.engines.clear();
    this.startOrder = [];
  }
}

// Instance singleton
let instance: EngineRegistry | null = null;

export function getEngineRegistry(): EngineRegistry {
  if (!instance) {
    instance = new EngineRegistry();
  }
  return instance;
}

export default EngineRegistry;
