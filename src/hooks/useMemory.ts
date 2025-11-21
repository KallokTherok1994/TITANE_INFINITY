// TITANE∞ v12 - useMemory Hook
// React hook for conversational memory management

import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

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
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const conversationsJson = await invoke<string>('list_conversations');
      const parsed: ConversationSummary[] = JSON.parse(conversationsJson);
      setConversations(parsed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Load conversations error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (title: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const conversationId = await invoke<string>('create_conversation', {
        title,
      });

      await loadConversations();

      return conversationId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Create conversation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations]);

  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const conversationJson = await invoke<string>('load_conversation', {
        conversationId,
      });

      const conversation: Conversation = JSON.parse(conversationJson);
      setCurrentConversation(conversation);

      return conversation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Load conversation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await invoke('delete_conversation', { conversationId });

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      await loadConversations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Delete conversation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, loadConversations]);

  const clearAllMemory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await invoke('clear_all_memory');
      setCurrentConversation(null);
      setConversations([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Clear memory error:', err);
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
