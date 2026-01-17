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
import type {
  SecureResponse,
  GeminiKeyStatus,
  CopilotKeyStatus,
  SecretOperationResult,
  SecretStatus,
  IAPolicy,
  PermissionMatrix,
  PermissionAudit,
  SecurityLogEntry,
  SecurityLogFilters,
} from '../types';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const FALLBACK_ERROR = 'Tauri backend indisponible';

function normalizeResponse<T>(
  raw: unknown,
  defaultError = FALLBACK_ERROR
): SecureResponse<T> {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, data: null, error: defaultError };
  }

  const payload = raw as SecureResponse<T> & { fallback?: boolean; message?: string };

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

  return { ok: false, data: null, error: defaultError };
}

function normalizeDirectResponse<T>(
  raw: unknown,
  defaultError = FALLBACK_ERROR
): SecureResponse<T> {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, data: null, error: defaultError };
  }

  const payload = raw as { fallback?: boolean; error?: string | null; message?: string };
  if (payload.fallback) {
    return {
      ok: false,
      data: null,
      error: payload.error ?? payload.message ?? defaultError,
    };
  }

  return { ok: true, data: raw as T, error: null };
}

// ═══════════════════════════════════════════════════════════════
// SECRETS
// ═══════════════════════════════════════════════════════════════

/**
 * Obtenir le statut de la clé Gemini
 */
async function getGeminiStatus(): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_gemini_key_status');
  return normalizeResponse<GeminiKeyStatus>(
    raw,
    'Impossible de récupérer le statut Gemini'
  );
}

/**
 * Définir la clé Gemini
 */
async function setGeminiKey(apiKey: string): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_gemini_key', { api_key: apiKey });
  return normalizeResponse<GeminiKeyStatus>(raw, 'Impossible de définir la clé Gemini');
}

/**
 * Obtenir le statut de la clé OpenAI
 */
async function getOpenAIStatus(): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_openai_key_status');
  return normalizeResponse<GeminiKeyStatus>(
    raw,
    'Impossible de récupérer le statut OpenAI'
  );
}

/**
 * Définir la clé OpenAI
 */
async function setOpenAIKey(apiKey: string): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_openai_key', { api_key: apiKey });
  return normalizeResponse<GeminiKeyStatus>(raw, 'Impossible de définir la clé OpenAI');
}

/**
 * Obtenir le statut de la clé Anthropic
 */
async function getAnthropicStatus(): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_anthropic_key_status');
  return normalizeResponse<GeminiKeyStatus>(
    raw,
    'Impossible de récupérer le statut Anthropic'
  );
}

/**
 * Définir la clé Anthropic
 */
async function setAnthropicKey(apiKey: string): Promise<SecureResponse<GeminiKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_anthropic_key', { api_key: apiKey });
  return normalizeResponse<GeminiKeyStatus>(
    raw,
    'Impossible de définir la clé Anthropic'
  );
}

/**
 * Obtenir le statut de la clé GitHub Copilot
 */
async function getCopilotStatus(): Promise<SecureResponse<CopilotKeyStatus>> {
  const raw = await safeInvoke<unknown>('get_copilot_key_status');
  return normalizeDirectResponse<CopilotKeyStatus>(
    raw,
    'Impossible de récupérer le statut Copilot'
  );
}

/**
 * Définir la clé GitHub Copilot
 */
async function setCopilotKey(apiKey: string): Promise<SecureResponse<CopilotKeyStatus>> {
  const raw = await safeInvoke<unknown>('chat_set_copilot_key', { api_key: apiKey });
  return normalizeDirectResponse<CopilotKeyStatus>(
    raw,
    'Impossible de définir la clé Copilot'
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
