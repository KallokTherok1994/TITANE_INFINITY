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
  /** Activer le mode full duplex (défaut: false) */
  enabled?: boolean;

  /** Priorité stricte à la voix humaine (défaut: true) */
  prioritizeHuman?: boolean;

  /** Auto-stop TTS sur interruption forte (défaut: true) */
  autoStopOnHardInterrupt?: boolean;

  /** Auto-duck TTS sur interruption douce (défaut: true) */
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
export type FullDuplexCallback = (event: FullDuplexEvent) => void;

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
  private resumeTimeoutHandle?: NodeJS.Timeout;

  constructor(config: FullDuplexConfig = {}) {
    this.config = {
      enabled: config.enabled ?? false,
      prioritizeHuman: config.prioritizeHuman ?? true,
      autoStopOnHardInterrupt: config.autoStopOnHardInterrupt ?? true,
      autoDuckOnSoftInterrupt: config.autoDuckOnSoftInterrupt ?? true,
      resumeDelayMs: config.resumeDelayMs ?? 500,
    };

    logger.debug('FullDuplexOrchestrator initialized', {
      component: 'FullDuplexOrchestrator',
      action: 'constructor',
      config: this.config,
    });

    // Subscribe to barge-in events
    bargeInDetector.onBargeIn(this.handleBargeIn.bind(this));
  }

  /**
   * Active le mode full duplex
   */
  async enable(): Promise<void> {
    if (this.config.enabled) {
      logger.warn('FullDuplex already enabled', {
        component: 'FullDuplexOrchestrator',
        action: 'enable',
      });
      return;
    }

    this.config.enabled = true;
    logger.info('Full duplex mode enabled', {
      component: 'FullDuplexOrchestrator',
      action: 'enable',
    });
    this.emitEvent({ type: 'state_change', state: this.state, timestamp: Date.now() });
  }

  /**
   * Désactive le mode full duplex
   */
  async disable(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    this.config.enabled = false;

    // Stop tout
    await this.stopSpeaking();
    await this.stopListening();

    console.log('[FullDuplexOrchestrator] 🔇 Full duplex mode disabled');
    this.transitionTo('idle');
  }

  /**
   * Démarre le TTS (entre en mode speaking ou full_duplex)
   */
  async startSpeaking(text: string): Promise<void> {
    if (!this.config.enabled) {
      // Mode normal (pas de full duplex)
      await hybridTTS.speak(text);
      return;
    }

    console.log('[FullDuplexOrchestrator] 🎤 Starting TTS (full duplex)');

    this.isSpeaking = true;

    // Transition d'état
    if (this.isListening) {
      this.transitionTo('full_duplex');
    } else {
      this.transitionTo('speaking');
    }

    // Initialiser ducking engine
    await ttsDuckingEngine.initialize();

    // Speak via hybridTTS (avec hooks anti-echo existants)
    try {
      await hybridTTS.speak(text);
    } catch (error) {
      console.error('[FullDuplexOrchestrator] TTS error:', error);
      this.emitEvent({
        type: 'error',
        state: this.state,
        error: String(error),
        timestamp: Date.now(),
      });
    }

    this.isSpeaking = false;

    // Transition d'état
    if (this.isListening) {
      this.transitionTo('listening');
    } else {
      this.transitionTo('idle');
    }
  }

  /**
   * Stoppe le TTS
   */
  async stopSpeaking(): Promise<void> {
    if (!this.isSpeaking) {
      return;
    }

    console.log('[FullDuplexOrchestrator] ⏹️ Stopping TTS');

    await hybridTTS.stop();
    await ttsDuckingEngine.stopImmediately();

    this.isSpeaking = false;

    // Transition d'état
    if (this.isListening) {
      this.transitionTo('listening');
    } else {
      this.transitionTo('idle');
    }
  }

  /**
   * Démarre l'écoute (entre en mode listening ou full_duplex)
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      logger.warn('Already listening', {
        component: 'FullDuplexOrchestrator',
        action: 'startListening',
      });
      return;
    }

    logger.debug('Starting listening (full duplex)', {
      component: 'FullDuplexOrchestrator',
      action: 'startListening',
    });

    this.isListening = true;

    // Transition d'état
    if (this.isSpeaking) {
      this.transitionTo('full_duplex');
    } else {
      this.transitionTo('listening');
    }

    // Démarrer streaming audio
    try {
      // Get microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialiser barge-in detector
      await bargeInDetector.initialize(this.mediaStream);

      // Démarrer audio streaming service
      await audioStreamingService.startStreaming();

      console.log('[FullDuplexOrchestrator] ✅ Listening active');
    } catch (error) {
      console.error('[FullDuplexOrchestrator] Listening error:', error);
      this.isListening = false;
      this.emitEvent({
        type: 'error',
        state: this.state,
        error: String(error),
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Stoppe l'écoute
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    console.log('[FullDuplexOrchestrator] 🔇 Stopping listening');

    await audioStreamingService.stopStreaming();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.isListening = false;

    // Transition d'état
    if (this.isSpeaking) {
      this.transitionTo('speaking');
    } else {
      this.transitionTo('idle');
    }
  }

  /**
   * Interruption vocale détectée
   */
  async interrupt(): Promise<void> {
    if (!this.config.enabled || !this.isSpeaking) {
      return;
    }

    console.log('[FullDuplexOrchestrator] 🚨 User interruption');

    this.transitionTo('interruption');

    // Stop TTS immédiatement
    if (this.config.autoStopOnHardInterrupt) {
      await this.stopSpeaking();
    }

    // Émettre événement
    this.emitEvent({
      type: 'interrupt',
      state: this.state,
      timestamp: Date.now(),
    });
  }

  /**
   * Injecte une interruption avec texte
   */
  async injectInterruption(text: string): Promise<void> {
    console.log('[FullDuplexOrchestrator] 💬 Inject interruption:', text);

    // Stop TTS
    await this.interrupt();

    // Le texte sera traité par le voiceEngine/chatEngine
    // Ce hook permet au système de savoir qu'il y a eu interruption
  }

  /**
   * Gère les événements barge-in
   */
  private async handleBargeIn(event: BargeInEvent): Promise<void> {
    if (!this.config.enabled || !this.isSpeaking) {
      return;
    }

    console.log(
      `[FullDuplexOrchestrator] Barge-in: ${event.type} (${event.confidence.toFixed(2)})`
    );

    switch (event.type) {
      case 'USER_INTERRUPT':
        // Interruption forte → stop TTS
        if (this.config.autoStopOnHardInterrupt) {
          await this.interrupt();
        }
        break;

      case 'USER_SOFT_BARGE':
        // Interruption douce → ducking
        if (this.config.autoDuckOnSoftInterrupt) {
          await ttsDuckingEngine.applyDucking();
        }
        break;

      case 'USER_OVERLAP':
        // Overlap → duck légèrement
        await ttsDuckingEngine.applyDucking(0.5);
        break;

      case 'FALSE_POSITIVE':
        // Faux positif → ignorer
        break;
    }

    // Émettre événement
    this.emitEvent({
      type: 'interrupt',
      state: this.state,
      bargeInEvent: event,
      timestamp: Date.now(),
    });
  }

  /**
   * Transition d'état
   */
  private transitionTo(newState: FullDuplexState): void {
    const previousState = this.state;

    if (previousState === newState) {
      return;
    }

    console.log(`[FullDuplexOrchestrator] State: ${previousState} → ${newState}`);

    this.state = newState;

    this.emitEvent({
      type: 'state_change',
      state: newState,
      previousState,
      timestamp: Date.now(),
    });
  }

  /**
   * Subscribe to full duplex events
   */
  onEvent(callback: FullDuplexCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Émet un événement
   */
  private emitEvent(event: FullDuplexEvent): void {
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        logger.error(
          'Callback error',
          {
            component: 'FullDuplexOrchestrator',
            action: 'emitEvent',
            eventType: event.type,
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
    return this.state;
  }

  isFullDuplexActive(): boolean {
    return this.state === 'full_duplex';
  }

  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  isListeningNow(): boolean {
    return this.isListening;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    await this.disable();

    if (this.resumeTimeoutHandle) {
      clearTimeout(this.resumeTimeoutHandle);
    }

    this.callbacks.clear();

    console.log('[FullDuplexOrchestrator] 🔌 Destroyed');
  }
}

/**
 * Singleton instance
 */
export const fullDuplexOrchestrator = new FullDuplexOrchestrator();
