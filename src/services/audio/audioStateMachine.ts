/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO STATE MACHINE
 *   [P1.1] Machine à états centralisée pour le pipeline audio
 *
 *   États: idle → user_speaking → ai_thinking → ai_speaking → idle
 *   Gère les transitions et prévient les états incohérents
 * ═══════════════════════════════════════════════════════════════════
 */
import { logger } from '@/lib/logger';
/**
 * États possibles de la conversation audio
 */
export type AudioConversationState =
  | 'idle' // Repos, prêt à écouter
  | 'user_speaking' // L'utilisateur parle (VAD actif)
  | 'processing' // Traitement STT/LLM en cours
  | 'ai_speaking' // TITANE parle (TTS actif)
  | 'paused' // En pause (micro coupé)
  | 'error'; // Erreur (nécessite reset)

/**
 * Événements déclenchant les transitions
 */
export type AudioEvent =
  | 'VAD_SPEECH_START' // VAD détecte parole user
  | 'VAD_SPEECH_END' // VAD détecte silence user
  | 'STT_COMPLETE' // Transcription terminée
  | 'LLM_RESPONSE_START' // LLM commence à répondre
  | 'TTS_START' // TTS commence à parler
  | 'TTS_END' // TTS termine de parler
  | 'TTS_ERROR' // Erreur TTS
  | 'BARGE_IN' // User interrompt AI (priorité)
  | 'PAUSE' // Pause manuelle
  | 'RESUME' // Reprise après pause
  | 'RESET' // Reset vers idle
  | 'ERROR'; // Erreur générale

/**
 * Listener pour les changements d'état
 */
export type StateChangeListener = (
  newState: AudioConversationState,
  previousState: AudioConversationState,
  event: AudioEvent
) => void;

/**
 * Configuration de la machine à états
 */
export interface AudioStateMachineConfig {
  initialState?: AudioConversationState;
  onStateChange?: StateChangeListener;
  enableLogging?: boolean;
}

/**
 * Définition des transitions valides
 */
const VALID_TRANSITIONS: Record<AudioConversationState, AudioEvent[]> = {
  idle: ['VAD_SPEECH_START', 'PAUSE', 'ERROR'],
  user_speaking: ['VAD_SPEECH_END', 'PAUSE', 'ERROR', 'RESET'],
  processing: ['LLM_RESPONSE_START', 'TTS_START', 'PAUSE', 'ERROR', 'RESET'],
  ai_speaking: ['TTS_END', 'TTS_ERROR', 'BARGE_IN', 'PAUSE', 'ERROR', 'RESET'],
  paused: ['RESUME', 'RESET'],
  error: ['RESET'],
};

/**
 * Table de transitions d'états
 */
const STATE_TRANSITIONS: Record<
  AudioConversationState,
  Partial<Record<AudioEvent, AudioConversationState>>
> = {
  idle: {
    VAD_SPEECH_START: 'user_speaking',
    PAUSE: 'paused',
    ERROR: 'error',
  },
  user_speaking: {
    VAD_SPEECH_END: 'processing',
    PAUSE: 'paused',
    ERROR: 'error',
    RESET: 'idle',
  },
  processing: {
    LLM_RESPONSE_START: 'ai_speaking',
    TTS_START: 'ai_speaking',
    PAUSE: 'paused',
    ERROR: 'error',
    RESET: 'idle',
  },
  ai_speaking: {
    TTS_END: 'idle',
    TTS_ERROR: 'error',
    BARGE_IN: 'user_speaking', // User interrompt → on écoute immédiatement
    PAUSE: 'paused',
    ERROR: 'error',
    RESET: 'idle',
  },
  paused: {
    RESUME: 'idle',
    RESET: 'idle',
  },
  error: {
    RESET: 'idle',
  },
};

/**
 * Machine à états audio centralisée
 */
class AudioStateMachine {
  private state: AudioConversationState = 'idle';
  private listeners: Set<StateChangeListener> = new Set();
  private enableLogging: boolean = true;
  private history: Array<{
    state: AudioConversationState;
    event: AudioEvent;
    timestamp: number;
  }> = [];
  private maxHistorySize = 50;

  constructor(config?: AudioStateMachineConfig) {
    if (config?.initialState) {
      this.state = config.initialState;
    }
    if (config?.onStateChange) {
      this.listeners.add(config.onStateChange);
    }
    if (config?.enableLogging !== undefined) {
      this.enableLogging = config.enableLogging;
    }
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): AudioConversationState {
    return this.state;
  }

