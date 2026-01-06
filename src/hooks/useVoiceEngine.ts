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
 *   - OPUS v∞.2: Détection Tauri vs Browser pour permissions
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { voiceService } from '@/services/api';
import { hybridTTS } from '@/services/tts/hybridTTS';
import {
  audioStateMachine,
  type AudioConversationState,
} from '@/services/audio/audioStateMachine';
import { detectEnvironment } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';
import { useChat } from '@/hooks/useChat';
import { voiceRouter } from '@/services/voice/voiceRouter';
import {
  attentionEngine,
  type AttentionState,
  type ListeningMode,
} from '@/services/voice/attentionEngine';
import {
  fullDuplexOrchestrator,
  type FullDuplexEvent,
  type FullDuplexState,
} from '@/services/voice/fullDuplexOrchestrator';
import { haloEngine } from '@/services/voice/haloEngine'; // ✅ v∞.7 Halo sync
import { createLogger } from '@/utils/logger';

const logger = createLogger('useVoiceEngine');

type MicrophoneProbeState = {
  lastAt: number;
  lastValue: boolean | null;
  inFlight: Promise<boolean> | null;
};

const MICROPHONE_PROBE_CACHE_MS = 6000;
const MICROPHONE_PROBE_DURATION_MS = 1000;
const microphoneProbeState: MicrophoneProbeState = {
  lastAt: 0,
  lastValue: null,
  inFlight: null,
};

const probeMicrophoneAvailabilityTauri = async (): Promise<boolean> => {
  const now = Date.now();
  if (
    microphoneProbeState.lastValue !== null &&
    now - microphoneProbeState.lastAt < MICROPHONE_PROBE_CACHE_MS
  ) {
    return microphoneProbeState.lastValue;
  }

  if (microphoneProbeState.inFlight) {
    return microphoneProbeState.inFlight;
  }

  microphoneProbeState.inFlight = (async () => {
    try {
      const timeoutMs = MICROPHONE_PROBE_DURATION_MS + 5000;
      const result = await secureInvoke<{ success: boolean }>(
        'test_microphone',
        { durationMs: MICROPHONE_PROBE_DURATION_MS },
        { timeout: timeoutMs }
      );
      const ok = result?.success === true;
      microphoneProbeState.lastAt = Date.now();
      microphoneProbeState.lastValue = ok;
      return ok;
    } catch {
      microphoneProbeState.lastAt = Date.now();
      microphoneProbeState.lastValue = false;
      return false;
    } finally {
      microphoneProbeState.inFlight = null;
    }
  })();

  return microphoneProbeState.inFlight;
};

const probeMicrophoneAvailabilityBrowser = async (): Promise<boolean> => {
  const now = Date.now();
  if (
    microphoneProbeState.lastValue !== null &&
    now - microphoneProbeState.lastAt < MICROPHONE_PROBE_CACHE_MS
  ) {
    return microphoneProbeState.lastValue;
  }

  if (microphoneProbeState.inFlight) {
    return microphoneProbeState.inFlight;
  }

  microphoneProbeState.inFlight = (async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        microphoneProbeState.lastAt = Date.now();
        microphoneProbeState.lastValue = false;
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      microphoneProbeState.lastAt = Date.now();
      microphoneProbeState.lastValue = true;
      return true;
    } catch {
      microphoneProbeState.lastAt = Date.now();
      microphoneProbeState.lastValue = false;
      return false;
    } finally {
      microphoneProbeState.inFlight = null;
    }
  })();

  return microphoneProbeState.inFlight;
};

// ═══ TYPES ═══

export type VoiceEngineState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface WakeWordEvent {
  word: string;
  confidence: number;
  timestamp: number;
}

export interface VoiceEngineStatus {
  state: VoiceEngineState;
  transcript: string;
  interimTranscript: string;
  lastError: string | null;
  isMicAvailable: boolean;
  isTTSAvailable: boolean;
  isRecording: boolean;

  // Wake Word & Attention
  listeningMode: ListeningMode;
  attentionState: AttentionState;
  lastWakeEvent?: WakeWordEvent;

  // Full Duplex (v∞.5)
  fullDuplexMode: boolean;
  fullDuplexState?: FullDuplexState;
  isSpeaking: boolean;
  isListening: boolean;
}

export interface UseVoiceEngineOptions {
  language?: string;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  /** Enable real-time Whisper streaming mode (v19.3.1) */
  streamingMode?: boolean;
  /** Whisper model for streaming (default: 'base') */
  whisperModel?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  /** Enable full duplex mode (v∞.5) - speak and listen simultaneously */
  fullDuplexMode?: boolean;
}

