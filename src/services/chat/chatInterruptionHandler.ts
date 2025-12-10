/**
 * TITANE_INFINITY v∞.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.5 — CHAT ENGINE INTERRUPTION HANDLER
 *   Gère les interruptions vocales dans le contexte conversationnel
 *   Adapte les réponses IA selon le type d'interruption
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Type d'interruption conversationnelle
 */
export type InterruptionType =
  | 'hard_stop' // "Stop!" → Arrêt complet, reset contexte
  | 'redirect' // "Non attends, je veux..." → Changement de sujet
  | 'clarification' // "Qu'est-ce que tu veux dire?" → Clarification
  | 'correction' // "Non, ce n'est pas ça" → Correction
  | 'agreement' // "Oui, continue" → Accord, continue
  | 'disagreement'; // "Non, pas du tout" → Désaccord

/**
 * Contexte d'interruption
 */
export interface InterruptionContext {
  type: InterruptionType;
  userText: string;
  interruptedMessage: string; // Message IA interrompu
  interruptedAt: number; // Position dans le message (0-1)
  confidence: number; // 0-1
  timestamp: number;
}

/**
 * Configuration du handler
 */
export interface InterruptionHandlerConfig {
  /** Activer le mode interruption-aware (défaut: false) */
  enabled?: boolean;

  /** Historique des interruptions à conserver (défaut: 10) */
  maxHistory?: number;

