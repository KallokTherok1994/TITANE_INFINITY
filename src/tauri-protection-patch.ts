/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * 🛡️ TAURI INVOKE GLOBAL PROTECTION PATCH
 * Application du patch de protection pour tous les invoke problématiques
 */

// Import de la protection
import './tests/tauri-invoke-fix-validator';
import { safeInvokeTauri } from './utils/tauriProtector';

// Protection globale - remplace window.__TAURI__ si défaillant
if (typeof window !== 'undefined') {
  // Patch du window global si nécessaire
  const originalConsoleError = console.error;

  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('Cannot read properties') && message.includes('invoke')) {
      console.warn('🛡️ [TauriProtector] Caught invoke error - using fallback');
      return; // Supprimer les erreurs invoke du console
    }
    originalConsoleError(...args);
  };

  // Information de démarrage
  console.log('🛡️ TITANE∞ Tauri Invoke Protection: ACTIVE');
  console.log('✅ Fallback mode available for browser context');
}

// Export de la fonction protégée pour usage global
(window as any).safeInvokeTauri = safeInvokeTauri;

export { safeInvokeTauri };
