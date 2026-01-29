/**
 * TITANE∞ v26.2.0 — User Preferences Hook
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 * 
 * Gestion des préférences utilisateur avec persistence localStorage
 */

import { useState, useCallback, useEffect } from 'react';

interface PreferencesStore {
  // Audio
  ttsEnabled: boolean;
  audioConversationPreferred: boolean;
  voiceLanguage: string; // 'fr-FR', 'en-US', etc.

  // UI
  compactMode: boolean;
  autoSendMessages: boolean;
  darkMode: boolean;

  // Recording/Capture
  defaultRecordingFormat: 'webm' | 'wav' | 'mp3';
  recordingQuality: 'low' | 'medium' | 'high'; // Affects file size

  // Vision/Camera
  cameraEnabled: boolean;
  screenCaptureEnabled: boolean;

  // Transcription
  defaultLanguage: string;
  autoTranscribeRecordings: boolean;
}

const DEFAULT_PREFERENCES: PreferencesStore = {
  ttsEnabled: true,
  audioConversationPreferred: false,
  voiceLanguage: 'fr-FR',
  compactMode: false,
  autoSendMessages: false,
  darkMode: false,
  defaultRecordingFormat: 'webm',
  recordingQuality: 'high',
  cameraEnabled: true,
  screenCaptureEnabled: true,
  defaultLanguage: 'fr-FR',
  autoTranscribeRecordings: false,
};

const STORAGE_KEY = 'titane_user_preferences_v1';

/**
 * Hook pour gérer les préférences utilisateur persistantes
 * Utilise localStorage pour la persistance entre sessions
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<PreferencesStore>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les préférences au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Fusionner avec les defaults pour les nouvelles clés
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (err) {
      console.error('[usePreferences] Failed to load from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder les préférences à chaque changement
  const savePreference = useCallback(
    (key: keyof PreferencesStore, value: any) => {
      try {
        const updated = { ...preferences, [key]: value };
        setPreferences(updated);

        // Sauvegarder dans localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log(`[usePreferences] Saved ${key}:`, value);
      } catch (err) {
        console.error(`[usePreferences] Failed to save ${key}:`, err);
      }
    },
    [preferences]
  );

  // Réinitialiser aux defaults
  const resetPreferences = useCallback(() => {
    try {
      setPreferences(DEFAULT_PREFERENCES);
      localStorage.removeItem(STORAGE_KEY);
      console.log('[usePreferences] Reset to defaults');
    } catch (err) {
      console.error('[usePreferences] Failed to reset:', err);
    }
  }, []);

  // Exporter les préférences (pour debug/sharing)
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  // Importer les préférences
  const importPreferences = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      const merged = { ...DEFAULT_PREFERENCES, ...imported };
      setPreferences(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return true;
    } catch (err) {
      console.error('[usePreferences] Failed to import:', err);
      return false;
    }
  }, []);

  return {
    preferences,
    isLoaded,
    savePreference,
    resetPreferences,
    exportPreferences,
    importPreferences,
  };
}

/**
 * Hook pour un toggle de préférence simple
 * Syntaxe similaire à useState
 */
export function usePreferenceToggle(
  key: keyof PreferencesStore,
  defaultValue: boolean = (DEFAULT_PREFERENCES[key] as boolean)
) {
  const { preferences, savePreference } = usePreferences();
  const currentValue = (preferences[key] as boolean) ?? defaultValue;

  const toggle = useCallback(() => {
    savePreference(key, !currentValue);
  }, [currentValue, key, savePreference]);

  const setValue = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue = typeof value === 'function' ? value(currentValue) : value;
      savePreference(key, newValue);
    },
    [currentValue, key, savePreference]
  );

  return [currentValue, setValue, toggle] as const;
}

/**
 * Hook pour l'audio TTS - avec persistence
 */
export function useTTSPreference() {
  const { preferences, savePreference } = usePreferences();
  const isTTSEnabled = (preferences.ttsEnabled as boolean) ?? true;

  const setTTSEnabled = useCallback(
    (enabled: boolean) => {
      savePreference('ttsEnabled', enabled);
    },
    [savePreference]
  );

  return { isTTSEnabled, setTTSEnabled } as const;
}

/**
 * Hook pour le mode conversation audio - avec persistence
 */
export function useAudioConversationPreference() {
  const { preferences, savePreference } = usePreferences();
  const isAudioConversationPreferred =
    (preferences.audioConversationPreferred as boolean) ?? false;

  const setAudioConversationPreferred = useCallback(
    (preferred: boolean) => {
      savePreference('audioConversationPreferred', preferred);
    },
    [savePreference]
  );

  return { isAudioConversationPreferred, setAudioConversationPreferred } as const;
}

/**
 * Hook pour la langue vocale - avec persistence
 */
export function useVoiceLanguagePreference() {
  const { preferences, savePreference } = usePreferences();
  const voiceLanguage = (preferences.voiceLanguage as string) ?? 'fr-FR';

  const setVoiceLanguage = useCallback(
    (lang: string) => {
      savePreference('voiceLanguage', lang);
    },
    [savePreference]
  );

  return { voiceLanguage, setVoiceLanguage } as const;
}
