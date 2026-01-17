/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — ACTIVE LISTENING ENGINE
 *
 *   Hook unifié qui combine:
 *   - Audio Streaming (CPAL real-time)
 *   - Wake Word Detection ("TITANE")
 *   - Attention State Management
 *   - Auto-processing pipeline
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAudioStreaming } from './useAudioStreaming';
import { wakeWordEngine, type WakeWordEvent } from '@/services/voice/wakeWordEngine';
import { attentionEngine, type AttentionState } from '@/services/voice/attentionEngine';
import { interruptionController } from '@/services/voice/interruptionController';
import { adaptiveThresholdEngine } from '@/services/voice/adaptiveThresholdEngine';
import type { StreamingResult } from '@/services/audio/audioStreaming';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useActiveListening');

/**
 * Configuration de l'écoute active
 */
export interface ActiveListeningConfig {
  /** Activer la détection wake word (défaut: true) */
  enableWakeWord?: boolean;

  /** Activer les seuils adaptatifs (défaut: true) */
  enableAdaptiveThreshold?: boolean;

  /** Sensibilité wake word 0-1 (défaut: 0.5) */
  sensitivity?: number;

  /** Démarrer en mode armed (défaut: false) */
  autoArm?: boolean;
}

/**
 * Callbacks de l'écoute active
 */
export interface ActiveListeningCallbacks {
  /** Wake word détecté */
  onWakeDetected?: (event: WakeWordEvent) => void;

  /** Commande à traiter (one-shot ou après réveil) */
  onCommand?: (text: string, wakeEvent?: WakeWordEvent) => void;

  /** État d'attention changé */
  onAttentionChange?: (state: AttentionState) => void;

  /** Transcription partielle (streaming) */
  onPartialTranscript?: (text: string) => void;

  /** Transcription finale */
  onFinalTranscript?: (text: string) => void;
}

/**
 * État de l'écoute active
 */
export interface ActiveListeningState {
  isListening: boolean;
  attentionState: AttentionState;
  lastWakeEvent?: WakeWordEvent;
  isProcessingCommand: boolean;
  streamingActive: boolean;
}

/**
 * Return type du hook
 */
export interface UseActiveListeningReturn {
  state: ActiveListeningState;

  // Contrôle attention
  arm: () => void;
  disarm: () => void;
  reset: () => void;

  // Contrôle streaming (manuel si besoin)
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;

