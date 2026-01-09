/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.5 — ATTENTION ENGINE (Cognitive v2.0)
 *
 *   Gère les états d'attention de TITANE∞
 *   Machine à états pour wake word → commande → réponse
 *   Intégration avec VoiceEngine et audioStateMachine
 *   [v19.5.0] Optional contextual adaptation (v2.0)
 * ═══════════════════════════════════════════════════════════════════
 */

import type { WakeWordEvent } from './wakeWordEngine';
import type {
  AttentionState,
  ListeningMode,
  AttentionEvent,
  AttentionConfig,
  AttentionCallback,
} from './attentionTypes';
import { contextualAttentionV2 } from './contextualAttentionV2';
import { logger } from '@/utils/logger';

// Re-export types for external consumers
export type {
  AttentionState,
  ListeningMode,
  AttentionEvent,
  AttentionConfig,
  AttentionCallback,
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   ATTENTION ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */

export class AttentionEngine {
  private state: AttentionState = 'inactive';
  private mode: ListeningMode = 'off';
  private config: Required<AttentionConfig>;
  private callbacks: Set<AttentionCallback> = new Set();
  private commandTimeoutHandle?: NodeJS.Timeout;
  private cooldownTimeoutHandle?: NodeJS.Timeout;
  private lastWakeEvent?: WakeWordEvent;

  constructor(config: AttentionConfig = {}) {
    this.config = {
      mode: config.mode ?? 'off',
      cooldownDuration: config.cooldownDuration ?? 1000,
      commandTimeout: config.commandTimeout ?? 10000,
      autoRearm: config.autoRearm ?? true,
      useContextualAdaptation: config.useContextualAdaptation ?? false,
    };

    this.mode = this.config.mode;

    logger.debug('🧠 Initialized:', this.config);

    // [v19.5.0] Configure contextual adaptation if enabled
    if (this.config.useContextualAdaptation) {
      this.enableContextualAdaptation();
    }
  }

  /**
   * [v19.5.0] Enable contextual adaptation
   */
  private enableContextualAdaptation(): void {
    logger.debug('🧠 Enabling contextual adaptation...');
    // Contextual attention is already initialized, just log
    logger.debug('✅ Contextual adaptation ready');
  }

  /**
   * [v19.5.0] Toggle contextual adaptation dynamically
   */
  setContextualAdaptation(enabled: boolean): void {
    this.config.useContextualAdaptation = enabled;
    logger.debug(
      `[AttentionEngine] ${enabled ? '✅' : '🔇'} Contextual adaptation ${enabled ? 'enabled' : 'disabled'}`
    );
  }

  /**
   * [v19.5.0] Update environment context (noise, distance, quality)
   */
  updateEnvironmentContext(context: {
    noiseLevel?: number;
    voiceDistance?: 'near' | 'medium' | 'far';
    signalQuality?: 'excellent' | 'good' | 'fair' | 'poor';
    multipleVoices?: boolean;
  }): void {
    if (!this.config.useContextualAdaptation) {
      return;
    }

    contextualAttentionV2.updateEnvironment({
      ambientNoiseLevel: context.noiseLevel,
      microphoneDistance: context.voiceDistance || 'unknown',
      signalQuality:
        context.signalQuality === 'excellent'
          ? 1.0
          : context.signalQuality === 'good'
            ? 0.75
            : context.signalQuality === 'fair'
              ? 0.5
              : 0.25,
      multipleVoices: context.multipleVoices || false,
      lastMeasured: Date.now(),
    });
    logger.debug('🌍 Environment context updated:', context);
  }

  /**
   * [v19.5.0] Update application context (mode, tasks)
   */
  updateApplicationContext(context: {
    mode?: 'normal' | 'focus' | 'background';
    criticalTask?: boolean;
    highFalsePositives?: boolean;
  }): void {
    if (!this.config.useContextualAdaptation) {
      return;
    }

    contextualAttentionV2.updateApplication(context);
    logger.debug('📱 Application context updated:', context);
  }

  /**
   * [v19.5.0] Get adapted threshold from contextual attention
   */
  getAdaptedThreshold(): number {
    if (!this.config.useContextualAdaptation) {
      return 0.7; // Default threshold
    }

    return contextualAttentionV2.getAdaptedConfig().wakeThreshold;
  }

  /**
   * [v19.5.0] Get active contextual rules
   */
  getActiveRules(): Array<{ name: string; priority: number }> {
    if (!this.config.useContextualAdaptation) {
      return [];
    }

    // Get triggered rules from contextual attention
    const _config = contextualAttentionV2.getAdaptedConfig();
    // Return empty array for now (rules not directly exposed)
    return [];
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): AttentionState {
    return this.state;
  }

  /**
   * Obtenir le mode actuel
   */
  getMode(): ListeningMode {
    return this.mode;
  }

  /**
   * Activer l'écoute active (wake word)
   */
  activate(): void {
    logger.debug('🔊 Activating wake word listening');
    this.mode = 'wake_word';
    this.transitionTo('armed', 'User activated wake word mode');
  }

  /**
   * Désactiver l'écoute active
   */
  deactivate(): void {
    logger.debug('🔇 Deactivating wake word listening');
    this.mode = 'off';
    this.clearTimeouts();
    this.transitionTo('inactive', 'User deactivated wake word mode');
  }

  /**
   * Basculer en mode push-to-talk
   */
  setPushToTalk(): void {
    logger.debug('🎤 Switching to push-to-talk mode');
    this.mode = 'push_to_talk';
    this.clearTimeouts();
    this.transitionTo('inactive', 'Switched to push-to-talk');
  }

  /**
   * Traiter un événement de wake word
   */
  handleWakeWord(wakeEvent: WakeWordEvent): void {
    if (this.state !== 'armed') {
      logger.warn(
        '⚠️ Wake word detected but not in armed state:',
        this.state
      );
      return;
    }

    logger.debug('🎯 Wake word detected:', wakeEvent);
    this.lastWakeEvent = wakeEvent;

    // Transition vers wake_detected
    this.transitionTo(
      'wake_detected',
      `Wake word: ${wakeEvent.matchedVariant}`,
      wakeEvent
    );

    // Selon le mode
    if (wakeEvent.mode === 'wake_only') {
      // Passer en awaiting_command avec timeout
      setTimeout(() => {
        this.transitionTo('awaiting_command', 'Awaiting user command');
        this.startCommandTimeout();
      }, 100);
    } else {
      // one_shot : la commande est déjà dans cleanedText
      // On passe directement en processing (sera géré par VoiceRouter)
      setTimeout(() => {
        this.transitionTo('awaiting_command', 'One-shot command ready');
      }, 100);
    }
  }

  /**
   * Démarrer le traitement IA
   */
  startProcessing(): void {
    logger.debug('🤖 Starting AI processing');
    this.clearCommandTimeout();
    this.transitionTo('processing', 'AI processing started');
  }

  /**
   * Démarrer la réponse TTS
   */
  startResponding(): void {
    logger.debug('🔊 Starting TTS response');
    this.transitionTo('responding', 'TTS started');
  }

  /**
   * Fin de la réponse (retour en armed ou cooldown)
   */
  endResponse(): void {
    logger.debug('✅ Response complete');

    if (this.config.autoRearm && this.mode === 'wake_word') {
      // Cooldown puis armed
      this.transitionTo('cooldown', 'Cooldown before rearming');

      this.cooldownTimeoutHandle = setTimeout(() => {
        this.transitionTo('armed', 'Auto-rearmed after cooldown');
      }, this.config.cooldownDuration);
    } else {
      this.transitionTo('inactive', 'Response complete, not rearming');
    }
  }

  /**
   * Annuler/Reset
   */
  cancel(): void {
    logger.debug('🛑 Cancelling current attention flow');
    this.clearTimeouts();

    if (this.mode === 'wake_word') {
      this.transitionTo('armed', 'Cancelled, back to armed');
    } else {
      this.transitionTo('inactive', 'Cancelled');
    }
  }

  /**
   * Réinitialiser complètement
   */
  reset(): void {
    logger.debug('🔄 Resetting attention engine');
    this.clearTimeouts();
    this.lastWakeEvent = undefined;

    if (this.mode === 'wake_word') {
      this.transitionTo('armed', 'Reset to armed');
    } else {
      this.transitionTo('inactive', 'Reset to inactive');
    }
  }

  /**
   * Obtenir le dernier événement de wake word
   */
  getLastWakeEvent(): WakeWordEvent | undefined {
    return this.lastWakeEvent;
  }

  /**
   * Souscrire aux événements
   */
  onStateChange(callback: AttentionCallback): () => void {
    this.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(updates: Partial<AttentionConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    logger.debug('🔧 Config updated:', this.config);
  }

  /**
   * Transition interne
   */
  private transitionTo(
    newState: AttentionState,
    reason?: string,
    wakeEvent?: WakeWordEvent
  ): void {
    if (this.state === newState) return;

    const previousState = this.state;
    this.state = newState;

    const event: AttentionEvent = {
      state: newState,
      previousState,
      timestamp: Date.now(),
      wakeEvent,
      reason,
    };

    logger.debug(
      `[AttentionEngine] 🔄 ${previousState} → ${newState}${reason ? ` (${reason})` : ''}`
    );

    // Notifier les callbacks
    this.callbacks.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        logger.error('Callback error:', err);
      }
    });
  }

  /**
   * Démarrer le timeout de commande
   */
  private startCommandTimeout(): void {
    this.clearCommandTimeout();

    this.commandTimeoutHandle = setTimeout(() => {
      logger.warn('⏱️ Command timeout, returning to armed');
      this.transitionTo('armed', 'Command timeout');
    }, this.config.commandTimeout);
  }

  /**
   * Nettoyer le timeout de commande
   */
  private clearCommandTimeout(): void {
    if (this.commandTimeoutHandle) {
      clearTimeout(this.commandTimeoutHandle);
      this.commandTimeoutHandle = undefined;
    }
  }

  /**
   * Nettoyer tous les timeouts
   */
  private clearTimeouts(): void {
    this.clearCommandTimeout();

    if (this.cooldownTimeoutHandle) {
      clearTimeout(this.cooldownTimeoutHandle);
      this.cooldownTimeoutHandle = undefined;
    }
  }
}

/**
 * Instance singleton
 */
export const attentionEngine = new AttentionEngine();
