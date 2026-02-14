/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * AUDIO CHAT INTEGRATION — Interaction vocale intelligente
 * Permet à TITANE de parler et écouter via le chat bubble
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { safeInvoke } from '@/utils/invoke';
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from '@/types/web-speech-api';
import { buildTtsSettingsDefaults } from '@/features/audio-center/types';

export interface AudioChatConfig {
  enabled: boolean;
  voiceId?: string;
  language?: string;
  autoListen?: boolean;
  continuousMode?: boolean;
}

export interface AudioChatState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

/**
 * Hook pour gérer l'interaction audio avec le chat
 */
export function useAudioChat(config: AudioChatConfig = { enabled: true }) {
  const [state, setState] = useState<AudioChatState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    confidence: 0,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION SETUP
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!config.enabled || typeof window === 'undefined') return;

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState(prev => ({
        ...prev,
        error: "La reconnaissance vocale n'est pas supportée par votre navigateur",
      }));
      return;
    }

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = config.continuousMode || false;
    recognition.interimResults = true;
    recognition.lang = config.language || 'fr-FR';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
      console.log('🎤 Écoute activée');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;

        const alternative = result[0];
        if (!alternative) continue;

        const transcript = alternative.transcript;
        if (result.isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const firstResult = event.results[0];
      const firstAlternative = firstResult?.[0];
      const confidence = firstAlternative?.confidence ?? 0;

      setState(prev => ({
        ...prev,
        transcript: finalTranscript || interimTranscript,
        confidence,
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Erreur reconnaissance vocale:', event.error);
      setState(prev => ({
        ...prev,
        isListening: false,
        error: `Erreur: ${event.error}`,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      console.log('🎤 Écoute terminée');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [config.enabled, config.continuousMode, config.language]);

  // ═══════════════════════════════════════════════════════════════
  // AUDIO CONTEXT SETUP
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!config.enabled || typeof window === 'undefined') return;

    const AudioContextClass =
      (window.AudioContext as typeof AudioContext | undefined) ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [config.enabled]);

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Démarre l'écoute vocale
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setState(prev => ({
        ...prev,
        error: 'Reconnaissance vocale non disponible',
      }));
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Erreur démarrage écoute:', error);
      setState(prev => ({
        ...prev,
        error: "Impossible de démarrer l'écoute",
      }));
    }
  }, []);

  /**
   * Arrête l'écoute vocale
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  /**
   * Fait parler TITANE avec le message donné
   */
  const speak = useCallback(
    async (text: string) => {
      if (!config.enabled) return;

      setState(prev => ({ ...prev, isSpeaking: true, error: null }));

      try {
        // Try Tauri TTS first
        const result = await safeInvoke<{ success: boolean }>('tts_speak', {
          text,
          settings: buildTtsSettingsDefaults({
            voiceId: config.voiceId || 'default',
            language: config.language || 'fr-FR',
          }),
        });

        if (result?.success) {
          console.log('✅ TTS Tauri réussi');
          setState(prev => ({ ...prev, isSpeaking: false }));
          return;
        }
      } catch (error) {
        console.warn('⚠️ TTS Tauri échoué, fallback Web Speech API');
      }

      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = config.language || 'fr-FR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
        };

        utterance.onerror = event => {
          console.error('❌ Erreur TTS:', event);
          setState(prev => ({
            ...prev,
            isSpeaking: false,
            error: 'Erreur lors de la synthèse vocale',
          }));
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          error: 'Synthèse vocale non supportée',
        }));
      }
    },
    [config.enabled, config.voiceId, config.language]
  );

  /**
   * Arrête la parole en cours
   */
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  /**
   * Réinitialise le transcript
   */
  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', confidence: 0 }));
  }, []);

  /**
   * Toggle écoute
   */
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    resetTranscript,
  };
}

/**
 * Component indicateur d'écoute active (visualisation audio)
 */
export const ListeningIndicator: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background:
          'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '12px',
        marginBottom: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '3px',
              height: '16px',
              background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
              borderRadius: '2px',
              animation: `audio-bar ${0.8 + i * 0.1}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          color: '#3b82f6',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        🎤 Écoute active...
      </span>
      <style>{`
        @keyframes audio-bar {
          0%, 100% { height: 8px; }
          50% { height: 20px; }
        }
      `}</style>
    </div>
  );
};
