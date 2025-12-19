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
      url: 'http://localhost:11434',
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        status.provider_enabled = true;
        status.available = true;
        status.models = data.models?.map((m: { name: string }) => m.name) || [];
      }
    } catch {
      // ✅ v24.3.8: Silent fallback - Ollama est optionnel
    }

    setState(prev => ({ ...prev, ollamaStatus: status }));
    return { ok: true, data: status, error: null };
  }, []);

  const setGeminiKey = useCallback(
    async (apiKey: string) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.setGeminiKey(apiKey);

      if (response.ok && response.data) {
        setState(prev => ({ ...prev, geminiStatus: response.data }));
      } else {
        setError(response.error || 'Erreur lors de la configuration de la clé Gemini');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
  );

  const setOpenAIKey = useCallback(
    async (apiKey: string) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.setOpenAIKey(apiKey);

      if (response.ok && response.data) {
        setState(prev => ({ ...prev, openaiStatus: response.data }));
      } else {
        setError(response.error || 'Erreur lors de la configuration de la clé OpenAI');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
  );

  const setAnthropicKey = useCallback(
    async (apiKey: string) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.setAnthropicKey(apiKey);

      if (response.ok && response.data) {
        setState(prev => ({ ...prev, anthropicStatus: response.data }));
      } else {
        setError(response.error || 'Erreur lors de la configuration de la clé Anthropic');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
  );

  const storeSecret = useCallback(
    async (key: string, value: string, purgeEnv = false) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.storeSecret(key, value, purgeEnv);

      if (!response.ok) {
        setError(response.error || 'Erreur lors du stockage du secret');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
  );

  const deleteSecret = useCallback(
    async (key: string) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.deleteSecret(key);

      if (!response.ok) {
        setError(response.error || 'Erreur lors de la suppression du secret');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
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
    async (policyId: string, enabled: boolean) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.togglePolicy(policyId, enabled);

      if (response.ok && response.data) {
        setState(prev => ({
          ...prev,
          policies: prev.policies.map(p => (p.id === policyId ? { ...p, enabled } : p)),
        }));
      } else {
        setError(response.error || 'Erreur lors de la modification de la politique');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
  );

  const createPolicy = useCallback(
    async (policy: Omit<IAPolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.createPolicy(policy);

      if (response.ok && response.data) {
        setState(prev => ({
          ...prev,
          policies: [...prev.policies, response.data ?? ({} as IAPolicy)],
        }));
      } else {
        setError(response.error || 'Erreur lors de la création de la politique');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
  );

  const deletePolicy = useCallback(
    async (policyId: string) => {
      setLoading(true);
      setError(null);

      const response = await governanceService.deletePolicy(policyId);

      if (response.ok) {
        setState(prev => ({
          ...prev,
          policies: prev.policies.filter(p => p.id !== policyId),
        }));
      } else {
        setError(response.error || 'Erreur lors de la suppression de la politique');
      }

      setLoading(false);
      return response;
    },
    [setLoading, setError]
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

  const clearPermissionAudit = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await governanceService.clearPermissionAudit();

    if (response.ok) {
      setState(prev => ({ ...prev, permissionAudit: [] }));
    } else {
      setError(response.error || "Erreur lors de l'effacement de l'audit");
    }

    setLoading(false);
    return response;
  }, [setLoading, setError]);

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
    async (format: 'json' | 'csv') => {
      setLoading(true);
      const response = await governanceService.exportSecurityLog(format);
      setLoading(false);
      return response;
    },
    [setLoading]
  );

  const clearSecurityLog = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await governanceService.clearSecurityLog();

    if (response.ok) {
      setState(prev => ({ ...prev, securityLog: [] }));
    } else {
      setError(response.error || "Erreur lors de l'effacement du journal");
    }

    setLoading(false);
    return response;
  }, [setLoading, setError]);

  // ═══════════════════════════════════════════════════════════════
  // SYSTÈME
  // ═══════════════════════════════════════════════════════════════

  const checkIntegrity = useCallback(async () => {
    setLoading(true);
    const response = await governanceService.checkSystemIntegrity();
    setLoading(false);
    return response;
  }, [setLoading]);

  // ═══════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    await Promise.all([
      loadSecretsStatus(),
      loadGeminiStatus(),
      loadOpenAIStatus(),
      loadAnthropicStatus(),
      loadOllamaStatus(),
      loadPolicies(),
      loadPermissionMatrix(),
      loadPermissionAudit(),
      loadSecurityLog(),
    ]);

    setLoading(false);
  }, [
    loadGeminiStatus,
    loadOpenAIStatus,
    loadAnthropicStatus,
    loadOllamaStatus,
    loadPolicies,
    loadPermissionMatrix,
    loadPermissionAudit,
    loadSecurityLog,
    setLoading,
    setError,
  ]);

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
