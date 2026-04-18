/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — USE CONVERSATION ENGINE (Hook Unifié)
 *   Remplace useChat + useChatCore + useChatMemory
 *   Pipeline unique, auto-healing, synchronisation SingularityState
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { logger } from '@/lib/logger';
import type {
  ConversationMode,
  ConversationResponse,
  EmotionState,
  ConversationHealthReport,
  ConversationProviderPreference,
  OmegaTraceMeta,
} from '@/services/conversationEngine';
import {
  processMessage,
  healthCheck,
  getMemoryStats as _getMemoryStats,
} from '@/services/conversationEngine';
import { useChatMemory } from './useChatMemory';
import type { AIMessage } from '@/types';
import { chatMemoryCompactor } from '@/services/chatMemoryCompactor';
import type {
  Mode,
  ProviderClass,
  ProviderDecisionMeta,
  ReasonCode,
} from '@/types/providerMeta';
import type { Citation } from '@/types/research';
import {
  buildChatContextEnvelope,
  type ChatContextEnvelope,
} from '@/services/chat/chatMemorySingleDoor';
import { readActiveModuleContext } from '@/services/chat/moduleRouteContext';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000;
const DEFAULT_MAX_MESSAGES = 500;
const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 30000;

function persistMessageInBackground(
  saveMessage: (message: AIMessage) => unknown,
  message: AIMessage,
  failureLabel: string
): void {
  void (async () => {
    try {
      await Promise.resolve(saveMessage(message));
      chatMemoryCompactor.flushPendingSaves();
    } catch (persistError) {
      logger.warn(failureLabel);
    }
  })();
}

function persistAssistantMessageInBackground(
  saveMessage: (message: AIMessage) => unknown,
  assistantAIMessage: AIMessage,
  failureLabel: string
): void {
  void (async () => {
    try {
      await saveMessage(assistantAIMessage);
      chatMemoryCompactor.flushPendingSaves();
    } catch (persistError) {
      logger.warn(failureLabel);
    }
  })();
}

function toPersistentAIMessage(message: ConversationMessage): AIMessage {
  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    metadata: message.metadata || {},
  };
}

function persistConversationHistoryInBackground(
  replaceMessages: (messages: AIMessage[]) => unknown,
  conversationMessages: ConversationMessage[],
  failureLabel: string
): void {
  void (async () => {
    try {
      await Promise.resolve(
        replaceMessages(
          conversationMessages.map(message => toPersistentAIMessage(message))
        )
      );
      chatMemoryCompactor.flushPendingSaves();
    } catch (persistError) {
      logger.warn(failureLabel);
    }
  })();
}

function mapRequestedProviderClass(
  providerPreference: ConversationProviderPreference | undefined
): ProviderClass {
  switch (providerPreference) {
    case 'gemini':
    case 'openai':
    case 'claude':
      return 'remote';
    case 'ollama':
      return 'local';
    default:
      return 'hybrid';
  }
}

export function mergeRestoredConversationMessages(
  currentMessages: ConversationMessage[],
  restoredMessages: ConversationMessage[]
): ConversationMessage[] {
  return currentMessages.length > 0 ? currentMessages : restoredMessages;
}

