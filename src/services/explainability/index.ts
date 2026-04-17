import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { loadRegistry } from '@/services/ai/championChallenger';
import { ollamaProvider } from '@/services/ai/providers/ollama';

export function getExplainabilityAgentStatus() {
  const base = getAdvancedAgentStatus('explainability');
  const registry = loadRegistry();
  const ollamaStats = ollamaProvider.getStats();
  const canonicalModel = ollamaStats.config.model;
  const championModels = Object.values(registry.champions)
    .filter(entry => entry.provider === 'ollama')
    .map(entry => entry.model);
  const registryAligned = championModels.every(model => model === canonicalModel);

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: registryAligned
      ? `Registre champion/challenger aligne sur le modele local ${canonicalModel}`
      : `Derive registre/runtime detectee entre ${canonicalModel} et ${Array.from(new Set(championModels)).join(', ')}`,
    evidence: [
      `Registre: ${Object.keys(registry.champions).length} modes canoniques, comparaison ${registry.comparison.enabled ? 'activee' : 'desactivee'} a ${(registry.comparison.sample_rate * 100).toFixed(0)}%.`,
      `Runtime: modele Ollama canonique ${canonicalModel}.`,
      ...base.evidence,
    ],
    blockers: [
      ...base.blockers,
      ...(!registryAligned
        ? [
            `Le registre champion/challenger n est pas aligne sur le modele local canonique ${canonicalModel}.`,
          ]
        : []),
    ],
    nextStep: registryAligned
      ? 'Publier la chaine requested -> used -> shown et les rapports d inference sur cette surface canonique.'
      : 'Realigner le registre champion/challenger sur le modele Ollama canonique puis publier la chaine requested -> used -> shown.',
  };
}

export function startExplainabilityAgent() {
  return getExplainabilityAgentStatus();
}
