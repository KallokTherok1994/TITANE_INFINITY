/**
 * TITANE∞ v44 — Chat Memory Single Door
 * Minimal orchestrated single door for chat contextual memory.
 */

import type { ModuleRouteContext } from '@/services/chat/moduleRouteContext';
import type { ConversationMode } from '@/services/conversationEngine';
import type { ProviderDecisionMeta } from '@/types/providerMeta';
import { createLogger } from '@/utils/logger';
import { resolveChatMemoryStorageKey } from '@/services/chatMemoryCompactor';
import {
  buildTemporalMemorySummary,
  type TemporalMemorySummary,
} from '@/services/chat/temporalMemoryManager';

const logger = createLogger('[chatMemorySingleDoor]');

const LAST_ENVELOPE_KEY = 'titane_chat_context_envelope_v1';
export const TIME_RUNTIME_CONTEXT_KEY = 'titane_time_runtime_context_v1';

interface ChatLikeMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface StoredModeMemory {
  messages?: unknown[];
}

export interface ChatContextEnvelope {
  routeContext: {
    route: string;
    aliasResolvedFrom?: string;
    pageState?: string;
    fullRoute?: string;
    updatedAt: number;
  };
  moduleContext: {
    moduleId: string;
    moduleName: string;
    moduleType: string;
    pageTitle: string;
    capabilities: string[];
    dataTruthClass: string;
    actions: string[];
    limits: string[];
    memoryKeys: string[];
  };
  continuity: {
    sequence: number;
    changeType: 'initial' | 'same-module' | 'module-switch';
    fromRoute?: string;
    fromModuleId?: string;
    staleGuard: 'steady' | 'resync';
  };
  memorySingleDoor: {
    conversationId: string;
    mode: ConversationMode;
    providerRequested: string;
    tags: string[];
    recentMessages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: number;
      contextModuleId?: string;
    }>;
    scopeDecision: {
      kept: number;
      purged: number;
      recalculated: boolean;
    };
  };
  runtimeMetadata: {
    lastProviderMode?: string;
    lastProviderUsed?: string;
    lastReasonCode?: string;
    networkUsed?: boolean;
  };
  timeContext?: {
    currentDateTime: string;
    timeZone: string;
    currentSegment: string;
    isWorkHours: boolean;
    eventsToday: number;
    eventsThisWeek: number;
    todayFocusMinutes: number;
    currentEnergy: number;
    activeTab?: string;
    runtimeSource?:
      | 'uninitialized'
      | 'persistence-active'
      | 'degraded'
      | 'global-publisher';
    updatedAt: number;
  };
  // TIME cognitive state (injected from TimePage localStorage)
  cognitiveContext?: {
    flowActive: boolean;
    energy: number;
    mode: string;
  };
  temporalMemorySummary?: TemporalMemorySummary;
  // TWINS fusion context (injected from useTwinEvolution localStorage)
  twinsContext?: {
    globalScore: number;
    trend: string;
    currentPhase?: string | null;
    syncScore?: number;
    identityCore?: {
      name?: string;
      signature?: string;
      coreValues?: Array<{ name?: string }>;
    };
    valueMap?: {
      observedValues?: Array<{ name?: string }>;
      confirmedValues?: string[];
      alignmentScore?: number;
    };
    cognitivePatterns?: {
      reasoningPatterns?: Array<{ name?: string }>;
    };
    therapeuticModel?: {
      deepListening?: number;
      rhythmRespect?: number;
      relationalClarity?: number;
    };
    creativeSignature?: {
      operationalIntuition?: number;
      structuralCreativity?: number;
      frameworksCount?: number;
    };
    fusionComponents?: {
      valueAlignment?: number;
      cognitiveAlignment?: number;
      styleAlignment?: number;
      therapeuticAlignment?: number;
      creativeAlignment?: number;
      evolutionAlignment?: number;
    };
    ownerThemes?: string[];
    sourceCount?: number;
    portraitUrl?: string;
    reflectionAxis?: string;
    updatedAt: number;
  };
  generatedAt: number;
}

