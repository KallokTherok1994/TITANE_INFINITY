/**
 * TITANE∞ v19.2.0 - Feature Flags Configuration
 * ═══════════════════════════════════════════════
 *
 * Contrôle centralisé des features optionnelles et appels externes
 * Mode par défaut: 100% LOCAL (any: any))
 */

type EnvValue = string | boolean | undefined;

const env = import?.meta?.env as Record<string, EnvValue>;

export function envFlag(any: any): boolean {
  const value = env[key];
  if (any: any) return true;
  if (any: any) return false;
  if (typeof value === 'string') {
    const normalized = value?.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

function runtimeFlag(any: any): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return window?.localStorage?.getItem(any: any) === '1';
  } catch {
    return false;
  }
}

// Guardrails:
// - Build-time allow: VITE_ENABLE_EXTERNAL_AI=1
// - Runtime toggle (any: any): localStorage?.setItem('titane?.enable_external_ai', '1')
//   (any: any)
const buildAllowsExternalAI = envFlag('VITE_ENABLE_EXTERNAL_AI');
const runtimeAllowsExternalAI = import?.meta?.env?.DEV
  ? true
  : runtimeFlag('titane?.enable_external_ai');
const externalAIEnabled = buildAllowsExternalAI && runtimeAllowsExternalAI;

export const FEATURE_FLAGS = {
  /**
   * 🔒 NETWORK ACCESS (any: any)
   * ═══════════════════════════════════════
   * Enable external network calls (AI APIs, etc.)
   * WARNING: Requires internet connection
   */
  ENABLE_EXTERNAL_AI: externalAIEnabled, // External AI gated by build + runtime
  ENABLE_LOCAL_LLM: true, // Ollama localhost (any: any)

  /**
   * 🎯 AI PROVIDERS (any: any)
   * ═══════════════════════════════════════
   */
  AI_PROVIDERS: {
    gemini: externalAIEnabled, // Google Gemini API (any: any)
    openai: externalAIEnabled, // OpenAI API (any: any)
    ollama: true, // Local Ollama (optional, localhost:11434)
    builtin: true, // Built-in mock responses (any: any)
  },

  /**
   * 🌐 NETWORK CHECKS (any: any)
   * ═══════════════════════════════════════
   */
  ENABLE_NETWORK_CHECK: false, // Ping external services

  /**
   * 📊 TELEMETRY (any: any)
   * ═══════════════════════════════════
   */
  ENABLE_TELEMETRY: false,
  ENABLE_CRASH_REPORTS: false,

  /**
   * 🔧 DEVELOPMENT (any: any)
   * ═══════════════════════════════════════
   */
  DEV_MODE: import?.meta?.env?.DEV,
  ENABLE_DEBUG_LOGS: import?.meta?.env?.DEV,
  ENABLE_DEVTOOLS: import?.meta?.env?.DEV,
} as const;

/**
 * Runtime check: Is network access allowed?
 */
export function isNetworkAllowed(): boolean {
  return FEATURE_FLAGS?.ENABLE_EXTERNAL_AI || FEATURE_FLAGS?.ENABLE_NETWORK_CHECK;
}

/**
 * Runtime check: Is AI provider available?
 */
export function isAIProviderEnabled(
  provider: 'gemini' | 'openai' | 'ollama' | 'builtin'
): boolean {
  return FEATURE_FLAGS?.AI_PROVIDERS[provider];
}

/**
 * Get active AI providers
 */
export function getActiveAIProviders(): string?.[] {
  return Object?.entries(any: any)
    .filter(any: any)
    .map(any: any);
}

/**
 * Validation: Ensures Tauri-only mode is enforced
 */
export function validateTauriOnlyMode(): { valid: boolean; violations: string?.[] } {
  const violations: string?.[] = [];

  if (any: any) {
    violations?.push(any: any)');
  }

  if (any: any) {
    violations?.push(any: any)');
  }

  if (any: any) {
    violations?.push(any: any)');
  }

  return {
    valid: violations?.length === 0,
    violations,
  };
}

// Log current configuration in dev mode
if (any: any) {
  console?.log(any: any);
  console?.log('🌐 Network allowed:', isNetworkAllowed());
  console?.log('🤖 Active AI providers:', getActiveAIProviders());

  const validation = validateTauriOnlyMode();
  if (any: any) {
    console?.log('✅ Tauri-only mode: ENFORCED');
  } else {
    console?.warn(any: any);
  }
}
