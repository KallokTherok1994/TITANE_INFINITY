// ═══════════════════════════════════════════════════════════════════════════════
// TITANE∞ v∞ - DEVELOPER MODE HOOKS
// OPUS #10 - IA Developer Mode v∞
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react';
import { tauriClient } from '@/lib/tauriClient';
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
      const result = (await tauriClient.devmodeGetState()) as DeveloperModeState;
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
        const success = (await tauriClient.devmodeEnable({
          authToken,
        })) as boolean;
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
      const success = (await tauriClient.devmodeDisable()) as boolean;
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
        const result = (await tauriClient.devmodeValidatePatch({
          patch,
        })) as PatchResult;
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
        const result = (await tauriClient.devmodeApplyPatch({
          patch,
        })) as PatchResult;
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
        const result = (await tauriClient.devmodePreview({
          patch,
        })) as DiffPreview;
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
      const success = (await tauriClient.devmodeRollback({
        patchId,
      })) as boolean;
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
      const result = (await tauriClient.devmodeGetHistory({
        limit,
      })) as PatchHistory;
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
      const backupId = (await tauriClient.devmodeCreateBackup({
        name,
      })) as string;
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
      const success = (await tauriClient.devmodeRestoreBackup({
        backupId,
      })) as boolean;
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
      const result = (await tauriClient.devmodeAnalyzeFile({
        filePath,
      })) as CodeSuggestion[];
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
        const buildId = (await tauriClient.enginesBuildStart({ config })) as string;
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
      const result = (await tauriClient.enginesBuildGetStatus({
        buildId,
      })) as BuildStatus;
      setStatus(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status fetch failed');
    }
  }, []);

  const getResult = useCallback(async (buildId: string) => {
    try {
      const res = (await tauriClient.enginesBuildGetResult({
        buildId,
      })) as BuildResult;
      setResult(res);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Result fetch failed');
    }
  }, []);

  const cancelBuild = useCallback(async (buildId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const success = (await tauriClient.enginesBuildCancel({ buildId })) as boolean;
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
      const success = (await tauriClient.enginesBuildClean()) as boolean;
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
      const result = (await tauriClient.enginesGetDashboard()) as UnifiedEnginesDashboard;
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
      const result = (await tauriClient.devmodeChangelog({ since })) as string;
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