  /** Patterns de détection d'interruption */
  patterns?: {
    hardStop?: RegExp[];
    redirect?: RegExp[];
    clarification?: RegExp[];
    correction?: RegExp[];
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 *   INTERRUPTION HANDLER
 * ═══════════════════════════════════════════════════════════════════
 */

export class ChatInterruptionHandler {
  private config: Required<InterruptionHandlerConfig>;
  private history: InterruptionContext[] = [];

  // Patterns de détection par défaut
  private readonly defaultPatterns = {
    hardStop: [
      /^(stop|arrête|tais-toi|silence|chut|ça suffit|stop ça)/i,
      /^(ferme-la|ta gueule|tg)/i,
    ],
    redirect: [
      /(non |attends |en fait |plutôt |maintenant |finalement )/i,
      /(je veux |je voudrais |j'aimerais |peux-tu |pourrais-tu )/i,
    ],
    clarification: [
      /(qu'est-ce que|c'est quoi|comment|pourquoi|ça veut dire quoi|explique)/i,
      /(je ne comprends pas|je n'ai pas compris|répète|redis)/i,
    ],
    correction: [/(non|pas du tout|faux|erreur|c'est pas ça|tu te trompes)/i],
  };

  constructor(config: InterruptionHandlerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? false,
      maxHistory: config.maxHistory ?? 10,
      patterns: {
        hardStop: config.patterns?.hardStop ?? this.defaultPatterns.hardStop,
        redirect: config.patterns?.redirect ?? this.defaultPatterns.redirect,
        clarification:
          config.patterns?.clarification ?? this.defaultPatterns.clarification,
        correction: config.patterns?.correction ?? this.defaultPatterns.correction,
      },
    };

    console.log('[ChatInterruptionHandler] 🧠 Initialized');
  }

  /**
   * Active le mode interruption-aware
   */
  enable(): void {
    this.config.enabled = true;
    console.log('[ChatInterruptionHandler] ✅ Enabled');
  }

  /**
   * Désactive le mode interruption-aware
   */
  disable(): void {
    this.config.enabled = false;
    console.log('[ChatInterruptionHandler] 🔇 Disabled');
  }

  /**
   * Détecte le type d'interruption à partir du texte
   */
  detectInterruptionType(text: string): InterruptionType {
    const normalizedText = text.toLowerCase().trim();

    // Hard stop
    for (const pattern of this.config.patterns.hardStop || []) {
      if (pattern.test(normalizedText)) {
        return 'hard_stop';
      }
    }

    // Redirect
    for (const pattern of this.config.patterns.redirect || []) {
      if (pattern.test(normalizedText)) {
        return 'redirect';
      }
    }

    // Clarification
    for (const pattern of this.config.patterns.clarification || []) {
      if (pattern.test(normalizedText)) {
        return 'clarification';
      }
    }

    // Correction
    for (const pattern of this.config.patterns.correction || []) {
      if (pattern.test(normalizedText)) {
        return 'correction';
      }
    }

    // Default: redirect
    return 'redirect';
  }

  /**
   * Traite une interruption et génère un contexte approprié
   */
  handleInterruption(
    userText: string,
    interruptedMessage: string,
    interruptedAt: number = 0.5
  ): InterruptionContext {
    if (!this.config.enabled) {
      console.warn('[ChatInterruptionHandler] Not enabled');
      return {
        type: 'redirect',
        userText,
        interruptedMessage,
        interruptedAt,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    const type = this.detectInterruptionType(userText);
    const context: InterruptionContext = {
      type,
      userText,
      interruptedMessage,
      interruptedAt,
      confidence: this.computeConfidence(type, userText),
      timestamp: Date.now(),
    };

    console.log(`[ChatInterruptionHandler] 🚨 Interruption: ${type}`);
    console.log(`   User: "${userText}"`);
    console.log(`   Interrupted at: ${(interruptedAt * 100).toFixed(0)}%`);

    // Add to history
    this.history.push(context);
    if (this.history.length > this.config.maxHistory) {
      this.history.shift();
    }

    return context;
  }

  /**
   * Génère un message système pour l'IA
   */
  generateSystemMessage(context: InterruptionContext): string {
    const templates: Record<InterruptionType, string> = {
      hard_stop: `[INTERRUPTION - STOP] L'utilisateur a interrompu votre réponse avec "${context.userText}". Il souhaite que vous arrêtiez complètement. Répondez brièvement et de manière appropriée, puis attendez une nouvelle instruction.`,

      redirect: `[INTERRUPTION - REDIRECTION] L'utilisateur a interrompu votre réponse (${(context.interruptedAt * 100).toFixed(0)}% complétée) pour rediriger la conversation : "${context.userText}". Abandonnez le sujet précédent et concentrez-vous sur cette nouvelle demande.`,

      clarification: `[INTERRUPTION - CLARIFICATION] L'utilisateur a interrompu pour demander une clarification : "${context.userText}". Fournissez une explication claire et concise du point qu'il n'a pas compris, puis proposez de continuer si nécessaire.`,

      correction: `[INTERRUPTION - CORRECTION] L'utilisateur a interrompu pour corriger une erreur : "${context.userText}". Reconnaissez votre erreur, corrigez-la, puis proposez de continuer avec l'information correcte.`,

      agreement: `[INTERRUPTION - ACCORD] L'utilisateur a interrompu pour exprimer son accord : "${context.userText}". Reconnaissez son accord et continuez naturellement.`,

      disagreement: `[INTERRUPTION - DÉSACCORD] L'utilisateur a interrompu pour exprimer son désaccord : "${context.userText}". Reconnaissez son désaccord, adaptez votre réponse en conséquence.`,
    };

    return templates[context.type];
  }

  /**
   * Obtient l'historique des interruptions
   */
  getHistory(): InterruptionContext[] {
    return [...this.history];
  }

  /**
   * Efface l'historique
   */
  clearHistory(): void {
    this.history = [];
    console.log('[ChatInterruptionHandler] 🗑️ History cleared');
  }

  /**
   * Calcule la confiance de détection
   */
  private computeConfidence(type: InterruptionType, text: string): number {
    const normalizedText = text.toLowerCase().trim();
    let confidence = 0.5; // Base confidence

    // Augmente la confiance selon les mots-clés détectés
    const keywords: Record<InterruptionType, string[]> = {
      hard_stop: ['stop', 'arrête', 'tais-toi', 'silence'],
      redirect: ['plutôt', 'maintenant', 'en fait', 'je veux'],
      clarification: ['comment', 'pourquoi', 'explique', "qu'est-ce"],
      correction: ['non', 'faux', 'erreur', 'pas ça'],
      agreement: ['oui', 'exactement', 'continue', "d'accord"],
      disagreement: ['non', 'pas du tout', 'faux', "je ne suis pas d'accord"],
    };

    const typeKeywords = keywords[type] || [];
    const matchCount = typeKeywords.filter(keyword =>
      normalizedText.includes(keyword)
    ).length;

    confidence += matchCount * 0.15;

    return Math.min(confidence, 1.0);
  }

  /**
   * Vérifie si le handler est actif
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

/**
 * Singleton instance
 */
export const chatInterruptionHandler = new ChatInterruptionHandler();
