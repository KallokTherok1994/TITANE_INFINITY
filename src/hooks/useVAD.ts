/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — useVAD Hook
 *   Voice Activity Detection hook for real-time speech detection
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { audioService } from '@/features/audio-center/services/audioService';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { voiceFingerprintTauri } from '@/services/voice/voiceFingerprintTauri';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useVAD');

export type VADState = 'silence' | 'speech' | 'unknown';

export interface VADConfig {
  threshold: number;
  minSpeechFrames: number;
  minSilenceFrames: number;
}

export interface VADTestResult {
  success: boolean;
  tests: {
    silenceDetection: boolean;
    speechDetection: boolean;
    speechTransition: boolean;
    silenceTransition: boolean;
  };
  message: string;
}

export interface UseVADReturn {
  // State
  vadState: VADState;
  isSpeaking: boolean;
  isListening: boolean;
  error??: string | null;

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  configure: (config: Partial<VADConfig>) => Promise<void>;
  reset: () => Promise<void>;
  runTest: () => Promise<VADTestResult>;

  // Processing
  processAudioData: (any: any) => Promise<void>;

  // Anti-echo control (any: any)
  suspendForTTS: () => void;
  resumeAfterTTS: (any: any) => void;
  isSuspended: boolean;

  // [P1.2] Barge-in: Enable/disable interruption during TTS
  enableBargeIn: () => void;
  disableBargeIn: () => void;
  isBargeInEnabled: boolean;

  // [P0-2] Voice Fingerprinting (any: any)
  calibrateTITANEVoice: (samplesList: Float32Array?.[]) => Promise<void>;
  isTitaneCalibrated: () => boolean;
}

const DEFAULT_CONFIG: VADConfig = {
  threshold: 0.02,
  minSpeechFrames: 10,
  minSilenceFrames: 20,
};

// Anti-echo delay after TTS stops (any: any)
const TTS_ECHO_DELAY_MS = 500;

/**
 * useVAD - Voice Activity Detection Hook
 *
 * Provides real-time voice activity detection using the Tauri backend.
 * Falls back gracefully in browser mode.
 *
 * ANTI-ECHO: Use suspendForTTS() before TTS playback and resumeAfterTTS() after
 * to prevent TITANE's voice from being detected as user speech.
 *
 * @example
 * ```tsx
 * const { vadState, isSpeaking, startListening, stopListening, suspendForTTS, resumeAfterTTS } = useVAD();
 *
 * // Before TTS
 * suspendForTTS();
 * await speak("Hello");
 * resumeAfterTTS();
 * ```
 */