export interface BuildSingleDoorInput {
  mode: ConversationMode;
  conversationId: string | null;
  providerRequested: string;
  moduleContext: ModuleRouteContext | null;
  inMemoryMessages: ChatLikeMessage[];
  lastProviderMeta?: ProviderDecisionMeta;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Maximum age (ms) for titane_time_runtime_context_v1 — 15 minutes.
 * Values older than this are stale and excluded from chat temporal injection. */
const TIME_RUNTIME_MAX_AGE_MS = 900_000;

/** Maximum age (ms) for titane_twin_fusion_v1 — 30 minutes.
 *  Values older than this are stale and excluded from context injection. */
const TWINS_FUSION_MAX_AGE_MS = 1_800_000;

/**
 * Read titane_twin_fusion_v1 with a freshness guard.
 * Returns null if absent, malformed, missing updatedAt, or older than 30 minutes.
 * Prevents stale session data from polluting the TWINS_CONTEXT block in chat.
 */
function readFreshTwinsFusion(): ChatContextEnvelope['twinsContext'] | null {
  const raw = readJson<{
    globalScore: number;
    trend: string;
    currentPhase?: string | null;
    syncScore?: number;
    identityCore?: {
      name?: string;
      signature?: string;
      coreValues?: unknown[];
    };
    valueMap?: {
      observedValues?: unknown[];
      confirmedValues?: unknown[];
      alignmentScore?: number;
    };
    cognitivePatterns?: {
      reasoningPatterns?: unknown[];
    };
    therapeuticModel?: {
      deepListening?: number;
      rhythmRespect?: number;
      relationalClarity?: number;
    };
    creativeSignature?: {
      operationalIntuition?: number;
      structuralCreativity?: number;
      frameworksCount?: number;
    };
    fusionComponents?: {
      valueAlignment?: number;
      cognitiveAlignment?: number;
      styleAlignment?: number;
      therapeuticAlignment?: number;
      creativeAlignment?: number;
      evolutionAlignment?: number;
    };
    ownerThemes?: unknown[];
    sourceCount?: number;
    portraitUrl?: string;
    reflectionAxis?: string;
    updatedAt?: number;
  }>('titane_twin_fusion_v1');
  if (!raw) return null;
  if (typeof raw.updatedAt !== 'number') {
    logger.warn('titane_twin_fusion_v1: missing updatedAt — treating as stale');
    return null;
  }
  const ageMs = Date.now() - raw.updatedAt;
  if (ageMs > TWINS_FUSION_MAX_AGE_MS) {
    logger.warn(
      `titane_twin_fusion_v1: stale (age=${Math.round(ageMs / 60_000)}min > 30min) — excluded from context`
    );
    return null;
  }

  const ownerThemes = Array.isArray(raw.ownerThemes)
    ? raw.ownerThemes.filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0
      )
    : [];

