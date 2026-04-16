/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — CONVERSATION ENGINE v∞ (Frontend Integration)
 *   Pipeline unifié, Memory Map v∞, Self-Healing, SingularityState Sync
 * ═══════════════════════════════════════════════════════════════════
 */

import { tauriClient } from '@/lib/tauriClient';
import { getSystemPrompt } from '@/config/chatModes.config';
import { userPreferencesEngine } from '@/services/userPreferencesEngine';
import { classifyMode, resolveMode } from '@/services/ai/omegaModeClassifier';
import {
  RESPONSE_PROFILES,
  type ResponseProfileId,
  type InferenceState,
} from '@/services/ai/responsePolicy';
import {
  buildDiscernmentDecision,
  type DiscernmentDecision,
} from '@/services/ai/discernmentContract';
import type {
  OnlineDecision,
  ProviderDecisionMeta,
  Mode,
  ReasonCode,
} from '@/types/providerMeta';
import {
  validateProviderDecisionMeta,
  validatePromptBudget,
  truncateWithBudget,
  DEFAULT_PROMPT_BUDGET,
  type ValidatedProviderDecisionMeta,
  type PromptBudgetConfig,
} from '@/schemas/ipcTruthContracts';
import {
  formatContextEnvelopeForSystemPrompt,
  type ChatContextEnvelope,
} from '@/services/chat/chatMemorySingleDoor';
import { xpEngine } from '@/cognitive/progression/xpEngine';
import { useEvolutionStore } from '@/stores/evolutionStore';
import { aiOrchestrator } from '@/services/ai/orchestrator';

import { createLogger } from '@/utils/logger';

const logger = createLogger('ConversationEngine');

const E2E_CHAT_MOCK_FLAG = '__TITANE_E2E_CHAT_MOCK__';
const E2E_CHAT_CONV_SEQ = '__TITANE_E2E_CHAT_CONV_SEQ__';
const E2E_CHAT_SCENARIO_FLAG = '__TITANE_E2E_CHAT_SCENARIO__';
const STATIC_PROMPT_CONTEXT_TTL_MS = 2000;

type E2EChatScenario = 'success' | 'rate_limit';

interface StaticPromptContextSnapshot {
  mode: ConversationMode;
  systemPrompt: string;
  personaContext: string;
  userPreferencesContext: string;
  cognitiveContext: string;
}

let staticPromptContextCache: {
  data: StaticPromptContextSnapshot;
  timestamp: number;
} | null = null;

const getWindowRecord = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as unknown as Record<string, unknown>;
};

const isE2EChatMockEnabled = (): boolean => {
  const win = getWindowRecord();
  if (!win) {
    return false;
  }

  return win[E2E_CHAT_MOCK_FLAG] === true;
};

const getE2EChatScenario = (): E2EChatScenario => {
  const win = getWindowRecord();
  if (!win) {
    return 'success';
  }

  return win[E2E_CHAT_SCENARIO_FLAG] === 'rate_limit' ? 'rate_limit' : 'success';
};

const createE2EConversationId = (): string => {
  const win = getWindowRecord();
  if (!win) {
    return `e2e-conv-${Date.now()}`;
  }
  const nextSeq =
    typeof win[E2E_CHAT_CONV_SEQ] === 'number'
      ? (win[E2E_CHAT_CONV_SEQ] as number) + 1
      : 1;

  win[E2E_CHAT_CONV_SEQ] = nextSeq;
  return `e2e-conv-${nextSeq}`;
};