export function buildConversationFallbackMeta(
  errorMessage: string,
  providerPreference: ConversationProviderPreference | undefined
): ProviderDecisionMeta {
  const normalized = errorMessage.toLowerCase();
  const isRateLimited =
    normalized.includes('rate limit') ||
    normalized.includes('secondary rate limit') ||
    normalized.includes('too many requests') ||
    normalized.includes('retry after') ||
    normalized.includes('429') ||
    normalized.includes('limite de taux');

  let reasonCode: ReasonCode = 'UNKNOWN';
  let mode: Mode = 'ERROR';

  if (normalized.includes('timeout')) {
    reasonCode = 'TIMEOUT';
    mode = 'OFFLINE';
  } else if (isRateLimited) {
    reasonCode = 'RATE_LIMIT';
    mode = 'OFFLINE';
  } else if (normalized.includes('network')) {
    reasonCode = 'NETWORK_ERROR';
    mode = 'OFFLINE';
  } else if (
    normalized.includes('provider') ||
    normalized.includes('ollama') ||
    normalized.includes('backend') ||
    normalized.includes('unreachable')
  ) {
    reasonCode = 'PROVIDER_UNAVAILABLE';
    mode = 'ERROR';
  }

  return {
    provider_used: providerPreference ?? 'fallback',
    provider_class: mapRequestedProviderClass(providerPreference),
    mode,
    reason_code: reasonCode,
    latency_ms_total: 0,
    timeout_ms: 30000,
    retries: 0,
    attempts: [],
    network_used: reasonCode === 'NETWORK_ERROR' || reasonCode === 'RATE_LIMIT',
    cache_hit: false,
    policy: 'conversation_hook_fallback',
  };
}

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    intention?: string;
    emotion?: EmotionState;
    tags?: string[];
    providerMeta?: ProviderDecisionMeta;
    providerUsed?: string;
    requestedProvider?: ConversationProviderPreference;
    citations?: Citation[];
    contextBinding?: {
      route: string;
      pageState?: string;
      fullRoute?: string;
      moduleId: string;
      moduleName: string;
      sequence: number;
      changeType: 'initial' | 'same-module' | 'module-switch';
      staleGuard: 'steady' | 'resync';
      generatedAt: number;
    };
    singleDoorTags?: string[];
  };
}

export interface UseConversationEngineOptions {
  mode?: ConversationMode;
  providerPreference?: ConversationProviderPreference;
  emotionContext?: EmotionState;
  onResponse?: (response: ConversationResponse) => void;
  onError?: (error: Error) => void;
  autoHealthCheck?: boolean;
  maxMessages?: number; // Limite d'historique (défaut: 500)
}

export interface UseConversationEngineReturn {
  // État
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;

  // Mode
  currentMode: ConversationMode;
  setMode: (mode: ConversationMode) => void;

  // Actions
  sendMessage: (content: string) => Promise<ConversationResponse | null>;
  appendLocalExchange: (
    userContent: string,
    assistantContent: string,
    metadata?: ConversationMessage['metadata']
  ) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (messageId: string) => void;

  // Health & Stats
  healthReport: ConversationHealthReport | null;
  refreshHealth: () => Promise<void>;

  // Métadonnées
  lastResponse: ConversationResponse | null;
  totalMessages: number;
  /** OMEGA_AUTO_ORCHESTRATION_CHAIN trace meta from last message (Lock #1) */
  lastOmegaTraceMeta: OmegaTraceMeta | undefined;
}

