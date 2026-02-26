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
import type { ConversationMode } from '@/services/conversationEngine';
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
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import { TSectionHeader } from '@/design-system';
import { Download, FileText, Copy, Trash2, Search } from 'lucide-react';
import { colors } from '@themes/tokens';
import { Card } from '@/ui';
import { createLogger } from '@/utils/logger';
import type { ProviderDecisionMeta, ReasonCode } from '@/types/providerMeta';
import { webResearch } from '@/services/webResearchService';
import type { ResearchOptions, ResearchReport } from '@/types/research';

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

const AVAILABLE_PROVIDERS = [
  { id: 'gemini', name: 'Gemini', icon: '✨', available: true },
  { id: 'ollama', name: 'Ollama', icon: '🦙', available: true },
  { id: 'openai', name: 'OpenAI', icon: '🤖', available: true },
  { id: 'claude', name: 'Claude', icon: '🧠', available: true },
];

const BUILT_IN_CONVERSATION_MODES = [
  { id: 'default', name: 'Normal', icon: '💬', description: 'Conversation standard' },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    icon: '💡',
    description: 'Idéation créative',
  },
  { id: 'synthesis', name: 'Synthèse', icon: '📝', description: 'Résumé et analyse' },
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
  { label: '💡 Brainstorm ideas', value: 'Help me brainstorm some ideas for...' },
  { label: '📝 Summarize', value: 'Please summarize the key points...' },
  { label: '🔍 Analyze', value: 'Analyze this for me...' },
  { label: '💬 Explain', value: 'Explain this concept...' },
];

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
    const providerMeta = message.metadata?.providerMeta;
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
      <div className={`conversation-message ${message.role}`}>
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
                  <span className="conversation-tag">{providerLabel}</span>
                )}
                {modeLabel && <span className="conversation-tag">{modeLabel}</span>}
                {classLabel && <span className="conversation-tag">{classLabel}</span>}
                {cacheHit && <span className="conversation-tag">CACHE</span>}
                {reasonLabel && reasonLabel !== 'OK' && (
                  <span className="conversation-tag">{reasonLabel}</span>
                )}
              </div>
            )}
            {message.metadata?.tags && message.metadata.tags.length > 0 && (
              <div className="conversation-message-tags">
                {message.metadata.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="conversation-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="conversation-message-text">{message.content}</div>
          {message.metadata?.intention && (
            <div className="conversation-message-meta">
              <span className="meta-intention">{message.metadata.intention}</span>
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

export const ConversationSection: React.FC<ConversationSectionProps> = memo(() => {
  // ═══ HOOKS ═══
  const { success: toastSuccess, error: errorToast } = useToast();
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
  } = useConversationEngine({
    mode: 'default',
    autoHealthCheck: false,
    maxMessages: 500,
  });

  // ═══ STATE ═══
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [inputValue, setInputValue] = useState('');
  const [showModeBuilder, setShowModeBuilder] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [customModes, setCustomModes] = useState<CustomMode[]>([]);
  const [_attachedImages, setAttachedImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'assistant'>('all');
  const [_cameraActive, setCameraActive] = useState(false);
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
      } finally {
        thinking.stopThinking();
      }
    },
    [isLoading, sendMessage, thinking]
  );

  const handleSuggestionClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const value = e.currentTarget.dataset.value;
    if (value) setInputValue(value);
  }, []);

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

  const selectedProviderLabel = useMemo(
    () =>
      AVAILABLE_PROVIDERS.find(p => p.id === selectedProvider)?.name ?? selectedProvider,
    [selectedProvider]
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
        setCustomModes(JSON.parse(stored));
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

    try {
      thinking.addStep('reasoning', 'Traitement par le pipeline OMEGA...');
      const response = await sendMessage(messageText);

      thinking.addStep('synthesis', 'Génération de la réponse...');
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

  const handleExportJson = useCallback(() => {
    downloadConversation('current', 'Conversation TITANE', messages);
  }, [messages]);

  const handleExportMarkdown = useCallback(() => {
    downloadMarkdown('Conversation TITANE', messages);
  }, [messages]);

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
    <div className="titane-section titane-section-conversation">
      <TSectionHeader
        title="💬 Communication & Intelligence"
        subtitle="Interface conversationnelle multi-provider avec modes spécialisés"
      />

      <div className="conversation-container">
        {/* ═══ TOOLBAR ═══ */}
        <div className="conversation-toolbar">
          <div className="conversation-toolbar-left">
            <ChatProviderSelector
              selectedProvider={selectedProvider}
              onChange={setSelectedProvider}
              providers={AVAILABLE_PROVIDERS}
            />

            {/* Mode Selector */}
            <select
              className="conversation-mode-select"
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
              onClick={handleExportJson}
              title="Exporter en JSON"
              disabled={!hasMessages}
            >
              <Download size={16} />
            </button>

            {/* Export Markdown */}
            <button
              className="conversation-icon-btn"
              onClick={handleExportMarkdown}
              title="Exporter en Markdown"
              disabled={!hasMessages}
            >
              <FileText size={16} />
            </button>

            {/* Copy to Clipboard */}
            <button
              className="conversation-icon-btn"
              onClick={handleCopyAll}
              title="Copier dans le presse-papier"
              disabled={!hasMessages}
            >
              <Copy size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              className={`conversation-icon-btn ${audioEnabled ? 'active' : ''}`}
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
              onClick={toggleModeBuilder}
              title="Créer un mode personnalisé"
              aria-label="Créer un mode personnalisé"
            >
              ⚙️
            </button>

            {/* Health Check */}
            <button
              className={`conversation-icon-btn ${isHealthy ? 'healthy' : ''}`}
              onClick={refreshHealth}
              title={`Santé: ${healthReport?.status || 'Unknown'}`}
              aria-label={`Vérifier santé du système (Statut: ${healthReport?.status || 'Inconnu'})`}
            >
              {isHealthy ? '✅' : '⚠️'}
            </button>

            {/* Clear Chat */}
            <button
              className="conversation-icon-btn"
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
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Rechercher dans la conversation"
            />
          </div>

          <select
            className="conversation-filters-role"
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

        {/* ═══ THINKING PANEL ═══ */}
        <ThinkingPanel
          steps={thinking.steps}
          isThinking={thinking.isThinking}
          compact={thinking.compact}
          inline={false}
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

          {isLoading && (
            <div className="conversation-message assistant loading">
              <div className="conversation-message-avatar">🧠</div>
              <div className="conversation-message-content">
                <div className="conversation-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <small style={{ color: colors.neutral[400] }}>TITANE réfléchit...</small>
              </div>
            </div>
          )}

          {error && (
            <div className="conversation-error">
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
          <textarea
            className="conversation-input"
            placeholder="Tapez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={3}
          />
          <button
            className="conversation-send-btn"
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
