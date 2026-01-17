/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — MEMORY COMPACTOR FOR CHAT
 *   Compression intelligente de l'historique chat par mode
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage } from './ai/types';
import { getMessageText } from './ai/types';
import type { ChatMode } from './ai/chatEngine';
import { createLogger } from '@/utils/logger';

const logger = createLogger('[MEMORY-COMPACTOR]');

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'titane_chat_mode_';
const __MAX_MESSAGES_PER_MODE = 50; // Reserved for future use
const COMPRESSION_THRESHOLD = 30; // Compresser si > 30 messages
const COMPRESSION_TARGET = 20; // Garder 20 messages après compression

// ✨ v24.3.7: requestIdleCallback polyfill for Safari/older browsers
const scheduleIdleTask =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1); // Fallback: next tick

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface CompressedMessage {
  timestamp: number;
  summary: string;
  messageCount: number;
}

interface ModeMemory {
  mode: ChatMode;
  messages: AIMessage[];
  compressed: CompressedMessage[];
  lastCompacted: number;
}

// ─────────────────────────────────────────────────────────────────
// MEMORY COMPACTOR
// ─────────────────────────────────────────────────────────────────

class ChatMemoryCompactor {
  /**
   * Charge l'historique d'un mode spécifique
   */
  loadForMode(mode: ChatMode): AIMessage[] {
    try {
      const key = `${STORAGE_KEY_PREFIX}${mode}`;
      const stored = localStorage.getItem(key);

      if (!stored) return [];

      const memory: ModeMemory = JSON.parse(stored);
      return memory.messages || [];
    } catch (error) {
      logger.error(
        `Failed to load ${mode}`,
        { component: 'MemoryCompactor', mode },
        error as Error
      );
      return [];
    }
  }

  // ✨ v24.3.7: Pending saves queue to batch writes
  private pendingSaves = new Map<ChatMode, AIMessage[]>();
  private saveScheduled = false;
  // 🔒 v26.2.1 - CRITICAL FIX H2: Memory leak protection
  private static readonly MAX_PENDING_SAVES = 100;

  /**
   * Sauvegarde l'historique d'un mode avec compression auto
   * ✨ v24.3.7: Uses requestIdleCallback to avoid blocking main thread
   * 🔒 v26.2.1: Added MAX_PENDING_SAVES protection against memory leak
   */
  saveForMode(mode: ChatMode, messages: AIMessage[]): void {
    // 🔒 v26.2.1: Force flush if max pending saves reached (memory leak protection)
    if (this.pendingSaves.size >= ChatMemoryCompactor.MAX_PENDING_SAVES) {
      logger.warn('Force flush - max pending saves reached', {
        component: 'MemoryCompactor',
        pendingCount: this.pendingSaves.size,
        maxAllowed: ChatMemoryCompactor.MAX_PENDING_SAVES,
      });
      this.flushPendingSaves();
    }

    // ✨ v24.3.7: Queue the save instead of executing immediately
    this.pendingSaves.set(mode, messages);

    // Schedule idle write if not already scheduled
    if (!this.saveScheduled) {
      this.saveScheduled = true;
      scheduleIdleTask(() => this.flushPendingSaves());
    }
  }

  /**
   * ✨ v24.3.7: Flush all pending saves during idle time
   */
  private flushPendingSaves(): void {
    this.saveScheduled = false;

    for (const [mode, messages] of this.pendingSaves.entries()) {
      try {
        // Charger mémoire existante
        let memory = this.loadMemoryObject(mode);

        // Ajouter nouveaux messages
        memory.messages = messages;

        // Compression si nécessaire
        if (messages.length > COMPRESSION_THRESHOLD) {
          logger.info(`Compressing ${mode}`, {
            component: 'MemoryCompactor',
            mode,
            messagesCount: messages.length,
          });
          memory = this.compress(memory);
        }

        // Sauvegarder
        const key = `${STORAGE_KEY_PREFIX}${mode}`;
        localStorage.setItem(key, JSON.stringify(memory));
      } catch (error) {
        logger.error(
          `Failed to save ${mode}`,
          { component: 'MemoryCompactor', mode },
          error as Error
        );
      }
    }

    this.pendingSaves.clear();
  }

  /**
   * Ajoute un message à un mode
   */
  addMessageToMode(mode: ChatMode, message: AIMessage): AIMessage[] {
    const messages = this.loadForMode(mode);
    messages.push(message);
    this.saveForMode(mode, messages);
    return messages;
  }

  /**
   * Efface l'historique d'un mode
   */
  clearMode(mode: ChatMode): void {
    try {
      const key = `${STORAGE_KEY_PREFIX}${mode}`;
      localStorage.removeItem(key);
      logger.info(`Cleared ${mode}`, { component: 'MemoryCompactor', mode });
    } catch (error) {
      logger.error(
        `Failed to clear ${mode}`,
        { component: 'MemoryCompactor', mode },
        error as Error
      );
    }
  }

  /**
   * Efface tout (tous les modes)
   */
  clearAll(): void {
    const modes: ChatMode[] = [
      'default',
      'brainstorming',
      'synthesis',
      'planning',
      'journal',
      'debug_cognitive',
    ];

    modes.forEach(mode => this.clearMode(mode));

    // Nettoyer ancienne clé globale si existe
    try {
      localStorage.removeItem('titane_chat_history');
    } catch {
      // Ignore storage errors silently
    }
  }