  return {
    globalScore: toFiniteNumber(raw.globalScore, 0),
    trend:
      typeof raw.trend === 'string' && raw.trend.trim().length > 0
        ? raw.trend
        : 'unknown',
    currentPhase: raw.currentPhase ?? null,
    syncScore: toFiniteNumber(raw.syncScore, 0),
    identityCore:
      raw.identityCore && typeof raw.identityCore === 'object'
        ? {
            name:
              typeof raw.identityCore.name === 'string'
                ? raw.identityCore.name
                : undefined,
            signature:
              typeof raw.identityCore.signature === 'string'
                ? raw.identityCore.signature
                : undefined,
            coreValues: Array.isArray(raw.identityCore.coreValues)
              ? raw.identityCore.coreValues
                  .filter(
                    (value): value is { name?: string } =>
                      Boolean(value) && typeof value === 'object' && !Array.isArray(value)
                  )
                  .map(value => ({
                    name: typeof value.name === 'string' ? value.name : undefined,
                  }))
              : undefined,
          }
        : undefined,
    valueMap:
      raw.valueMap && typeof raw.valueMap === 'object'
        ? {
            observedValues: Array.isArray(raw.valueMap.observedValues)
              ? raw.valueMap.observedValues
                  .filter(
                    (value): value is { name?: string } =>
                      Boolean(value) && typeof value === 'object' && !Array.isArray(value)
                  )
                  .map(value => ({
                    name: typeof value.name === 'string' ? value.name : undefined,
                  }))
              : undefined,
            confirmedValues: Array.isArray(raw.valueMap.confirmedValues)
              ? raw.valueMap.confirmedValues.filter(
                  (value): value is string => typeof value === 'string'
                )
              : undefined,
            alignmentScore: toFiniteNumber(raw.valueMap.alignmentScore, 0),
          }
        : undefined,
    cognitivePatterns:
      raw.cognitivePatterns && typeof raw.cognitivePatterns === 'object'
        ? {
            reasoningPatterns: Array.isArray(raw.cognitivePatterns.reasoningPatterns)
              ? raw.cognitivePatterns.reasoningPatterns
                  .filter(
                    (value): value is { name?: string } =>
                      Boolean(value) && typeof value === 'object' && !Array.isArray(value)
                  )
                  .map(value => ({
                    name: typeof value.name === 'string' ? value.name : undefined,
                  }))
              : undefined,
          }
        : undefined,
    therapeuticModel:
      raw.therapeuticModel && typeof raw.therapeuticModel === 'object'
        ? {
            deepListening: toFiniteNumber(raw.therapeuticModel.deepListening, 0),
            rhythmRespect: toFiniteNumber(raw.therapeuticModel.rhythmRespect, 0),
            relationalClarity: toFiniteNumber(raw.therapeuticModel.relationalClarity, 0),
          }
        : undefined,
    creativeSignature:
      raw.creativeSignature && typeof raw.creativeSignature === 'object'
        ? {
            operationalIntuition: toFiniteNumber(
              raw.creativeSignature.operationalIntuition,
              0
            ),
            structuralCreativity: toFiniteNumber(
              raw.creativeSignature.structuralCreativity,
              0
            ),
            frameworksCount: toFiniteNumber(raw.creativeSignature.frameworksCount, 0),
          }
        : undefined,
    fusionComponents:
      raw.fusionComponents && typeof raw.fusionComponents === 'object'
        ? {
            valueAlignment: toFiniteNumber(raw.fusionComponents.valueAlignment, 0),
            cognitiveAlignment: toFiniteNumber(
              raw.fusionComponents.cognitiveAlignment,
              0
            ),
            styleAlignment: toFiniteNumber(raw.fusionComponents.styleAlignment, 0),
            therapeuticAlignment: toFiniteNumber(
              raw.fusionComponents.therapeuticAlignment,
              0
            ),
            creativeAlignment: toFiniteNumber(raw.fusionComponents.creativeAlignment, 0),
            evolutionAlignment: toFiniteNumber(
              raw.fusionComponents.evolutionAlignment,
              0
            ),
          }
        : undefined,
    ownerThemes,
    sourceCount: typeof raw.sourceCount === 'number' ? raw.sourceCount : 0,
    portraitUrl: typeof raw.portraitUrl === 'string' ? raw.portraitUrl : undefined,
    reflectionAxis:
      typeof raw.reflectionAxis === 'string' ? raw.reflectionAxis : undefined,
    updatedAt: raw.updatedAt,
  };
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
}

function readTimeRuntimeContext(): ChatContextEnvelope['timeContext'] | undefined {
  const raw = readJson<Partial<NonNullable<ChatContextEnvelope['timeContext']>>>(
    TIME_RUNTIME_CONTEXT_KEY
  );
  if (!raw) return undefined;

  const currentDateTime =
    typeof raw.currentDateTime === 'string' && raw.currentDateTime.trim().length > 0
      ? raw.currentDateTime
      : null;
  const timeZone =
    typeof raw.timeZone === 'string' && raw.timeZone.trim().length > 0
      ? raw.timeZone
      : null;
  const currentSegment =
    typeof raw.currentSegment === 'string' && raw.currentSegment.trim().length > 0
      ? raw.currentSegment
      : null;

  if (!currentDateTime || !timeZone || !currentSegment) {
    return undefined;
  }

  if (typeof raw.updatedAt !== 'number' || !Number.isFinite(raw.updatedAt)) {
    logger.warn(`${TIME_RUNTIME_CONTEXT_KEY}: missing updatedAt — treating as stale`);
    return undefined;
  }

  const ageMs = Date.now() - raw.updatedAt;
  if (ageMs > TIME_RUNTIME_MAX_AGE_MS) {
    logger.warn(
      `${TIME_RUNTIME_CONTEXT_KEY}: stale (age=${Math.round(ageMs / 60_000)}min > 15min) — excluded from context`
    );
    return undefined;
  }

  return {
    currentDateTime,
    timeZone,
    currentSegment,
    isWorkHours: raw.isWorkHours === true,
    eventsToday: toFiniteNumber(raw.eventsToday, 0),
    eventsThisWeek: toFiniteNumber(raw.eventsThisWeek, 0),
    todayFocusMinutes: toFiniteNumber(raw.todayFocusMinutes, 0),
    currentEnergy: toFiniteNumber(raw.currentEnergy, 0),
    activeTab: typeof raw.activeTab === 'string' ? raw.activeTab : undefined,
    runtimeSource:
      raw.runtimeSource === 'persistence-active' ||
      raw.runtimeSource === 'degraded' ||
      raw.runtimeSource === 'uninitialized' ||
      raw.runtimeSource === 'global-publisher'
        ? raw.runtimeSource
        : undefined,
    updatedAt: raw.updatedAt,
  };
}

