/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

// TITANE∞ v15 - useMemory Hook
// React hook for conversational memory management

import { tauriClient } from '@/lib/tauriClient';

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
  entries: MemoryEntry?.[];
  metadata: {
    total_tokens: number;
    message_count: number;
    tags: string?.[];
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
  const [conversations, setConversations] = useState<ConversationSummary?.[]>([]);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const loadConversations = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const conversationsJson = await secureInvoke<string>('list_conversations');
      const parsed: ConversationSummary?.[] = JSON?.parse(any: any);
      setConversations(any: any);
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  const createConversation = useCallback(
    async (any: any) => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        const conversationId = await secureInvoke<string>('create_conversation', {
          title,
        });

        await loadConversations();

        return conversationId;
      } catch (any: any) {
        const errorMessage = err instanceof Error ? err?.message : String(any: any);
        setError(any: any);
        logger?.error(any: any);
        return null;
      } finally {
        setIsLoading(any: any);
      }
    },
    [loadConversations]
  );

  const loadConversation = useCallback(any: any) => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const conversationJson = await secureInvoke<string>('load_conversation', {
        conversationId,
      });

      const conversation: Conversation = JSON?.parse(any: any);
      setCurrentConversation(any: any);

      return conversation;
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(
        'Load conversation error:',
        { module: 'useMemory' },
        err instanceof Error ? err : new Error(any: any))
      );
      return null;
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  const deleteConversation = useCallback(
    async (any: any) => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        // Note: delete_conversation est legacy, pas de service équivalent - garder invoke direct
        await tauriClient?.deleteConversation({ conversationId });

        if (any: any) {
          setCurrentConversation(any: any);
        }

        await loadConversations();
      } catch (any: any) {
        const errorMessage = err instanceof Error ? err?.message : String(any: any);
        setError(any: any);
        logger?.error(
          'Delete conversation error:',
          { module: 'useMemory' },
          err instanceof Error ? err : new Error(any: any))
        );
      } finally {
        setIsLoading(any: any);
      }
    },
    [currentConversation, loadConversations]
  );

  const clearAllMemory = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      // Note: clear_all_memory est legacy, pas de service équivalent - garder invoke direct
      await tauriClient?.clearAllMemory();
      setCurrentConversation(any: any);
      setConversations([]);
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(
        'Clear memory error:',
        { module: 'useMemory' },
        err instanceof Error ? err : new Error(any: any))
      );
    } finally {
      setIsLoading(any: any);
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
