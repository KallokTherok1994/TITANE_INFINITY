/**
 * TITANE∞ v44 — Chat Memory Single Door
 * Minimal orchestrated single door for chat contextual memory.
 */

import type { ModuleRouteContext } from '@/services/chat/moduleRouteContext';
import type { ConversationMode } from '@/services/conversationEngine';
import type { ProviderDecisionMeta } from '@/types/providerMeta';

const LAST_ENVELOPE_KEY = 'titane_chat_context_envelope_v1';

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

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
}

function readModeStoredMessages(mode: ConversationMode): ChatLikeMessage[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(`titane_chat_mode_${mode}`);
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
  const recent = envelope.memorySingleDoor.recentMessages.slice(-6);
  const recentLines = recent.map(msg => {
    const compact = msg.content.replace(/\s+/g, ' ').trim().slice(0, 220);
    return `- [${msg.role}] ${compact}`;
  });

  return [
    '## CONTEXT_ENVELOPE_V44',
    `route=${envelope.routeContext.route}`,
    `module=${envelope.moduleContext.moduleId} (${envelope.moduleContext.moduleName})`,
    `module_type=${envelope.moduleContext.moduleType}`,
    `truth_class=${envelope.moduleContext.dataTruthClass}`,
    `capabilities=${envelope.moduleContext.capabilities.join(', ')}`,
    `actions=${envelope.moduleContext.actions.join(', ')}`,
    `limits=${envelope.moduleContext.limits.join(', ')}`,
    `continuity_change=${envelope.continuity.changeType}`,
    `continuity_seq=${envelope.continuity.sequence}`,
    `stale_guard=${envelope.continuity.staleGuard}`,
    `conversation_id=${envelope.memorySingleDoor.conversationId}`,
    `mode=${envelope.memorySingleDoor.mode}`,
    `provider_requested=${envelope.memorySingleDoor.providerRequested}`,
    `tags=${envelope.memorySingleDoor.tags.join(', ')}`,
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

  const envelope: ChatContextEnvelope = {
    routeContext: {
      route: moduleContext.route,
      aliasResolvedFrom: moduleContext.aliasResolvedFrom,
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
    generatedAt: Date.now(),
  };

  writeJson(LAST_ENVELOPE_KEY, envelope);
  return envelope;
}
