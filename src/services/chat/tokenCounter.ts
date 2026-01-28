/**
 * TITANE∞ — Token Counter Service
 * Compte les tokens pour les messages et surveille l'utilisation du contexte
 *
 * v26.4.0 (Sprint 6 Phase 3)
 */

import type { AIMessage } from '../ai/types';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface TokenCount {
  total: number;
  input: number;
  output: number;
}

export interface ModelContextLimits {
  model: string;
  maxTokens: number;
  warningThreshold: number; // Pourcentage (ex: 0.8 pour 80%)
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT LIMITS (from contextManager.ts)
// ═══════════════════════════════════════════════════════════════════

const MODEL_CONTEXT_LIMITS: Record<string, ModelContextLimits> = {
  'gpt-4-turbo': { model: 'gpt-4-turbo', maxTokens: 128000, warningThreshold: 0.85 },
  'gpt-4o-mini': { model: 'gpt-4o-mini', maxTokens: 128000, warningThreshold: 0.85 },
  'gpt-4': { model: 'gpt-4', maxTokens: 8192, warningThreshold: 0.8 },
  'gpt-3.5-turbo': { model: 'gpt-3.5-turbo', maxTokens: 16385, warningThreshold: 0.8 },
  'claude-3-opus': { model: 'claude-3-opus', maxTokens: 200000, warningThreshold: 0.9 },
  'claude-3-sonnet': { model: 'claude-3-sonnet', maxTokens: 200000, warningThreshold: 0.9 },
  'claude-3-haiku': { model: 'claude-3-haiku', maxTokens: 200000, warningThreshold: 0.9 },
  'gemini-2.0-flash': { model: 'gemini-2.0-flash', maxTokens: 1000000, warningThreshold: 0.95 },
  'gemini-pro': { model: 'gemini-pro', maxTokens: 32768, warningThreshold: 0.85 },
  'local-llama': { model: 'local-llama', maxTokens: 4096, warningThreshold: 0.75 },
  'github-models': { model: 'github-models', maxTokens: 128000, warningThreshold: 0.85 },
};

// ═══════════════════════════════════════════════════════════════════
// TOKEN ESTIMATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Estime le nombre de tokens pour un texte
 * Formule simple: ~1 token pour 4 caractères en anglais, ~1 token pour 2-3 caractères en français
 * Note: Pour un comptage précis, utiliser tiktoken (mais ajoute ~1MB au bundle)
 */
function estimateTokens(text: string): number {
  if (!text) return 0;

  // Approximation: nombre de mots * 1.3 (accounting for punctuation, special chars)
  const words = text.split(/\s+/).length;
  const chars = text.length;

  // Formule hybride: moyenne entre approche mots et caractères
  const byWords = words * 1.3;
  const byChars = chars / 3.5; // ~3.5 chars par token en moyenne

  return Math.ceil((byWords + byChars) / 2);
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════════

export class TokenCounterService {
  /**
   * Compte les tokens pour un message
   */
  countMessageTokens(message: AIMessage): number {
    // Base: contenu du message
    let tokens = estimateTokens(message.content);

    // Overhead: rôle + structure JSON (~10 tokens par message)
    tokens += 10;

    // Si metadata, ajouter overhead
    if (message.metadata) {
      tokens += estimateTokens(JSON.stringify(message.metadata));
    }

    return tokens;
  }

  /**
   * Compte les tokens pour plusieurs messages
   */
  countMessagesTokens(messages: AIMessage[]): TokenCount {
    let total = 0;
    let input = 0;
    let output = 0;

    messages.forEach((msg) => {
      const count = this.countMessageTokens(msg);
      total += count;

      if (msg.role === 'user') {
        input += count;
      } else if (msg.role === 'assistant') {
        output += count;
      }
    });

    return { total, input, output };
  }

  /**
   * Vérifie si la conversation approche la limite
   */
  checkContextUsage(
    messages: AIMessage[],
    model: string = 'gpt-4-turbo'
  ): {
    tokenCount: TokenCount;
    limit: number;
    percentage: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
  } {
    const limits = MODEL_CONTEXT_LIMITS[model] || MODEL_CONTEXT_LIMITS['gpt-4-turbo'];
    if (!limits) {
      throw new Error(`Model ${model} not found in context limits`);
    }
    const tokenCount = this.countMessagesTokens(messages);
    const percentage = tokenCount.total / limits.maxTokens;

    return {
      tokenCount,
      limit: limits.maxTokens,
      percentage,
      isNearLimit: percentage >= limits.warningThreshold,
      isOverLimit: percentage >= 1.0,
    };
  }

  /**
   * Obtient les limites pour un modèle
   */
  getModelLimits(model: string): ModelContextLimits {
    const limits = MODEL_CONTEXT_LIMITS[model] || MODEL_CONTEXT_LIMITS['gpt-4-turbo'];
    if (!limits) {
      throw new Error(`Model ${model} not found in context limits`);
    }
    return limits;
  }

  /**
   * Formate le comptage pour affichage
   */
  formatTokenCount(count: number): string {
    if (count < 1000) return `${count}`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(2)}M`;
  }

  /**
   * Obtient une estimation de coût (approximatif)
   */
  estimateCost(
    tokenCount: TokenCount,
    model: string = 'gpt-4-turbo'
  ): { inputCost: number; outputCost: number; totalCost: number } {
    // Prix approximatifs par 1K tokens (à jour en janvier 2026)
    const prices: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'gemini-2.0-flash': { input: 0.0, output: 0.0 }, // Free tier
      'gemini-pro': { input: 0.00025, output: 0.0005 },
      'local-llama': { input: 0.0, output: 0.0 }, // Local = free
      'github-models': { input: 0.0, output: 0.0 }, // Free tier
    };

    const price = prices[model] || prices['gpt-4-turbo'];
    if (!price) {
      throw new Error(`Model ${model} not found in pricing`);
    }

    const inputCost = (tokenCount.input / 1000) * price.input;
    const outputCost = (tokenCount.output / 1000) * price.output;
    const totalCost = inputCost + outputCost;

    return { inputCost, outputCost, totalCost };
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════

let tokenCounterInstance: TokenCounterService | null = null;

export function getTokenCounter(): TokenCounterService {
  if (!tokenCounterInstance) {
    tokenCounterInstance = new TokenCounterService();
  }
  return tokenCounterInstance;
}

export default TokenCounterService;