function readModeStoredMessages(mode: ConversationMode): ChatLikeMessage[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(resolveChatMemoryStorageKey(mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredModeMemory;
    const base = Array.isArray(parsed?.messages) ? parsed.messages : [];
    const messages: ChatLikeMessage[] = [];

    for (const item of base) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        continue;
      }

      const value = item as Record<string, unknown>;
      const role =
        value.role === 'assistant' ? 'assistant' : value.role === 'user' ? 'user' : null;
      if (!role) {
        continue;
      }

      messages.push({
        id: typeof value.id === 'string' ? value.id : undefined,
        role,
        content: typeof value.content === 'string' ? value.content : '',
        timestamp: typeof value.timestamp === 'number' ? value.timestamp : Date.now(),
        metadata:
          value.metadata &&
          typeof value.metadata === 'object' &&
          !Array.isArray(value.metadata)
            ? (value.metadata as Record<string, unknown>)
            : undefined,
      });
    }

    return messages;
  } catch {
    return [];
  }
}

function readContextModuleId(message: ChatLikeMessage): string | undefined {
  const metadata = message.metadata;
  if (!metadata) return undefined;

  const contextBinding = metadata['contextBinding'];
  if (
    !contextBinding ||
    typeof contextBinding !== 'object' ||
    Array.isArray(contextBinding)
  ) {
    return undefined;
  }

  const moduleId = (contextBinding as Record<string, unknown>)['moduleId'];
  return typeof moduleId === 'string' ? moduleId : undefined;
}

function buildTags(
  moduleContext: ModuleRouteContext,
  mode: ConversationMode,
  providerRequested: string
): string[] {
  return Array.from(
    new Set([
      `route:${moduleContext.route}`,
      ...(moduleContext.pageState ? [`page:${moduleContext.pageState}`] : []),
      `module:${moduleContext.moduleId}`,
      `truth:${moduleContext.dataTruthClass}`,
      `mode:${mode}`,
      `provider:${providerRequested || 'auto'}`,
      `switch:${moduleContext.continuity.changeType}`,
      ...moduleContext.capabilities.slice(0, 4).map(cap => `cap:${cap}`),
    ])
  );
}

export function readLastChatContextEnvelope(): ChatContextEnvelope | null {
  return readJson<ChatContextEnvelope>(LAST_ENVELOPE_KEY);
}