  // Utilitaires
  isArmed: boolean;
  canListen: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   HOOK PRINCIPAL
 * ═══════════════════════════════════════════════════════════════════
 */
export function useActiveListening(
  config: ActiveListeningConfig = {},
  callbacks: ActiveListeningCallbacks = {}
): UseActiveListeningReturn {
  const {
    enableWakeWord = true,
    enableAdaptiveThreshold = true,
    sensitivity = 0.5,
    autoArm = false,
  } = config;

  const {
    onWakeDetected,
    onCommand,
    onAttentionChange,
    onPartialTranscript: _onPartialTranscript,
    onFinalTranscript,
  } = callbacks;

  // État local
  const [state, setState] = useState<ActiveListeningState>({
    isListening: false,
    attentionState: 'inactive',
    isProcessingCommand: false,
    streamingActive: false,
  });

  const mountedRef = useRef(true);
  const pendingTranscriptRef = useRef<string>('');
  const awaitingCommandRef = useRef(false);
  // ✨ v24.2.1: Track restart timeout for cleanup
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ═══ AUDIO STREAMING ═══

  const streaming = useAudioStreaming({
    config: {
      sampleRate: 16000,
      channels: 1,
    },

    onStateChange: streamState => {
      logger.debug('🎙️ Stream state:', streamState);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          streamingActive: streamState !== 'Idle',
        }));
      }
    },

    onStreamingComplete: (result: StreamingResult) => {
      logger.debug('✅ Streaming complete');
      handleStreamingComplete(result);
    },
  });

  // Keep a stable reference for effects/callbacks that should not depend on
  // streaming object identity (prevents infinite loops with test mocks).
  const streamingRef = useRef(streaming);
  streamingRef.current = streaming;

  // ═══ INITIALIZATION ═══

  useEffect(() => {
    mountedRef.current = true;

    // Configure adaptive threshold
    if (enableAdaptiveThreshold) {
      adaptiveThresholdEngine.setEnabled(true);
      adaptiveThresholdEngine.setSensitivity(sensitivity);
    }

    // Subscribe to attention engine
    const unsubscribeAttention = attentionEngine.onStateChange(event => {
      if (!mountedRef.current) return;

      const currentStreaming = streamingRef.current;

      logger.debug('🧠 Attention:', event.state);

      setState(
        prev =>
          ({
            ...prev,
            attentionState: event.state,
            lastWakeEvent: event.wakeEvent ? event.wakeEvent : undefined,
          }) as ActiveListeningState
      );

      onAttentionChange?.(event.state);

      // Si awaiting_command, on est prêt à écouter la prochaine phrase
      if (event.state === 'awaiting_command') {
        awaitingCommandRef.current = true;

        // Si pas déjà en streaming, démarrer
        if (!currentStreaming.isStreaming) {
          logger.debug('🎤 Auto-starting streaming for command');
          currentStreaming.startStreaming();
        }
      }
    });

    // Auto-arm si demandé
    if (autoArm) {
      arm();
    }

    return () => {
      mountedRef.current = false;
      unsubscribeAttention();

      // ✨ v24.2.1: Clear restart timeout to prevent memory leak
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      // Cleanup
      const currentStreaming = streamingRef.current;
      if (currentStreaming.isStreaming) {
        currentStreaming.forceStop();
      }
    };
    // Note: Only run on unmount, other deps would cause unnecessary cleanups
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══ WAKE WORD DETECTION ═══

  /**
   * Analyser une transcription pour wake word
   */
  const analyzeForWakeWord = useCallback(
    (text: string, isFinal: boolean = false) => {
      if (!enableWakeWord) return;

      const attentionState = attentionEngine.getState();

      // Mode 1: En armed, chercher wake word
      if (attentionState === 'armed') {
        const wakeEvent = isFinal
          ? wakeWordEngine.detect(text)
          : wakeWordEngine.detectStreaming(text);

        if (wakeEvent?.detected) {
          logger.debug('🎯 Wake word detected!');
          logger.debug(`  Mode: ${wakeEvent.mode}`);
          logger.debug(`  Confidence: ${wakeEvent.confidence.toFixed(2)}`);

          // Notifier
          onWakeDetected?.(wakeEvent);

          // Enregistrer pour adaptive threshold
          adaptiveThresholdEngine.recordDetection(
            wakeEvent.confidence,
            wakeEvent.matchedVariant,
            true // assume correct for now
          );

          // Traiter selon le mode
          if (wakeEvent.mode === 'one_shot') {
            // Commande immédiate
            logger.debug('⚡ One-shot command:', wakeEvent.cleanedText);

            if (wakeEvent.cleanedText.trim()) {
              setState(prev => ({ ...prev, isProcessingCommand: true }));
              onCommand?.(wakeEvent.cleanedText, wakeEvent);
            }

            attentionEngine.handleWakeWord(wakeEvent);
          } else {
            // Wake only
            logger.debug('👂 Wake only, awaiting command...');
            attentionEngine.handleWakeWord(wakeEvent);
            // Le reste sera géré par le state change listener
          }
        }
      }

      // Mode 2: En awaiting_command, traiter comme commande
      else if (attentionState === 'awaiting_command' && isFinal && text.trim()) {
        logger.debug('📝 Command received:', text);

        awaitingCommandRef.current = false;
        setState(prev => ({ ...prev, isProcessingCommand: true }));

        onCommand?.(text);
        attentionEngine.startProcessing();
      }

      // Mode 3: Pendant responding, détecter interruption
      else if (attentionState === 'responding') {
        const wakeEvent = wakeWordEngine.detectStreaming(text);

        if (wakeEvent?.detected) {
          logger.debug('🛑 Interruption detected!');
          interruptionController.processPartialTranscript(text);
        }
      }
    },
    [enableWakeWord, onWakeDetected, onCommand]
  );

  /**
   * Traiter la fin du streaming
   */
  const handleStreamingComplete = useCallback(
    (_result: StreamingResult) => {
      // INTEGRATION: Whisper final transcription for accuracy
      // 1. API call: POST /api/whisper/transcribe with audio buffer (audioBlob)
      // 2. Payload: { audio: base64(audioBlob), language: 'fr-FR', model: 'whisper-1' }
      // 3. Response: { transcript: string, confidence: number, words: [...] }
      // 4. Replace interim: Update transcript with Whisper result (higher accuracy)
      // 5. Update UI: Flash "Transcription corrigée" message if text changes
      // 6. Error handling: Fallback to streaming result if Whisper unavailable
      // For now, use streaming interim transcript
      const transcript = pendingTranscriptRef.current;

      if (transcript) {
        logger.debug('📝 Final transcript:', transcript);

        onFinalTranscript?.(transcript);
        analyzeForWakeWord(transcript, true);

        pendingTranscriptRef.current = '';
      }

      // Si on attend une commande, restart streaming
      if (
        awaitingCommandRef.current &&
        attentionEngine.getState() === 'awaiting_command'
      ) {
        logger.debug('🔄 Restarting streaming for command');
        // ✨ v24.2.1: Track timeout for cleanup
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }
        restartTimeoutRef.current = setTimeout(() => {
          restartTimeoutRef.current = null;
          if (mountedRef.current) {
            streaming.startStreaming();
          }
        }, 100);
      }
    },
    [analyzeForWakeWord, onFinalTranscript, streaming]
  );

  // ═══ CONTROL METHODS ═══

  /**
   * Armer l'écoute active
   */
  const arm = useCallback(() => {
    logger.debug('🔊 Arming wake word detection');

    attentionEngine.activate();

    setState(prev => ({
      ...prev,
      isListening: true,
      attentionState: 'armed',
    }));

    // Démarrer streaming
    if (!streaming.isStreaming) {
      streaming.startStreaming();
    }
  }, [streaming]);

  /**
   * Désarmer l'écoute active
   */
  const disarm = useCallback(() => {
    logger.debug('🔇 Disarming wake word detection');

    attentionEngine.deactivate();
    awaitingCommandRef.current = false;

    setState(prev => ({
      ...prev,
      isListening: false,
      attentionState: 'inactive',
      isProcessingCommand: false,
    }));

    // Arrêter streaming
    if (streaming.isStreaming) {
      streaming.stopStreaming();
    }
  }, [streaming]);

  /**
   * Reset complet
   */
  const reset = useCallback(() => {
    logger.debug('🔄 Resetting');

    attentionEngine.reset();
    awaitingCommandRef.current = false;
    pendingTranscriptRef.current = '';

    setState(prev => ({
      ...prev,
      isProcessingCommand: false,
      lastWakeEvent: undefined,
    }));

    if (streaming.isStreaming) {
      streaming.stopStreaming();
    }
  }, [streaming]);

  /**
   * Démarrer l'écoute manuellement
   */
  const startListening = useCallback(async () => {
    logger.debug('🎤 Starting listening');
    await streaming.startStreaming();
  }, [streaming]);

  /**
   * Arrêter l'écoute manuellement
   */
  const stopListening = useCallback(async () => {
    logger.debug('🛑 Stopping listening');
    await streaming.stopStreaming();
  }, [streaming]);

  // ═══ RETURN ═══

  return {
    state,

    // Contrôle
    arm,
    disarm,
    reset,
    startListening,
    stopListening,

    // État
    isArmed: state.attentionState === 'armed',
    canListen: !state.isProcessingCommand,
  };
}

/**
 * Helper: Hook simplifié pour juste le wake word
 */
export function useWakeWord(onWake: (event: WakeWordEvent) => void): {
  isListening: boolean;
  start: () => void;
  stop: () => void;
} {
  const listening = useActiveListening({ autoArm: false }, { onWakeDetected: onWake });

  return {
    isListening: listening.isArmed,
    start: listening.arm,
    stop: listening.disarm,
  };
}
