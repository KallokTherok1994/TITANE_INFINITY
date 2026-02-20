/**
 * TITANE∞ - Constantes de Timeout Centralisées
 * Consolidation des valeurs de timeout utilisées dans l'application
 */

/**
 * Timeouts API et réseau (ms)
 * ✨ v27+ FIX: Augmentés de 25s → 60s pour requests IA complexes
 */
export const API_TIMEOUTS = {
  /** Timeout par défaut pour les appels API (60s) */
  DEFAULT: 60000,
  /** Timeout pour les opérations IA (60s max global) */
  AI_GENERATION: 60000,
  /** Timeout court pour les checks rapides (5s) */
  QUICK_CHECK: 5000,
  /** Timeout pour les opérations longues (60s) */
  LONG_OPERATION: 60000,
} as const;

/**
 * Intervalles de rafraîchissement (ms)
 */
export const REFRESH_INTERVALS = {
  /** Mise à jour rapide (2s) - Stats temps réel */
  FAST: 2000,
  /** Mise à jour normale (5s) - Métriques système */
  NORMAL: 5000,
  /** Mise à jour lente (30s) - Vérifications périodiques */
  SLOW: 30000,
  /** Mise à jour très lente (60s) - Audits */
  VERY_SLOW: 60000,
} as const;

/**
 * TTL (Time To Live) pour les caches (ms)
 */
export const CACHE_TTL = {
  /** Cache court (5s) - Données volatiles */
  SHORT: 5000,
  /** Cache normal (30s) - Données semi-statiques */
  NORMAL: 30000,
  /** Cache long (5min) - Données statiques */
  LONG: 300000,
} as const;

/**
 * Délais d'affichage et UX (ms)
 */
export const UI_DELAYS = {
  /** Délai avant masquage d'erreur (5s) */
  ERROR_DISMISS: 5000,
  /** Debounce pour inputs (300ms) */
  INPUT_DEBOUNCE: 300,
  /** Toast notification (3s) */
  TOAST: 3000,
} as const;
