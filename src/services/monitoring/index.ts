/**
 * TITANE_INFINITY v∞.19.5.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   MONITORING MODULE - Public exports
 * ═══════════════════════════════════════════════════════════════
 */

export {
  initSentry,
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
  captureWebVitals,
  testSentry,
  Sentry,
} from './sentry';
