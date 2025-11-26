/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT MEMORY (Synchro Backend)
 *   Hook isolé: Synchronisation mémoire backend uniquement
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { chatMemoryCompactor } from '../services/chatMemoryCompactor';
import type { ChatMode } from '../services/ai';
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

  /**
   * Load history on mode change
   */
  useEffect(() => {
    const history = chatMemoryCompactor.loadForMode(options.mode);
    setMessagesForMode(history);

    // Update stats
    const stats = chatMemoryCompactor.getStats(options.mode);
    setMemoryStats({
      count: history.length,
      sizeMB: stats.sizeMB,
      compressed: stats.compressed,
    });

    console.log(`🧠 USE CHAT MEMORY: Loaded ${history.length} messages for mode ${options.mode}`);

    // Auto-cleanup si enabled
    if (options.autoCleanup) {
      const cleanup = chatMemoryCompactor.autoCleanupIfNeeded();
      if (cleanup.cleaned) {
        console.log(`✅ SELFHEAL++: Memory cleaned (was ${cleanup.sizeMB.toFixed(2)}MB)`);
      }
    }
  }, [options.mode, options.autoCleanup]);

  /**
   * Load history manuel
   */
  const loadHistory = useCallback(() => {
    const history = chatMemoryCompactor.loadForMode(options.mode);
    setMessagesForMode(history);
    return history;
  }, [options.mode]);

  /**
   * Save message
   */
  const saveMessage = useCallback(
    (message: AIMessage) => {
      const updatedMessages = chatMemoryCompactor.addMessageToMode(options.mode, message);
      setMessagesForMode([...updatedMessages]);

      // Update stats
      const stats = chatMemoryCompactor.getStats(options.mode);
      setMemoryStats({
        count: updatedMessages.length,
        sizeMB: stats.sizeMB,
        compressed: stats.compressed,
      });

      console.log(`💾 USE CHAT MEMORY: Message saved (mode: ${options.mode}, total: ${updatedMessages.length})`);
    },
    [options.mode]
  );

  /**
   * Clear mode
   */
  const clearMode = useCallback(() => {
    chatMemoryCompactor.clearMode(options.mode);
    setMessagesForMode([]);
    setMemoryStats({ count: 0, sizeMB: 0, compressed: false });

    console.log(`🧹 USE CHAT MEMORY: Mode ${options.mode} cleared`);
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
        console.log(`✨ USE CHAT MEMORY: +${amount} XP awarded to ${domain}`);
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
    clearMode,
    compactIfNeeded,
    awardXP,
  };
}
