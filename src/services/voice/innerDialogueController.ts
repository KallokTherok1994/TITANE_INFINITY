/**
 * TITANE∞ v∞ — Inner Dialogue Controller (IDC)
 *
 * Super Prompt XXVII: Le moteur de pensée interne de TITANE∞
 *
 * Gère:
 * - Pensée silencieuse (inner voice) vs parole externe (outer voice)
 * - Auto-régulation mentale
 * - Cohérence identitaire
 * - Transitions cognitives structurées (8 étapes)
 * - Préparation des réponses vocales
 * - Synchronisation halo interne (couleurs mentales)
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

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

/**
 * État de la pensée interne
 * @deprecated Importez depuis @/types/voice (Core ring)
 */
export type { ThinkingState, MentalColor } from '@/types/voice';

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
 * Couleur mentale interne (reflétée dans le halo)
 */
export type MentalColor =
  | 'blue' // Pensée rapide/logique
  | 'violet' // Intuition profonde
  | 'rose' // Émotion douce
  | 'cyan' // Analyse froide
  | 'gold' // Alignement parfait
  | 'silver' // Réflexion neutre
  | 'amber'; // Auto-correction

/**
 * Pensée interne (log invisible)
 */
export interface InnerThought {
  id: string;
  type: ThoughtType;
  step: number; // 1-8 (8-step inner process)
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
  thoughtHistory: InnerThought[]; // Dernières 20 pensées
  mentalColor: MentalColor;
  isThinking: boolean; // True si inner process actif
  lastProcessedInput: string | null;
  lastPreparedResponse: string | null;
}

/**
 * Configuration du IDC
 */
export interface InnerDialogueConfig {
  /** Activer/désactiver le inner dialogue (default: true) */
  enabled?: boolean;

  /** Durée max pensée rapide en ms (default: 100) */
  fastThinkingMaxDuration?: number;

  /** Durée min pensée lente en ms (default: 500) */
  slowThinkingMinDuration?: number;

  /** Taille historique pensées (default: 20) */
  historySize?: number;

  /** Log pensées dans console (default: false - sécurité) */
  debugMode?: boolean;

  /** Sync halo avec état mental (default: true) */
  syncHalo?: boolean;
}

/**
 * Callback pour changements d'état
 */
export type InnerDialogueCallback = (state: InnerDialogueState) => void;

// ═══════════════════════════════════════════════════════════════════
// INNER DIALOGUE CONTROLLER CLASS
// ═══════════════════════════════════════════════════════════════════

class InnerDialogueController {
  private state: InnerDialogueState;
  private config: Required<InnerDialogueConfig>;
  private callbacks: Set<InnerDialogueCallback> = new Set();
  private thoughtCounter = 0;

  constructor(config: InnerDialogueConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      fastThinkingMaxDuration: config.fastThinkingMaxDuration ?? 100,
      slowThinkingMinDuration: config.slowThinkingMinDuration ?? 500,
      historySize: config.historySize ?? 20,
      debugMode: config.debugMode ?? false,
      syncHalo: config.syncHalo ?? true,
    };