function buildE2EMockConversationResponse(
  userMessage: string,
  conversationId: string,
  scenario: E2EChatScenario
): ConversationResponse {
  const now = Date.now();

  if (scenario === 'rate_limit') {
    return {
      assistant_message:
        'GitHub Copilot a temporairement atteint sa limite de taux. Réessaie après la fenêtre de quota.',
      conversation_id: conversationId,
      message_id: `e2e-rate-limit-${now}`,
      detected_intention: 'Meta',
      detected_emotion: {
        valence: 0,
        intensity: 0,
        energy: 0,
      },
      cognitive_tags: ['e2e', 'mock', 'rate-limit'],
      cognitive_summary: 'E2E mock rate limit response',
      metadata: {
        timestamp: now,
        provider_used: 'github-copilot',
        latency_ms: 0,
        tokens_used: 0,
        memory_effect: 'New',
        links_to_contexts: ['reason:RATE_LIMIT'],
      },
      meta: {
        provider_used: 'github-copilot',
        provider_class: 'remote',
        mode: 'OFFLINE',
        reason_code: 'RATE_LIMIT',
        latency_ms_total: 0,
        timeout_ms: 30000,
        retries: 1,
        attempts: [
          {
            provider_id: 'github-copilot',
            provider_class: 'remote',
            latency_ms: 0,
            outcome: 'error',
            reason_code: 'RATE_LIMIT',
            network_used_attempt: true,
          },
        ],
        network_used: true,
        cache_hit: false,
        policy: 'conversation_engine_e2e_rate_limit_mock',
      },
    };
  }

  return {
    assistant_message: `[MOCK_OK] ${userMessage}`,
    conversation_id: conversationId,
    message_id: `e2e-${now}`,
    detected_intention: 'Question',
    detected_emotion: {
      valence: 0,
      intensity: 0,
      energy: 0,
    },
    cognitive_tags: ['e2e', 'mock'],
    cognitive_summary: 'E2E mock response',
    metadata: {
      timestamp: now,
      provider_used: 'e2e-mock',
      latency_ms: 0,
      tokens_used: 0,
      memory_effect: 'New',
      links_to_contexts: [],
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type ConversationMode =
  | 'default'
  | 'brainstorming'
  | 'synthesis'
  | 'planning'
  | 'journal'
  | 'debug_cognitive';

export type Intention = 'Question' | 'Action' | 'Emotion' | 'Clarification' | 'Meta';

export type MemoryEffect = 'New' | 'Recall' | 'Connect' | 'Evolve';

export interface EmotionState {
  valence: number; // -1.0 → 1.0
  intensity: number; // 0.0 → 1.0
  energy: number; // 0.0 → 1.0
}

export interface ConversationRequest {
  user_message: string;
  conversation_id?: string;
  mode: ConversationMode;
  ai_config?: {
    temperature: number;
    max_tokens?: number;
    provider_preference: 'Auto' | 'Gemini' | 'Ollama' | 'Local';
  };
  emotion_context?: EmotionState;
}

export type ConversationProviderPreference =
  | 'auto'
  | 'gemini'
  | 'ollama'
  | 'openai'
  | 'claude'
  | 'local';

export interface ConversationResponse {
  assistant_message: string;
  conversation_id: string;
  message_id: string;
  detected_intention: Intention;
  detected_emotion: EmotionState;
  cognitive_tags: string[];
  cognitive_summary: string;
  metadata: ConversationMetadata;
  meta?: ProviderDecisionMeta;
  decision?: OnlineDecision;
  discernment?: DiscernmentDecision;
  /** OMEGA_AUTO_ORCHESTRATION_CHAIN trace meta — present when auto-classification ran */
  omega_trace_meta?: OmegaTraceMeta;
}

export interface ConversationMetadata {
  timestamp: number;
  provider_used: string;
  latency_ms: number;
  tokens_used: number;
  memory_effect: MemoryEffect;
  links_to_contexts: string[];
}

/** Trace metadata emitted by OMEGA_AUTO_ORCHESTRATION_CHAIN (Lock #1) */
export interface OmegaTraceMeta {
  canonical_mode: string;
  profile_id: string;
  effort_level: string;
  model_class: string;
  classifier_confidence: number;
  classifier_reason_code: string;
  classifier_signals: string[];
  resolved_backend_mode: string;
  provider_used: string;
  fallback_used: boolean;
}

interface OmegaGenerateResponse {
  content?: string;
  conversationId?: string;
  conversation_id?: string;
  messageId?: string;
  message_id?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  provider?: string;
  meta?: ProviderDecisionMeta;
  decision?: OnlineDecision;
}

function normalizeProviderMeta(raw: unknown): ProviderDecisionMeta | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }

  return raw as ProviderDecisionMeta;
}

function deriveFallbackProviderMeta(
  metadata: Record<string, unknown>,
  decision?: OnlineDecision
): ProviderDecisionMeta {
  const reasonFromMetadataRaw =
    typeof metadata['reason_code'] === 'string'
      ? metadata['reason_code'].toUpperCase()
      : undefined;

  const modeFromMetadataRaw =
    typeof metadata['mode'] === 'string' ? metadata['mode'].toUpperCase() : undefined;

  const modeFromMetadata: Mode | undefined =
    modeFromMetadataRaw === 'LOCAL' ||
    modeFromMetadataRaw === 'REMOTE' ||
    modeFromMetadataRaw === 'OFFLINE' ||
    modeFromMetadataRaw === 'CACHED' ||
    modeFromMetadataRaw === 'ERROR'
      ? modeFromMetadataRaw
      : undefined;

  const reason_code: ReasonCode =
    reasonFromMetadataRaw === 'OK' ||
    reasonFromMetadataRaw === 'POLICY_BLOCKED' ||
    reasonFromMetadataRaw === 'ALLOWLIST_DENIED' ||
    reasonFromMetadataRaw === 'PROVIDER_DOWN' ||
    reasonFromMetadataRaw === 'TIMEOUT' ||
    reasonFromMetadataRaw === 'RATE_LIMIT' ||
    reasonFromMetadataRaw === 'INVALID_CONFIG' ||
    reasonFromMetadataRaw === 'NETWORK_ERROR' ||
    reasonFromMetadataRaw === 'FALLBACK_OFFLINE' ||
    reasonFromMetadataRaw === 'CACHE_HIT' ||
    reasonFromMetadataRaw === 'CACHE_MISS' ||
    reasonFromMetadataRaw === 'SERIALIZATION_DROPPED' ||
    reasonFromMetadataRaw === 'PROVIDER_UNAVAILABLE' ||
    reasonFromMetadataRaw === 'TOOL_REQUIRED' ||
    reasonFromMetadataRaw === 'TOOL_DENIED' ||
    reasonFromMetadataRaw === 'CONTRACT_VIOLATION_CLAMPED' ||
    reasonFromMetadataRaw === 'UNKNOWN'
      ? reasonFromMetadataRaw
      : decision?.reasonCode === 'OFFLINE_TIMEOUT'
        ? 'TIMEOUT'
        : decision?.reasonCode === 'OFFLINE_NETWORK_BLOCKED'
          ? 'NETWORK_ERROR'
          : decision?.reasonCode === 'OFFLINE_INTERNAL_ERROR'
            ? 'FALLBACK_OFFLINE'
            : modeFromMetadata === 'LOCAL' ||
                modeFromMetadata === 'REMOTE' ||
                modeFromMetadata === 'CACHED'
              ? 'OK'
              : 'UNKNOWN';

  const mode: Mode =
    decision?.mode ||
    modeFromMetadata ||
    (reason_code === 'TIMEOUT' || reason_code === 'FALLBACK_OFFLINE'
      ? 'OFFLINE'
      : reason_code === 'OK'
        ? 'LOCAL'
        : 'ERROR');

  const provider_used =
    (typeof metadata['provider_used'] === 'string' && metadata['provider_used']) ||
    decision?.providerSelected ||
    'fallback';

  const latency_ms_total =
    typeof metadata['latency_ms'] === 'number' ? metadata['latency_ms'] : 0;

  const timeout_ms =
    typeof metadata['timeout_ms'] === 'number' ? metadata['timeout_ms'] : 30000;
  const retries = typeof metadata['retries'] === 'number' ? metadata['retries'] : 0;
  const network_used =
    typeof metadata['network_used'] === 'boolean'
      ? metadata['network_used']
      : (decision?.networkUsed ?? false);
  const cache_hit =
    typeof metadata['cache_hit'] === 'boolean' ? metadata['cache_hit'] : false;
  const policy =
    typeof metadata['policy'] === 'string'
      ? metadata['policy']
      : 'conversation_engine_meta_fallback';

  return {
    provider_used,
    provider_class: mode === 'REMOTE' ? 'remote' : mode === 'CACHED' ? 'hybrid' : 'local',
    mode,
    reason_code,
    latency_ms_total,
    timeout_ms,
    retries,
    attempts: decision?.attempts ?? [],
    network_used,
    cache_hit,
    policy,
  };
}

function normalizeDecision(raw: unknown): OnlineDecision | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }

  return raw as OnlineDecision;
}