export function formatContextEnvelopeForSystemPrompt(
  envelope: ChatContextEnvelope
): string {
  const twinsFusionScore = toFiniteNumber(envelope.twinsContext?.globalScore, 0);
  const twinsSyncScore = toFiniteNumber(envelope.twinsContext?.syncScore, 0);
  const temporalSummary = envelope.temporalMemorySummary;
  const temporalFreshnessRatio = toFiniteNumber(temporalSummary?.freshnessRatio, 0);
  const temporalKeyMoments = Array.isArray(temporalSummary?.keyMoments)
    ? temporalSummary.keyMoments.filter(moment => typeof moment === 'string')
    : [];

  const recent = envelope.memorySingleDoor.recentMessages.slice(-6);
  const recentLines = recent.map(msg => {
    const compact = msg.content.replace(/\s+/g, ' ').trim().slice(0, 220);
    return `- [${msg.role}] ${compact}`;
  });

  return [
    '## CONTEXT_ENVELOPE_V44',
    `route=${envelope.routeContext.route}`,
    `full_route=${envelope.routeContext.fullRoute ?? envelope.routeContext.route}`,
    `page_state=${envelope.routeContext.pageState ?? 'none'}`,
    `module=${envelope.moduleContext.moduleId} (${envelope.moduleContext.moduleName})`,
    `page_title=${envelope.moduleContext.pageTitle}`,
    `module_type=${envelope.moduleContext.moduleType}`,
    `truth_class=${envelope.moduleContext.dataTruthClass}`,
    `capabilities=${envelope.moduleContext.capabilities.join(', ')}`,
    `actions=${envelope.moduleContext.actions.join(', ')}`,
    `limits=${envelope.moduleContext.limits.join(', ')}`,
    `memory_keys=${envelope.moduleContext.memoryKeys.join(', ') || 'none'}`,
    `continuity_change=${envelope.continuity.changeType}`,
    `continuity_seq=${envelope.continuity.sequence}`,
    `stale_guard=${envelope.continuity.staleGuard}`,
    `conversation_id=${envelope.memorySingleDoor.conversationId}`,
    `mode=${envelope.memorySingleDoor.mode}`,
    `provider_requested=${envelope.memorySingleDoor.providerRequested}`,
    `tags=${envelope.memorySingleDoor.tags.join(', ')}`,
    ...(envelope.timeContext
      ? [
          `time_now=${envelope.timeContext.currentDateTime}`,
          `time_zone=${envelope.timeContext.timeZone}`,
          `time_segment=${envelope.timeContext.currentSegment}`,
          `time_work_hours=${envelope.timeContext.isWorkHours}`,
          `time_events_today=${envelope.timeContext.eventsToday}`,
          `time_events_this_week=${envelope.timeContext.eventsThisWeek}`,
          `time_focus_minutes_today=${envelope.timeContext.todayFocusMinutes}`,
          `time_energy_percent=${envelope.timeContext.currentEnergy}`,
          `time_runtime_source=${envelope.timeContext.runtimeSource ?? 'unknown'}`,
        ]
      : []),
    ...(envelope.cognitiveContext
      ? [
          `cognitive_flow_active=${envelope.cognitiveContext.flowActive}`,
          `cognitive_energy=${envelope.cognitiveContext.energy}`,
          `cognitive_mode=${envelope.cognitiveContext.mode}`,
        ]
      : []),
    ...(temporalSummary
      ? [
          `temporal_memory_status=${String(temporalSummary.status || 'unknown')}`,
          `temporal_memory_runtime_source=${String(temporalSummary.runtimeSource || 'unknown')}`,
          `temporal_memory_age_ms=${Math.max(0, Math.round(toFiniteNumber(temporalSummary.ageMs, 0)))}`,
          `temporal_memory_ttl_ms=${Math.max(0, Math.round(toFiniteNumber(temporalSummary.ttlMs, 0)))}`,
          `temporal_memory_freshness_ratio=${temporalFreshnessRatio.toFixed(2)}`,
          `temporal_memory_warning_count=${Math.max(
            0,
            Math.round(toFiniteNumber(temporalSummary.warningCount, 0))
          )}`,
          `temporal_memory_key_moments=${temporalKeyMoments.join(' || ') || 'none'}`,
          `temporal_memory_compact_timeline=${String(temporalSummary.compactTimeline || '')}`,
          `temporal_memory_prompt_safe_summary=${String(temporalSummary.promptSafeSummary || '')}`,
        ]
      : []),
    ...(envelope.twinsContext
      ? [
          `twins_fusion_score=${twinsFusionScore.toFixed(2)}`,
          `twins_trend=${envelope.twinsContext.trend}`,
          `twins_phase=${envelope.twinsContext.currentPhase ?? 'unknown'}`,
          `twins_sync_score=${twinsSyncScore.toFixed(2)}`,
          `twins_identity=${envelope.twinsContext.identityCore?.name ?? 'unknown'}`,
          `twins_core_values=${
            (envelope.twinsContext.identityCore?.coreValues ?? [])
              .map(value => value.name)
              .filter(Boolean)
              .join(', ') || 'none'
          }`,
          `twins_observed_values=${(envelope.twinsContext.valueMap?.observedValues ?? []).length}`,
          `twins_confirmed_values=${(envelope.twinsContext.valueMap?.confirmedValues ?? []).join(', ') || 'none'}`,
          `twins_reasoning_patterns=${(envelope.twinsContext.cognitivePatterns?.reasoningPatterns ?? []).length}`,
          `twins_therapeutic_deep_listening=${toFiniteNumber(envelope.twinsContext.therapeuticModel?.deepListening, 0).toFixed(2)}`,
          `twins_creative_structural=${toFiniteNumber(envelope.twinsContext.creativeSignature?.structuralCreativity, 0).toFixed(2)}`,
          `twins_owner_themes=${(envelope.twinsContext.ownerThemes ?? []).join(', ') || 'none'}`,
          `twins_source_count=${envelope.twinsContext.sourceCount ?? 0}`,
          `twins_reflection_axis=${envelope.twinsContext.reflectionAxis ?? 'none'}`,
          `twins_portrait=${envelope.twinsContext.portraitUrl ? 'configured' : 'fallback'}`,
        ]
      : []),
    'recent_memory:',
    ...recentLines,
  ].join('\n');
}

