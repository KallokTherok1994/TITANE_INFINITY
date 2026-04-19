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
import { ALLOWED_COMMANDS } from '@/lib/security';
import { getSystemPrompt } from '@/config/chatModes.config';
import { memoryService } from '@/services/api/memory';
import { getRelevantPromptContext as getDefaultKbPromptContext } from '@/services/api/defaultKnowledgeBase';
import { userPreferencesEngine } from '@/services/userPreferencesEngine';
import { getMonitoringAgentStatus } from '@/services/monitoring';
import { getDiagnosticAgentStatus } from '@/services/diagnostic';
import { getExplainabilityAgentStatus } from '@/services/explainability';
import { getOrchestratorAgentStatus } from '@/services/orchestrator';
import { getSecurityActiveAgentStatus } from '@/services/security_active';
import {
  getActiveSkill,
  getActiveSkillId,
  getSystemPromptForSkill,
} from '@/services/skills/activation/skillActivator';
import { classifyMode, resolveMode } from '@/services/ai/omegaModeClassifier';
import {
  RESPONSE_PROFILES,
  type ResponseProfileId,
  type InferenceState,
} from '@/services/ai/responsePolicy';
import {
  canonicalDiscernmentKernel,
  type CanonicalDecision,
} from '@/services/ai/canonicalDiscernmentKernel';
import { memoryIntegration, type MemoryContext } from '@/services/ai/memoryIntegration';
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
import { MCPOrchestrator } from '@/services/mcp/MCPOrchestrator';
import { SingularityBridge } from '@/services/singularityBridge';
import type { KnowledgeEntry } from '@/services/memory/types';
import type { Citation } from '@/types/research';

import { createLogger } from '@/utils/logger';

const logger = createLogger('ConversationEngine');
const MIN_CANONICAL_CHAT_OUTPUT_TOKENS = 32768;

const E2E_CHAT_MOCK_FLAG = '__TITANE_E2E_CHAT_MOCK__';
const E2E_CHAT_CONV_SEQ = '__TITANE_E2E_CHAT_CONV_SEQ__';
const E2E_CHAT_SCENARIO_FLAG = '__TITANE_E2E_CHAT_SCENARIO__';
const E2E_CHAT_KNOWLEDGE_SEED_FLAG = '__TITANE_E2E_CHAT_KNOWLEDGE_SEED__';
const E2E_CHAT_MEMORY_LOG_FLAG = '__TITANE_E2E_CHAT_MEMORY_LOG__';
const STATIC_PROMPT_CONTEXT_TTL_MS = 2000;
const OVERRIDABLE_DEPTH_PREFS = new Set<string | null>(['standard', 'developed', null]);

type E2EChatScenario = 'success' | 'rate_limit';

interface E2EChatKnowledgeSeedEntry {
  title: string;
  category: string;
  content: string;
  relevance: number;
  tags: string[];
}

interface E2EChatMemoryLogEntry {
  userMessage: string;
  assistantMessage: string;
  conversationId: string;
  scenario: E2EChatScenario;
  timestamp: number;
  knowledgeTitles: string[];
}

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

function formatRuntimeKnowledgeBlock(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) {
    return '';
  }

  const lines = entries.slice(0, 5).map(entry => {
    const summary = entry.content.replace(/\s+/g, ' ').trim().slice(0, 220);
    const tags =
      Array.isArray(entry.tags) && entry.tags.length > 0 ? entry.tags.join(', ') : 'none';
    return `- ${entry.title} [${entry.category}] tags=${tags} relevance=${entry.relevance.toFixed(2)} excerpt=${summary}`;
  });

  return ['## RUNTIME_KNOWLEDGE_CONTEXT', ...lines].join('\n');
}

function formatHybridMemoryBlock(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) {
    return '';
  }

  const lines = entries.slice(0, 3).map(entry => {
    const summary = entry.content.replace(/\s+/g, ' ').trim().slice(0, 180);
    const tags = Array.isArray(entry.tags) && entry.tags.length > 0 ? entry.tags.join(', ') : 'none';
    return `- ${entry.title} [${entry.category}] relevance=${entry.relevance.toFixed(2)} tags=${tags} excerpt=${summary}`;
  });

  return ['## HYBRID_MEMORY_ORCHESTRATION_CONTEXT', ...lines].join('\n');
}

function formatDefaultKnowledgeBlock(context: string): string {
  const trimmed = context.trim();
  if (!trimmed) {
    return '';
  }

  return ['## DEFAULT_KNOWLEDGE_BASE_CONTEXT', trimmed].join('\n');
}

function formatActiveSkillBlock(skillName: string, prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return '';
  }

  return [`## ACTIVE_SKILL_CONTEXT`, `skill=${skillName}`, trimmed].join('\n');
}

