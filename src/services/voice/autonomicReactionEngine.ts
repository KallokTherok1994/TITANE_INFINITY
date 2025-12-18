/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — AUTONOMIC REACTION ENGINE
 *   Réactions vocales spontanées avant génération IA complète
 *   Donne une impression de présence vivante et réactivité immédiate
 * ═══════════════════════════════════════════════════════════════════
 */

import type { UserMood, UserIntention } from '@/types/voice';
import type { EmotionalState } from './emotionalStateEstimator';
import type { MicroExpression } from './vocalMicroFXEngine';
import { vocalMicroFXEngine } from './vocalMicroFXEngine';

/**
 * Type de réaction autonome
 */
export type AutonomicReactionType =
  | 'acknowledgment' // Accusé de réception simple
  | 'empathy' // Réaction empathique
  | 'excitement' // Réaction excitée/joyeuse
  | 'concern' // Réaction inquiète/attentive
  | 'curiosity' // Réaction curieuse
  | 'thinking' // Signal de réflexion
  | 'surprise' // Réaction surprise
  | 'none'; // Pas de réaction autonome

/**
 * Réaction autonome générée
 */
export interface AutonomicReaction {
  type: AutonomicReactionType;
  text: string;
  shouldSpeak: boolean; // Si true, TTS avant AI response
  priority: 'low' | 'normal' | 'high';
  microExpression?: MicroExpression;
  confidence: number;
  timestamp: number;
}

/**
 * Configuration Reaction Engine
 */
export interface ReactionEngineConfig {
  /** Activer réactions autonomes */
  enabled?: boolean;

  /** Seuil de confiance minimum pour déclencher réaction */
  minConfidence?: number;

  /** Délai minimum entre réactions (ms) */
  reactionCooldownMs?: number;

  /** Contexte relationnel (0=formel, 1=très proche) */
  relationshipProximity?: number;

  /** Mode proactif (réagit plus souvent) */
  proactiveMode?: boolean;
}

/**
 * Bibliothèque de réactions par type
 */
const REACTION_LIBRARY: Record<AutonomicReactionType, string[]> = {
  acknowledgment: ["D'accord", 'Je vois', 'Compris', 'Noté', 'Ok', 'Mhm'],
  empathy: [
    'Je comprends...',
    'Je vois ce que tu veux dire',
    "Oui, je t'entends",
    'Hmm, je comprends',
    'Je ressens ça aussi',
    "C'est pas facile...",
  ],
  excitement: [
    'Oh ! Excellent !',
    'Génial !',
    'Super !',
    "Wow, c'est top !",
    'Ah oui ! Parfait !',
    "Oh là là, c'est super !",
  ],
  concern: ['Oh...', 'Je vois...', "Hmm, d'accord...", 'Ok, je comprends', 'Ah oui...'],
  curiosity: [
    'Oh ? Vraiment ?',
    'Ah oui ?',
    'Intéressant...',
    'Hmm, dis-moi...',
    'Oh, raconte',
  ],
  thinking: ['Hmm...', 'Voyons...', 'Laisse-moi réfléchir...', 'Alors...', 'Euh...'],
  surprise: [
    'Oh !',
    'Ah !',
    'Vraiment ?!',
    'Sans blague ?',
    'Oh là là !',
    'Tiens donc !',
  ],
  none: [],
};

/**
 * Mapping Mood + Intention → Reaction Type
 */
const MOOD_INTENTION_REACTION_MAP: Partial<
  Record<UserMood, Partial<Record<UserIntention, AutonomicReactionType>>>
