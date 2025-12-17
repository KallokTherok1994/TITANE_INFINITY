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
// Note: Service Worker API requires non-null assertions for registration.waiting/active states

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
    this.config = {
      enabled: true,
      scope: '/',
      updateCheckInterval: 60 * 60 * 1000, // 1 hour
      cachingEnabled: true,
      ...config,
    };
  }

  static getInstance(config?: Partial<ServiceWorkerConfig>): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager(config);
    }
    return ServiceWorkerManager.instance;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // REGISTRATION
  // ═════════════════════════════════════════════════════════════════════════

  async register(): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('[ServiceWorkerManager] Service Worker disabled');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[ServiceWorkerManager] Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: this.config.scope,
      });

      this.metrics.isRegistered = true;

      console.log('[ServiceWorkerManager] Registered:', this.registration.scope);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Check if service worker is active
      if (this.registration.active) {
        this.metrics.isActive = true;
        await this.updateMetrics();
      }

      // Start periodic update checks
      this.startUpdateChecks();

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[ServiceWorkerManager] Controller changed - reloading');
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.error('[ServiceWorkerManager] Registration failed:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.unregister();
      this.metrics.isRegistered = false;
      this.metrics.isActive = false;

      this.stopUpdateChecks();

      console.log('[ServiceWorkerManager] Unregistered');
      return true;
    } catch (error) {
      console.error('[ServiceWorkerManager] Unregister failed:', error);
      return false;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // UPDATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  private handleUpdateFound(): void {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    this.metrics.updateAvailable = true;

    console.log('[ServiceWorkerManager] Update found');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker installed, waiting to activate
        console.log('[ServiceWorkerManager] Update ready - will activate on next visit');

        // Optionally notify user
        this.notifyUpdateAvailable();
      }
    });
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    const event = new CustomEvent('sw-update-available', {
      detail: {
        version: this.metrics.version,
      },
    });

    window.dispatchEvent(event);
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      this.metrics.lastUpdateCheck = Date.now();

      console.log('[ServiceWorkerManager] Update check completed');
      return true;
    } catch (error) {
      console.error('[ServiceWorkerManager] Update check failed:', error);
      return false;
    }
  }

  private startUpdateChecks(): void {
    if (this.updateCheckInterval !== null) {
      return;
    }

    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  private stopUpdateChecks(): void {
    if (this.updateCheckInterval !== null) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  skipWaiting(): void {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═════════════════════════════════════════════════════════════════════════

  async clearCache(): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    try {
      const messageChannel = new MessageChannel();

      const response = await new Promise<{ success: boolean }>(resolve => {
        messageChannel.port1.onmessage = event => {
          resolve(event.data);
        };

        this.registration!.active!.postMessage({ type: 'CLEAR_CACHE' }, [
          messageChannel.port2,
        ]);
      });

      if (response.success) {
        await this.updateMetrics();
        console.log('[ServiceWorkerManager] Cache cleared');
      }

      return response.success;
    } catch (error) {
      console.error('[ServiceWorkerManager] Clear cache failed:', error);
      return false;
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.registration || !this.registration.active) {
      return 0;
    }

    try {
      const messageChannel = new MessageChannel();

      const response = await new Promise<{ size: number }>(resolve => {
        messageChannel.port1.onmessage = event => {
          resolve(event.data);
        };

        this.registration!.active!.postMessage({ type: 'GET_CACHE_SIZE' }, [
          messageChannel.port2,
        ]);
      });

      return response.size;
    } catch (error) {
      console.error('[ServiceWorkerManager] Get cache size failed:', error);
      return 0;
    }
  }

  async precacheUrls(urls: string[]): Promise<boolean> {
    if (!this.registration || !this.registration.active) {
      return false;
    }

    try {
      const messageChannel = new MessageChannel();

      const response = await new Promise<{ success: boolean }>(resolve => {
        messageChannel.port1.onmessage = event => {
          resolve(event.data);
        };

        this.registration!.active!.postMessage(
          { type: 'PRECACHE_URLS', payload: { urls } },
          [messageChannel.port2]
        );
      });

      return response.success;
    } catch (error) {
      console.error('[ServiceWorkerManager] Precache URLs failed:', error);
      return false;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // METRICS
  // ═════════════════════════════════════════════════════════════════════════

  private async updateMetrics(): Promise<void> {
    this.metrics.cacheSize = await this.getCacheSize();

    // Estimate cached resources count
    // In production, get from service worker
    this.metrics.cachedResources = Math.ceil(this.metrics.cacheSize / 50000); // ~50KB avg
  }

  getMetrics(): ServiceWorkerMetrics {
    return { ...this.metrics };
  }

  getConfig(): ServiceWorkerConfig {
    return { ...this.config };
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const serviceWorkerManager = ServiceWorkerManager.getInstance();

// Auto-register if in browser
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Register after page load
  window.addEventListener('load', () => {
    serviceWorkerManager.register().catch(error => {
      console.error('[ServiceWorkerManager] Auto-registration failed:', error);
    });
  });
}
