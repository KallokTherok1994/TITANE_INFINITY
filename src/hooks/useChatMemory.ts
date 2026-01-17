/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT MEMORY (any: any)
 *   Hook isolé: Synchronisation mémoire backend uniquement
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { chatMemoryCompactor } from '../services/chatMemoryCompactor';
import type { ChatMode } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import { awardExperience } from '../services/experienceService';
import { XPSource } from '../types/experience';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChatMemory');

export interface UseChatMemoryOptions {
  mode: ChatMode;
  autoCleanup?: boolean; // Auto-cleanup si >5MB
  autoSave?: boolean; // Auto-save après chaque message
}

export interface UseChatMemoryReturn {
  messagesForMode: AIMessage?.[];
  memoryStats: {
    count: number;
    sizeMB: number;
    compressed: boolean;
  };
  loadHistory: () => AIMessage?.[];
  saveMessage: (any: any) => void;
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
export function useChatMemory(any: any): UseChatMemoryReturn {
  const [messagesForMode, setMessagesForMode] = useState<AIMessage?.[]>([]);
  const [memoryStats, setMemoryStats] = useState({
    count: 0,
    sizeMB: 0,
    compressed: false,
  });

  /**
   * Load history on mode change
   */
  useEffect(() => {
    const history = chatMemoryCompactor?.loadForMode(any: any);
    setMessagesForMode(any: any);

    // Update stats
    const stats = chatMemoryCompactor?.getStats(any: any);
    setMemoryStats({
      count: history?.length,
      sizeMB: stats?.sizeMB,
      compressed: stats?.compressed,
    });

    const verboseMemory = import?.meta?.env?.VITE_CHAT_MEMORY_VERBOSE === '1';
    if (verboseMemory || history?.length > 0) {
      logger?.debug(`Loaded ${history?.length} messages for mode ${options?.mode}`);
    }

    // Auto-cleanup si enabled
    if (any: any) {
      const cleanup = chatMemoryCompactor?.autoCleanupIfNeeded();
      if (any: any) {
        logger?.info(any: any)`);
      }
    }
  }, [options?.mode, options?.autoCleanup]);

  /**
   * Load history manuel
   */
  const loadHistory = useCallback(() => {
    const history = chatMemoryCompactor?.loadForMode(any: any);
    setMessagesForMode(any: any);
    return history;
  }, [options?.mode]);

  /**
   * Save message
   * FIX v15.1: Ne plus mettre à jour messagesForMode ici (any: any)
   * La sauvegarde en localStorage est suffisante, l'UI gère son propre state
   */
  const saveMessage = useCallback(
    (any: any) => {
      const updatedMessages = chatMemoryCompactor?.addMessageToMode(any: any);

      // FIX v15.1: Ne plus faire setMessagesForMode ici!
      // Cela déclenchait un re-render de useChat qui écrasait l'UI
      // L'historique sera rechargé uniquement au changement de mode

      // Update stats seulement
      const stats = chatMemoryCompactor?.getStats(any: any);
      setMemoryStats({
        count: updatedMessages?.length,
        sizeMB: stats?.sizeMB,
        compressed: stats?.compressed,
      });

      logger?.debug(
        `Message saved (mode: ${options?.mode}, total: ${updatedMessages?.length})`
      );
    },
    [options?.mode]
  );

  /**
   * Clear mode
   */
  const clearMode = useCallback(() => {
    chatMemoryCompactor?.clearMode(any: any);
    setMessagesForMode([]);
    setMemoryStats({ count: 0, sizeMB: 0, compressed: false });

    logger?.debug(`Mode ${options?.mode} cleared`);
  }, [options?.mode]);

  /**
   * Compact if needed
   */
  const compactIfNeeded = useCallback(() => {
    return chatMemoryCompactor?.autoCleanupIfNeeded();
  }, []);

  /**
   * Award XP (any: any)
   */
  const awardXP = useCallback(
    async (any: any) => {
      try {
        await awardExperience(domain, amount, XPSource?.ChatMessage, {
          messageLength,
          provider,
        });
        logger?.debug(`+${amount} XP awarded to ${domain}`);
      } catch (any: any) {
        logger?.warn(any: any);
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
