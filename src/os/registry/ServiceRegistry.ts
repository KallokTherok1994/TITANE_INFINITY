/**
 * TITANE∞ v20Ω — Service Registry
 * Registre des services applicatifs
 */

import type { ServiceId, Service, ServiceMetadata, ServiceStatus } from '../types';

/**
 * Registre des services
 */
export class ServiceRegistry {
  private services: Map<ServiceId, Service> = new Map();
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private healthCheckIntervalMs = 30000; // 30 secondes

  /**
   * Enregistre un service
   */
  register<T>(metadata: ServiceMetadata, instance: T): void {
    const id = metadata.id;

    if (this.services.has(id)) {
      throw new Error(`Service ${id} is already registered`);
    }

    const service: Service<T> = {
      metadata,
      status: 'available',
      instance,
    };

    this.services.set(id, service as Service);
  }

  /**
   * Désenregistre un service
   */
  unregister(id: ServiceId): boolean {
    return this.services.delete(id);
  }

  /**
   * Récupère un service
   */
  get<T>(id: ServiceId): T | undefined {
    const service = this.services.get(id);
    return service?.instance as T | undefined;
  }

  /**
   * Récupère un service avec ses métadonnées
   */
  getService(id: ServiceId): Service | undefined {
    return this.services.get(id);
  }

  /**
   * Vérifie si un service existe
   */
  has(id: ServiceId): boolean {
    return this.services.has(id);
  }

  /**
   * Vérifie si un service est disponible
   */
  isAvailable(id: ServiceId): boolean {
    const service = this.services.get(id);
    return service?.status === 'available';
  }

  /**
   * Retourne tous les services
   */
  getAll(): Service[] {
    return Array.from(this.services.values());
  }

  /**
   * Retourne les IDs de tous les services
   */
  getAllIds(): ServiceId[] {
    return Array.from(this.services.keys());
  }

  /**
   * Met à jour le statut d'un service
   */
  setStatus(id: ServiceId, status: ServiceStatus): void {
    const service = this.services.get(id);
    if (service) {
      service.status = status;
    }
  }

  /**
   * Démarre les health checks périodiques
   */
  startHealthChecks(): void {
    if (this.healthCheckInterval) return;

    this.healthCheckInterval = setInterval(() => {
      this.runHealthChecks().catch(console.error);
    }, this.healthCheckIntervalMs);

    // Premier check immédiat
    this.runHealthChecks().catch(console.error);
  }

  /**
   * Arrête les health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Exécute les health checks
   */
  async runHealthChecks(): Promise<Map<ServiceId, boolean>> {
    const results = new Map<ServiceId, boolean>();

    for (const [id, service] of this.services) {
      const healthCheck = service.metadata.healthCheck;

      if (healthCheck) {
        try {
          const healthy = await healthCheck();
          results.set(id, healthy);
          service.status = healthy ? 'available' : 'degraded';
        } catch (error) {
          console.error(`[ServiceRegistry] Health check failed for ${id}:`, error);
          results.set(id, false);
          service.status = 'unavailable';
        }
      } else {
        // Sans health check, considérer comme disponible
        results.set(id, true);
      }
    }

    return results;
  }

  /**
   * Retourne les statuts de tous les services
   */
  getStatuses(): Record<ServiceId, ServiceStatus> {
    const statuses: Record<ServiceId, ServiceStatus> = {};

    for (const [id, service] of this.services) {
      statuses[id] = service.status;
    }

    return statuses;
  }

  /**
   * Compte les services par statut
   */
  countByStatus(): Record<ServiceStatus, number> {
    const counts: Record<ServiceStatus, number> = {
      available: 0,
      unavailable: 0,
      degraded: 0,
    };

    for (const service of this.services.values()) {
      counts[service.status]++;
    }

    return counts;
  }

  /**
   * Retourne les services dégradés ou indisponibles
   */
  getUnhealthyServices(): Service[] {
    return Array.from(this.services.values())
      .filter(s => s.status !== 'available');
  }

  /**
   * Recherche des services par tag/endpoint
   */
  findByEndpoint(endpoint: string): Service[] {
    return Array.from(this.services.values())
      .filter(s => s.metadata.endpoints?.includes(endpoint));
  }

  /**
   * Taille du registre
   */
  get size(): number {
    return this.services.size;
  }

  /**
   * Efface le registre
   */
  clear(): void {
    this.stopHealthChecks();
    this.services.clear();
  }
}

// Instance singleton
let instance: ServiceRegistry | null = null;

export function getServiceRegistry(): ServiceRegistry {
  if (!instance) {
    instance = new ServiceRegistry();
  }
  return instance;
}

export default ServiceRegistry;
