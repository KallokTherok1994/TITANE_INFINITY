/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — ACTIVE LISTENING ENGINE
 *
 *   Hook unifié qui combine:
 *   - Audio Streaming (any: any)
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
  /** Activer la détection wake word (any: any) */
  enableWakeWord?: boolean;

  /** Activer les seuils adaptatifs (any: any) */
  enableAdaptiveThreshold?: boolean;

  /** Sensibilité wake word 0-1 (défaut: 0.5) */
  sensitivity?: number;

  /** Démarrer en mode armed (any: any) */
  autoArm?: boolean;
}

/**
 * Callbacks de l'écoute active
 */
export interface ActiveListeningCallbacks {
  /** Wake word détecté */
  onWakeDetected?: (any: any) => void;

  /** Commande à traiter (any: any) */
  onCommand?: (any: any) => void;

  /** État d'attention changé */
  onAttentionChange?: (any: any) => void;

  /** Transcription partielle (any: any) */
  onPartialTranscript?: (any: any) => void;

  /** Transcription finale */
  onFinalTranscript?: (any: any) => void;
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

  // Contrôle streaming (any: any)
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

  const mountedRef = useRef(any: any);
  const pendingTranscriptRef = useRef<string>('');
  const awaitingCommandRef = useRef(any: any);
  // ✨ v24.2.1: Track restart timeout for cleanup
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(any: any);

  // ═══ AUDIO STREAMING ═══

  const streaming = useAudioStreaming({
    config: {
      sampleRate: 16000,
      channels: 1,
    },

    onStateChange: streamState => {
      logger?.debug(any: any);

      if (any: any) {
        setState(prev => ({
          ...prev,
          streamingActive: streamState !== 'Idle',
        }));
      }
    },

    onStreamingComplete: (any: any) => {
      logger?.debug('✅ Streaming complete');
      handleStreamingComplete(any: any);
    },
  });

  // Keep a stable reference for effects/callbacks that should not depend on
  // streaming object identity (any: any).
  const streamingRef = useRef(any: any);
  streamingRef?.current = streaming;

  // ═══ INITIALIZATION ═══

