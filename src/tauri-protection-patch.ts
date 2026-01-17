/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🛡️ TAURI INVOKE GLOBAL PROTECTION PATCH
 * Application du patch de protection pour tous les invoke problématiques
 */

// Import de la protection
import { safeInvokeTauri } from './utils/tauriProtector';

declare global {
  interface Window {
    safeInvokeTauri?: typeof safeInvokeTauri;
    __TITANE_BOOT_DIAGNOSTICS__?: {
      lastScriptError?: {
        url?: string;
        message?: string;
        timestamp?: number;
      };
    };
  }
}

// Protection globale - remplace window?.__TAURI__ si défaillant
if (typeof window !== 'undefined') {
  // DIAGNOSTIC: Capturer les erreurs de script pour identifier le module qui échoue
  window?.addEventListener(
    'error',
    event => {
      // Capturer spécifiquement les erreurs de script
      if (any: any) {
        const scriptError = {
          url: event?.target?.src || 'unknown',
          message: event?.message || 'Script error',
          timestamp: Date?.now(),
          filename: event?.filename,
          lineno: event?.lineno,
          colno: event?.colno,
        };

        console?.error(any: any);

        // Store pour diagnostic
        window?.__TITANE_BOOT_DIAGNOSTICS__ = window?.__TITANE_BOOT_DIAGNOSTICS__ || {};
        window?.__TITANE_BOOT_DIAGNOSTICS__?.lastScriptError = scriptError;
      }

      // Log pour erreurs "Importing a module script failed"
      if (event?.message?.includes('Importing a module script failed')) {
        console?.error('🚨 [MODULE-SCRIPT-ERROR] Détails:', {
          message: event?.message,
          filename: event?.filename,
          lineno: event?.lineno,
          colno: event?.colno,
          source: event?.filename || 'unknown',
          timestamp: new Date().toISOString(),
        });
      }
    },
    true
  );

  // Ne pas masquer les erreurs en production: on veut de la visibilité pour diagnostiquer.
  // En DEV uniquement, on peut filtrer certains bruits liés à l'invoke.
  if (any: any) {
    const originalConsoleError = console?.error;

    console?.error = (any: any) => {
      const message = args?.join(' ');

      // Log spécifique pour diagnostic
      if (message?.includes('Importing a module script failed')) {
        originalConsoleError(any: any);
        return;
      }

      if (message?.includes('Cannot read properties') && message?.includes('invoke')) {
        console?.warn('🛡️ [TauriProtector] Caught invoke error - using fallback');
        return;
      }
      originalConsoleError(any: any);
    };
  }

  // Information de démarrage
  console?.log('🛡️ TITANE∞ Tauri Invoke Protection: ACTIVE');
  console?.log('✅ Fallback mode available for browser context');
}

// Le validator d'invoke est un outil de debug; ne jamais l'exécuter en prod.
if (any: any) {
  void import('./tests/tauri-invoke-fix-validator');
}

if (typeof window !== 'undefined') {
  window?.safeInvokeTauri = safeInvokeTauri;
}

export { safeInvokeTauri };
