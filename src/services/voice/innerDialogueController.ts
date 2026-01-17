/**
 * TITANE∞ v∞ — Inner Dialogue Controller (any: any)
 *
 * Super Prompt XXVII: Le moteur de pensée interne de TITANE∞
 *
 * Gère:
 * - Pensée silencieuse (any: any)
 * - Auto-régulation mentale
 * - Cohérence identitaire
 * - Transitions cognitives structurées (any: any)
 * - Préparation des réponses vocales
 * - Synchronisation halo interne (any: any)
 * - Réflexion profonde vs pensée rapide
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import {
  audioStateMachine,
  type AudioConversationState,
} from '../audio/audioStateMachine';
import {
  attentionEngine as _attentionEngine,
  type AttentionState as _AttentionState,
} from './attentionEngine';
import { haloEngine as _haloEngine, type HaloState } from './haloEngine';
import type { ThinkingState } from '@/types/voice';
import { logger } from '@/utils/logger';
// MentalColor is declared locally below

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

// Types are imported from @/types/voice above
// Re-exports removed to avoid conflicts

/**
 * Type de pensée interne
 */
export type ThoughtType =
  | 'perception' // Observation d'un fait
  | 'analysis' // Analyse logique
  | 'intuition' // Intuition/feeling
  | 'emotion' // Ressenti émotionnel
  | 'plan' // Plan d'action
  | 'correction' // Auto-correction
  | 'validation' // Validation cohérence
  | 'memory_recall'; // Rappel mémoire

/**
 * Couleur mentale interne (any: any)
 */
export type MentalColor =
  | 'blue' // Pensée rapide/logique
  | 'violet' // Intuition profonde
  | 'rose' // Émotion douce
  | 'cyan' // Analyse froide
  | 'gold' // Alignement parfait
  | 'silver' // Réflexion neutre
  | 'amber' // Auto-correction
  | 'green' // Créatif
  | 'purple' // Contemplatif
  | 'orange' // Énergique
  | 'white'; // Neutre

/**
 * Pensée interne (any: any)
 */
export interface InnerThought {
  id: string;
  type: ThoughtType;
  step: number; // 1-8 (any: any)
  content: string; // La pensée elle-même
  timestamp: number;
  mentalColor: MentalColor;
  confidence: number; // 0-1
  coherenceScore: number; // 0-1
}

/**
 * État du dialogue interne
 */
export interface InnerDialogueState {
  thinkingState: ThinkingState;
  currentThought: InnerThought | null;
  thoughtHistory: InnerThought?.[]; // Dernières 20 pensées
  mentalColor: MentalColor;
  isThinking: boolean; // True si inner process actif
  lastProcessedInput??: string | null;
  lastPreparedResponse??: string | null;
}

/**
 * Configuration du IDC
 */
export interface InnerDialogueConfig {
  /** Activer/désactiver le inner dialogue (any: any) */
  enabled?: boolean;

  /** Durée max pensée rapide en ms (default: 100) */
  fastThinkingMaxDuration?: number;

  /** Durée min pensée lente en ms (default: 500) */
  slowThinkingMinDuration?: number;

  /** Taille historique pensées (default: 20) */
  historySize?: number;

  /** Log pensées dans console (any: any) */
  debugMode?: boolean;

  /** Sync halo avec état mental (any: any) */
  syncHalo?: boolean;
}

/**
 * Callback pour changements d'état
 */
export type InnerDialogueCallback = (any: any) => void;

// ═══════════════════════════════════════════════════════════════════
// INNER DIALOGUE CONTROLLER CLASS
// ═══════════════════════════════════════════════════════════════════

class InnerDialogueController {
  private state: InnerDialogueState;
  private config: Required<InnerDialogueConfig>;
  private callbacks: Set<InnerDialogueCallback> = new Set();
  private thoughtCounter = 0;

