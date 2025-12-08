/**
 * TITANE∞ v20.0Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v20.0Ω — Context Manager
 *   Gestion du contexte conversationnel avec window management
 *   Phase 1 minimal : Comptage tokens, truncation, injection système
 * ═══════════════════════════════════════════════════════════════
 */

export interface ContextMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenCount?: number;
}

export interface ContextConfig {
  maxTokens: number;
  reservedForResponse: number;
  systemPromptPriority: boolean;
  truncationStrategy: 'oldest_first' | 'summarize' | 'sliding_window';
}

export interface ContextWindow {
  messages: ContextMessage[];
  totalTokens: number;
  availableTokens: number;
  systemPrompt: string | null;
  wasTrincated: boolean;
}

// Estimation tokens simplifié (4 chars ≈ 1 token pour français)
const CHARS_PER_TOKEN = 4;

const DEFAULT_CONFIG: ContextConfig = {
  maxTokens: 4096,
  reservedForResponse: 1024,
  systemPromptPriority: true,
  truncationStrategy: 'oldest_first',
};

/**
 * Context Manager v20.0Ω
 *
 * Responsabilités :
 * - Estimation du nombre de tokens
 * - Maintien de la fenêtre contextuelle
 * - Truncation intelligente si dépassement
 * - Injection du prompt système
 */
export class ContextManager {
  private config: ContextConfig;
  private messages: ContextMessage[] = [];
  private systemPrompt: string | null = null;

  constructor(config: Partial<ContextConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Estime le nombre de tokens pour un texte
   * Approximation : 4 caractères = 1 token (ajusté pour le français)
   */
  estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  /**
   * Définit le prompt système (prioritaire, jamais tronqué)
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Ajoute un message au contexte
   */
  addMessage(role: 'user' | 'assistant' | 'system', content: string): ContextMessage {
    const message: ContextMessage = {
      role,
      content,
      timestamp: new Date(),
      tokenCount: this.estimateTokens(content),
    };

    this.messages.push(message);
    return message;
  }

  /**
   * Calcule le total des tokens actuels
   */
  getTotalTokens(): number {
    const messagesTokens = this.messages.reduce(
      (sum, msg) => sum + (msg.tokenCount ?? this.estimateTokens(msg.content)),
      0
    );
    const systemTokens = this.systemPrompt ? this.estimateTokens(this.systemPrompt) : 0;
    return messagesTokens + systemTokens;
  }

  /**
   * Calcule les tokens disponibles pour le contexte
   */
  getAvailableTokens(): number {
    const usedTokens = this.getTotalTokens();
    const availableForContext = this.config.maxTokens - this.config.reservedForResponse;
    return availableForContext - usedTokens;
  }

  /**
   * Applique la truncation si nécessaire
   * Stratégie : oldest_first (supprime les messages les plus anciens d'abord)
   */
  private applyTruncation(): boolean {
    let truncated = false;
    const maxContextTokens = this.config.maxTokens - this.config.reservedForResponse;
    const systemTokens = this.systemPrompt ? this.estimateTokens(this.systemPrompt) : 0;
    const targetContextTokens = maxContextTokens - systemTokens;

    // Calculer tokens des messages
    let messagesTokens = this.messages.reduce(
      (sum, msg) => sum + (msg.tokenCount ?? this.estimateTokens(msg.content)),
      0
    );

    // Supprimer les messages les plus anciens jusqu'à atteindre la limite
    while (messagesTokens > targetContextTokens && this.messages.length > 0) {
      // Ne jamais supprimer le dernier message user (le plus récent)
      if (this.messages.length <= 1) break;

      // Supprimer le message le plus ancien (index 0)
      const removed = this.messages.shift();
      if (removed) {
        messagesTokens -= removed.tokenCount ?? this.estimateTokens(removed.content);
        truncated = true;
      }
    }

    return truncated;
  }

  /**
   * Construit la fenêtre contextuelle prête pour l'envoi au provider
   */
  buildContextWindow(): ContextWindow {
    const wasTruncated = this.applyTruncation();

    return {
      messages: [...this.messages],
      totalTokens: this.getTotalTokens(),
      availableTokens: this.getAvailableTokens(),
      systemPrompt: this.systemPrompt,
      wasTrincated: wasTruncated,
    };
  }

  /**
   * Convertit la fenêtre en format messages pour provider
   */
  toProviderMessages(): Array<{ role: string; content: string }> {
    const result: Array<{ role: string; content: string }> = [];

    // System prompt en premier (si présent)
    if (this.systemPrompt) {
      result.push({
        role: 'system',
        content: this.systemPrompt,
      });
    }

    // Messages de conversation
    for (const msg of this.messages) {
      result.push({
        role: msg.role,
        content: msg.content,
      });
    }

    return result;
  }

  /**
   * Vide tous les messages (conserve le system prompt)
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Réinitialise complètement le contexte
   */
  reset(): void {
    this.messages = [];
    this.systemPrompt = null;
  }

  /**
   * Retourne un résumé de l'état actuel
   */
  getStatus(): {
    messageCount: number;
    totalTokens: number;
    availableTokens: number;
    hasSystemPrompt: boolean;
  } {
    return {
      messageCount: this.messages.length,
      totalTokens: this.getTotalTokens(),
      availableTokens: this.getAvailableTokens(),
      hasSystemPrompt: !!this.systemPrompt,
    };
  }

  /**
   * Récupère les N derniers messages
   */
  getRecentMessages(count: number): ContextMessage[] {
    return this.messages.slice(-count);
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(config: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton pour usage global simple
let globalContextManager: ContextManager | null = null;

export function getContextManager(config?: Partial<ContextConfig>): ContextManager {
  if (!globalContextManager) {
    globalContextManager = new ContextManager(config);
  }
  return globalContextManager;
}

export function resetContextManager(): void {
  if (globalContextManager) {
    globalContextManager.reset();
  }
  globalContextManager = null;
}

export default ContextManager;
