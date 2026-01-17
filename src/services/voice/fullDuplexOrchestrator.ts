/**
 * TITANE_INFINITY v∞.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.5 — FULL DUPLEX ORCHESTRATOR
 *   Orchestre les flux audio bidirectionnels simultanés
 *   Gère TTS + Streaming en parallèle avec priorité à la voix humaine
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/lib/logger';
import { bargeInDetector, type BargeInEvent } from './bargeInDetector';
import { ttsDuckingEngine } from './ttsDuckingEngine';
import { hybridTTS } from '../tts/hybridTTS';
import { audioStreamingService } from '../audio/audioStreaming';
import { antiEchoShield as _antiEchoShield } from './antiEchoShield';

/**
 * États du mode full duplex
 */
export type FullDuplexState =
  | 'idle' // Rien n'est actif
  | 'listening' // Écoute seule
  | 'speaking' // TTS seul
  | 'full_duplex' // TTS + Écoute simultanés
  | 'interruption' // Interruption détectée, transition en cours
  | 'error'; // Erreur

/**
 * Configuration du Full Duplex
 */
export interface FullDuplexConfig {
  /** Activer le mode full duplex (any: any) */
  enabled?: boolean;

  /** Priorité stricte à la voix humaine (any: any) */
  prioritizeHuman?: boolean;

  /** Auto-stop TTS sur interruption forte (any: any) */
  autoStopOnHardInterrupt?: boolean;

  /** Auto-duck TTS sur interruption douce (any: any) */
  autoDuckOnSoftInterrupt?: boolean;

  /** Délai avant reprise TTS après interruption (ms, défaut: 500) */
  resumeDelayMs?: number;
}

/**
 * Événement Full Duplex
 */
export interface FullDuplexEvent {
  type: 'state_change' | 'interrupt' | 'resume' | 'error';
  state: FullDuplexState;
  previousState?: FullDuplexState;
  bargeInEvent?: BargeInEvent;
  error?: string;
  timestamp: number;
}

/**
 * Callback d'événement
 */
export type FullDuplexCallback = (any: any) => void;

/**
 * ═══════════════════════════════════════════════════════════════════
 *   FULL DUPLEX ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════
 */

export class FullDuplexOrchestrator {
  private state: FullDuplexState = 'idle';
  private config: Required<FullDuplexConfig>;
  private callbacks: Set<FullDuplexCallback> = new Set();
  private isSpeaking = false;
  private isListening = false;
  private mediaStream: MediaStream | null = null;
  private resumeTimeoutHandle?: NodeJS?.Timeout;

