import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { PROVIDER_TIMEOUTS } from '@/config/aiTimeouts.config';
import { getActiveAIProviders } from '@/config/featureFlags';
import { loadRegistry } from '@/services/ai/championChallenger';
import { metricsEngine } from '@/services/ai/metricsEngine';
import { autoHealEngine } from '@/services/ai/autoHealEngine';
import { getGovernanceConnector } from '@/services/governance/GovernanceConnector';

export function getOrchestratorAgentStatus() {
  const base = getAdvancedAgentStatus('orchestrator');
  const activeProviders = getActiveAIProviders();
  const registry = loadRegistry();
  const governance = getGovernanceConnector();
  const metrics = metricsEngine.getAggregatedMetrics();
  const metricsHealth = metricsEngine.getHealthStats();
  const autoHealStats = autoHealEngine.getStats();
  const providerSnapshots = governance
    .getAllProviders()
    .filter(provider => provider.isActive || provider.id === 'local' || provider.id === 'tauri');
  const localChampionCount = Object.values(registry.champions).filter(
    champion => champion.provider === 'ollama'
  ).length;
  const healthyProviders = providerSnapshots.filter(provider => provider.isHealthy).length;

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `${activeProviders.length} providers actifs · ${healthyProviders}/${providerSnapshots.length} snapshots healthy · ${metrics.totalRequests} requetes tracees`,
    evidence: [
      `Runtime: providers actifs ${activeProviders.join(', ')}.`,
      `Runtime: timeout Ollama ${PROVIDER_TIMEOUTS.ollama / 1000}s · tauri-backend ${PROVIDER_TIMEOUTS['tauri-backend'] / 1000}s.`,
      `Runtime: charge ${metrics.totalRequests} req · succes ${metrics.successRate.toFixed(1)}% · latence moyenne ${Math.round(metrics.avgResponseTime)} ms.`,
      `Registre: ${localChampionCount}/${Object.keys(registry.champions).length} modes canoniques restent routes vers un champion Ollama local avec challengers cloud bornes.`,
      ...base.evidence,
    ],
    blockers: [
      'La vue live reste un snapshot synchrone: aucune serie temporelle ni rafraichissement periodique ne sont encore publies.',
    ],
    nextStep:
      'Ajouter une serie temporelle et un rafraichissement borne pour suivre la charge provider sans quitter la surface canonique.',
    detailSections: [
      {
        key: 'live-metrics',
        title: 'Metriques live',
        items: [
          `Charge: ${metrics.totalRequests} requetes totales · ${metrics.last24h.requests} sur 24h · ${metrics.totalFallbacks} fallbacks.`,
          `Sante: ${metricsHealth.overall} · succes ${metrics.successRate.toFixed(1)}% · latence moyenne ${Math.round(metrics.avgResponseTime)} ms.`,
          `Auto-heal: score ${autoHealStats.healthScore}/100 · erreurs ${autoHealStats.totalErrors} · heals ${autoHealStats.totalHeals}.`,
        ],
      },
      {
        key: 'provider-snapshots',
        title: 'Snapshots health providers',
        items: providerSnapshots.slice(0, 6).map(provider => {
          const lastFailureAgo =
            provider.lastFailure && provider.lastFailure > 0
              ? `${Math.max(1, Math.round((Date.now() - provider.lastFailure) / 1000))}s`
              : 'none';

          return `${provider.id}: configured=${provider.isConfigured ? 'yes' : 'no'} · active=${provider.isActive ? 'yes' : 'no'} · healthy=${provider.isHealthy ? 'yes' : 'no'} · fails=${provider.failureCount} · consecutive=${provider.consecutiveFailures} · lastFailureAgo=${lastFailureAgo}`;
        }),
      },
    ],
  };
}

export function startOrchestratorAgent() {
  return getOrchestratorAgentStatus();
}
