/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — USE CHAT MEMORY (Synchro Backend)
 *   Hook isolé: Synchronisation mémoire backend uniquement
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { chatMemoryCompactor } from '../services/chatMemoryCompactor';
import type { ChatMode } from '../services/ai/chatEngine';
import type { AIMessage } from '../services/ai/types';
import { awardExperience } from '../services/experienceService';
import { XPSource } from '../types/experience';

export interface UseChatMemoryOptions {
  mode: ChatMode;
  autoCleanup?: boolean; // Auto-cleanup si >5MB
  autoSave?: boolean; // Auto-save après chaque message
}

export interface UseChatMemoryReturn {
  messagesForMode: AIMessage[];
  memoryStats: {
    count: number;
    sizeMB: number;
    compressed: boolean;
  };
  loadHistory: () => AIMessage[];
  saveMessage: (message: AIMessage) => void;
  replaceMessages: (messages: AIMessage[]) => void;
  clearMode: () => void;
  compactIfNeeded: () => { cleaned: boolean; sizeMB: number };
  awardXP: (
    domain: string,
    amount: number,
    messageLength: number,
    provider: string
  ) => Promise<void>;
}

/**
 * Hook synchronisation mémoire backend
 * - Load/save messages par mode
 * - Compaction auto
 * - XP attribution
 * - 0 UI, 0 génération IA
 */
export function useChatMemory(options: UseChatMemoryOptions): UseChatMemoryReturn {
  const [messagesForMode, setMessagesForMode] = useState<AIMessage[]>([]);
  const [memoryStats, setMemoryStats] = useState({
    count: 0,
    sizeMB: 0,
    compressed: false,
  });

  const syncVisibleState = useCallback(
    (history: AIMessage[]) => {
      setMessagesForMode(history);

      const stats = chatMemoryCompactor.getStats(options.mode);
      setMemoryStats({
        count: history.length,
        sizeMB: stats.sizeMB,
        compressed: stats.compressed,
      });
    },
    [options.mode]
  );

  /**
   * Load history on mode change
   */
  useEffect(() => {
    const history = chatMemoryCompactor.loadForMode(options.mode);
    syncVisibleState(history);

    console.warn(
      `🧠 USE CHAT MEMORY: Loaded ${history.length} messages for mode ${options.mode}`
    );

    // Auto-cleanup si enabled
    if (options.autoCleanup) {
      const cleanup = chatMemoryCompactor.autoCleanupIfNeeded();
      if (cleanup.cleaned) {
        console.warn(`✅ SELFHEAL++: Memory cleaned (was ${cleanup.sizeMB.toFixed(2)}MB)`);
      }
    }
  }, [options.mode, options.autoCleanup, syncVisibleState]);

  /**
   * Load history manuel
   */
  const loadHistory = useCallback(() => {
    const history = chatMemoryCompactor.loadForMode(options.mode);
    syncVisibleState(history);
    return history;
  }, [options.mode, syncVisibleState]);

  /**
   * Save message
   * FIX v15.1: MAINTENANT on met à jour messagesForMode pour synchronisation immédiate
   * La sauvegarde en localStorage + mise à jour UI garantissent la persistance
   */
  const saveMessage = useCallback(
    (message: AIMessage) => {
      const updatedMessages = chatMemoryCompactor.addMessageToMode(options.mode, message);

      // 🔒 v26.4.0: Force immediate flush to prevent loss on tab switch
      console.warn(
        `🔒 [useChatMemory] Forcing immediate flush after save (mode: ${options.mode})`
      );
      chatMemoryCompactor.flushPendingSaves();

      // ✅ FIX v15.1: synchronisation immédiate UI + stats
      syncVisibleState(updatedMessages);

      console.warn(
        `💾 USE CHAT MEMORY: Message saved (mode: ${options.mode}, total: ${updatedMessages.length})`
      );
    },
    [options.mode, syncVisibleState]
  );

  /**
   * Replace persisted history for the current mode
   */
  const replaceMessages = useCallback(
    (messages: AIMessage[]) => {
      const updatedMessages = chatMemoryCompactor.replaceMessagesForMode(
        options.mode,
        messages
      );

      console.warn(
        `🔒 [useChatMemory] Forcing immediate flush after replace (mode: ${options.mode})`
      );
      chatMemoryCompactor.flushPendingSaves();
      syncVisibleState(updatedMessages);
    },
    [options.mode, syncVisibleState]
  );

  /**
   * Clear mode
   */
  const clearMode = useCallback(() => {
    chatMemoryCompactor.clearMode(options.mode);
    setMessagesForMode([]);
    setMemoryStats({ count: 0, sizeMB: 0, compressed: false });

    console.warn(`🧹 USE CHAT MEMORY: Mode ${options.mode} cleared`);
  }, [options.mode]);

  /**
   * Compact if needed
   */
  const compactIfNeeded = useCallback(() => {
    return chatMemoryCompactor.autoCleanupIfNeeded();
  }, []);

  /**
   * Award XP (backend sync)
   */
  const awardXP = useCallback(
    async (domain: string, amount: number, messageLength: number, provider: string) => {
      try {
        await awardExperience(domain, amount, XPSource.ChatMessage, {
          messageLength,
          provider,
        });
        console.warn(`✨ USE CHAT MEMORY: +${amount} XP awarded to ${domain}`);
      } catch (err) {
        console.warn('⚠️ XP award failed (non-blocking):', err);
      }
    },
    []
  );

  return {
    messagesForMode,
    memoryStats,
    loadHistory,
    saveMessage,
    replaceMessages,
    clearMode,
    compactIfNeeded,
    awardXP,
  };
}
