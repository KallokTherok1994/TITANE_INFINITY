/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — UNIFIED VOICE HOOK
 *
 *   ⚠️ DEPRECATED: Ce hook utilise Web Speech API qui ne fonctionne pas sur Linux.
 *
 *   👉 Utilisez plutôt: useVoiceEngine (100% Tauri backend)
 *
 *   Migration:
 *   - import { useVoice } from '@/hooks/useVoice'
 *   + import { useVoiceEngine } from '@/hooks/useVoiceEngine'
 *
 *   Ce fichier est conservé pour compatibilité mais sera supprimé en v20.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { hybridTTS, type TTSConfig, type TTSStatus } from '../services/tts/hybridTTS';
import { logger } from '@/utils/logger';

// Log deprecation warning on first import
logger.warn('useVoice hook is deprecated. Use useVoiceEngine instead.');

// ═══ TYPES ═══

export interface VoiceState {
  // TTS State
  isSpeaking: boolean;
  ttsAvailable: boolean;
  ttsProvider: 'parler-tts' | 'tauri' | 'webspeech' | 'none';

  // STT State
  isListening: boolean;
  sttAvailable: boolean;
  transcript: string;
  interimTranscript: string;

  // General
  error: string | null;
  isProcessing: boolean;
}

export interface UseVoiceOptions {
  language?: string; // 'fr-FR', 'en-US'
  continuous?: boolean; // Continue listening after results
  interimResults?: boolean; // Get partial results
  autoSpeak?: boolean; // Auto-speak responses
  ttsConfig?: TTSConfig;
}

export interface UseVoiceReturn {
  state: VoiceState;

  // TTS Actions
  speak: (text: string, config?: TTSConfig) => Promise<void>;
  stopSpeaking: () => Promise<void>;

  // STT Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;

  // General
  clearError: () => void;
  clearTranscript: () => void;
  getStatus: () => Promise<TTSStatus>;
}

// ═══ WEB SPEECH API TYPE DECLARATIONS ═══

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ═══ MAIN HOOK ═══

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const { language = 'fr-FR', continuous = false, interimResults = true } = options;

  // State
  const [state, setState] = useState<VoiceState>({
    isSpeaking: false,
    ttsAvailable: false,
    ttsProvider: 'none',
    isListening: false,
    sttAvailable: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isProcessing: false,
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mountedRef = useRef(true);

  // ═══ INITIALIZATION ═══

  useEffect(() => {
    mountedRef.current = true;

    // Check TTS availability
    const checkTTS = async () => {
      try {
        const status = await hybridTTS.getStatus();
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            ttsAvailable: status.available,
            ttsProvider: status.provider,
          }));
        }
      } catch (err) {
        logger.error('TTS check failed:', err);
      }
    };

    // Check STT availability
    const checkSTT = () => {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          sttAvailable: !!SpeechRecognitionAPI,
        }));
      }
    };

    checkTTS();
    checkSTT();

    return () => {
      mountedRef.current = false;
      // Cleanup recognition
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // ═══ TTS FUNCTIONS ═══

  const speak = useCallback(
    async (text: string, config?: TTSConfig) => {
      if (!text?.trim()) {
        logger.warn('Empty text, skipping TTS');
        return;
      }

      setState(prev => ({ ...prev, isSpeaking: true, error: null }));

      try {
        await hybridTTS.speak(text, config || options.ttsConfig);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('TTS error:', errorMsg);
        if (mountedRef.current) {
          setState(prev => ({ ...prev, error: `TTS Error: ${errorMsg}` }));
        }
      } finally {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isSpeaking: false }));
        }
      }
    },
    [options.ttsConfig]
  );

  const stopSpeaking = useCallback(async () => {
    try {
      await hybridTTS.stop();
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isSpeaking: false }));
      }
    } catch (err) {
      logger.error('Stop TTS error:', err);
    }
  }, []);

  // ═══ STT FUNCTIONS ═══

  const startListening = useCallback(async () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setState(prev => ({
        ...prev,
        error: 'Speech Recognition not supported in this browser',
      }));
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onstart = () => {
        logger.debug('STT started');
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            isListening: true,
            error: null,
            interimTranscript: '',
          }));
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;

          const alternative = result[0];
          if (!alternative) continue;

          const transcript = alternative.transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            transcript: prev.transcript + finalTranscript,
            interimTranscript,
          }));
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        logger.error('STT error:', event.error);
        if (mountedRef.current && event.error !== 'aborted') {
          setState(prev => ({
            ...prev,
            error: `STT Error: ${event.error}`,
            isListening: false,
          }));
        }
      };

      recognition.onend = () => {
        logger.debug('STT ended');
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            isListening: false,
            interimTranscript: '',
          }));
        }
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Start STT error:', errorMsg);
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: `Failed to start STT: ${errorMsg}`,
          isListening: false,
        }));
      }
    }
  }, [language, continuous, interimResults]);

  const stopListening = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mountedRef.current) {
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, []);

  // ═══ UTILITY FUNCTIONS ═══

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
    }));
  }, []);

  const getStatus = useCallback(async (): Promise<TTSStatus> => {
    return await hybridTTS.getStatus();
  }, []);

  return {
    state,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    clearError,
    clearTranscript,
    getStatus,
  };
}

export default useVoice;
