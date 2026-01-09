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
 *   👉 Utilisez plutôt: useVoiceEngine (unifié + state machine)
 *
 *   Migration:
 *   - import { useVoiceMode } from '@/hooks/useVoiceMode'
 *   + import { useVoiceEngine } from '@/hooks/useVoiceEngine'
 *
 *   Mapping des APIs:
 *   - startRecording() → startDictation()
 *   - stopRecording()  → stopDictation()
 *   - state.transcript → status.transcript
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
logger.warn('useVoiceMode hook is deprecated. Use useVoiceEngine instead.');

export interface VoiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  vadActive: boolean;
  transcript: string;
}

export interface UseVoiceModeReturn {
  state: VoiceState;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  transcribe: (audioData: Uint8Array) => Promise<string | null>;
  speak: (text: string, useOnline?: boolean) => Promise<void>;
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

  const [error, setError] = useState<string | null>(null);
  const audioChunks = useRef<Uint8Array[]>([]);

  const startRecording = useCallback(async () => {
    setError(null);

    try {
      await voiceService.startRecording();

      setState(prev => ({
        ...prev,
        isRecording: true,
      }));

      audioChunks.current = [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('Start recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setError(null);

    try {
      await voiceService.stopRecording();

      setState(prev => ({
        ...prev,
        isRecording: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('Stop recording error:', err);
    }
  }, []);

  const transcribe = useCallback(async (audioData: Uint8Array) => {
    setState(prev => ({
      ...prev,
      isTranscribing: true,
    }));

    setError(null);

    try {
      // Tauri 2.0 attend camelCase pour les paramètres
      const transcript = await secureInvoke<string>('transcribe_audio', {
        audioData: Array.from(audioData),
      });

      setState(prev => ({
        ...prev,
        isTranscribing: false,
        transcript,
      }));

      return transcript;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('Transcription error:', err);

      setState(prev => ({
        ...prev,
        isTranscribing: false,
      }));

      return null;
    }
  }, []);

  const speak = useCallback(async (text: string, useOnline: boolean = false) => {
    setState(prev => ({
      ...prev,
      isSpeaking: true,
    }));

    setError(null);

    try {
      const config = getAIConfig();

      // Mode OFFLINE FIRST : toujours essayer local d'abord
      if (config.localFirst || !useOnline) {
        logger.debug('🔊 TTS Local...');
        await voiceService.speak(text, undefined, false); // ✅ FIX: Passer useOnline
      } else {
        // Mode cloud uniquement si confirmation
        const confirmed = await confirmCloudAPIUsage(
          'Google TTS',
          'Synthèse vocale de haute qualité'
        );

        if (confirmed) {
          logger.debug('🌐 TTS Cloud (Google)...');
          await voiceService.speak(text, undefined, true); // ✅ FIX: Passer useOnline=true
        } else {
          logger.debug('🔊 TTS Local (fallback)...');
          await voiceService.speak(text, undefined, false);
        }
      }

      setState(prev => ({
        ...prev,
        isSpeaking: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      logger.error('TTS error:', err);

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
    } catch (err) {
      logger.error('VAD state error:', err);
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
