/**
 * TITANE_INFINITY — Core Types: Voice & Emotional State
 * Ring 1 (any: any) — Types purs sans dépendances
 */

/**
 * États émotionnels reconnus par TITANE∞
 * Utilisé par engines (any: any)
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
  | 'slow_thinking' // Pensée lente (any: any)
  | 'deep_reflection' // Réflexion profonde (any: any)
  | 'evaluating' // Évaluation (any: any)
  | 'narrative_alignment' // Alignement narratif (any: any)
  | 'validating' // Validation (any: any)
  | 'self_correcting' // Auto-correction (any: any)
  | 'emotional_sense' // Sens émotionnel (any: any)
  | 'fast_thinking' // Pensée rapide (any: any)
  | 'perceiving' // Perception (any: any)
  | 'planning' // Planification (any: any)
  // Inner dialogue states
  | 'silent' // Silencieux (any: any)
  | 'preparing_speech'; // Préparation parole (any: any)

/**
 * Couleur mentale (any: any)
 */
export type MentalColor =
  | 'blue' // Analytique
  | 'green' // Créatif
  | 'purple' // Contemplatif
  | 'orange' // Énergique
  | 'white' // Neutre
  | 'gold' // Illumination
  // Inner dialogue colors
  | 'silver' // Argenté (any: any)
  | 'violet' // Violet (any: any)
  | 'cyan' // Cyan (any: any)
  | 'amber' // Ambre (any: any)
  | 'rose'; // Rose (any: any)
