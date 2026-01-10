/**
 * TITANE∞ v∞ — SP-VOICE-001 Partie 2/3: Auto-Mute Micro pendant TTS
 * Hook combinant TTS et contrôle automatique du microphone
 *
 * Résout feedback loop: TTS parle → Micro capte TTS → ASR transcrit TTS → LOOP ♾️
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/api/voice';
import { useVAD, UseVADReturn } from './useVAD';
import { createLogger } from '@/utils/logger';

const logger = createLogger('TTSWithMicControl');

interface TTSConfig {
  language?: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useOnline?: boolean;
}

interface UseTTSWithMicControlOptions {
  /** Délai avant de réactiver le micro après TTS (ms) */
  resumeDelay?: number;
  /** Mode duplex: autorise barge-in (interruption) */
  enableDuplex?: boolean;
  /** Hook VAD externe (optionnel) */
  vadHook?: UseVADReturn;
}

export interface UseTTSWithMicControlReturn {
  isSpeaking: boolean;
  text: string;
  error: string | null;
  speak: (textToSpeak: string, config?: TTSConfig) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  isMicSuspended: boolean;
  isBargeInEnabled: boolean;
  suspendMic: () => void;
  resumeMic: (delay?: number) => void;
  enableBargeIn: () => void;
  disableBargeIn: () => void;
}

export function useTTSWithMicControl(
  options: UseTTSWithMicControlOptions = {}
): UseTTSWithMicControlReturn {
  const {
    resumeDelay = 500, // Default: 500ms delay (same as useVAD TTS_ECHO_DELAY_MS)
    enableDuplex = false,
    vadHook: externalVAD,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>('');

  // Use external VAD or create internal one
  const internalVAD = useVAD();
  const vad = externalVAD || internalVAD;

  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioIdRef = useRef<string | null>(null);

  /**
   * Speak text and auto-mute microphone during playback
   * Layer 2: Auto-mute mic to prevent feedback loop
   */
  const speak = useCallback(
    async (textToSpeak: string, config?: TTSConfig) => {
      try {
        setError(null);
        setText(textToSpeak);

        // ✅ CRITICAL: Suspend VAD (mute microphone) BEFORE starting TTS
        logger.debug('Suspending VAD (muting mic)');
        vad.suspendForTTS();

        // Configure duplex mode
        if (enableDuplex) {
          vad.enableBargeIn();
          logger.debug('Duplex mode enabled (barge-in)');
        } else {
          vad.disableBargeIn();
        }

        setIsSpeaking(true);

        // Start TTS playback
        await voiceService.speak(textToSpeak, undefined, config?.useOnline ?? false);

        logger.debug('TTS started');

        // ✅ CRITICAL: Resume VAD (unmute mic) after delay
        resumeTimeoutRef.current = setTimeout(() => {
          logger.debug(`Resuming VAD after ${resumeDelay}ms delay`);
          vad.resumeAfterTTS(resumeDelay);
          setIsSpeaking(false);
          audioIdRef.current = null;
        }, resumeDelay);
      } catch (err: unknown) {
        const error = err as Error;
        logger.error('TTS failed', { error });
        setError(`TTS error: ${error.message}`);
        setIsSpeaking(false);

        // ✅ CRITICAL: Always resume VAD even on error
        vad.resumeAfterTTS(0); // No delay on error
      }
    },
    [vad, resumeDelay, enableDuplex]
  );

  /**
   * Stop TTS and immediately restore microphone state
   */
  const stopSpeaking = useCallback(async () => {
    try {
      // Clear resume timeout
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }

      // Stop TTS
      if (audioIdRef.current) {
        await voiceService.stopSpeaking();
        audioIdRef.current = null;
      }

      // ✅ CRITICAL: Immediately resume VAD (unmute mic)
      logger.debug('TTS stopped, resuming VAD immediately');
      vad.resumeAfterTTS(0); // No delay

      setIsSpeaking(false);
      setText('');
    } catch (err: unknown) {
      const error = err as Error;
      logger.error('Failed to stop TTS', { error });
      setError(`Stop error: ${error.message}`);

      // ✅ CRITICAL: Always resume VAD even on error
      vad.resumeAfterTTS(0);
      setIsSpeaking(false);
    }
  }, [vad]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      if (audioIdRef.current) {
        voiceService
          .stopSpeaking()
          .catch(err => logger.error('Cleanup error', { error: err }));
      }
      // Ensure VAD is resumed
      vad.resumeAfterTTS(0);
    };
  }, [vad]);

  return {
    // TTS state
    isSpeaking,
    text,
    error,

    // TTS control
    speak,
    stopSpeaking,

    // VAD state (from underlying VAD hook)
    isMicSuspended: vad.isSuspended,
    isBargeInEnabled: vad.isBargeInEnabled,

    // VAD control (exposed for manual control if needed)
    suspendMic: vad.suspendForTTS,
    resumeMic: vad.resumeAfterTTS,
    enableBargeIn: vad.enableBargeIn,
    disableBargeIn: vad.disableBargeIn,
  };
}
