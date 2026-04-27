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

// ═══════════════════════════════════════════════════════════════
// EXPLAINABILITY SCORE + AUDIT LOG EXPORT — v31.2.14
// Score de transparence 0-100 + export d'audit JSON structuré
// ═══════════════════════════════════════════════════════════════

export interface ExplainabilityScore {
  /** Score global de transparence 0–100. */
  score: number;
  /** Détail par critère. */
  breakdown: {
    chainCoverage: number; // % traces avec providerMeta
    championAlignment: number; // % modes alignés sur gemma2:2b
    localUsageRate: number; // % requêtes via provider local
    fallbackPenalty: number; // pénalité pour requêtes en fallback
    historyDepth: number; // couverture historique bornée
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  computedAt: string;
}

export interface InferenceAuditLogEntry {
  id: string;
  timestamp: string;
  conversationId: string | null;
  requestedProvider: string;
  usedProvider: string;
  mode: string;
  reasonCode: string;
  networkUsed: boolean;
  policy: string;
  timeoutMs: number;
  retries: number;
  latencyMs: number | null;
  attempts: Array<{
    provider_id: string;
    outcome: string;
    reason_code: string;
    latency_ms: number;
  }>;
  contentPreview: string;
  championAligned: boolean;
  explainabilityScore: number;
}

export interface InferenceAuditLog {
  exportId: string;
  generatedAt: string;
  version: '1.0';
  entries: InferenceAuditLogEntry[];
  summary: {
    totalTraces: number;
    localUsageRate: number;
    avgExplainabilityScore: number;
    fallbackCount: number;
    networkUsageCount: number;
  };
}

/**
 * Compute explainability score (0–100) based on:
 * - Chain coverage (traces with full providerMeta)
 * - Champion alignment (gemma2:2b usage)
 * - Local vs network usage
 * - Fallback penalty
 * - History depth
 */
export function computeExplainabilityScore(): ExplainabilityScore {
  const registry = loadRegistry();
  const history = loadExplainabilityTraceHistory();

  const totalTraces = history.length;
  const tracesWithMeta = history.filter(e => e.usedProvider !== 'none').length;
  const chainCoverage =
    totalTraces > 0 ? Math.round((tracesWithMeta / totalTraces) * 100) : 0;

  const championModels = Object.values(registry.champions)
    .filter(e => e.provider === 'ollama')
    .map(e => e.model);
  const totalModes = Object.keys(registry.champions).length;
  const alignedModes = championModels.length;
  const championAlignment =
    totalModes > 0 ? Math.round((alignedModes / totalModes) * 100) : 0;

  const localTraces = history.filter(
    e => e.usedProvider === 'ollama' || !e.networkUsed
  ).length;
  const localUsageRate =
    totalTraces > 0 ? Math.round((localTraces / totalTraces) * 100) : 100;

  const networkTraces = history.filter(e => e.networkUsed).length;
  const fallbackPenalty =
    totalTraces > 0 ? Math.round((networkTraces / totalTraces) * 30) : 0; // max 30 pts pénalité

  const historyDepth = Math.round((Math.min(totalTraces, 8) / 8) * 100);

  // Weighted composite score
  const raw =
    chainCoverage * 0.3 +
    championAlignment * 0.25 +
    localUsageRate * 0.25 +
    (100 - fallbackPenalty) * 0.1 +
    historyDepth * 0.1;

  const score = Math.round(Math.min(100, Math.max(0, raw)));
  const grade: ExplainabilityScore['grade'] =
    score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    score,
    breakdown: {
      chainCoverage,
      championAlignment,
      localUsageRate,
      fallbackPenalty,
      historyDepth,
    },
    grade,
    label: `${score}/100 (${grade}) — ${
      grade === 'A'
        ? 'Transparence excellente'
        : grade === 'B'
          ? 'Bonne transparence'
          : grade === 'C'
            ? 'Transparence partielle'
            : grade === 'D'
              ? 'Transparence faible'
              : 'Transparence insuffisante'
    }`,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Export the full inference audit log as a structured JSON object.
 * Includes all bounded trace history with explainability scores per entry.
 */
export function exportInferenceAuditLog(): InferenceAuditLog {
  const history = loadExplainabilityTraceHistory();
  const registry = loadRegistry();
  const championModels = new Set(
    Object.values(registry.champions)
      .filter(e => e.provider === 'ollama')
      .map(e => e.model)
  );

  const entries: InferenceAuditLogEntry[] = history.map(entry => {
    const championAligned =
      championModels.has(entry.usedProvider) || entry.usedProvider === 'ollama';
    const entryScore =
      (entry.usedProvider !== 'none' ? 40 : 0) +
      (championAligned ? 30 : 0) +
      (!entry.networkUsed ? 20 : 0) +
      10; // base

    return {
      id: entry.id,
      timestamp: new Date(entry.timestamp).toISOString(),
      conversationId: entry.conversationId,
      requestedProvider: entry.requestedProvider,
      usedProvider: entry.usedProvider,
      mode: 'DIRECT',
      reasonCode: entry.reasonCode,
      networkUsed: entry.networkUsed,
      policy: 'canonical',
      timeoutMs: 0,
      retries: 0,
      latencyMs: null,
      attempts: [],
      contentPreview: entry.preview,
      championAligned,
      explainabilityScore: Math.min(100, entryScore),
    };
  });

  const networkCount = entries.filter(e => e.networkUsed).length;
  const localRate =
    entries.length > 0
      ? Math.round(((entries.length - networkCount) / entries.length) * 100)
      : 100;
  const avgScore =
    entries.length > 0
      ? Math.round(
          entries.reduce((acc, e) => acc + e.explainabilityScore, 0) / entries.length
        )
      : 0;

  return {
    exportId: `audit-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    version: '1.0',
    entries,
    summary: {
      totalTraces: entries.length,
      localUsageRate: localRate,
      avgExplainabilityScore: avgScore,
      fallbackCount: entries.filter(e => e.reasonCode === 'FALLBACK').length,
      networkUsageCount: networkCount,
    },
  };
}

/** Persist audit log to localStorage for dashboard access. */
export function saveInferenceAuditLog(): void {
  if (typeof window === 'undefined') return;
  const log = exportInferenceAuditLog();
  try {
    window.localStorage.setItem('titane_inference_audit_log', JSON.stringify(log));
  } catch {
    // storage full
  }
}

/** Load the last saved audit log from localStorage. */
export function loadSavedInferenceAuditLog(): InferenceAuditLog | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('titane_inference_audit_log');
    return raw ? (JSON.parse(raw) as InferenceAuditLog) : null;
  } catch {
    return null;
  }
}
