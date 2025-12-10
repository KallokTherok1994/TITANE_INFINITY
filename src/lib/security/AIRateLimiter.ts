/**
 * TITANE∞ v19.0 — AI Rate Limiter
 *
 * Rate limiting & monitoring pour appels API IA
 * Protection contre: DoS, coûts excessifs, abus, token overuse
 *
 * @module AIRateLimiter
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RateLimitConfig {
  /** Max requests par fenêtre (default: 50 req/min) */
  maxRequests: number;
  /** Fenêtre temps en ms (default: 60000 = 1 min) */
  windowMs: number;
  /** Max tokens par fenêtre (default: 100000 tokens/min) */
  maxTokens?: number;
  /** Max coût $ par fenêtre (default: 1 $/min) */
  maxCost?: number;
}

export interface RateLimitStatus {
  /** Requests restantes */
  remainingRequests: number;
  /** Tokens restants */
  remainingTokens: number;
  /** Coût restant $ */
  remainingCost: number;
  /** Timestamp reset */
  resetAt: number;
  /** Is blocked (limite atteinte) */
  isBlocked: boolean;
  /** Raison blocage */
  blockReason?: string;
}

export interface RequestMetrics {
  /** Timestamp request */
  timestamp: number;
  /** Tokens utilisés */
  tokens: number;
  /** Coût $ */
  cost: number;
  /** Provider (openai, anthropic, local) */
  provider: string;
  /** Model */
  model: string;
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER CLASS
// ═══════════════════════════════════════════════════════════════

export class AIRateLimiter {
  private config: RateLimitConfig;
  private requests: RequestMetrics[] = [];
  private windowStart: number = Date.now();

  /**
   * Config par défaut (50 req/min, 100k tokens/min, 1$/min)
   */
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 50,
    windowMs: 60000, // 1 minute
    maxTokens: 100000,
    maxCost: 1.0,
  };

  /**
   * Prix par token (approximatif) par modèle
   */
  private static readonly TOKEN_COSTS = {
    'gpt-4': 0.00003, // $0.03 / 1000 tokens
    'gpt-3.5-turbo': 0.000001, // $0.001 / 1000 tokens
    'claude-3-opus': 0.000015, // $0.015 / 1000 tokens
    'claude-3-sonnet': 0.000003, // $0.003 / 1000 tokens
    'gemini-pro': 0.0000005, // $0.0005 / 1000 tokens
    local: 0, // Gratuit
  };

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      ...AIRateLimiter.DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Vérifie si une request est autorisée
   *
   * @param tokens - Tokens estimés pour la request
   * @param provider - Provider ('openai', 'anthropic', 'local')
   * @param model - Model name
   * @returns Status rate limit
   */
  checkLimit(
    tokens: number,
    _provider: string = 'local',
    model: string = 'local'
  ): RateLimitStatus {
    this.cleanupOldRequests();

    const currentRequests = this.requests.length;
    const currentTokens = this.requests.reduce((sum, r) => sum + r.tokens, 0);
    const currentCost = this.requests.reduce((sum, r) => sum + r.cost, 0);

    const cost = this.calculateCost(tokens, model);

    // Check limits
    const status: RateLimitStatus = {
      remainingRequests: Math.max(0, this.config.maxRequests - currentRequests),
      remainingTokens: Math.max(0, (this.config.maxTokens || Infinity) - currentTokens),
      remainingCost: Math.max(0, (this.config.maxCost || Infinity) - currentCost),
      resetAt: this.windowStart + this.config.windowMs,
      isBlocked: false,
    };

    // Block si dépassement
    if (currentRequests >= this.config.maxRequests) {
      status.isBlocked = true;
      status.blockReason = `Max requests (${this.config.maxRequests}/min) exceeded`;
      return status;
    }

    if (this.config.maxTokens && currentTokens + tokens > this.config.maxTokens) {
      status.isBlocked = true;
      status.blockReason = `Max tokens (${this.config.maxTokens}/min) exceeded`;
      return status;
    }

    if (this.config.maxCost && currentCost + cost > this.config.maxCost) {
      status.isBlocked = true;
      status.blockReason = `Max cost ($${this.config.maxCost}/min) exceeded`;
      return status;
    }

    return status;
  }

  /**
   * Enregistre une request (après succès)
   *
   * @param tokens - Tokens utilisés
   * @param provider - Provider
   * @param model - Model
   */
  recordRequest(
    tokens: number,
    provider: string = 'local',
    model: string = 'local'
  ): void {
    const cost = this.calculateCost(tokens, model);

    this.requests.push({
      timestamp: Date.now(),
      tokens,
      cost,
      provider,
      model,
    });
  }

  /**
   * Calcule coût d'une request
   *
   * @param tokens - Tokens
   * @param model - Model
   * @returns Coût en $
   */
  private calculateCost(tokens: number, model: string): number {
    const costPerToken =
      AIRateLimiter.TOKEN_COSTS[model as keyof typeof AIRateLimiter.TOKEN_COSTS] || 0;
    return tokens * costPerToken;
  }

  /**
   * Nettoie requests anciennes (hors fenêtre)
   */
  private cleanupOldRequests(): void {
    const now = Date.now();

    // Reset fenêtre si expirée
    if (now - this.windowStart >= this.config.windowMs) {
      this.windowStart = now;
      this.requests = [];
      return;
    }

    // Garde seulement requests dans fenêtre
    const windowStart = now - this.config.windowMs;
    this.requests = this.requests.filter(r => r.timestamp >= windowStart);
  }

  /**
   * Obtient statistiques actuelles
   *
   * @returns Metrics
   */
  getMetrics(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    requestsPerSecond: number;
    tokensPerSecond: number;
    avgTokensPerRequest: number;
  } {
    this.cleanupOldRequests();

    const totalRequests = this.requests.length;
    const totalTokens = this.requests.reduce((sum, r) => sum + r.tokens, 0);
    const totalCost = this.requests.reduce((sum, r) => sum + r.cost, 0);

    const windowSec = this.config.windowMs / 1000;

    return {
      totalRequests,
      totalTokens,
      totalCost,
      requestsPerSecond: totalRequests / windowSec,
      tokensPerSecond: totalTokens / windowSec,
      avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
    };
  }

  /**
   * Reset compteurs (emergency)
   */
  reset(): void {
    this.requests = [];
    this.windowStart = Date.now();
  }

  /**
   * Obtient status actuel
   *
   * @returns Status rate limit
   */
  getStatus(): RateLimitStatus {
    return this.checkLimit(0, 'local', 'local');
  }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL RATE LIMITER INSTANCE
// ═══════════════════════════════════════════════════════════════

/**
 * Instance globale rate limiter (50 req/min, 100k tokens/min, 1$/min)
 */
export const globalAIRateLimiter = new AIRateLimiter({
  maxRequests: 50,
  windowMs: 60000,
  maxTokens: 100000,
  maxCost: 1.0,
});

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default AIRateLimiter;