  /**
   * Retourne les stats mémoire par mode
   */
  getMemoryStats(): Record<
    ChatMode,
    { messages: number; compressed: number; size: string }
  > {
    const modes: ChatMode[] = [
      'default',
      'brainstorming',
      'synthesis',
      'planning',
      'journal',
      'debug_cognitive',
    ];
    const stats: Record<string, { messages: number; compressed: number; size: string }> =
      {};

    modes.forEach(mode => {
      const memory = this.loadMemoryObject(mode);
      const key = `${STORAGE_KEY_PREFIX}${mode}`;
      const stored = localStorage.getItem(key);
      const sizeKB = stored ? (stored.length / 1024).toFixed(2) : '0';

      stats[mode] = {
        messages: memory.messages.length,
        compressed: memory.compressed.length,
        size: `${sizeKB} KB`,
      };
    });

    return stats;
  }

  /**
   * Retourne stats pour un mode spécifique
   */
  getStats(mode: ChatMode): { count: number; sizeMB: number; compressed: boolean } {
    const memory = this.loadMemoryObject(mode);
    const key = `${STORAGE_KEY_PREFIX}${mode}`;
    const stored = localStorage.getItem(key);
    const sizeMB = stored ? stored.length / (1024 * 1024) : 0;

    return {
      count: memory.messages.length,
      sizeMB,
      compressed: memory.compressed.length > 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────

  private loadMemoryObject(mode: ChatMode): ModeMemory {
    try {
      const key = `${STORAGE_KEY_PREFIX}${mode}`;
      const stored = localStorage.getItem(key);

      if (!stored) {
        return this.createEmptyMemory(mode);
      }

      return JSON.parse(stored);
    } catch {
      return this.createEmptyMemory(mode);
    }
  }

  private createEmptyMemory(mode: ChatMode): ModeMemory {
    return {
      mode,
      messages: [],
      compressed: [],
      lastCompacted: Date.now(),
    };
  }

  /**
   * Compression intelligente: garde les N derniers + résumé des anciens
   */
  private compress(memory: ModeMemory): ModeMemory {
    const messages = memory.messages;

    if (messages.length <= COMPRESSION_TARGET) {
      return memory;
    }

    // Garder les N derniers messages
    const recent = messages.slice(-COMPRESSION_TARGET);
    const toCompress = messages.slice(0, -COMPRESSION_TARGET);

    // Créer résumé des messages compressés
    const summary = this.createSummary(toCompress, memory.mode);

    memory.compressed.push({
      timestamp: Date.now(),
      summary,
      messageCount: toCompress.length,
    });

    memory.messages = recent;
    memory.lastCompacted = Date.now();

    logger.info('Compressed messages', {
      component: 'MemoryCompactor',
      compressed: toCompress.length,
      keptRecent: recent.length,
    });

    return memory;
  }

  /**
   * Crée un résumé des messages compressés selon le mode
   */
  private createSummary(messages: AIMessage[], mode: ChatMode): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const aiMessages = messages.filter(m => m.role === 'assistant');

    const topics = this.extractTopics(userMessages);

    let summary = `[Compressed ${messages.length} messages from ${mode} mode]\n`;
    summary += `• User questions: ${userMessages.length}\n`;
    summary += `• AI responses: ${aiMessages.length}\n`;

    if (topics.length > 0) {
      summary += `• Topics: ${topics.slice(0, 5).join(', ')}`;
    }

    return summary;
  }

  /**
   * Extrait les topics principaux des messages (simple)
   */
  private extractTopics(messages: AIMessage[]): string[] {
    const topics = new Set<string>();

    messages.forEach(msg => {
      const content = getMessageText(msg).toLowerCase();

      // Mots-clés techniques
      if (content.includes('rust') || content.includes('tauri')) topics.add('Rust/Tauri');
      if (content.includes('react') || content.includes('typescript'))
        topics.add('React/TS');
      if (content.includes('architecture')) topics.add('Architecture');
      if (content.includes('erreur') || content.includes('bug')) topics.add('Debug');
      if (content.includes('performance')) topics.add('Performance');
      if (content.includes('ui') || content.includes('interface')) topics.add('UI/UX');
    });

    return Array.from(topics);
  }

  /**
   * SELFHEAL++ - Cleanup automatique si mémoire >5MB
   */
  autoCleanupIfNeeded(): { cleaned: boolean; sizeMB: number } {
    // Calculer taille totale localStorage
    let totalSize = 0;
    const modes: ChatMode[] = [
      'default',
      'brainstorming',
      'synthesis',
      'planning',
      'journal',
      'debug_cognitive',
    ];

    modes.forEach(mode => {
      const key = `${STORAGE_KEY_PREFIX}${mode}`;
      const stored = localStorage.getItem(key);
      if (stored) totalSize += stored.length;
    });

    const sizeMB = totalSize / (1024 * 1024);

    if (sizeMB > 5) {
      logger.warn(`SELFHEAL++: Memory cleanup triggered`, {
        component: 'MemoryCompactor',
        sizeMB: sizeMB.toFixed(2),
      });

      // Compresser tous les modes
      modes.forEach(mode => {
        const messages = this.loadForMode(mode);
        if (messages.length > 10) {
          // Force compression agressive
          const memory = this.loadMemoryObject(mode);
          memory.messages = messages.slice(-10); // Garde seulement 10 plus récents
          const key = `${STORAGE_KEY_PREFIX}${mode}`;
          localStorage.setItem(key, JSON.stringify(memory));
          logger.info(`Cleaned ${mode}`, {
            component: 'MemoryCompactor',
            mode,
            before: messages.length,
            after: 10,
          });
        }
      });

      return { cleaned: true, sizeMB };
    }

    return { cleaned: false, sizeMB };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON + CLASS (for testing)
// ─────────────────────────────────────────────────────────────────

export const chatMemoryCompactor = new ChatMemoryCompactor();
export default chatMemoryCompactor;

// 🔒 v26.2.1: Export class for testing purposes
export { ChatMemoryCompactor };
