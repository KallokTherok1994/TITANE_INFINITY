/**
 * TITANE_INFINITY v24.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.7 — USE CONTROL PANEL SECTION
 *   Hook: Centralise les patterns répétés des sections ControlPanel
 *   Élimine ~500 lignes de duplication dans 10+ sections
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { secureInvoke } from '@/lib/security';

/**
 * Options pour configurer le hook de section
 */
export interface UseControlPanelSectionOptions<TConfig> {
  /** Commande Tauri pour charger la config */
  loadCommand: string;
  /** Commande Tauri pour sauvegarder la config */
  saveCommand: string;
  /** Configuration par défaut */
  defaultConfig: TConfig;
  /** Paramètre supplémentaire pour save (nom de la clé) */
  saveParamKey?: string;
  /** Durée d'affichage du message "Sauvegardé" (ms) */
  savedMessageDuration?: number;
  /** Auto-load au montage */
  autoLoad?: boolean;
  /** Callback après load réussi */
  onLoadSuccess?: (config: TConfig) => void;
  /** Callback après save réussi */
  onSaveSuccess?: () => void;
  /** Callback en cas d'erreur */
  onError?: (error: string, operation: 'load' | 'save') => void;
}

/**
 * Retour du hook
 */
export interface UseControlPanelSectionReturn<TConfig> {
  /** Configuration actuelle */
  config: TConfig;
  /** Mettre à jour la configuration */
  setConfig: React.Dispatch<React.SetStateAction<TConfig>>;
  /** Mettre à jour un champ spécifique */
  updateField: <K extends keyof TConfig>(field: K, value: TConfig[K]) => void;
  /** Recharger la configuration depuis Tauri */
  loadConfig: () => Promise<void>;
  /** Sauvegarder la configuration vers Tauri */
  saveConfig: () => Promise<void>;
  /** Réinitialiser à la config par défaut */
  resetConfig: () => void;
  /** État de chargement */
  isLoading: boolean;
  /** État de sauvegarde */
  isSaving: boolean;
  /** Message "Sauvegardé" visible */
  saved: boolean;
  /** Erreur éventuelle */
  error: string | null;
  /** La config a été modifiée depuis le dernier load/save */
  hasChanges: boolean;
  /** Configuration persistée (pour comparaison) */
  persistedConfig: TConfig;
}

/**
 * Hook générique pour les sections du ControlPanel
 *
 * @example
 * ```tsx
 * const {
 *   config,
 *   updateField,
 *   saveConfig,
 *   isSaving,
 *   saved,
 *   error
 * } = useControlPanelSection({
 *   loadCommand: 'get_security_config',
 *   saveCommand: 'set_security_config',
 *   defaultConfig: { hn_security_enabled: true, secure_mode: false },
 *   saveParamKey: 'config'
 * });
 * ```
 */
export function useControlPanelSection<TConfig extends object>(
  options: UseControlPanelSectionOptions<TConfig>
): UseControlPanelSectionReturn<TConfig> {
  const {
    loadCommand,
    saveCommand,
    defaultConfig,
    saveParamKey = 'config',
    savedMessageDuration = 2000,
    autoLoad = true,
    onLoadSuccess,
    onSaveSuccess,
    onError,
  } = options;

  // États
  const [config, setConfig] = useState<TConfig>(() => ({ ...defaultConfig }));
  const [persistedConfig, setPersistedConfig] = useState<TConfig>(() => ({
    ...defaultConfig,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger la configuration depuis Tauri
   */
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedConfig = await secureInvoke<TConfig>(loadCommand);
      setConfig(loadedConfig);
      setPersistedConfig(loadedConfig);
      onLoadSuccess?.(loadedConfig);
      console.log(`✅ [ControlPanel] Config loaded: ${loadCommand}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMsg);
      onError?.(errorMsg, 'load');
      console.error(`❌ [ControlPanel] Load error (${loadCommand}):`, err);
    } finally {
      setIsLoading(false);
    }
  }, [loadCommand, onLoadSuccess, onError]);

  /**
   * Sauvegarder la configuration vers Tauri
   */
  const saveConfig = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await secureInvoke(saveCommand, { [saveParamKey]: config });
      setPersistedConfig({ ...config });
      setSaved(true);
      onSaveSuccess?.();
      console.log(`✅ [ControlPanel] Config saved: ${saveCommand}`);

      // Reset du message "Sauvegardé" après délai
      setTimeout(() => setSaved(false), savedMessageDuration);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur de sauvegarde';
      setError(errorMsg);
      onError?.(errorMsg, 'save');
      console.error(`❌ [ControlPanel] Save error (${saveCommand}):`, err);
    } finally {
      setIsSaving(false);
    }
  }, [saveCommand, saveParamKey, config, savedMessageDuration, onSaveSuccess, onError]);

  /**
   * Mettre à jour un champ spécifique
   */
  const updateField = useCallback(
    <K extends keyof TConfig>(field: K, value: TConfig[K]) => {
      setConfig(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Réinitialiser à la config par défaut
   */
  const resetConfig = useCallback(() => {
    setConfig({ ...defaultConfig });
    setError(null);
  }, [defaultConfig]);

  /**
   * Détecter si la config a changé
   */
  const hasChanges = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(persistedConfig);
  }, [config, persistedConfig]);

  // Auto-load au montage
  useEffect(() => {
    if (autoLoad) {
      loadConfig();
    }
  }, [autoLoad, loadConfig]);

  return {
    config,
    setConfig,
    updateField,
    loadConfig,
    saveConfig,
    resetConfig,
    isLoading,
    isSaving,
    saved,
    error,
    hasChanges,
    persistedConfig,
  };
}

/**
 * Hook spécialisé pour les sections avec toggles booléens
 * TConfig doit avoir toutes ses propriétés booléennes
 */
export function useControlPanelToggles<TConfig extends object>(
  options: UseControlPanelSectionOptions<TConfig>
) {
  const sectionHook = useControlPanelSection(options);

  const toggleField = useCallback(
    <K extends keyof TConfig>(field: K) => {
      sectionHook.setConfig(prev => ({
        ...prev,
        [field]: !prev[field],
      }));
    },
    [sectionHook]
  );

  return {
    ...sectionHook,
    toggleField,
  };
}

export default useControlPanelSection;
