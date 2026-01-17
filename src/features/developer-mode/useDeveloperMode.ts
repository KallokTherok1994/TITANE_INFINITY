// ═══════════════════════════════════════════════════════════════════════════════
// TITANE∞ v∞ - DEVELOPER MODE HOOKS
// OPUS #10 - IA Developer Mode v∞
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import type {
  DeveloperModeState,
  PatchAction,
  PatchResult,
  PatchHistory,
  DiffPreview,
  BuildStatus,
  BuildResult,
  CodeSuggestion,
  UnifiedEnginesDashboard,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useDeveloperMode() {
  const [state, setState] = useState<DeveloperModeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const result = await secureInvoke<DeveloperModeState>('engines_devmode_get_state');
      setState(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch state');
    } finally {
      setLoading(false);
    }
  }, []);

  const enable = useCallback(
    async (authToken: string) => {
      try {
        const success = await secureInvoke<boolean>('engines_devmode_enable', {
          authToken,
        });
        if (success) {
          await fetchState();
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to enable');
        return false;
      }
    },
    [fetchState]
  );

  const disable = useCallback(async () => {
    try {
      const success = await secureInvoke<boolean>('engines_devmode_disable');
      if (success) {
        await fetchState();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable');
      return false;
    }
  }, [fetchState]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  return { state, loading, error, fetchState, enable, disable };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH OPERATIONS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function usePatchOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePatch = useCallback(
    async (patch: PatchAction): Promise<PatchResult | null> => {
      try {
        setLoading(true);
        const result = await secureInvoke<PatchResult>('engines_devmode_validate_patch', {
          patch,
        });
        setError(null);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Validation failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const applyPatch = useCallback(
    async (patch: PatchAction): Promise<PatchResult | null> => {
      try {
        setLoading(true);
        const result = await secureInvoke<PatchResult>('engines_devmode_apply_patch', {
          patch,
        });
        setError(null);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Apply failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const previewChanges = useCallback(
    async (patch: PatchAction): Promise<DiffPreview | null> => {
      try {
        setLoading(true);
        const result = await secureInvoke<DiffPreview>('engines_devmode_preview', {
          patch,
        });
        setError(null);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Preview failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rollback = useCallback(async (patchId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await secureInvoke<boolean>('engines_devmode_rollback', {
        patchId,
      });
      setError(null);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, validatePatch, applyPatch, previewChanges, rollback };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function usePatchHistory() {
  const [history, setHistory] = useState<PatchHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (limit?: number) => {
    try {
      setLoading(true);
      const result = await secureInvoke<PatchHistory>('engines_devmode_get_history', {
        limit,
      });
      setHistory(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, fetchHistory };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BACKUP OPERATIONS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useBackupOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBackup = useCallback(async (name: string): Promise<string | null> => {
    try {
      setLoading(true);
      const backupId = await secureInvoke<string>('engines_devmode_create_backup', {
        name,
      });
      setError(null);
      return backupId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Backup failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreBackup = useCallback(async (backupId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await secureInvoke<boolean>('engines_devmode_restore_backup', {
        backupId,
      });
      setError(null);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, createBackup, restoreBackup };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE ANALYSIS HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useFileAnalysis() {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = useCallback(async (filePath: string) => {
    try {
      setLoading(true);
      const result = await secureInvoke<CodeSuggestion[]>(
        'engines_devmode_analyze_file',
        { filePath }
      );
      setSuggestions(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { suggestions, loading, error, analyzeFile };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD PIPELINE HOOK (OPUS #9)
// ═══════════════════════════════════════════════════════════════════════════════

export function useBuildPipeline() {
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startBuild = useCallback(
    async (config?: Record<string, unknown>): Promise<string | null> => {
      try {
        setLoading(true);
        const buildId = await secureInvoke<string>('engines_build_start', { config });
        setError(null);
        return buildId;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Build start failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getStatus = useCallback(async (buildId: string) => {
    try {
      const result = await secureInvoke<BuildStatus>('engines_build_get_status', {
        buildId,
      });
      setStatus(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status fetch failed');
    }
  }, []);

  const getResult = useCallback(async (buildId: string) => {
    try {
      const res = await secureInvoke<BuildResult>('engines_build_get_result', {
        buildId,
      });
      setResult(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Result fetch failed');
    }
  }, []);

  const cancelBuild = useCallback(async (buildId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await secureInvoke<boolean>('engines_build_cancel', { buildId });
      setError(null);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanArtifacts = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await secureInvoke<boolean>('engines_build_clean');
      setError(null);
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clean failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    result,
    loading,
    error,
    startBuild,
    getStatus,
    getResult,
    cancelBuild,
    cleanArtifacts,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED ENGINES DASHBOARD HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useEnginesDashboard() {
  const [dashboard, setDashboard] = useState<UnifiedEnginesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const result = await secureInvoke<UnifiedEnginesDashboard>('engines_get_dashboard');
      setDashboard(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dashboard fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return { dashboard, loading, error, fetchDashboard };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHANGELOG HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useChangelog() {
  const [changelog, setChangelog] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChangelog = useCallback(async (since?: string) => {
    try {
      setLoading(true);
      const result = await secureInvoke<string>('engines_devmode_changelog', { since });
      setChangelog(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Changelog generation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { changelog, loading, error, generateChangelog };
}
