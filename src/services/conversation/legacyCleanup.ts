/**
 * PHASE 3 MIGRATION: Legacy localStorage cleanup utility
 * Removes old conversation keys that are no longer used
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('conversationStorageCleanup');

const CANONICAL_CONVERSATION_ID_KEY = 'titane_active_conversation_id';
const LEGACY_CHAT_PAGE_KEY = 'omega-chat-conversation-id';

/**
 * Clean up legacy localStorage keys from old conversation system.
 * Also migrates omega-chat-conversation-id → titane_active_conversation_id (LOCK2).
 * Call this once during app initialization.
 */
export function cleanupLegacyConversationKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];

    // LOCK2: Migrate omega-chat-conversation-id → titane_active_conversation_id
    // If the canonical key is absent but the legacy ChatPage key exists, promote it.
    const canonical = localStorage.getItem(CANONICAL_CONVERSATION_ID_KEY);
    const legacy = localStorage.getItem(LEGACY_CHAT_PAGE_KEY);
    if (!canonical && legacy && legacy.trim().length > 0) {
      localStorage.setItem(CANONICAL_CONVERSATION_ID_KEY, legacy);
      logger.info(
        '🔄 Migrated omega-chat-conversation-id → titane_active_conversation_id',
        {
          id: legacy,
        }
      );
    }

    // Find all legacy keys to remove
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Legacy conversation ID key (pre-v26)
      if (key === 'titane_current_conversation_id') {
        keysToRemove.push(key);
      }
    }

    // Remove all legacy keys
    if (keysToRemove.length > 0) {
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        logger.debug('Removed legacy key', { key });
      });

      logger.info('🧹 Cleaned up legacy conversation keys', {
        count: keysToRemove.length,
        keys: keysToRemove,
      });
    }
  } catch (error) {
    logger.error('Failed to cleanup legacy keys', error);
    // Non-blocking: if cleanup fails, continue anyway
  }
}
