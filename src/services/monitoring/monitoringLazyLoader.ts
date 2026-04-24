/**
 * TITANE∞ v30.0.0 — OPT-9: Monitoring Lazy Loader
 * Lazy-load monitoring infrastructure to reduce main bundle
 *
 * Pattern: Promise-based singleton with loading state tracking
 * Impact: -81 KB gzip from initial bundle
 */

type MonitoringModule = typeof import('./sentry');

export type MonitoringInitSource = 'boot' | 'demand';

export interface MonitoringLazyLoaderState {
  requested: boolean;
  loading: boolean;
  loaded: boolean;
  requestSource: MonitoringInitSource | null;
  lastAttemptAt: number | null;
  lastLoadedAt: number | null;
  lastError: string | null;
}

let monitoringInstance: MonitoringModule | null = null;
let loadingPromise: Promise<MonitoringModule> | null = null;
let monitoringRequestSource: MonitoringInitSource | null = null;
let lastMonitoringAttemptAt: number | null = null;
let lastMonitoringLoadedAt: number | null = null;
let lastMonitoringError: string | null = null;

function noteMonitoringRequest(source: MonitoringInitSource): void {
  monitoringRequestSource = monitoringRequestSource === 'boot' ? 'boot' : source;
  lastMonitoringAttemptAt = Date.now();
  lastMonitoringError = null;
}

function markMonitoringLoaded(): void {
  lastMonitoringLoadedAt = Date.now();
  lastMonitoringError = null;
}

function markMonitoringFailed(error: unknown): void {
  lastMonitoringError = error instanceof Error ? error.message : String(error);
}

/**
 * Get monitoring module (lazy-loaded, cached)
 * @returns Promise resolving to monitoring module
 */
export async function getMonitoring(
  source: MonitoringInitSource = 'demand'
): Promise<MonitoringModule> {
  if (monitoringInstance) {
    return monitoringInstance; // Cache hit
  }

  if (loadingPromise) {
    noteMonitoringRequest(source);
    return loadingPromise; // Loading in progress
  }

  noteMonitoringRequest(source);

  loadingPromise = (async () => {
    try {
      const module = await import('./sentry');
      monitoringInstance = module;
      markMonitoringLoaded();
      return module;
    } catch (error) {
      markMonitoringFailed(error);
      throw error;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/**
 * Initialize monitoring in background (non-blocking)
 * Safe to call multiple times (idempotent)
 */
export async function initMonitoringAsync(
  source: MonitoringInitSource = 'boot'
): Promise<boolean> {
  try {
    const monitoring = await getMonitoring(source);

    // Initialize Sentry if not already done
    if (!monitoring.Sentry.isEnabled()) {
      monitoring.initSentry();
    }

    // Capture Web Vitals for performance tracking
    monitoring.captureWebVitals();

    console.warn('✅ [MONITORING] Lazy initialization complete');
    return true;
  } catch (error) {
    console.warn('⚠️ [MONITORING] Lazy initialization failed:', error);
    markMonitoringFailed(error);
    return false;
  }
}

export function getMonitoringLazyLoaderState(): MonitoringLazyLoaderState {
  return {
    requested: monitoringRequestSource !== null,
    loading: loadingPromise !== null,
    loaded: monitoringInstance !== null,
    requestSource: monitoringRequestSource,
    lastAttemptAt: lastMonitoringAttemptAt,
    lastLoadedAt: lastMonitoringLoadedAt,
    lastError: lastMonitoringError,
  };
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

export function resetMonitoringLazyLoaderStateForTests(): void {
  monitoringInstance = null;
  loadingPromise = null;
  monitoringRequestSource = null;
  lastMonitoringAttemptAt = null;
  lastMonitoringLoadedAt = null;
  lastMonitoringError = null;
}

/**
 * Lazy wrapper for captureClassifiedError
 * Falls back to console.error if monitoring not loaded yet
 */
export async function captureClassifiedError(
  classification: any,
  error: Error
): Promise<void> {
  if (isMonitoringLoaded()) {
    const monitoring = getMonitoringIfLoaded();
    monitoring?.captureClassifiedError(classification, error);
  } else {
    // Fallback to console if monitoring not loaded
    console.error('[MONITORING-LAZY] Error (monitoring not loaded):', error);

    // Load monitoring in background for future errors
    getMonitoring()
      .then(m => {
        m.captureClassifiedError(classification, error);
      })
      .catch(err => {
        console.warn('[MONITORING-LAZY] Failed to load monitoring:', err);
      });
  }
}

/**
 * Lazy wrapper for captureMessage
 */
export async function captureMessage(message: string, level?: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring.captureMessage(message, level);
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
  monitoring.addBreadcrumb(message, category, data, level);
}

/**
 * Lazy wrapper for setUser
 */
export async function setUser(user: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring.setUser(user);
}

/**
 * Lazy wrapper for clearUser
 */
export async function clearUser(): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring.clearUser();
}

/**
 * Lazy wrapper for setTag
 */
export async function setTag(key: string, value: string): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring.setTag(key, value);
}

/**
 * Lazy wrapper for setContext
 */
export async function setContext(key: string, context: any): Promise<void> {
  const monitoring = await getMonitoring();
  monitoring.setContext(key, context);
}

/**
 * Lazy wrapper for startTransaction
 */
export async function startTransaction(name: string, op: string): Promise<any> {
  const monitoring = await getMonitoring();
  return monitoring.startTransaction(name, op);
}

/**
 * Lazy wrapper for profileAsync
 */
export async function profileAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const monitoring = await getMonitoring();
  return monitoring.profileAsync(name, fn);
}

/**
 * Lazy wrapper for profileSync
 */
export async function profileSync<T>(name: string, fn: () => T): Promise<T> {
  const monitoring = await getMonitoring();
  return monitoring.profileSync(name, fn);
}

/**
 * Re-export types for backward compatibility
 */
export type { MonitoringModule };
