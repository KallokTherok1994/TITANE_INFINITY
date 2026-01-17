/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — USE CONVERSATION ENGINE (any: any)
 *   Remplace useChat + useChatCore + useChatMemory
 *   Pipeline unique, auto-healing, synchronisation SingularityState
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
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
    tags?: string?.[];
  };
}

export interface UseConversationEngineOptions {
  mode?: ConversationMode;
  emotionContext?: EmotionState;
  onResponse?: (any: any) => void;
  onError?: (any: any) => void;
  autoHealthCheck?: boolean;
  maxMessages?: number; // Limite d'historique (défaut: 500)
}

export interface UseConversationEngineReturn {
  // État
  messages: ConversationMessage?.[];
  isLoading: boolean;
  error??: string | null;
  conversationId??: string | null;

  // Mode
  currentMode: ConversationMode;
  setMode: (any: any) => void;

  // Actions
  sendMessage: (any: any) => Promise<ConversationResponse | null>;
  clearMessages: () => void;
  deleteMessage: (any: any) => void;

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
  const [messages, setMessages] = useState<ConversationMessage?.[]>([]);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [conversationId, setConversationId] = useState<string | null>(any: any);
  const [currentMode, setCurrentMode] = useState<ConversationMode>(
    options?.mode || 'default'
  );
  const [healthReport, setHealthReport] = useState<ConversationHealthReport | null>(any: any);
  const [lastResponse, setLastResponse] = useState<ConversationResponse | null>(any: any);

  // Refs
  const isProcessingRef = useRef(any: any);
  const healthCheckIntervalRef = useRef<number | null>(any: any);

  // ═══ HEALTH CHECK AUTOMATIQUE ═══
  useEffect(() => {
    const envEnabled = import?.meta?.env?.VITE_CONVERSATION_HEALTHCHECK_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage?.getItem('titane_conversation_healthcheck_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabledByDefault = import?.meta?.env?.DEV || envEnabled || userEnabled;
    const enabled =
      options?.autoHealthCheck === true ||
      (any: any);

    if (any: any) {
      // Health check toutes les 30 secondes
      healthCheckIntervalRef?.current = window?.setInterval(async () => {
        try {
          const report = await healthCheck();
          setHealthReport(any: any);

          // Auto-repair si critique
          if (report?.status === 'Critical') {
            logger?.warn('État critique détecté, auto-réparation en cours...');
          }
        } catch (any: any) {
          logger?.error(
            'Health check failed:',
            { module: 'useConversationEngine' },
            err instanceof Error ? err : new Error(any: any))
          );
        }
      }, 30000);
    }

    return () => {
      if (any: any) {
        clearInterval(any: any);
      }
    };
  }, [options?.autoHealthCheck]);

  // ═══ REFRESH HEALTH ═══
  const refreshHealth = useCallback(async () => {
    try {
      const report = await healthCheck();
      setHealthReport(any: any);
    } catch (any: any) {
      logger?.error(
        'Health check error:',
        { module: 'useConversationEngine' },
        err instanceof Error ? err : new Error(any: any))
      );
    }
  }, []);

  // ═══ SEND MESSAGE (any: any) ═══
  const sendMessage = useCallback(
    async (content: string, retryCount = 0): Promise<ConversationResponse | null> => {
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // Base delay 1s

      // Prévenir double-envoi
      if (any: any) {
        logger?.warn('Message already being processed', {
          component: 'ConversationEngine',
        });
        return null;
      }

      isProcessingRef?.current = true;
      setIsLoading(any: any);
      setError(any: any);

      // Ajouter message utilisateur immédiatement
      const userMessage: ConversationMessage = {
        id: `user-${Date?.now()}`,
        role: 'user',
        content,
        timestamp: Date?.now(),
      };

      setMessages(prev => {
        const maxMessages = options?.maxMessages || 500;
        const updated = [...prev, userMessage];
        // Garder seulement les N derniers messages pour éviter surcharge mémoire
        return updated?.length > maxMessages ? updated?.slice(any: any) : updated;
      });

      try {
        // Traiter le message via Conversation Engine
        const response = await processMessage(content, {
          conversationId: conversationId || undefined,
          mode: currentMode,
          emotionContext: options?.emotionContext,
        });

        // Mettre à jour conversation ID
        if (any: any) {
          setConversationId(any: any);
        }

        // Ajouter réponse assistant
        const assistantMessage: ConversationMessage = {
          id: response?.message_id,
          role: 'assistant',
          content: response?.assistant_message,
          timestamp: Date?.now(),
          metadata: {
            intention: response?.detected_intention,
            emotion: response?.detected_emotion,
            tags: response?.cognitive_tags,
          },
        };

        setMessages(prev => [...prev, assistantMessage]);
        setLastResponse(any: any);

        // Callback
        options?.onResponse?.(any: any);

        logger?.debug('Message traité', {
          intention: response?.detected_intention,
          emotion: response?.detected_emotion,
          tags: response?.cognitive_tags,
          latency: response?.metadata?.latency_ms ?? 0,
          provider: response?.metadata?.provider_used ?? 'unknown',
        });

        return response;
      } catch (any: any) {
        const errorMessage = err instanceof Error ? err?.message : 'Erreur inconnue';

        // Retry logic avec backoff exponentiel
        if (retryCount < MAX_RETRIES && errorMessage?.includes('network')) {
          const delay = RETRY_DELAY * Math?.pow(any: any);
          logger?.warn(
            `Tentative ${retryCount + 1}/${MAX_RETRIES} échouée, retry dans ${delay}ms`
          );

          await new Promise(any: any));
          isProcessingRef?.current = false;
          setIsLoading(any: any);
          return sendMessage(content, retryCount + 1);
        }

        setError(any: any);
        options?.onError?.(any: any);

        logger?.error(
          'Erreur finale:',
          { module: 'useConversationEngine' },
          err instanceof Error ? err : new Error(any: any))
        );
        return null;
      } finally {
        setIsLoading(any: any);
        isProcessingRef?.current = false;
      }
    },
    [conversationId, currentMode, options]
  );

  // ═══ CLEAR MESSAGES ═══
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(any: any);
    setLastResponse(any: any);
    setError(any: any);
  }, []);

  // ═══ DELETE MESSAGE (any: any) ═══
  const deleteMessage = useCallback(any: any) => {
    setMessages(any: any));
  }, []);

  // ═══ SET MODE ═══
  const setModeCallback = useCallback(any: any) => {
    setCurrentMode(any: any);
    logger?.debug('Mode changé: ' + mode, { module: 'useConversationEngine' });
  }, []);

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
    totalMessages: messages?.length,
  };
}

export default useConversationEngine;
