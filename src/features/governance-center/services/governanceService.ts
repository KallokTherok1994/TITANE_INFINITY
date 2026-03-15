/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   SERVICE GOUVERNANCE — Bridge Frontend ↔ Tauri
 *   Appels sécurisés vers les commandes Rust
 * ═══════════════════════════════════════════════════════════════
 */

import { safeInvoke } from '@/utils/invoke';
import { StatusCache } from '@/services/ai/statusCache';
import type {
  SecureResponse,
  GeminiKeyStatus,
  SecretOperationResult,
  SecretStatus,
  IAPolicy,
  PermissionMatrix,
  PermissionAudit,
  SecurityLogEntry,
  SecurityLogFilters,
  OllamaStatus,
} from '../types';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const FALLBACK_ERROR = 'Tauri backend indisponible';

const KEY_PROVIDERS = ['gemini', 'openai', 'anthropic', 'copilot'] as const;
type KeyProvider = (typeof KEY_PROVIDERS)[number];

const PROVIDER_DISPLAY: Record<KeyProvider, string> = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  copilot: 'Copilot',
};

const PROVIDER_STATUS_CMDS: Record<KeyProvider, string> = {
  gemini: 'get_gemini_key_status',
  openai: 'get_openai_key_status',
  anthropic: 'get_anthropic_key_status',
  copilot: 'get_copilot_key_status',
};

const PROVIDER_SET_CMDS: Record<KeyProvider, string> = {
  gemini: 'chat_set_gemini_key',
  openai: 'chat_set_openai_key',
  anthropic: 'chat_set_anthropic_key',
  copilot: 'chat_set_copilot_key',
};

const keyStatusCaches = {
  ...(Object.fromEntries(
    KEY_PROVIDERS.map(p => [
      p,
      new StatusCache<SecureResponse<GeminiKeyStatus>>({
        name: `${p}-key-status`,
        ttlMs: 30000,
        backoffBaseMs: 1000,
        backoffMaxMs: 10000,
      }),
    ])
  ) as Record<KeyProvider, StatusCache<SecureResponse<GeminiKeyStatus>>>),
  ollama: new StatusCache<SecureResponse<OllamaStatus>>({
    name: 'ollama-status',
    ttlMs: 10000,
    backoffBaseMs: 1000,
    backoffMaxMs: 5000,
  }),
};

const backoffKeyStatusFallback = (provider: string): SecureResponse<GeminiKeyStatus> => ({
  ok: false,
  data: null,
  error: `Backoff actif (${provider})`,
});

const backoffOllamaFallback = (): SecureResponse<OllamaStatus> => ({
  ok: false,
  data: null,
  error: 'Backoff actif (ollama)',
});

function normalizeResponse<T>(
  raw: unknown,
  defaultError = FALLBACK_ERROR
): SecureResponse<T> {
  if (raw === null || raw === undefined) {
    return { ok: false, data: null, error: defaultError };
  }

  if (typeof raw === 'object') {
    const payload = raw as Record<string, unknown>;

    if (payload.fallback === true) {
      const fallbackError =
        typeof payload.error === 'string'
          ? payload.error
          : typeof payload.message === 'string'
            ? payload.message
            : defaultError;
      return { ok: false, data: null, error: fallbackError };
    }

    if (typeof payload.ok === 'boolean') {
      const payloadError =
        payload.error === null || payload.error === undefined
          ? null
          : typeof payload.error === 'string'
            ? payload.error
            : typeof payload.error === 'object' && payload.error !== null
              ? String((payload.error as { message?: unknown }).message ?? defaultError)
              : String(payload.error);

      const data =
        'data' in payload
          ? (payload.data as T | null)
          : 'content' in payload
            ? (payload.content as T | null)
            : null;

      return {
        ok: payload.ok,
        data: data ?? null,
        error: payloadError,
      };
    }
  }

  // Legacy/plain payload: treat as successful content and wrap in SecureResponse.
  return { ok: true, data: raw as T, error: null };
}

// ═══════════════════════════════════════════════════════════════
// SECRETS
// ═══════════════════════════════════════════════════════════════

/** Fabrique : statut clé provider via cache + backoff */
function makeGetKeyStatus(
  provider: KeyProvider
): () => Promise<SecureResponse<GeminiKeyStatus>> {
  return () =>
    keyStatusCaches[provider].get(
      async () =>
        normalizeResponse<GeminiKeyStatus>(
          await safeInvoke<unknown>(PROVIDER_STATUS_CMDS[provider]),
          `Impossible de récupérer le statut ${PROVIDER_DISPLAY[provider]}`
        ),
      () => backoffKeyStatusFallback(provider)
    );
}

