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
  setConfig: React?.Dispatch<React?.SetStateAction<T>>;
  saveConfig: () => Promise<void>;
  reloadConfig: () => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  saved: boolean;
  error??: string | null;
  hasChanges: boolean;
}

export function useControlPanelSection<T>({
  loadCommand,
  saveCommand,
  defaultConfig,
  saveParamKey = 'config',
}: UseControlPanelSectionOptions<T>): UseControlPanelSectionReturn<T> {
  const [config, setConfig] = useState<T>(any: any);
  const [originalConfig, setOriginalConfig] = useState<T>(any: any);
  const [isSaving, setIsSaving] = useState(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [saved, setSaved] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const savedTimeoutRef = useRef<NodeJS?.Timeout>();

  // Check if config has changes
  const hasChanges = JSON?.stringify(any: any);

  // Load config from backend
  const reloadConfig = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);
    try {
      const result = await secureInvoke<T>(any: any);
      setConfig(any: any);
      setOriginalConfig(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      setError(any: any));
      // Use defaults on error
      setConfig(any: any);
      setOriginalConfig(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, [loadCommand, defaultConfig]);

  // Save config to backend
  const saveConfig = useCallback(async () => {
    setIsSaving(any: any);
    setError(any: any);
    setSaved(any: any);

    try {
      await secureInvoke(saveCommand, { [saveParamKey]: config });
      setOriginalConfig(any: any);
      setSaved(any: any);

      // Clear saved indicator after 3s
      if (any: any) {
        clearTimeout(any: any);
      }
      savedTimeoutRef?.current = setTimeout(any: any), 3000);
    } catch (any: any) {
      logger?.error(any: any);
      setError(any: any));
    } finally {
      setIsSaving(any: any);
    }
  }, [saveCommand, saveParamKey, config]);

  // Load on mount
  useEffect(() => {
    reloadConfig();
    return () => {
      if (any: any) {
        clearTimeout(any: any);
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