  /**
   * Vérifier si une transition est valide
   */
  canTransition(event: AudioEvent): boolean {
    return VALID_TRANSITIONS[this.state]?.includes(event) ?? false;
  }

  /**
   * Effectuer une transition
   * ✅ v∞: Protection contre les transitions invalides avec auto-recovery
   * @returns true si la transition a réussi
   */
  transition(event: AudioEvent): boolean {
    const previousState = this.state;
    const nextState = STATE_TRANSITIONS[this.state]?.[event];

    if (!nextState) {
      if (this.enableLogging) {
        logger.warn(
          `[AudioStateMachine] ⚠️ Invalid transition: ${this.state} + ${event}`
        );
      }

      // ✅ AUTO-RECOVERY: Reset to idle on invalid transitions for critical events
      if (event === 'RESET' || event === 'ERROR') {
        logger.warn(`🛡️ Forcing state to idle due to ${event}`, {
          module: 'AudioStateMachine',
        });
        this.state = 'idle';
        this.notifyListeners('idle', previousState, event);
        return true;
      }

      return false;
    }

    // Effectuer la transition
    this.state = nextState;

    // Enregistrer dans l'historique
    this.history.push({
      state: nextState,
      event,
      timestamp: Date.now(),
    });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    if (this.enableLogging) {
      const emoji = this.getStateEmoji(nextState);
      logger.debug(
        `[AudioStateMachine] ${emoji} ${previousState} → ${nextState} (${event})`
      );
    }

    // Notifier les listeners
    this.notifyListeners(nextState, previousState, event);

    return true;
  }

  /**
   * Notify all listeners (extracted for reuse)
   */
  private notifyListeners(
    newState: AudioConversationState,
    previousState: AudioConversationState,
    event: AudioEvent
  ): void {
    this.listeners.forEach(listener => {
      try {
        listener(newState, previousState, event);
      } catch (e) {
        logger.error(
          'Listener error:',
          { module: 'AudioStateMachine' },
          e instanceof Error ? e : new Error(String(e))
        );
      }
    });
  }

  /**
   * Emoji pour chaque état (logs)
   */
  private getStateEmoji(state: AudioConversationState): string {
    const emojis: Record<AudioConversationState, string> = {
      idle: '😴',
      user_speaking: '🎤',
      processing: '⏳',
      ai_speaking: '🔊',
      paused: '⏸️',
      error: '❌',
    };
    return emojis[state] || '❓';
  }

  /**
   * S'abonner aux changements d'état
   */
  onStateChange(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reset vers idle
   * ✅ v∞: Force reset with cleanup
   */
  reset(): void {
    const previousState = this.state;
    this.state = 'idle';

    if (this.enableLogging) {
      logger.debug(`[AudioStateMachine] 🔄 RESET: ${previousState} → idle`);
    }

    // Add to history
    this.history.push({
      state: 'idle',
      event: 'RESET',
      timestamp: Date.now(),
    });
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Notify listeners
    this.notifyListeners('idle', previousState, 'RESET');
  }

  /**
   * Force emergency reset (bypasses all transitions)
   * Use for critical errors or stuck states
   */
  forceReset(): void {
    logger.warn('🚨 FORCE RESET - Emergency state cleanup');
    const previousState = this.state;
    this.state = 'idle';
    this.history.push({
      state: 'idle',
      event: 'RESET',
      timestamp: Date.now(),
    });
    this.notifyListeners('idle', previousState, 'RESET');
  }

  /**
   * Obtenir l'historique des transitions
   */
  getHistory(): Array<{
    state: AudioConversationState;
    event: AudioEvent;
    timestamp: number;
  }> {
    return [...this.history];
  }

  /**
   * Vérifications d'état helper
   */
  isIdle(): boolean {
    return this.state === 'idle';
  }
  isUserSpeaking(): boolean {
    return this.state === 'user_speaking';
  }
  isProcessing(): boolean {
    return this.state === 'processing';
  }
  isAISpeaking(): boolean {
    return this.state === 'ai_speaking';
  }
  isPaused(): boolean {
    return this.state === 'paused';
  }
  isError(): boolean {
    return this.state === 'error';
  }

  /**
   * L'utilisateur peut-il parler?
   */
  canUserSpeak(): boolean {
    return this.state === 'idle' || this.state === 'ai_speaking'; // barge-in permis
  }

  /**
   * L'AI peut-elle parler?
   */
  canAISpeak(): boolean {
    return this.state === 'processing' || this.state === 'idle';
  }
}

// Singleton global
export const audioStateMachine = new AudioStateMachine({
  enableLogging: true,
});

// Export pour tests
export { AudioStateMachine };
export default audioStateMachine;
