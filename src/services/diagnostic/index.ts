import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { getActiveAIProviders } from '@/config/featureFlags';
import { ollamaProvider } from '@/services/ai/providers/ollama';
import { alerting } from '@/services/monitoring/alerting';
import { chatMetrics } from '@/services/monitoring/chatMetrics';

export function getDiagnosticAgentStatus() {
  const base = getAdvancedAgentStatus('diagnostic');
  const globalMetrics = chatMetrics.getGlobalMetrics();
  const activeAlerts = alerting.getActiveAlerts().filter(alert => !alert.resolved);
  const ollamaStats = ollamaProvider.getStats();
  const activeProviders = getActiveAIProviders();
  const diagnosticSignals = activeAlerts.length + globalMetrics.totalErrors;
  const ollamaHealth =
    ollamaStats.endpointHealthy === true
      ? 'sain'
      : ollamaStats.endpointHealthy === false
        ? 'degrade'
        : 'non sonde';

  return {
    ...base,
    readiness: 'partial',
    readinessLabel: 'PARTIAL',
    serviceState: `Diagnostic passif actif · ${diagnosticSignals} signaux detectes · Ollama ${ollamaHealth}`,
    evidence: [
      `Runtime: ${activeAlerts.length} alertes actives et ${globalMetrics.totalErrors} erreurs globales alimentent deja le diagnostic passif.`,
      `Runtime: Ollama cible ${ollamaStats.config.model} via ${ollamaStats.config.endpoint}.`,
      `Runtime: providers declares ${activeProviders.join(', ')} et exposes au diagnostic passif.`,
      ...base.evidence,
    ],
    blockers: [
      ...base.blockers,
      ...(ollamaStats.errorCount > 0
        ? [`Le provider Ollama conserve ${ollamaStats.errorCount} erreurs recentes non resolues dans son etat runtime.`]
        : []),
    ],
    nextStep:
      'Transformer ces signaux passifs en rapport d anomalie structurel et pilotage de correction automatique depuis le service diagnostic.',
  };
}

export function startDiagnosticAgent() {
  return getDiagnosticAgentStatus();
}