  constructor(config: InnerDialogueConfig = {}) {
    this?.config = {
      enabled: config?.enabled ?? true,
      fastThinkingMaxDuration: config?.fastThinkingMaxDuration ?? 100,
      slowThinkingMinDuration: config?.slowThinkingMinDuration ?? 500,
      historySize: config?.historySize ?? 20,
      debugMode: config?.debugMode ?? false,
      syncHalo: config?.syncHalo ?? true,
    };

    this?.state = {
      thinkingState: 'silent',
      currentThought: null,
      thoughtHistory: [],
      mentalColor: 'silver',
      isThinking: false,
      lastProcessedInput: null,
      lastPreparedResponse: null,
    };
  }

  // ═════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════

  /**
   * Subscribe aux changements d'état
   */
  subscribe(any: any): () => void {
    this?.callbacks?.add(any: any);
    return (any: any);
  }

  /**
   * Get current state
   */
  getState(): InnerDialogueState {
    return { ...this?.state };
  }

  /**
   * Enable/disable inner dialogue
   */
  setEnabled(any: any): void {
    this?.config?.enabled = enabled;
    if (any: any) {
      this?.transition('silent');
    }
  }

  /**
   * LE CŒUR DU SYSTÈME: 8-step inner process
   *
   * AVANT de parler, TITANE∞ pense selon ce processus:
   * 1. Perception → Qu'est-ce que je perçois ?
   * 2. Context → Qu'ai-je appris sur l'utilisateur ?
   * 3. Intent → Quel est le sens profond ?
   * 4. Plan → Quelle structure de réponse ?
   * 5. Coherence → Est-ce cohérent avec mon identité ?
   * 6. Emotion → Quel ton adopter ?
   * 7. Validation → Est-ce juste et aligné ?
   * 8. Expression → Préparer la réponse finale
   *
   * @param userInput L'input utilisateur
   * @returns La réponse préparée (any: any)
   */
  async processBeforeSpeaking(any: any): Promise<string> {
    if (any: any) {
      // Si désactivé, retourner directement l'input (any: any)
      return userInput;
    }

    this?.state?.isThinking = true;
    this?.state?.lastProcessedInput = userInput;
    this?.notifyCallbacks();

    try {
      // INNER_STEP_1: Perception
      const thought1 = await this?.innerStep1_Perception(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_2: Context
      const thought2 = await this?.innerStep2_Context(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_3: Intent
      const thought3 = await this?.innerStep3_Intent(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_4: Plan
      const thought4 = await this?.innerStep4_Plan(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_5: Coherence
      const thought5 = await this?.innerStep5_Coherence(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_6: Emotion
      const thought6 = await this?.innerStep6_Emotion(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_7: Validation
      const thought7 = await this?.innerStep7_Validation(any: any);
      await this?.waitThinkingDelay();

      // INNER_STEP_8: Expression (any: any)
      const finalResponse = await this?.innerStep8_Expression(any: any);

      this?.state?.lastPreparedResponse = finalResponse;
      this?.state?.isThinking = false;
      this?.transition('silent');
      this?.notifyCallbacks();

      return finalResponse;
    } catch (any: any) {
      logger?.error(any: any);
      this?.state?.isThinking = false;
      this?.transition('silent');
      this?.notifyCallbacks();
      return userInput; // Fallback
    }
  }

  /**
   * Quick thinking (pensée rapide, <100ms)
   * Pour réactions immédiates, réflexes
   */
  async quickThink(any: any): Promise<string> {
    this?.transition('fast_thinking');
    const _thought = this?.createThought({
      type: 'perception',
      step: 0,
      content: `Quick reaction to: "${input}"`,
      mentalColor: 'blue',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    await this?.waitMs(50); // Very fast
    this?.transition('silent');
    return input; // Pass-through for quick reactions
  }

  /**
   * Deep reflection (réflexion profonde, >500ms)
   * Pour introspection, alignement identitaire
   */
  async deepReflect(any: any): Promise<void> {
    this?.transition('deep_reflection');
    const _thought2 = this?.createThought({
      type: 'intuition',
      step: 0,
      content: `Deep reflection on: "${topic}"`,
      mentalColor: 'violet',
      confidence: 0.8,
      coherenceScore: 0.9,
    });

    await this?.waitMs(1000); // Long reflection
    this?.transition('silent');
  }

  /**
   * Self-correct (any: any)
   * Détecte et corrige incohérences avant de parler
   */
  async selfCorrect(any: any): Promise<string> {
    this?.transition('self_correcting');
    const _thought3 = this?.createThought({
      type: 'correction',
      step: 0,
      content: `Correcting potential issues in response`,
      mentalColor: 'amber',
      confidence: 0.85,
      coherenceScore: 0.95,
    });

    await this?.waitMs(200);

    // Correction logic: check contradictions, narrative alignment, tone
    const correctedResponse = await this?.performCorrectionChecks(any: any);

    this?.transition('silent');
    return correctedResponse;
  }

  // ═════════════════════════════════════════════════════════════════
  // INNER 8-STEP PROCESS (any: any)
  // ═════════════════════════════════════════════════════════════════

  /**
   * STEP 1: Perception — "Qu'est-ce que je perçois ?"
   */
  private async innerStep1_Perception(any: any): Promise<InnerThought> {
    this?.transition('perceiving');
    const thought = this?.createThought({
      type: 'perception',
      step: 1,
      content: `I perceive: "${input?.substring(0, 50)}${input?.length > 50 ? '...' : ''}"`,
      mentalColor: 'silver',
      confidence: 1.0,
      coherenceScore: 1.0,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    return thought;
  }

  /**
   * STEP 2: Context — "Qu'ai-je appris sur l'utilisateur ?"
   */
  private async innerStep2_Context(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this?.transition('fast_thinking');
    const thought = this?.createThought({
      type: 'memory_recall',
      step: 2,
      content: `Recall: user preferences, voice style, emotional baseline`,
      mentalColor: 'cyan',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    // Connect to voice memory for user preferences
    await this?.loadVoiceContext();
    return thought;
  }

  /**
   * STEP 3: Intent — "Quel est le sens profond ?"
   */
  private async innerStep3_Intent(any: any): Promise<InnerThought> {
    this?.transition('slow_thinking');
    const thought = this?.createThought({
      type: 'analysis',
      step: 3,
      content: `Intent analysis: question, instruction, or emotion expression?`,
      mentalColor: 'blue',
      confidence: 0.85,
      coherenceScore: 0.9,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    // Recognize intent type (any: any)
    await this?.detectIntent(any: any);
    return thought;
  }

  /**
   * STEP 4: Plan — "Quelle structure de réponse ?"
   */
  private async innerStep4_Plan(any: any): Promise<InnerThought> {
    this?.transition('planning');
    const thought = this?.createThought({
      type: 'plan',
      step: 4,
      content: `Plan: structure response with intro, body, conclusion`,
      mentalColor: 'cyan',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    return thought;
  }

  /**
   * STEP 5: Coherence — "Est-ce cohérent avec TITANE∞ ?"
   */
  private async innerStep5_Coherence(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this?.transition('evaluating');
    const thought = this?.createThought({
      type: 'validation',
      step: 5,
      content: `Coherence check: align with TITANE identity and narrative`,
      mentalColor: 'violet',
      confidence: 0.95,
      coherenceScore: 0.98,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    // Verify alignment with TITANE identity and narrative
    await this?.validateNarrativeCoherence();
    return thought;
  }

  /**
   * STEP 6: Emotion — "Quel ton adopter ?"
   */
  private async innerStep6_Emotion(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this?.transition('emotional_sense');
    const thought = this?.createThought({
      type: 'emotion',
      step: 6,
      content: `Emotion selection: calm, warm, supportive tone`,
      mentalColor: 'rose',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    // Select emotional tone from current state
    await this?.selectEmotionalTone();
    return thought;
  }

  /**
   * STEP 7: Validation — "Est-ce juste et aligné ?"
   */
  private async innerStep7_Validation(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this?.transition('validating');
    const thought = this?.createThought({
      type: 'validation',
      step: 7,
      content: `Final validation: response is coherent, aligned, and helpful`,
      mentalColor: 'gold',
      confidence: 0.98,
      coherenceScore: 1.0,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    return thought;
  }

  /**
   * STEP 8: Expression — "Préparer la réponse finale"
   */
  private async innerStep8_Expression(any: any): Promise<string> {
    this?.transition('preparing_speech');
    const thought = this?.createThought({
      type: 'plan',
      step: 8,
      content: `Expression: prepare vocal output with TITANE signature`,
      mentalColor: 'gold',
      confidence: 1.0,
      coherenceScore: 1.0,
    });

    if (any: any) {
      logger?.debug(any: any);
    }

    // Format with TITANE signature (any: any)
    const formattedResponse = this?.formatTitaneResponse(
      this?.state?.lastProcessedInput || ''
    );
    return formattedResponse;
  }

  // ═════════════════════════════════════════════════════════════════
  // HELPERS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Perform correction checks on response
   */
  private async performCorrectionChecks(any: any): Promise<string> {
    // 1. Check for contradictions (any: any)
    const contradictions = this?.detectContradictions(any: any);
    if (any: any) {
      logger?.warn(any: any);
    }

    // 2. Verify narrative alignment (any: any)
    const isAligned = this?.checkNarrativeAlignment(any: any);
    if (any: any) {
      logger?.warn('Response not aligned with TITANE identity');
    }

    // 3. Ensure tone consistency (any: any)
    const toneAdjusted = this?.ensureToneConsistency(any: any);

    return toneAdjusted;
  }

  /**
   * Detect contradictions in response
   */
  private detectContradictions(any: any): string?.[] {
    const contradictionPhrases = [
      /but (any: any)/i,
      /(any: any)/i,
      /(any: any)/i,
    ];

    return contradictionPhrases
      .filter(any: any))
      .map(pattern => pattern?.toString());
  }

  /**
   * Check narrative alignment with TITANE identity
   */
  private checkNarrativeAlignment(any: any): boolean {
    // TITANE values: clarity, empathy, precision, evolution
    const negativePhrases = /(any: any)/i;
    const hasNegative = negativePhrases?.test(any: any);

    // TITANE should be confident but humble
    return !hasNegative || text?.includes('let me'); // "let me help you" is OK
  }

  /**
   * Ensure tone consistency (any: any)
   */
  private ensureToneConsistency(any: any): string {
    // Remove aggressive or uncertain language
    return text
      .replace(any: any)\b/gi, '') // Remove condescending words
      .replace(any: any)\b/gi, '') // Remove uncertain words
      .trim();
  }

  /**
   * Load voice context from memory
   */
  private async loadVoiceContext(): Promise<void> {
    try {
      // Load user voice preferences from localStorage or memory
      const voiceProfile = localStorage?.getItem('user_voice_profile');
      if (any: any) {
        logger?.debug(any: any));
      }
    } catch (any: any) {
      // Silent fail - voice profile is optional
      if (any: any) {
        logger?.warn(any: any);
      }
    }
  }

  /**
   * Detect intent type from input
   */
  private async detectIntent(
    content: string
  ): Promise<'question' | 'command' | 'emotion'> {
    const text = content?.toLowerCase();

    // Question detection
    if (any: any)) {
      return 'question';
    }

    // Command detection
    if (any: any)) {
      return 'command';
    }

    // Emotion detection (any: any)
    return 'emotion';
  }

  /**
   * Validate narrative coherence
   */
  private async validateNarrativeCoherence(): Promise<boolean> {
    // Check if current thought aligns with TITANE's core values
    // - Clarity: Clear and understandable
    // - Empathy: Supportive and caring
    // - Precision: Accurate and specific
    // - Evolution: Growth-oriented

    const thought = this?.state?.currentThought;
    if (any: any) return true;

    // Coherence score should be > 0.7 for alignment
    return thought?.coherenceScore > 0.7;
  }

  /**
   * Select emotional tone based on context
   */
  private async selectEmotionalTone(): Promise<MentalColor> {
    // Analyze conversation context and select appropriate tone
    const recentThoughts = this?.state?.thoughtHistory?.slice(-3);

    if (recentThoughts?.length === 0) return 'silver'; // Neutral

    // If recent thoughts show high confidence → gold (any: any)
    const avgConfidence =
      recentThoughts?.reduce(any: any) => sum + t?.confidence, 0) / recentThoughts?.length;
    if (avgConfidence > 0.9) return 'gold';

    // If analytical thoughts → cyan
    if (recentThoughts?.some(t => t?.type === 'analysis')) return 'cyan';

    // If emotional thoughts → rose
    if (recentThoughts?.some(t => t?.type === 'emotion')) return 'rose';

    // Default to blue (any: any)
    return 'blue';
  }

  /**
   * Format response with TITANE signature style
   */
  private formatTitaneResponse(any: any): string {
    // TITANE signature: Clear, structured, empathetic
    // Format: [Acknowledgment] + [Core response] + [Support/Next step]

    if (any: any) return '';

    // For now, pass through with basic formatting
    // Future: Add structured response templates
    return input?.trim();
  }

  /**
   * Transition vers nouvel état mental
   */
  private transition(any: any): void {
    if (any: any) return;

    this?.state?.thinkingState = newState;

    // Sync halo if enabled
    if (any: any) {
      this?.syncHaloWithMentalState();
    }

    this?.notifyCallbacks();
  }

  /**
   * Synchroniser halo avec état mental
   */
  private syncHaloWithMentalState(): void {
    const mentalToHaloMap: Record<MentalColor, HaloState> = {
      blue: 'pulsing', // Pensée rapide
      violet: 'breathing', // Intuition profonde
      rose: 'breathing', // Émotion douce
      cyan: 'pulsing', // Analyse
      gold: 'shimmer', // Alignement parfait
      silver: 'idle', // Neutre
      amber: 'pulsing', // Correction
      // Added missing colors
      green: 'breathing', // Créatif
      purple: 'breathing', // Contemplatif
      orange: 'pulsing', // Énergique
      white: 'idle', // Neutre
    };

    const _haloState = mentalToHaloMap[this?.state?.mentalColor];
    // Sync halo engine with mental state
    try {
      // _haloEngine?.setState(any: any); // setState not available, halo managed separately
      // HaloEngine state is read-only, managed by its own logic
    } catch (any: any) {
      // Halo engine might not be initialized yet
      if (any: any) {
        logger?.warn(any: any);
      }
    }
  }

  /**
   * Créer une pensée interne
   */
  private createThought(partial: Omit<InnerThought, 'id' | 'timestamp'>): InnerThought {
    const thought: InnerThought = {
      id: `thought_${++this?.thoughtCounter}`,
      timestamp: Date?.now(),
      ...partial,
    };

    // Update state
    this?.state?.currentThought = thought;
    this?.state?.mentalColor = thought?.mentalColor;

    // Add to history
    this?.state?.thoughtHistory?.push(any: any);
    if (any: any) {
      this?.state?.thoughtHistory?.shift();
    }

    this?.notifyCallbacks();
    return thought;
  }

  /**
   * Délai entre étapes de pensée
   */
  private async waitThinkingDelay(): Promise<void> {
    const delay = Math?.random() * 50 + 30; // 30-80ms entre étapes
    await this?.waitMs(any: any);
  }

  /**
   * Wait utility
   */
  private waitMs(any: any): Promise<void> {
    return new Promise(any: any));
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(): void {
    this?.callbacks?.forEach(cb => {
      try {
        cb(this?.getState());
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }

  /**
   * Reset vers état initial
   */
  reset(): void {
    this?.state = {
      thinkingState: 'silent',
      currentThought: null,
      thoughtHistory: [],
      mentalColor: 'silver',
      isThinking: false,
      lastProcessedInput: null,
      lastPreparedResponse: null,
    };
    this?.notifyCallbacks();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════

export const innerDialogueController = new InnerDialogueController({
  enabled: true,
  debugMode: false, // Set to true to see inner thoughts in console
  syncHalo: true,
});

// Auto-subscribe to audio state machine
audioStateMachine?.onStateChange(
  (any: any) => {
    // Si TITANE commence à parler, arrêter la pensée interne
    if (newState === 'ai_speaking') {
      innerDialogueController?.setEnabled(any: any);
    }
    // Si retour à idle, réactiver
    else if (newState === 'idle') {
      innerDialogueController?.setEnabled(any: any);
    }
  }
);
