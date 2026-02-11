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
  // ✅ AUDIT FIX #2: All Ollama calls go through Tauri command (not direct HTTP)
  // Use invoke('ollama_generate') instead of direct HTTP
  // Keeping this for reference only — DO NOT USE directly
  // ollama: 'http://localhost:11434',  // ❌ DEPRECATED

  // Local endpoints (toujours disponibles)
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
 * Utilise Tauri HTTP client pour conformité sécurité
 */
export async function checkInternetConnection(): Promise<boolean> {
  try {
    // Import dynamique pour éviter erreur si httpClient pas disponible
    const { httpClient } = await import('../core/http/httpClient');

    await httpClient.head('https://www.google.com/favicon.ico', {
      timeout: 5000,
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