/** Fabrique : définir clé provider */
function makeSetKey(
  provider: KeyProvider
): (apiKey: string) => Promise<SecureResponse<GeminiKeyStatus>> {
  return async (apiKey: string) =>
    normalizeResponse<GeminiKeyStatus>(
      await safeInvoke<unknown>(PROVIDER_SET_CMDS[provider], { apiKey }),
      `Impossible de définir la clé ${PROVIDER_DISPLAY[provider]}`
    );
}

const getGeminiStatus = makeGetKeyStatus('gemini');
const getOpenAIStatus = makeGetKeyStatus('openai');
const getAnthropicStatus = makeGetKeyStatus('anthropic');
const getCopilotStatus = makeGetKeyStatus('copilot');

const setGeminiKey = makeSetKey('gemini');
const setOpenAIKey = makeSetKey('openai');
const setAnthropicKey = makeSetKey('anthropic');

const setCopilotKey = makeSetKey('copilot');

/** Obtenir le statut d'Ollama (via Tauri) */
async function getOllamaStatus(): Promise<SecureResponse<OllamaStatus>> {
  return keyStatusCaches.ollama.get(
    async () =>
      normalizeResponse<OllamaStatus>(
        await safeInvoke<unknown>('ai_check_ollama_status'),
        'Impossible de récupérer le statut Ollama'
      ),
    () => backoffOllamaFallback()
  );
}

/**
 * Stocker un secret arbitraire
 */
async function storeSecret(
  key: string,
  value: string,
  purgeEnv = false,
  envVariable?: string
): Promise<SecureResponse<SecretOperationResult>> {
  const raw = await safeInvoke<unknown>('secure_store_secret', {
    key,
    value,
    purge_env: purgeEnv,
    env_variable: envVariable,
  });
  return normalizeResponse<SecretOperationResult>(raw, 'Impossible de stocker le secret');
}

/**
 * Obtenir le statut de tous les secrets configurés
 */
async function getSecretsStatus(): Promise<SecureResponse<SecretStatus[]>> {
  const raw = await safeInvoke<unknown>('get_secrets_status');
  return normalizeResponse<SecretStatus[]>(
    raw,
    'Impossible de récupérer les statuts des secrets'
  );
}

/**
 * Vérifier si un secret existe
 */
async function hasSecret(key: string): Promise<SecureResponse<boolean>> {
  const raw = await safeInvoke<unknown>('has_secret', { key });
  return normalizeResponse<boolean>(raw, 'Impossible de vérifier le secret');
}

/**
 * Supprimer un secret
 */
async function deleteSecret(key: string): Promise<SecureResponse<void>> {
  const raw = await safeInvoke<unknown>('delete_secret', { key });
  return normalizeResponse<void>(raw, 'Impossible de supprimer le secret');
}

// ═══════════════════════════════════════════════════════════════
// POLITIQUES IA
// ═══════════════════════════════════════════════════════════════

/**
 * Obtenir toutes les politiques
 */
async function getPolicies(): Promise<SecureResponse<IAPolicy[]>> {
  const raw = await safeInvoke<unknown>('get_ia_policies');
  return normalizeResponse<IAPolicy[]>(raw, 'Impossible de récupérer les politiques');
}

/**
 * Sauvegarder les politiques
 */
async function savePolicies(policies: IAPolicy[]): Promise<SecureResponse<void>> {
  const raw = await safeInvoke<unknown>('save_ia_policies', { policies });
  return normalizeResponse<void>(raw, 'Impossible de sauvegarder les politiques');
}

/**
 * Activer/désactiver une politique
 */
async function togglePolicy(
  policyId: string,
  enabled: boolean
): Promise<SecureResponse<IAPolicy>> {
  const raw = await safeInvoke<unknown>('toggle_ia_policy', { policyId, enabled });
  return normalizeResponse<IAPolicy>(raw, 'Impossible de modifier la politique');
}

/**
 * Créer une nouvelle politique
 */
