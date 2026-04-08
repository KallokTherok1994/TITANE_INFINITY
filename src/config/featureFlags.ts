/**
 * TITANE∞ v30.0.0 - Feature Flags Configuration
 * ═══════════════════════════════════════════════
 *
 * Contrôle centralisé des features optionnelles et appels externes
 * Mode par défaut: AUTO ONLINE (providers externes activables immédiatement)
 */

type EnvValue = string | boolean | undefined;

const env = import.meta.env as Record<string, EnvValue>;

export function envFlag(key: string): boolean {
  const value = env[key];
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

function envFlagDefaultTrue(key: string): boolean {
  const value = env[key];
  if (typeof value === 'undefined') {
    return true;
  }
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === '0' ||
      normalized === 'false' ||
      normalized === 'no' ||
      normalized === 'off'
    ) {
      return false;
    }
    if (
      normalized === '1' ||
      normalized === 'true' ||
      normalized === 'yes' ||
      normalized === 'on'
    ) {
      return true;
    }
  }
  return true;
}

function runtimeFlag(key: string): boolean {
  try {
    if (typeof window === 'undefined') return true;
    const value = window.localStorage.getItem(key);
    if (value === null) {
      return true;
    }
    return value === '1';
  } catch {
    return true;
  }
}

// Guardrails:
// - Build-time default: enabled (online-first)
// - Build-time opt-out: VITE_ENABLE_EXTERNAL_AI=0
// - Runtime toggle (no rebuild): localStorage.setItem('titane.enable_external_ai', '1')
const buildAllowsExternalAI = envFlagDefaultTrue('VITE_ENABLE_EXTERNAL_AI');
const runtimeAllowsExternalAI = import.meta.env.DEV
  ? true
  : runtimeFlag('titane.enable_external_ai');
const externalAIEnabled = buildAllowsExternalAI && runtimeAllowsExternalAI;

export const FEATURE_FLAGS = {
  /**
   * 🔒 NETWORK ACCESS (DEFAULT: ENABLED)
   * ═══════════════════════════════════════
   * Enable external network calls (AI APIs, etc.)
   * WARNING: Requires internet connection
   */
  ENABLE_EXTERNAL_AI: externalAIEnabled, // External AI gated by build + runtime
  ENABLE_LOCAL_LLM: true, // Ollama via proxy (optional)

  /**
   * 🎯 AI PROVIDERS (DEFAULT: AUTO ONLINE)
   * ═══════════════════════════════════════
   */
  AI_PROVIDERS: {
    gemini: externalAIEnabled, // Google Gemini API (requires API key)
    openai: externalAIEnabled, // OpenAI API (requires API key)
    ollama: true, // Local Ollama via proxy (optional)
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
