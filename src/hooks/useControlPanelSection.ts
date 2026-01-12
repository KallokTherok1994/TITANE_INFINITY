/**
 * TITANE∞ v26.3.0 - useControlPanelSection Hook
 * Generic hook for control panel sections with Tauri IPC
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

export interface UseControlPanelSectionOptions<T> {
  loadCommand: string;
  saveCommand: string;
  defaultConfig: T;
  saveParamKey?: string;
}

export interface UseControlPanelSectionReturn<T> {
  config: T;
  setConfig: React.Dispatch<React.SetStateAction<T>>;
  saveConfig: () => Promise<void>;
  reloadConfig: () => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  saved: boolean;
  error: string | null;
  hasChanges: boolean;
}

export function useControlPanelSection<T>({
  loadCommand,
  saveCommand,
  defaultConfig,
  saveParamKey = 'config',
}: UseControlPanelSectionOptions<T>): UseControlPanelSectionReturn<T> {
  const [config, setConfig] = useState<T>(defaultConfig);
  const [originalConfig, setOriginalConfig] = useState<T>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if config has changes
  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  // Load config from backend
  const reloadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await secureInvoke<T>(loadCommand);
      setConfig(result);
      setOriginalConfig(result);
    } catch (err) {
      logger.error(`[useControlPanelSection] Load error:`, err);
      setError(err instanceof Error ? err.message : String(err));
      // Use defaults on error
      setConfig(defaultConfig);
      setOriginalConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, [loadCommand, defaultConfig]);

  // Save config to backend
  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      await secureInvoke(saveCommand, { [saveParamKey]: config });
      setOriginalConfig(config);
      setSaved(true);

      // Clear saved indicator after 3s
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      logger.error(`[useControlPanelSection] Save error:`, err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  }, [saveCommand, saveParamKey, config]);

  // Load on mount
  useEffect(() => {
    reloadConfig();
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, [reloadConfig]);

  return {
    config,
    setConfig,
    saveConfig,
    reloadConfig,
    isSaving,
    isLoading,
    saved,
    error,
    hasChanges,
  };
}

export default useControlPanelSection;