export interface UseVoiceEngineReturn {
  status: VoiceEngineStatus;

  // Mode conversation (avec IA)
  startTurn: () => Promise<void>;
  completeTurn: () => Promise<void>; // ✅ v19.3: complete turn after recording
  completeTurnWithText: (text: string) => Promise<void>; // ✅ v19.4: complete turn with pre-transcribed text (one-shot)
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

  // Wake Word & Attention (v19.4)
  activateWakeWord: () => void;
  deactivateWakeWord: () => void;
  setPushToTalk: () => void;
  getListeningMode: () => ListeningMode;
  getAttentionState: () => AttentionState;

  // Streaming (v19.3.1)
  streamingState?: {
    partial: string;
    isStreaming: boolean;
  };

  // Full Duplex (v∞.5)
  enableFullDuplex: () => Promise<void>;
  disableFullDuplex: () => Promise<void>;
  interrupt: () => Promise<void>;
  injectInterruption: (text: string) => Promise<void>;

  // Emergency Reset (v∞.7)
  forceVoiceReset: () => Promise<void>;
}

// ═══ MAIN HOOK ═══

export function useVoiceEngine(
  options: UseVoiceEngineOptions = {}
): UseVoiceEngineReturn {
  const { language = 'fr-FR', onTranscript, onError } = options;

  // ✅ Chat IA integration for voice turns
  const chat = useChat();

  // State
  const [status, setStatus] = useState<VoiceEngineStatus>({
    state: 'idle',
    transcript: '',
    interimTranscript: '',
    lastError: null,
    isMicAvailable: false,
    isTTSAvailable: false,
    isRecording: false,
    listeningMode: 'off',
    attentionState: 'inactive',
    fullDuplexMode: options.fullDuplexMode ?? false,
    isSpeaking: false,
    isListening: false,
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

        // Check mic - OPUS v∞.2: Tauri vs Browser
        const env = detectEnvironment();
        const micAvailable = env.isTauri
          ? await probeMicrophoneAvailabilityTauri()
          : await probeMicrophoneAvailabilityBrowser();

        if (mountedRef.current) {
          setStatus(prev => ({
            ...prev,
            isMicAvailable: micAvailable,
            isTTSAvailable: ttsStatus.available,
          }));
        }
      } catch (err) {
        logger.error('Init error:', err);
      }
    };

    checkCapabilities();

    // Subscribe to audio state machine
    const unsubscribe = audioStateMachine.onStateChange(newState => {
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

    // Subscribe to attention engine
    const unsubscribeAttention = attentionEngine.onStateChange(event => {
      if (!mountedRef.current) return;

      setStatus(
        prev =>
          ({
            ...prev,
            attentionState: event.state,
            lastWakeEvent: event.wakeEvent ? event.wakeEvent : undefined,
          }) as VoiceEngineStatus
      );
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
      unsubscribeAttention();
    };
  }, []);

  // ═══ ERROR HANDLING ═══

  const handleError = useCallback(
    (error: Error | string, context: string) => {
      const message = error instanceof Error ? error.message : error;
      logger.error(`${context}:`, message);

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
    },
    [onError]
  );

  // ═══ RECORDING (STT) ═══

  const startRecordingInternal = useCallback(async () => {
    try {
      // ✅ ANTI-DEBOUNCE: Prevent multiple calls
      if (status.isRecording) {
        logger.warn('Already recording, ignoring duplicate call');
        return;
      }

      haloEngine.startBreathing(); // ✅ v∞.7 PHASE 8: Start breathing animation

      setStatus(prev => ({
        ...prev,
        state: 'listening',
        isRecording: true,
        transcript: '',
        interimTranscript: '',
        lastError: null,
      }));

      await voiceService.startRecording({ language });
      logger.debug('Recording started');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);

      // ✅ v∞.8 FIX: Detect "Recording already in progress" and force reset
      if (
        errorMsg.includes('Recording already in progress') ||
        errorMsg.includes('AlreadyRecording')
      ) {
        logger.error('Backend stuck, applying force reset...');

        try {
          // Force reset backend + frontend state
          await voiceService.forceResetVoice();
          audioStateMachine.reset(); // ✅ Reset AudioStateMachine to IDLE
          haloEngine.reset(); // ✅ Reset Halo to IDLE

          // Reset to idle (not error)
          setStatus(prev => ({
            ...prev,
            isRecording: false,
            state: 'idle',
            lastError: 'Voice engine was reset due to stuck state',
          }));

          logger.debug('Force reset complete, ready to retry manually');
        } catch (resetErr) {
          logger.error('Force reset failed:', resetErr);
          handleError(
            resetErr instanceof Error ? resetErr : new Error(String(resetErr)),
            'forceReset'
          );

          // Fallback: reset to idle anyway
          setStatus(prev => ({
            ...prev,
            isRecording: false,
            state: 'idle',
          }));
        }
      } else {
        // Other errors: standard error handling
        handleError(
          err instanceof Error ? err : new Error(String(err)),
          'startRecording'
        );

        // ✅ Reset to idle (not error state to avoid loop)
        setStatus(prev => ({
          ...prev,
          isRecording: false,
          state: 'idle',
        }));
        audioStateMachine.reset(); // ✅ Always reset AudioStateMachine on error
      }

      throw err;
    }
  }, [language, handleError, status.isRecording]);

  const stopRecordingInternal = useCallback(async (): Promise<string> => {
    try {
      // ✅ SAFE GUARD: Only stop if recording
      if (!status.isRecording) {
        logger.warn('Not recording, returning empty transcript');
        return '';
      }

      setStatus(prev => ({
        ...prev,
        state: 'processing',
        isRecording: false,
      }));

      const result = await voiceService.stopRecording();
      const transcript = result.transcript || '';

      logger.debug('Recording stopped, transcript:', transcript);

      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          transcript,
          interimTranscript: '',
          state: 'processing', // ✅ Stay in processing for IA + TTS
        }));
      }

      onTranscript?.(transcript);
      return transcript;
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)), 'stopRecording');
      // Force reset to idle on error
      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          isRecording: false,
          state: 'idle',
        }));
      }
      throw err;
    }
  }, [handleError, onTranscript, status.isRecording]);

  // ═══ MODE CONVERSATION (avec IA) ═══

  /**
   * ✅ REFACTORÉ v19.3.1 : Pipeline complet IA + TTS via VoiceRouter
   * Le VoiceRouter orchestre : Transcription → IA → TTS → Done
   */
  const processTurnWithAI = useCallback(
    async (transcript: string) => {
      try {
        logger.debug('Processing turn with VoiceRouter...');

        // Déléguer au VoiceRouter pour orchestration complète
        const result = await voiceRouter.processVoiceTurn(transcript, chat.sendMessage, {
          useOnlineTTS: false, // Priorité offline
          aiTimeout: 30000,
          ttsTimeout: 60000,
          onStateChange: routerState => {
            // Synchroniser l'état du hook avec le router
            if (routerState === 'processing') {
              setStatus(prev => ({ ...prev, state: 'processing' }));
            } else if (routerState === 'speaking') {
              setStatus(prev => ({ ...prev, state: 'speaking' }));
            } else if (routerState === 'done' || routerState === 'idle') {
              setStatus(prev => ({ ...prev, state: 'idle' }));
            } else if (routerState === 'error') {
              setStatus(prev => ({ ...prev, state: 'error' }));
            }
          },
          onAIResponse: aiResponse => {
            logger.debug('AI response:', aiResponse.content.substring(0, 50));
          },
          onTTSStart: () => {
            logger.debug('TTS started');
          },
          onTTSEnd: () => {
            logger.debug('TTS completed');
          },
          onError: error => {
            logger.error('VoiceRouter error:', error);
            handleError(
              new Error(`${error.stage} error: ${error.message}`),
              'processTurnWithAI'
            );
          },
        });

        if (result.success) {
          logger.debug(`Voice turn completed in ${result.duration}ms`);
        } else {
          logger.error('Voice turn failed:', result.error);
        }
      } catch (error) {
        logger.error('processTurnWithAI error:', error);
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          'processTurnWithAI'
        );
      }
    },
    [chat, handleError]
  );

  /**
   * ✅ Start voice turn (recording only)
   * ✅ v∞.7: Manual mode only (no VAD auto-start in Chat mode)
   */
  const startTurn = useCallback(async () => {
    // ✅ SAFE GUARD: Prevent restart if not idle
    if (status.state !== 'idle') {
      logger.warn('Cannot start turn: state =', status.state);
      return;
    }

    // ✅ v∞.7 PHASE 9: Only start if explicitly called (no VAD auto)
    logger.debug('Manual start (Chat mode) - no VAD auto');

    try {
      audioStateMachine.transition('VAD_SPEECH_START');
      haloEngine.startBreathing(); // ✅ v∞.7 PHASE 8: VAD speech → breathing
      await startRecordingInternal();
    } catch (err) {
      // Error already handled in startRecordingInternal
      audioStateMachine.reset();
    }
  }, [status.state, startRecordingInternal]);

  /**
   * ✅ NOUVEAU v19.4 : Complete turn with IA + TTS
   * Call this after recording stops (manual or VAD)
   */
  const completeTurn = useCallback(async () => {
    try {
      logger.debug('Completing turn...');

      // Stop recording et obtenir transcription
      const transcript = await stopRecordingInternal();

      if (!transcript || !transcript.trim()) {
        logger.warn('Empty transcript, cancelling turn');
        if (mountedRef.current) {
          setStatus(prev => ({ ...prev, state: 'idle' }));
        }
        audioStateMachine.reset();
        return;
      }

      // Traiter avec IA + TTS
      await processTurnWithAI(transcript);
    } catch (error) {
      logger.error('completeTurn error:', error);
      handleError(
        error instanceof Error ? error : new Error(String(error)),
        'completeTurn'
      );
    }
  }, [stopRecordingInternal, processTurnWithAI, handleError]);

  /**
   * ✅ NOUVEAU v19.4 : Complete turn with pre-transcribed text (one-shot)
   * Used for wake word one-shot mode: "Titane, ouvre X" → direct to IA
   */
  const completeTurnWithText = useCallback(
    async (text: string) => {
      try {
        logger.debug('Completing turn with text:', text);

        if (!text || !text.trim()) {
          logger.warn('Empty text, cancelling turn');
          if (mountedRef.current) {
            setStatus(prev => ({ ...prev, state: 'idle' }));
          }
          audioStateMachine.reset();
          return;
        }

        // Update transcript in status
        if (mountedRef.current) {
          setStatus(prev => ({
            ...prev,
            transcript: text,
            state: 'processing',
          }));
        }

        // Traiter avec IA + TTS
        await processTurnWithAI(text);
      } catch (error) {
        logger.error('completeTurnWithText error:', error);
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          'completeTurnWithText'
        );
      }
    },
    [processTurnWithAI, handleError]
  );

  /**
   * ✅ REFACTORÉ v19.3.1 : Cancel avec VoiceRouter
   */
  const cancelTurn = useCallback(async () => {
    try {
      logger.debug('Cancelling turn, state:', status.state);

      // Abort VoiceRouter si tour en cours
      await voiceRouter.abort();

      // Cancel recording if active
      if (status.isRecording) {
        await voiceService.cancelRecording();
      }

      // Stop TTS if speaking (redondant avec voiceRouter.abort, mais sécurité)
      if (status.state === 'speaking') {
        await hybridTTS.stop();
      }

      // Reset state machine
      audioStateMachine.reset();

      // Reset UI state
      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
          isRecording: false,
          transcript: '',
          interimTranscript: '',
        }));
      }

      logger.debug('Turn cancelled successfully');
    } catch (err) {
      logger.error('Cancel error:', err);
      // Force reset anyway
      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
          isRecording: false,
        }));
      }
      audioStateMachine.reset();
    }
  }, [status.isRecording, status.state]);

  // ═══ MODE DICTATION (texte seul, sans IA) ═══

  const startDictation = useCallback(async () => {
    if (status.state !== 'idle') {
      logger.warn('Cannot start dictation: not idle');
      return;
    }

    try {
      // Note: On n'utilise PAS la state machine pour la dictée
      // car c'est un mode "micro → texte" sans conversation
      await startRecordingInternal();
      logger.debug('Dictation started');
    } catch (err) {
      // Error already handled
    }
  }, [status.state, startRecordingInternal]);

  const stopDictation = useCallback(async (): Promise<string> => {
    if (!status.isRecording) {
      logger.warn('No dictation in progress');
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

      logger.debug('Dictation stopped, result:', transcript);
      return transcript;
    } catch (err) {
      return '';
    }
  }, [status.isRecording, stopRecordingInternal]);

  // ═══ TTS ═══

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        logger.warn('Empty text, skipping TTS');
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
    },
    [handleError]
  );

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
      logger.error('Stop speaking error:', err);
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

  // ═══ WAKE WORD & ATTENTION (v19.4) ═══

  const activateWakeWord = useCallback(() => {
    logger.debug('Activating wake word mode');
    attentionEngine.activate();
    setStatus(prev => ({
      ...prev,
      listeningMode: 'wake_word',
      attentionState: 'armed',
    }));
  }, []);

  const deactivateWakeWord = useCallback(() => {
    logger.debug('Deactivating wake word mode');
    attentionEngine.deactivate();
    setStatus(prev => ({
      ...prev,
      listeningMode: 'off',
      attentionState: 'inactive',
    }));
  }, []);

  const setPushToTalk = useCallback(() => {
    logger.debug('Switching to push-to-talk');
    attentionEngine.setPushToTalk();
    setStatus(prev => ({
      ...prev,
      listeningMode: 'push_to_talk',
      attentionState: 'inactive',
    }));
  }, []);

  const getListeningMode = useCallback(() => {
    return attentionEngine.getMode();
  }, []);

  const getAttentionState = useCallback(() => {
    return attentionEngine.getState();
  }, []);

  // ═══ FULL DUPLEX (v∞.5) ═══

  const enableFullDuplex = useCallback(async () => {
    logger.debug('Enabling full duplex mode');
    await fullDuplexOrchestrator.enable();
    setStatus(prev => ({
      ...prev,
      fullDuplexMode: true,
      fullDuplexState: fullDuplexOrchestrator.getState(),
    }));
  }, []);

  const disableFullDuplex = useCallback(async () => {
    logger.debug('Disabling full duplex mode');
    await fullDuplexOrchestrator.disable();
    setStatus(prev => ({
      ...prev,
      fullDuplexMode: false,
      fullDuplexState: undefined,
    }));
  }, []);

  const interrupt = useCallback(async () => {
    logger.debug('User interruption');
    await fullDuplexOrchestrator.interrupt();
  }, []);

  const injectInterruption = useCallback(
    async (text: string) => {
      logger.debug('Inject interruption:', text);
      await fullDuplexOrchestrator.injectInterruption(text);

      // Process interruption text via chat engine
      if (chat.sendMessage) {
        // Mark as interruption for context-aware response
        await chat.sendMessage(`[INTERRUPTED] ${text}`);
      }
    },
    [chat]
  );

  // ═══ EMERGENCY RESET (v∞.7) ═══

  /**
   * Force reset voice engine - 🔥 HARD RESET
   * Kills all processes, clears state, resets flags
   */
  const forceVoiceReset = useCallback(async () => {
    try {
      logger.warn('FORCE RESET VOICE ENGINE');

      // Cancel any ongoing operations
      await cancelTurn();

      // Call backend force reset
      await voiceService.forceResetVoice();

      // Reset local state
      if (mountedRef.current) {
        setStatus({
          state: 'idle',
          transcript: '',
          interimTranscript: '',
          lastError: null,
          isMicAvailable: status.isMicAvailable,
          isTTSAvailable: status.isTTSAvailable,
          isRecording: false,
          listeningMode: 'off',
          attentionState: 'inactive',
          fullDuplexMode: status.fullDuplexMode,
          isSpeaking: false,
          isListening: false,
        });
      }

      // Reset audio state machine
      audioStateMachine.reset();

      logger.debug('Voice reset complete');
    } catch (error) {
      logger.error('Force reset error:', error);
      // Force local state reset anyway
      if (mountedRef.current) {
        setStatus(prev => ({
          ...prev,
          state: 'idle',
          isRecording: false,
        }));
      }
    }
  }, [cancelTurn, status.isMicAvailable, status.isTTSAvailable, status.fullDuplexMode]);

  // Subscribe to full duplex events
  useEffect(() => {
    if (!options.fullDuplexMode) {
      return;
    }

    const unsubscribe = fullDuplexOrchestrator.onEvent((event: FullDuplexEvent) => {
      if (!mountedRef.current) return;

      setStatus(prev => ({
        ...prev,
        fullDuplexState: event.state,
        isSpeaking: fullDuplexOrchestrator.isSpeakingNow(),
        isListening: fullDuplexOrchestrator.isListeningNow(),
      }));
    });

    return unsubscribe;
  }, [options.fullDuplexMode]);

  return {
    status,
    startTurn,
    completeTurn, // ✅ NOUVEAU v19.4 : pour compléter le tour vocal
    completeTurnWithText, // ✅ NOUVEAU v19.4 : pour one-shot wake word
    cancelTurn,
    startDictation,
    stopDictation,
    speak,
    stopSpeaking,
    clearTranscript,
    clearError,
    // Wake Word & Attention (v19.4)
    activateWakeWord,
    deactivateWakeWord,
    setPushToTalk,
    getListeningMode,
    getAttentionState,
    // Full Duplex (v∞.5)
    enableFullDuplex,
    disableFullDuplex,
    interrupt,
    injectInterruption,
    // Emergency Reset (v∞.7)
    forceVoiceReset,
  };
}

export default useVoiceEngine;
