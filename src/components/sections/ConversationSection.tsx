/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ConversationSection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Chat UI, message management, voice input, TTS
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useDeferredValue,
  memo,
} from 'react';
import { useToast } from '@/hooks/useToast';
import { useConversationEngine } from '@hooks/useConversationEngine';
import type {
  ConversationMode,
  ConversationProviderPreference,
} from '@/services/conversationEngine';
import type { AnalyzedFile } from '@/components/chat/FileUploadButton';
import { ThinkingPanel, useThinkingSteps } from '@/features/chat/ThinkingPanel';
import {
  downloadConversation,
  downloadMarkdown,
  copyToClipboard,
} from '@/features/chat/exportImport';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { ChatToolbar } from '@/components/chat/ChatToolbar';
import { ModeBuilder, type CustomMode } from '@/components/conversation/ModeBuilder';
import { registerCustomMode } from '@/config/chatModes.config';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { TSectionHeader } from '@/design-system';
import { Download, FileText, Copy, Trash2, Search } from 'lucide-react';
import { colors } from '@themes/tokens';
import { Card } from '@/ui';
import { createLogger } from '@/utils/logger';
import type { ProviderDecisionMeta, ReasonCode } from '@/types/providerMeta';
import { webResearch } from '@/services/webResearchService';
import type { ResearchOptions, ResearchReport } from '@/types/research';
import { useLTMContext } from '@/hooks/useLTMContext';
import {
  buildArtifactActionContract,
  buildProfessionalDocumentManifest,
  resolveArtifactRoute,
  validateNoFakeArtifactResponse,
  type ProfessionalDocumentManifest,
} from '@/features/chat/artifactIntent';
import {
  messageSpeechController,
  useMessageSpeechState,
  type MessageSpeechStatus,
} from '@/services/tts/messageSpeechController';

const pageLogger = createLogger('ConversationSection');

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

type ConversationSectionProps = Record<string, never>;

interface ConversationMessageItem {
  id?: string;
  role: 'user' | 'assistant' | string;
  content: string;
  metadata?: {
    tags?: string[];
    intention?: string;
    providerMeta?: ProviderDecisionMeta;
  };
}

interface RuntimeSignals {
  orchestratorState: string;
  memoryState: string;
}

interface LatestAssistantRuntimeSnapshot {
  providerMeta?: ProviderDecisionMeta;
  tags: string[];
  runtimeSignals: RuntimeSignals;
}

const AVAILABLE_PROVIDERS: Array<{
  id: ConversationProviderPreference;
  name: string;
  icon: string;
  available: boolean;
}> = [
  { id: 'gemini', name: 'Gemini', icon: '✨', available: true },
  { id: 'ollama', name: 'Ollama', icon: '🦙', available: true },
  { id: 'openai', name: 'OpenAI', icon: '🤖', available: true },
  { id: 'claude', name: 'Claude', icon: '🧠', available: true },
];

const BUILT_IN_CONVERSATION_MODES = [
  {
    id: 'default',
    name: 'Normal',
    icon: '💬',
    description: 'Conversation standard',
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    icon: '💡',
    description: 'Idéation créative',
  },
  {
    id: 'synthesis',
    name: 'Synthèse',
    icon: '📝',
    description: 'Résumé et analyse',
  },
  {
    id: 'planning',
    name: 'Planification',
    icon: '📋',
    description: 'Stratégie et organisation',
  },
  {
    id: 'journal',
    name: 'Journal',
    icon: '📔',
    description: 'Réflexion personnelle',
  },
  {
    id: 'debug_cognitive',
    name: 'Debug Cognitif',
    icon: '🔧',
    description: 'Analyse système',
  },
];

const CONVERSATION_SUGGESTIONS = [
  {
    label: '💡 Brainstorm ideas',
    value: 'Help me brainstorm some ideas for...',
  },
  { label: '📝 Summarize', value: 'Please summarize the key points...' },
  { label: '🔍 Analyze', value: 'Analyze this for me...' },
  { label: '💬 Explain', value: 'Explain this concept...' },
];

const LOADING_INDICATOR_GRACE_MS = 1200;

export function resolveConversationDisplayProvider(
  selectedProvider: ConversationProviderPreference,
  latestProviderUsed?: string | null
): string {
  if (latestProviderUsed && latestProviderUsed.trim()) {
    return latestProviderUsed;
  }

  return (
    AVAILABLE_PROVIDERS.find(provider => provider.id === selectedProvider)?.name ??
    selectedProvider
  );
}

export function buildConversationRuntimeSummary(
  requestedProviderLabel: string,
  latestAssistantRuntime: LatestAssistantRuntimeSnapshot | null
): string {
  if (!latestAssistantRuntime) return '';

  const provider = latestAssistantRuntime.providerMeta?.provider_used ?? 'unknown';
  const mode = latestAssistantRuntime.providerMeta?.mode ?? 'unknown';
  const reason = latestAssistantRuntime.providerMeta?.reason_code ?? 'UNKNOWN';
  const networkUsed =
    latestAssistantRuntime.providerMeta?.network_used === true ? 'true' : 'false';

  const requestedPrefix =
    requestedProviderLabel &&
    requestedProviderLabel.trim() &&
    requestedProviderLabel !== provider
      ? `Requested: ${requestedProviderLabel} | `
      : '';

  return `${requestedPrefix}Provider: ${provider} | Mode: ${mode} | Reason: ${reason} | Network: ${networkUsed}`;
}

export function buildConversationLoadingLabel(
  requestedProviderLabel: string,
  currentModeLabel: string
): string {
  const providerLabel =
    requestedProviderLabel && requestedProviderLabel.trim()
      ? requestedProviderLabel
      : 'Auto';
  const modeLabel = currentModeLabel && currentModeLabel.trim() ? currentModeLabel : '—';

  return `Route demandee: ${providerLabel} | Mode: ${modeLabel}`;
}

export function buildConversationRuntimeBadges(
  requestedProviderLabel: string,
  latestAssistantRuntime: LatestAssistantRuntimeSnapshot | null
): string[] {
  if (!latestAssistantRuntime) return [];

  const providerMeta = latestAssistantRuntime.providerMeta;
  const tags = latestAssistantRuntime.tags;

  const values = [
    requestedProviderLabel &&
    providerMeta?.provider_used &&
    requestedProviderLabel !== providerMeta.provider_used
      ? `requested:${requestedProviderLabel}`
      : null,
    providerMeta?.provider_used,
    providerMeta?.mode,
    providerMeta?.provider_class,
    providerMeta?.reason_code,
    providerMeta?.policy && providerMeta.policy !== 'default'
      ? `policy:${providerMeta.policy}`
      : null,
    ...tags,
  ].filter((value): value is string => Boolean(value && value.trim()));

  return Array.from(new Set(values)).slice(0, 8);
}

function getSpeechStatusLabel(status: MessageSpeechStatus, error: string | null): string {
  switch (status) {
    case 'loading':
      return 'Préparation de la lecture...';
    case 'speaking':
      return 'Lecture en cours...';
    case 'paused':
      return 'Lecture en pause.';
    case 'completed':
      return 'Lecture terminée.';
    case 'stopped':
      return 'Lecture arrêtée.';
    case 'error':
      return error ? `Erreur audio: ${error}` : 'Erreur audio.';
    default:
      return 'Prêt pour la lecture audio.';
  }
}

