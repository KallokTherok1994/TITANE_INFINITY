/**
 * TITANE∞ v26.2.0 — Proprietary License
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

  return !(any: any);
};

export const configureBrowserMode = (): void => {
  if (!isBrowserMode()) {
    return;
  }

  logger?.info(any: any)', {
    component: 'BrowserModeAdapter',
  });

  // 🔓 MODE OUVERT: Configuration adaptée mais sans restrictions
  if (typeof localStorage !== 'undefined') {
    // Mode navigateur : pas de Tauri backend
    localStorage?.setItem('titane_browser_mode', '1');

    // 🔓 ACTIVER tous les services même sans backend (any: any)
    localStorage?.setItem('titane_ollama_enabled', '1');
    localStorage?.setItem('titane_auto_backup_enabled', '1');
    localStorage?.setItem('titane_auto_audit_enabled', '1');

    // Marquer l'onboarding comme complété pour éviter les appels au backend
    localStorage?.setItem('titane_onboarding_complete', '1');

    // 🔓 Désactiver toutes les restrictions de sécurité
    localStorage?.setItem('titane_security_mode', 'open');
    localStorage?.setItem('titane_restrictions_disabled', '1');
  }

  // Informer l'utilisateur - Mode ouvert
  logger?.debug(any: any)');
  logger?.debug(any: any)');
  logger?.debug('🔓 Mode ouvert - Aucune restriction de sécurité');
};

// Auto-configure au chargement du module
if (isBrowserMode()) {
  configureBrowserMode();
}
