/**
 * TITANE∞ v26.4.0 — Security Configuration
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Configuration centralisée de sécurité - Mode PERMISSIF
 * Permet un fonctionnement complet sans blocages intempestifs
 */

// ═══════════════════════════════════════════════════════════════
// SECURITY MODE - PERMISSIF (No blocking, only logging)
// ═══════════════════════════════════════════════════════════════

export const SECURITY_MODE = {
  /** Mode global: 'strict' | 'permissive' | 'disabled' */
  mode: 'permissive' as const,

  /** Désactive les blocages de sécurité (log only) */
  disableBlocking: true,

  /** Désactive le rate limiting */
  disableRateLimiting: true,

  /** Désactive la sanitization stricte */
  disableStrictSanitization: true,

  /** Désactive les vérifications de circuit breaker */
  disableCircuitBreaker: false, // Keep for stability

  /** Log les événements de sécurité sans bloquer */
  logOnly: true,
};

// ═══════════════════════════════════════════════════════════════
// RATE LIMIT CONFIG - TRÈS PERMISSIF
// ═══════════════════════════════════════════════════════════════

export const PERMISSIVE_RATE_LIMITS = {
  /** Max requests par minute - très élevé */
  maxRequests: 1000,

  /** Fenêtre temps en ms */
  windowMs: 60000,

  /** Max tokens par minute - très élevé */
  maxTokens: 10000000,

  /** Max coût $ par minute - très élevé */
  maxCost: 1000.0,

  /** Requests par minute par provider */
  requestsPerMinute: 500,

  /** Requests par heure par provider */
  requestsPerHour: 50000,

  /** Tokens par minute par provider */
  tokensPerMinute: 5000000,

  /** Burst allowance */
  burstAllowance: 100,

  /** Cooldown très court */
  cooldownMs: 100,
};

// ═══════════════════════════════════════════════════════════════
// INPUT SANITIZATION CONFIG - MINIMAL
// ═══════════════════════════════════════════════════════════════

export const PERMISSIVE_SANITIZATION = {
  /** Désactive le mode strict */
  strictMode: false,

  /** Max length très élevé */
  maxLength: 1000000,

  /** Permet HTML */
  allowHtml: true,

  /** Permet code blocks */
  allowCodeBlocks: true,

  /** Permet URLs */
  allowUrls: true,

  /** Ne bloque jamais */
  neverBlock: true,

  /** Log only (pas de modification) */
  logOnly: true,
};

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER CONFIG - TOLÉRANT
// ═══════════════════════════════════════════════════════════════

export const TOLERANT_CIRCUIT_BREAKER = {
  /** Seuil de failures très élevé */
  failureThreshold: 100,

  /** Recovery timeout court */
  recoveryTimeoutMs: 5000,

  /** Success threshold bas */
  successThreshold: 1,

  /** Fenêtre de failures large */
  failureWindowMs: 300000,

  /** Minimum calls élevé */
  minimumCalls: 50,
};

// ═══════════════════════════════════════════════════════════════
// CHAT INPUT CONFIG - PERMISSIF
// ═══════════════════════════════════════════════════════════════

export const PERMISSIVE_CHAT_INPUT = {
  /** Max caractères très élevé */
  maxLength: 100000,

  /** Intervalle minimum très court */
  minInterval: 100,

  /** Max spam très élevé */
  maxSpam: 1000,

  /** Reset spam time court */
  spamResetTime: 5000,

  /** Pas de patterns dangereux bloquants */
  dangerousPatterns: [] as RegExp[],
};

// ═══════════════════════════════════════════════════════════════
// API PROVIDER CONFIG - SANS RESTRICTIONS
// ═══════════════════════════════════════════════════════════════

