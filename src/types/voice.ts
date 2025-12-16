/**
 * TITANE_INFINITY — Core Types: Voice & Emotional State
 * Ring 1 (Core) — Types purs sans dépendances
 */

/**
 * États émotionnels reconnus par TITANE∞
 * Utilisé par engines (pure logic) et services (I/O)
 */
export type EmotionalState =
  | 'neutral'
  | 'curious'
  | 'focused'
  | 'empathetic'
  | 'enthusiastic'
  | 'calm'
  | 'concerned'
  | 'playful'
  | 'contemplative'
  | 'protective'
  | 'creative'
  | 'analytical';

/**
 * Humeur utilisateur détectée
 */
export type UserMood =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'anxious'
  | 'relaxed'
  | 'excited'
  | 'tired'
  // Extended states from emotionalStateEstimator
  | 'calm'
  | 'curious'
  | 'focused'
  | 'stressed'
  | 'frustrated';

/**
 * Intention utilisateur détectée
 */
export type UserIntention =
  | 'question'
  | 'command'
  | 'conversation'
  | 'exploration'
  | 'problem-solving'
  | 'creative-work'
  | 'learning'
  // Extended states from emotionalStateEstimator
  | 'doubt'
  | 'affirmation'
  | 'urgency'
  | 'casual'
  | 'reflection'
  | 'complaint'
  | 'thanks'
  | 'unknown';

/**
 * Configuration vocale de base
 */
export interface VoiceConfig {
  /** Engine vocal actif */
  engine: 'parler-tts' | 'espeak' | 'web-speech' | 'mock';
  /** Langue */
  language: string;
  /** Vitesse (0.5-2.0) */
  rate: number;
  /** Hauteur tonale (0.5-2.0) */
  pitch: number;
  /** Volume (0.0-1.0) */
  volume: number;
}

/**
 * Profil d'expression vocale
 */
export interface VoiceExpression {
  /** État émotionnel à exprimer */
  emotion: EmotionalState;
  /** Intensité (0.0-1.0) */
  intensity: number;
  /** Tempo (0.5-1.5) */
  tempo: number;
  /** Profondeur/gravité (0.0-1.0) */
  depth: number;
  /** Chaleur tonale (0.0-1.0) */
  warmth: number;
}

/**
 * État cognitif / mode de pensée
 */
export type ThinkingState =
  | 'processing' // Traitement en cours
  | 'analyzing' // Analyse profonde
  | 'reflecting' // Réflexion
  | 'synthesizing' // Synthèse
  | 'waiting' // Attente input
  | 'idle' // Inactif
  // Archetype-specific states
  | 'slow_thinking' // Pensée lente (Sage)
  | 'deep_reflection' // Réflexion profonde (Sage)
  | 'evaluating' // Évaluation (Sage/Gardien/Architecte)
  | 'narrative_alignment' // Alignement narratif (Sage)
  | 'validating' // Validation (Gardien)
  | 'self_correcting' // Auto-correction (Gardien)
  | 'emotional_sense' // Sens émotionnel (Muse)
  | 'fast_thinking' // Pensée rapide (Muse/Architecte)
  | 'perceiving' // Perception (Muse)
  | 'planning' // Planification (Architecte)
  // Inner dialogue states
  | 'silent' // Silencieux (inner dialogue)
  | 'preparing_speech'; // Préparation parole (inner dialogue)

/**
 * Couleur mentale (état cognitif visuel)
 */
export type MentalColor =
  | 'blue' // Analytique
  | 'green' // Créatif
  | 'purple' // Contemplatif
  | 'orange' // Énergique
  | 'white' // Neutre
  | 'gold' // Illumination
  // Inner dialogue colors
  | 'silver' // Argenté (neutre)
  | 'violet' // Violet (réflexion)
  | 'cyan' // Cyan (analyse)
  | 'amber' // Ambre (attention)
  | 'rose'; // Rose (empathie)