function deriveRuntimeSignals(
  providerMeta?: ProviderDecisionMeta,
  tags: string[] = []
): RuntimeSignals {
  let orchestratorState = 'unknown';
  let memoryState = 'unknown';

  for (const rawTag of tags) {
    const tag = rawTag.toLowerCase();

    if (tag.startsWith('orchestrator:')) {
      orchestratorState = rawTag.split(':').slice(1).join(':').trim() || 'unknown';
    }

    if (tag.startsWith('memory:')) {
      memoryState = rawTag.split(':').slice(1).join(':').trim() || 'unknown';
    }

    if (memoryState === 'unknown' && tag.includes('omega:memory')) {
      memoryState = 'present';
    }
  }

  if (
    orchestratorState === 'unknown' &&
    providerMeta?.provider_used?.toLowerCase().includes('omega')
  ) {
    orchestratorState = 'running';
  }

  return { orchestratorState, memoryState };
}

/**
 * Sanitize input pour sécurité renforcée (XSS prevention)
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .slice(0, 10000);
}

function shouldHandoffToResearch(input: string): boolean {
  const normalized = input.toLowerCase();

  const hasResearchVerb =
    normalized.includes('recherche') ||
    normalized.includes('chercher') ||
    normalized.includes('search') ||
    normalized.includes('look up');

  const hasWebTarget =
    normalized.includes('internet') ||
    normalized.includes('web') ||
    normalized.includes('en ligne') ||
    normalized.includes('online');

  return hasResearchVerb && hasWebTarget;
}

function extractResearchTopic(input: string): string {
  const normalized = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const stripped = normalized
    .replace(/^(effectue|fais|lance|peux[- ]?tu|merci de)?\s*/i, '')
    .replace(/(une|un)?\s*recherche\s*(sur|dans)?\s*(internet|le web|web)?\s*/i, '')
    .replace(/^(avec|sur|de|du|des|la|le|les|l)\s+/i, '')
    .trim();

  const stopWords = new Set([
    'effectue',
    'fais',
    'lance',
    'peux',
    'tu',
    'merci',
    'recherche',
    'chercher',
    'search',
    'internet',
    'web',
    'en',
    'ligne',
    'sur',
    'dans',
    'avec',
    'pour',
    'les',
    'des',
    'de',
    'du',
    'la',
    'le',
    'un',
    'une',
    'l',
  ]);

  const tokens = (stripped.length > 2 ? stripped : normalized)
    .split(' ')
    .map(token => token.trim())
    .filter(token => token.length > 1 && !stopWords.has(token));

  const normalizedTokens = tokens.map(token => {
    if (token.endsWith('s') && token.length > 4) {
      return token.slice(0, -1);
    }
    return token;
  });

  return normalizedTokens.join(' ').trim() || 'hiver';
}

function toTopicSlug(topic: string): string {
  return topic
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

function buildResearchHandoff(input: string): {
  q: string;
  mode: 'WEB_LIVE';
  target_url: string;
  seed_urls: string[];
} {
  const normalized = input.trim();
  const topic = extractResearchTopic(normalized);
  const detectedUrl = normalized.match(/https?:\/\/\S+/i)?.[0]?.replace(/[),.;!?]+$/, '');

  if (detectedUrl) {
    return {
      q: normalized,
      mode: 'WEB_LIVE',
      target_url: detectedUrl,
      seed_urls: [detectedUrl],
    };
  }

  const topicQuery = encodeURIComponent(topic);
  const topicSlug = toTopicSlug(topic);
  const seeds = [
    `https://fr.wikipedia.org/wiki/${topicSlug}`,
    `https://fr.wikipedia.org/w/index.php?search=${topicQuery}`,
    `https://fr.wiktionary.org/wiki/${topicSlug}`,
    `https://www.wikidata.org/wiki/Special:Search?search=${topicQuery}`,
  ];

  return {
    q: topic,
    mode: 'WEB_LIVE',
    target_url: seeds[0] ?? `https://fr.wikipedia.org/wiki/${topicSlug}`,
    seed_urls: seeds,
  };
}