function isMemoryEffect(val: unknown): val is MemoryEffect {
  return val === 'New' || val === 'Recall' || val === 'Connect' || val === 'Evolve';
}

function isExplicitMemoryQuery(message: string): boolean {
  const normalized = message.toLowerCase();
  const personalFactPatterns = [
    'quel est mon',
    'quelle est ma',
    'quels sont mes',
    'quelles sont mes',
    "je t'ai donné mon",
    'je t’ai donné mon',
    "je ne t'ai jamais donné mon",
    'je ne t’ai jamais donné mon',
    'tu connais mon',
    'tu connais ma',
    'mon code fantôme',
    'mon code fantome',
  ];

  return (
    normalized.includes('remember') ||
    normalized.includes('recall') ||
    normalized.includes('history') ||
    normalized.includes('memorise') ||
    normalized.includes('mémorise') ||
    normalized.includes('rappelle') ||
    normalized.includes('souviens') ||
    normalized.includes('memoire') ||
    normalized.includes('mémoire') ||
    personalFactPatterns.some(pattern => normalized.includes(pattern))
  );
}

function normalizeConversationMetadata(meta: unknown): ConversationMetadata {
  const m = (meta ?? {}) as Record<string, unknown>;

  const links = Array.isArray(m.links_to_contexts)
    ? m.links_to_contexts.filter((v): v is string => typeof v === 'string')
    : [];

  return {
    timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now(),
    provider_used: typeof m.provider_used === 'string' ? m.provider_used : 'fallback',
    latency_ms: typeof m.latency_ms === 'number' ? m.latency_ms : 0,
    tokens_used: typeof m.tokens_used === 'number' ? m.tokens_used : 0,
    memory_effect: isMemoryEffect(m.memory_effect) ? m.memory_effect : 'New',
    links_to_contexts: links,
  };
}

export interface ConversationHealthReport {
  status: 'Healthy' | 'Warning' | 'Critical';
  anomalies_detected: Anomaly[];
  repairs_applied: Repair[];
  coherence_score: number;
}

export interface Anomaly {
  anomaly_type: 'MessageLoss' | 'StateDrift' | 'MemoryCorruption' | 'SyncFailure';
  severity: number;
  description: string;
}

export interface Repair {
  repair_type: string;
  success: boolean;
  details: string;
}

export interface ConversationMemoryStats {
  total_processed: number;
  total_anomalies: number;
  last_scan: number;
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION ENGINE API
// ═══════════════════════════════════════════════════════════════════

/**
 * Lit le profil persona depuis localStorage et retourne un contexte
 * texte à injecter dans le system prompt.
 */
function readPersonaContext(): string {
  try {
    const raw = localStorage.getItem('titane_persona_profile');
    if (!raw) return '';
    const p = JSON.parse(raw) as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof p.tone === 'string' && p.tone !== 'balanced')
      parts.push(`Ton de réponse: ${p.tone}`);
    if (typeof p.verbosity === 'string' && p.verbosity !== 'balanced')
      parts.push(`Verbosité: ${p.verbosity}`);
    if (typeof p.emoji === 'boolean') parts.push(`Emojis: ${p.emoji ? 'oui' : 'non'}`);
    if (typeof p.formality === 'number') parts.push(`Formalité: ${p.formality}/100`);
    if (typeof p.creativity === 'number') parts.push(`Créativité: ${p.creativity}/100`);
    if (typeof p.codeExamples === 'boolean')
      parts.push(`Exemples de code: ${p.codeExamples ? 'oui' : 'non'}`);
    if (parts.length === 0) return '';
    return `Style de réponse préféré de l'utilisateur:\n${parts.join('\n')}`;
  } catch {
    return '';
  }
}

