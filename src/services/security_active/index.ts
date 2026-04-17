import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { FEATURE_FLAGS, getActiveAIProviders } from '@/config/featureFlags';
import { getTransportMode } from '@/services/ai/transports/ollamaTransport';

export function getSecurityActiveAgentStatus() {
  const base = getAdvancedAgentStatus('security_active');
  const transportMode = getTransportMode();
  const activeProviders = getActiveAIProviders();
  const oneDoorHealthy = transportMode.toUpperCase() === 'IPC';

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `Transport ${transportMode.toUpperCase()} · IA externe ${FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'active' : 'coupee'} · LLM local ${FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'actif' : 'coupe'}`,
    evidence: [
      `One Door: la voie Ollama exposee au frontend passe par ${transportMode.toUpperCase()}.`,
      `Runtime: providers actifs ${activeProviders.join(', ')}.`,
      ...base.evidence,
    ],
    blockers: [
      ...base.blockers,
      ...(!oneDoorHealthy
        ? ['Le transport Ollama n est plus sur IPC, ce qui viole la voie canonique UI -> IPC -> services.']
        : []),
    ],
    nextStep: oneDoorHealthy
      ? 'Publier les evenements de detection et de confinement sur cette surface securite active.'
      : 'Restaurer le transport IPC canonique avant d etendre la reponse securite active.',
  };
}

export function startSecurityActiveAgent() {
  return getSecurityActiveAgentStatus();
}
