/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω+ — AI SYSTEM EXPORTS
 *   Point d'entrée centralisé pour le sous-système IA complet
 * ═══════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// CORE ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────
export { aiOrchestrator, askTitan, streamTitan, getAIStatus } from './orchestrator';

// ─────────────────────────────────────────────────────────────────
// PROVIDERS
// ─────────────────────────────────────────────────────────────────
export { titaneLocalProvider } from './providers/titaneLocal';
export { tauriChatProvider } from './providers/tauriChat';
export { geminiProvider } from './providers/gemini';
export { openaiProvider } from './providers/openai';
export { claudeProvider } from './providers/claude';
export { ollamaProvider } from './providers/ollama';

// ─────────────────────────────────────────────────────────────────
// ENGINES v20Ω+
// ─────────────────────────────────────────────────────────────────
export { autoHealEngine } from './autoHealEngine';
export { metricsEngine } from './metricsEngine';
export { aiHealthMonitor } from './healthMonitor';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
export type {
  AIMessage,
  AIResponse,
  AIProvider,
  AIProviderName,
  AIConfig,
} from './types';

export type {
  AutoHealError,
  AutoHealAction,
  AutoHealStats,
  AutoHealConfig,
} from './autoHealEngine';

export type { MetricEvent, ProviderMetrics, AggregatedMetrics } from './metricsEngine';

export type { HealthAlert, HealthReport } from './healthMonitor';

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * 🎯 Quick Start — Initialiser le système IA complet
 */
export async function initializeAISystem(options?: {
  enableHealthMonitoring?: boolean;
  monitoringIntervalMs?: number;
}): Promise<{
  orchestrator: typeof import('./orchestrator').aiOrchestrator;
  metrics: typeof import('./metricsEngine').metricsEngine;
  autoHeal: typeof import('./autoHealEngine').autoHealEngine;
  healthMonitor: typeof import('./healthMonitor').aiHealthMonitor;
}> {
  const { aiOrchestrator } = await import('./orchestrator');
  const { metricsEngine } = await import('./metricsEngine');
  const { autoHealEngine } = await import('./autoHealEngine');
  const { aiHealthMonitor } = await import('./healthMonitor');

  // Démarrer health monitoring si demandé
  if (options?.enableHealthMonitoring !== false) {
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
    aiHealthMonitor.clearAlerts();
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
