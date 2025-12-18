/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — VOCAL MICRO-EXPRESSION ENGINE
 *   Injection de micro-expressions vocales naturelles
 *   (mmm, ah, hmm, okay, respirations, rires subtils...)
 * ═══════════════════════════════════════════════════════════════════
 */

import type { UserMood } from '@/types/voice';
import type { EmotionalState } from './emotionalStateEstimator';

/**
 * Type de micro-expression vocale
 */
export type MicroExpressionType =
  | 'thinking' // "hmm...", "euh..."
  | 'agreement' // "mmm", "okay", "d'accord"
  | 'surprise' // "oh ?", "ah !"
  | 'empathy' // "je vois...", "je comprends"
  | 'hesitation' // "heu...", "alors..."
  | 'breath' // Respiration audible
  | 'smile' // Léger rire/sourire vocal
  | 'acknowledgment' // "oui", "uhuh", "mhm"
  | 'transition'; // "bon", "alors", "donc"

/**
 * Micro-expression vocale
 */
export interface MicroExpression {
  type: MicroExpressionType;
  text: string;
  position: 'before' | 'after' | 'inline';
  confidence: number;
  duration?: number; // ms (pour respirations)
}

/**
 * Configuration Micro-Expression Engine
 */
export interface MicroFXConfig {
  /** Activer/désactiver micro-expressions */
  enabled?: boolean;

  /** Fréquence d'injection (0-1, 0=jamais, 1=très souvent) */
  frequency?: number;

  /** Types activés */
  enabledTypes?: MicroExpressionType[];

  /** Contexte relationnel (0=formel, 1=très proche) */
  relationshipProximity?: number;

  /** Permettre expressions avant réponse */
  allowPrefixExpressions?: boolean;

  /** Permettre expressions après réponse */
  allowSuffixExpressions?: boolean;
}

/**
 * Bibliothèque de micro-expressions par type
 */
const MICRO_EXPRESSIONS: Record<MicroExpressionType, string[]> = {
  thinking: ['hmm...', 'euh...', 'voyons...', 'alors...', 'laisse-moi voir...'],
  agreement: ['mmm', 'okay', "d'accord", 'oui oui', 'mhm', 'exact'],
  surprise: ['oh ?', 'ah !', 'oh là', 'tiens !', 'vraiment ?', 'oh wow'],
  empathy: ['je vois...', 'je comprends', 'oui...', 'ah oui', "je t'entends"],
  hesitation: ['euh...', 'beh...', 'comment dire...', 'disons...'],
  breath: ['*breath*', '*sigh*', '*exhale*'], // Marqueurs pour synthèse
  smile: ['*smile*', '*chuckle*', 'héhé'], // Marqueurs sourire
  acknowledgment: ['oui', 'uhuh', 'mhm', 'ok', "d'accord"],
  transition: ['bon', 'alors', 'donc', 'du coup', 'en fait', 'bref'],
};

/**
 * Mapping Mood → Micro-Expression Types préférés
 */
const MOOD_MICROFX_PREFERENCES: Record<UserMood, MicroExpressionType[]> = {
  calm: ['thinking', 'agreement', 'breath'],
  curious: ['thinking', 'surprise', 'acknowledgment'],
  focused: ['acknowledgment', 'transition'],
  excited: ['surprise', 'smile', 'acknowledgment'],
  tired: ['breath', 'hesitation', 'empathy'],
  stressed: ['hesitation', 'breath', 'thinking'],
  frustrated: ['hesitation', 'breath'],
  happy: ['smile', 'agreement', 'acknowledgment'],
  sad: ['empathy', 'breath', 'hesitation'],
  neutral: ['thinking', 'agreement', 'transition'], // Added missing UserMood states
  relaxed: ['breath', 'agreement', 'smile'],
  angry: ['hesitation', 'breath'],
  anxious: ['hesitation', 'breath', 'thinking'],
};

/**
 * ═══════════════════════════════════════════════════════════════════
 *   VOCAL MICRO-EXPRESSION ENGINE
 * ═══════════════════════════════════════════════════════════════════
 */
export class VocalMicroFXEngine {
  private config: Required<MicroFXConfig>;
  private lastInjectionTimestamp = 0;

  constructor(config?: MicroFXConfig) {
    this.config = {
      enabled: config?.enabled ?? true,
      frequency: config?.frequency ?? 0.4,
      enabledTypes:
        config?.enabledTypes ?? (Object.keys(MICRO_EXPRESSIONS) as MicroExpressionType[]),
      relationshipProximity: config?.relationshipProximity ?? 0.5,
      allowPrefixExpressions: config?.allowPrefixExpressions ?? true,
      allowSuffixExpressions: config?.allowSuffixExpressions ?? true,
    };
  }

  /**
   * Injecter micro-expressions dans un texte
   */
  injectMicroExpressions(
    text: string,
    emotionState: EmotionalState,
    context?: {
      isQuestionResponse?: boolean;
      isLongResponse?: boolean;
      previousInteraction?: string;
    }
  ): string {
    if (!this.config.enabled) return text;

    let enhancedText = text;

    // Déterminer si on injecte (basé sur fréquence)
    if (Math.random() > this.config.frequency) {
      return text;
    }

    // Sélectionner micro-expressions appropriées
    const selectedExpressions = this.selectMicroExpressions(emotionState, context);

    // Injecter prefix (avant texte)
    if (this.config.allowPrefixExpressions && selectedExpressions.prefix) {
      enhancedText = `${selectedExpressions.prefix.text} ${enhancedText}`;
    }

    // Injecter inline (dans texte)
    if (selectedExpressions.inline) {
      enhancedText = this.injectInlineExpression(
        enhancedText,
        selectedExpressions.inline
      );
    }

    // Injecter suffix (après texte)
    if (this.config.allowSuffixExpressions && selectedExpressions.suffix) {
      enhancedText = `${enhancedText} ${selectedExpressions.suffix.text}`;
    }

    this.lastInjectionTimestamp = Date.now();

    return enhancedText;
  }