export const UNRESTRICTED_PROVIDER_CONFIG = {
  claude: {
    requestsPerMinute: 500,
    requestsPerHour: 10000,
    tokensPerMinute: 1000000,
    cooldownMs: 100,
    failureThreshold: 50,
    recoveryTimeoutMs: 2000,
  },
  openai: {
    requestsPerMinute: 500,
    requestsPerHour: 10000,
    tokensPerMinute: 1000000,
    cooldownMs: 100,
    failureThreshold: 50,
    recoveryTimeoutMs: 2000,
  },
  gemini: {
    requestsPerMinute: 500,
    requestsPerHour: 10000,
    tokensPerMinute: 1000000,
    cooldownMs: 100,
    failureThreshold: 50,
    recoveryTimeoutMs: 2000,
  },
  'tauri-backend': {
    requestsPerMinute: 1000,
    requestsPerHour: 100000,
    tokensPerMinute: 10000000,
    cooldownMs: 50,
    failureThreshold: 100,
    recoveryTimeoutMs: 1000,
  },
  ollama: {
    requestsPerMinute: 1000,
    requestsPerHour: 100000,
    tokensPerMinute: 10000000,
    cooldownMs: 50,
    failureThreshold: 100,
    recoveryTimeoutMs: 1000,
  },
  'titane-local': {
    requestsPerMinute: 10000,
    requestsPerHour: 1000000,
    tokensPerMinute: 100000000,
    cooldownMs: 10,
    failureThreshold: 1000,
    recoveryTimeoutMs: 500,
  },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie si le blocage est désactivé
 */
export function isBlockingDisabled(): boolean {
  return SECURITY_MODE.disableBlocking || SECURITY_MODE.mode === 'disabled';
}

/**
 * Vérifie si le rate limiting est désactivé
 */
export function isRateLimitingDisabled(): boolean {
  return SECURITY_MODE.disableRateLimiting || SECURITY_MODE.mode === 'disabled';
}

/**
 * Vérifie si la sanitization stricte est désactivée
 */
export function isStrictSanitizationDisabled(): boolean {
  return SECURITY_MODE.disableStrictSanitization || SECURITY_MODE.mode !== 'strict';
}

/**
 * Obtient les limites de rate selon le mode
 */
export function getRateLimits() {
  if (SECURITY_MODE.mode === 'permissive' || SECURITY_MODE.mode === 'disabled') {
    return PERMISSIVE_RATE_LIMITS;
  }
  // Retourne les limites par défaut strictes
  return {
    maxRequests: 50,
    windowMs: 60000,
    maxTokens: 100000,
    maxCost: 1.0,
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    tokensPerMinute: 100000,
    burstAllowance: 10,
    cooldownMs: 5000,
  };
}

/**
 * Obtient les options de sanitization selon le mode
 */
export function getSanitizationOptions() {
  if (SECURITY_MODE.mode === 'permissive' || SECURITY_MODE.mode === 'disabled') {
    return PERMISSIVE_SANITIZATION;
  }
  return {
    strictMode: true,
    maxLength: 10000,
    allowHtml: false,
    allowCodeBlocks: true,
    allowUrls: true,
    neverBlock: false,
    logOnly: false,
  };
}

/**
 * Obtient la config circuit breaker selon le mode
 */
export function getCircuitBreakerConfig() {
  if (SECURITY_MODE.mode === 'permissive') {
    return TOLERANT_CIRCUIT_BREAKER;
  }
  return {
    failureThreshold: 5,
    recoveryTimeoutMs: 30000,
    successThreshold: 2,
    failureWindowMs: 60000,
    minimumCalls: 3,
  };
}

/**
 * Obtient la config provider selon le mode
 */
export function getProviderConfig(provider: string) {
  if (SECURITY_MODE.mode === 'permissive' || SECURITY_MODE.mode === 'disabled') {
    return UNRESTRICTED_PROVIDER_CONFIG[provider as keyof typeof UNRESTRICTED_PROVIDER_CONFIG]
      || UNRESTRICTED_PROVIDER_CONFIG['titane-local'];
  }
  return null; // Use defaults
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  SECURITY_MODE,
  PERMISSIVE_RATE_LIMITS,
  PERMISSIVE_SANITIZATION,
  TOLERANT_CIRCUIT_BREAKER,
  PERMISSIVE_CHAT_INPUT,
  UNRESTRICTED_PROVIDER_CONFIG,
  isBlockingDisabled,
  isRateLimitingDisabled,
  isStrictSanitizationDisabled,
  getRateLimits,
  getSanitizationOptions,
  getCircuitBreakerConfig,
  getProviderConfig,
};
