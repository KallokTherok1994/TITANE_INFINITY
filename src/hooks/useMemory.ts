/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - useMemory Hook
// React hook for conversational memory management

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';

export interface MemoryEntry {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  entries: MemoryEntry[];
  metadata: {
    total_tokens: number;
    message_count: number;
    tags: string[];
    is_archived: boolean;
  };
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  is_archived: boolean;
}

export function useMemory() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(
    null
  );
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const conversationsJson = await secureInvoke<string>('list_conversations');
      const parsed: ConversationSummary[] = JSON.parse(conversationsJson);
      setConversations(parsed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('Load conversations error', { component: 'Memory' }, err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConversation = useCallback(
    async (title: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const conversationId = await secureInvoke<string>('create_conversation', {
          title,
        });

        await loadConversations();

        return conversationId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        logger.error('Create conversation error', { component: 'Memory' }, err as Error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [loadConversations]
  );

  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const conversationJson = await secureInvoke<string>('load_conversation', {
        conversationId,
      });

      const conversation: Conversation = JSON.parse(conversationJson);
      setCurrentConversation(conversation);

      return conversation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error(
        'Load conversation error:',
        { module: 'useMemory' },
        err instanceof Error ? err : new Error(String(err))
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Note: delete_conversation est legacy, pas de service équivalent - garder invoke direct
        const { invoke } = await import('@tauri-apps/api/core');
        await tauriClient.deleteConversation({ conversationId });

        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }

        await loadConversations();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        logger.error(
          'Delete conversation error:',
          { module: 'useMemory' },
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversation, loadConversations]
  );

  const clearAllMemory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: clear_all_memory est legacy, pas de service équivalent - garder invoke direct
      const { invoke } = await import('@tauri-apps/api/core');
      await tauriClient.clearAllMemory();
      setCurrentConversation(null);
      setConversations([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error(
        'Clear memory error:',
        { module: 'useMemory' },
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    currentConversation,
    conversations,
    isLoading,
    error,
    loadConversations,
    createConversation,
    loadConversation,
    deleteConversation,
    clearAllMemory,
  };
}
