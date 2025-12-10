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
} from '../types';

/**
 * État initial du centre de gouvernance
 */
const initialState: GovernanceState = {
  secretsStatus: [],
  geminiStatus: null,
  openaiStatus: null,
  anthropicStatus: null,
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
      loadGeminiStatus(),
      loadOpenAIStatus(),
      loadAnthropicStatus(),
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
    loadGeminiStatus,
    setGeminiKey,
    loadOpenAIStatus,
    setOpenAIKey,
    loadAnthropicStatus,
    setAnthropicKey,
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
