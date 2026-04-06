/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   HOOK useGovernance — État et actions du Centre Gouvernance
 *   Gestion centralisée des secrets, politiques, permissions, journal
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { governanceService } from '../services/governanceService';
import type {
  GovernanceState,
  GovernanceTab,
  IAPolicy,
  SecurityLogEntry,
  SecurityLogFilters,
  OllamaStatus,
} from '../types';

/**
 * État initial du centre de gouvernance
 */
const initialState: GovernanceState = {
  secretsStatus: [],
  geminiStatus: null,
  openaiStatus: null,
  anthropicStatus: null,
  copilotStatus: null,
  ollamaStatus: null,
  policies: [],
  permissionMatrix: {},
  permissionAudit: [],
  securityLog: [],
  logFilters: {},
  loading: false,
  error: null,
  activeTab: 'secrets',
};

/**
 * Hook principal pour gérer l'état du Centre Gouvernance & Sécurité
 */
export function useGovernance() {
  const [state, setState] = useState<GovernanceState>(initialState);

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setActiveTab = useCallback((activeTab: GovernanceTab) => {
    setState(prev => ({ ...prev, activeTab }));
  }, []);

  /** Enveloppe une action async : setLoading + setError(null) + finally setLoading(false) */
  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // ═══════════════════════════════════════════════════════════════
  // SECRETS
  // ═══════════════════════════════════════════════════════════════

  const loadSecretsStatus = useCallback(async () => {
    const response = await governanceService.getSecretsStatus();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, secretsStatus: response.data ?? [] }));
    }
    return response;
  }, []);

  const loadGeminiStatus = useCallback(async () => {
    const response = await governanceService.getGeminiStatus();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, geminiStatus: response.data }));
    }
    return response;
  }, []);

  const loadOpenAIStatus = useCallback(async () => {
    const response = await governanceService.getOpenAIStatus();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, openaiStatus: response.data }));
    }
    return response;
  }, []);

  const loadAnthropicStatus = useCallback(async () => {
    const response = await governanceService.getAnthropicStatus();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, anthropicStatus: response.data }));
    }
    return response;
  }, []);

  const loadOllamaStatus = useCallback(async () => {
    // ✅ v24.3.8: Ollama status checked with timeout + silent fallback
    const status: OllamaStatus = {
      provider_enabled: false,
      available: false,
      url: '/api/ollama',
      models: [],
    };

    // Opt-in only: Ollama is an optional local service.
    // This avoids background localhost probes in Tauri unless explicitly enabled.
    const envEnabled = import.meta.env.VITE_OLLAMA_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_ollama_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    if (!envEnabled && !userEnabled) {
      setState(prev => ({ ...prev, ollamaStatus: status }));
      return { ok: true, data: status, error: null };
    }

    try {
      const response = await governanceService.getOllamaStatus();
      if (response.ok && response.data) {
        status.provider_enabled = true;
        status.available = Boolean(response.data.available);
        status.models = response.data.models ?? [];
      }
    } catch {
      // ✅ v24.3.8: Silent fallback - Ollama est optionnel
    }

    setState(prev => ({ ...prev, ollamaStatus: status }));
    return { ok: true, data: status, error: null };
  }, []);

  const setGeminiKey = useCallback(
    (apiKey: string) =>
      withLoading(async () => {
        const r = await governanceService.setGeminiKey(apiKey);
        if (r.ok && r.data) setState(prev => ({ ...prev, geminiStatus: r.data }));
        else setError(r.error || 'Erreur lors de la configuration de la clé Gemini');
        return r;
      }),
    [withLoading, setError]
  );

  const setOpenAIKey = useCallback(
    (apiKey: string) =>
      withLoading(async () => {
        const r = await governanceService.setOpenAIKey(apiKey);
        if (r.ok && r.data) setState(prev => ({ ...prev, openaiStatus: r.data }));
        else setError(r.error || 'Erreur lors de la configuration de la clé OpenAI');
        return r;
      }),
    [withLoading, setError]
  );

  const setAnthropicKey = useCallback(
    (apiKey: string) =>
      withLoading(async () => {
        const r = await governanceService.setAnthropicKey(apiKey);
        if (r.ok && r.data) setState(prev => ({ ...prev, anthropicStatus: r.data }));
        else setError(r.error || 'Erreur lors de la configuration de la clé Anthropic');
        return r;
      }),
    [withLoading, setError]
  );

  const loadCopilotStatus = useCallback(async () => {
    const response = await governanceService.getCopilotStatus();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, copilotStatus: response.data }));
    }
    return response;
  }, []);

  const setCopilotKey = useCallback(
    (apiKey: string) =>
      withLoading(async () => {
        const r = await governanceService.setCopilotKey(apiKey);
        if (r.ok && r.data) setState(prev => ({ ...prev, copilotStatus: r.data }));
        else setError(r.error || 'Erreur lors de la configuration de la clé Copilot');
        return r;
      }),
    [withLoading, setError]
  );

  const storeSecret = useCallback(
    (key: string, value: string, purgeEnv = false) =>
      withLoading(async () => {
        const r = await governanceService.storeSecret(key, value, purgeEnv);
        if (!r.ok) setError(r.error || 'Erreur lors du stockage du secret');
        return r;
      }),
    [withLoading, setError]
  );

  const deleteSecret = useCallback(
    (key: string) =>
      withLoading(async () => {
        const r = await governanceService.deleteSecret(key);
        if (!r.ok) setError(r.error || 'Erreur lors de la suppression du secret');
        return r;
      }),
    [withLoading, setError]
  );

  // ═══════════════════════════════════════════════════════════════
  // POLITIQUES IA
  // ═══════════════════════════════════════════════════════════════

  const loadPolicies = useCallback(async () => {
    const response = await governanceService.getPolicies();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, policies: response.data ?? [] }));
    }
    return response;
  }, []);

  const togglePolicy = useCallback(
    (policyId: string, enabled: boolean) =>
      withLoading(async () => {
        const r = await governanceService.togglePolicy(policyId, enabled);
        if (r.ok && r.data)
          setState(prev => ({
            ...prev,
            policies: prev.policies.map(p => (p.id === policyId ? { ...p, enabled } : p)),
          }));
        else setError(r.error || 'Erreur lors de la modification de la politique');
        return r;
      }),
    [withLoading, setError]
  );

  const createPolicy = useCallback(
    (policy: Omit<IAPolicy, 'id' | 'createdAt' | 'updatedAt'>) =>
      withLoading(async () => {
        const r = await governanceService.createPolicy(policy);
        if (r.ok && r.data)
          setState(prev => ({
            ...prev,
            policies: [...prev.policies, r.data ?? ({} as IAPolicy)],
          }));
        else setError(r.error || 'Erreur lors de la création de la politique');
        return r;
      }),
    [withLoading, setError]
  );

  const deletePolicy = useCallback(
    (policyId: string) =>
      withLoading(async () => {
        const r = await governanceService.deletePolicy(policyId);
        if (r.ok)
          setState(prev => ({
            ...prev,
            policies: prev.policies.filter(p => p.id !== policyId),
          }));
        else setError(r.error || 'Erreur lors de la suppression de la politique');
        return r;
      }),
    [withLoading, setError]
  );

  // ═══════════════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════════════

  const loadPermissionMatrix = useCallback(async () => {
    const response = await governanceService.getPermissionMatrix();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, permissionMatrix: response.data ?? {} }));
    }
    return response;
  }, []);

  const loadPermissionAudit = useCallback(async () => {
    const response = await governanceService.getPermissionAudit();
    if (response.ok && response.data) {
      setState(prev => ({ ...prev, permissionAudit: response.data ?? [] }));
    }
    return response;
  }, []);

  const clearPermissionAudit = useCallback(
    () =>
      withLoading(async () => {
        const r = await governanceService.clearPermissionAudit();
        if (r.ok) setState(prev => ({ ...prev, permissionAudit: [] }));
        else setError(r.error || "Erreur lors de l'effacement de l'audit");
        return r;
      }),
    [withLoading, setError]
  );

  // ═══════════════════════════════════════════════════════════════
  // JOURNAL DE SÉCURITÉ
  // ═══════════════════════════════════════════════════════════════

  const loadSecurityLog = useCallback(async (filters?: SecurityLogFilters) => {
    const response = await governanceService.getSecurityLog(filters);
    if (response.ok && response.data) {
      setState(prev => ({
        ...prev,
        securityLog: response.data ?? [],
        logFilters: filters ?? {},
      }));
    }
    return response;
  }, []);

  const appendSecurityLog = useCallback(
    async (entry: Omit<SecurityLogEntry, 'id' | 'timestamp'>) => {
      const response = await governanceService.appendSecurityLog(entry);
      if (response.ok && response.data) {
        setState(prev => ({
          ...prev,
          securityLog: response.data
            ? [response.data, ...prev.securityLog]
            : prev.securityLog,
        }));
      }
      return response;
    },
    []
  );

  const exportSecurityLog = useCallback(
    (format: 'json' | 'csv') =>
      withLoading(() => governanceService.exportSecurityLog(format)),
    [withLoading]
  );

  const clearSecurityLog = useCallback(
    () =>
      withLoading(async () => {
        const r = await governanceService.clearSecurityLog();
        if (r.ok) setState(prev => ({ ...prev, securityLog: [] }));
        else setError(r.error || "Erreur lors de l'effacement du journal");
        return r;
      }),
    [withLoading, setError]
  );

  // ═══════════════════════════════════════════════════════════════
  // SYSTÈME
  // ═══════════════════════════════════════════════════════════════

  const checkIntegrity = useCallback(
    () => withLoading(() => governanceService.checkSystemIntegrity()),
    [withLoading]
  );

  // ═══════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════

  const refreshAll = useCallback(
    () =>
      withLoading(() =>
        Promise.all([
          loadSecretsStatus(),
          loadGeminiStatus(),
          loadOpenAIStatus(),
          loadAnthropicStatus(),
          loadCopilotStatus(),
          loadOllamaStatus(),
          loadPolicies(),
          loadPermissionMatrix(),
          loadPermissionAudit(),
          loadSecurityLog(),
        ])
      ),
    [
      withLoading,
      loadSecretsStatus,
      loadGeminiStatus,
      loadOpenAIStatus,
      loadAnthropicStatus,
      loadCopilotStatus,
      loadOllamaStatus,
      loadPolicies,
      loadPermissionMatrix,
      loadPermissionAudit,
      loadSecurityLog,
    ]
  );

  // Charger les données au montage
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    // État
    ...state,

    // Actions UI
    setActiveTab,
    setError,

    // Actions Secrets
    loadSecretsStatus,
    loadGeminiStatus,
    setGeminiKey,
    loadOpenAIStatus,
    setOpenAIKey,
    loadAnthropicStatus,
    setAnthropicKey,
    loadCopilotStatus,
    setCopilotKey,
    loadOllamaStatus,
    storeSecret,
    deleteSecret,

    // Actions Politiques
    loadPolicies,
    togglePolicy,
    createPolicy,
    deletePolicy,

    // Actions Permissions
    loadPermissionMatrix,
    loadPermissionAudit,
    clearPermissionAudit,

    // Actions Journal
    loadSecurityLog,
    appendSecurityLog,
    exportSecurityLog,
    clearSecurityLog,

    // Actions Système
    checkIntegrity,
    refreshAll,
  };
}

export default useGovernance;
