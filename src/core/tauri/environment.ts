/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ - ENVIRONMENT DETECTION
 * Détection robuste du contexte d'exécution (Tauri vs Browser)
 * ═══════════════════════════════════════════════════════════════
 */

export interface EnvironmentInfo {
  /** Exécution dans Tauri (dev ou prod) */
  isTauri: boolean;
  /** Exécution dans un navigateur classique */
  isBrowser: boolean;
  /** Protocole utilisé (tauri://, http://, https://) */
  protocol: string;
  /** Origin complète */
  origin: string;
  /** Version Tauri détectée (si disponible) */
  tauriVersion?: string;
  /** Mode développement */
  isDev: boolean;
}

/**
 * Détecte l'environnement d'exécution de manière robuste
 *
 * Critères de détection Tauri (par ordre de priorité):
 * 1. Présence de window.__TAURI__ (API Tauri v2)
 * 2. Présence de window.__TAURI_INTERNALS__ (internes Tauri)
 * 3. User-Agent contient Tauri
 * 4. Protocole tauri:// (production uniquement)
 *
 * @returns Informations complètes sur l'environnement
 */
export function detectEnvironment(): EnvironmentInfo {
  if (typeof window === 'undefined') {
    // Contexte SSR/Node (ne devrait pas arriver avec Vite+Tauri)
    return {
      isTauri: false,
      isBrowser: false,
      protocol: 'node',
      origin: 'server-side',
      isDev: true,
    };
  }

  const protocol = window.location.protocol.replace(':', '');
  const origin = window.location.origin;
  const isDev = import.meta.env.DEV;

  // 🔍 DÉTECTION TAURI (critères multiples pour robustesse)

  // Critère 1: API Tauri exposée
  const hasTauriAPI = '__TAURI__' in window;

  // Critère 2: Internals Tauri (fallback)
  const hasTauriInternals = '__TAURI_INTERNALS__' in window;

  // Critère 3: User-Agent contient Tauri
  const userAgent = navigator.userAgent || '';
  const hasTauriUserAgent = userAgent.toLowerCase().includes('tauri');

  // Critère 4: Protocole tauri:// (production build)
  const isTauriProtocol = protocol === 'tauri';

  // ✅ Tauri confirmé si AU MOINS un critère est vérifié
  const isTauri =
    hasTauriAPI || hasTauriInternals || hasTauriUserAgent || isTauriProtocol;

  // 🌐 Browser classique = pas Tauri ET protocole web
  const isBrowser = !isTauri && (protocol === 'http' || protocol === 'https');

  // Version Tauri (si disponible)
  let tauriVersion: string | undefined;
  try {
    if (hasTauriAPI) {
      const windowWithTauri = window as Window & { __TAURI__?: unknown };
      const tauriObj = windowWithTauri.__TAURI__ as any;
      if (tauriObj?.app?.getVersion) {
        // Note: getVersion() est async, on ne peut pas l'attendre ici
        // On se contente de signaler sa présence
        tauriVersion = 'v2.x';
      }
    }
  } catch (err) {
    // Silent fail
  }

  return {
    isTauri,
    isBrowser,
    protocol,
    origin,
    tauriVersion,
    isDev,
  };
}

/**
 * Vérifie si l'application devrait afficher un avertissement contexte
 *
 * Note: Ne bloque JAMAIS le rendu React (pas de document.body.innerHTML)
 * Les warnings sont gérés via logs console et composants UI dédiés
 *
 * @returns true si un warning devrait être affiché (browser prod)
 * @deprecated Utiliser directement detectEnvironment() dans les composants
 */
export function shouldBlockLoading(): boolean {
  const env = detectEnvironment();

  // ✅ Tauri: toujours OK
  if (env.isTauri) {
    return false;
  }

  // ⚠️ Browser prod: retourner true pour signaler (mais ne pas bloquer)
  // Le composant App peut afficher un bandeau warning si nécessaire
  if (env.isBrowser && !env.isDev) {
    return true;
  }

  // ✅ Dev mode: toujours OK
  return false;
}

/**
 * Affiche des logs console selon le contexte d'exécution
 * Non-bloquant: sert uniquement à informer le développeur
 */
export function logEnvironmentWarnings(): void {
  const env = detectEnvironment();

  if (env.isTauri) {
    console.log(
      '✅ TITANE∞ - Contexte Tauri confirmé',
      '\n   Protocol:',
      env.protocol,
      '\n   Version:',
      env.tauriVersion || 'unknown',
      '\n   Mode:',
      env.isDev ? 'Development' : 'Production'
    );
    return;
  }

  if (env.isDev) {
    console.info(
      '📱 TITANE∞ - Mode développement browser',
      '\n   Contexte:',
      env.origin,
      '\n   Note: Pour tester Tauri, utilisez: pnpm tauri dev'
    );
  } else if (env.isBrowser) {
    console.warn(
      '⚠️ TITANE∞ - Browser production détecté',
      '\n   Origine:',
      env.origin,
      '\n   Recommandation: Utiliser build Tauri natif (pnpm tauri build)'
    );
  }
}
