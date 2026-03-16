/**
 * TITANE∞ — useLTMContext
 * PATCH-013 + IMPROVE-004: Loads conversation history from SQLite (UI display only).
 * NOTE: AI prompt injection is handled by the backend (commands.rs → omega_integration.rs).
 * This hook is for UI display: counters, timelines, memory badges.
 *
 * IMPROVE-004: Module-level cache (Map by conversationId) avoids repeat fetches.
 * Cache is invalidated on manual refresh() call.
 *
 * Usage:
 *   const { history, historyCount, refresh } = useLTMContext(conversationId);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '@/services/api/chat';
import type { AIMessage } from '@/services/ai/types';

export interface LTMContextResult {
  history: AIMessage[];
  historyCount: number;
  /** Formatted string for reference (not injected into AI prompts — backend handles that) */
  ltmContext: string;
  /** Refresh history manually (e.g., after a message is sent) */
  refresh: () => Promise<void>;
  loading: boolean;
}

// Module-level cache: conversationId → AIMessage[]
// Prevents N component instances from all fetching the same history.
const _ltmCache = new Map<string, AIMessage[]>();

export function useLTMContext(conversationId: string | null | undefined): LTMContextResult {
  const [history, setHistory] = useState<AIMessage[]>(() => {
    if (conversationId) return _ltmCache.get(conversationId) ?? [];
    return [];
  });
  const [loading, setLoading] = useState(false);
  // Track if an in-flight request is pending for this conversationId
  const loadingRef = useRef(false);

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!conversationId) {
        setHistory([]);
        return;
      }
      // Return cached result unless force-refreshing
      if (!forceRefresh && _ltmCache.has(conversationId)) {
        setHistory(_ltmCache.get(conversationId)!);
        return;
      }
      // Deduplicate concurrent loads for same conversationId
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const msgs = await chatService.loadConversationHistory(conversationId);
        const result = msgs ?? [];
        _ltmCache.set(conversationId, result);
        setHistory(result);
      } catch (err) {
        console.warn('[useLTMContext] load failed (non-fatal):', err);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [conversationId]
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const ltmContext =
    history.length > 0
      ? `## CONVERSATION_HISTORY\n` +
        history
          .slice(-20)
          .map((m) => {
            const prefix = m.role === 'user' ? '[User]' : '[Assistant]';
            return `${prefix}: ${m.content.slice(0, 200)}${m.content.length > 200 ? '…' : ''}`;
          })
          .join('\n')
      : '';

  return {
    history,
    historyCount: history.length,
    ltmContext,
    // Refresh always busts the cache for this conversationId
    refresh: () => {
      if (conversationId) _ltmCache.delete(conversationId);
      return load(true);
    },
    loading,
  };
}
