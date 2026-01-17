/**
 * TITANE∞ v24.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ CHAT LOGGER — Production-Safe Logging
 *   Auto-disabled en production, full diagnostics en dev
 * ═══════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('titane_debug_chat') === 'true' || isDev;
};

export const chatLogger = {
  /**
   * Log info (dev only sauf si debug forcé)
   */
  info: (...args: unknown[]) => {
    if (isDebugEnabled()) {
      logger.debug('[CHAT]', ...args);
    }
  },

  /**
   * Log debug détaillé (dev only)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      logger.debug('[CHAT DEBUG]', ...args);
    }
  },

  /**
   * Log warning (toujours actif)
   */
  warn: (...args: unknown[]) => {
    logger.warn('[CHAT]', ...args);
  },

  /**
   * Log error (toujours actif)
   */
  error: (...args: unknown[]) => {
    logger.error('[CHAT]', ...args);
  },

  /**
   * Log success (dev only)
   */
  success: (...args: unknown[]) => {
    if (isDebugEnabled()) {
      logger.debug('✅', ...args);
    }
  },

  /**
   * Log performance metrics (dev only)
   */
  perf: (label: string, duration: number) => {
    if (isDebugEnabled()) {
      logger.debug(`[CHAT PERF] ${label}: ${duration}ms`);
    }
  },

  /**
   * Enable debug mode manuellement
   */
  enableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('titane_debug_chat', 'true');
      logger.debug('🔍 Debug mode enabled (localStorage)');
    }
  },

  /**
   * Disable debug mode
   */
  disableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('titane_debug_chat');
      logger.debug('🔇 Debug mode disabled');
    }
  },
};

// Expose globally for debug
if (typeof window !== 'undefined') {
  (window as any).chatLogger = chatLogger;
}