  /**
   * Générer une micro-expression autonome (reaction avant AI response)
   */
  generateAutonomicMicroExpression(emotionState: EmotionalState): MicroExpression | null {
    if (!this.config.enabled) return null;

    // Sélectionner type basé sur mood + energy
    const preferredTypes = MOOD_MICROFX_PREFERENCES[emotionState.mood];

    if (preferredTypes.length === 0) return null;

    // Prioriser selon energy/valence
    let selectedType: MicroExpressionType;

    if (emotionState.energy > 0.7) {
      // High energy → surprise, agreement, smile
      selectedType =
        (this.pickRandom(
          ['surprise', 'agreement', 'smile'].filter(t =>
            preferredTypes.includes(t as MicroExpressionType)
          )
        ) as MicroExpressionType) || preferredTypes[0];
    } else if (emotionState.valence < -0.3) {
      // Negative valence → empathy, breath
      selectedType =
        (this.pickRandom(
          ['empathy', 'breath'].filter(t =>
            preferredTypes.includes(t as MicroExpressionType)
          )
        ) as MicroExpressionType) || preferredTypes[0];
    } else {
      // Default → random from preferred
      selectedType = (this.pickRandom(preferredTypes) ??
        preferredTypes[0]) as MicroExpressionType;
    }

    // Obtenir texte
    const expressionText = this.pickRandom(MICRO_EXPRESSIONS[selectedType]) ?? '';

    return {
      type: selectedType,
      text: expressionText,
      position: 'before',
      confidence: emotionState.confidence,
    };
  }

  /**
   * Obtenir configuration actuelle
   */
  getConfig(): Required<MicroFXConfig> {
    return { ...this.config };
  }

  /**
   * Mettre à jour configuration
   */
  updateConfig(config: Partial<MicroFXConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ═══════════════════════════════════════════════════════════════
  //   PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Sélectionner micro-expressions appropriées
   */
  private selectMicroExpressions(
    emotionState: EmotionalState,
    context?: {
      isQuestionResponse?: boolean;
      isLongResponse?: boolean;
      previousInteraction?: string;
    }
  ): {
    prefix?: MicroExpression;
    inline?: MicroExpression;
    suffix?: MicroExpression;
  } {
    const preferredTypes = MOOD_MICROFX_PREFERENCES[emotionState.mood];
    const result: {
      prefix?: MicroExpression;
      inline?: MicroExpression;
      suffix?: MicroExpression;
    } = {};

    // Prefix (si question response ou réaction émotionnelle forte)
    if (context?.isQuestionResponse || emotionState.energy > 0.6) {
      const prefixType = this.pickRandom(
        preferredTypes.filter(t =>
          ['thinking', 'acknowledgment', 'surprise', 'empathy'].includes(t)
        )
      );

      if (prefixType) {
        result.prefix = {
          type: prefixType,
          text: this.pickRandom(MICRO_EXPRESSIONS[prefixType]) ?? '',
          position: 'before',
          confidence: emotionState.confidence,
        };
      }
    }

    // Inline (si réponse longue)
    if (context?.isLongResponse) {
      const inlineType = this.pickRandom(
        preferredTypes.filter(t => ['transition', 'breath', 'hesitation'].includes(t))
      );

      if (inlineType) {
        result.inline = {
          type: inlineType,
          text: this.pickRandom(MICRO_EXPRESSIONS[inlineType]) ?? '',
          position: 'inline',
          confidence: emotionState.confidence,
        };
      }
    }

    // Suffix (rare, seulement si mood très expressif)
    if (emotionState.mood === 'happy' || emotionState.mood === 'excited') {
      if (Math.random() < 0.3) {
        const suffixType = this.pickRandom(['smile', 'agreement']);
        if (suffixType) {
          result.suffix = {
            type: suffixType as MicroExpressionType,
            text:
              this.pickRandom(MICRO_EXPRESSIONS[suffixType as MicroExpressionType]) ?? '',
            position: 'after',
            confidence: emotionState.confidence,
          };
        }
      }
    }

    return result;
  }

  /**
   * Injecter expression inline dans texte
   */
  private injectInlineExpression(text: string, expression: MicroExpression): string {
    // Trouver position d'injection (après 1ère phrase ou mi-texte)
    const sentences = text.split(/[.!?]\s+/);

    if (sentences.length < 2) return text;

    const midPoint = Math.floor(sentences.length / 2);
    const firstHalf = sentences.slice(0, midPoint).join('. ');
    const secondHalf = sentences.slice(midPoint).join('. ');

    return `${firstHalf}. ${expression.text} ${secondHalf}`;
  }

  /**
   * Pick random element from array
   */
  private pickRandom<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

/**
 * Instance singleton
 */
export const vocalMicroFXEngine = new VocalMicroFXEngine();

/**
 * Helper: Inject micro-expressions
 */
export function injectMicroExpressions(
  text: string,
  emotionState: EmotionalState
): string {
  return vocalMicroFXEngine.injectMicroExpressions(text, emotionState);
}

/**
 * Helper: Generate autonomic micro-expression
 */
export function generateAutonomicMicroExpression(
  emotionState: EmotionalState
): MicroExpression | null {
  return vocalMicroFXEngine.generateAutonomicMicroExpression(emotionState);
}
