import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { PROVIDER_TIMEOUTS } from '@/config/aiTimeouts.config';
import { getActiveAIProviders } from '@/config/featureFlags';
import { loadRegistry } from '@/services/ai/championChallenger';

export function getOrchestratorAgentStatus() {
  const base = getAdvancedAgentStatus('orchestrator');
  const activeProviders = getActiveAIProviders();
  const registry = loadRegistry();
  const localChampionCount = Object.values(registry.champions).filter(
    champion => champion.provider === 'ollama'
  ).length;

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `${activeProviders.length} providers actifs · ${localChampionCount}/${Object.keys(registry.champions).length} modes champions locaux`,
    evidence: [
      `Runtime: providers actifs ${activeProviders.join(', ')}.`,
      `Runtime: timeout Ollama ${PROVIDER_TIMEOUTS.ollama / 1000}s · tauri-backend ${PROVIDER_TIMEOUTS['tauri-backend'] / 1000}s.`,
      `Registre: tous les modes canoniques sont actuellement routes vers un champion Ollama local avec challengers cloud bornes.`,
      ...base.evidence,
    ],
    nextStep:
      'Brancher les metriques de charge et les snapshots health providers pour transformer cette surface d orchestration en vue live.',
  };
}

export function startOrchestratorAgent() {
  return getOrchestratorAgentStatus();
}