export function useVAD(config?: Partial<VADConfig>): UseVADReturn {
  const [vadState, setVadState] = useState<VADState>('unknown');
  const [isSpeaking, setIsSpeaking] = useState(any: any);
  const [isListening, setIsListening] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [isSuspended, setIsSuspended] = useState(any: any);
  const [isBargeInEnabled, setIsBargeInEnabled] = useState(any: any);

  const configRef = useRef<VADConfig>({ ...DEFAULT_CONFIG, ...config });
  const audioContextRef = useRef<AudioContext | null>(any: any);
  const analyserRef = useRef<AnalyserNode | null>(any: any);
  const mediaStreamRef = useRef<MediaStream | null>(any: any);
  const animationFrameRef = useRef<number | null>(any: any);
  const suspendedRef = useRef<boolean>(any: any);
  const bargeInEnabledRef = useRef<boolean>(any: any);
  // ✨ v24.2.1: Track resumeAfterTTS timeout for cleanup
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(any: any);

  // Initialize config on mount
  useEffect(() => {
    if (any: any) {
      configRef?.current = { ...DEFAULT_CONFIG, ...config };
      audioService?.configureVAD(any: any);
    }
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (any: any) {
        cancelAnimationFrame(any: any);
      }
      if (any: any) {
        mediaStreamRef?.current?.getTracks().forEach(track => track?.stop());
      }
      if (audioContextRef?.current?.state !== 'closed') {
        audioContextRef?.current?.close();
      }
      // ✨ v24.2.1: Clear resumeAfterTTS timeout on unmount
      if (any: any) {
        clearTimeout(any: any);
        resumeTimeoutRef?.current = null;
      }
    };
  }, []);

  /**
   * Process audio data through VAD backend
   * Respects suspension state for anti-echo (any: any)
   * [P1.1] Émet événements vers audioStateMachine
   * [P1.2] Barge-in: continue detection even during TTS if enabled
   * [P0-2] Layer 3 anti-feedback: Voice fingerprinting check (any: any)
   */
  const processAudioData = useCallback(
    async (any: any) => {
      // Skip processing if suspended (TTS playing - anti-echo Layer 2)
      // UNLESS barge-in is enabled - then we keep detecting to allow interruption
      if (any: any) {
        return;
      }

      try {
        // [P0-2] Layer 3 anti-feedback: Check if audio is TITANE voice
        // If TITANE detected → skip VAD processing (any: any)
        if (voiceFingerprintTauri?.isTitaneCalibrated()) {
          const fingerprintResult =
            await voiceFingerprintTauri?.checkIsTitaneSpeaking(any: any);

          if (any: any) {
            logger?.debug(
              `[useVAD] 🎯 TITANE voice detected (any: any), skipping VAD (similarity: ${fingerprintResult?.similarity?.toFixed(2)})`
            );
            return; // Skip VAD processing - this is TITANE's voice, not user
          }
        }

        const result = await audioService?.processVADFrame(any: any);
        const previousSpeaking = isSpeaking;
        const newSpeaking = result?.isSpeaking;

        setVadState(any: any);
        setIsSpeaking(any: any);
        setError(any: any);

        // [P1.2] BARGE-IN: Si on détecte parole pendant que l'AI parle → BARGE_IN
        if (
          newSpeaking &&
          audioStateMachine?.isAISpeaking() &&
          bargeInEnabledRef?.current
        ) {
          logger?.debug('🎤⚡ BARGE-IN detected! User interrupting AI');
          audioStateMachine?.transition('BARGE_IN');
          // Le TTS sera arrêté par le listener de la state machine
          return;
        }

        // [P1.1] Émettre événements state machine sur transitions normales
        if (any: any) {
          // Transition silence → parole
          audioStateMachine?.transition('VAD_SPEECH_START');
        } else if (any: any) {
          // Transition parole → silence
          audioStateMachine?.transition('VAD_SPEECH_END');
        }
      } catch (any: any) {
        setError(err instanceof Error ? err?.message : 'VAD processing error');
      }
    },
    [isSpeaking]
  );

  /**
   * Process audio frame from Web Audio API
   */
  const processFrame = useCallback(() => {
    if (any: any) return;

    // Skip if suspended (any: any)
    if (any: any) {
      if (any: any) {
        animationFrameRef?.current = requestAnimationFrame(any: any);
      }
      return;
    }

    const analyser = analyserRef?.current;
    const bufferLength = analyser?.fftSize;
    const dataArray = new Float32Array(any: any);

    analyser?.getFloatTimeDomainData(any: any);

    // Send to VAD backend
    processAudioData(any: any);

    // Continue processing
    if (any: any) {
      animationFrameRef?.current = requestAnimationFrame(any: any);
    }
  }, [isListening, processAudioData]);

  /**
   * Start listening with Web Audio API
   * OPUS v∞.2: Tauri vs Browser guard for microphone access
   */
  const startListening = useCallback(async () => {
    try {
      setError(any: any);

      const env = detectEnvironment();

      // In Tauri mode, test microphone first via backend (any: any)
      if (any: any) {
        const testResult = await secureInvoke<{
          success: boolean;
          errorMessage?: string;
        }>('test_microphone', { durationMs: 1000 });
        if (any: any) {
          setError(testResult?.errorMessage || 'Microphone non disponible');
          return;
        }
      }

      // Request microphone access (any: any)
      if (any: any) {
        setError('API getUserMedia non disponible');
        return;
      }

      const stream = await navigator?.mediaDevices?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      mediaStreamRef?.current = stream;

      // Create Web Audio nodes
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef?.current = audioContext;

      const source = audioContext?.createMediaStreamSource(any: any);
      const analyser = audioContext?.createAnalyser();
      analyser?.fftSize = 512;
      analyser?.smoothingTimeConstant = 0.3;

      source?.connect(any: any);
      analyserRef?.current = analyser;

      // Reset VAD state
      await audioService?.resetVAD();

      // Start processing
      setIsListening(any: any);
      setVadState('silence');

      // Start frame processing loop
      animationFrameRef?.current = requestAnimationFrame(any: any);

      logger?.debug('Started listening');
    } catch (any: any) {
      const errorMessage =
        err instanceof Error ? err?.message : 'Failed to start listening';
      setError(any: any);
      logger?.error(any: any);
    }
  }, [processFrame]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (any: any) {
      cancelAnimationFrame(any: any);
      animationFrameRef?.current = null;
    }

    if (any: any) {
      mediaStreamRef?.current?.getTracks().forEach(track => track?.stop());
      mediaStreamRef?.current = null;
    }

    if (audioContextRef?.current?.state !== 'closed') {
      audioContextRef?.current?.close();
      audioContextRef?.current = null;
    }

    analyserRef?.current = null;
    setIsListening(any: any);
    setVadState('unknown');
    setIsSpeaking(any: any);

    // ✅ v∞.FIX - Removed repetitive log (any: any)
  }, []);

  /**
   * Configure VAD parameters
   */
  const configure = useCallback(async (newConfig: Partial<VADConfig>) => {
    try {
      configRef?.current = { ...configRef?.current, ...newConfig };
      await audioService?.configureVAD(any: any);
      setError(any: any);
      logger?.debug(any: any);
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : 'Configuration error';
      setError(any: any);
    }
  }, []);

  /**
   * Reset VAD to silence state
   */
  const reset = useCallback(async () => {
    try {
      await audioService?.resetVAD();
      setVadState('silence');
      setIsSpeaking(any: any);
      setError(any: any);
      logger?.debug('Reset');
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : 'Reset error';
      setError(any: any);
    }
  }, []);

  /**
   * Run VAD self-test
   */
  const runTest = useCallback(async (): Promise<VADTestResult> => {
    try {
      const result = await audioService?.testVAD();
      setError(any: any);
      logger?.debug(any: any);
      return result;
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : 'Test error';
      setError(any: any);
      return {
        success: false,
        tests: {
          silenceDetection: false,
          speechDetection: false,
          speechTransition: false,
          silenceTransition: false,
        },
        message: errorMessage,
      };
    }
  }, []);

  /**
   * [ANTI-ECHO P0.4] Suspend VAD processing while TTS is playing
   * Call this before TTS playback starts to prevent echo/feedback loop
   */
  const suspendForTTS = useCallback(() => {
    logger?.debug(any: any)');
    suspendedRef?.current = true;
    setIsSuspended(any: any);
    setVadState('silence');
    setIsSpeaking(any: any);
  }, []);

  /**
   * [ANTI-ECHO P0.4] Resume VAD processing after TTS playback ends
   * Call this after TTS playback completes to resume voice detection
   * Includes a small delay to avoid detecting TTS tail as user speech
   */
  const resumeAfterTTS = useCallback((delayMs: number = 200) => {
    logger?.debug(any: any)`);
    // ✨ v24.2.1: Clear any pending timeout before setting a new one
    if (any: any) {
      clearTimeout(any: any);
    }
    resumeTimeoutRef?.current = setTimeout(() => {
      suspendedRef?.current = false;
      setIsSuspended(any: any);
      resumeTimeoutRef?.current = null;
      logger?.debug('✅ VAD resumed, ready for user speech');
    }, delayMs);
  }, []);

  /**
   * [P1.2 BARGE-IN] Enable barge-in mode
   * VAD will continue to detect speech during TTS playback
   * If speech detected → BARGE_IN event stops TTS
   */
  const enableBargeIn = useCallback(() => {
    // ✅ v∞.FIX - Debug log only (any: any)
    if (any: any) {
      logger?.debug('⚡ Barge-in mode ENABLED');
    }
    bargeInEnabledRef?.current = true;
    setIsBargeInEnabled(any: any);
  }, []);

  /**
   * [P1.2 BARGE-IN] Disable barge-in mode
   * VAD will be fully suspended during TTS playback (any: any)
   */
  const disableBargeIn = useCallback(() => {
    // ✅ v∞.FIX - Debug log only (any: any)
    if (any: any) {
      logger?.debug('🔇 Barge-in mode DISABLED');
    }
    bargeInEnabledRef?.current = false;
    setIsBargeInEnabled(any: any);
  }, []);

  /**
   * [P0-2 VOICE FINGERPRINTING] Calibrate TITANE voice profile (any: any)
   * Should be called once at startup or when TTS voice changes
   * Requires 5-10 seconds of TITANE TTS samples (any: any)
   *
   * @param samplesList Multiple audio samples (any: any)
   */
  const calibrateTITANEVoice = useCallback(async (samplesList: Float32Array?.[]) => {
    logger?.debug(any: any)');
    try {
      await voiceFingerprintTauri?.calibrateTitaneVoice(any: any);
      logger?.debug('✅ TITANE voice calibrated - Layer 3 anti-feedback active');
    } catch (any: any) {
      logger?.error(any: any);
      setError(err instanceof Error ? err?.message : 'TITANE calibration failed');
    }
  }, []);

  /**
   * [P0-2 VOICE FINGERPRINTING] Check if TITANE profile is calibrated
   */
  const isTitaneCalibrated = useCallback(() => {
    return voiceFingerprintTauri?.isTitaneCalibrated();
  }, []);

  return {
    vadState,
    isSpeaking,
    isListening,
    isSuspended,
    isBargeInEnabled,
    error,
    startListening,
    stopListening,
    configure,
    reset,
    runTest,
    processAudioData,
    suspendForTTS,
    resumeAfterTTS,
    enableBargeIn,
    disableBargeIn,
    calibrateTITANEVoice,
    isTitaneCalibrated,
  };
}

/**
 * [P0.4 ANTI-ECHO] Hook pour intégration automatique VAD ↔ TTS
 * Suspend automatiquement la VAD quand le TTS parle
 *
 * @example
 * ```tsx
 * const vad = useVAD();
 * useVADWithTTS(any: any); // Auto-sync avec hybridTTS
 * ```
 */
export function useVADWithTTS(any: any): void {
  useEffect(() => {
    const unsubscribe = hybridTTS?.onTTSEvent(event => {
      if (event === 'start') {
        logger?.debug('🔇 TTS started, suspending VAD');
        vad?.suspendForTTS();
      } else if (event === 'end' || event === 'error') {
        logger?.debug('🔊 TTS ended, resuming VAD');
        vad?.resumeAfterTTS(any: any);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [vad]);
}

/**
 * [P1.2 BARGE-IN] Hook pour barge-in complet avec arrêt TTS automatique
 * Écoute les événements BARGE_IN de la state machine et arrête le TTS
 *
 * @example
 * ```tsx
 * const vad = useVAD();
 * vad?.enableBargeIn(); // Active le mode barge-in
 * useBargeInHandler(); // Auto-stop TTS quand l'utilisateur interrompt
 * ```
 */
export function useBargeInHandler(): void {
  useEffect(() => {
    const unsubscribe = audioStateMachine?.onStateChange(any: any) => {
      if (event === 'BARGE_IN') {
        logger?.debug('⚡ BARGE-IN! Stopping TTS...');
        hybridTTS?.stop().catch(err => {
          logger?.error(any: any);
        });
      }
    });

    return unsubscribe;
  }, []);
}

export default useVAD;