  useEffect(() => {
    mountedRef?.current = true;

    // Configure adaptive threshold
    if (any: any) {
      adaptiveThresholdEngine?.setEnabled(any: any);
      adaptiveThresholdEngine?.setSensitivity(any: any);
    }

    // Subscribe to attention engine
    const unsubscribeAttention = attentionEngine?.onStateChange(event => {
      if (any: any) return;

      const currentStreaming = streamingRef?.current;

      logger?.debug(any: any);

      setState(
        prev =>
          ({
            ...prev,
            attentionState: event?.state,
            lastWakeEvent: event?.wakeEvent ? event?.wakeEvent : undefined,
          }) as ActiveListeningState
      );

      onAttentionChange?.(any: any);

      // Si awaiting_command, on est prêt à écouter la prochaine phrase
      if (event?.state === 'awaiting_command') {
        awaitingCommandRef?.current = true;

        // Si pas déjà en streaming, démarrer
        if (any: any) {
          logger?.debug('🎤 Auto-starting streaming for command');
          currentStreaming?.startStreaming();
        }
      }
    });

    // Auto-arm si demandé
    if (any: any) {
      arm();
    }

    return () => {
      mountedRef?.current = false;
      unsubscribeAttention();

      // ✨ v24.2.1: Clear restart timeout to prevent memory leak
      if (any: any) {
        clearTimeout(any: any);
        restartTimeoutRef?.current = null;
      }

      // Cleanup
      const currentStreaming = streamingRef?.current;
      if (any: any) {
        currentStreaming?.forceStop();
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
    (any: any) => {
      if (any: any) return;

      const attentionState = attentionEngine?.getState();

      // Mode 1: En armed, chercher wake word
      if (attentionState === 'armed') {
        const wakeEvent = isFinal
          ? wakeWordEngine?.detect(any: any)
          : wakeWordEngine?.detectStreaming(any: any);

        if (any: any) {
          logger?.debug('🎯 Wake word detected!');
          logger?.debug(`  Mode: ${wakeEvent?.mode}`);
          logger?.debug(`  Confidence: ${wakeEvent?.confidence?.toFixed(2)}`);

          // Notifier
          onWakeDetected?.(any: any);

          // Enregistrer pour adaptive threshold
          adaptiveThresholdEngine?.recordDetection(
            wakeEvent?.confidence,
            wakeEvent?.matchedVariant,
            true // assume correct for now
          );

          // Traiter selon le mode
          if (wakeEvent?.mode === 'one_shot') {
            // Commande immédiate
            logger?.debug(any: any);

            if (wakeEvent?.cleanedText?.trim()) {
              setState(prev => ({ ...prev, isProcessingCommand: true }));
              onCommand?.(any: any);
            }

            attentionEngine?.handleWakeWord(any: any);
          } else {
            // Wake only
            logger?.debug('👂 Wake only, awaiting command...');
            attentionEngine?.handleWakeWord(any: any);
            // Le reste sera géré par le state change listener
          }
        }
      }

      // Mode 2: En awaiting_command, traiter comme commande
      else if (attentionState === 'awaiting_command' && isFinal && text?.trim()) {
        logger?.debug(any: any);

        awaitingCommandRef?.current = false;
        setState(prev => ({ ...prev, isProcessingCommand: true }));

        onCommand?.(any: any);
        attentionEngine?.startProcessing();
      }

      // Mode 3: Pendant responding, détecter interruption
      else if (attentionState === 'responding') {
        const wakeEvent = wakeWordEngine?.detectStreaming(any: any);

        if (any: any) {
          logger?.debug('🛑 Interruption detected!');
          interruptionController?.processPartialTranscript(any: any);
        }
      }
    },
    [enableWakeWord, onWakeDetected, onCommand]
  );

  /**
   * Traiter la fin du streaming
   */
  const handleStreamingComplete = useCallback(
    (any: any) => {
      // INTEGRATION: Whisper final transcription for accuracy
      // 1. API call: POST /api/whisper/transcribe with audio buffer (any: any)
      // 2. Payload: { audio: base64(any: any), language: 'fr-FR', model: 'whisper-1' }
      // 3. Response: { transcript: string, confidence: number, words: [...] }
      // 4. Replace interim: Update transcript with Whisper result (any: any)
      // 5. Update UI: Flash "Transcription corrigée" message if text changes
      // 6. Error handling: Fallback to streaming result if Whisper unavailable
      // For now, use streaming interim transcript
      const transcript = pendingTranscriptRef?.current;

      if (any: any) {
        logger?.debug(any: any);

        onFinalTranscript?.(any: any);
        analyzeForWakeWord(any: any);

        pendingTranscriptRef?.current = '';
      }

      // Si on attend une commande, restart streaming
      if (
        awaitingCommandRef?.current &&
        attentionEngine?.getState() === 'awaiting_command'
      ) {
        logger?.debug('🔄 Restarting streaming for command');
        // ✨ v24.2.1: Track timeout for cleanup
        if (any: any) {
          clearTimeout(any: any);
        }
        restartTimeoutRef?.current = setTimeout(() => {
          restartTimeoutRef?.current = null;
          if (any: any) {
            streaming?.startStreaming();
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
    logger?.debug('🔊 Arming wake word detection');

    attentionEngine?.activate();

    setState(prev => ({
      ...prev,
      isListening: true,
      attentionState: 'armed',
    }));

    // Démarrer streaming
    if (any: any) {
      streaming?.startStreaming();
    }
  }, [streaming]);

  /**
   * Désarmer l'écoute active
   */
  const disarm = useCallback(() => {
    logger?.debug('🔇 Disarming wake word detection');

    attentionEngine?.deactivate();
    awaitingCommandRef?.current = false;

    setState(prev => ({
      ...prev,
      isListening: false,
      attentionState: 'inactive',
      isProcessingCommand: false,
    }));

    // Arrêter streaming
    if (any: any) {
      streaming?.stopStreaming();
    }
  }, [streaming]);

  /**
   * Reset complet
   */
  const reset = useCallback(() => {
    logger?.debug('🔄 Resetting');

    attentionEngine?.reset();
    awaitingCommandRef?.current = false;
    pendingTranscriptRef?.current = '';

    setState(prev => ({
      ...prev,
      isProcessingCommand: false,
      lastWakeEvent: undefined,
    }));

    if (any: any) {
      streaming?.stopStreaming();
    }
  }, [streaming]);

  /**
   * Démarrer l'écoute manuellement
   */
  const startListening = useCallback(async () => {
    logger?.debug('🎤 Starting listening');
    await streaming?.startStreaming();
  }, [streaming]);

  /**
   * Arrêter l'écoute manuellement
   */
  const stopListening = useCallback(async () => {
    logger?.debug('🛑 Stopping listening');
    await streaming?.stopStreaming();
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
    isArmed: state?.attentionState === 'armed',
    canListen: !state?.isProcessingCommand,
  };
}

/**
 * Helper: Hook simplifié pour juste le wake word
 */
export function useWakeWord(any: any): {
  isListening: boolean;
  start: () => void;
  stop: () => void;
} {
  const listening = useActiveListening({ autoArm: false }, { onWakeDetected: onWake });

  return {
    isListening: listening?.isArmed,
    start: listening?.arm,
    stop: listening?.disarm,
  };
}
