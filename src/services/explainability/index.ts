import { getAdvancedAgentStatus } from '@/services/agents/advancedAgentCatalog';
import { loadRegistry } from '@/services/ai/championChallenger';
import { ollamaProvider } from '@/services/ai/providers/ollama';
import { conversationStorage } from '@/services/conversation/conversationStorage';
import type { AIMessage } from '@/types/ai';
import type { ProviderDecisionMeta } from '@/types/providerMeta';
import { validateProviderDecisionMeta } from '@/types/providerDecisionMeta';

const EXPLAINABILITY_TRACE_HISTORY_KEY = 'titane_explainability_trace_history';
const EXPLAINABILITY_TRACE_HISTORY_LIMIT = 8;

interface ExplainabilityTraceHistoryEntry {
  id: string;
  conversationId: string | null;
  timestamp: number;
  requestedProvider: string;
  usedProvider: string;
  shownSummary: string;
  reasonCode: string;
  networkUsed: boolean;
  preview: string;
}

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
  if (
    typeof candidate.provider_used !== 'string' ||
    typeof candidate.reason_code !== 'string'
  ) {
    return null;
  }

  return validateProviderDecisionMeta(candidate) === null ? candidate : null;
}

function formatExplainabilityClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function loadExplainabilityTraceHistory(): ExplainabilityTraceHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(EXPLAINABILITY_TRACE_HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(entry => entry && typeof entry.timestamp === 'number');
  } catch {
    return [];
  }
}

function saveExplainabilityTraceHistory(
  history: ExplainabilityTraceHistoryEntry[]
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(EXPLAINABILITY_TRACE_HISTORY_KEY, JSON.stringify(history));
}

function updateExplainabilityTraceHistory(
  entry: ExplainabilityTraceHistoryEntry | null
): ExplainabilityTraceHistoryEntry[] {
  const history = loadExplainabilityTraceHistory();

  if (!entry) {
    return history;
  }

  const previous = history[history.length - 1];
  if (
    previous &&
    previous.conversationId === entry.conversationId &&
    previous.timestamp === entry.timestamp &&
    previous.usedProvider === entry.usedProvider &&
    previous.reasonCode === entry.reasonCode
  ) {
    return history;
  }

  const nextHistory = [...history, entry].slice(-EXPLAINABILITY_TRACE_HISTORY_LIMIT);
  saveExplainabilityTraceHistory(nextHistory);
  return nextHistory;
}

export function resetExplainabilityTraceHistoryForTests(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(EXPLAINABILITY_TRACE_HISTORY_KEY);
}

function getLatestExplainabilityTrace(): {
  activeConversationId: string | null;
  requestedProvider: string;
  providerMeta: ProviderDecisionMeta | null;
  shownSummary: string;
  assistantContent: string | null;
  assistantTimestamp: number | null;
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
      activeConversationId,
      requestedProvider,
      providerMeta: null,
      shownSummary: `Requested: ${requestedProvider} | Provider: none | Mode: unknown | Reason: UNKNOWN | Network: false`,
      assistantContent: latestAssistant?.content ?? null,
      assistantTimestamp:
        typeof latestAssistant?.timestamp === 'number' ? latestAssistant.timestamp : null,
    };
  }

  const requestedPrefix =
    requestedProvider !== providerMeta.provider_used
      ? `Requested: ${requestedProvider} | `
      : '';

  return {
    activeConversationId,
    requestedProvider,
    providerMeta,
    shownSummary: `${requestedPrefix}Provider: ${providerMeta.provider_used} | Mode: ${providerMeta.mode} | Reason: ${providerMeta.reason_code} | Network: ${providerMeta.network_used ? 'true' : 'false'}`,
    assistantContent: latestAssistant?.content ?? null,
    assistantTimestamp:
      typeof latestAssistant?.timestamp === 'number' ? latestAssistant.timestamp : null,
  };
}

export function getExplainabilityAgentStatus() {
  const base = getAdvancedAgentStatus('explainability');
  const registry = loadRegistry();
  const ollamaStats = (ollamaProvider.getStats?.() ?? {
    errorCount: 0,
    endpointHealthy: null,
    config: {
      model: 'unknown',
      endpoint: 'unknown',
    },
  }) as {
    errorCount: number;
    endpointHealthy: boolean | null;
    config: {
      model: string;
      endpoint: string;
    };
  };
  const latestTrace = getLatestExplainabilityTrace();
  const canonicalModel = ollamaStats.config.model;
  const championModels = Object.values(registry.champions)
    .filter(entry => entry.provider === 'ollama')
    .map(entry => entry.model);
  const registryAligned = championModels.every(model => model === canonicalModel);
  const history = updateExplainabilityTraceHistory(
    latestTrace.providerMeta
      ? {
          id: `trace-${latestTrace.activeConversationId ?? 'unknown'}-${latestTrace.assistantTimestamp ?? Date.now()}`,
          conversationId: latestTrace.activeConversationId,
          timestamp: latestTrace.assistantTimestamp ?? Date.now(),
          requestedProvider: latestTrace.requestedProvider,
          usedProvider: latestTrace.providerMeta.provider_used,
          shownSummary: latestTrace.shownSummary,
          reasonCode: latestTrace.providerMeta.reason_code,
          networkUsed: latestTrace.providerMeta.network_used,
          preview: (latestTrace.assistantContent ?? '').trim().slice(0, 120) || 'empty',
        }
      : null
  );

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
      `Runtime: historique local ${history.length}/${EXPLAINABILITY_TRACE_HISTORY_LIMIT} traces d inference bornees.`,
      ...base.evidence,
    ],
    blockers: [
      ...(latestTrace.providerMeta
        ? [
            'La surface publie maintenant un historique local horodate, mais aucun export gouverne multi-session n est encore disponible.',
          ]
        : [
            'Aucune trace assistant persistée avec providerMeta n est encore disponible sur la conversation active.',
          ]),
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
                label:
                  'Aucun rapport d inference persiste: la conversation active n expose pas encore de providerMeta assistant.',
              },
            ],
      },
      {
        key: 'inference-history',
        title: 'Historique horodate',
        items:
          history.length > 0
            ? history
                .slice()
                .reverse()
                .map(entry => ({
                  id: entry.id,
                  label: `${formatExplainabilityClock(entry.timestamp)} · requested=${entry.requestedProvider} · used=${entry.usedProvider} · reason=${entry.reasonCode} · network=${entry.networkUsed ? 'true' : 'false'} · preview=${entry.preview}`,
                }))
            : [
                {
                  id: 'inference-history-empty',
                  label:
                    'Aucun historique horodate n est encore disponible sur la conversation active.',
                },
              ],
      },
    ],
  };
}

export function startExplainabilityAgent() {
  return getExplainabilityAgentStatus();
}
