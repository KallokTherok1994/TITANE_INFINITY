/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω+ — AI SYSTEM UTILITIES (TDZ CRISIS FIX v26.3.1)
 *   Séparation des fonctions utilitaires pour éviter dépendances circulaires
 *   lors de la bundlification Vite (services-ai chunk).
 *   
 *   ISSUE: Utilité initializeAISystem() appelle directement les instances,
 *   créant un cycle lors de la fusion des chunks Vite.
 *   
 *   FIX: Lazy imports à l'intérieur des fonctions (pas au top-level).
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * 🎯 Quick Start — Initialiser le système IA complet
 * ⚠️ Imports LAZY pour éviter le TDZ lors de bundle merge
 */
export async function initializeAISystem(options?: {
  enableHealthMonitoring?: boolean;
  monitoringIntervalMs?: number;
}): Promise<{
  orchestrator: unknown;
  metrics: unknown;
  autoHeal: unknown;
  healthMonitor: unknown;
}> {
  // LAZY IMPORTS: Importés APRÈS appel de fonction (pas au top-level)
  // Cela évite le TDZ car la dépendance circulaire n'existe qu'à runtime
  const { aiOrchestrator } = await import('./orchestrator');
  const { metricsEngine } = await import('./metricsEngine');
  const { autoHealEngine } = await import('./autoHealEngine');
  const { aiHealthMonitor } = await import('./healthMonitor');

  const isHealthMonitoringEnabledByDefault = (): boolean => {
    if (import.meta.env.DEV) return true;

    if (typeof window === 'undefined') {
      return false;
    }

    const envEnabled =
      String(import.meta.env.VITE_AI_HEALTH_MONITORING_ENABLED ?? '') === '1';
    const storedEnabled = window.localStorage.getItem(
      'titane_ai_health_monitoring_enabled'
    );
    const lsEnabled = storedEnabled === '1' || storedEnabled === 'true';

    return envEnabled || lsEnabled;
  };

  // Démarrer health monitoring si explicitement demandé (ou par défaut en dev)
  const enableHealthMonitoring =
    options?.enableHealthMonitoring ?? isHealthMonitoringEnabledByDefault();
  if (enableHealthMonitoring) {
    aiHealthMonitor.startMonitoring();
  }

  return {
    orchestrator: aiOrchestrator,
    metrics: metricsEngine,
    autoHeal: autoHealEngine,
    healthMonitor: aiHealthMonitor,
  };
}

/**
 * 🔍 Quick Check — Vérifier santé du système
 * ⚠️ Lazy imports pour éviter TDZ à la bundlification
 */
export async function quickHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  message: string;
}> {
  const { aiHealthMonitor } = await import('./healthMonitor');
  const report = await aiHealthMonitor.getHealthReport();

  let message = '';
  if (report.overall === 'healthy') {
    message = `✅ Système opérationnel (${report.score}/100)`;
  } else if (report.overall === 'degraded') {
    message = `⚠️ Système dégradé (${report.score}/100) - ${report.alerts.length} alertes`;
  } else {
    message = `🚨 Système critique (${report.score}/100) - ${report.alerts.length} alertes`;
  }

  return {
    status: report.overall,
    score: report.score,
    message,
  };
}

/**
 * 📊 Quick Stats — Statistiques rapides
 * ⚠️ Lazy imports
 */
export async function quickStats(): Promise<{
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  providersCount: number;
}> {
  const { metricsEngine } = await import('./metricsEngine');
  const metrics = metricsEngine.getAggregatedMetrics();

  return {
    totalRequests: metrics.totalRequests,
    successRate: metrics.successRate,
    avgLatency: metrics.avgResponseTime,
    providersCount: metrics.providers.length,
  };
}

/**
 * 🔧 Quick Fix — Tentative de réparation automatique
 * ⚠️ Lazy imports
 */
export async function quickFix(): Promise<{
  success: boolean;
  message: string;
  actions: string[];
}> {
  const { aiOrchestrator } = await import('./orchestrator');
  const { aiHealthMonitor } = await import('./healthMonitor');

  const actions: string[] = [];

  try {
    // Reset providers
    await aiOrchestrator.resetAllProviders();
    actions.push('✅ Providers réinitialisés');

    // Clear old alerts
    aiHealthMonitor.clearAllAlerts();
    actions.push('✅ Alertes nettoyées');

    return {
      success: true,
      message: 'Réparation automatique effectuée avec succès',
      actions,
    };
  } catch (error) {
    return {
      success: false,
      message: `Échec de la réparation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      actions,
    };
  }
}
