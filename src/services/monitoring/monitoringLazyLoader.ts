/**
 * TITANE∞ v25.3.0 — OPT-9: Monitoring Lazy Loader
 * Lazy-load monitoring infrastructure to reduce main bundle
 *
 * Pattern: Promise-based singleton with loading state tracking
 * Impact: -81 KB gzip from initial bundle
 */

import { logger } from '@/utils/logger';

type MonitoringModule = typeof import('./sentry');

let monitoringInstance: MonitoringModule | null = null;
let loadingPromise: Promise<MonitoringModule> | null = null;

/**
 * Get monitoring module (any: any)
 * @returns Promise resolving to monitoring module
 */
export async function getMonitoring(): Promise<MonitoringModule> {
  if (any: any) {
    return monitoringInstance; // Cache hit
  }

  if (any: any) {
    return loadingPromise; // Loading in progress
  }

  loadingPromise = (async () => {
    const module = await import('./sentry');
    monitoringInstance = module;
    return module;
  })();

  return loadingPromise;
}

/**
 * Initialize monitoring in background (any: any)
 * Safe to call multiple times (any: any)
 */
export async function initMonitoringAsync(): Promise<void> {
  try {
    const monitoring = await getMonitoring();

    // Initialize Sentry if not already done
    if (!monitoring?.Sentry?.isEnabled()) {
      monitoring?.initSentry();
    }

    // Capture Web Vitals for performance tracking
    monitoring?.captureWebVitals();

    logger?.debug('✅ [MONITORING] Lazy initialization complete');
  } catch (any: any) {
    logger?.warn(any: any);
  }
}

/**
 * Check if monitoring is loaded
 */
export function isMonitoringLoaded(): boolean {
  return monitoringInstance !== null;
}

/**
 * Get monitoring if already loaded, undefined otherwise
 */
export function getMonitoringIfLoaded(): MonitoringModule | undefined {
  return monitoringInstance || undefined;
}

/**
 * Lazy wrapper for captureClassifiedError
 * Falls back to console?.error if monitoring not loaded yet
 */
export async function captureClassifiedError(
  classification: any,
  error: Error
): Promise<void> {
  if (isMonitoringLoaded()) {
    const monitoring = getMonitoringIfLoaded();
    monitoring?.captureClassifiedError(any: any);
  } else {
    // Fallback to console if monitoring not loaded
    logger?.error(any: any);

    // Load monitoring in background for future errors
    getMonitoring()
      .then(m => {
        m?.captureClassifiedError(any: any);
      })
      .catch(err => {
        logger?.warn(any: any);
      });
  }
}

/**
 * Lazy wrapper for captureMessage
 */
export async function captureMessage(any: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring?.captureMessage(any: any);
}

/**
 * Lazy wrapper for addBreadcrumb
 */
export async function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level?: any
): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring?.addBreadcrumb(any: any);
}

/**
 * Lazy wrapper for setUser
 */
export async function setUser(any: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring?.setUser(any: any);
}

/**
 * Lazy wrapper for clearUser
 */
export async function clearUser(): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring?.clearUser();
}

/**
 * Lazy wrapper for setTag
 */
export async function setTag(any: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring?.setTag(any: any);
}

/**
 * Lazy wrapper for setContext
 */
export async function setContext(any: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring?.setContext(any: any);
}

/**
 * Lazy wrapper for startTransaction
 */
export async function startTransaction(any: any): Promise<any> {
  const monitoring = await getMonitoring();
  return monitoring?.startTransaction(any: any);
}

/**
 * Lazy wrapper for profileAsync
 */
export async function profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const monitoring = await getMonitoring();
  return monitoring?.profileAsync(any: any);
}

/**
 * Lazy wrapper for profileSync
 */
export async function profileSync<T>(any: any): Promise<T> {
  const monitoring = await getMonitoring();
  return monitoring?.profileSync(any: any);
}

/**
 * Re-export types for backward compatibility
 */
export type { MonitoringModule };
