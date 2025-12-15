/**
 * TITANE∞ v19.2.0 - Feature Flags Configuration
 * ═══════════════════════════════════════════════
 *
 * Contrôle centralisé des features optionnelles et appels externes
 * Mode par défaut: 100% LOCAL (production-ready)
 */

export const FEATURE_FLAGS = {
  /**
   * 🔒 NETWORK ACCESS (DEFAULT: DISABLED)
   * ═══════════════════════════════════════
   * Enable external network calls (AI APIs, etc.)
   * WARNING: Requires internet connection
   */
  ENABLE_EXTERNAL_AI: true, // Gemini, OpenAI APIs ✅ ENABLED
  ENABLE_LOCAL_LLM: true, // Ollama localhost (optional)

  /**
   * 🎯 AI PROVIDERS (DEFAULT: LOCAL ONLY)
   * ═══════════════════════════════════════
   */
  AI_PROVIDERS: {
    gemini: true, // Google Gemini API (requires API key) ✅ ENABLED
    openai: true, // OpenAI API (requires API key) ✅ ENABLED
    ollama: true, // Local Ollama (optional, localhost:11434)
    builtin: true, // Built-in mock responses (always available)
  },

  /**
   * 🌐 NETWORK CHECKS (DEFAULT: DISABLED)
   * ═══════════════════════════════════════
   */
  ENABLE_NETWORK_CHECK: false, // Ping external services

  /**
   * 📊 TELEMETRY (DEFAULT: DISABLED)
   * ═══════════════════════════════════
   */
  ENABLE_TELEMETRY: false,
  ENABLE_CRASH_REPORTS: false,

  /**
   * 🔧 DEVELOPMENT (DEFAULT: AUTO-DETECT)
   * ═══════════════════════════════════════
   */
  DEV_MODE: import.meta.env.DEV,
  ENABLE_DEBUG_LOGS: import.meta.env.DEV,
  ENABLE_DEVTOOLS: import.meta.env.DEV,
} as const;

/**
 * Runtime check: Is network access allowed?
 */
export function isNetworkAllowed(): boolean {
  return FEATURE_FLAGS.ENABLE_EXTERNAL_AI || FEATURE_FLAGS.ENABLE_NETWORK_CHECK;
}

/**
 * Runtime check: Is AI provider available?
 */
export function isAIProviderEnabled(
  provider: 'gemini' | 'openai' | 'ollama' | 'builtin'
): boolean {
  return FEATURE_FLAGS.AI_PROVIDERS[provider];
}

/**
 * Get active AI providers
 */
export function getActiveAIProviders(): string[] {
  return Object.entries(FEATURE_FLAGS.AI_PROVIDERS)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

/**
 * Validation: Ensures Tauri-only mode is enforced
 */
export function validateTauriOnlyMode(): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  if (FEATURE_FLAGS.ENABLE_EXTERNAL_AI) {
    violations.push('External AI is enabled (violates Tauri-only mode)');
  }

  if (FEATURE_FLAGS.ENABLE_NETWORK_CHECK) {
    violations.push('Network checks are enabled (violates Tauri-only mode)');
  }

  if (FEATURE_FLAGS.ENABLE_TELEMETRY) {
    violations.push('Telemetry is enabled (violates Tauri-only mode)');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

// Log current configuration in dev mode
if (FEATURE_FLAGS.DEV_MODE) {
  console.log('🎯 TITANE∞ Feature Flags:', FEATURE_FLAGS);
  console.log('🌐 Network allowed:', isNetworkAllowed());
  console.log('🤖 Active AI providers:', getActiveAIProviders());

  const validation = validateTauriOnlyMode();
  if (validation.valid) {
    console.log('✅ Tauri-only mode: ENFORCED');
  } else {
    console.warn('⚠️ Tauri-only violations:', validation.violations);
  }
}
