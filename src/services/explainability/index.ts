import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { loadRegistry } from '@/services/ai/championChallenger';
import { ollamaProvider } from '@/services/ai/providers/ollama';
import { conversationStorage } from '@/services/conversation/conversationStorage';
import type { AIMessage } from '@/types/ai';
import type { ProviderDecisionMeta } from '@/types/providerMeta';
import { validateProviderDecisionMeta } from '@/types/providerDecisionMeta';

const REQUESTED_PROVIDER_LABELS: Record<string, string> = {
  auto: 'Auto',
  ollama: 'Ollama',
  gemini: 'Gemini',
  openai: 'OpenAI',
  claude: 'Claude',
};

function getRequestedProviderLabel(): string {
  if (typeof window === 'undefined') {
    return 'Ollama';
  }

  const raw = window.localStorage.getItem('omega-chat-preferred-provider') ?? 'ollama';
  return REQUESTED_PROVIDER_LABELS[raw] ?? raw;
}

function normalizeProviderMeta(raw: unknown): ProviderDecisionMeta | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const candidate = raw as ProviderDecisionMeta;
  if (typeof candidate.provider_used !== 'string' || typeof candidate.reason_code !== 'string') {
    return null;
  }

  return validateProviderDecisionMeta(candidate) === null ? candidate : null;
}

function getLatestExplainabilityTrace(): {
  requestedProvider: string;
  providerMeta: ProviderDecisionMeta | null;
  shownSummary: string;
  assistantContent: string | null;
} {
  const requestedProvider = getRequestedProviderLabel();
  const activeConversationId = conversationStorage.getActiveConversationId();
  const activeConversation = activeConversationId
    ? conversationStorage.loadConversationSync(activeConversationId)
    : null;

  const latestAssistant =
    activeConversation?.messages
      ?.slice()
      .reverse()
      .find((message: AIMessage) => message.role === 'assistant') ?? null;
  const providerMeta = normalizeProviderMeta(latestAssistant?.metadata?.providerMeta);

  if (!providerMeta) {
    return {
      requestedProvider,
      providerMeta: null,
      shownSummary: `Requested: ${requestedProvider} | Provider: none | Mode: unknown | Reason: UNKNOWN | Network: false`,
      assistantContent: latestAssistant?.content ?? null,
    };
  }

  const requestedPrefix =
    requestedProvider !== providerMeta.provider_used ? `Requested: ${requestedProvider} | ` : '';

  return {
    requestedProvider,
    providerMeta,
    shownSummary: `${requestedPrefix}Provider: ${providerMeta.provider_used} | Mode: ${providerMeta.mode} | Reason: ${providerMeta.reason_code} | Network: ${providerMeta.network_used ? 'true' : 'false'}`,
    assistantContent: latestAssistant?.content ?? null,
  };
}

export function getExplainabilityAgentStatus() {
  const base = getAdvancedAgentStatus('explainability');
  const registry = loadRegistry();
  const ollamaStats = ollamaProvider.getStats();
  const latestTrace = getLatestExplainabilityTrace();
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
      ? latestTrace.providerMeta
        ? `Trace requested -> used -> shown publiee pour ${latestTrace.providerMeta.provider_used} sur le modele ${canonicalModel}`
        : `Registre champion/challenger aligne sur le modele local ${canonicalModel}, en attente d une trace runtime persistée`
      : `Derive registre/runtime detectee entre ${canonicalModel} et ${Array.from(new Set(championModels)).join(', ')}`,
    evidence: [
      `Registre: ${Object.keys(registry.champions).length} modes canoniques, comparaison ${registry.comparison.enabled ? 'activee' : 'desactivee'} a ${(registry.comparison.sample_rate * 100).toFixed(0)}%.`,
      `Runtime: modele Ollama canonique ${canonicalModel}.`,
      `Runtime: ${latestTrace.shownSummary}.`,
      ...base.evidence,
    ],
    blockers: [
      ...(latestTrace.providerMeta
        ? ['La surface publie la derniere trace d inference, mais pas encore un historique multi-requetes horodate.']
        : ['Aucune trace assistant persistée avec providerMeta n est encore disponible sur la conversation active.']),
      ...(!registryAligned
        ? [
            `Le registre champion/challenger n est pas aligne sur le modele local canonique ${canonicalModel}.`,
          ]
        : []),
    ],
    nextStep: registryAligned
      ? 'Ajouter un historique horodate de traces et un export de rapports d inference depuis cette surface canonique.'
      : 'Realigner le registre champion/challenger sur le modele Ollama canonique puis publier la chaine requested -> used -> shown.',
    detailSections: [
      {
        key: 'inference-chain',
        title: 'Chaine requested -> used -> shown',
        items: [
          {
            id: 'inference-chain-requested',
            label: `Requested: ${latestTrace.requestedProvider}`,
          },
          {
            id: 'inference-chain-used',
            label: `Used: ${latestTrace.providerMeta?.provider_used ?? 'none'}`,
          },
          {
            id: 'inference-chain-shown',
            label: `Shown: ${latestTrace.shownSummary}`,
          },
        ],
      },
      {
        key: 'inference-report',
        title: 'Rapports d inference',
        items: latestTrace.providerMeta
          ? [
              {
                id: 'inference-report-policy',
                label: `Policy: ${latestTrace.providerMeta.policy} · timeout ${latestTrace.providerMeta.timeout_ms} ms · retries ${latestTrace.providerMeta.retries}.`,
              },
              {
                id: 'inference-report-attempts',
                label: `Attempts: ${latestTrace.providerMeta.attempts.length > 0 ? latestTrace.providerMeta.attempts.map(attempt => `${attempt.provider_id}:${attempt.outcome}/${attempt.reason_code}/${attempt.latency_ms}ms`).join(' | ') : 'none'}`,
              },
              {
                id: 'inference-report-preview',
                label: `Preview: ${(latestTrace.assistantContent ?? '').trim().slice(0, 120) || 'empty'}`,
              },
            ]
          : [
              {
                id: 'inference-report-empty',
                label: 'Aucun rapport d inference persiste: la conversation active n expose pas encore de providerMeta assistant.',
              },
            ],
      },
    ],
  };
}

export function startExplainabilityAgent() {
  return getExplainabilityAgentStatus();
}
