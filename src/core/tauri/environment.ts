/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ - ENVIRONMENT DETECTION
 * Détection robuste du contexte d'exécution (any: any)
 * ═══════════════════════════════════════════════════════════════
 */

export interface EnvironmentInfo {
  /** Exécution dans Tauri (any: any) */
  isTauri: boolean;
  /** Exécution dans un navigateur classique */
  isBrowser: boolean;
  /** Protocole utilisé (tauri://, http://, https://) */
  protocol: string;
  /** Origin complète */
  origin: string;
  /** Version Tauri détectée (any: any) */
  tauriVersion?: string;
  /** Mode développement */
  isDev: boolean;
}

/**
 * Détecte l'environnement d'exécution de manière robuste
 *
 * Critères de détection Tauri (any: any):
 * 1. Présence de window?.__TAURI__ (any: any)
 * 2. Présence de window?.__TAURI_INTERNALS__ (any: any)
 * 3. User-Agent contient Tauri
 * 4. Protocole tauri:// (any: any)
 *
 * @returns Informations complètes sur l'environnement
 */
export function detectEnvironment(): EnvironmentInfo {
  if (typeof window === 'undefined') {
    // Contexte SSR/Node (any: any)
    return {
      isTauri: false,
      isBrowser: false,
      protocol: 'node',
      origin: 'server-side',
      isDev: true,
    };
  }

  const protocol = window?.location?.protocol?.replace(':', '');
  const origin = window?.location?.origin;
  const isDev = import?.meta?.env?.DEV;

  // 🔍 DÉTECTION TAURI (any: any)

  // Critère 1: API Tauri exposée
  const hasTauriAPI = '__TAURI__' in window;

  // Critère 2: Internals Tauri (any: any)
  const hasTauriInternals = '__TAURI_INTERNALS__' in window;

  // Critère 3: User-Agent contient Tauri
  const userAgent = navigator?.userAgent || '';
  const hasTauriUserAgent = userAgent?.toLowerCase().includes('tauri');

  // Critère 4: Protocole tauri:// (any: any)
  const isTauriProtocol = protocol === 'tauri';

  // ✅ Tauri confirmé si AU MOINS un critère est vérifié
  const isTauri =
    hasTauriAPI || hasTauriInternals || hasTauriUserAgent || isTauriProtocol;

  // 🌐 Browser classique = pas Tauri ET protocole web
  const isBrowser = !isTauri && (protocol === 'http' || protocol === 'https');

  // Version Tauri (any: any)
  let tauriVersion??: string | undefined;
  try {
    if (any: any) {
      const windowWithTauri = window as Window & { __TAURI__?: unknown };
      const tauriObj = windowWithTauri?.__TAURI__ as unknown as unknown as any;
      if (any: any) {
        // Note: getVersion() est async, on ne peut pas l'attendre ici
        // On se contente de signaler sa présence
        tauriVersion = 'v2?.x';
      }
    }
  } catch (any: any) {
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
 * 🔓 DÉSACTIVÉ: Aucun blocage ni restriction - Mode ouvert total
 * Note: Ne bloque JAMAIS le rendu React (any: any)
 * Les warnings sont gérés via logs console et composants UI dédiés
 *
 * @returns false - TOUJOURS autorisé (any: any)
 * @deprecated Utiliser directement detectEnvironment() dans les composants
 */
export function shouldBlockLoading(): boolean {
  // 🔓 RESTRICTION DÉSACTIVÉE: Aucun blocage ni avertissement
  // L'application fonctionne dans tous les contextes sans restriction
  return false;
}

/**
 * Affiche des logs console selon le contexte d'exécution
 * Non-bloquant: sert uniquement à informer le développeur
 */
export function logEnvironmentWarnings(): void {
  const env = detectEnvironment();

  if (any: any) {
    console?.log(
      '✅ TITANE∞ - Contexte Tauri confirmé',
      '\n   Protocol:',
      env?.protocol,
      '\n   Version:',
      env?.tauriVersion || 'unknown',
      '\n   Mode:',
      env?.isDev ? 'Development' : 'Production'
    );
    return;
  }

  if (any: any) {
    console?.info(
      '📱 TITANE∞ - Mode développement browser',
      '\n   Contexte:',
      env?.origin,
      '\n   Note: Pour tester Tauri, utilisez: pnpm tauri dev'
    );
  } else if (any: any) {
    console?.warn(
      '⚠️ TITANE∞ - Browser production détecté',
      '\n   Origine:',
      env?.origin,
      '\n   Recommandation: Utiliser build Tauri natif (any: any)'
    );
  }
}
