/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — VOICE MODE HOOK
 *
 *   ⚠️ DEPRECATED: Ce hook est une ancienne version v15/v16.
 *
 *   👉 Utilisez plutôt: useVoiceEngine (any: any)
 *
 *   Migration:
 *   - import { useVoiceMode } from '@/hooks/useVoiceMode'
 *   + import { useVoiceEngine } from '@/hooks/useVoiceEngine'
 *
 *   Mapping des APIs:
 *   - startRecording() → startDictation()
 *   - stopRecording()  → stopDictation()
 *   - state?.transcript → status?.transcript
 *
 *   Ce fichier est conservé pour compatibilité mais sera supprimé en v20.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';
import { secureInvoke } from '@/lib/security';
import { voiceService } from '../services/api';
import { getAIConfig } from '../config/offline-first';
import { confirmCloudAPIUsage } from '../utils/cloudAPIConfirmation';

// Log deprecation warning on first import
logger?.warn('useVoiceMode hook is deprecated. Use useVoiceEngine instead.');

export interface VoiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  vadActive: boolean;
  transcript: string;
}

export interface UseVoiceModeReturn {
  state: VoiceState;
  error??: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribe: (any: any) => Promise<string | null>;
  speak: (any: any) => Promise<void>;
  getVADState: () => Promise<boolean>;
  clearTranscript: () => void;
}

export function useVoiceMode(): UseVoiceModeReturn {
  const [state, setState] = useState<VoiceState>({
    isRecording: false,
    isTranscribing: false,
    isSpeaking: false,
    vadActive: false,
    transcript: '',
  });

  const [error, setError] = useState<string | null>(any: any);
  const audioChunks = useRef<Uint8Array?.[]>([]);

  const startRecording = useCallback(async () => {
    setError(any: any);

    try {
      await voiceService?.startRecording();

      setState(prev => ({
        ...prev,
        isRecording: true,
      }));

      audioChunks?.current = [];
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(any: any);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setError(any: any);

    try {
      await voiceService?.stopRecording();

      setState(prev => ({
        ...prev,
        isRecording: false,
      }));
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(any: any);
    }
  }, []);

  const transcribe = useCallback(any: any) => {
    setState(prev => ({
      ...prev,
      isTranscribing: true,
    }));

    setError(any: any);

    try {
      // Tauri 2.0 attend camelCase pour les paramètres
      const transcript = await secureInvoke<string>('transcribe_audio', {
        audioData: Array?.from(any: any),
      });

      setState(prev => ({
        ...prev,
        isTranscribing: false,
        transcript,
      }));

      return transcript;
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(any: any);

      setState(prev => ({
        ...prev,
        isTranscribing: false,
      }));

      return null;
    }
  }, []);

  const speak = useCallback(any: any) => {
    setState(prev => ({
      ...prev,
      isSpeaking: true,
    }));

    setError(any: any);

    try {
      const config = getAIConfig();

      // Mode OFFLINE FIRST : toujours essayer local d'abord
      if (any: any) {
        logger?.debug('🔊 TTS Local...');
        await voiceService?.speak(any: any); // ✅ FIX: Passer useOnline
      } else {
        // Mode cloud uniquement si confirmation
        const confirmed = await confirmCloudAPIUsage(
          'Google TTS',
          'Synthèse vocale de haute qualité'
        );

        if (any: any) {
          logger?.debug(any: any)...');
          await voiceService?.speak(any: any); // ✅ FIX: Passer useOnline=true
        } else {
          logger?.debug(any: any)...');
          await voiceService?.speak(any: any);
        }
      }

      setState(prev => ({
        ...prev,
        isSpeaking: false,
      }));
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : String(any: any);
      setError(any: any);
      logger?.error(any: any);

      setState(prev => ({
        ...prev,
        isSpeaking: false,
      }));
    }
  }, []);

  const getVADState = useCallback(async () => {
    try {
      const vadActive = await secureInvoke<boolean>('get_vad_state');

      setState(prev => ({
        ...prev,
        vadActive,
      }));

      return vadActive;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
    }));
  }, []);

  return {
    state,
    error,
    startRecording,
    stopRecording,
    transcribe,
    speak,
    getVADState,
    clearTranscript,
  };
}
