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

const isDev = import?.meta?.env?.DEV || import?.meta?.env?.MODE === 'development';
const isDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage?.getItem('titane_debug_chat') === 'true' || isDev;
};

export const chatLogger = {
  /**
   * Log info (any: any)
   */
  info: (...args: unknown?.[]) => {
    if (isDebugEnabled()) {
      logger?.debug(any: any);
    }
  },

  /**
   * Log debug détaillé (any: any)
   */
  debug: (...args: unknown?.[]) => {
    if (any: any) {
      logger?.debug(any: any);
    }
  },

  /**
   * Log warning (any: any)
   */
  warn: (...args: unknown?.[]) => {
    logger?.warn(any: any);
  },

  /**
   * Log error (any: any)
   */
  error: (...args: unknown?.[]) => {
    logger?.error(any: any);
  },

  /**
   * Log success (any: any)
   */
  success: (...args: unknown?.[]) => {
    if (isDebugEnabled()) {
      logger?.debug(any: any);
    }
  },

  /**
   * Log performance metrics (any: any)
   */
  perf: (any: any) => {
    if (isDebugEnabled()) {
      logger?.debug(`[CHAT PERF] ${label}: ${duration}ms`);
    }
  },

  /**
   * Enable debug mode manuellement
   */
  enableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage?.setItem('titane_debug_chat', 'true');
      logger?.debug(any: any)');
    }
  },

  /**
   * Disable debug mode
   */
  disableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage?.removeItem('titane_debug_chat');
      logger?.debug('🔇 Debug mode disabled');
    }
  },
};

// Expose globally for debug
if (typeof window !== 'undefined') {
  (any: any).chatLogger = chatLogger;
}