// ═══════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export function useConversationEngine(
  options: UseConversationEngineOptions = {}
): UseConversationEngineReturn {
  // ═══ ÉTAT ═══
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<ConversationMode>(
    options.mode || 'default'
  );
  const [healthReport, setHealthReport] = useState<ConversationHealthReport | null>(null);
  const [lastResponse, setLastResponse] = useState<ConversationResponse | null>(null);

  // Refs
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(true);
  const healthCheckIntervalRef = useRef<number | null>(null);
  const healthCheckPromiseRef = useRef<Promise<ConversationHealthReport | null> | null>(
    null
  );

  // ✅ IMPORT MEMORY SYSTEM
  const {
    saveMessage,
    clearMode: clearPersistedMode = () => undefined,
    replaceMessages = () => undefined,
  } = useChatMemory({ mode: currentMode });

  // ═══ LOAD MESSAGES FROM LOCALSTORAGE ON MOUNT ═══
  useEffect(() => {
    const loadStoredMessages = async () => {
      try {
        const stored = localStorage.getItem(`titane_chat_mode_${currentMode}`);
        if (stored) {
          const parsed = JSON.parse(stored) as { messages?: unknown[] };
          if (parsed.messages && Array.isArray(parsed.messages)) {
            // Convert AIMessage[] to ConversationMessage[]
            const conversationMessages: ConversationMessage[] = parsed.messages.map(
              (msg, index: number) => {
                const safe =
                  typeof msg === 'object' && msg !== null
                    ? (msg as Record<string, unknown>)
                    : {};
                const roleValue = safe.role === 'assistant' ? 'assistant' : 'user';
                const contentValue = typeof safe.content === 'string' ? safe.content : '';
                const timestampValue =
                  typeof safe.timestamp === 'number' ? safe.timestamp : Date.now();
                const metadataValue =
                  typeof safe.metadata === 'object' && safe.metadata !== null
                    ? (safe.metadata as Record<string, unknown>)
                    : undefined;

                return {
                  id:
                    typeof safe.id === 'string'
                      ? safe.id
                      : `loaded-${index}-${Date.now()}`,
                  role: roleValue,
                  content: contentValue,
                  timestamp: timestampValue,
                  metadata: metadataValue,
                };
              }
            );
            setMessages(prev =>
              mergeRestoredConversationMessages(prev, conversationMessages)
            );
            // Messages chargés depuis localStorage
          }
        }
      } catch (err) {
        logger.warn('[useConversationEngine] ⚠️ Failed to load stored messages:');
      }
    };

    loadStoredMessages();
  }, [currentMode]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      healthCheckPromiseRef.current = null;

      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, []);

  const runHealthCheck =
    useCallback(async (): Promise<ConversationHealthReport | null> => {
      if (healthCheckPromiseRef.current) {
        return healthCheckPromiseRef.current;
      }

      let request: Promise<ConversationHealthReport | null> | null = null;
      request = (async () => {
        try {
          const report = await healthCheck();

          if (mountedRef.current) {
            setHealthReport(report);
          }

          if (report.status === 'Critical') {
            logger.warn(
              '[ConversationEngine] État critique détecté, auto-réparation en cours...'
            );
          }

          return report;
        } catch (err) {
          logger.error(
            '[ConversationEngine] Health check failed:',
            undefined,
            err instanceof Error ? err : undefined
          );
          return null;
        } finally {
          if (healthCheckPromiseRef.current === request) {
            healthCheckPromiseRef.current = null;
          }
        }
      })();

      healthCheckPromiseRef.current = request;
      return request;
    }, []);

  // ═══ HEALTH CHECK AUTOMATIQUE ═══
  useEffect(() => {
    const envEnabled = import.meta.env.VITE_CONVERSATION_HEALTHCHECK_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_conversation_healthcheck_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabledByDefault = import.meta.env.DEV || envEnabled || userEnabled;
    const enabled =
      options.autoHealthCheck === true ||
      (options.autoHealthCheck !== false && enabledByDefault);

    if (!enabled) {
      return;
    }

    healthCheckIntervalRef.current = window.setInterval(() => {
      void runHealthCheck();
    }, DEFAULT_HEALTH_CHECK_INTERVAL_MS);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [options.autoHealthCheck, runHealthCheck]);

  // ═══ REFRESH HEALTH ═══
  const refreshHealth = useCallback(async () => {
    await runHealthCheck();
  }, [runHealthCheck]);

  const buildSingleDoorEnvelope = useCallback((): ChatContextEnvelope | null => {
    const activeModuleContext = readActiveModuleContext();
    if (!activeModuleContext) {
      return null;
    }

    return buildChatContextEnvelope({
      mode: currentMode,
      conversationId,
      providerRequested: 'auto',
      moduleContext: activeModuleContext,
      inMemoryMessages: messages,
      lastProviderMeta: lastResponse?.meta,
    });
  }, [conversationId, currentMode, lastResponse?.meta, messages]);

  const toContextBinding = useCallback((envelope: ChatContextEnvelope | null) => {
    if (!envelope) return undefined;

    return {
      route: envelope.routeContext.route,
      pageState: envelope.routeContext.pageState,
      fullRoute: envelope.routeContext.fullRoute,
      moduleId: envelope.moduleContext.moduleId,
      moduleName: envelope.moduleContext.moduleName,
      sequence: envelope.continuity.sequence,
      changeType: envelope.continuity.changeType,
      staleGuard: envelope.continuity.staleGuard,
      generatedAt: envelope.generatedAt,
    };
  }, []);

  // ═══ SEND MESSAGE (avec Retry Logic) ═══
  const sendMessage = useCallback(
    async (content: string, retryCount = 0): Promise<ConversationResponse | null> => {
      // Prévenir double-envoi
      if (isProcessingRef.current) {
        logger.warn('Message already being processed', {
          component: 'ConversationEngine',
        });
        return null;
      }

      isProcessingRef.current = true;
      setIsLoading(true);
      setError(null);

      const contextEnvelope = buildSingleDoorEnvelope();
      const contextBinding = toContextBinding(contextEnvelope);

      // Ajouter message utilisateur immédiatement
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
        metadata: {
          contextBinding,
          singleDoorTags: contextEnvelope?.memorySingleDoor.tags,
        },
      };

      setMessages(prev => {
        const maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES;
        const updated = [...prev, userMessage];
        // Garder seulement les N derniers messages pour éviter surcharge mémoire
        return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
      });

      // Keep persistence truthful but out of the request critical path.
      const userAIMessage: AIMessage = {
        role: 'user',
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        metadata: userMessage.metadata || {},
      };
      persistMessageInBackground(
        saveMessage,
        userAIMessage,
        '[useConversationEngine] ⚠️ Failed to persist user message'
      );

      try {
        // Traiter le message via Conversation Engine
        const response = await processMessage(content, {
          conversationId: conversationId || undefined,
          mode: currentMode,
          emotionContext: options.emotionContext,
          providerPreference: options.providerPreference,
          contextEnvelope: contextEnvelope || undefined,
        });

        // Mettre à jour conversation ID
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        const noProviderPayload =
          /no ai provider available/i.test(response.assistant_message) ||
          response.meta?.reason_code === 'PROVIDER_UNAVAILABLE';

        const requestedProvider = options.providerPreference ?? 'auto';
        const assistantContent = noProviderPayload
          ? `🤖 TITANE∞ est en mode récupération provider.

Provider demandé: ${requestedProvider}
Cause runtime: ${response.meta?.reason_code ?? 'UNKNOWN'}

Je n'ai pas pu joindre le provider demandé pour cette requête. La sélection UI est conservée telle quelle pour éviter un fallback silencieux.

Actions immédiates:
- Vérifie la connexion réseau
- Vérifie les clés API cloud (Gemini/OpenAI/Claude)
- Ou démarre Ollama local si tu veux un mode local`
          : response.assistant_message;

        // Ajouter réponse assistant
        const assistantMessage: ConversationMessage = {
          id: response.message_id,
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now(),
          metadata: {
            intention: response.detected_intention,
            emotion: response.detected_emotion,
            tags: response.cognitive_tags,
            providerMeta: response.meta,
            providerUsed: response.meta?.provider_used,
            requestedProvider,
            contextBinding,
            singleDoorTags: contextEnvelope?.memorySingleDoor.tags,
          },
        };

        // Assistant message créé et prêt à être sauvegardé

        setMessages(prev => {
          const updated = [...prev, assistantMessage];
          return updated;
        });

        // ✨ OBSERVABILITY: Mode detection based on meta
        const mode = response.meta?.mode || 'ERROR';
        const reasonCode = response.meta?.reason_code || 'UNKNOWN';

        if (mode === 'OFFLINE') {
          // A successful offline fallback remains a truthful response path.
          // Provider tags on the assistant message already expose OFFLINE / reason_code.
          setError(null);
          logger.warn('[useConversationEngine] OFFLINE degraded success', {
            reasonCode,
            provider: response.meta?.provider_used,
          });
        } else if (mode === 'LOCAL') {
          logger.info('[useConversationEngine] LOCAL mode', { reasonCode });
          setError(null);
        } else if (mode === 'REMOTE') {
          // NO_LYING_VIOLATION_FRONTEND guard: REMOTE requires network_used=true
          if (response.meta?.network_used === false) {
            logger.error(
              '[NO_LYING_VIOLATION_FRONTEND] mode=REMOTE but network_used=false — displaying as LOCAL/RESTRICTED'
            );
            logger.warn(
              '[useConversationEngine] NO_LYING_VIOLATION_FRONTEND: REMOTE+network_used=false',
              {
                provider: response.meta?.provider_used,
              }
            );
          } else {
            logger.info('[useConversationEngine] REMOTE mode', {
              provider: response.meta?.provider_used,
              network_used: response.meta?.network_used,
            });
          }
          setError(null);
        } else {
          logger.warn('[useConversationEngine] ERROR mode', { meta: response.meta });
        }

        const assistantAIMessage: AIMessage = {
          role: 'assistant',
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp,
          metadata: assistantMessage.metadata || {},
        };
        persistAssistantMessageInBackground(
          saveMessage,
          assistantAIMessage,
          '[useConversationEngine] ⚠️ Failed to persist messages'
        );

        setLastResponse(response);

        // Callback
        options.onResponse?.(response);

        logger.info('[ConversationEngine] Message traité:', {
          intention: response.detected_intention,
          emotion: response.detected_emotion,
          tags: response.cognitive_tags,
          latency: response.metadata?.latency_ms ?? 0,
          provider: response.metadata?.provider_used ?? 'unknown',
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';

        // Retry logic avec backoff exponentiel
        if (retryCount < MAX_RETRIES && errorMessage.includes('network')) {
          const delay = RETRY_DELAY_BASE_MS * Math.pow(2, retryCount);
          logger.warn(
            `[ConversationEngine] Tentative ${retryCount + 1}/${MAX_RETRIES} échouée, retry dans ${delay}ms`
          );

          await new Promise(resolve => setTimeout(resolve, delay));
          isProcessingRef.current = false;
          setIsLoading(false);
          return sendMessage(content, retryCount + 1);
        }

        setError(errorMessage);
        options.onError?.(err as Error);

        const fallbackContent = `🤖 **TITANE∞ — Réponse indisponible**

Une anomalie a empêché la génération d'une réponse valide.

**Détail** : ${errorMessage}

Réessaie dans quelques instants ou vérifie la disponibilité du backend.`;

        const fallbackMessage: ConversationMessage = {
          id: `assistant-fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackContent,
          timestamp: Date.now(),
          metadata: {
            intention: 'Meta',
            providerMeta: buildConversationFallbackMeta(
              errorMessage,
              options.providerPreference
            ),
            providerUsed: options.providerPreference ?? 'fallback',
            requestedProvider: options.providerPreference ?? 'auto',
            contextBinding,
            singleDoorTags: contextEnvelope?.memorySingleDoor.tags,
          },
        };

        setMessages(prev => [...prev, fallbackMessage]);

        const assistantAIMessage: AIMessage = {
          role: 'assistant',
          content: fallbackMessage.content,
          timestamp: fallbackMessage.timestamp,
          metadata: fallbackMessage.metadata || {},
        };
        persistAssistantMessageInBackground(
          saveMessage,
          assistantAIMessage,
          '[useConversationEngine] ⚠️ Failed to persist fallback message'
        );

        logger.error(
          '[ConversationEngine] Erreur finale:',
          undefined,
          err instanceof Error ? err : undefined
        );
        return null;
      } finally {
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    },
    [
      buildSingleDoorEnvelope,
      conversationId,
      currentMode,
      options.emotionContext,
      options.maxMessages,
      options.onError,
      options.onResponse,
      options.providerPreference,
      saveMessage,
      toContextBinding,
    ]
  );

  // ═══ CLEAR MESSAGES ═══
  const appendLocalExchange = useCallback(
    async (
      userContent: string,
      assistantContent: string,
      metadata?: ConversationMessage['metadata']
    ) => {
      const now = Date.now();
      const contextEnvelope = buildSingleDoorEnvelope();
      const contextBinding = toContextBinding(contextEnvelope);
      const mergedMetadata: ConversationMessage['metadata'] = {
        ...(metadata || {}),
        providerUsed:
          metadata?.providerUsed ?? metadata?.providerMeta?.provider_used ?? undefined,
        requestedProvider:
          metadata?.requestedProvider ?? options.providerPreference ?? undefined,
        contextBinding: metadata?.contextBinding ?? contextBinding,
        singleDoorTags:
          metadata?.singleDoorTags ?? contextEnvelope?.memorySingleDoor.tags,
      };

      const userMessage: ConversationMessage = {
        id: `user-local-${now}`,
        role: 'user',
        content: userContent,
        timestamp: now,
        metadata: {
          contextBinding,
          singleDoorTags: contextEnvelope?.memorySingleDoor.tags,
        },
      };
      const assistantMessage: ConversationMessage = {
        id: `assistant-local-${now + 1}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: now + 1,
        metadata: mergedMetadata,
      };

      setMessages(prev => {
        const maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES;
        const updated = [...prev, userMessage, assistantMessage];
        return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
      });

      const userAIMessage: AIMessage = {
        role: 'user',
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        metadata: userMessage.metadata || {},
      };
      const assistantAIMessage: AIMessage = {
        role: 'assistant',
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp,
        metadata: assistantMessage.metadata || {},
      };
      persistMessageInBackground(
        saveMessage,
        userAIMessage,
        '[useConversationEngine] ⚠️ Failed to persist local user message'
      );
      persistAssistantMessageInBackground(
        saveMessage,
        assistantAIMessage,
        '[useConversationEngine] ⚠️ Failed to persist local assistant message'
      );
    },
    [buildSingleDoorEnvelope, options.maxMessages, saveMessage, toContextBinding]
  );

  // ═══ CLEAR MESSAGES ═══
  const clearMessages = useCallback(() => {
    clearPersistedMode();
    setMessages([]);
    setConversationId(null);
    setLastResponse(null);
    setError(null);
  }, [clearPersistedMode]);

  // ═══ DELETE MESSAGE (local + persisted history) ═══
  const deleteMessage = useCallback(
    (messageId: string) => {
      const updatedMessages = messages.filter(m => m.id !== messageId);

      setMessages(updatedMessages);
      persistConversationHistoryInBackground(
        replaceMessages,
        updatedMessages,
        '[useConversationEngine] ⚠️ Failed to persist message deletion'
      );
    },
    [messages, replaceMessages]
  );

  // ═══ SET MODE ═══
  const setModeCallback = useCallback((mode: ConversationMode) => {
    setCurrentMode(mode);
    logger.info('[ConversationEngine] Mode changé', {
      module: 'useConversationEngine',
      mode: String(mode),
    });
  }, []);

  // ═══ MEMOIZED VALUES ═══
  const totalMessages = useMemo(() => messages.length, [messages.length]);

  // ═══ RETOUR ═══
  return {
    messages,
    isLoading,
    error,
    conversationId,
    currentMode,
    setMode: setModeCallback,
    sendMessage,
    appendLocalExchange,
    clearMessages,
    deleteMessage,
    healthReport,
    refreshHealth,
    lastResponse,
    totalMessages,
    lastOmegaTraceMeta: lastResponse?.omega_trace_meta,
  };
}

export default useConversationEngine;