function readCognitiveContext(): string {
  try {
    const stored = localStorage.getItem('titane_cognitive_state');
    if (!stored) return '';
    const state = JSON.parse(stored) as {
      flowActive?: boolean;
      energy?: number;
      mode?: string;
    };
    if (!state) return '';
    const parts: string[] = [];
    if (state.flowActive) parts.push('Flow actif');
    if (typeof state.energy === 'number') parts.push(`Énergie: ${state.energy}%`);
    if (state.mode) parts.push(`Mode cognitif: ${state.mode}`);
    if (parts.length === 0) return '';
    return `\n[ÉTAT COGNITIF: ${parts.join(' | ')}]`;
  } catch {
    return '';
  }
}

export function getStaticPromptContext(
  mode: ConversationMode,
  now = Date.now()
): StaticPromptContextSnapshot {
  if (
    staticPromptContextCache &&
    staticPromptContextCache.data.mode === mode &&
    now - staticPromptContextCache.timestamp < STATIC_PROMPT_CONTEXT_TTL_MS
  ) {
    return staticPromptContextCache.data;
  }

  const snapshot: StaticPromptContextSnapshot = {
    mode,
    systemPrompt: getSystemPrompt(mode),
    personaContext: readPersonaContext(),
    userPreferencesContext: userPreferencesEngine.generateContextForAI(),
    cognitiveContext: readCognitiveContext(),
  };

  staticPromptContextCache = { data: snapshot, timestamp: now };
  return snapshot;
}

export function resetStaticPromptContextCache(): void {
  staticPromptContextCache = null;
}

/**
 * Traiter un message à travers le Conversation Engine v∞
 */
