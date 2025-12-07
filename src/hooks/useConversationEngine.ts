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

import { useState, useCallback, useRef, useEffect } from 'react';
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
    tags?: string[];
  };
}

export interface UseConversationEngineOptions {
  mode?: ConversationMode;
  emotionContext?: EmotionState;
  onResponse?: (response: ConversationResponse) => void;
  onError?: (error: Error) => void;
  autoHealthCheck?: boolean;
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

  // ═══ HEALTH CHECK AUTOMATIQUE ═══
  useEffect(() => {
    if (options.autoHealthCheck !== false) {
      // Health check toutes les 30 secondes
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
      }, 30000);
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

  // ═══ SEND MESSAGE ═══
  const sendMessage = useCallback(
    async (content: string): Promise<ConversationResponse | null> => {
      // Prévenir double-envoi
      if (isProcessingRef.current) {
        console.warn('[ConversationEngine] Message déjà en cours de traitement');
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

      setMessages(prev => [...prev, userMessage]);

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
          },
        };

        setMessages(prev => [...prev, assistantMessage]);
        setLastResponse(response);

        // Callback
        options.onResponse?.(response);

        console.log('[ConversationEngine] Message traité:', {
          intention: response.detected_intention,
          emotion: response.detected_emotion,
          tags: response.cognitive_tags,
          latency: response.metadata.latency_ms,
          provider: response.metadata.provider_used,
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        options.onError?.(err as Error);

        console.error('[ConversationEngine] Erreur:', err);
        return null;
      } finally {
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    },
    [conversationId, currentMode, options]
  );

  // ═══ CLEAR MESSAGES ═══
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setLastResponse(null);
    setError(null);
  }, []);

  // ═══ SET MODE ═══
  const setModeCallback = useCallback((mode: ConversationMode) => {
    setCurrentMode(mode);
    console.log('[ConversationEngine] Mode changé:', mode);
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
    healthReport,
    refreshHealth,
    lastResponse,
    totalMessages: messages.length,
  };
}

export default useConversationEngine;
