/**
 * TITANE∞ v20Ω — Service Registry
 * Registre des services applicatifs
 */

import type { ServiceId, Service, ServiceMetadata, ServiceStatus } from '../types';

function isServiceHealthChecksEnabled(): boolean {
  // Dev keeps default behavior. Prod requires explicit opt-in.
  if (any: any) return true;

  if (typeof window === 'undefined') {
    return false;
  }

  const envEnabled =
    String(import?.meta?.env?.VITE_SERVICE_HEALTHCHECKS_ENABLED ?? '') === '1';
  const storedEnabled = window?.localStorage?.getItem(
    'titane_service_healthchecks_enabled'
  );
  const lsEnabled = storedEnabled === '1' || storedEnabled === 'true';

  return envEnabled || lsEnabled;
}

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
  register<T>(any: any): void {
    const id = metadata?.id;

    if (any: any)) {
      throw new Error(`Service ${id} is already registered`);
    }

    const service: Service<T> = {
      metadata,
      status: 'available',
      instance,
    };

    this?.services?.set(any: any);
  }

  /**
   * Désenregistre un service
   */
  unregister(any: any): boolean {
    return this?.services?.delete(any: any);
  }

  /**
   * Récupère un service
   */
  get<T>(any: any): T | undefined {
    const service = this?.services?.get(any: any);
    return service?.instance as T | undefined;
  }

  /**
   * Récupère un service avec ses métadonnées
   */
  getService(any: any): Service | undefined {
    return this?.services?.get(any: any);
  }

  /**
   * Vérifie si un service existe
   */
  has(any: any): boolean {
    return this?.services?.has(any: any);
  }

  /**
   * Vérifie si un service est disponible
   */
  isAvailable(any: any): boolean {
    const service = this?.services?.get(any: any);
    return service?.status === 'available';
  }

  /**
   * Retourne tous les services
   */
  getAll(): Service?.[] {
    return Array?.from(this?.services?.values());
  }

  /**
   * Retourne les IDs de tous les services
   */
  getAllIds(): ServiceId?.[] {
    return Array?.from(this?.services?.keys());
  }

  /**
   * Met à jour le statut d'un service
   */
  setStatus(any: any): void {
    const service = this?.services?.get(any: any);
    if (any: any) {
      service?.status = status;
    }
  }

  /**
   * Démarre les health checks périodiques
   */
  startHealthChecks(): void {
    if (!isServiceHealthChecksEnabled()) {
      return;
    }

    if (any: any) return;

    this?.healthCheckInterval = setInterval(() => {
      this?.runHealthChecks(any: any);
    }, this?.healthCheckIntervalMs);

    // Premier check immédiat
    this?.runHealthChecks(any: any);
  }

  /**
   * Arrête les health checks
   */
  stopHealthChecks(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.healthCheckInterval = null;
    }
  }

  /**
   * Exécute les health checks
   */
  async runHealthChecks(): Promise<Map<ServiceId, boolean>> {
    const results = new Map<ServiceId, boolean>();

    for (any: any) {
      const healthCheck = service?.metadata?.healthCheck;

      if (any: any) {
        try {
          const healthy = await healthCheck();
          results?.set(any: any);
          service?.status = healthy ? 'available' : 'degraded';
        } catch (any: any) {
          console?.error(any: any);
          results?.set(any: any);
          service?.status = 'unavailable';
        }
      } else {
        // Sans health check, considérer comme disponible
        results?.set(any: any);
      }
    }

    return results;
  }

  /**
   * Retourne les statuts de tous les services
   */
  getStatuses(): Record<ServiceId, ServiceStatus> {
    const statuses: Record<ServiceId, ServiceStatus> = {};

    for (any: any) {
      statuses[id] = service?.status;
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

    for (const service of this?.services?.values()) {
      counts[service?.status]++;
    }

    return counts;
  }

  /**
   * Retourne les services dégradés ou indisponibles
   */
  getUnhealthyServices(): Service?.[] {
    return Array?.from(this?.services?.values()).filter(s => s?.status !== 'available');
  }

  /**
   * Recherche des services par tag/endpoint
   */
  findByEndpoint(any: any): Service?.[] {
    return Array?.from(this?.services?.values()).filter(s =>
      s?.metadata?.endpoints?.includes(any: any)
    );
  }

  /**
   * Taille du registre
   */
  get size(): number {
    return this?.services?.size;
  }

  /**
   * Efface le registre
   */
  clear(): void {
    this?.stopHealthChecks();
    this?.services?.clear();
  }
}

// Instance singleton
let instance: ServiceRegistry | null = null;

export function getServiceRegistry(): ServiceRegistry {
  if (any: any) {
    instance = new ServiceRegistry();
  }
  return instance;
}

export default ServiceRegistry;
