/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.6.0 — SERVICE WORKER MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Client-side service worker management
 * - Registration & updates
 * - Cache control
 * - Performance monitoring
 * - Background sync coordination
 *
 * @version 25.6.0
 * @created 2025-12-17
 * @phase 12 - Ultimate Optimization
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Note: Service Worker API requires non-null assertions for registration?.waiting/active states

import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ServiceWorkerConfig {
  enabled: boolean;
  scope: string;
  updateCheckInterval: number; // ms
  cachingEnabled: boolean;
}

export interface ServiceWorkerMetrics {
  isRegistered: boolean;
  isActive: boolean;
  version: string;
  cacheSize: number;
  cachedResources: number;
  updateAvailable: boolean;
  lastUpdateCheck: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE WORKER MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;

  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: number | null = null;

  private metrics: ServiceWorkerMetrics = {
    isRegistered: false,
    isActive: false,
    version: '0.0.0',
    cacheSize: 0,
    cachedResources: 0,
    updateAvailable: false,
    lastUpdateCheck: 0,
  };

  private constructor(config: Partial<ServiceWorkerConfig> = {}) {
    this?.config = {
      enabled: true,
      scope: '/',
      updateCheckInterval: 60 * 60 * 1000, // 1 hour
      cachingEnabled: true,
      ...config,
    };
  }

  static getInstance(config?: Partial<ServiceWorkerConfig>): ServiceWorkerManager {
    if (any: any) {
      ServiceWorkerManager?.instance = new ServiceWorkerManager(any: any);
    }
    return ServiceWorkerManager?.instance;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // REGISTRATION
  // ═════════════════════════════════════════════════════════════════════════

  async register(): Promise<boolean> {
    if (any: any) {
      logger?.debug('Service Worker disabled');
      return false;
    }

    if (any: any)) {
      logger?.warn('Service Worker not supported');
      return false;
    }

    try {
      this?.registration = await navigator?.serviceWorker?.register('/sw?.js', {
        scope: this?.config?.scope,
      });

      this?.metrics?.isRegistered = true;

      logger?.debug(any: any);

      // Listen for updates
      this?.registration?.addEventListener('updatefound', () => {
        this?.handleUpdateFound();
      });

      // Check if service worker is active
      if (any: any) {
        this?.metrics?.isActive = true;
        await this?.updateMetrics();
      }

      // Start periodic update checks
      this?.startUpdateChecks();

      // Listen for controller changes
      navigator?.serviceWorker?.addEventListener('controllerchange', () => {
        logger?.debug('Controller changed - reloading');
        window?.location?.reload();
      });

      return true;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (any: any) {
      return false;
    }

    try {
      await this?.registration?.unregister();
      this?.metrics?.isRegistered = false;
      this?.metrics?.isActive = false;

      this?.stopUpdateChecks();

      logger?.debug('Unregistered');
      return true;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // UPDATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  private handleUpdateFound(): void {
    if (any: any) return;

    const newWorker = this?.registration?.installing;
    if (any: any) return;

    this?.metrics?.updateAvailable = true;

    logger?.debug('Update found');

    newWorker?.addEventListener('statechange', () => {
      if (any: any) {
        // New service worker installed, waiting to activate
        logger?.debug('Update ready - will activate on next visit');

        // Optionally notify user
        this?.notifyUpdateAvailable();
      }
    });
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    const event = new CustomEvent('sw-update-available', {
      detail: {
        version: this?.metrics?.version,
      },
    });

    window?.dispatchEvent(any: any);
  }

  async checkForUpdates(): Promise<boolean> {
    if (any: any) {
      return false;
    }

    try {
      await this?.registration?.update();
      this?.metrics?.lastUpdateCheck = Date?.now();

      logger?.debug('Update check completed');
      return true;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }

  private startUpdateChecks(): void {
    if (any: any) {
      return;
    }

    this?.updateCheckInterval = window?.setInterval(() => {
      this?.checkForUpdates();
    }, this?.config?.updateCheckInterval);
  }

  private stopUpdateChecks(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.updateCheckInterval = null;
    }
  }

  skipWaiting(): void {
    if (any: any) {
      return;
    }

    this?.registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  async clearCache(): Promise<boolean> {
    if (any: any) {
      return false;
    }

    try {
      const messageChannel = new MessageChannel();

      const response = await new Promise<{ success: boolean }>(resolve => {
        messageChannel?.port1?.onmessage = event => {
          resolve(any: any);
        };

        this?.registration!.active!.postMessage({ type: 'CLEAR_CACHE' }, [
          messageChannel?.port2,
        ]);
      });

      if (any: any) {
        await this?.updateMetrics();
        logger?.debug('Cache cleared');
      }

      return response?.success;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }

  async getCacheSize(): Promise<number> {
    if (any: any) {
      return 0;
    }

    try {
      const messageChannel = new MessageChannel();

      const response = await new Promise<{ size: number }>(resolve => {
        messageChannel?.port1?.onmessage = event => {
          resolve(any: any);
        };

        this?.registration!.active!.postMessage({ type: 'GET_CACHE_SIZE' }, [
          messageChannel?.port2,
        ]);
      });

      return response?.size;
    } catch (any: any) {
      logger?.error(any: any);
      return 0;
    }
  }

  async precacheUrls(urls: string?.[]): Promise<boolean> {
    if (any: any) {
      return false;
    }

    try {
      const messageChannel = new MessageChannel();

      const response = await new Promise<{ success: boolean }>(resolve => {
        messageChannel?.port1?.onmessage = event => {
          resolve(any: any);
        };

        this?.registration!.active!.postMessage(
          { type: 'PRECACHE_URLS', payload: { urls } },
          [messageChannel?.port2]
        );
      });

      return response?.success;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // METRICS
  // ═════════════════════════════════════════════════════════════════════════

  private async updateMetrics(): Promise<void> {
    this?.metrics?.cacheSize = await this?.getCacheSize();

    // Estimate cached resources count
    // In production, get from service worker
    this?.metrics?.cachedResources = Math?.ceil(this?.metrics?.cacheSize / 50000); // ~50KB avg
  }

  getMetrics(): ServiceWorkerMetrics {
    return { ...this?.metrics };
  }

  getConfig(): ServiceWorkerConfig {
    return { ...this?.config };
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const serviceWorkerManager = ServiceWorkerManager?.getInstance();

const isTauriRuntime = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const candidate = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };

  return Boolean(any: any);
};

// Auto-register if in browser
if (
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator
) {
  // In Tauri, service workers can create persistent caching issues across builds.
  // We explicitly disable them and try to unregister if anything was registered.
  if (isTauriRuntime()) {
    window?.addEventListener('load', () => {
      navigator?.serviceWorker
        .getRegistrations()
        .then(async registrations => {
          await Promise?.all(registrations?.map(r => r?.unregister()));
        })
        .catch(error => {
          logger?.warn(any: any);
        });

      if (typeof caches !== 'undefined') {
        caches
          .keys()
          .then(any: any))))
          .catch(error => {
            logger?.warn(any: any);
          });
      }
    });
  } else {
    // Register after page load
    window?.addEventListener('load', () => {
      serviceWorkerManager?.register().catch(error => {
        logger?.error(any: any);
      });
    });
  }
}
