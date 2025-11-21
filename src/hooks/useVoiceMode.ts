// TITANE∞ v16.1 - useVoiceMode Hook (OFFLINE FIRST)
// React hook for Voice Mode functionality with local-first priority

import { useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getAIConfig } from '../config/offline-first';
import { confirmCloudAPIUsage } from '../utils/cloudAPIConfirmation';

export interface VoiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  vadActive: boolean;
  transcript: string;
}

export function useVoiceMode() {
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
      await invoke('start_recording');

      setState((prev) => ({
        ...prev,
        isRecording: true,
      }));

      audioChunks.current = [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Start recording error:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    setError(null);

    try {
      await invoke('stop_recording');

      setState((prev) => ({
        ...prev,
        isRecording: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Stop recording error:', err);
    }
  }, []);

  const transcribe = useCallback(async (audioData: Uint8Array) => {
    setState((prev) => ({
      ...prev,
      isTranscribing: true,
    }));

    setError(null);

    try {
      const transcript = await invoke<string>('transcribe_audio', {
        audioData: Array.from(audioData),
      });

      setState((prev) => ({
        ...prev,
        isTranscribing: false,
        transcript,
      }));

      return transcript;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Transcription error:', err);

      setState((prev) => ({
        ...prev,
        isTranscribing: false,
      }));

      return null;
    }
  }, []);

  const speak = useCallback(async (text: string, useOnline: boolean = false) => {
    setState((prev) => ({
      ...prev,
      isSpeaking: true,
    }));

    setError(null);

    try {
      const config = getAIConfig();
      
      // Mode OFFLINE FIRST : toujours essayer local d'abord
      if (config.localFirst || !useOnline) {
        console.log('🔊 TTS Local...');
        await invoke('speak', { text, useOnline: false });
      } else {
        // Mode cloud uniquement si confirmation
        const confirmed = await confirmCloudAPIUsage(
          'Google TTS',
          'Synthèse vocale de haute qualité'
        );
        
        if (confirmed) {
          console.log('🌐 TTS Cloud (Google)...');
          await invoke('speak', { text, useOnline: true });
        } else {
          console.log('🔊 TTS Local (fallback)...');
          await invoke('speak', { text, useOnline: false });
        }
      }

      setState((prev) => ({
        ...prev,
        isSpeaking: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('TTS error:', err);

      setState((prev) => ({
        ...prev,
        isSpeaking: false,
      }));
    }
  }, []);

  const getVADState = useCallback(async () => {
    try {
      const vadActive = await invoke<boolean>('get_vad_state');

      setState((prev) => ({
        ...prev,
        vadActive,
      }));

      return vadActive;
    } catch (err) {
      console.error('VAD state error:', err);
      return false;
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setState((prev) => ({
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
