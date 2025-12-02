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
  error: string | null;

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  configure: (config: Partial<VADConfig>) => Promise<void>;
  reset: () => Promise<void>;
  runTest: () => Promise<VADTestResult>;

  // Processing
  processAudioData: (audioData: Float32Array) => Promise<void>;

  // Anti-echo control (suspend VAD during TTS playback)
  suspendForTTS: () => void;
  resumeAfterTTS: (delayMs?: number) => void;
  isSuspended: boolean;

  // [P1.2] Barge-in: Enable/disable interruption during TTS
  enableBargeIn: () => void;
  disableBargeIn: () => void;
  isBargeInEnabled: boolean;
}

const DEFAULT_CONFIG: VADConfig = {
  threshold: 0.02,
  minSpeechFrames: 10,
  minSilenceFrames: 20
};

// Anti-echo delay after TTS stops (ms)
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isBargeInEnabled, setIsBargeInEnabled] = useState(false);

  const configRef = useRef<VADConfig>({ ...DEFAULT_CONFIG, ...config });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const suspendedRef = useRef<boolean>(false);
  const bargeInEnabledRef = useRef<boolean>(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize config on mount
  useEffect(() => {
    if (config) {
      configRef.current = { ...DEFAULT_CONFIG, ...config };
      audioService.configureVAD(configRef.current).catch(console.error);
    }
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  /**
   * Process audio data through VAD backend
   * Respects suspension state for anti-echo (unless barge-in enabled)
   * [P1.1] Émet événements vers audioStateMachine
   * [P1.2] Barge-in: continue detection even during TTS if enabled
   */
  const processAudioData = useCallback(async (audioData: Float32Array) => {
    // Skip processing if suspended (TTS playing - anti-echo)
    // UNLESS barge-in is enabled - then we keep detecting to allow interruption
    if (suspendedRef.current && !bargeInEnabledRef.current) {
      return;
    }

    try {
      const result = await audioService.processVADFrame(audioData);
      const previousSpeaking = isSpeaking;
      const newSpeaking = result.isSpeaking;

      setVadState(result.state as VADState);
      setIsSpeaking(newSpeaking);
      setError(null);

      // [P1.2] BARGE-IN: Si on détecte parole pendant que l'AI parle → BARGE_IN
      if (newSpeaking && audioStateMachine.isAISpeaking() && bargeInEnabledRef.current) {
        console.log('[useVAD] 🎤⚡ BARGE-IN detected! User interrupting AI');
        audioStateMachine.transition('BARGE_IN');
        // Le TTS sera arrêté par le listener de la state machine
        return;
      }

      // [P1.1] Émettre événements state machine sur transitions normales
      if (newSpeaking && !previousSpeaking) {
        // Transition silence → parole
        audioStateMachine.transition('VAD_SPEECH_START');
      } else if (!newSpeaking && previousSpeaking) {
        // Transition parole → silence
        audioStateMachine.transition('VAD_SPEECH_END');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'VAD processing error');
    }
  }, [isSpeaking]);

  /**
   * Process audio frame from Web Audio API
   */
  const processFrame = useCallback(() => {
    if (!analyserRef.current || !isListening) return;

    // Skip if suspended (anti-echo during TTS)
    if (suspendedRef.current) {
      if (isListening) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    analyser.getFloatTimeDomainData(dataArray);

    // Send to VAD backend
    processAudioData(dataArray);

    // Continue processing
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isListening, processAudioData]);

  /**
   * Start listening with Web Audio API
   * OPUS v∞.2: Tauri vs Browser guard for microphone access
   */
  const startListening = useCallback(async () => {
    try {
      setError(null);

      const env = detectEnvironment();

      // In Tauri mode, test microphone first via backend (1000ms test rapide)
      if (env.isTauri) {
        const testResult = await secureInvoke<{ success: boolean; errorMessage?: string }>('test_microphone', { durationMs: 1000 });
        if (!testResult?.success) {
          setError(testResult?.errorMessage || 'Microphone non disponible');
          return;
        }
      }

      // Request microphone access (works in both modes)
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('API getUserMedia non disponible');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      mediaStreamRef.current = stream;

      // Create Web Audio nodes
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);
      analyserRef.current = analyser;

      // Reset VAD state
      await audioService.resetVAD();

      // Start processing
      setIsListening(true);
      setVadState('silence');

      // Start frame processing loop
      animationFrameRef.current = requestAnimationFrame(processFrame);

      console.log('[useVAD] Started listening');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMessage);
      console.error('[useVAD] Start error:', err);
    }
  }, [processFrame]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setVadState('unknown');
    setIsSpeaking(false);

    console.log('[useVAD] Stopped listening');
  }, []);

  /**
   * Configure VAD parameters
   */
  const configure = useCallback(async (newConfig: Partial<VADConfig>) => {
    try {
      configRef.current = { ...configRef.current, ...newConfig };
      await audioService.configureVAD(configRef.current);
      setError(null);
      console.log('[useVAD] Configured:', configRef.current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Configuration error';
      setError(errorMessage);
    }
  }, []);

  /**
   * Reset VAD to silence state
   */
  const reset = useCallback(async () => {
    try {
      await audioService.resetVAD();
      setVadState('silence');
      setIsSpeaking(false);
      setError(null);
      console.log('[useVAD] Reset');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Reset error';
      setError(errorMessage);
    }
  }, []);

  /**
   * Run VAD self-test
   */
  const runTest = useCallback(async (): Promise<VADTestResult> => {
    try {
      const result = await audioService.testVAD();
      setError(null);
      console.log('[useVAD] Test result:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test error';
      setError(errorMessage);
      return {
        success: false,
        tests: {
          silenceDetection: false,
          speechDetection: false,
          speechTransition: false,
          silenceTransition: false
        },
        message: errorMessage
      };
    }
  }, []);

  /**
   * [ANTI-ECHO P0.4] Suspend VAD processing while TTS is playing
   * Call this before TTS playback starts to prevent echo/feedback loop
   */
  const suspendForTTS = useCallback(() => {
    console.log('[useVAD] 🔇 Suspending VAD for TTS playback (anti-echo)');
    suspendedRef.current = true;
    setIsSuspended(true);
    setVadState('silence');
    setIsSpeaking(false);
  }, []);

  /**
   * [ANTI-ECHO P0.4] Resume VAD processing after TTS playback ends
   * Call this after TTS playback completes to resume voice detection
   * Includes a small delay to avoid detecting TTS tail as user speech
   */
  const resumeAfterTTS = useCallback((delayMs: number = 200) => {
    console.log(`[useVAD] 🔊 Resuming VAD after TTS (delay: ${delayMs}ms)`);
    setTimeout(() => {
      suspendedRef.current = false;
      setIsSuspended(false);
      console.log('[useVAD] ✅ VAD resumed, ready for user speech');
    }, delayMs);
  }, []);

  /**
   * [P1.2 BARGE-IN] Enable barge-in mode
   * VAD will continue to detect speech during TTS playback
   * If speech detected → BARGE_IN event stops TTS
   */
  const enableBargeIn = useCallback(() => {
    console.log('[useVAD] ⚡ Barge-in mode ENABLED');
    bargeInEnabledRef.current = true;
    setIsBargeInEnabled(true);
  }, []);

  /**
   * [P1.2 BARGE-IN] Disable barge-in mode
   * VAD will be fully suspended during TTS playback (anti-echo only)
   */
  const disableBargeIn = useCallback(() => {
    console.log('[useVAD] 🔇 Barge-in mode DISABLED');
    bargeInEnabledRef.current = false;
    setIsBargeInEnabled(false);
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
    disableBargeIn
  };
}

/**
 * [P0.4 ANTI-ECHO] Hook pour intégration automatique VAD ↔ TTS
 * Suspend automatiquement la VAD quand le TTS parle
 *
 * @example
 * ```tsx
 * const vad = useVAD();
 * useVADWithTTS(vad); // Auto-sync avec hybridTTS
 * ```
 */
export function useVADWithTTS(vad: UseVADReturn): void {
  useEffect(() => {
    // Import dynamique pour éviter les dépendances circulaires
    import('@/services/tts/hybridTTS').then(({ hybridTTS }) => {
      const unsubscribe = hybridTTS.onTTSEvent((event) => {
        if (event === 'start') {
          console.log('[useVADWithTTS] 🔇 TTS started, suspending VAD');
          vad.suspendForTTS();
        } else if (event === 'end' || event === 'error') {
          console.log('[useVADWithTTS] 🔊 TTS ended, resuming VAD');
          vad.resumeAfterTTS(TTS_ECHO_DELAY_MS);
        }
      });

      return unsubscribe;
    });
  }, [vad]);
}

/**
 * [P1.2 BARGE-IN] Hook pour barge-in complet avec arrêt TTS automatique
 * Écoute les événements BARGE_IN de la state machine et arrête le TTS
 *
 * @example
 * ```tsx
 * const vad = useVAD();
 * vad.enableBargeIn(); // Active le mode barge-in
 * useBargeInHandler(); // Auto-stop TTS quand l'utilisateur interrompt
 * ```
 */
export function useBargeInHandler(): void {
  useEffect(() => {
    const unsubscribe = audioStateMachine.onStateChange((newState, _prevState, event) => {
      if (event === 'BARGE_IN') {
        console.log('[useBargeInHandler] ⚡ BARGE-IN! Stopping TTS...');
        // Import dynamique pour éviter les dépendances circulaires
        import('@/services/tts/hybridTTS').then(({ hybridTTS }) => {
          hybridTTS.stop().catch(err => {
            console.error('[useBargeInHandler] Error stopping TTS:', err);
          });
        });
      }
    });

    return unsubscribe;
  }, []);
}

export default useVAD;
