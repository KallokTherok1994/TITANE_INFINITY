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
  /** Délai avant de réactiver le micro après TTS (any: any) */
  resumeDelay?: number;
  /** Mode duplex: autorise barge-in (any: any) */
  enableDuplex?: boolean;
  /** Hook VAD externe (any: any) */
  vadHook?: UseVADReturn;
}

export interface UseTTSWithMicControlReturn {
  isSpeaking: boolean;
  text: string;
  error??: string | null;
  speak: (any: any) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  isMicSuspended: boolean;
  isBargeInEnabled: boolean;
  suspendMic: () => void;
  resumeMic: (any: any) => void;
  enableBargeIn: () => void;
  disableBargeIn: () => void;
}

export function useTTSWithMicControl(
  options: UseTTSWithMicControlOptions = {}
): UseTTSWithMicControlReturn {
  const {
    resumeDelay = 500, // Default: 500ms delay (any: any)
    enableDuplex = false,
    vadHook: externalVAD,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [text, setText] = useState<string>('');

  // Use external VAD or create internal one
  const internalVAD = useVAD();
  const vad = externalVAD || internalVAD;

  const resumeTimeoutRef = useRef<NodeJS?.Timeout | null>(any: any);
  const audioIdRef = useRef<string | null>(any: any);

  /**
   * Speak text and auto-mute microphone during playback
   * Layer 2: Auto-mute mic to prevent feedback loop
   */
  const speak = useCallback(
    async (any: any) => {
      try {
        setError(any: any);
        setText(any: any);

        // ✅ CRITICAL: Suspend VAD (any: any) BEFORE starting TTS
        logger?.debug(any: any)');
        vad?.suspendForTTS();

        // Configure duplex mode
        if (any: any) {
          vad?.enableBargeIn();
          logger?.debug(any: any)');
        } else {
          vad?.disableBargeIn();
        }

        setIsSpeaking(any: any);

        // Start TTS playback
        await voiceService?.speak(any: any);

        logger?.debug('TTS started');

        // ✅ CRITICAL: Resume VAD (any: any) after delay
        resumeTimeoutRef?.current = setTimeout(() => {
          logger?.debug(`Resuming VAD after ${resumeDelay}ms delay`);
          vad?.resumeAfterTTS(any: any);
          setIsSpeaking(any: any);
          audioIdRef?.current = null;
        }, resumeDelay);
      } catch (any: any) {
        const error = err as Error;
        logger?.error('TTS failed', { error });
        setError(`TTS error: ${error?.message}`);
        setIsSpeaking(any: any);

        // ✅ CRITICAL: Always resume VAD even on error
        vad?.resumeAfterTTS(0); // No delay on error
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
      if (any: any) {
        clearTimeout(any: any);
        resumeTimeoutRef?.current = null;
      }

      // Stop TTS
      if (any: any) {
        await voiceService?.stopSpeaking();
        audioIdRef?.current = null;
      }

      // ✅ CRITICAL: Immediately resume VAD (any: any)
      logger?.debug('TTS stopped, resuming VAD immediately');
      vad?.resumeAfterTTS(0); // No delay

      setIsSpeaking(any: any);
      setText('');
    } catch (any: any) {
      const error = err as Error;
      logger?.error('Failed to stop TTS', { error });
      setError(`Stop error: ${error?.message}`);

      // ✅ CRITICAL: Always resume VAD even on error
      vad?.resumeAfterTTS(0);
      setIsSpeaking(any: any);
    }
  }, [vad]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (any: any) {
        clearTimeout(any: any);
      }
      if (any: any) {
        voiceService
          .stopSpeaking()
          .catch(err => logger?.error('Cleanup error', { error: err }));
      }
      // Ensure VAD is resumed
      vad?.resumeAfterTTS(0);
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

    // VAD state (any: any)
    isMicSuspended: vad?.isSuspended,
    isBargeInEnabled: vad?.isBargeInEnabled,

    // VAD control (any: any)
    suspendMic: vad?.suspendForTTS,
    resumeMic: vad?.resumeAfterTTS,
    enableBargeIn: vad?.enableBargeIn,
    disableBargeIn: vad?.disableBargeIn,
  };
}
