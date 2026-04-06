/**
 * TITANE∞ v29.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🌐 BROWSER MODE ADAPTER
 * Détecte et configure automatiquement l'application pour le mode navigateur
 */

import { logger } from '../lib/logger';

export const isBrowserMode = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const w = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };

  return !(w.__TAURI__ || w.__TAURI_INTERNALS__);
};

const clearBrowserModeFlags = (): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem('titane_browser_mode');
  localStorage.removeItem('titane_ollama_enabled');
  localStorage.removeItem('titane_auto_backup_enabled');
  localStorage.removeItem('titane_auto_audit_enabled');
  localStorage.removeItem('titane_onboarding_complete');
  localStorage.removeItem('titane_security_mode');
  localStorage.removeItem('titane_restrictions_disabled');
};

export const configureBrowserMode = (): void => {
  if (!isBrowserMode()) {
    clearBrowserModeFlags();
    return;
  }

  logger.info('Browser mode detected - applying degraded fallback', {
    component: 'BrowserModeAdapter',
  });

  // 🌐 Mode navigateur : garder un fallback explicite, sans faux état "open" ou "complete"
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('titane_browser_mode', '1');

    // Conserver uniquement les bascules purement locales utiles au mode web.
    localStorage.setItem('titane_ollama_enabled', '1');
    localStorage.setItem('titane_auto_backup_enabled', '1');
    localStorage.setItem('titane_auto_audit_enabled', '1');

    // Nettoyer les anciens drapeaux fail-open issus du fallback navigateur legacy.
    localStorage.removeItem('titane_onboarding_complete');
    localStorage.removeItem('titane_security_mode');
    localStorage.removeItem('titane_restrictions_disabled');
  }

  console.log('🌐 TITANE∞ - Mode Navigateur (fallback dégradé)');
  console.log('ℹ️ Backend Tauri indisponible - fonctionnalités limitées au mode local');
};

// Auto-configure au chargement du module
if (typeof window !== 'undefined') {
  window.addEventListener('tauri-ready', () => {
    clearBrowserModeFlags();
  });

  configureBrowserMode();
}