function formatOnlineCapabilityBlock(input: {
  onlineCapabilityStatus: 'available' | 'offline';
  deepAnalysisStatus: 'enabled' | 'disabled';
}): string {
  return [
    '## ONLINE_CAPABILITY_CONTEXT',
    `status=${input.onlineCapabilityStatus}`,
    'governed_web_research=available',
    'one_door_only=true',
    `deep_analysis=${input.deepAnalysisStatus}`,
  ].join('\n');
}

function resolveConversationDepthPref(base: string | null): string | null {
  const deepActive =
    userPreferencesEngine.getPreferences().customPreferences['deep_internet_analysis'] ===
    true;
  if (deepActive && OVERRIDABLE_DEPTH_PREFS.has(base)) {
    return 'deep';
  }

  return base;
}

function normalizeKernelProviderPreference(
  providerName: string | undefined,
  fallback: ConversationProviderPreference
): ConversationProviderPreference {
  switch (providerName) {
    case 'ollama':
    case 'gemini':
    case 'openai':
    case 'claude':
    case 'local':
    case 'auto':
      return providerName;
    case 'titane-local':
      return 'local';
    default:
      return fallback;
  }
}

function formatCanonicalDecisionBlock(
  decision: CanonicalDecision,
  providerPreference: ConversationProviderPreference
): string {
  return [
    '## CANONICAL_DISCERNMENT_CONTEXT',
    `mode=${decision.mode}`,
    `profile=${decision.profileId}`,
    `inference=${decision.inferenceState}`,
    `provider=${providerPreference}`,
    `truth=${decision.truthStatus}`,
    `confidence=${decision.confidence.toFixed(2)}`,
    `skill=${decision.skillId ?? 'none'}`,
  ].join('\n');
}

type GovernedToolLaneStatus = {
  status: 'available' | 'unavailable';
  mcpHealth: string;
  availableCommands: string[];
};

function detectTaskType(
  message: string,
  detectedIntention?: Intention
): 'question' | 'instruction' | 'multi-step' | 'code' | 'data' {
  const normalized = message.toLowerCase();

  if (
    /(typescript|javascript|python|rust|sql|regex|fonction|function|class|interface|bug|stack trace|compiler|refactor|test unitaire|vitest|playwright|json schema|api)/.test(
      normalized
    )
  ) {
    return 'code';
  }

  if (
    /(csv|tableau|dataset|metrics|métriques|statistiques|json|yaml|xml|rapport de données)/.test(
      normalized
    )
  ) {
    return 'data';
  }

  if (
    /(étape|etape|plan|roadmap|checklist|d'abord|ensuite|puis|finally|step by step)/.test(
      normalized
    )
  ) {
    return 'multi-step';
  }

  return detectedIntention === 'Action' ? 'instruction' : 'question';
}

function getGovernedToolLaneStatus(): GovernedToolLaneStatus {
  const governedCommands = [
    'web_research',
    'http_request',
    'memory_recall_semantic',
    'vector_store_search',
  ];
  const availableCommands = governedCommands.filter(command =>
    ALLOWED_COMMANDS.has(command)
  );

  let mcpHealth = 'UNKNOWN';
  try {
    mcpHealth = MCPOrchestrator.getHealth().globalStatus;
  } catch (error) {
    logger.warn('[conversationEngine] governed tool lane MCP health unavailable', error);
  }

  return {
    status:
      availableCommands.length >= 3 && mcpHealth !== 'CRITICAL'
        ? 'available'
        : 'unavailable',
    mcpHealth,
    availableCommands,
  };
}

function formatGovernedToolLaneBlock(status: GovernedToolLaneStatus): string {
  return [
    '## GOVERNED_TOOL_LANE_CONTEXT',
    `status=${status.status}`,
    `mcp_health=${status.mcpHealth}`,
    `available_commands=${status.availableCommands.join(',') || 'none'}`,
    'execution_mode=governed_not_auto',
  ].join('\n');
}

type RuntimeAdvancedAgentStatus = {
  id: string;
  readiness: string;
  serviceState: string;
  nextStep: string;
};

function getRuntimeAdvancedAgentStatuses(): RuntimeAdvancedAgentStatus[] {
  try {
    return [
      getMonitoringAgentStatus(),
      getDiagnosticAgentStatus(),
      getExplainabilityAgentStatus(),
      getOrchestratorAgentStatus(),
      getSecurityActiveAgentStatus(),
    ].map(status => ({
      id: status.id,
      readiness: status.readiness,
      serviceState: status.serviceState,
      nextStep: status.nextStep,
    }));
  } catch (error) {
    logger.warn('[conversationEngine] advanced agent runtime status unavailable', error);
    return [];
  }
}