export function buildChatContextEnvelope(
  input: BuildSingleDoorInput
): ChatContextEnvelope | null {
  const moduleContext = input.moduleContext;
  if (!moduleContext) {
    return null;
  }

  const stored = readModeStoredMessages(input.mode);
  const merged = [...stored, ...input.inMemoryMessages]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-80);

  const sameModule = merged.filter(
    msg => readContextModuleId(msg) === moduleContext.moduleId
  );

  const useScoped = moduleContext.continuity.changeType === 'module-switch';
  const chosenBase = useScoped ? sameModule : merged;
  const fallbackWhenScopedEmpty = useScoped && chosenBase.length === 0;
  const selected = (
    fallbackWhenScopedEmpty ? merged.slice(-4) : chosenBase.slice(-12)
  ).map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    contextModuleId: readContextModuleId(msg),
  }));

  const purged = Math.max(0, merged.length - selected.length);
  const timeContext = readTimeRuntimeContext();
  const temporalMemorySummary = buildTemporalMemorySummary({
    timeContext,
    recentMessages: selected,
    ttlMs: TIME_RUNTIME_MAX_AGE_MS,
  });

  const envelope: ChatContextEnvelope = {
    routeContext: {
      route: moduleContext.route,
      aliasResolvedFrom: moduleContext.aliasResolvedFrom,
      pageState: moduleContext.pageState,
      fullRoute: moduleContext.fullRoute,
      updatedAt: moduleContext.updatedAt,
    },
    moduleContext: {
      moduleId: moduleContext.moduleId,
      moduleName: moduleContext.moduleName,
      moduleType: moduleContext.moduleType,
      pageTitle: moduleContext.pageTitle,
      capabilities: moduleContext.capabilities,
      dataTruthClass: moduleContext.dataTruthClass,
      actions: moduleContext.actions,
      limits: moduleContext.limits,
      memoryKeys: moduleContext.memoryKeys,
    },
    continuity: {
      sequence: moduleContext.continuity.sequence,
      changeType: moduleContext.continuity.changeType,
      fromRoute: moduleContext.continuity.fromRoute,
      fromModuleId: moduleContext.continuity.fromModuleId,
      staleGuard: useScoped ? 'resync' : 'steady',
    },
    memorySingleDoor: {
      conversationId: input.conversationId || 'pending_conversation',
      mode: input.mode,
      providerRequested: input.providerRequested || 'auto',
      tags: buildTags(moduleContext, input.mode, input.providerRequested || 'auto'),
      recentMessages: selected,
      scopeDecision: {
        kept: selected.length,
        purged,
        recalculated: moduleContext.continuity.changeType !== 'same-module',
      },
    },
    runtimeMetadata: {
      lastProviderMode: input.lastProviderMeta?.mode,
      lastProviderUsed: input.lastProviderMeta?.provider_used,
      lastReasonCode: input.lastProviderMeta?.reason_code,
      networkUsed: input.lastProviderMeta?.network_used,
    },
    timeContext,
    temporalMemorySummary,
    cognitiveContext:
      readJson<ChatContextEnvelope['cognitiveContext']>('titane_cognitive_state') ??
      undefined,
    twinsContext: readFreshTwinsFusion() ?? undefined,
    generatedAt: Date.now(),
  };

  writeJson(LAST_ENVELOPE_KEY, envelope);
  return envelope;
}
