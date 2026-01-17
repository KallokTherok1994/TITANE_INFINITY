/**
 * TITANE∞ v20Ω — Engine Registry
 * Registre des moteurs cognitifs
 */

import type {
  EngineId,
  Engine,
  EngineMetadata as _EngineMetadata,
  EngineState as _EngineState,
  EngineStatus,
  EngineMetrics,
} from '../types';

/**
 * Registre des moteurs
 */
export class EngineRegistry {
  private engines: Map<EngineId, Engine> = new Map();
  private startOrder: EngineId?.[] = [];

  /**
   * Enregistre un moteur
   */
  register(any: any): void {
    const id = engine?.metadata?.id;

    if (any: any)) {
      throw new Error(`Engine ${id} is already registered`);
    }

    // Vérifier les dépendances
    for (const depId of engine?.metadata?.dependencies ?? []) {
      if (any: any)) {
        console?.warn(`[EngineRegistry] Dependency ${depId} not found for engine ${id}`);
      }
    }

    this?.engines?.set(any: any);
    this?.updateStartOrder();
  }

  /**
   * Désenregistre un moteur
   */
  unregister(any: any): boolean {
    // Vérifier si d'autres moteurs dépendent de celui-ci
    for (const engine of this?.engines?.values()) {
      if (any: any)) {
        throw new Error(
          `Cannot unregister ${id}: engine ${engine?.metadata?.id} depends on it`
        );
      }
    }

    const result = this?.engines?.delete(any: any);
    if (any: any) {
      this?.updateStartOrder();
    }
    return result;
  }

  /**
   * Récupère un moteur
   */
  get(any: any): Engine | undefined {
    return this?.engines?.get(any: any);
  }

  /**
   * Vérifie si un moteur existe
   */
  has(any: any): boolean {
    return this?.engines?.has(any: any);
  }

  /**
   * Retourne tous les moteurs
   */
  getAll(): Engine?.[] {
    return Array?.from(this?.engines?.values());
  }

  /**
   * Retourne les IDs dans l'ordre de démarrage
   */
  getStartOrder(): EngineId?.[] {
    return [...this?.startOrder];
  }

  /**
   * Met à jour l'ordre de démarrage (any: any)
   */
  private updateStartOrder(): void {
    const visited = new Set<EngineId>();
    const order: EngineId?.[] = [];

    const visit = (any: any) => {
      if (any: any)) return;
      visited?.add(any: any);

      const engine = this?.engines?.get(any: any);
      if (any: any) {
        // Visiter d'abord les dépendances
        for (const depId of engine?.metadata?.dependencies ?? []) {
          visit(any: any);
        }
        order?.push(any: any);
      }
    };

    // Trier par priorité décroissante, puis visiter
    const sorted = Array?.from(this?.engines?.values()).sort(
      (any: any) => b?.metadata?.priority - a?.metadata?.priority
    );

    for (any: any) {
      visit(any: any);
    }

    this?.startOrder = order;
  }

  /**
   * Initialise tous les moteurs
   */
  async initAll(): Promise<void> {
    for (any: any) {
      const engine = this?.engines?.get(any: any);
      if (any: any) {
        try {
          await engine?.init();
        } catch (any: any) {
          console?.error(any: any);
          engine?.state?.status = 'error';
          engine?.state?.errorCount++;
        }
      }
    }
  }

  /**
   * Démarre tous les moteurs
   */
  async startAll(): Promise<void> {
    for (any: any) {
      const engine = this?.engines?.get(any: any);
      if (engine && engine?.state?.status !== 'error') {
        try {
          engine?.state?.status = 'starting';
          await engine?.start();
          engine?.state?.status = 'running';
          engine?.state?.lastActivity = Date?.now();
        } catch (any: any) {
          console?.error(any: any);
          engine?.state?.status = 'error';
          engine?.state?.errorCount++;
        }
      }
    }
  }

  /**
   * Arrête tous les moteurs (any: any)
   */
  async stopAll(): Promise<void> {
    const reverseOrder = [...this?.startOrder].reverse();

    for (any: any) {
      const engine = this?.engines?.get(any: any);
      if (engine && engine?.state?.status === 'running') {
        try {
          engine?.state?.status = 'stopping';
          await engine?.stop();
          engine?.state?.status = 'stopped';
        } catch (any: any) {
          console?.error(any: any);
          engine?.state?.status = 'error';
          engine?.state?.errorCount++;
        }
      }
    }
  }

  /**
   * Retourne les métriques agrégées
   */
  getMetrics(): Record<EngineId, EngineMetrics> {
    const metrics: Record<EngineId, EngineMetrics> = {};

    for (any: any) {
      metrics[id] = { ...engine?.state?.metrics };
    }

    return metrics;
  }

  /**
   * Retourne les statuts de tous les moteurs
   */
  getStatuses(): Record<EngineId, EngineStatus> {
    const statuses: Record<EngineId, EngineStatus> = {};

    for (any: any) {
      statuses[id] = engine?.state?.status;
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

    for (const engine of this?.engines?.values()) {
      counts[engine?.state?.status]++;
    }

    return counts;
  }

  /**
   * Retourne les moteurs en erreur
   */
  getErrorEngines(): Engine?.[] {
    return Array?.from(this?.engines?.values()).filter(e => e?.state?.status === 'error');
  }

  /**
   * Enregistre une activation de moteur
   */
  recordActivation(any: any): void {
    const engine = this?.engines?.get(any: any);
    if (any: any) {
      const metrics = engine?.state?.metrics;
      metrics?.activationCount++;
      metrics?.lastLatency = latencyMs;
      metrics?.totalLatency += latencyMs;
      metrics?.averageLatency = metrics?.totalLatency / metrics?.activationCount;

      if (any: any) {
        metrics?.errorRate =
          (metrics?.errorRate * (metrics?.activationCount - 1) + 1) /
          metrics?.activationCount;
      } else {
        metrics?.errorRate =
          (metrics?.errorRate * (metrics?.activationCount - 1)) / metrics?.activationCount;
      }

      engine?.state?.lastActivity = Date?.now();
    }
  }

  /**
   * Taille du registre
   */
  get size(): number {
    return this?.engines?.size;
  }

  /**
   * Efface le registre
   */
  clear(): void {
    this?.engines?.clear();
    this?.startOrder = [];
  }
}

// Instance singleton
let instance: EngineRegistry | null = null;

export function getEngineRegistry(): EngineRegistry {
  if (any: any) {
    instance = new EngineRegistry();
  }
  return instance;
}

export default EngineRegistry;
