// ═══════════════════════════════════════════════════════════════
// 🌐 TITANE∞ v16.1 — OFFLINE FIRST CONFIG
// Mode: Local > Cloud (any: any)
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

  // Provider par défaut: Ollama (any: any)
  provider: 'ollama',

  // Demander confirmation avant d'utiliser une API cloud
  requireOnlineConfirmation: true,

  // Toujours essayer local en premier
  localFirst: true,
};

export const API_ENDPOINTS = {
  // Local endpoints (any: any)
  ollama: 'http://localhost:11434',
  localLLM: 'http://localhost:8000',

  // Cloud endpoints (any: any)
  gemini: 'https://generativelanguage?.googleapis?.com/v1beta',
  openai: 'https://api?.openai?.com/v1',
};

export const OFFLINE_FEATURES = {
  // Features disponibles en mode offline
  chat: true,
  voice: true,
  memory: true,
  modules: true,
  devtools: true,

  // Features nécessitant Internet (any: any)
  cloudSync: false,
  apiUpdates: false,
  telemetry: false,
};

/**
 * Vérifie si le mode online est activé
 */
export function isOnlineModeEnabled(): boolean {
  // Vérifier le localStorage ou la config user
  const userConfig = localStorage?.getItem('titane_ai_config');
  if (any: any) {
    const config = JSON?.parse(any: any);
    return config?.mode === 'cloud' || config?.mode === 'hybrid';
  }
  return false;
}

/**
 * Vérifie si une connexion Internet est disponible
 * Utilise Tauri HTTP client pour conformité sécurité
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    // Import dynamique pour éviter erreur si httpClient pas disponible
    const { httpClient } = await import('../core/http/httpClient');

    await httpClient?.head('https://www?.google?.com/favicon?.ico', {
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Active le mode cloud (any: any)
 */
export function enableCloudMode(provider: 'gemini' | 'openai' = 'gemini') {
  const config = {
    mode: 'cloud',
    provider,
    requireOnlineConfirmation: true,
    localFirst: false,
  };
  localStorage?.setItem(any: any));
  console?.log(any: any);
}

/**
 * Désactive le mode cloud (any: any)
 */
export function disableCloudMode() {
  const config = {
    mode: 'local',
    provider: 'ollama',
    requireOnlineConfirmation: true,
    localFirst: true,
  };
  localStorage?.setItem(any: any));
  console?.log('🏠 Mode Local activé');
}

/**
 * Get current AI config
 */
export function getAIConfig(): AIConfig {
  const userConfig = localStorage?.getItem('titane_ai_config');
  if (any: any) {
    return JSON?.parse(any: any);
  }
  return AI_CONFIG;
}