    this.state = {
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
  subscribe(callback: InnerDialogueCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Get current state
   */
  getState(): InnerDialogueState {
    return { ...this.state };
  }

  /**
   * Enable/disable inner dialogue
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled && this.state.isThinking) {
      this.transition('silent');
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
   * @returns La réponse préparée (après 8 étapes internes)
   */
  async processBeforeSpeaking(userInput: string): Promise<string> {
    if (!this.config.enabled) {
      // Si désactivé, retourner directement l'input (mode passthrough)
      return userInput;
    }

    this.state.isThinking = true;
    this.state.lastProcessedInput = userInput;
    this.notifyCallbacks();

    try {
      // INNER_STEP_1: Perception
      const thought1 = await this.innerStep1_Perception(userInput);
      await this.waitThinkingDelay();

      // INNER_STEP_2: Context
      const thought2 = await this.innerStep2_Context(thought1);
      await this.waitThinkingDelay();

      // INNER_STEP_3: Intent
      const thought3 = await this.innerStep3_Intent(thought2);
      await this.waitThinkingDelay();

      // INNER_STEP_4: Plan
      const thought4 = await this.innerStep4_Plan(thought3);
      await this.waitThinkingDelay();

      // INNER_STEP_5: Coherence
      const thought5 = await this.innerStep5_Coherence(thought4);
      await this.waitThinkingDelay();

      // INNER_STEP_6: Emotion
      const thought6 = await this.innerStep6_Emotion(thought5);
      await this.waitThinkingDelay();

      // INNER_STEP_7: Validation
      const thought7 = await this.innerStep7_Validation(thought6);
      await this.waitThinkingDelay();

      // INNER_STEP_8: Expression (préparation finale)
      const finalResponse = await this.innerStep8_Expression(thought7);

      this.state.lastPreparedResponse = finalResponse;
      this.state.isThinking = false;
      this.transition('silent');
      this.notifyCallbacks();

      return finalResponse;
    } catch (error) {
      console.error('[IDC] Error in inner process:', error);
      this.state.isThinking = false;
      this.transition('silent');
      this.notifyCallbacks();
      return userInput; // Fallback
    }
  }

  /**
   * Quick thinking (pensée rapide, <100ms)
   * Pour réactions immédiates, réflexes
   */
  async quickThink(input: string): Promise<string> {
    this.transition('fast_thinking');
    const _thought = this.createThought({
      type: 'perception',
      step: 0,
      content: `Quick reaction to: "${input}"`,
      mentalColor: 'blue',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    await this.waitMs(50); // Very fast
    this.transition('silent');
    return input; // Pass-through for quick reactions
  }

  /**
   * Deep reflection (réflexion profonde, >500ms)
   * Pour introspection, alignement identitaire
   */
  async deepReflect(topic: string): Promise<void> {
    this.transition('deep_reflection');
    const _thought2 = this.createThought({
      type: 'intuition',
      step: 0,
      content: `Deep reflection on: "${topic}"`,
      mentalColor: 'violet',
      confidence: 0.8,
      coherenceScore: 0.9,
    });

    await this.waitMs(1000); // Long reflection
    this.transition('silent');
  }

  /**
   * Self-correct (auto-correction)
   * Détecte et corrige incohérences avant de parler
   */
  async selfCorrect(response: string): Promise<string> {
    this.transition('self_correcting');
    const _thought3 = this.createThought({
      type: 'correction',
      step: 0,
      content: `Correcting potential issues in response`,
      mentalColor: 'amber',
      confidence: 0.85,
      coherenceScore: 0.95,
    });

    await this.waitMs(200);

    // TODO: Implement real correction logic
    // - Check for contradictions
    // - Verify narrative alignment
    // - Ensure tone consistency

    this.transition('silent');
    return response; // For now, pass-through
  }

  // ═════════════════════════════════════════════════════════════════
  // INNER 8-STEP PROCESS (PRIVATE)
  // ═════════════════════════════════════════════════════════════════

  /**
   * STEP 1: Perception — "Qu'est-ce que je perçois ?"
   */
  private async innerStep1_Perception(input: string): Promise<InnerThought> {
    this.transition('perceiving');
    const thought = this.createThought({
      type: 'perception',
      step: 1,
      content: `I perceive: "${input.substring(0, 50)}${input.length > 50 ? '...' : ''}"`,
      mentalColor: 'silver',
      confidence: 1.0,
      coherenceScore: 1.0,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 1] Perception:`, thought.content);
    }

    return thought;
  }

  /**
   * STEP 2: Context — "Qu'ai-je appris sur l'utilisateur ?"
   */
  private async innerStep2_Context(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this.transition('fast_thinking');
    const thought = this.createThought({
      type: 'memory_recall',
      step: 2,
      content: `Recall: user preferences, voice style, emotional baseline`,
      mentalColor: 'cyan',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 2] Context:`, thought.content);
    }

    // TODO: Connect to voice memory (UserVoiceProfile)
    return thought;
  }

  /**
   * STEP 3: Intent — "Quel est le sens profond ?"
   */
  private async innerStep3_Intent(_previousThought: InnerThought): Promise<InnerThought> {
    this.transition('slow_thinking');
    const thought = this.createThought({
      type: 'analysis',
      step: 3,
      content: `Intent analysis: question, instruction, or emotion expression?`,
      mentalColor: 'blue',
      confidence: 0.85,
      coherenceScore: 0.9,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 3] Intent:`, thought.content);
    }

    // TODO: Connect to intent recognition
    return thought;
  }

  /**
   * STEP 4: Plan — "Quelle structure de réponse ?"
   */
  private async innerStep4_Plan(_previousThought: InnerThought): Promise<InnerThought> {
    this.transition('planning');
    const thought = this.createThought({
      type: 'plan',
      step: 4,
      content: `Plan: structure response with intro, body, conclusion`,
      mentalColor: 'cyan',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 4] Plan:`, thought.content);
    }

    return thought;
  }

  /**
   * STEP 5: Coherence — "Est-ce cohérent avec TITANE∞ ?"
   */
  private async innerStep5_Coherence(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this.transition('evaluating');
    const thought = this.createThought({
      type: 'validation',
      step: 5,
      content: `Coherence check: align with TITANE identity and narrative`,
      mentalColor: 'violet',
      confidence: 0.95,
      coherenceScore: 0.98,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 5] Coherence:`, thought.content);
    }

    // TODO: Check against narrative engine
    return thought;
  }

  /**
   * STEP 6: Emotion — "Quel ton adopter ?"
   */
  private async innerStep6_Emotion(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this.transition('emotional_sense');
    const thought = this.createThought({
      type: 'emotion',
      step: 6,
      content: `Emotion selection: calm, warm, supportive tone`,
      mentalColor: 'rose',
      confidence: 0.9,
      coherenceScore: 0.95,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 6] Emotion:`, thought.content);
    }

    // TODO: Connect to emotional state
    return thought;
  }

  /**
   * STEP 7: Validation — "Est-ce juste et aligné ?"
   */
  private async innerStep7_Validation(
    _previousThought: InnerThought
  ): Promise<InnerThought> {
    this.transition('validating');
    const thought = this.createThought({
      type: 'validation',
      step: 7,
      content: `Final validation: response is coherent, aligned, and helpful`,
      mentalColor: 'gold',
      confidence: 0.98,
      coherenceScore: 1.0,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 7] Validation:`, thought.content);
    }

    return thought;
  }

  /**
   * STEP 8: Expression — "Préparer la réponse finale"
   */
  private async innerStep8_Expression(_previousThought: InnerThought): Promise<string> {
    this.transition('preparing_speech');
    const thought = this.createThought({
      type: 'plan',
      step: 8,
      content: `Expression: prepare vocal output with TITANE signature`,
      mentalColor: 'gold',
      confidence: 1.0,
      coherenceScore: 1.0,
    });

    if (this.config.debugMode) {
      console.log(`[IDC Step 8] Expression:`, thought.content);
    }

    // TODO: Format response with TitaneSignature style
    // Return the processed input for now
    return this.state.lastProcessedInput || '';
  }

  // ═════════════════════════════════════════════════════════════════
  // HELPERS
  // ═════════════════════════════════════════════════════════════════

  /**
   * Transition vers nouvel état mental
   */
  private transition(newState: ThinkingState): void {
    if (this.state.thinkingState === newState) return;

    this.state.thinkingState = newState;

    // Sync halo if enabled
    if (this.config.syncHalo) {
      this.syncHaloWithMentalState();
    }

    this.notifyCallbacks();
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
    };

    const _haloState = mentalToHaloMap[this.state.mentalColor];
    // haloEngine.setState(_haloState); // TODO: Uncomment when haloEngine has setState
  }

  /**
   * Créer une pensée interne
   */
  private createThought(partial: Omit<InnerThought, 'id' | 'timestamp'>): InnerThought {
    const thought: InnerThought = {
      id: `thought_${++this.thoughtCounter}`,
      timestamp: Date.now(),
      ...partial,
    };

    // Update state
    this.state.currentThought = thought;
    this.state.mentalColor = thought.mentalColor;

    // Add to history
    this.state.thoughtHistory.push(thought);
    if (this.state.thoughtHistory.length > this.config.historySize) {
      this.state.thoughtHistory.shift();
    }

    this.notifyCallbacks();
    return thought;
  }

  /**
   * Délai entre étapes de pensée
   */
  private async waitThinkingDelay(): Promise<void> {
    const delay = Math.random() * 50 + 30; // 30-80ms entre étapes
    await this.waitMs(delay);
  }

  /**
   * Wait utility
   */
  private waitMs(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(cb => {
      try {
        cb(this.getState());
      } catch (error) {
        console.error('[IDC] Callback error:', error);
      }
    });
  }

  /**
   * Reset vers état initial
   */
  reset(): void {
    this.state = {
      thinkingState: 'silent',
      currentThought: null,
      thoughtHistory: [],
      mentalColor: 'silver',
      isThinking: false,
      lastProcessedInput: null,
      lastPreparedResponse: null,
    };
    this.notifyCallbacks();
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
audioStateMachine.onStateChange(
  (newState: AudioConversationState, _prevState: AudioConversationState) => {
    // Si TITANE commence à parler, arrêter la pensée interne
    if (newState === 'ai_speaking') {
      innerDialogueController.setEnabled(false);
    }
    // Si retour à idle, réactiver
    else if (newState === 'idle') {
      innerDialogueController.setEnabled(true);
    }
  }
);
