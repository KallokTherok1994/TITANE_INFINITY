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
      console.log('[CHAT]', ...args);
    }
  },

  /**
   * Log debug détaillé (dev only)
   */
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[CHAT DEBUG]', ...args);
    }
  },

  /**
   * Log warning (toujours actif)
   */
  warn: (...args: unknown[]) => {
    console.warn('[CHAT]', ...args);
  },

  /**
   * Log error (toujours actif)
   */
  error: (...args: unknown[]) => {
    console.error('[CHAT]', ...args);
  },

  /**
   * Log success (dev only)
   */
  success: (...args: unknown[]) => {
    if (isDebugEnabled()) {
      console.log('[CHAT] ✅', ...args);
    }
  },

  /**
   * Log performance metrics (dev only)
   */
  perf: (label: string, duration: number) => {
    if (isDebugEnabled()) {
      console.log(`[CHAT PERF] ${label}: ${duration}ms`);
    }
  },

  /**
   * Enable debug mode manuellement
   */
  enableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('titane_debug_chat', 'true');
      console.log('[CHAT] 🔍 Debug mode enabled (localStorage)');
    }
  },

  /**
   * Disable debug mode
   */
  disableDebug: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('titane_debug_chat');
      console.log('[CHAT] 🔇 Debug mode disabled');
    }
  },
};

// Expose globally for debug
if (typeof window !== 'undefined') {
  (window as any).chatLogger = chatLogger;
}
