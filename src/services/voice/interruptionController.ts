/**
 * TITANE_INFINITY v19.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.4 — INTERRUPTION CONTROLLER
 *
 *   Gère les interruptions vocales (barge-in)
 *   Permet d'interrompre TITANE∞ pendant qu'il parle
 *   Détecte "Titane" pendant le TTS → arrêt immédiat → écoute
 * ═══════════════════════════════════════════════════════════════════
 */

import { hybridTTS } from '@/services/tts/hybridTTS';
import { emotionalTTS } from './emotionalTTS';
import { attentionEngine } from './attentionEngine';
import { wakeWordEngine, type WakeWordEvent } from './wakeWordEngine';

/**
 * Type d'interruption
 */
export type InterruptionType =
  | 'wake_word'       // Wake word détecté pendant TTS
  | 'manual'          // Interruption manuelle (bouton)
  | 'error';          // Erreur TTS

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
export type InterruptionCallback = (event: InterruptionEvent) => void;

/**
 * Configuration du contrôleur
 */
export interface InterruptionConfig {
  /** Activer la détection pendant TTS (défaut: true) */
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
    this.config = {
      enabled: config.enabled ?? true,
      debounceDelay: config.debounceDelay ?? 500,
    };

    console.log('[InterruptionController] 🛑 Initialized:', this.config);
  }

  /**
   * Démarrer la surveillance des interruptions
   */
  startMonitoring(): void {
    if (!this.config.enabled) return;

    console.log('[InterruptionController] 👁️ Started monitoring for interruptions');
    this.isSpeaking = true;
    this.currentTranscript = '';
  }

  /**
   * Arrêter la surveillance
   */
  stopMonitoring(): void {
    console.log('[InterruptionController] 🛑 Stopped monitoring');
    this.isSpeaking = false;
    this.currentTranscript = '';
  }

  /**
   * Traiter une transcription partielle (streaming)
   */
  processPartialTranscript(partial: string): void {
    if (!this.isSpeaking || !this.config.enabled) return;

    // Accumulation
    this.currentTranscript = partial;

    // Détection wake word
    const wakeEvent = wakeWordEngine.detectStreaming(partial);

    if (wakeEvent?.detected) {
      console.log('[InterruptionController] 🎯 Wake word detected during TTS!');
      this.interrupt('wake_word', wakeEvent);
    }
  }

  /**
   * Traiter une transcription finale
   */
  processFinalTranscript(final: string): void {
    if (!this.isSpeaking || !this.config.enabled) return;

    console.log('[InterruptionController] 📝 Final transcript:', final);

    // Détection wake word
    const wakeEvent = wakeWordEngine.detect(final);

    if (wakeEvent.detected) {
      console.log('[InterruptionController] 🎯 Wake word confirmed in final transcript!');
      this.interrupt('wake_word', wakeEvent);
    }
  }

  /**
   * Interruption manuelle
   */
  interruptManual(reason?: string): void {
    console.log('[InterruptionController] ✋ Manual interruption:', reason);
    this.interrupt('manual', undefined, reason);
  }

  /**
   * Vérifier si on est en train de parler
   */
  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  /**
   * Souscrire aux interruptions
   */
  onInterruption(callback: InterruptionCallback): () => void {
    this.callbacks.add(callback);

    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Activer/désactiver
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`[InterruptionController] ${enabled ? '🔊' : '🔇'} Interruption detection ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Mettre à jour la config
   */
  updateConfig(updates: Partial<InterruptionConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    console.log('[InterruptionController] 🔧 Config updated:', this.config);
  }

  /**
   * Interrompre le TTS et notifier
   */
  private async interrupt(type: InterruptionType, wakeEvent?: WakeWordEvent, reason?: string): Promise<void> {
    // Debounce
    const now = Date.now();
    if (now - this.lastInterruption < this.config.debounceDelay) {
      console.log('[InterruptionController] ⏱️ Debounced');
      return;
    }
    this.lastInterruption = now;

    console.log('[InterruptionController] 🛑 Interrupting TTS...');

    try {
      // Arrêter tous les TTS
      await Promise.all([
        hybridTTS.stop(),
        emotionalTTS.stop(),
      ]);

      console.log('[InterruptionController] ✅ TTS stopped');
    } catch (err) {
      console.error('[InterruptionController] ❌ Error stopping TTS:', err);
    }

    // Réinitialiser état
    this.isSpeaking = false;
    this.currentTranscript = '';

    // Notifier
    const event: InterruptionEvent = {
      type,
      timestamp: now,
      wakeEvent,
      reason,
    };

    this.callbacks.forEach(cb => {
      try {
        cb(event);
      } catch (err) {
        console.error('[InterruptionController] Callback error:', err);
      }
    });

    // Si wake word, traiter
    if (type === 'wake_word' && wakeEvent) {
      attentionEngine.handleWakeWord(wakeEvent);
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
export function interruptTITANE(reason?: string): void {
  interruptionController.interruptManual(reason);
}