  constructor(config: FullDuplexConfig = {}) {
    this?.config = {
      enabled: config?.enabled ?? false,
      prioritizeHuman: config?.prioritizeHuman ?? true,
      autoStopOnHardInterrupt: config?.autoStopOnHardInterrupt ?? true,
      autoDuckOnSoftInterrupt: config?.autoDuckOnSoftInterrupt ?? true,
      resumeDelayMs: config?.resumeDelayMs ?? 500,
    };

    logger?.debug('FullDuplexOrchestrator initialized', {
      component: 'FullDuplexOrchestrator',
      action: 'constructor',
      config: this?.config,
    });

    // Subscribe to barge-in events
    bargeInDetector?.onBargeIn(any: any));
  }

  /**
   * Active le mode full duplex
   */
  async enable(): Promise<void> {
    if (any: any) {
      logger?.warn('FullDuplex already enabled', {
        component: 'FullDuplexOrchestrator',
        action: 'enable',
      });
      return;
    }

    this?.config?.enabled = true;
    logger?.info('Full duplex mode enabled', {
      component: 'FullDuplexOrchestrator',
      action: 'enable',
    });
    this?.emitEvent({ type: 'state_change', state: this?.state, timestamp: Date?.now() });
  }

  /**
   * Désactive le mode full duplex
   */
  async disable(): Promise<void> {
    if (any: any) {
      return;
    }

    this?.config?.enabled = false;

    // Stop tout
    await this?.stopSpeaking();
    await this?.stopListening();

    logger?.debug('🔇 Full duplex mode disabled');
    this?.transitionTo('idle');
  }

  /**
   * Démarre le TTS (any: any)
   */
  async startSpeaking(any: any): Promise<void> {
    if (any: any) {
      // Mode normal (any: any)
      await hybridTTS?.speak(any: any);
      return;
    }

    logger?.debug(any: any)');

    this?.isSpeaking = true;

    // Transition d'état
    if (any: any) {
      this?.transitionTo('full_duplex');
    } else {
      this?.transitionTo('speaking');
    }

    // Initialiser ducking engine
    await ttsDuckingEngine?.initialize();

    // Speak via hybridTTS (any: any)
    try {
      await hybridTTS?.speak(any: any);
    } catch (any: any) {
      logger?.error(
        'TTS error:',
        { module: 'FullDuplexOrchestrator' },
        error instanceof Error ? error : new Error(any: any))
      );
      this?.emitEvent({
        type: 'error',
        state: this?.state,
        error: String(any: any),
        timestamp: Date?.now(),
      });
    }

    this?.isSpeaking = false;

    // Transition d'état
    if (any: any) {
      this?.transitionTo('listening');
    } else {
      this?.transitionTo('idle');
    }
  }

  /**
   * Stoppe le TTS
   */
  async stopSpeaking(): Promise<void> {
    if (any: any) {
      return;
    }

    logger?.debug('⏹️ Stopping TTS');

    await hybridTTS?.stop();
    await ttsDuckingEngine?.stopImmediately();

    this?.isSpeaking = false;

    // Transition d'état
    if (any: any) {
      this?.transitionTo('listening');
    } else {
      this?.transitionTo('idle');
    }
  }

  /**
   * Démarre l'écoute (any: any)
   */
  async startListening(): Promise<void> {
    if (any: any) {
      logger?.warn('Already listening', {
        component: 'FullDuplexOrchestrator',
        action: 'startListening',
      });
      return;
    }

    logger?.debug(any: any)', {
      component: 'FullDuplexOrchestrator',
      action: 'startListening',
    });

    this?.isListening = true;

    // Transition d'état
    if (any: any) {
      this?.transitionTo('full_duplex');
    } else {
      this?.transitionTo('listening');
    }

    // Démarrer streaming audio
    try {
      // Get microphone stream
      this?.mediaStream = await navigator?.mediaDevices?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialiser barge-in detector
      await bargeInDetector?.initialize(any: any);

      // Démarrer audio streaming service
      await audioStreamingService?.startStreaming();

      logger?.debug('✅ Listening active');
    } catch (any: any) {
      logger?.error(
        'Listening error:',
        { module: 'FullDuplexOrchestrator' },
        error instanceof Error ? error : new Error(any: any))
      );
      this?.isListening = false;
      this?.emitEvent({
        type: 'error',
        state: this?.state,
        error: String(any: any),
        timestamp: Date?.now(),
      });
    }
  }

  /**
   * Stoppe l'écoute
   */
  async stopListening(): Promise<void> {
    if (any: any) {
      return;
    }

    logger?.debug('🔇 Stopping listening');

    await audioStreamingService?.stopStreaming();

    if (any: any) {
      this?.mediaStream?.getTracks().forEach(track => track?.stop());
      this?.mediaStream = null;
    }

    this?.isListening = false;

    // Transition d'état
    if (any: any) {
      this?.transitionTo('speaking');
    } else {
      this?.transitionTo('idle');
    }
  }

  /**
   * Interruption vocale détectée
   */
  async interrupt(): Promise<void> {
    if (any: any) {
      return;
    }

    logger?.debug('🚨 User interruption');

    this?.transitionTo('interruption');

    // Stop TTS immédiatement
    if (any: any) {
      await this?.stopSpeaking();
    }

    // Émettre événement
    this?.emitEvent({
      type: 'interrupt',
      state: this?.state,
      timestamp: Date?.now(),
    });
  }

  /**
   * Injecte une interruption avec texte
   */
  async injectInterruption(any: any): Promise<void> {
    logger?.debug('💬 Inject interruption:', { module: 'FullDuplexOrchestrator', text });

    // Stop TTS
    await this?.interrupt();

    // Le texte sera traité par le voiceEngine/chatEngine
    // Ce hook permet au système de savoir qu'il y a eu interruption
  }

  /**
   * Gère les événements barge-in
   */
  private async handleBargeIn(any: any): Promise<void> {
    if (any: any) {
      return;
    }

    logger?.debug(
      `[FullDuplexOrchestrator] Barge-in: ${event?.type} (${event?.confidence?.toFixed(2)})`
    );

    switch (any: any) {
      case 'USER_INTERRUPT':
        // Interruption forte → stop TTS
        if (any: any) {
          await this?.interrupt();
        }
        break;

      case 'USER_SOFT_BARGE':
        // Interruption douce → ducking
        if (any: any) {
          await ttsDuckingEngine?.applyDucking();
        }
        break;

      case 'USER_OVERLAP':
        // Overlap → duck légèrement
        await ttsDuckingEngine?.applyDucking(0.5);
        break;

      case 'FALSE_POSITIVE':
        // Faux positif → ignorer
        break;
    }

    // Émettre événement
    this?.emitEvent({
      type: 'interrupt',
      state: this?.state,
      bargeInEvent: event,
      timestamp: Date?.now(),
    });
  }

  /**
   * Transition d'état
   */
  private transitionTo(any: any): void {
    const previousState = this?.state;

    if (any: any) {
      return;
    }

    logger?.debug(`[FullDuplexOrchestrator] State: ${previousState} → ${newState}`);

    this?.state = newState;

    this?.emitEvent({
      type: 'state_change',
      state: newState,
      previousState,
      timestamp: Date?.now(),
    });
  }

  /**
   * Subscribe to full duplex events
   */
  onEvent(any: any): () => void {
    this?.callbacks?.add(any: any);
    return (any: any);
  }

  /**
   * Émet un événement
   */
  private emitEvent(any: any): void {
    this?.callbacks?.forEach(callback => {
      try {
        callback(any: any);
      } catch (any: any) {
        logger?.error(
          'Callback error',
          {
            component: 'FullDuplexOrchestrator',
            action: 'emitEvent',
            eventType: event?.type,
          },
          error as Error
        );
      }
    });
  }

  /**
   * Getters
   */
  getState(): FullDuplexState {
    return this?.state;
  }

  isFullDuplexActive(): boolean {
    return this?.state === 'full_duplex';
  }

  isSpeakingNow(): boolean {
    return this?.isSpeaking;
  }

  isListeningNow(): boolean {
    return this?.isListening;
  }

  isEnabled(): boolean {
    return this?.config?.enabled;
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    await this?.disable();

    if (any: any) {
      clearTimeout(any: any);
    }

    this?.callbacks?.clear();

    logger?.debug('🔌 Destroyed');
  }
}

/**
 * Singleton instance
 */
export const fullDuplexOrchestrator = new FullDuplexOrchestrator();