function formatAdvancedAgentRuntimeBlock(statuses: RuntimeAdvancedAgentStatus[]): string {
  if (statuses.length === 0) {
    return '';
  }

  return [
    '## ADVANCED_AGENT_RUNTIME_CONTEXT',
    ...statuses.map(
      status =>
        `${status.id}: readiness=${status.readiness}; service=${status.serviceState}; next=${status.nextStep}`
    ),
  ].join('\n');
}

function buildContextStatusTags(input: {
  runtimeKnowledgeStatus: 'loaded' | 'empty' | 'unavailable';
  defaultKnowledgeStatus: 'loaded' | 'empty' | 'unavailable';
  persistentMemoryStatus: 'loaded' | 'empty' | 'unavailable' | 'skipped';
  activeSkillStatus: 'active' | 'inactive';
  activeSkillId?: string;
  onlineCapabilityStatus: 'available' | 'offline';
  deepAnalysisStatus: 'enabled' | 'disabled';
  advancedAgentStatuses: RuntimeAdvancedAgentStatus[];
  governedToolLaneStatus: GovernedToolLaneStatus;
  taskType: 'question' | 'instruction' | 'multi-step' | 'code' | 'data';
  canonicalDecision: CanonicalDecision;
  kernelProviderPreference: ConversationProviderPreference;
  contextEnvelope?: ChatContextEnvelope;
}): string[] {
  const tags = [
    `runtime-knowledge:${input.runtimeKnowledgeStatus}`,
    `default-kb:${input.defaultKnowledgeStatus}`,
    `persistent-memory:${input.persistentMemoryStatus}`,
    `skill:${input.activeSkillStatus}`,
    `online:${input.onlineCapabilityStatus}`,
    `deep-analysis:${input.deepAnalysisStatus}`,
    `tool-lane:${input.governedToolLaneStatus.status}`,
    `task-type:${input.taskType}`,
    `kernel-profile:${input.canonicalDecision.profileId}`,
    `kernel-provider:${input.kernelProviderPreference}`,
    `kernel-truth:${input.canonicalDecision.truthStatus.toLowerCase()}`,
  ];

  if (input.activeSkillId) {
    tags.push(`skill-id:${input.activeSkillId}`);
  }

  if (input.canonicalDecision.skillId) {
    tags.push(`kernel-skill:${input.canonicalDecision.skillId}`);
  }

  if (input.advancedAgentStatuses.length > 0) {
    tags.push('advanced-agents:present');
    tags.push(
      ...input.advancedAgentStatuses.map(
        status => `agent:${status.id}:${status.readiness}`
      )
    );
  }

  if (input.contextEnvelope?.twinsContext) {
    tags.push('twins:present');
  }

  if (input.contextEnvelope?.cognitiveContext) {
    tags.push('cognitive-context:present');
  }

  return tags;
}

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

const normalizeE2EChatKnowledgeSeedEntry = (
  value: unknown
): E2EChatKnowledgeSeedEntry | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const title =
    typeof candidate.title === 'string' && candidate.title.trim().length > 0
      ? candidate.title.trim()
      : null;

  if (!title) {
    return null;
  }

  return {
    title,
    category:
      typeof candidate.category === 'string' && candidate.category.trim().length > 0
        ? candidate.category.trim()
        : 'general',
    content:
      typeof candidate.content === 'string' && candidate.content.trim().length > 0
        ? candidate.content.trim()
        : '',
    relevance:
      typeof candidate.relevance === 'number' && Number.isFinite(candidate.relevance)
        ? candidate.relevance
        : 0.5,
    tags: Array.isArray(candidate.tags)
      ? candidate.tags.filter(
          (tag): tag is string => typeof tag === 'string' && tag.length > 0
        )
      : [],
  };
};

const getE2EChatKnowledgeSeed = (): E2EChatKnowledgeSeedEntry[] => {
  const win = getWindowRecord();
  if (!win) {
    return [];
  }

  const rawSeed = win[E2E_CHAT_KNOWLEDGE_SEED_FLAG];
  if (!Array.isArray(rawSeed)) {
    return [];
  }

  return rawSeed
    .map(normalizeE2EChatKnowledgeSeedEntry)
    .filter((entry): entry is E2EChatKnowledgeSeedEntry => entry !== null);
};

const getE2EChatMemoryLog = (): E2EChatMemoryLogEntry[] => {
  const win = getWindowRecord();
  if (!win) {
    return [];
  }

  const rawLog = win[E2E_CHAT_MEMORY_LOG_FLAG];
  return Array.isArray(rawLog) ? (rawLog as E2EChatMemoryLogEntry[]) : [];
};

