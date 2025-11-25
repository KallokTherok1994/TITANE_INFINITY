// ═══════════════════════════════════════════════════════════════
// 🌐 TITANE∞ v16.1 — OFFLINE FIRST CONFIG
// Mode: Local > Cloud (APIs on-demand only)
// ═══════════════════════════════════════════════════════════════

export interface AIConfig {
  mode: 'local' | 'cloud' | 'hybrid';
  provider: 'ollama' | 'gemini' | 'openai' | 'local';
  requireOnlineConfirmation: boolean;
  localFirst: boolean;
}

export const AI_CONFIG: AIConfig = {
  // Mode par défaut: LOCAL ONLY
  mode: 'local',

  // Provider par défaut: Ollama (local)
  provider: 'ollama',

  // Demander confirmation avant d'utiliser une API cloud
  requireOnlineConfirmation: true,

  // Toujours essayer local en premier
  localFirst: true,
};

export const API_ENDPOINTS = {
  // Local endpoints (toujours disponibles)
  ollama: 'http://localhost:11434',
  localLLM: 'http://localhost:8000',

  // Cloud endpoints (utilisés seulement si activé)
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  openai: 'https://api.openai.com/v1',
};

export const OFFLINE_FEATURES = {
  // Features disponibles en mode offline
  chat: true,
  voice: true,
  memory: true,
  modules: true,
  devtools: true,

  // Features nécessitant Internet (désactivées si offline)
  cloudSync: false,
  apiUpdates: false,
  telemetry: false,
};

/**
 * Vérifie si le mode online est activé
 */
export function isOnlineModeEnabled(): boolean {
  // Vérifier le localStorage ou la config user
  const userConfig = localStorage.getItem('titane_ai_config');
  if (userConfig) {
    const config = JSON.parse(userConfig);
    return config.mode === 'cloud' || config.mode === 'hybrid';
  }
  return false;
}

/**
 * Vérifie si une connexion Internet est disponible
 * ⚠️ NOTE: fetch() ici est OK car test minimaliste (favicon Google)
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Active le mode cloud (après confirmation utilisateur)
 */
export function enableCloudMode(provider: 'gemini' | 'openai' = 'gemini') {
  const config = {
    mode: 'cloud',
    provider,
    requireOnlineConfirmation: true,
    localFirst: false,
  };
  localStorage.setItem('titane_ai_config', JSON.stringify(config));
  console.log('🌐 Mode Cloud activé:', provider);
}

/**
 * Désactive le mode cloud (retour au local)
 */
export function disableCloudMode() {
  const config = {
    mode: 'local',
    provider: 'ollama',
    requireOnlineConfirmation: true,
    localFirst: true,
  };
  localStorage.setItem('titane_ai_config', JSON.stringify(config));
  console.log('🏠 Mode Local activé');
}

/**
 * Get current AI config
 */
export function getAIConfig(): AIConfig {
  const userConfig = localStorage.getItem('titane_ai_config');
  if (userConfig) {
    return JSON.parse(userConfig);
  }
  return AI_CONFIG;
}
