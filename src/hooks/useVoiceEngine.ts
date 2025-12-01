/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — UNIFIED VOICE ENGINE HOOK
 *   Hook central pour toute la voix : TTS, STT, Conversation, Dictée
 *
 *   Architecture:
 *   - Priorité: Tauri Backend (100% offline) → WebSpeech fallback (dev)
 *   - États: idle → listening → processing → speaking → idle
 *   - Deux modes: conversation (avec IA) ou dictation (texte seul)
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/api';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { audioStateMachine, type AudioConversationState } from '@/services/audio/audioStateMachine';

// ═══ TYPES ═══

export type VoiceEngineState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceEngineStatus {
  state: VoiceEngineState;
  transcript: string;
  interimTranscript: string;
  lastError: string | null;
  isMicAvailable: boolean;
  isTTSAvailable: boolean;
  isRecording: boolean;
}

export interface UseVoiceEngineOptions {
  language?: string;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceEngineReturn {
  status: VoiceEngineStatus;

  // Mode conversation (avec IA)
  startTurn: () => Promise<void>;
  cancelTurn: () => Promise<void>;

  // Mode dictée simple (sans IA)
  startDictation: () => Promise<void>;
  stopDictation: () => Promise<string>;

  // TTS
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;

  // Utilitaires
  clearTranscript: () => void;
  clearError: () => void;
}

// ═══ MAIN HOOK ═══

export function useVoiceEngine(options: UseVoiceEngineOptions = {}): UseVoiceEngineReturn {
  const { language = 'fr-FR', onTranscript, onError } = options;

  // State
  const [status, setStatus] = useState<VoiceEngineStatus>({
    state: 'idle',
    transcript: '',
    interimTranscript: '',
    lastError: null,
    isMicAvailable: false,
    isTTSAvailable: false,
    isRecording: false,
  });

  // Refs
  const mountedRef = useRef(true);

  // ═══ INITIALIZATION ═══

  useEffect(() => {
    mountedRef.current = true;

    const checkCapabilities = async () => {
      try {
        // Check TTS
        const ttsStatus = await hybridTTS.getStatus();

        // Check mic (request permission if needed)
        let micAvailable = false;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          micAvailable = true;
        } catch {
          console.warn('[useVoiceEngine] Microphone not available');
        }

        if (mountedRef.current) {
          setStatus(prev => ({
            ...prev,
            isMicAvailable: micAvailable,
            isTTSAvailable: ttsStatus.available,
          }));
        }
      } catch (err) {
        console.error('[useVoiceEngine] Init error:', err);
      }
    };

    checkCapabilities();

    // Subscribe to audio state machine
    const unsubscribe = audioStateMachine.onStateChange((newState) => {
      if (!mountedRef.current) return;

      const stateMap: Record<AudioConversationState, VoiceEngineState> = {
        idle: 'idle',
        user_speaking: 'listening',
        processing: 'processing',
        ai_speaking: 'speaking',
        paused: 'idle',
        error: 'error',
      };

      setStatus(prev => ({
        ...prev,
        state: stateMap[newState] || 'idle',
      }));
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // ═══ ERROR HANDLING ═══

  const handleError = useCallback((error: Error | string, context: string) => {
    const message = error instanceof Error ? error.message : error;
    console.error(`[useVoiceEngine] ${context}:`, message);

    if (mountedRef.current) {
      setStatus(prev => ({
        ...prev,
        state: 'error',
        lastError: message,
        isRecording: false,
      }));
    }

    onError?.(message);
    audioStateMachine.transition('ERROR');
  }, [onError]);

  // ═══ RECORDING (STT) ═══

  const startRecordingInternal = useCallback(async () => {
    try {
      setStatus(prev => ({
        ...prev,
        state: 'listening',
        isRecording: true,
        transcript: '',
        interimTranscript: '',
        lastError: null,
      }));

      await voiceService.startRecording({ language });
      console.log('[useVoiceEngine] Recording started');
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)), 'startRecording');
      throw err;
    }
  }, [language, handleError]);

  const stopRecordingInternal = useCallback(async (): Promise<string> => {
    try {
      setStatus(prev => ({
        ...prev,
        state: 'processing',
        isRecording: false,
      }));

      const result = await voiceService.stopRecording();
      const transcript = result.transcript || '';

      console.log('[useVoiceEngine] Recording stopped, transcript:', transcript);

      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          transcript,
          interimTranscript: '',
        }));
      }

      onTranscript?.(transcript);
      return transcript;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)), 'stopRecording');
      throw err;
    }
  }, [handleError, onTranscript]);

  // ═══ MODE CONVERSATION (avec IA) ═══

  const startTurn = useCallback(async () => {
    if (status.state !== 'idle') {
      console.warn('[useVoiceEngine] Cannot start turn: not idle');
      return;
    }

    try {
      audioStateMachine.transition('VAD_SPEECH_START');
      await startRecordingInternal();
    } catch (err) {
      // Error already handled
    }
  }, [status.state, startRecordingInternal]);

  const cancelTurn = useCallback(async () => {
    try {
      if (status.isRecording) {
        await voiceService.cancelRecording();
      }
      if (status.state === 'speaking') {
        await hybridTTS.stop();
      }

      audioStateMachine.reset();

      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
          isRecording: false,
          transcript: '',
          interimTranscript: '',
        }));
      }

      console.log('[useVoiceEngine] Turn cancelled');
    } catch (err) {
      console.error('[useVoiceEngine] Cancel error:', err);
    }
  }, [status.isRecording, status.state]);

  // ═══ MODE DICTATION (texte seul, sans IA) ═══

  const startDictation = useCallback(async () => {
    if (status.state !== 'idle') {
      console.warn('[useVoiceEngine] Cannot start dictation: not idle');
      return;
    }

    try {
      // Note: On n'utilise PAS la state machine pour la dictée
      // car c'est un mode "micro → texte" sans conversation
      await startRecordingInternal();
      console.log('[useVoiceEngine] Dictation started');
    } catch (err) {
      // Error already handled
    }
  }, [status.state, startRecordingInternal]);

  const stopDictation = useCallback(async (): Promise<string> => {
    if (!status.isRecording) {
      console.warn('[useVoiceEngine] No dictation in progress');
      return '';
    }

    try {
      const transcript = await stopRecordingInternal();

      // Retour à idle (pas de TTS, pas d'IA)
      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
        }));
      }

      console.log('[useVoiceEngine] Dictation stopped, result:', transcript);
      return transcript;
    } catch (err) {
      return '';
    }
  }, [status.isRecording, stopRecordingInternal]);

  // ═══ TTS ═══

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) {
      console.warn('[useVoiceEngine] Empty text, skipping TTS');
      return;
    }

    try {
      setStatus(prev => ({
        ...prev,
        state: 'speaking',
      }));

      await hybridTTS.speak(text);

      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
        }));
      }
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)), 'speak');
    }
  }, [handleError]);

  const stopSpeaking = useCallback(async () => {
    try {
      await hybridTTS.stop();

      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
        }));
      }
    } catch (err) {
      console.error('[useVoiceEngine] Stop speaking error:', err);
    }
  }, []);

  // ═══ UTILITIES ═══

  const clearTranscript = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
    }));
  }, []);

  const clearError = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      lastError: null,
      state: prev.state === 'error' ? 'idle' : prev.state,
    }));

    if (audioStateMachine.isError()) {
      audioStateMachine.reset();
    }
  }, []);

  return {
    status,
    startTurn,
    cancelTurn,
    startDictation,
    stopDictation,
    speak,
    stopSpeaking,
    clearTranscript,
    clearError,
  };
}

export default useVoiceEngine;
