import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { FEATURE_FLAGS, getActiveAIProviders } from '@/config/featureFlags';
import { getTransportMode } from '@/services/ai/transports/ollamaTransport';
import { aiHealthMonitor } from '@/services/ai/healthMonitor';
import { performanceAlerts } from '@/services/ai/performanceAlerts';
import { PredictiveAlerts } from '@/lib/predictiveAlerts';
import { uiLogger } from '@/lib/UILogger';
import { getGovernanceConnector } from '@/services/governance/GovernanceConnector';

export function getSecurityActiveAgentStatus() {
  const base = getAdvancedAgentStatus('security_active');
  const transportMode = getTransportMode();
  const activeProviders = getActiveAIProviders();
  const governance = getGovernanceConnector();
  const healthAlerts = aiHealthMonitor.getActiveAlerts().slice(0, 3);
  const performanceEvents = performanceAlerts.getAlerts(3);
  const predictiveEvents = PredictiveAlerts.getAlerts('high').slice(0, 3);
  const securityLogs = uiLogger.getLogs({ level: 'security', limit: 3 });
  const containmentProviders = governance
    .getAllProviders()
    .filter(provider => !provider.isHealthy || !provider.isActive)
    .slice(0, 3);
  const oneDoorHealthy = transportMode.toUpperCase() === 'IPC';
  const detectionCount =
    healthAlerts.length + performanceEvents.length + predictiveEvents.length + securityLogs.length;
  const containmentCount = containmentProviders.length + (oneDoorHealthy ? 1 : 0) + (FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 0 : 1);

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `Transport ${transportMode.toUpperCase()} · ${detectionCount} evenements detection publies · ${containmentCount} evenements confinement publies`,
    evidence: [
      `One Door: la voie Ollama exposee au frontend passe par ${transportMode.toUpperCase()}.`,
      `Runtime: providers actifs ${activeProviders.join(', ')}.`,
      `Runtime: ${securityLogs.length} logs security UI · ${healthAlerts.length} alertes health · ${predictiveEvents.length} alertes predictives high+.`,
      ...base.evidence,
    ],
    blockers: [
      'La surface publie des evenements de detection et de confinement, mais pas encore un flux temps reel consolide avec acquittement interactif.',
      ...(!oneDoorHealthy
        ? ['Le transport Ollama n est plus sur IPC, ce qui viole la voie canonique UI -> IPC -> services.']
        : []),
    ],
    nextStep: oneDoorHealthy
      ? 'Ajouter acquittement, historique et correlation croisee pour les evenements de detection et de confinement.'
      : 'Restaurer le transport IPC canonique avant d etendre la reponse securite active.',
    detailSections: [
      {
        key: 'detection-events',
        title: 'Evenements de detection',
        items: [
          ...securityLogs.map(entry => `UILogger:${entry.message}`),
          ...healthAlerts.map(alert => `Health:${alert.severity}:${alert.title}`),
          ...performanceEvents.map(alert => `Perf:${alert.severity}:${alert.metricName}:${alert.message}`),
          ...predictiveEvents.map(alert => `Predictive:${alert.severity}:${alert.service}/${alert.metric}`),
        ].slice(0, 6),
      },
      {
        key: 'containment-events',
        title: 'Evenements de confinement',
        items: [
          `Transport gate: ${oneDoorHealthy ? 'IPC enforced' : 'IPC violation detected'}`,
          `External AI: ${FEATURE_FLAGS.ENABLE_EXTERNAL_AI ? 'enabled' : 'confined'}`,
          `Local LLM: ${FEATURE_FLAGS.ENABLE_LOCAL_LLM ? 'enabled' : 'disabled'}`,
          ...containmentProviders.map(provider => `Provider:${provider.id}: active=${provider.isActive ? 'yes' : 'no'} · healthy=${provider.isHealthy ? 'yes' : 'no'} · consecutiveFailures=${provider.consecutiveFailures}`),
        ].slice(0, 6),
      },
    ],
  };
}

export function startSecurityActiveAgent() {
  return getSecurityActiveAgentStatus();
}
