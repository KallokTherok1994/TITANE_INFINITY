/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — Secure Secrets Utilities
 * Frontend bridge for secure Tauri commands managing API keys
 * ═══════════════════════════════════════════════════════════════
 */

import { safeInvoke } from '@/utils/invoke';

interface FallbackResponse {
  fallback?: boolean;
  error?: string;
  message?: string;
}

const FALLBACK_ERROR_MESSAGE =
  'Tauri backend indisponible : SecureSecrets en mode hors-ligne.';

const normalizeSecureResponse = <T>(
  raw: unknown,
  defaultError = FALLBACK_ERROR_MESSAGE
): SecureResponse<T> => {
  if (!raw || typeof raw !== 'object') {
    return {
      ok: false,
      data: null,
      error: defaultError,
    };
  }

  const payload = raw as SecureResponse<T> & FallbackResponse;

  if (payload.fallback) {
    return {
      ok: false,
      data: null,
      error: payload.error ?? payload.message ?? defaultError,
    };
  }

  if (typeof payload.ok === 'boolean') {
    return payload;
  }

  return {
    ok: false,
    data: null,
    error: defaultError,
  };
};

export interface SecureResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

export interface GeminiKeyStatus {
  configured: boolean;
  provider_enabled: boolean;
  masked_key: string | null;
  env_present: boolean;
  env_purged: boolean;
  was_updated: boolean;
}

export interface SecureSecretOperation {
  key: string;
  stored: boolean;
  env_purged: boolean;
}

export interface SecureSecretRequestPayload {
  key: string;
  value: string;
  purge_env?: boolean;
  env_variable?: string;
}

/**
 * Request secure backend to persist the Gemini API key via SecureSecretsEngine.
 */
export async function setGeminiApiKey(
  apiKey: string
): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_gemini_key', { api_key: apiKey });
  return normalizeSecureResponse<GeminiKeyStatus>(
    raw,
    'Impossible de sécuriser la clé Gemini (runtime indisponible).'
  );
}

/**
 * Fetch the current Gemini API key status (masked response).
 */
export async function getGeminiKeyStatus(): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_gemini_key_status');
  return normalizeSecureResponse<GeminiKeyStatus>(
    raw,
    'Statut SecureSecrets indisponible (runtime requis).'
  );
}

/**
 * Request secure backend to persist the OpenAI API key via SecureSecretsEngine.
 */
export async function setOpenAIApiKey(
  apiKey: string
): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_openai_key', { api_key: apiKey });
  return normalizeSecureResponse<GeminiKeyStatus>(
    raw,
    'Impossible de sécuriser la clé OpenAI (runtime indisponible).'
  );
}

/**
 * Fetch the current OpenAI API key status (masked response).
 */
export async function getOpenAIKeyStatus(): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_openai_key_status');
  return normalizeSecureResponse<GeminiKeyStatus>(
    raw,
    'Statut OpenAI indisponible (runtime requis).'
  );
}

/**
 * Request secure backend to persist the Anthropic API key via SecureSecretsEngine.
 */
export async function setAnthropicApiKey(
  apiKey: string
): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_anthropic_key', { api_key: apiKey });
  return normalizeSecureResponse<GeminiKeyStatus>(
    raw,
    'Impossible de sécuriser la clé Anthropic (runtime indisponible).'
  );
}

/**
 * Fetch the current Anthropic API key status (masked response).
 */
export async function getAnthropicKeyStatus(): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_anthropic_key_status');
  return normalizeSecureResponse<GeminiKeyStatus>(
    raw,
    'Statut Anthropic indisponible (runtime requis).'
  );
}

/**
 * Persist an arbitrary secret using the SecureSecretsEngine backend.
 */
export async function secureStoreSecret(
  payload: SecureSecretRequestPayload
): Promise<SecureResponse<SecureSecretOperation>> {
  const raw = await safeInvoke<unknown>(
    'secure_store_secret',
    payload as unknown as Record<string, unknown>
  );
  return normalizeSecureResponse<SecureSecretOperation>(
    raw,
    'Impossible de stocker le secret sécurisé.'
  );
}

/**
 * Mask a raw secret for UI display while keeping the last N characters visible.
 */
export function maskSecret(secret: string, visibleChars = 4): string {
  if (!secret) {
    return '';
  }

  const normalizedVisible = Math.max(0, Math.min(visibleChars, secret.length));
  const hiddenLength = secret.length - normalizedVisible;
  const hidden = hiddenLength > 0 ? '•'.repeat(hiddenLength) : '';
  const visible = secret.slice(-normalizedVisible);
  return `${hidden}${visible}`;
}

/**
 * Lightweight guard that ensures the response object is successful and contains data.
 */
export function hasSecureData<T>(
  response: SecureResponse<T> | null | undefined
): response is SecureResponse<T> & { data: T } {
  return Boolean(response && response.ok && response.data);
}
