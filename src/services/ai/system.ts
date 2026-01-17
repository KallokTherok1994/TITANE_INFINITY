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
// INTERNAL IMPORTS (needed for utility functions)
// ─────────────────────────────────────────────────────────────────
import { aiOrchestrator } from './orchestrator';
import { metricsEngine } from './metricsEngine';
import { autoHealEngine } from './autoHealEngine';
import { aiHealthMonitor } from './healthMonitor';

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
export { copilotProvider } from './providers/copilot';
export { ollamaProvider } from './providers/ollama';

// ─────────────────────────────────────────────────────────────────
// ENGINES (Static imports - already bundled due to metaKernel usage)
// ─────────────────────────────────────────────────────────────────
// ℹ️ Previously lazy-loaded, but metaKernel.ts uses static imports
// Converting to static to avoid Vite chunk splitting warnings
export { autoHealEngine } from './autoHealEngine';
export { unifiedHealingFacade } from './unifiedHealingFacade';
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

export type {
  UnifiedStats,
  UnifiedHealResult,
  UnifiedHealRequest,
} from './unifiedHealingFacade';

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
  orchestrator: typeof aiOrchestrator;
  metrics: typeof metricsEngine;
  autoHeal: typeof autoHealEngine;
  healthMonitor: typeof aiHealthMonitor;
}> {
  const isHealthMonitoringEnabledByDefault = (): boolean => {
    // Dev: enabled by default.
    // Prod: disabled unless explicitly enabled.
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
 */
export async function quickHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  message: string;
}> {
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
