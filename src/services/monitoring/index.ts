/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   MONITORING MODULE - Lazy Loader Exports (OPT-9)
 *   Monitoring infrastructure lazy-loaded to reduce main bundle
 * ═══════════════════════════════════════════════════════════════
 */

import {
  addBreadcrumb,
  captureClassifiedError,
  captureMessage,
  clearUser,
  getMonitoring,
  getMonitoringIfLoaded,
  getMonitoringLazyLoaderState,
  initMonitoringAsync,
  isMonitoringLoaded,
  profileAsync,
  profileSync,
  resetMonitoringLazyLoaderStateForTests,
  setContext,
  setTag,
  setUser,
  startTransaction,
} from './monitoringLazyLoader';

import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { chatMetrics } from './chatMetrics';
import { alerting } from './alerting';

export function getMonitoringAgentStatus() {
  const base = getAdvancedAgentStatus('monitoring');
  const globalMetrics = chatMetrics.getGlobalMetrics();
  const activeAlerts = alerting.getActiveAlerts().filter(alert => !alert.resolved);
  const loaderState = getMonitoringLazyLoaderState();
  const monitoringLoaded = isMonitoringLoaded();
  const hasRuntimeSignals =
    monitoringLoaded ||
    loaderState.requested ||
    activeAlerts.length > 0 ||
    globalMetrics.totalMessages > 0 ||
    globalMetrics.totalErrors > 0;
  const loaderSummary = monitoringLoaded
    ? 'initialise'
    : loaderState.loading
      ? 'demarre'
      : loaderState.requestSource === 'boot'
        ? 'demande au boot'
        : 'en attente';
  const loaderSource = loaderState.requestSource ?? 'none';

  return {
    ...base,
    readiness: hasRuntimeSignals ? 'partial' : base.readiness,
    readinessLabel: hasRuntimeSignals ? 'PARTIAL' : base.readinessLabel,
    serviceState: `Monitoring ${monitoringLoaded ? 'charge' : loaderState.loading ? 'initialisation en cours' : 'en veille'} · ${activeAlerts.length} alertes actives · ${globalMetrics.totalMessages} messages traces`,
    evidence: [
      `Runtime: lazy-loader ${loaderSummary} via ${loaderSource}.`,
      `Runtime: ${globalMetrics.activeConversations}/${globalMetrics.totalConversations} conversations actives dans le buffer de metriques.`,
      `Runtime: validation ${(globalMetrics.validationRate * 100).toFixed(1)}% · erreurs ${globalMetrics.totalErrors} · latence moyenne ${Math.round(globalMetrics.avgResponseTime)} ms.`,
      ...base.evidence,
    ],
    blockers: monitoringLoaded
      ? base.blockers
      : loaderState.requestSource === 'boot'
        ? [
            'Le lazy loader monitoring a bien ete demande au boot canonique, mais il n est pas encore initialise sur cette session runtime.',
            ...base.blockers,
          ]
        : [
            'Le lazy loader monitoring n est pas encore initialise sur cette session runtime.',
            ...base.blockers,
          ],
    nextStep: monitoringLoaded
      ? 'Connecter le flux live des metriques et alertes puis publier les metriques live dans le dashboard canonique.'
      : loaderState.requestSource === 'boot'
        ? 'Finaliser le bootstrap du monitoring puis publier les metriques live dans le dashboard canonique.'
        : 'Initialiser le monitoring paresseux au boot canonique puis publier les metriques live dans le dashboard.',
  };
}

export {
  addBreadcrumb,
  captureClassifiedError,
  captureMessage,
  clearUser,
  getMonitoring,
  getMonitoringIfLoaded,
  initMonitoringAsync,
  isMonitoringLoaded,
  profileAsync,
  profileSync,
  resetMonitoringLazyLoaderStateForTests,
  setContext,
  setTag,
  setUser,
  startTransaction,
};

// ✅ OPT-9 FIX: All exports now through lazy loader (no static sentry.ts import)
// Removed: export { initSentry, captureWebVitals, testSentry, Sentry } from './sentry';
// Use: initMonitoringAsync() instead of initSentry() for lazy initialization