function extractConfirmedPoints(
  citations: ResearchReport['answer']['citations']
): string[] {
  const stopWords = new Set([
    'avec',
    'dans',
    'pour',
    'plus',
    'moins',
    'cela',
    'cette',
    'comme',
    'entre',
    'depuis',
    'selon',
    'aussi',
    'leurs',
    'leurs',
    'nous',
    'vous',
    'they',
    'that',
    'this',
    'from',
    'about',
    'robot',
    'policy',
    'please',
    'source',
    'search',
  ]);

  const tokenToUrls = new Map<string, Set<string>>();

  for (const citation of citations) {
    const sourceKey = citation.url;
    const text = `${citation.title || ''} ${citation.excerpt || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ');

    const uniqueTokens = new Set(
      text
        .split(/\s+/)
        .map(token => token.trim())
        .filter(token => token.length >= 5 && !stopWords.has(token))
    );

    for (const token of uniqueTokens) {
      if (!tokenToUrls.has(token)) {
        tokenToUrls.set(token, new Set());
      }
      tokenToUrls.get(token)?.add(sourceKey);
    }
  }

  return [...tokenToUrls.entries()]
    .filter(([, urls]) => urls.size >= 2)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 4)
    .map(([token]) => `Le thème « ${token} » revient dans plusieurs sources.`);
}

type ResearchOutcome = 'blocked' | 'limited' | 'pass';

function detectBlockCause(report: ResearchReport): string {
  const markers = report.trace.markers || [];
  const errors = report.trace.errors || [];

  if (markers.includes('ROBOTS_BLOCKED') || markers.includes('M_ROBOTS_BLOCKED')) {
    return 'ROBOTS_BLOCKED';
  }

  if (markers.includes('RATE_LIMIT_BLOCKED') || markers.includes('M_RATE_BLOCKED')) {
    return 'RATE_LIMIT_BLOCKED';
  }

  if (errors.some(error => error.toLowerCase().includes('policy'))) {
    return 'POLICY_BLOCKED';
  }

  return 'POLICY_BLOCKED';
}

function classifyResearchOutcome(report: ResearchReport): ResearchOutcome {
  const markers = report.trace.markers || [];
  if (markers.includes('VERDICT_BLOCKED')) {
    return 'blocked';
  }

  const answer = (report.answer.answer || '').toLowerCase();
  const citations = report.answer.citations || [];
  const limitations = report.answer.limitations || [];
  const noModelSignal =
    answer.includes('no generative model used') ||
    answer.includes('please set a user-agent') ||
    answer.includes('robot policy');

  if (citations.length === 0) {
    return 'limited';
  }

  if (noModelSignal) {
    return 'limited';
  }

  if (report.answer.sources_count <= 1 && report.answer.retrieved_passages_count <= 1) {
    return 'limited';
  }

  if (limitations.length >= 3 && citations.length < 2) {
    return 'limited';
  }

  return 'pass';
}

function buildResearchReply(report: ResearchReport, outcome: ResearchOutcome): string {
  const verdict =
    report.trace.markers.find(m => m.startsWith('VERDICT_')) ?? 'VERDICT_UNKNOWN';
  const verdictLabel = verdict.replace('VERDICT_', '');
  const citations = report.answer.citations || [];
  const limitations = report.answer.limitations || [];
  const answer = (report.answer.answer || 'Aucune réponse générée.').trim();

  if (outcome === 'blocked') {
    const blockCause = detectBlockCause(report);
    const source = citations[0]?.url || 'Aucune source exploitable pour cette tentative.';
    return [
      '🔎 Recherche web dans le chat (bloquée)',
      '',
      'Je ne peux pas collecter cette cible dans le cadre gouverné actuel, donc je ne peux pas synthétiser ce sujet de façon fiable pour le moment.',
      '',
      `Cause détectée: ${blockCause}`,
      'Ce qui bloque actuellement',
      '- La politique de gouvernance (robots/rate-limit/policy) a stoppé la collecte.',
      '- Tant que la cible principale reste bloquée, la synthèse multi-sources est incomplète.',
      '',
      'Source observée',
      `1. ${source}`,
      '',
      'Ce que je te propose maintenant',
      '- Donne 2 à 4 URL publiques précises (sources officielles, encyclopédies, médias reconnus).',
      '- Je referai une synthèse claire en français, avec points confirmés par plusieurs sources.',
    ].join('\n');
  }

  if (outcome === 'limited') {
    const keyCitations = citations
      .slice(0, 4)
      .map((citation, index) => {
        const title = citation.title?.trim() || 'Source';
        const excerpt = citation.excerpt?.trim();
        const shortExcerpt =
          excerpt && excerpt.length > 120 ? `${excerpt.slice(0, 117)}…` : excerpt;
        return `${index + 1}. ${title} — ${citation.url}${shortExcerpt ? `\n   ↳ ${shortExcerpt}` : ''}`;
      })
      .join('\n');

    return [
      `🔎 Recherche web dans le chat (${verdictLabel} · analyse partielle)`,
      '',
      'Je peux déjà te donner une première synthèse, mais le niveau de preuve reste partiel.',
      '',
      'Synthèse provisoire',
      answer,
      '',
      `Sources utilisables (${citations.length})`,
      keyCitations || 'Aucune source exploitable.',
      '',
      `Limites détectées: ${limitations.length ? limitations.slice(0, 3).join(' · ') : 'signal faible côté collecte.'}`,
      'Si tu veux, je peux relancer avec des URLs plus ciblées pour obtenir une synthèse plus solide.',
    ].join('\n');
  }

  const simpleSentences = answer
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(Boolean)
    .slice(0, 6);

  const keyPoints =
    simpleSentences.length > 0
      ? simpleSentences.map(sentence => `- ${sentence}`).join('\n')
      : '- Aucun point clé exploitable extrait automatiquement.';

  const confirmedPoints = extractConfirmedPoints(citations);
  const confirmedText =
    confirmedPoints.length > 0
      ? confirmedPoints.map(point => `- ${point}`).join('\n')
      : '- Je n’ai pas assez de recoupements textuels pour affirmer des confirmations fortes.';

  const citationsText = citations.length
    ? citations
        .slice(0, 6)
        .map((citation, index) => {
          const title = citation.title?.trim() || 'Source';
          return `${index + 1}. ${title} — ${citation.url}`;
        })
        .join('\n')
    : 'Aucune source exploitable.';

  return [
    `🔎 Recherche web dans le chat (${verdictLabel})`,
    '',
    'Voici un résumé clair en français, avec vocabulaire simple :',
    '',
    'Résumé détaillé',
    keyPoints,
    '',
    'Informations confirmées par plusieurs sources',
    confirmedText,
    '',
    `Sources (${citations.length})`,
    citationsText,
    '',
    `Limites: ${limitations.length ? limitations.slice(0, 3).join(' · ') : 'Aucune limitation explicite.'}`,
  ].join('\n');
}

function deriveResearchProviderMeta(
  report: ResearchReport,
  outcome: ResearchOutcome
): ProviderDecisionMeta {
  const cacheHit = (report.trace.cache_events || []).some(event => event.kind === 'HIT');
  const duration =
    typeof report.trace.timings?.total === 'number' ? report.trace.timings.total : 0;

  let reasonCode: ReasonCode = 'OK';
  if (outcome === 'blocked') {
    reasonCode =
      detectBlockCause(report) === 'RATE_LIMIT_BLOCKED' ? 'RATE_LIMIT' : 'POLICY_BLOCKED';
  } else if (outcome === 'limited') {
    reasonCode = 'PROVIDER_UNAVAILABLE';
  }

  return {
    provider_used: 'web_research',
    provider_class: 'remote',
    mode: outcome === 'blocked' ? 'OFFLINE' : 'REMOTE',
    reason_code: reasonCode,
    latency_ms_total: duration,
    timeout_ms: 30000,
    retries: 0,
    attempts: [],
    network_used: outcome !== 'blocked',
    cache_hit: cacheHit,
    policy: 'web_research_inline',
  };
}

function mapReasonCodeToNodeStatus(
  reasonCode?: ReasonCode
): 'active' | 'done' | 'error' | 'blocked' {
  if (!reasonCode || reasonCode === 'OK' || reasonCode === 'CACHE_HIT') {
    return 'done';
  }

  if (
    reasonCode === 'TIMEOUT' ||
    reasonCode === 'POLICY_BLOCKED' ||
    reasonCode === 'ALLOWLIST_DENIED' ||
    reasonCode === 'TOOL_DENIED' ||
    reasonCode === 'PROVIDER_UNAVAILABLE'
  ) {
    return 'blocked';
  }

  return 'error';
}

function formatRuntimeThinkingSummary(meta: ProviderDecisionMeta): string {
  const attempts = Array.isArray(meta.attempts) ? meta.attempts : [];
  const attemptsSummary =
    attempts.length > 0
      ? attempts
          .slice(0, 4)
          .map((attempt, index) => {
            return `${index + 1}:${attempt.provider_id}/${attempt.outcome}/${attempt.reason_code}/${attempt.latency_ms}ms`;
          })
          .join(' | ')
      : 'none';

  return [
    `mode=${meta.mode}`,
    `provider=${meta.provider_used}`,
    `reason=${meta.reason_code}`,
    `network=${meta.network_used ? 'on' : 'off'}`,
    `cache=${meta.cache_hit ? 'hit' : 'miss'}`,
    `attempts=${attemptsSummary}`,
  ].join(' ; ');
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ConversationMessage = memo(
  ({
    message,
    isLoading,
    onCopy,
    onRetry,
    onDelete,
  }: {
    message: ConversationMessageItem;
    isLoading: boolean;
    onCopy: (content: string) => void;
    onRetry: (content: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const speechMessageId =
      message.id ?? `${message.role}-${message.content.slice(0, 64)}`;
    const speechState = useMessageSpeechState(
      speechMessageId,
      message.role === 'assistant' ? message.content : ''
    );
    const providerMeta = message.metadata?.providerMeta;
    const runtimeSignals = deriveRuntimeSignals(
      providerMeta,
      message.metadata?.tags ?? []
    );
    const providerLabel = providerMeta?.provider_used;
    const modeLabel = providerMeta?.mode;
    const classLabel = providerMeta?.provider_class;
    const reasonLabel = providerMeta?.reason_code;
    const cacheHit = providerMeta?.cache_hit === true;

    const handleCopy = useCallback(
      () => onCopy(message.content),
      [message.content, onCopy]
    );
    const handleRetry = useCallback(
      () => onRetry(message.content),
      [message.content, onRetry]
    );
    const handleDelete = useCallback(() => {
      if (message.id) {
        onDelete(message.id);
      }
    }, [message.id, onDelete]);

    return (
      <div
        className={`conversation-message ${message.role}`}
        data-testid={`chat-message-${message.role}`}
        data-provider-used={
          message.role === 'assistant' ? providerLabel || undefined : undefined
        }
        data-provider-mode={
          message.role === 'assistant' ? modeLabel || undefined : undefined
        }
        data-provider-reason={
          message.role === 'assistant' ? reasonLabel || undefined : undefined
        }
        data-provider-class={
          message.role === 'assistant' ? classLabel || undefined : undefined
        }
        data-network-used={
          message.role === 'assistant' && providerMeta
            ? String(providerMeta.network_used)
            : undefined
        }
        data-orchestrator-state={
          message.role === 'assistant' ? runtimeSignals.orchestratorState : undefined
        }
        data-memory-state={
          message.role === 'assistant' ? runtimeSignals.memoryState : undefined
        }
        data-provider-network-used={
          message.role === 'assistant' && providerMeta
            ? String(providerMeta.network_used)
            : undefined
        }
        data-provider-cache-hit={
          message.role === 'assistant' && providerMeta ? String(cacheHit) : undefined
        }
      >
        <div className="conversation-message-avatar">
          {message.role === 'user' ? '👤' : '🧠'}
        </div>
        <div className="conversation-message-content">
          <div className="conversation-message-header">
            <span className="conversation-message-role">
              {message.role === 'user' ? 'Vous' : 'TITANE'}
            </span>
            {message.role === 'assistant' && providerMeta && (
              <div className="conversation-message-tags">
                {providerLabel && (
                  <span className="conversation-tag" data-testid="chat-runtime-tag">
                    {providerLabel}
                  </span>
                )}
                {modeLabel && (
                  <span className="conversation-tag" data-testid="chat-runtime-tag">
                    {modeLabel}
                  </span>
                )}
                {classLabel && (
                  <span className="conversation-tag" data-testid="chat-runtime-tag">
                    {classLabel}
                  </span>
                )}
                {cacheHit && (
                  <span className="conversation-tag" data-testid="chat-runtime-tag">
                    CACHE
                  </span>
                )}
                {reasonLabel && reasonLabel !== 'OK' && (
                  <span className="conversation-tag" data-testid="chat-runtime-tag">
                    {reasonLabel}
                  </span>
                )}
              </div>
            )}
            {message.metadata?.tags && message.metadata.tags.length > 0 && (
              <div className="conversation-message-tags">
                {message.metadata.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="conversation-tag"
                    data-testid="chat-runtime-tag"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="conversation-message-text" data-testid="chat-message-content">
            {message.content}
          </div>
          {message.metadata?.intention && (
            <div className="conversation-message-meta">
              <span className="meta-intention">{message.metadata.intention}</span>
            </div>
          )}

          {message.role === 'assistant' &&
            message.content &&
            message.content.trim().length > 0 &&
            speechState.canPlay && (
              <div
                className="conversation-message-audio"
                data-testid="message-tts-controls"
                data-message-id={speechMessageId}
              >
                <div
                  className={`conversation-message-audio-status conversation-message-audio-status-${speechState.status}`}
                  data-testid="message-tts-status"
                >
                  {getSpeechStatusLabel(speechState.status, speechState.error)}
                </div>

                <div className="conversation-message-audio-actions">
                  {(speechState.status === 'idle' ||
                    speechState.status === 'completed' ||
                    speechState.status === 'stopped' ||
                    speechState.status === 'error') && (
                    <button
                      type="button"
                      className="conversation-message-action"
                      onClick={() => {
                        void messageSpeechController.playMessage(
                          speechMessageId,
                          message.content
                        );
                      }}
                      data-testid="message-tts-read"
                    >
                      {speechState.status === 'completed' ||
                      speechState.status === 'stopped'
                        ? 'Relire'
                        : 'Lire à haute voix'}
                    </button>
                  )}

                  {speechState.status === 'loading' && (
                    <button
                      type="button"
                      className="conversation-message-action"
                      disabled
                      data-testid="message-tts-loading"
                    >
                      Préparation...
                    </button>
                  )}

                  {speechState.status === 'speaking' && speechState.supportsPause && (
                    <button
                      type="button"
                      className="conversation-message-action"
                      onClick={() => {
                        void messageSpeechController.pause();
                      }}
                      data-testid="message-tts-pause"
                    >
                      Pause
                    </button>
                  )}

                  {speechState.status === 'paused' && (
                    <button
                      type="button"
                      className="conversation-message-action"
                      onClick={() => {
                        void messageSpeechController.resume();
                      }}
                      data-testid="message-tts-resume"
                    >
                      Reprendre
                    </button>
                  )}

                  {(speechState.status === 'loading' ||
                    speechState.status === 'speaking' ||
                    speechState.status === 'paused') && (
                    <button
                      type="button"
                      className="conversation-message-action danger"
                      onClick={() => {
                        void messageSpeechController.stop();
                      }}
                      data-testid="message-tts-stop"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            )}

          <div className="conversation-message-actions">
            <button
              type="button"
              className="conversation-message-action"
              onClick={handleCopy}
              title="Copier le message"
            >
              📋 Copier
            </button>

            {message.role === 'user' && (
              <button
                type="button"
                className="conversation-message-action"
                onClick={handleRetry}
                title="Renvoyer ce message"
                disabled={isLoading}
              >
                🔄 Retry
              </button>
            )}

            <button
              type="button"
              className="conversation-message-action danger"
              onClick={handleDelete}
              title="Supprimer ce message"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ConversationMessage.displayName = 'ConversationMessage';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const isConversationProviderPreference = (
  value: string
): value is ConversationProviderPreference =>
  value === 'auto' ||
  value === 'gemini' ||
  value === 'ollama' ||
  value === 'openai' ||
  value === 'claude' ||
  value === 'local';

const getInitialSelectedProvider = (): ConversationProviderPreference => {
  if (typeof window === 'undefined') {
    return 'ollama';
  }

  const stored = window.localStorage.getItem('omega-chat-preferred-provider');
  const normalizedStored = stored?.trim() ?? '';
  return isConversationProviderPreference(normalizedStored) ? normalizedStored : 'ollama';
};

export const ConversationSection: React.FC<ConversationSectionProps> = memo(() => {
  // ═══ HOOKS ═══
  const { success: toastSuccess, error: errorToast } = useToast();
  const [selectedProvider, setSelectedProvider] =
    useState<ConversationProviderPreference>(getInitialSelectedProvider);
  const {
    messages,
    isLoading,
    error,
    currentMode,
    setMode,
    sendMessage,
    appendLocalExchange,
    clearMessages,
    deleteMessage,
    healthReport,
    refreshHealth,
    conversationId,
  } = useConversationEngine({
    mode: 'default',
    providerPreference: selectedProvider,
    autoHealthCheck: false,
    maxMessages: 500,
  });

  // PATCH-014: LTM wired to ConversationSection — refreshes after each message
  const { historyCount: ltmCount, refresh: refreshLTM } = useLTMContext(conversationId);

  // ═══ STATE ═══
  const [inputValue, setInputValue] = useState('');
  const [showModeBuilder, setShowModeBuilder] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [customModes, setCustomModes] = useState<CustomMode[]>([]);
  const [_attachedImages, setAttachedImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'assistant'>('all');
  const [_cameraActive, setCameraActive] = useState(false);
  const [loadingVisibleUntil, setLoadingVisibleUntil] = useState(0);
  const [sendTraceState, setSendTraceState] = useState<
    'idle' | 'dispatching' | 'responded' | 'errored'
  >('idle');
  const [sendTraceMeta, setSendTraceMeta] = useState('');
  const [activeArtifactManifest, setActiveArtifactManifest] =
    useState<ProfessionalDocumentManifest | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // ═══ THINKING STEPS ═══
  const thinking = useThinkingSteps();

  // ═══ VOICE ENGINE ═══
  const handleVoiceTranscript = useCallback((text: string) => {
    setInputValue(prev => (prev ? `${prev} ${text}` : text));
  }, []);

  const handleVoiceError = useCallback((error: unknown) => {
    pageLogger.error('Voice recognition error', error);
  }, []);

  const voiceEngine = useVoiceEngine({
    language: 'fr-FR',
    onTranscript: handleVoiceTranscript,
    onError: handleVoiceError,
  });

  // ═══ HANDLERS ═══
  const handleCopyMessage = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content);
      } catch (err) {
        pageLogger.warn('Copy message failed', err);
        errorToast('Impossible de copier le message');
      }
    },
    [errorToast]
  );

  const handleRetryMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      thinking.startThinking();
      try {
        await sendMessage(content);
        void refreshLTM(); // PATCH-014: refresh LTM count after message
      } finally {
        thinking.stopThinking();
      }
    },
    [isLoading, sendMessage, thinking, refreshLTM]
  );

  const handleSuggestionClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.dataset.value;
    if (value) setInputValue(value);
  }, []);

  const handleProviderChange = useCallback((provider: string) => {
    if (isConversationProviderPreference(provider)) {
      setSelectedProvider(provider);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('omega-chat-preferred-provider', selectedProvider);
  }, [selectedProvider]);

  // ═══ COMPUTED VALUES ═══
  const conversationModes = useMemo(() => {
    const customModesFormatted = customModes.map(m => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      description: m.description,
    }));

    return [...BUILT_IN_CONVERSATION_MODES, ...customModesFormatted];
  }, [customModes]);

  const currentModeLabel = useMemo(
    () => conversationModes.find(m => m.id === currentMode)?.name ?? '—',
    [conversationModes, currentMode]
  );

  const conversationModeOptions = useMemo(
    () =>
      conversationModes.map(mode => (
        <option key={mode.id} value={mode.id}>
          {mode.icon} {mode.name}
        </option>
      )),
    [conversationModes]
  );

  const hasMessages = messages.length > 0;
  const isHealthy = healthReport?.status === 'Healthy';
  const showLoadingIndicator = isLoading || loadingVisibleUntil > Date.now();

  const latestAssistantRuntime = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i] as ConversationMessageItem;
      if (message.role !== 'assistant') continue;

      const providerMeta = message.metadata?.providerMeta;
      const tags = message.metadata?.tags ?? [];
      if (!providerMeta && tags.length === 0) continue;

      const runtimeSignals = deriveRuntimeSignals(providerMeta, tags);

      return {
        providerMeta,
        tags,
        runtimeSignals,
      };
    }

    return null;
  }, [messages]);

  const selectedProviderLabel = useMemo(
    () => resolveConversationDisplayProvider(selectedProvider, null),
    [selectedProvider]
  );

  const runtimeSummary = useMemo(
    () => buildConversationRuntimeSummary(selectedProviderLabel, latestAssistantRuntime),
    [latestAssistantRuntime, selectedProviderLabel]
  );

  const loadingSummary = useMemo(
    () => buildConversationLoadingLabel(selectedProviderLabel, currentModeLabel),
    [currentModeLabel, selectedProviderLabel]
  );

  const runtimeBadges = useMemo(
    () => buildConversationRuntimeBadges(selectedProviderLabel, latestAssistantRuntime),
    [latestAssistantRuntime, selectedProviderLabel]
  );

  useEffect(() => {
    if (isLoading) {
      setLoadingVisibleUntil(Date.now() + LOADING_INDICATOR_GRACE_MS);
      return;
    }

    if (loadingVisibleUntil <= Date.now()) {
      return;
    }

    const remainingMs = loadingVisibleUntil - Date.now();
    const timerId = window.setTimeout(() => {
      setLoadingVisibleUntil(0);
    }, remainingMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isLoading, loadingVisibleUntil]);

  const latestAssistantProviderMeta = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (!message) continue;
      if (message.role === 'assistant' && message.metadata?.providerMeta) {
        return message.metadata.providerMeta;
      }
    }
    return null;
  }, [messages]);

  const thinkingState: 'idle' | 'active' | 'done' | 'error' | 'blocked' =
    thinking.isThinking ? 'active' : error ? 'error' : hasMessages ? 'done' : 'idle';

  const runtimeProviderLabel = useMemo(
    () =>
      resolveConversationDisplayProvider(
        selectedProvider,
        latestAssistantProviderMeta?.provider_used ?? null
      ),
    [latestAssistantProviderMeta?.provider_used, selectedProvider]
  );

  const thinkingTopology = useMemo(() => {
    const nodes: Array<{
      id: string;
      label: string;
      status: 'active' | 'done' | 'error' | 'blocked';
    }> = [
      {
        id: 'conversation-runtime',
        label: 'conversation-runtime',
        status: (thinking.isThinking ? 'active' : 'done') as
          | 'active'
          | 'done'
          | 'error'
          | 'blocked',
      },
    ];

    if (!latestAssistantProviderMeta) {
      return nodes;
    }

    const reasonStatus = mapReasonCodeToNodeStatus(
      latestAssistantProviderMeta.reason_code
    );

    nodes.push({
      id: `mode-${latestAssistantProviderMeta.mode.toLowerCase()}`,
      label: `mode:${latestAssistantProviderMeta.mode}`,
      status: reasonStatus,
    });

    nodes.push({
      id: `provider-${latestAssistantProviderMeta.provider_used}`,
      label: `provider:${latestAssistantProviderMeta.provider_used}`,
      status: reasonStatus,
    });

    if (latestAssistantProviderMeta.reason_code !== 'OK') {
      nodes.push({
        id: `reason-${latestAssistantProviderMeta.reason_code.toLowerCase()}`,
        label: `reason:${latestAssistantProviderMeta.reason_code}`,
        status: reasonStatus,
      });
    }

    latestAssistantProviderMeta.attempts.slice(0, 4).forEach((attempt, index) => {
      nodes.push({
        id: `attempt-${index + 1}-${attempt.provider_id}`,
        label: `attempt${index + 1}:${attempt.provider_id}/${attempt.outcome}`,
        status: mapReasonCodeToNodeStatus(attempt.reason_code),
      });
    });

    return nodes;
  }, [thinking.isThinking, latestAssistantProviderMeta]);

  const searchNeedle = useMemo(() => {
    const trimmed = deferredSearchQuery.trim();
    return trimmed ? trimmed.toLowerCase() : '';
  }, [deferredSearchQuery]);

  const filteredMessages = useMemo(() => {
    if (!searchNeedle && filterRole === 'all') {
      return messages;
    }

    let result = messages;

    if (searchNeedle) {
      result = result.filter(m => m.content.toLowerCase().includes(searchNeedle));
    }

    if (filterRole !== 'all') {
      result = result.filter(m => m.role === filterRole);
    }

    return result;
  }, [messages, searchNeedle, filterRole]);

  const filteredCount = filteredMessages.length;
  const messageCount = messages.length;

  const messageItems = useMemo(
    () =>
      filteredMessages.map((msg, index) => (
        <ConversationMessage
          key={msg.id || `msg-${index}`}
          message={msg}
          isLoading={isLoading}
          onCopy={handleCopyMessage}
          onRetry={handleRetryMessage}
          onDelete={deleteMessage}
        />
      )),
    [filteredMessages, isLoading, handleCopyMessage, handleRetryMessage, deleteMessage]
  );

  const suggestionButtons = useMemo(
    () =>
      CONVERSATION_SUGGESTIONS.map(suggestion => (
        <button
          key={suggestion.value}
          type="button"
          data-value={suggestion.value}
          onClick={handleSuggestionClick}
        >
          {suggestion.label}
        </button>
      )),
    []
  );

  // ═══ EFFECTS ═══
  useEffect(() => {
    try {
      const stored = localStorage.getItem('titane_custom_modes');
      if (stored) {
        const modes: CustomMode[] = JSON.parse(stored);
        setCustomModes(modes);
        // Register each custom mode so getSystemPrompt() can resolve it at runtime
        modes.forEach(m => registerCustomMode(m.id, m.systemPrompt));
      }
    } catch (error) {
      pageLogger.error('Erreur chargement modes custom', error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ═══ MORE HANDLERS ═══
  const handleSaveCustomMode = useCallback((mode: CustomMode) => {
    setCustomModes(prev => [...prev, mode]);
    // Register in runtime registry so getSystemPrompt() resolves this mode immediately
    registerCustomMode(mode.id, mode.systemPrompt);
    pageLogger.debug('Mode personnalisé sauvegardé', mode);
  }, []);

  const handleSend = useCallback(async () => {
    const rawInput = inputValue;
    const trimmedInput = rawInput.trim();
    if (!trimmedInput || isLoading || sendingRef.current) return;
    sendingRef.current = true;

    const sanitized = sanitizeInput(rawInput);
    if (!sanitized || sanitized.length === 0) {
      pageLogger.debug('Input vide apres sanitization');
      sendingRef.current = false;
      return;
    }

    const messageText = sanitized;
    setInputValue('');

    const artifactContract = buildArtifactActionContract(messageText);
    if (artifactContract.intent !== 'ANSWER_ONLY') {
      const route = resolveArtifactRoute(artifactContract, {
        documentEditorAvailable: true,
        codeEditorAvailable: false,
      });
      const manifest = buildProfessionalDocumentManifest(messageText, route.contract);
      setActiveArtifactManifest(manifest);

      const antiLie = validateNoFakeArtifactResponse(
        messageText,
        route.contract,
        manifest
      );
      if (!antiLie.ok) {
        await appendLocalExchange(
          messageText,
          `⛔ Requête fichier détectée, mais contrat artefact invalide: ${antiLie.violations.join(' | ')}`,
          {
            intention: 'artifact_intent_validation',
            tags: ['artifact', 'anti-lie', 'blocked'],
          }
        );
        sendingRef.current = false;
        return;
      }

      if (route.status === 'BLOCKED') {
        await appendLocalExchange(
          messageText,
          [
            '⛔ Requête fichier comprise, mais ouverture éditeur non disponible depuis ce flux chat.',
            `Intent: ${route.contract.intent}`,
            `Motif: ${route.contract.blocked_reason ?? 'UNSPECIFIED_BLOCK'}`,
            `Manifest: ${manifest.id}`,
          ].join('\n'),
          {
            intention: 'artifact_route_blocked',
            tags: ['artifact', 'OPEN_FROM_CHAT_UNPROVEN', 'blocked'],
          }
        );
        errorToast('Demande fichier détectée, mais éditeur non ouvrable depuis le chat.');
        sendingRef.current = false;
        return;
      }

      const openedEditor = route.contract.open_editor;
      if (openedEditor) {
        setShowModeBuilder(true);
      }

      const draft = [
        `# ${manifest.title}`,
        '',
        `- Manifest: ${manifest.id}`,
        `- Kind: ${manifest.artifact_kind}`,
        `- Grade: ${manifest.professional_grade}`,
        `- Format: ${manifest.target_formats.join(', ')}`,
        '',
        '## Context',
        manifest.sections[0]?.content ?? '',
      ].join('\n');

      await appendLocalExchange(
        messageText,
        [
          '✅ Requête fichier comprise et routée vers la voie artefact.',
          openedEditor
            ? 'Éditeur ouvert: ModeBuilder affiché pour édition guidée.'
            : 'Éditeur non requis pour cette requête, génération préparée côté chat.',
          `Manifest: ${manifest.id}`,
          '',
          draft,
        ].join('\n'),
        {
          intention: 'artifact_route_ready',
          tags: [
            'artifact',
            'manifest',
            openedEditor ? 'editor_opened_modebuilder' : 'no_editor_needed',
          ],
        }
      );
      toastSuccess(
        openedEditor
          ? 'Route artefact activée, éditeur ouvert avec manifeste canonique.'
          : 'Route artefact activée avec manifeste canonique.'
      );
      sendingRef.current = false;
      return;
    }

    if (shouldHandoffToResearch(messageText)) {
      thinking.startThinking();
      thinking.addStep('analysis', 'Détection recherche web (mode chat intégré)...');
      try {
        const handoff = buildResearchHandoff(messageText);
        const options: ResearchOptions = {
          mode: 'WEB_LIVE',
          target_url: handoff.target_url,
          seed_urls: handoff.seed_urls,
          sandbox_root: 'data/research',
          max_depth: 1,
          max_sources: 8,
          max_pages: 10,
          max_requests: 16,
          timeout_ms: 60000,
          cache_enabled: true,
          respect_robots: true,
        };

        thinking.addStep('reasoning', 'Exécution web_research gouvernée...');
        const report = await webResearch({ question: handoff.q }, options);
        const outcome = classifyResearchOutcome(report);
        const assistantReply = buildResearchReply(report, outcome);
        const providerMeta = deriveResearchProviderMeta(report, outcome);

        await appendLocalExchange(messageText, assistantReply, {
          intention: 'web_research',
          tags: ['research', 'web_live', outcome],
          providerMeta,
        });

        if (outcome === 'blocked') {
          errorToast('Recherche bloquée par la gouvernance/robots pour cette cible.');
        } else if (outcome === 'limited') {
          toastSuccess('Recherche partielle terminée dans le chat IA.');
        } else {
          toastSuccess('Recherche web terminée dans le chat IA.');
        }
      } catch (researchError) {
        pageLogger.error('Recherche web chat error', researchError);
        await appendLocalExchange(
          messageText,
          '❌ Échec de la recherche web dans le chat. Réessaie avec une URL explicite pour une cible plus précise.',
          {
            intention: 'web_research',
            tags: ['research', 'web_live', 'error'],
            providerMeta: {
              provider_used: 'web_research',
              provider_class: 'remote',
              mode: 'ERROR',
              reason_code: 'FALLBACK_OFFLINE',
              latency_ms_total: 0,
              timeout_ms: 30000,
              retries: 0,
              attempts: [],
              network_used: false,
              cache_hit: false,
              policy: 'web_research_inline',
            },
          }
        );
        errorToast('Recherche web indisponible.');
      } finally {
        thinking.stopThinking();
        sendingRef.current = false;
      }
      return;
    }

    thinking.startThinking();
    thinking.addStep('analysis', 'Analyse de votre message...');
    setSendTraceState('dispatching');
    setSendTraceMeta(`provider=${selectedProvider};len=${messageText.length}`);

    try {
      thinking.addStep('reasoning', 'Traitement par le pipeline OMEGA...');
      const response = await sendMessage(messageText);
      setSendTraceState('responded');
      setSendTraceMeta(
        `provider=${response?.meta?.provider_used ?? 'unknown'};reason=${response?.meta?.reason_code ?? 'UNKNOWN'}`
      );

      thinking.addStep('synthesis', 'Génération de la réponse...');

      if (response?.meta) {
        thinking.addStep('validation', formatRuntimeThinkingSummary(response.meta));
      }

      thinking.stopThinking();

      if (audioEnabled && response?.assistant_message) {
        try {
          await hybridTTS.speak(response.assistant_message, {
            rate: 1.0,
            pitch: 1.0,
            lang: 'fr-FR',
          });
        } catch (ttsError) {
          pageLogger.warn('TTS error (non-critical)', ttsError);
          setAudioEnabled(false);
        }
      }
    } catch (err) {
      pageLogger.error('Send message error', err);
      setSendTraceState('errored');
      setSendTraceMeta(err instanceof Error ? err.message : String(err));
      thinking.stopThinking();
    } finally {
      sendingRef.current = false;
    }
  }, [
    inputValue,
    isLoading,
    sendMessage,
    appendLocalExchange,
    audioEnabled,
    thinking,
    errorToast,
    toastSuccess,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleClearChat = useCallback(() => {
    if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
      clearMessages();
    }
  }, [clearMessages]);

  const handleExportJson = useCallback(async () => {
    const result = await downloadConversation('current', 'Conversation TITANE', messages);
    if (result.ok) {
      toastSuccess(
        result.status === 'SAVED_TAURI'
          ? `Conversation enregistrée (${result.path ?? 'chemin sélectionné'})`
          : 'Conversation téléchargée via le navigateur.'
      );
      return;
    }

    if (result.status === 'SAVE_CANCELLED_HONEST') {
      errorToast('Enregistrement annulé (aucun fichier écrit).');
      return;
    }

    errorToast(`Échec export JSON: ${result.error ?? result.status}`);
  }, [messages, toastSuccess, errorToast]);

  const handleExportMarkdown = useCallback(async () => {
    const result = await downloadMarkdown('Conversation TITANE', messages);
    if (result.ok) {
      toastSuccess(
        result.status === 'SAVED_TAURI'
          ? `Markdown enregistré (${result.path ?? 'chemin sélectionné'})`
          : 'Markdown téléchargé via le navigateur.'
      );
      return;
    }

    if (result.status === 'SAVE_CANCELLED_HONEST') {
      errorToast('Enregistrement annulé (aucun fichier écrit).');
      return;
    }

    errorToast(`Échec export Markdown: ${result.error ?? result.status}`);
  }, [messages, toastSuccess, errorToast]);

  const handleCopyAll = useCallback(async () => {
    const copySuccess = await copyToClipboard('Conversation TITANE', messages);
    if (copySuccess) toastSuccess('Conversation copiée.');
  }, [messages, toastSuccess]);

  const handleVoiceInput = useCallback(async () => {
    if (!voiceEngine.status.isMicAvailable) {
      errorToast('Microphone non disponible. Vérifiez les permissions.');
      return;
    }

    try {
      if (voiceEngine.status.isRecording) {
        const finalTranscript = await voiceEngine.stopDictation();
        setIsRecording(false);
        pageLogger.debug('Voice dictation stopped', finalTranscript);
      } else {
        await voiceEngine.startDictation();
        setIsRecording(true);
        pageLogger.debug('Voice dictation started');
      }
    } catch (error) {
      pageLogger.error('Voice input error', error);
      setIsRecording(false);
      errorToast('Erreur reconnaissance vocale. Consultez la console.');
    }
  }, [errorToast, voiceEngine]);

  const handleFilesAnalyzed = useCallback(
    (files: AnalyzedFile[]) => {
      const filesSummary = files
        .map(file => {
          const lines = [
            `📄 **${file.name}**`,
            `- Taille: ${(file.size / 1024).toFixed(1)} KB`,
          ];

          if (file.analysis?.summary) {
            lines.push(`- Résumé: ${file.analysis.summary}`);
          }

          return lines.join('\n');
        })
        .join('\n\n');

      sendMessage(
        `📎 Fichiers importés pour analyse:\n\n${filesSummary}\n\nAnalyse ces fichiers.`
      );
    },
    [sendMessage]
  );

  const handleFileImport = useCallback(
    (files: FileList) => {
      const fileNames = Array.from(files)
        .map(f => f.name)
        .join(', ');
      sendMessage(`📎 Fichiers: ${fileNames}\n\nAnalyse ces fichiers.`);
    },
    [sendMessage]
  );

  const handleScreenCapture = useCallback(
    (imageData: string) => {
      setAttachedImages(prev => [...prev, imageData]);
      sendMessage('📸 [Capture ecran]\n\nAnalyse cette capture.');
    },
    [sendMessage]
  );

  const handleImageAnalysis = useCallback(
    (imageData: string, prompt?: string) => {
      setAttachedImages(prev => [...prev, imageData]);
      sendMessage(`👁️ [Image]\n\n${prompt || 'Analyse cette image.'}`);
    },
    [sendMessage]
  );

  const handleDictationResult = useCallback((text: string) => {
    if (text.trim()) setInputValue(prev => (prev ? `${prev} ${text}` : text));
  }, []);

  const handleAudioRecorded = useCallback(
    (audioBlob: Blob) => {
      const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2);
      sendMessage(`🎤 [Audio - ${sizeMB} MB]\n\nTranscris ce message.`);
    },
    [sendMessage]
  );

  const handleTranscriptionResult = useCallback(
    (text: string) => {
      sendMessage(`📝 Transcription:\n\n"${text}"\n\nAnalyse ce contenu.`);
    },
    [sendMessage]
  );

  const handleModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMode(e.target.value as ConversationMode);
    },
    [setMode]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterRoleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterRole(e.target.value as typeof filterRole);
    },
    []
  );

  const toggleAudioEnabled = useCallback(() => {
    setAudioEnabled(prev => !prev);
  }, []);

  const toggleModeBuilder = useCallback(() => {
    setShowModeBuilder(prev => !prev);
  }, []);

  const handleToggleAudioConversation = useCallback((active: boolean) => {
    setAudioEnabled(active);
  }, []);

  const handleToggleTTS = useCallback((active: boolean) => {
    setAudioEnabled(active);
  }, []);

  const handleToggleCameraLive = useCallback(() => {
    setCameraActive(prev => !prev);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleCloseModeBuilder = useCallback(() => {
    setShowModeBuilder(false);
  }, []);

  // ═══ RENDER ═══
  return (
    <div
      className="titane-section titane-section-conversation"
      data-testid="page-conversation"
    >
      <TSectionHeader
        title="💬 Communication & Intelligence"
        subtitle={`Interface conversationnelle multi-provider avec modes spécialisés${ltmCount > 0 ? ` · 🗂 ${ltmCount} msg en mémoire LTM` : ''}`}
      />

      <div className="conversation-container">
        {/* ═══ TOOLBAR ═══ */}
        <div className="conversation-toolbar">
          <div className="conversation-toolbar-left">
            <ChatProviderSelector
              selectedProvider={selectedProvider}
              onChange={handleProviderChange}
              providers={AVAILABLE_PROVIDERS}
            />

            {/* Mode Selector */}
            <select
              className="conversation-mode-select"
              data-testid="select-conversation-mode"
              value={currentMode}
              onChange={handleModeChange}
            >
              {conversationModeOptions}
            </select>
          </div>

          <div className="conversation-toolbar-right">
            {/* Export JSON */}
            <button
              className="conversation-icon-btn"
              data-testid="btn-export-json"
              onClick={handleExportJson}
              title="Exporter en JSON"
              disabled={!hasMessages}
            >
              <Download size={16} />
            </button>

            {/* Export Markdown */}
            <button
              className="conversation-icon-btn"
              data-testid="btn-export-markdown"
              onClick={handleExportMarkdown}
              title="Exporter en Markdown"
              disabled={!hasMessages}
            >
              <FileText size={16} />
            </button>

            {/* Copy to Clipboard */}
            <button
              className="conversation-icon-btn"
              data-testid="btn-copy-chat"
              onClick={handleCopyAll}
              title="Copier dans le presse-papier"
              disabled={!hasMessages}
            >
              <Copy size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              className={`conversation-icon-btn ${audioEnabled ? 'active' : ''}`}
              data-testid="toggle-audio-tts"
              onClick={toggleAudioEnabled}
              title="Audio (TTS)"
              aria-label={audioEnabled ? 'Désactiver audio (TTS)' : 'Activer audio (TTS)'}
              aria-pressed={audioEnabled}
              role="switch"
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>

            {/* Voice Input */}
            <button
              className={`conversation-icon-btn ${isRecording ? 'recording' : ''}`}
              data-testid="toggle-voice-input"
              onClick={handleVoiceInput}
              title="Reconnaissance vocale"
              aria-label={
                isRecording
                  ? "Arrêter l'enregistrement"
                  : 'Démarrer reconnaissance vocale'
              }
              aria-pressed={isRecording}
            >
              🎤
            </button>

            {/* Mode Builder */}
            <button
              className="conversation-icon-btn"
              data-testid="btn-mode-builder"
              onClick={toggleModeBuilder}
              title="Créer un mode personnalisé"
              aria-label="Créer un mode personnalisé"
            >
              ⚙️
            </button>

            {/* Health Check */}
            <button
              className={`conversation-icon-btn ${isHealthy ? 'healthy' : ''}`}
              data-testid="btn-health-check"
              onClick={refreshHealth}
              title={`Santé: ${healthReport?.status || 'Unknown'}`}
              aria-label={`Vérifier santé du système (Statut: ${healthReport?.status || 'Inconnu'})`}
            >
              {isHealthy ? '✅' : '⚠️'}
            </button>

            {/* Clear Chat */}
            <button
              className="conversation-icon-btn"
              data-testid="btn-clear-chat"
              onClick={handleClearChat}
              title="Effacer l'historique"
              aria-label="Effacer l'historique du chat"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ═══ SEARCH / FILTERS ═══ */}
        <div className="conversation-filters">
          <div className="conversation-filters-search">
            <Search size={16} />
            <input
              type="search"
              data-testid="input-conversation-search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Rechercher dans la conversation"
            />
          </div>

          <select
            className="conversation-filters-role"
            data-testid="select-conversation-role"
            value={filterRole}
            onChange={handleFilterRoleChange}
            aria-label="Filtrer par rôle"
          >
            <option value="all">Tous</option>
            <option value="user">Utilisateur</option>
            <option value="assistant">TITANE</option>
          </select>

          <div className="conversation-filters-count">
            {filteredCount}/{messageCount}
          </div>
        </div>

        {latestAssistantRuntime && (
          <div
            className="conversation-runtime-panel"
            data-testid="chat-runtime-state"
            data-provider-mode={latestAssistantRuntime.providerMeta?.mode ?? 'unknown'}
            data-provider-reason={
              latestAssistantRuntime.providerMeta?.reason_code ?? 'UNKNOWN'
            }
            data-provider-used={
              latestAssistantRuntime.providerMeta?.provider_used ?? 'unknown'
            }
            data-network-used={
              latestAssistantRuntime.providerMeta
                ? String(latestAssistantRuntime.providerMeta.network_used)
                : 'false'
            }
            data-orchestrator-state={
              latestAssistantRuntime.runtimeSignals.orchestratorState
            }
            data-memory-state={latestAssistantRuntime.runtimeSignals.memoryState}
            data-gemini-configured={selectedProvider === 'gemini' ? 'true' : 'false'}
            data-ollama-model={selectedProvider === 'ollama' ? 'gemma2:2b' : 'unknown'}
            data-secrets-mode="governed"
          >
            <div
              className="conversation-runtime-summary"
              data-testid="chat-runtime-summary"
            >
              {runtimeSummary}
            </div>
            <div
              className="conversation-runtime-summary"
              data-testid="chat-artifact-manifest"
            >
              Artifact Manifest: {activeArtifactManifest?.id ?? 'none'}
            </div>
            <div className="conversation-runtime-badges">
              {runtimeBadges.map((badge, index) => (
                <span
                  key={`${badge}-${index}`}
                  className="conversation-runtime-badge"
                  data-testid="chat-runtime-badge"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ═══ THINKING PANEL ═══ */}
        <ThinkingPanel
          steps={thinking.steps}
          isThinking={thinking.isThinking}
          state={thinkingState}
          topology={thinkingTopology}
          compact={thinking.compact}
          inline={false}
          provider={runtimeProviderLabel}
        />

        {/* ═══ MESSAGES AREA ═══ */}
        <div className="conversation-messages">
          {messages.length === 0 && !thinking.isThinking && (
            <div className="conversation-empty">
              <div className="conversation-empty-icon">🧠⚡∞</div>
              <h3>TITANE∞ est prêt à converser</h3>
              <p>
                Mode actuel: <strong>{currentModeLabel}</strong>
                <br />
                Provider: <strong>{selectedProviderLabel}</strong>
              </p>
              <div className="conversation-empty-suggestions">{suggestionButtons}</div>
            </div>
          )}

          {messageItems}

          {showLoadingIndicator && (
            <div
              className="conversation-message assistant loading"
              data-testid="chat-loading"
            >
              <div className="conversation-message-avatar">🧠</div>
              <div className="conversation-message-content">
                <div className="conversation-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <small style={{ color: colors.neutral[400] }}>
                  TITANE traite votre message...
                </small>
                <small
                  style={{ color: colors.neutral[500], display: 'block', marginTop: 4 }}
                  data-testid="chat-loading-summary"
                >
                  {loadingSummary}
                </small>
              </div>
            </div>
          )}

          {error && (
            <div className="conversation-error" data-testid="chat-error" role="alert">
              <strong>❌ Erreur:</strong> {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ═══ CHAT TOOLBAR (v25.5.0) ═══ */}
        <ChatToolbar
          onFilesAnalyzed={handleFilesAnalyzed}
          onFileImport={handleFileImport}
          onScreenCapture={handleScreenCapture}
          onImageAnalysis={handleImageAnalysis}
          onDictationResult={handleDictationResult}
          onAudioRecorded={handleAudioRecorded}
          onTranscriptionResult={handleTranscriptionResult}
          onToggleAudioConversation={handleToggleAudioConversation}
          onToggleCameraLive={handleToggleCameraLive}
          onToggleTTS={handleToggleTTS}
          disabled={isLoading}
          compact={false}
        />

        {/* ═══ INPUT AREA ═══ */}
        <div className="conversation-input-container">
          <div
            data-testid="chat-send-trace"
            data-state={sendTraceState}
            data-meta={sendTraceMeta}
            aria-hidden="true"
            style={{ display: 'none' }}
          />
          <div
            data-testid="chat-ready"
            data-state={isLoading ? 'loading' : 'ready'}
            aria-hidden="true"
            style={{ display: 'none' }}
          />
          <textarea
            className="conversation-input"
            data-testid="chat-input"
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={3}
          />
          <button
            className="conversation-send-btn"
            data-testid="chat-send"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'} Envoyer
          </button>
        </div>

        {/* ═══ MODE BUILDER MODAL ═══ */}
        {showModeBuilder && (
          <ModeBuilder onClose={handleCloseModeBuilder} onSave={handleSaveCustomMode} />
        )}
      </div>
    </div>
  );
});

ConversationSection.displayName = 'ConversationSection';
