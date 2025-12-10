/**
 * TITANE_INFINITY v19.5.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — VOICE ATTENTION SHARED TYPES
 *   Break circular dependencies in voice attention subsystem
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * États d'attention de TITANE∞
 */
export type AttentionState =
  | 'inactive' // Écoute désactivée
  | 'armed' // En écoute passive (attend wake word)
  | 'wake_detected' // Wake word détecté, transition en cours
  | 'awaiting_command' // Réveillé, attend la commande utilisateur
  | 'processing' // Traitement IA en cours
  | 'responding' // TTS en cours
  | 'cooldown'; // Période de refroidissement après réponse

/**
 * Mode d'écoute
 */
export type ListeningMode =
  | 'off' // Désactivé
  | 'push_to_talk' // Manuel (bouton)
  | 'wake_word'; // Activation vocale

/**
 * Événement d'attention
 */
export interface AttentionEvent {
  state: AttentionState;
  previousState: AttentionState;
  timestamp: number;
  wakeEvent?: unknown; // WakeWordEvent from wakeWordEngine
  reason?: string;
}

/**
 * Configuration du moteur d'attention
 */
export interface AttentionConfig {
  /** Mode d'écoute (défaut: 'off') */
  mode?: ListeningMode;

  /** Durée du cooldown en ms (défaut: 1000) */
  cooldownDuration?: number;

  /** Timeout pour awaiting_command en ms (défaut: 10000) */
  commandTimeout?: number;

  /** Auto-retour en armed après réponse (défaut: true) */
  autoRearm?: boolean;

  /** [v19.5.0] Enable contextual adaptation (v2.0 features) */
  useContextualAdaptation?: boolean;
}

/**
 * Callback d'événement
 */
export type AttentionCallback = (event: AttentionEvent) => void;
