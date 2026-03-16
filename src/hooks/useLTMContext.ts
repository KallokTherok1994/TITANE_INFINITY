/**
 * TITANE∞ — useLTMContext
 * PATCH-013: Loads conversation history from SQLite and provides formatted
 * LTM context for all pages/tabs/modules of the TITANE interface.
 *
 * Usage:
 *   const { history, historyCount, ltmContext } = useLTMContext(conversationId);
 */

import { useState, useEffect, useCallback } from 'react';
import { chatService } from '@/services/api/chat';
import type { AIMessage } from '@/services/ai/types';

export interface LTMContextResult {
  history: AIMessage[];
  historyCount: number;
  /** Formatted string for system prompt injection */
  ltmContext: string;
  /** Refresh history manually (e.g., after a message is sent) */
  refresh: () => Promise<void>;
  loading: boolean;
}

export function useLTMContext(conversationId: string | null | undefined): LTMContextResult {
  const [history, setHistory] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!conversationId) {
      setHistory([]);
      return;
    }
    setLoading(true);
    try {
      const msgs = await chatService.loadConversationHistory(conversationId);
      setHistory(msgs ?? []);
    } catch (err) {
      console.warn('[useLTMContext] load failed (non-fatal):', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const ltmContext =
    history.length > 0
      ? `## CONVERSATION_HISTORY\n` +
        history
          .slice(-20)
          .map((m) => {
            const prefix = m.role === 'user' ? '[User]' : '[Assistant]';
            return `${prefix}: ${m.content}`;
          })
          .join('\n')
      : '';

  return {
    history,
    historyCount: history.length,
    ltmContext,
    refresh: load,
    loading,
  };
}