const persistE2EChatMemoryLogEntry = (entry: E2EChatMemoryLogEntry): void => {
  const win = getWindowRecord();
  if (!win) {
    return;
  }

  win[E2E_CHAT_MEMORY_LOG_FLAG] = [...getE2EChatMemoryLog(), entry];
};

const E2E_CHAT_MEMORY_TRIGGER_PATTERNS = ['rappelle', 'souviens', 'recall'];
const E2E_CHAT_KNOWLEDGE_TRIGGER_PATTERNS = [
  'connaissance',
  'knowledge',
  'one door',
  'governance',
  'twins',
];

const buildE2EMockAssistantMessage = (
  userMessage: string,
  knowledgeSeed: E2EChatKnowledgeSeedEntry[],
  memoryLog: E2EChatMemoryLogEntry[]
): string => {
  const normalized = userMessage.toLowerCase();
  const lines = [`[MOCK_OK] ${userMessage}`];
  const latestMemoryEntry =
    memoryLog.length > 0 ? memoryLog[memoryLog.length - 1] : undefined;

  if (
    latestMemoryEntry &&
    E2E_CHAT_MEMORY_TRIGGER_PATTERNS.some(pattern => normalized.includes(pattern))
  ) {
    lines.push(`[MOCK_MEMORY] ${latestMemoryEntry.userMessage}`);
  }

  if (
    knowledgeSeed.length > 0 &&
    E2E_CHAT_KNOWLEDGE_TRIGGER_PATTERNS.some(pattern => normalized.includes(pattern))
  ) {
    lines.push(
      `[MOCK_KNOWLEDGE] ${knowledgeSeed
        .slice(0, 2)
        .map(entry => entry.title)
        .join(' | ')}`
    );
  }

  return lines.join('\n');
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
  scenario: E2EChatScenario,
  knowledgeSeed: E2EChatKnowledgeSeedEntry[],
  memoryLog: E2EChatMemoryLogEntry[]
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
    assistant_message: buildE2EMockAssistantMessage(
      userMessage,
      knowledgeSeed,
      memoryLog
    ),
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
      links_to_contexts: knowledgeSeed
        .slice(0, 2)
        .map(entry => `knowledge:${entry.title}`),
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
  citations?: Citation[];
  model_requested?: string;
  model_used?: string;
  fallback_used?: boolean;
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
  canonical_truth_status?: string;
  canonical_confidence?: number;
  canonical_skill_id?: string;
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
  trace?: Record<string, unknown>;
}

