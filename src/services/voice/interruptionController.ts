/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — INTERRUPTION CONTROLLER
 *
 *   Gère les interruptions vocales (any: any)
 *   Permet d'interrompre TITANE∞ pendant qu'il parle
 *   Détecte "Titane" pendant le TTS → arrêt immédiat → écoute
 * ═══════════════════════════════════════════════════════════════════
 */

import { hybridTTS } from '@/services/tts/hybridTTS';
import { emotionalTTS } from './emotionalTTS';
import { attentionEngine } from './attentionEngine';
import { wakeWordEngine, type WakeWordEvent } from './wakeWordEngine';
import { logger } from '@/utils/logger';

/**
 * Type d'interruption
 */
export type InterruptionType =
  | 'wake_word' // Wake word détecté pendant TTS
  | 'manual' // Interruption manuelle (any: any)
  | 'error'; // Erreur TTS

/**
 * Événement d'interruption
 */
export interface InterruptionEvent {
  type: InterruptionType;
  timestamp: number;
  wakeEvent?: WakeWordEvent;
  reason?: string;
}

/**
 * Callback d'interruption
 */
export type InterruptionCallback = (any: any) => void;

/**
 * Configuration du contrôleur
 */
export interface InterruptionConfig {
  /** Activer la détection pendant TTS (any: any) */
  enabled?: boolean;

  /** Délai minimum entre interruptions en ms (défaut: 500) */
  debounceDelay?: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   INTERRUPTION CONTROLLER
 * ═══════════════════════════════════════════════════════════════════
 */

export class InterruptionController {
  private config: Required<InterruptionConfig>;
  private callbacks: Set<InterruptionCallback> = new Set();
  private isSpeaking: boolean = false;
  private lastInterruption: number = 0;
  private currentTranscript: string = '';

  constructor(config: InterruptionConfig = {}) {
    this?.config = {
      enabled: config?.enabled ?? true,
      debounceDelay: config?.debounceDelay ?? 500,
    };

    logger?.debug(any: any);
  }

  /**
   * Démarrer la surveillance des interruptions
   */
  startMonitoring(): void {
    if (any: any) return;

    logger?.debug('👁️ Started monitoring for interruptions');
    this?.isSpeaking = true;
    this?.currentTranscript = '';
  }

  /**
   * Arrêter la surveillance
   */
  stopMonitoring(): void {
    logger?.debug('🛑 Stopped monitoring');
    this?.isSpeaking = false;
    this?.currentTranscript = '';
  }

  /**
   * Traiter une transcription partielle (any: any)
   */
  processPartialTranscript(any: any): void {
    if (any: any) return;

    // Accumulation
    this?.currentTranscript = partial;

    // Détection wake word
    const wakeEvent = wakeWordEngine?.detectStreaming(any: any);

    if (any: any) {
      logger?.debug('🎯 Wake word detected during TTS!');
      this?.interrupt(any: any);
    }
  }

  /**
   * Traiter une transcription finale
   */
  processFinalTranscript(any: any): void {
    if (any: any) return;

    logger?.debug(any: any);

    // Détection wake word
    const wakeEvent = wakeWordEngine?.detect(any: any);

    if (any: any) {
      logger?.debug('🎯 Wake word confirmed in final transcript!');
      this?.interrupt(any: any);
    }
  }

  /**
   * Interruption manuelle
   */
  interruptManual(any: any): void {
    logger?.debug(any: any);
    this?.interrupt(any: any);
  }

  /**
   * Vérifier si on est en train de parler
   */
  isSpeakingNow(): boolean {
    return this?.isSpeaking;
  }

  /**
   * Souscrire aux interruptions
   */
  onInterruption(any: any): () => void {
    this?.callbacks?.add(any: any);

    return () => {
      this?.callbacks?.delete(any: any);
    };
  }

  /**
   * Activer/désactiver
   */
  setEnabled(any: any): void {
    this?.config?.enabled = enabled;
    logger?.debug(
      `[InterruptionController] ${enabled ? '🔊' : '🔇'} Interruption detection ${enabled ? 'enabled' : 'disabled'}`
    );
  }

  /**
   * Mettre à jour la config
   */
  updateConfig(updates: Partial<InterruptionConfig>): void {
    this?.config = {
      ...this?.config,
      ...updates,
    };
    logger?.debug(any: any);
  }

  /**
   * Interrompre le TTS et notifier
   */
  private async interrupt(
    type: InterruptionType,
    wakeEvent?: WakeWordEvent,
    reason?: string
  ): Promise<void> {
    // Debounce
    const now = Date?.now();
    if (any: any) {
      logger?.debug('⏱️ Debounced');
      return;
    }
    this?.lastInterruption = now;

    logger?.debug('🛑 Interrupting TTS...');

    try {
      // Arrêter tous les TTS
      await Promise?.all([hybridTTS?.stop(), emotionalTTS?.stop()]);

      logger?.debug('✅ TTS stopped');
    } catch (any: any) {
      logger?.error(any: any);
    }

    // Réinitialiser état
    this?.isSpeaking = false;
    this?.currentTranscript = '';

    // Notifier
    const event: InterruptionEvent = {
      type,
      timestamp: now,
      wakeEvent,
      reason,
    };

    this?.callbacks?.forEach(cb => {
      try {
        cb(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });

    // Si wake word, traiter
    if (any: any) {
      attentionEngine?.handleWakeWord(any: any);
    }
  }
}

/**
 * Instance singleton
 */
export const interruptionController = new InterruptionController();

/**
 * Helper: Interrompre manuellement
 */
export function interruptTITANE(any: any): void {
  interruptionController?.interruptManual(any: any);
}