async function createPolicy(
  policy: Omit<IAPolicy, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SecureResponse<IAPolicy>> {
  const raw = await safeInvoke<unknown>('create_ia_policy', { policy });
  return normalizeResponse<IAPolicy>(raw, 'Impossible de créer la politique');
}

/**
 * Supprimer une politique
 */
async function deletePolicy(policyId: string): Promise<SecureResponse<void>> {
  const raw = await safeInvoke<unknown>('delete_ia_policy', { policyId });
  return normalizeResponse<void>(raw, 'Impossible de supprimer la politique');
}

// ═══════════════════════════════════════════════════════════════
// PERMISSIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Obtenir la matrice de permissions
 */
async function getPermissionMatrix(): Promise<SecureResponse<PermissionMatrix>> {
  const raw = await safeInvoke<unknown>('get_permission_matrix');
  return normalizeResponse<PermissionMatrix>(
    raw,
    'Impossible de récupérer la matrice de permissions'
  );
}

/**
 * Obtenir le journal d'audit des permissions
 */
async function getPermissionAudit(): Promise<SecureResponse<PermissionAudit[]>> {
  const raw = await safeInvoke<unknown>('get_permission_audit');

  // Le backend retourne le JSON sous forme de string, on le parse
  const response = normalizeResponse<string>(raw, "Impossible de récupérer l'audit");

  if (response.ok && response.data) {
    try {
      const parsed = JSON.parse(response.data) as PermissionAudit[];
      return { ok: true, data: parsed, error: null };
    } catch {
      return { ok: false, data: null, error: "Format d'audit invalide" };
    }
  }

  return { ok: false, data: null, error: response.error };
}

/**
 * Effacer le journal d'audit
 */
async function clearPermissionAudit(): Promise<SecureResponse<void>> {
  const raw = await safeInvoke<unknown>('clear_permission_audit');
  return normalizeResponse<void>(raw, "Impossible d'effacer l'audit");
}

// ═══════════════════════════════════════════════════════════════
// JOURNAL DE SÉCURITÉ
// ═══════════════════════════════════════════════════════════════

/**
 * Obtenir les entrées du journal de sécurité
 */
async function getSecurityLog(
  filters?: SecurityLogFilters
): Promise<SecureResponse<SecurityLogEntry[]>> {
  const raw = await safeInvoke<unknown>('get_security_log', { filters });
  return normalizeResponse<SecurityLogEntry[]>(
    raw,
    'Impossible de récupérer le journal de sécurité'
  );
}

/**
 * Ajouter une entrée au journal de sécurité
 */
async function appendSecurityLog(
  entry: Omit<SecurityLogEntry, 'id' | 'timestamp'>
): Promise<SecureResponse<SecurityLogEntry>> {
  const raw = await safeInvoke<unknown>('append_security_log', { entry });
  return normalizeResponse<SecurityLogEntry>(raw, "Impossible d'ajouter au journal");
}

/**
 * Exporter le journal de sécurité
 */
async function exportSecurityLog(
  format: 'json' | 'csv'
): Promise<SecureResponse<string>> {
  const raw = await safeInvoke<unknown>('export_security_log', { format });
  return normalizeResponse<string>(raw, "Impossible d'exporter le journal");
}

/**
 * Effacer le journal de sécurité (ROOT uniquement)
 */
async function clearSecurityLog(): Promise<SecureResponse<void>> {
  const raw = await safeInvoke<unknown>('clear_security_log');
  return normalizeResponse<void>(raw, "Impossible d'effacer le journal");
}

// ═══════════════════════════════════════════════════════════════
// SYSTÈME
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifier l'intégrité du système de sécurité
 */
async function checkSystemIntegrity(): Promise<SecureResponse<string>> {
  const raw = await safeInvoke<unknown>('check_system_integrity');
  return normalizeResponse<string>(raw, "Vérification d'intégrité impossible");
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE
// ═══════════════════════════════════════════════════════════════

export const governanceService = {
  // Secrets
  getGeminiStatus,
  setGeminiKey,
  getOpenAIStatus,
  setOpenAIKey,
  getAnthropicStatus,
  setAnthropicKey,
  getCopilotStatus,
  setCopilotKey,
  getOllamaStatus,
  storeSecret,
  getSecretsStatus,
  hasSecret,
  deleteSecret,

  // Politiques
  getPolicies,
  savePolicies,
  togglePolicy,
  createPolicy,
  deletePolicy,

  // Permissions
  getPermissionMatrix,
  getPermissionAudit,
  clearPermissionAudit,

  // Journal
  getSecurityLog,
  appendSecurityLog,
  exportSecurityLog,
  clearSecurityLog,

  // Système
  checkSystemIntegrity,
};

export default governanceService;