function normalizeCitation(raw: unknown): Citation | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const url = typeof candidate.url === 'string' ? candidate.url.trim() : '';
  const excerptSource =
    typeof candidate.excerpt === 'string'
      ? candidate.excerpt
      : typeof candidate.snippet === 'string'
        ? candidate.snippet
        : '';
  const excerpt = excerptSource.trim();
  const accessedAtSource =
    typeof candidate.accessed_at === 'string'
      ? candidate.accessed_at
      : typeof candidate.timestamp === 'string'
        ? candidate.timestamp
        : '';
  const accessed_at = accessedAtSource.trim();

  if (!url || !excerpt || !accessed_at) {
    return null;
  }

  return {
    url,
    title:
      typeof candidate.title === 'string' && candidate.title.trim().length > 0
        ? candidate.title.trim()
        : null,
    excerpt,
    locator:
      typeof candidate.locator === 'string' && candidate.locator.trim().length > 0
        ? candidate.locator.trim()
        : null,
    locator_text:
      typeof candidate.locator_text === 'string' &&
      candidate.locator_text.trim().length > 0
        ? candidate.locator_text.trim()
        : null,
    accessed_at,
  };
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
  const citations = Array.isArray(m.citations)
    ? m.citations
        .map(normalizeCitation)
        .filter((citation): citation is Citation => citation !== null)
    : [];

  return {
    timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now(),
    provider_used: typeof m.provider_used === 'string' ? m.provider_used : 'fallback',
    latency_ms: typeof m.latency_ms === 'number' ? m.latency_ms : 0,
    tokens_used: typeof m.tokens_used === 'number' ? m.tokens_used : 0,
    memory_effect: isMemoryEffect(m.memory_effect) ? m.memory_effect : 'New',
    links_to_contexts: links,
    citations,
    model_requested:
      typeof m.model_requested === 'string'
        ? m.model_requested
        : typeof m.modelRequested === 'string'
          ? m.modelRequested
          : undefined,
    model_used:
      typeof m.model_used === 'string'
        ? m.model_used
        : typeof m.modelUsed === 'string'
          ? m.modelUsed
          : undefined,
    fallback_used:
      typeof m.fallback_used === 'boolean'
        ? m.fallback_used
        : typeof m.fallbackUsed === 'boolean'
          ? m.fallbackUsed
          : undefined,
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

    const scenario = getE2EChatScenario();
    const knowledgeSeed = getE2EChatKnowledgeSeed();
    const memoryLog = getE2EChatMemoryLog();
    const response = buildE2EMockConversationResponse(
      userMessage,
      conversationId,
      scenario,
      knowledgeSeed,
      memoryLog
    );

    persistE2EChatMemoryLogEntry({
      userMessage,
      assistantMessage: response.assistant_message,
      conversationId,
      scenario,
      timestamp: response.metadata.timestamp,
      knowledgeTitles: knowledgeSeed.slice(0, 2).map(entry => entry.title),
    });

    return response;
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

  let kernelMemoryContext: MemoryContext = {
    activeProjects: [],
    recentDecisions: [],
    relevantKnowledge: [],
    activeRituals: [],
    timeline: [],
  };
  try {
    kernelMemoryContext = await memoryIntegration.loadContext({
      includeProjects: true,
      includeDecisions: true,
      includeKnowledge: true,
      includeRituals: true,
      includeTimeline: false,
      maxProjects: 5,
      maxDecisions: 6,
      maxKnowledge: 6,
      timeWindow: '7d',
    });
  } catch (error) {
    logger.warn(
      '[conversationEngine] canonical kernel memory context unavailable',
      error
    );
  }
  const hybridMemoryDiagnostics = memoryIntegration.getHybridMemoryDiagnostics();
  const hybridMemoryContext = formatHybridMemoryBlock(
    kernelMemoryContext.hybridSupplementalKnowledge ?? []
  );
  const hybridMemoryStatusContext = [
    '## HYBRID_MEMORY_ORCHESTRATION_STATUS',
    `enabled=${hybridMemoryDiagnostics.hybridOrchestrationEnabled ? 'true' : 'false'}`,
    `status=${hybridMemoryDiagnostics.lastHybridOrchestrationStatus}`,
    `count=${hybridMemoryDiagnostics.lastHybridOrchestrationCount}`,
    `reason=${hybridMemoryDiagnostics.lastHybridOrchestrationReason}`,
  ].join('\n');

  let providerHealthForKernel: Record<string, number> | undefined;
  try {
    const providerStatus = await aiOrchestrator.getProvidersStatus();
    providerHealthForKernel = Object.fromEntries(
      providerStatus.providers.map(providerEntry => [
        providerEntry.name,
        providerEntry.reliability / 100,
      ])
    );
  } catch (error) {
    logger.debug('[conversationEngine] canonical kernel provider health unavailable', {
      error: String(error),
    });
  }

  const userDepthPreference = resolveConversationDepthPref(
    memoryIntegration.getDepthPreference()
  );
  const singularityCoherence = SingularityBridge.getCachedCoherence();

  let runtimeKnowledgeContext = '';
  let runtimeKnowledgeStatus: 'loaded' | 'empty' | 'unavailable' = 'unavailable';
  try {
    const knowledgeEntries = await memoryService.getKnowledge(5);
    if (knowledgeEntries.length > 0) {
      runtimeKnowledgeContext = formatRuntimeKnowledgeBlock(knowledgeEntries);
      runtimeKnowledgeStatus = 'loaded';
    } else {
      runtimeKnowledgeStatus = 'empty';
    }
  } catch (error) {
    runtimeKnowledgeStatus = 'unavailable';
    logger.warn('[conversationEngine] runtime knowledge unavailable', error);
  }

  const runtimeKnowledgeStatusContext = `## RUNTIME_KNOWLEDGE_STATUS\nstatus=${runtimeKnowledgeStatus}`;

  const activeSkillId = getActiveSkillId() ?? undefined;
  const activeSkillPrompt = activeSkillId
    ? (getSystemPromptForSkill(activeSkillId)?.trim() ?? '')
    : '';
  const activeSkillStatus: 'active' | 'inactive' =
    activeSkillId && activeSkillPrompt.length > 0 ? 'active' : 'inactive';
  const activeSkillName = getActiveSkill()?.manifest.name ?? activeSkillId ?? 'none';
  const activeSkillContext =
    activeSkillStatus === 'active'
      ? formatActiveSkillBlock(activeSkillName, activeSkillPrompt)
      : '';
  const activeSkillStatusContext = `## ACTIVE_SKILL_STATUS\nstatus=${activeSkillStatus}${
    activeSkillId ? `\nskill_id=${activeSkillId}` : ''
  }`;
  const taskType = detectTaskType(userMessage);
  const availableSkills = activeSkillId
    ? [
        {
          id: activeSkillId,
          healthy: activeSkillStatus === 'active',
          intentMatch: ['action_request', 'diagnostic', 'research_analysis'],
        },
      ]
    : undefined;
  const canonicalDecision = canonicalDiscernmentKernel.discern({
    message: userMessage,
    mode: conversationMode,
    memoryContext: kernelMemoryContext,
    preferences: memoryIntegration.loadPreferences(),
    userDepthPreference,
    providerPreference: provider,
    runtimeState: {
      ...(providerHealthForKernel ? { providerHealth: providerHealthForKernel } : {}),
      singularityCoherence,
    },
    availableSkills,
  });
  const kernelProviderPreference = normalizeKernelProviderPreference(
    canonicalDecision.provider.name,
    provider
  );
  const canonicalDecisionContext = formatCanonicalDecisionBlock(
    canonicalDecision,
    kernelProviderPreference
  );
  const canonicalDecisionStatusContext = [
    '## CANONICAL_DISCERNMENT_STATUS',
    `truth=${canonicalDecision.truthStatus}`,
    `confidence=${canonicalDecision.confidence.toFixed(2)}`,
  ].join('\n');

  let defaultKnowledgeContext = '';
  let defaultKnowledgeStatus: 'loaded' | 'empty' | 'unavailable' = 'unavailable';
  try {
    const relevantDefaultKnowledge = await getDefaultKbPromptContext(userMessage, 4);
    if (relevantDefaultKnowledge.trim().length > 0) {
      defaultKnowledgeContext = formatDefaultKnowledgeBlock(relevantDefaultKnowledge);
      defaultKnowledgeStatus = 'loaded';
    } else {
      defaultKnowledgeStatus = 'empty';
    }
  } catch (error) {
    defaultKnowledgeStatus = 'unavailable';
    logger.warn('[conversationEngine] default knowledge base unavailable', error);
  }

  const defaultKnowledgeStatusContext = `## DEFAULT_KNOWLEDGE_BASE_STATUS\nstatus=${defaultKnowledgeStatus}`;

  const deepAnalysisStatus: 'enabled' | 'disabled' =
    userPreferencesEngine.getPreferences().customPreferences['deep_internet_analysis'] ===
    true
      ? 'enabled'
      : 'disabled';
  const onlineCapabilityStatus: 'available' | 'offline' =
    typeof navigator !== 'undefined' && navigator.onLine === false
      ? 'offline'
      : 'available';
  const onlineCapabilityContext = formatOnlineCapabilityBlock({
    onlineCapabilityStatus,
    deepAnalysisStatus,
  });
  const onlineCapabilityStatusContext = `## ONLINE_CAPABILITY_STATUS\nstatus=${onlineCapabilityStatus}\ndeep_analysis=${deepAnalysisStatus}`;
  const governedToolLaneStatus = getGovernedToolLaneStatus();
  const governedToolLaneContext = formatGovernedToolLaneBlock(governedToolLaneStatus);
  const governedToolLaneStatusContext = `## GOVERNED_TOOL_LANE_STATUS\nstatus=${governedToolLaneStatus.status}\nmcp_health=${governedToolLaneStatus.mcpHealth}`;
  const advancedAgentStatuses = getRuntimeAdvancedAgentStatuses();
  const advancedAgentRuntimeContext =
    formatAdvancedAgentRuntimeBlock(advancedAgentStatuses);
  const advancedAgentRuntimeStatusContext = `## ADVANCED_AGENT_RUNTIME_STATUS\nstatus=${
    advancedAgentStatuses.length > 0 ? 'available' : 'unavailable'
  }\ncount=${advancedAgentStatuses.length}`;

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
    activeSkillContext,
    activeSkillStatusContext,
    staticPromptContext.personaContext,
    staticPromptContext.userPreferencesContext,
    hybridMemoryContext,
    hybridMemoryStatusContext,
    runtimeKnowledgeContext,
    runtimeKnowledgeStatusContext,
    defaultKnowledgeContext,
    defaultKnowledgeStatusContext,
    onlineCapabilityContext,
    onlineCapabilityStatusContext,
    governedToolLaneContext,
    governedToolLaneStatusContext,
    canonicalDecisionContext,
    canonicalDecisionStatusContext,
    advancedAgentRuntimeContext,
    advancedAgentRuntimeStatusContext,
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
  const classifierProfile = RESPONSE_PROFILES[canonicalDecision.profileId];
  const classifierTemperature = classifierProfile?.temperature ?? 0.7;
  const classifierMaxTokens = classifierProfile?.maxTokens;
  const resolvedTemperature =
    canonicalDecision.provider.temperature ?? classifierTemperature;
  const resolvedMaxTokens = Math.max(
    canonicalDecision.provider.maxTokens ?? classifierMaxTokens ?? 0,
    MIN_CANONICAL_CHAT_OUTPUT_TOKENS
  );
  const backendConversationMode = canonicalDecision.mode as ConversationMode;

  const payload = {
    message: userMessageBudget.text,
    conversationId,
    mode: backendConversationMode,
    provider: kernelProviderPreference,
    systemPrompt: systemPromptBudget.text,
    requestId,
    temperature: resolvedTemperature,
    maxTokens: resolvedMaxTokens,
    classifierMeta: {
      canonical_mode:
        canonicalDecision.modeClassification?.canonicalMode ??
        modeClassification.canonicalMode,
      profile_id: canonicalDecision.profileId,
      effort_level: canonicalDecision.provider.reasoningEffort,
      model_class: modeClassification.modelClass,
      confidence:
        canonicalDecision.modeClassification?.confidence ?? modeClassification.confidence,
      reason_code:
        canonicalDecision.modeClassification?.reasonCode ?? modeClassification.reasonCode,
    },
    aiConfig: {
      temperature: resolvedTemperature,
      max_tokens: resolvedMaxTokens,
      provider_preference: kernelProviderPreference,
    },
    ...(options?.contextEnvelope ? { contextEnvelope: options.contextEnvelope } : {}),
  };

  const convSendLog = {
    mode: options?.mode || 'default',
    provider_requested: kernelProviderPreference,
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
        preferredProvider: (kernelProviderPreference === 'ollama'
          ? 'ollama'
          : kernelProviderPreference === 'local'
            ? 'local'
            : kernelProviderPreference === 'gemini'
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
        preferredProvider: (kernelProviderPreference === 'ollama'
          ? 'ollama'
          : kernelProviderPreference === 'local'
            ? 'local'
            : kernelProviderPreference === 'gemini'
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
  const cognitiveTags = Array.from(
    new Set([
      ...(Array.isArray(cognitiveTagsRaw)
        ? cognitiveTagsRaw.filter((v): v is string => typeof v === 'string')
        : []),
      ...buildContextStatusTags({
        runtimeKnowledgeStatus,
        defaultKnowledgeStatus,
        persistentMemoryStatus,
        activeSkillStatus,
        activeSkillId,
        onlineCapabilityStatus,
        deepAnalysisStatus,
        advancedAgentStatuses,
        governedToolLaneStatus,
        taskType,
        canonicalDecision,
        kernelProviderPreference,
        contextEnvelope: options?.contextEnvelope,
      }),
    ])
  );

  const detectedIntentionRaw = metadata['intention'];
  const detectedIntention: Intention =
    detectedIntentionRaw === 'Question' ||
    detectedIntentionRaw === 'Action' ||
    detectedIntentionRaw === 'Emotion' ||
    detectedIntentionRaw === 'Clarification' ||
    detectedIntentionRaw === 'Meta'
      ? detectedIntentionRaw
      : 'Question';

  const traceRecord = raw?.trace;
  const traceCitations =
    traceRecord &&
    typeof traceRecord === 'object' &&
    Array.isArray(traceRecord['citations'])
      ? traceRecord['citations']
      : [];
  const metadataCitations = Array.isArray(metadata['citations'])
    ? metadata['citations']
    : [];
  const normalizedCitations = (
    metadataCitations.length > 0 ? metadataCitations : traceCitations
  )
    .map(normalizeCitation)
    .filter((citation): citation is Citation => citation !== null);

  const normalizedMetadata = normalizeConversationMetadata({
    ...metadata,
    citations: normalizedCitations,
    provider_used:
      (typeof raw?.provider === 'string' && raw.provider.trim().length > 0
        ? raw.provider
        : undefined) ??
      (typeof providerMeta?.provider_used === 'string' &&
      providerMeta.provider_used.trim().length > 0
        ? providerMeta.provider_used
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

  normalizedMetadata.links_to_contexts = Array.from(
    new Set([
      ...normalizedMetadata.links_to_contexts,
      `runtime_knowledge:${runtimeKnowledgeStatus}`,
      `default_kb:${defaultKnowledgeStatus}`,
      `persistent_memory:${persistentMemoryStatus}`,
      `skill:${activeSkillStatus}`,
      ...(activeSkillId ? [`skill_id:${activeSkillId}`] : []),
      `online:${onlineCapabilityStatus}`,
      `deep_analysis:${deepAnalysisStatus}`,
      `kernel_profile:${canonicalDecision.profileId}`,
      `kernel_provider:${kernelProviderPreference}`,
      `kernel_truth:${canonicalDecision.truthStatus.toLowerCase()}`,
      ...(canonicalDecision.skillId ? [`kernel_skill:${canonicalDecision.skillId}`] : []),
      ...(advancedAgentStatuses.length > 0
        ? [
            'advanced_agents:present',
            ...advancedAgentStatuses.map(
              status => `agent_${status.id}:${status.readiness}`
            ),
          ]
        : []),
      ...(options?.contextEnvelope?.twinsContext ? ['twins:present'] : []),
      ...(options?.contextEnvelope?.cognitiveContext
        ? ['cognitive_context:present']
        : []),
    ])
  );

  // Minimal discernment decision (frontend stub, not authoritative)
  const inferenceState: InferenceState = canonicalDecision.inferenceState;
  const memoryAvailable =
    canonicalDecision.memoryInjection.use || persistentMemoryStatus === 'loaded';
  const webAvailable =
    typeof navigator !== 'undefined' ? navigator.onLine === true : false;
  const toolAvailable = governedToolLaneStatus.status === 'available';
  const providerAvailable =
    kernelProviderPreference !== 'auto' ||
    (typeof normalizedMetadata.provider_used === 'string' &&
      normalizedMetadata.provider_used !== 'fallback');

  const discernmentDecision = buildDiscernmentDecision({
    profileId: canonicalDecision.profileId as ResponseProfileId,
    inferenceState,
    taskType,
    memoryAvailable,
    webAvailable,
    toolAvailable,
    providerAvailable,
    safetyMode: 'normal',
  });

  const discernmentTags = [
    `tool-action:${discernmentDecision.toolAction}`,
    `web-action:${discernmentDecision.webAction}`,
    `memory-action:${discernmentDecision.memoryAction}`,
    `ask-act-hold:${discernmentDecision.askActHold}`,
  ];
  const finalCognitiveTags = Array.from(new Set([...cognitiveTags, ...discernmentTags]));
  normalizedMetadata.links_to_contexts = Array.from(
    new Set([
      ...normalizedMetadata.links_to_contexts,
      `tool_lane:${governedToolLaneStatus.status}`,
      `task_type:${taskType}`,
      `kernel_profile:${canonicalDecision.profileId}`,
      `kernel_provider:${kernelProviderPreference}`,
      `kernel_truth:${canonicalDecision.truthStatus.toLowerCase()}`,
      ...(canonicalDecision.skillId ? [`kernel_skill:${canonicalDecision.skillId}`] : []),
      `tool_action:${discernmentDecision.toolAction}`,
      `web_action:${discernmentDecision.webAction}`,
      `memory_action:${discernmentDecision.memoryAction}`,
      `ask_act_hold:${discernmentDecision.askActHold}`,
    ])
  );

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
    cognitive_tags: finalCognitiveTags,
    cognitive_summary:
      typeof metadata['cognitiveSummary'] === 'string'
        ? (metadata['cognitiveSummary'] as string)
        : '',
    metadata: normalizedMetadata,
    meta: providerMeta,
    decision,
    discernment: discernmentDecision,
    omega_trace_meta: {
      canonical_mode:
        canonicalDecision.modeClassification?.canonicalMode ??
        modeClassification.canonicalMode,
      profile_id: canonicalDecision.profileId,
      effort_level: canonicalDecision.provider.reasoningEffort,
      model_class: modeClassification.modelClass,
      classifier_confidence:
        canonicalDecision.modeClassification?.confidence ?? modeClassification.confidence,
      classifier_reason_code:
        canonicalDecision.modeClassification?.reasonCode ?? modeClassification.reasonCode,
      classifier_signals:
        canonicalDecision.modeClassification?.signals ?? modeClassification.signals,
      resolved_backend_mode: backendConversationMode,
      provider_used: normalizedMetadata.provider_used,
      fallback_used: Boolean(metadata['fallback_used']),
      canonical_truth_status: canonicalDecision.truthStatus,
      canonical_confidence: canonicalDecision.confidence,
      canonical_skill_id: canonicalDecision.skillId ?? undefined,
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

  try {
    await memoryService.saveChatInteraction({
      userMessage,
      aiResponse: response.assistant_message,
      mode: conversationMode,
      timestamp: new Date(response.metadata.timestamp).toISOString(),
      metadata: {
        conversationId: response.conversation_id,
        messageId: response.message_id,
        projectId: options?.contextEnvelope?.moduleContext.moduleId,
        provider_used: response.meta?.provider_used ?? response.metadata.provider_used,
        singleDoorTags: options?.contextEnvelope?.memorySingleDoor.tags,
      },
    });
  } catch (error) {
    logger.warn(
      '[conversationEngine] failed to persist chat interaction in Memory Core',
      error
    );
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
