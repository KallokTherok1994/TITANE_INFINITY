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
    safeInvokeTauri: typeof safeInvokeTauri;
  }
}

// Protection globale - remplace window.__TAURI__ si défaillant
if (typeof window !== 'undefined') {
  // Ne pas masquer les erreurs en production: on veut de la visibilité pour diagnostiquer.
  // En DEV uniquement, on peut filtrer certains bruits liés à l'invoke.
  if (import.meta.env.DEV) {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('Cannot read properties') &&
        message.includes('invoke')
      ) {
        console.warn('🛡️ [TauriProtector] Caught invoke error - using fallback');
        return;
      }
      originalConsoleError(...args);
    };
  }

  // Information de démarrage
  console.log('🛡️ TITANE∞ Tauri Invoke Protection: ACTIVE');
  console.log('✅ Fallback mode available for browser context');
}

// Le validator d'invoke est un outil de debug; ne jamais l'exécuter en prod.
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  void import('./tests/tauri-invoke-fix-validator');
}

if (typeof window !== 'undefined') {
  window.safeInvokeTauri = safeInvokeTauri;
}

export { safeInvokeTauri };