export async function processMessage(
  userMessage: string,
  options?: {
    conversationId?: string;
    mode?: ConversationMode;
    emotionContext?: EmotionState;
    providerPreference?: ConversationProviderPreference;
    contextEnvelope?: ChatContextEnvelope;
  }
): Promise<ConversationResponse> {
  let conversationId = options?.conversationId;

  if (isE2EChatMockEnabled()) {
    if (!conversationId) {
      conversationId = createE2EConversationId();
    }

    return buildE2EMockConversationResponse(
      userMessage,
      conversationId,
      getE2EChatScenario()
    );
  }

  if (!conversationId) {
    try {
      conversationId = (await tauriClient.createNewConversation()) as string;
    } catch (error) {
      logger.warn('[conversationEngine] ⚠️ Failed to create conversation:', error);
      conversationId = `fallback-${Date.now()}`;
    }
  }

  logger.info('[conversationEngine] 📤 Sending to backend:', {
    message_length: userMessage.length,
    mode: options?.mode || 'default',
    conversationId,
    moduleId: options?.contextEnvelope?.moduleContext.moduleId || 'unknown',
  });

  // ✨ v20.5: Ne pas bloquer ici - laisser TauriProtector gérer le fallback Ollama
  // Le protector tentera Tauri en premier, puis Ollama en fallback si besoin
  logger.info('[conversationEngine] 🚀 Envoi du message via secureInvoke');

  const provider = options?.providerPreference ?? 'auto';

  // OMEGA_AUTO_ORCHESTRATION_CHAIN: auto mode classification (Lock #1)
  const modeClassification = classifyMode({
    message: userMessage,
    userExplicitMode: options?.mode ?? 'default',
  });
  const resolvedConversationMode = resolveMode(
    modeClassification,
    options?.mode ?? 'default'
  );

  const conversationMode = resolvedConversationMode;
  const staticPromptContext = getStaticPromptContext(conversationMode);
  const contextualPrompt = options?.contextEnvelope
    ? formatContextEnvelopeForSystemPrompt(options.contextEnvelope)
    : '';

  // Inject persistent 3-level memory context (non-blocking)
  let persistentMemoryContext = '';
  let persistentMemoryStatus: 'loaded' | 'empty' | 'unavailable' | 'skipped' =
    'unavailable';
  if (isExplicitMemoryQuery(userMessage)) {
    // Memory-focused prompts are handled by the backend memory lane.
    // Skipping this frontend prefetch avoids duplicate recall pressure before IPC.
    persistentMemoryStatus = 'skipped';
  } else {
    try {
      const memResult = (await tauriClient.persistentMemoryGetContext({
        modeId: options?.mode || 'default',
        query: userMessage,
      })) as { context: string; usedEntries: string[] } | null;
      if (memResult?.context) {
        persistentMemoryContext = `## PERSISTENT_MEMORY_CONTEXT\n${memResult.context}`;
        persistentMemoryStatus = 'loaded';
      } else {
        persistentMemoryStatus = 'empty';
      }
    } catch (error) {
      // No silent fallback: keep processing but surface explicit status.
      persistentMemoryStatus = 'unavailable';
      logger.warn('[conversationEngine] persistentMemoryGetContext unavailable', error);
    }
  }

  const persistentMemoryStatusContext = `## PERSISTENT_MEMORY_STATUS\nstatus=${persistentMemoryStatus}`;

  // Inject XP + Evolution context (non-blocking, best-effort)
  let progressionContext = '';
  try {
    const xpState = xpEngine.getState();
    const evolutionState = useEvolutionStore.getState();
    const evolutionScore = evolutionState.state?.last_evolution?.health_score ?? null;
    const parts: string[] = [
      `Niveau XP: ${xpState.level} | Total XP: ${xpState.totalXP}`,
    ];
    if (evolutionScore !== null) {
      parts.push(`Score Evolution: ${Math.round(evolutionScore)}`);
    }
    progressionContext = `## XP_EVOLUTION_CONTEXT\n${parts.join(' | ')}`;
  } catch {
    // Non-blocking: proceed without progression context if unavailable
  }

  // IMPROVE-002: LTM history is now loaded and injected by the backend (commands.rs → omega_integration.rs).
  // Frontend no longer loads history per-message to avoid double SQLite queries.
  // Use useLTMContext() in UI components for display purposes only.
  // The backend dedup guard in convert_to_conversation_response() ensures no duplication.

  const systemPrompt = [
    staticPromptContext.systemPrompt,
    contextualPrompt,
    staticPromptContext.personaContext,
    staticPromptContext.userPreferencesContext,
    persistentMemoryContext,
    persistentMemoryStatusContext,
    progressionContext,
    staticPromptContext.cognitiveContext,
  ]
    .filter(Boolean)
    .join('\n\n');
  // ═══════════════════════════════════════════════════════════════════
  // PROMPT BUDGET VALIDATION — anti-explosion guard (Crash Lock #1)
  // Validates user message + system prompt sizes BEFORE IPC call.
  // ═══════════════════════════════════════════════════════════════════
  const budgetValidation = validatePromptBudget({
    message: userMessage,
    systemPrompt,
  });

  // Truncate user message if it exceeds budget (soft limit — warn but continue)
  const userMessageBudget = truncateWithBudget(
    userMessage,
    DEFAULT_PROMPT_BUDGET.maxUserMessageChars,
    'user_message'
  );

  // Truncate system prompt if it exceeds budget (soft limit — warn but continue)
  const systemPromptBudget = truncateWithBudget(
    systemPrompt,
    DEFAULT_PROMPT_BUDGET.maxSystemPromptChars,
    'system_prompt'
  );

  if (!budgetValidation.ok) {
    logger.warn(
      '[PROMPT_BUDGET] ⚠️ Budget violations detected, applying truncation:',
      budgetValidation.violations
    );
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // OMEGA: wire classifier profile → ai_config temperature + maxTokens
  const classifierProfile = RESPONSE_PROFILES[modeClassification.profileId];
  const classifierTemperature = classifierProfile?.temperature ?? 0.7;
  const classifierMaxTokens = classifierProfile?.maxTokens;

  const payload = {
    message: userMessageBudget.text,
    conversationId,
    mode: resolvedConversationMode,
    provider,
    systemPrompt: systemPromptBudget.text,
    requestId,
    classifierMeta: {
      canonical_mode: modeClassification.canonicalMode,
      profile_id: modeClassification.profileId,
      effort_level: modeClassification.effortLevel,
      model_class: modeClassification.modelClass,
      confidence: modeClassification.confidence,
      reason_code: modeClassification.reasonCode,
    },
    aiConfig: {
      temperature: classifierTemperature,
      max_tokens: classifierMaxTokens,
      provider_preference: provider,
    },
    ...(options?.contextEnvelope ? { contextEnvelope: options.contextEnvelope } : {}),
  };

  const convSendLog = {
    mode: options?.mode || 'default',
    provider_requested: provider,
    conversation_id: conversationId,
    message_length: userMessageBudget.text.length,
    module_id: options?.contextEnvelope?.moduleContext.moduleId || 'unknown',
    has_context_envelope: Boolean(options?.contextEnvelope),
    request_id: requestId,
    budget_ok: budgetValidation.ok,
    budget_violations: budgetValidation.violations.length,
    user_message_truncated: userMessageBudget.wasTruncated,
    system_prompt_truncated: systemPromptBudget.wasTruncated,
  };
  logger.info('[CONV_SEND] Provider request', convSendLog);
  // Fallback pour STRUCT-1: log console explicite
  // eslint-disable-next-line no-console
  console.log('[CONV_SEND]', JSON.stringify(convSendLog));

  // Preflight guard — required args must be set before IPC
  if (
    !payload.message ||
    typeof payload.message !== 'string' ||
    payload.message.trim().length === 0
  ) {
    throw new Error(
      '[TITANE] message requis non fourni au payload conversation_generate'
    );
  }
  if (!payload.conversationId || typeof payload.conversationId !== 'string') {
    throw new Error(
      '[TITANE] conversationId requis non fourni au payload conversation_generate'
    );
  }

  let raw: OmegaGenerateResponse;
  try {
    raw = (await tauriClient.conversationGenerate(payload)) as OmegaGenerateResponse;
  } catch (tauriError) {
    // ═══ FALLBACK ORCHESTRATOR: Quand Tauri IPC échoue, tenter aiOrchestrator directement ═══
    // Ollama est disponible en local mais le backend Tauri ne l'est pas → utiliser l'orchestrator frontend
    const errorMsg =
      tauriError instanceof Error ? tauriError.message : String(tauriError);
    logger.warn(
      '[conversationEngine] ⚠️ Tauri IPC failed, falling back to aiOrchestrator:',
      errorMsg
    );

    try {
      const aiConfig = {
        preferredProvider: (provider === 'ollama'
          ? 'ollama'
          : provider === 'local'
            ? 'local'
            : provider === 'gemini'
              ? 'gemini'
              : 'auto') as 'auto' | 'ollama' | 'local' | 'gemini' | 'openai' | 'claude',
      };

      const orchestratorResponse = await aiOrchestrator.generate(
        userMessage,
        [],
        aiConfig
      );

      const latencyMs =
        typeof orchestratorResponse.metadata?.totalResponseTime === 'number'
          ? orchestratorResponse.metadata.totalResponseTime
          : 0;
      const orchestratorProvider =
        orchestratorResponse.provider ||
        (typeof orchestratorResponse.metadata?.selectedProvider === 'string'
          ? orchestratorResponse.metadata.selectedProvider
          : undefined) ||
        'ollama';

      raw = {
        content: orchestratorResponse.content,
        conversationId: conversationId,
        messageId: `msg-${Date.now()}`,
        latencyMs,
        provider: orchestratorProvider,
        metadata: {
          provider_used: orchestratorProvider,
          latency_ms: latencyMs,
          mode: 'LOCAL',
          reason_code: 'OK',
          fallback_used: true,
          network_used: false,
          cache_hit: false,
          policy: 'conversation_engine_orchestrator_fallback',
        },
      };

      logger.info('[conversationEngine] ✅ Orchestrator fallback succeeded:', {
        provider: orchestratorProvider,
        latencyMs,
        contentLength: orchestratorResponse.content?.length,
      });
    } catch (orchestratorError) {
      const orchErrorMsg =
        orchestratorError instanceof Error
          ? orchestratorError.message
          : String(orchestratorError);
      logger.error(
        '[conversationEngine] ❌ Orchestrator fallback also failed:',
        orchErrorMsg
      );
      throw new Error(
        `Backend et orchestrator indisponibles. Tauri: ${errorMsg}. Orchestrator: ${orchErrorMsg}`
      );
    }
  }

  // ═══ DETECT TAURI PROTECTOR FALLBACK OBJECT (silent fallback) ═══
  // tauriProtector returns a mock object instead of throwing, which bypasses the catch block above.
  // We must detect this and attempt the orchestrator fallback to access titane-local.
  const rawMetaCheck = (raw as Record<string, unknown>)?.meta as
    | Record<string, unknown>
    | undefined;
  const rawProviderCheck = (raw as Record<string, unknown>)?.provider as
    | string
    | undefined;
  const isTauriProtectorFallback =
    rawMetaCheck?.policy === 'tauri_protector_runtime_fallback' ||
    rawMetaCheck?.policy === 'tauri_protector_ipc_fallback' ||
    rawMetaCheck?.reason_code === 'FALLBACK_OFFLINE' ||
    rawMetaCheck?.reason_code === 'CONTRACT_VIOLATION_CLAMPED' ||
    (rawProviderCheck === 'fallback' && rawMetaCheck?.mode === 'ERROR');

  if (isTauriProtectorFallback) {
    const fallbackReason = rawMetaCheck?.reason_code || 'UNKNOWN';
    logger.warn(
      `[conversationEngine] ⚠️ TauriProtector returned silent fallback (${fallbackReason}), attempting orchestrator fallback...`
    );

    try {
      const aiConfig = {
        preferredProvider: (provider === 'ollama'
          ? 'ollama'
          : provider === 'local'
            ? 'local'
            : provider === 'gemini'
              ? 'gemini'
              : 'auto') as 'auto' | 'ollama' | 'local' | 'gemini' | 'openai' | 'claude',
      };

      const orchestratorResponse = await aiOrchestrator.generate(
        userMessage,
        [],
        aiConfig
      );

      const latencyMs =
        typeof orchestratorResponse.metadata?.totalResponseTime === 'number'
          ? orchestratorResponse.metadata.totalResponseTime
          : 0;
      const orchestratorProvider =
        orchestratorResponse.provider ||
        (typeof orchestratorResponse.metadata?.selectedProvider === 'string'
          ? orchestratorResponse.metadata.selectedProvider
          : undefined) ||
        'ollama';

      raw = {
        content: orchestratorResponse.content,
        conversationId: conversationId,
        messageId: `msg-${Date.now()}`,
        latencyMs,
        provider: orchestratorProvider,
        metadata: {
          provider_used: orchestratorProvider,
          latency_ms: latencyMs,
          mode: 'LOCAL',
          reason_code: 'OK',
          fallback_used: true,
          network_used: false,
          cache_hit: false,
          policy: 'conversation_engine_orchestrator_fallback',
        },
      };

      logger.info(
        '[conversationEngine] ✅ Orchestrator fallback succeeded after tauriProtector silent fallback:',
        {
          provider: orchestratorProvider,
          latencyMs,
          contentLength: orchestratorResponse.content?.length,
        }
      );
    } catch (orchestratorError) {
      const orchErrorMsg =
        orchestratorError instanceof Error
          ? orchestratorError.message
          : String(orchestratorError);
      logger.error(
        '[conversationEngine] ❌ Orchestrator fallback also failed after tauriProtector silent fallback:',
        orchErrorMsg
      );
      // Continue with the original tauriProtector fallback response if orchestrator also fails
      // (the original fallback message is already in raw.content)
    }
  }

  // Guard: CONTRACT_VIOLATION_CLAMPED — l'IPC a échoué côté Tauri (args invalides ou Tauri indisponible)
  // Plutôt que d'afficher l'erreur technique comme message assistant, on lève une vraie erreur
  const rawMeta = (raw as Record<string, unknown>)?.meta as
    | Record<string, unknown>
    | undefined;
  if (rawMeta?.reason_code === 'CONTRACT_VIOLATION_CLAMPED') {
    const policy = typeof rawMeta?.policy === 'string' ? rawMeta.policy : 'inconnu';
    throw new Error(
      `[IPC] Contrat conversation_generate invalide (${policy}). Vérifier que le backend Tauri est démarré et synchronisé avec le frontend.`
    );
  }

  const content = typeof raw?.content === 'string' ? raw.content : '';
  if (content.trim().length === 0) {
    logger.error('[conversationEngine] ❌ AI returned empty content');
    logger.info('[conversationEngine] Raw response:', raw);
    throw new Error('AI backend returned empty response');
  }

  const metadata = (raw?.metadata ?? {}) as Record<string, unknown>;
  const decision = normalizeDecision(raw?.decision);
  const providerMeta =
    normalizeProviderMeta(raw?.meta) ||
    normalizeProviderMeta(metadata['providerMeta']) ||
    normalizeProviderMeta(metadata['meta']) ||
    deriveFallbackProviderMeta(metadata, decision);

  // P2.1: Anti-lie monotonicity gate — validate provider meta at IPC boundary
  if (providerMeta) {
    const metaValidation = validateProviderDecisionMeta(providerMeta);
    if (!metaValidation.ok) {
      logger.error(
        '[conversationEngine] ❌ IPC TRUTH CONTRACT VIOLATION — ProviderDecisionMeta invalid:',
        metaValidation.errors
      );
      // Do not throw: log and continue with validated meta to avoid breaking the user experience.
      // The error is surfaced to observability for fixing upstream.
    }
  }

  const cognitiveTagsRaw = metadata['cognitiveTags'];
  const cognitiveTags = Array.isArray(cognitiveTagsRaw)
    ? cognitiveTagsRaw.filter((v): v is string => typeof v === 'string')
    : [];

  const detectedIntentionRaw = metadata['intention'];
  const detectedIntention: Intention =
    detectedIntentionRaw === 'Question' ||
    detectedIntentionRaw === 'Action' ||
    detectedIntentionRaw === 'Emotion' ||
    detectedIntentionRaw === 'Clarification' ||
    detectedIntentionRaw === 'Meta'
      ? detectedIntentionRaw
      : 'Question';

  const normalizedMetadata = normalizeConversationMetadata({
    ...metadata,
    provider_used:
      (typeof raw?.provider === 'string' && raw.provider.trim().length > 0
        ? raw.provider
        : undefined) ??
      (typeof metadata['provider_used'] === 'string'
        ? metadata['provider_used']
        : undefined) ??
      'fallback',
    latency_ms:
      (typeof raw?.latencyMs === 'number' ? raw.latencyMs : undefined) ??
      (typeof metadata['latency_ms'] === 'number' ? metadata['latency_ms'] : 0),
  });

  if (options?.contextEnvelope) {
    normalizedMetadata.links_to_contexts = Array.from(
      new Set([
        ...normalizedMetadata.links_to_contexts,
        `route:${options.contextEnvelope.routeContext.route}`,
        `module:${options.contextEnvelope.moduleContext.moduleId}`,
        `continuity:${options.contextEnvelope.continuity.changeType}`,
      ])
    );
  }

  // Minimal discernment decision (frontend stub, not authoritative)
  const inferenceState: InferenceState =
    detectedIntention === 'Clarification' ? 'CLARIFY_REQUIRED' : 'SAFE_TO_INFER';
  const taskType: 'question' | 'instruction' | 'multi-step' | 'code' | 'data' =
    detectedIntention === 'Action' ? 'instruction' : 'question';
  const memoryAvailable = persistentMemoryStatus === 'loaded';
  const webAvailable =
    typeof navigator !== 'undefined' ? navigator.onLine === true : false;
  const toolAvailable = false; // frontend has no direct tool lane
  const providerAvailable =
    typeof normalizedMetadata.provider_used === 'string' &&
    normalizedMetadata.provider_used !== 'fallback';

  const discernmentDecision = buildDiscernmentDecision({
    profileId: modeClassification.profileId as ResponseProfileId,
    inferenceState,
    taskType,
    memoryAvailable,
    webAvailable,
    toolAvailable,
    providerAvailable,
    safetyMode: 'normal',
  });

  const response: ConversationResponse = {
    assistant_message: content,
    conversation_id:
      (typeof raw?.conversationId === 'string' && raw.conversationId) ||
      (typeof raw?.conversation_id === 'string' && raw.conversation_id) ||
      conversationId,
    message_id:
      (typeof raw?.messageId === 'string' && raw.messageId) ||
      (typeof raw?.message_id === 'string' && raw.message_id) ||
      `msg-${Date.now()}`,
    detected_intention: detectedIntention,
    detected_emotion: {
      valence: 0,
      intensity: 0,
      energy: 0,
    },
    cognitive_tags: cognitiveTags,
    cognitive_summary:
      typeof metadata['cognitiveSummary'] === 'string'
        ? (metadata['cognitiveSummary'] as string)
        : '',
    metadata: normalizedMetadata,
    meta: providerMeta,
    decision,
    discernment: discernmentDecision,
    omega_trace_meta: {
      canonical_mode: modeClassification.canonicalMode,
      profile_id: modeClassification.profileId,
      effort_level: modeClassification.effortLevel,
      model_class: modeClassification.modelClass,
      classifier_confidence: modeClassification.confidence,
      classifier_reason_code: modeClassification.reasonCode,
      classifier_signals: modeClassification.signals,
      resolved_backend_mode: resolvedConversationMode,
      provider_used: normalizedMetadata.provider_used,
      fallback_used: Boolean(metadata['fallback_used']),
    },
  };

  const convRecvLog = {
    message_id: response.message_id,
    assistant_message_length: response.assistant_message?.length || 0,
    assistant_message_preview: response.assistant_message?.substring(0, 100),
    provider: response.metadata?.provider_used,
  };
  logger.info('[conversationEngine] 📥 Backend response:', convRecvLog);
  // Fallback pour STRUCT-1: log console explicite
  // eslint-disable-next-line no-console
  console.log('[CONV_RECV]', JSON.stringify(convRecvLog));

  // ✨ OBSERVABILITY: Log provider decision meta
  if (providerMeta) {
    const convRecvMetaLog = {
      mode: providerMeta.mode,
      reason_code: providerMeta.reason_code,
      provider_used: providerMeta.provider_used,
      network_used: providerMeta.network_used,
      attempts_count: providerMeta.attempts?.length || 0,
      latency_ms: providerMeta.latency_ms_total,
    };
    logger.info('[CONV_RECV] Provider decision', convRecvMetaLog);
    // Fallback pour STRUCT-1: log console explicite
    // eslint-disable-next-line no-console
    console.log('[CONV_RECV]', JSON.stringify(convRecvMetaLog));
  } else {
    logger.warn('[CONV_RECV] ⚠️ Provider meta missing in response');
  }

  return response;
}

/**
 * Vérifier la santé du système conversationnel
 */
export async function healthCheck(): Promise<ConversationHealthReport> {
  return (await tauriClient.conversationHealthCheck()) as ConversationHealthReport;
}

/**
 * Obtenir les statistiques mémoire
 */
export async function getMemoryStats(): Promise<ConversationMemoryStats> {
  return (await tauriClient.conversationMemoryStats()) as ConversationMemoryStats;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Formater une émotion en texte lisible
 */
export function formatEmotion(emotion: EmotionState): string {
  const valenceLabel =
    emotion.valence > 0.5
      ? '😊 Positif'
      : emotion.valence < -0.5
        ? '😔 Négatif'
        : '😐 Neutre';

  const intensityLabel =
    emotion.intensity > 0.7
      ? '🔥 Intense'
      : emotion.intensity > 0.4
        ? '⚡ Modéré'
        : '💧 Calme';

  const energyLabel =
    emotion.energy > 0.7
      ? '⚡ Énergisé'
      : emotion.energy > 0.4
        ? '🔋 Normal'
        : '🌙 Fatigué';

  return `${valenceLabel} • ${intensityLabel} • ${energyLabel}`;
}

/**
 * Formater une intention en texte lisible
 */
export function formatIntention(intention: Intention): string {
  const labels: Record<Intention, string> = {
    Question: '❓ Question',
    Action: '⚡ Action',
    Emotion: '💭 Émotion',
    Clarification: '🔍 Clarification',
    Meta: '🎭 Meta',
  };
  return labels[intention] || intention;
}

/**
 * Formater l'effet mémoire en texte lisible
 */
export function formatMemoryEffect(effect: MemoryEffect): string {
  const labels: Record<MemoryEffect, string> = {
    New: '✨ Nouveau',
    Recall: '📚 Rappel',
    Connect: '🔗 Connexion',
    Evolve: '🌱 Évolution',
  };
  return labels[effect] || effect;
}

/**
 * Analyser le statut de santé
 */
export function analyzeHealthStatus(report: ConversationHealthReport): {
  isHealthy: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  message: string;
} {
  if (report.status === 'Healthy') {
    return {
      isHealthy: true,
      severity: 'none',
      message: '✅ Système conversationnel optimal',
    };
  }

  if (report.status === 'Warning') {
    return {
      isHealthy: true,
      severity: 'medium',
      message: '⚠️ Anomalies détectées, réparation en cours',
    };
  }

  return {
    isHealthy: false,
    severity: 'high',
    message: '🚨 État critique, réparation urgente nécessaire',
  };
}
