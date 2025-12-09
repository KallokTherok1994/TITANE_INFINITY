/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ServiceRegistry - Centralized service management for CoherenceEngine
 * Migrated from src/os/registry/ServiceRegistry.ts
 */

import type { Service } from '../types';

/**
 * ServiceRegistry - Manages all system services
 *
 * Features:
 * - Service registration and discovery
 * - Lifecycle management (init/destroy)
 * - Lazy initialization
 * - Health tracking
 */
export class ServiceRegistry {
  private services: Map<string, Service> = new Map();
  private initialized: Set<string> = new Set();
  private initOrder: string[] = [];

  /**
   * Register a service
   */
  register(service: Service): void {
    if (this.services.has(service.id)) {
      console.warn(`[ServiceRegistry] Service ${service.id} already registered, replacing`);
    }
    this.services.set(service.id, service);
    this.initOrder.push(service.id);
  }

  /**
   * Unregister a service
   */
  async unregister(id: string): Promise<boolean> {
    const service = this.services.get(id);
    if (service && this.initialized.has(id)) {
      try {
        await service.destroy();
      } catch (error) {
        console.error(`[ServiceRegistry] Error destroying service ${id}:`, error);
      }
      this.initialized.delete(id);
    }
    this.initOrder = this.initOrder.filter(i => i !== id);
    return this.services.delete(id);
  }

  /**
   * Get a service by ID
   */
  get<T extends Service>(id: string): T | undefined {
    return this.services.get(id) as T | undefined;
  }

  /**
   * Get all services
   */
  getAll(): Service[] {
    return Array.from(this.services.values());
  }

  /**
   * Get all service IDs
   */
  getIds(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if a service is registered
   */
  has(id: string): boolean {
    return this.services.has(id);
  }

  /**
   * Check if a service is initialized
   */
  isInitialized(id: string): boolean {
    return this.initialized.has(id);
  }

  /**
   * Initialize a specific service
   */
  async initService(id: string): Promise<void> {
    if (this.initialized.has(id)) return;

    const service = this.services.get(id);
    if (!service) {
      throw new Error(`Service ${id} not found`);
    }

    try {
      await service.init();
      this.initialized.add(id);
      console.log(`[ServiceRegistry] Initialized service: ${id}`);
    } catch (error) {
      console.error(`[ServiceRegistry] Failed to initialize service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Initialize all services in registration order
   */
  async initAll(): Promise<void> {
    for (const id of this.initOrder) {
      await this.initService(id);
    }
  }

  /**
   * Destroy all services in reverse order
   */
  async destroyAll(): Promise<void> {
    const reverseOrder = [...this.initOrder].reverse();
    for (const id of reverseOrder) {
      const service = this.services.get(id);
      if (service && this.initialized.has(id)) {
        try {
          await service.destroy();
          this.initialized.delete(id);
          console.log(`[ServiceRegistry] Destroyed service: ${id}`);
        } catch (error) {
          console.error(`[ServiceRegistry] Failed to destroy service ${id}:`, error);
        }
      }
    }
  }

  /**
   * Get service count
   */
  get size(): number {
    return this.services.size;
  }

  /**
   * Get initialized service count
   */
  get initializedCount(): number {
    return this.initialized.size;
  }
}
