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
} from '@/services/conversationEngine';
import {
  processMessage,
  healthCheck,
  getMemoryStats as _getMemoryStats,
} from '@/services/conversationEngine';
import { useChatMemory } from './useChatMemory';
import type { AIMessage } from '@/types';
import { chatMemoryCompactor } from '@/services/chatMemoryCompactor';
import type { ProviderDecisionMeta } from '@/types/providerMeta';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000;
const DEFAULT_MAX_MESSAGES = 500;
const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 30000;

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
  };
}

export interface UseConversationEngineOptions {
  mode?: ConversationMode;
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
  clearMessages: () => void;
  deleteMessage: (messageId: string) => void;

  // Health & Stats
  healthReport: ConversationHealthReport | null;
  refreshHealth: () => Promise<void>;

  // Métadonnées
  lastResponse: ConversationResponse | null;
  totalMessages: number;
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
  const healthCheckIntervalRef = useRef<number | null>(null);

  // ✅ IMPORT MEMORY SYSTEM
  const { saveMessage } = useChatMemory({ mode: currentMode });

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
            setMessages(conversationMessages);
            // Messages chargés depuis localStorage
          }
        }
      } catch (err) {
        console.warn('[useConversationEngine] ⚠️ Failed to load stored messages:', err);
      }
    };

    loadStoredMessages();
  }, [currentMode]);

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

    if (enabled) {
      // Health check périodique
      healthCheckIntervalRef.current = window.setInterval(async () => {
        try {
          const report = await healthCheck();
          setHealthReport(report);

          // Auto-repair si critique
          if (report.status === 'Critical') {
            console.warn(
              '[ConversationEngine] État critique détecté, auto-réparation en cours...'
            );
          }
        } catch (err) {
          console.error('[ConversationEngine] Health check failed:', err);
        }
      }, DEFAULT_HEALTH_CHECK_INTERVAL_MS);
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [options.autoHealthCheck]);

  // ═══ REFRESH HEALTH ═══
  const refreshHealth = useCallback(async () => {
    try {
      const report = await healthCheck();
      setHealthReport(report);
    } catch (err) {
      console.error('[ConversationEngine] Health check error:', err);
    }
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

      // Ajouter message utilisateur immédiatement
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setMessages(prev => {
        const maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES;
        const updated = [...prev, userMessage];
        // Garder seulement les N derniers messages pour éviter surcharge mémoire
        return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
      });

      // ✅ PERSIST USER MESSAGE IMMEDIATELY
      try {
        const userAIMessage: AIMessage = {
          role: 'user',
          content: userMessage.content,
          timestamp: userMessage.timestamp,
          metadata: {},
        };
        await saveMessage(userAIMessage);
      } catch (persistError) {
        console.warn(
          '[useConversationEngine] ⚠️ Failed to persist user message',
          persistError
        );
      }

      try {
        // Traiter le message via Conversation Engine
        const response = await processMessage(content, {
          conversationId: conversationId || undefined,
          mode: currentMode,
          emotionContext: options.emotionContext,
        });

        // Mettre à jour conversation ID
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        // Ajouter réponse assistant
        const assistantMessage: ConversationMessage = {
          id: response.message_id,
          role: 'assistant',
          content: response.assistant_message,
          timestamp: Date.now(),
          metadata: {
            intention: response.detected_intention,
            emotion: response.detected_emotion,
            tags: response.cognitive_tags,
            providerMeta: response.meta,
          },
        };

        // Assistant message créé et prêt à être sauvegardé

        setMessages(prev => {
          const updated = [...prev, assistantMessage];
          return updated;
        });

        // ✅ PERSIST MESSAGES TO LOCALSTORAGE
        try {
          const userAIMessage: AIMessage = {
            role: 'user',
            content: userMessage.content,
            timestamp: userMessage.timestamp,
            metadata: {},
          };
          const assistantAIMessage: AIMessage = {
            role: 'assistant',
            content: assistantMessage.content,
            timestamp: assistantMessage.timestamp,
            metadata: assistantMessage.metadata || {},
          };
          await saveMessage(userAIMessage);
          await saveMessage(assistantAIMessage);
          // Ensure flush to localStorage
          chatMemoryCompactor.flushPendingSaves();
        } catch (persistError) {
          console.warn(
            '[useConversationEngine] ⚠️ Failed to persist messages',
            persistError
          );
        }

        setLastResponse(response);

        // Callback
        options.onResponse?.(response);

        console.log('[ConversationEngine] Message traité:', {
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
          console.warn(
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
          },
        };

        setMessages(prev => [...prev, fallbackMessage]);

        try {
          const assistantAIMessage: AIMessage = {
            role: 'assistant',
            content: fallbackMessage.content,
            timestamp: fallbackMessage.timestamp,
            metadata: fallbackMessage.metadata || {},
          };
          await saveMessage(assistantAIMessage);
          chatMemoryCompactor.flushPendingSaves();
        } catch (persistError) {
          console.warn(
            '[useConversationEngine] ⚠️ Failed to persist fallback message',
            persistError
          );
        }

        console.error('[ConversationEngine] Erreur finale:', err);
        return null;
      } finally {
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    },
    [conversationId, currentMode, options, saveMessage]
  );

  // ═══ CLEAR MESSAGES ═══
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setLastResponse(null);
    setError(null);
  }, []);

  // ═══ DELETE MESSAGE (local only) ═══
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  // ═══ SET MODE ═══
  const setModeCallback = useCallback((mode: ConversationMode) => {
    setCurrentMode(mode);
    console.log('[ConversationEngine] Mode changé:', mode);
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
    clearMessages,
    deleteMessage,
    healthReport,
    refreshHealth,
    lastResponse,
    totalMessages,
  };
}

export default useConversationEngine;