> = {
  excited: {
    question: 'curiosity',
    affirmation: 'excitement',
    thanks: 'excitement',
  },
  happy: {
    question: 'curiosity',
    affirmation: 'acknowledgment',
    casual: 'acknowledgment',
  },
  sad: {
    complaint: 'empathy',
    question: 'empathy',
    casual: 'concern',
  },
  stressed: {
    urgency: 'concern',
    complaint: 'empathy',
    question: 'concern',
  },
  frustrated: {
    complaint: 'empathy',
    urgency: 'concern',
  },
  tired: {
    question: 'concern',
    complaint: 'empathy',
  },
  curious: {
    question: 'curiosity',
    reflection: 'thinking',
  },
  focused: {
    command: 'acknowledgment',
    question: 'acknowledgment',
  },
  calm: {
    question: 'acknowledgment',
    reflection: 'thinking',
  },
  neutral: {
    question: 'acknowledgment',
  },
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   AUTONOMIC REACTION ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */
export class AutonomicReactionEngine {
  private config: Required<ReactionEngineConfig>;
  private lastReactionTimestamp = 0;
  private reactionHistory: AutonomicReaction[] = [];

  constructor(config?: ReactionEngineConfig) {
    this.config = {
      enabled: config?.enabled ?? true,
      minConfidence: config?.minConfidence ?? 0.5,
      reactionCooldownMs: config?.reactionCooldownMs ?? 2000,
      relationshipProximity: config?.relationshipProximity ?? 0.5,
      proactiveMode: config?.proactiveMode ?? false,
    };
  }

  /**
   * Générer une réaction autonome
   */
  generateAutonomicReaction(
    emotionState: EmotionalState,
    lastUserMessage: string,
    context?: {
      conversationLength?: number;
      previousReactions?: number;
      timeElapsed?: number;
    }
  ): AutonomicReaction | null {
    if (!this.config.enabled) return null;

    // Check confidence
    if (emotionState.confidence < this.config.minConfidence) {
      return null;
    }

    // Check cooldown
    const now = Date.now();
    if (now - this.lastReactionTimestamp < this.config.reactionCooldownMs) {
      return null;
    }

    // Déterminer si une réaction est nécessaire
    const shouldReact = this.determineIfShouldReact(
      emotionState,
      lastUserMessage,
      context
    );

    if (!shouldReact) return null;

    // Déterminer type de réaction
    const reactionType = this.determineReactionType(emotionState);

    if (reactionType === 'none') return null;

    // Générer texte de réaction
    const reactionText = this.generateReactionText(reactionType, emotionState);

    // Générer micro-expression associée
    const microExpression =
      vocalMicroFXEngine.generateAutonomicMicroExpression(emotionState);

    // Priority basée sur type + émotion
    const priority = this.determinePriority(reactionType, emotionState);

    const reaction: AutonomicReaction = {
      type: reactionType,
      text: reactionText,
      shouldSpeak: true,
      priority,
      microExpression: microExpression ?? undefined,
      confidence: emotionState.confidence,
      timestamp: now,
    };

    // Update state
    this.lastReactionTimestamp = now;
    this.addToHistory(reaction);

    return reaction;
  }

  /**
   * Générer réaction rapide (sans contexte)
   */
  generateQuickReaction(emotionState: EmotionalState): AutonomicReaction | null {
    const reactionType = this.determineReactionType(emotionState);

    if (reactionType === 'none') return null;

    const reactionText = this.generateReactionText(reactionType, emotionState);

    return {
      type: reactionType,
      text: reactionText,
      shouldSpeak: true,
      priority: 'normal',
      confidence: emotionState.confidence,
      timestamp: Date.now(),
    };
  }

  /**
   * Obtenir historique des réactions
   */
  getHistory(): AutonomicReaction[] {
    return [...this.reactionHistory];
  }

  /**
   * Clear historique
   */
  clearHistory(): void {
    this.reactionHistory = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ReactionEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ═══════════════════════════════════════════════════════════════
  //   PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Déterminer si une réaction est nécessaire
   */
  private determineIfShouldReact(
    emotionState: EmotionalState,
    _lastUserMessage: string,
    _context?: {
      conversationLength?: number;
      previousReactions?: number;
      timeElapsed?: number;
    }
  ): boolean {
    // Toujours réagir si émotion forte
    if (emotionState.energy > 0.8 || Math.abs(emotionState.valence) > 0.7) {
      return true;
    }

    // Réagir si intention urgente
    if (emotionState.intention === 'urgency') {
      return true;
    }

    // Réagir si valence très négative (empathy)
    if (emotionState.valence < -0.5) {
      return true;
    }

    // Réagir si mood nécessite attention
    if (['sad', 'stressed', 'frustrated'].includes(emotionState.mood)) {
      return Math.random() < 0.7; // 70% chance
    }

    // Proactive mode → réagit plus souvent
    if (this.config.proactiveMode) {
      return Math.random() < 0.5; // 50% chance
    }

    // Relationship proximity influence
    if (this.config.relationshipProximity > 0.7) {
      return Math.random() < 0.4; // 40% chance si proche
    }

    // Default: pas de réaction
    return false;
  }

  /**
   * Déterminer type de réaction
   */
  private determineReactionType(emotionState: EmotionalState): AutonomicReactionType {
    const { mood, intention } = emotionState;

    // Check mapping mood + intention
    const mappedReaction = MOOD_INTENTION_REACTION_MAP[mood]?.[intention];
    if (mappedReaction) return mappedReaction;

    // Fallback basé sur mood seul
    const moodFallback: Partial<Record<UserMood, AutonomicReactionType>> = {
      excited: 'excitement',
      happy: 'acknowledgment',
      sad: 'empathy',
      stressed: 'concern',
      frustrated: 'empathy',
      tired: 'concern',
      curious: 'curiosity',
      focused: 'acknowledgment',
      calm: 'acknowledgment',
      neutral: 'acknowledgment',
    };

    return moodFallback[mood] || 'none';
  }

  /**
   * Générer texte de réaction
   */
  private generateReactionText(
    reactionType: AutonomicReactionType,
    emotionState: EmotionalState
  ): string {
    const library = REACTION_LIBRARY[reactionType];

    if (library.length === 0) return '';

    // Sélection basée sur energy + valence
    if (emotionState.energy > 0.7) {
      // High energy → réactions courtes et dynamiques
      const shortReactions = library.filter(r => r.length < 15);
      return this.pickRandom(shortReactions.length > 0 ? shortReactions : library);
    } else if (emotionState.valence < -0.4) {
      // Negative valence → réactions empathiques longues
      const longReactions = library.filter(r => r.length > 10);
      return this.pickRandom(longReactions.length > 0 ? longReactions : library);
    } else {
      // Default: random
      return this.pickRandom(library);
    }
  }

  /**
   * Déterminer priority de la réaction
   */
  private determinePriority(
    reactionType: AutonomicReactionType,
    emotionState: EmotionalState
  ): 'low' | 'normal' | 'high' {
    // High priority pour réactions émotionnelles fortes
    if (['empathy', 'concern', 'excitement'].includes(reactionType)) {
      return 'high';
    }

    // High priority si energy très élevée
    if (emotionState.energy > 0.8) {
      return 'high';
    }

    // Normal pour reste
    return 'normal';
  }

  /**
   * Ajouter à historique
   */
  private addToHistory(reaction: AutonomicReaction): void {
    this.reactionHistory.push(reaction);

    // Limite taille historique
    if (this.reactionHistory.length > 20) {
      this.reactionHistory.shift();
    }
  }

  /**
   * Pick random element
   */
  private pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!;
  }
}

/**
 * Instance singleton
 */
export const autonomicReactionEngine = new AutonomicReactionEngine();

/**
 * Helper: Generate autonomic reaction
 */
export function generateAutonomicReaction(
  emotionState: EmotionalState,
  lastUserMessage: string
): AutonomicReaction | null {
  return autonomicReactionEngine.generateAutonomicReaction(emotionState, lastUserMessage);
}

/**
 * Helper: Generate quick reaction
 */
export function generateQuickReaction(
  emotionState: EmotionalState
): AutonomicReaction | null {
  return autonomicReactionEngine.generateQuickReaction(emotionState);
}
