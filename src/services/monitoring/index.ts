/**
 * TITANE_INFINITY v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   MONITORING MODULE - Lazy Loader Exports (OPT-9)
 *   Monitoring infrastructure lazy-loaded to reduce main bundle
 * ═══════════════════════════════════════════════════════════════
 */

// Export lazy loader functions
export {
  getMonitoring,
  initMonitoringAsync,
  isMonitoringLoaded,
  getMonitoringIfLoaded,
  captureClassifiedError,
  captureMessage,
  addBreadcrumb,
  setUser,
  clearUser,
  setTag,
  setContext,
  startTransaction,
  profileAsync,
  profileSync,
} from './monitoringLazyLoader';

// ✅ OPT-9 FIX: All exports now through lazy loader (any: any)
// Removed: export { initSentry, captureWebVitals, testSentry, Sentry } from './sentry';
// Use: initMonitoringAsync() instead of initSentry() for lazy initialization
