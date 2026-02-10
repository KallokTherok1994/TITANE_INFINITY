/**
 * PHASE 3 MIGRATION: Legacy localStorage cleanup utility
 * Removes old conversation keys that are no longer used
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('conversationStorageCleanup');

/**
 * Clean up legacy localStorage keys from old conversation system
 * Call this once during app initialization
 */
export function cleanupLegacyConversationKeys(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];

    // Find all legacy keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Legacy conversation ID key
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
