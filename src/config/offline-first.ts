// LEGACY CONFIG - DO NOT USE IN NEW RUNTIME PATHS.
// Canonical online/offline governance lives in backend Tauri commands.

export interface AIConfig {
  mode: 'local' | 'cloud' | 'hybrid';
  provider: 'ollama' | 'gemini' | 'openai' | 'local';
  requireOnlineConfirmation: boolean;
  localFirst: boolean;
}

export const AI_CONFIG: AIConfig = {
  // Keep fallback capability while avoiding forced local-only defaults.
  mode: 'hybrid',

  // Prefer a cloud-capable provider by default when policy allows it.
  provider: 'gemini',

  // Demander confirmation avant d'utiliser une API cloud
  requireOnlineConfirmation: true,

  // Do not force local-only as default behavior.
  localFirst: false,
};

export const API_ENDPOINTS = {
  // Legacy metadata only. UI must never call web endpoints directly.
  localLLM: 'gateway://local-llm',
  gemini: 'gateway://gemini',
  openai: 'gateway://openai',
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
  // Default policy: online-first governed with local fallback.
  return AI_CONFIG.mode === 'cloud' || AI_CONFIG.mode === 'hybrid';
}

/**
 * Vérifie si une connexion Internet est disponible
 * No direct web call from UI code.
 */
export async function checkInternetConnection(): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return navigator.onLine;
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
  console.warn('🌐 Mode Cloud activé:', provider);
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
  console.warn('🏠 Mode Local activé');
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
