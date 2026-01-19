/**
 * TITANE∞ v24.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.5 — FRONTEND RATE LIMITER
 *   Protects against API quota exhaustion
 *   Implements Token Bucket + Sliding Window algorithms
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('RateLimiter');

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RateLimitConfig {
  /** Max requests per minute */
  requestsPerMinute: number;
  /** Max requests per hour */
  requestsPerHour: number;
  /** Max tokens per minute (estimated) */
  tokensPerMinute: number;
  /** Burst allowance (temporary spike) */
  burstAllowance: number;
  /** Cooldown period after hitting limit (ms) */
  cooldownMs: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingRequests: number;
  remainingTokens: number;
  resetTime: number;
  reason?: string;
  retryAfterMs?: number;
}

export interface RateLimitStats {
  provider: string;
  requestsThisMinute: number;
  requestsThisHour: number;
  tokensThisMinute: number;
  lastRequest: number;
  limitHits: number;
  inCooldown: boolean;
  cooldownEndsAt: number;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGS
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_RATE_CONFIG: RateLimitConfig = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  tokensPerMinute: 100000,
  burstAllowance: 10,
  cooldownMs: 5000,
};

// Provider-specific rate limits (based on typical API quotas)
export const PROVIDER_RATE_CONFIGS: Record<string, Partial<RateLimitConfig>> = {
  claude: {
    requestsPerMinute: 50, // Anthropic limits
    requestsPerHour: 500,
    tokensPerMinute: 80000,
    cooldownMs: 10000,
  },
  openai: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    tokensPerMinute: 90000,
    cooldownMs: 8000,
  },
  gemini: {
    requestsPerMinute: 60, // Google limits
    requestsPerHour: 1500,
    tokensPerMinute: 100000,
    cooldownMs: 5000,
  },
  'tauri-backend': {
    requestsPerMinute: 120, // Local backend - more permissive
    requestsPerHour: 3000,
    tokensPerMinute: 200000,
    cooldownMs: 2000,
  },
  ollama: {
    requestsPerMinute: 100, // Local - no external limits
    requestsPerHour: 5000,
    tokensPerMinute: 500000,
    cooldownMs: 1000,
  },
  'titane-local': {
    requestsPerMinute: 200, // Fallback - minimal limits
    requestsPerHour: 10000,
    tokensPerMinute: 1000000,
    cooldownMs: 500,
  },
};

// ═══════════════════════════════════════════════════════════════
// SLIDING WINDOW COUNTER
// ═══════════════════════════════════════════════════════════════

// ✨ v24.2.1: Max entries to prevent unbounded growth between cleanups
const MAX_WINDOW_ENTRIES = 1000;

interface WindowEntry {
  timestamp: number;
  tokens: number;
}

class SlidingWindowCounter {
  private entries: WindowEntry[] = [];
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  add(tokens: number = 0): void {
    this.entries.push({ timestamp: Date.now(), tokens });
    this.cleanup();
  }

  count(): number {
    this.cleanup();
    return this.entries.length;
  }

  totalTokens(): number {
    this.cleanup();
    return this.entries.reduce((sum, e) => sum + e.tokens, 0);
  }

  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.entries = this.entries.filter(e => e.timestamp > cutoff);
    // ✨ v24.2.1: Enforce absolute size limit
    if (this.entries.length > MAX_WINDOW_ENTRIES) {
      this.entries = this.entries.slice(-MAX_WINDOW_ENTRIES);
    }
  }

  clear(): void {
    this.entries = [];
  }
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER CLASS
// ═══════════════════════════════════════════════════════════════

class RateLimiter {
  private configs: Map<string, RateLimitConfig> = new Map();
  private minuteCounters: Map<string, SlidingWindowCounter> = new Map();
  private hourCounters: Map<string, SlidingWindowCounter> = new Map();
  private cooldowns: Map<string, number> = new Map(); // provider -> cooldownEndsAt
  private limitHits: Map<string, number> = new Map();
  private lastRequest: Map<string, number> = new Map();

  constructor() {
    logger.info('Rate Limiter initialized');
  }

  /**
   * Get config for provider
   */
  private getConfig(provider: string): RateLimitConfig {
    if (!this.configs.has(provider)) {
      const providerConfig = PROVIDER_RATE_CONFIGS[provider] || {};
      this.configs.set(provider, { ...DEFAULT_RATE_CONFIG, ...providerConfig });
    }
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Rate limit config for provider ${provider} not found`);
    }
    return config;
  }

  /**
   * Get minute counter for provider
   */
  private getMinuteCounter(provider: string): SlidingWindowCounter {
    if (!this.minuteCounters.has(provider)) {
      this.minuteCounters.set(provider, new SlidingWindowCounter(60000)); // 1 minute
    }
    const counter = this.minuteCounters.get(provider);
    if (!counter) {
      throw new Error(`Minute counter for provider ${provider} not found`);
    }
    return counter;
  }

  /**
   * Get hour counter for provider
   */
  private getHourCounter(provider: string): SlidingWindowCounter {
    if (!this.hourCounters.has(provider)) {
      this.hourCounters.set(provider, new SlidingWindowCounter(3600000)); // 1 hour
    }
    const counter = this.hourCounters.get(provider);
    if (!counter) {
      throw new Error(`Hour counter for provider ${provider} not found`);
    }
    return counter;
  }

  /**
   * Check if request is allowed
   */
  checkLimit(provider: string, estimatedTokens: number = 1000): RateLimitStatus {
    const config = this.getConfig(provider);
    const minuteCounter = this.getMinuteCounter(provider);
    const hourCounter = this.getHourCounter(provider);
    const now = Date.now();

    // Check cooldown
    const cooldownEnd = this.cooldowns.get(provider) || 0;
    if (now < cooldownEnd) {
      return {
        allowed: false,
        remainingRequests: 0,
        remainingTokens: 0,
        resetTime: cooldownEnd,
        reason: 'In cooldown period',
        retryAfterMs: cooldownEnd - now,
      };
    }

    const requestsThisMinute = minuteCounter.count();
    const requestsThisHour = hourCounter.count();
    const tokensThisMinute = minuteCounter.totalTokens();

    // Check per-minute limit
    if (requestsThisMinute >= config.requestsPerMinute) {
      this.triggerCooldown(provider, 'requests per minute');
      return {
        allowed: false,
        remainingRequests: 0,
        remainingTokens: config.tokensPerMinute - tokensThisMinute,
        resetTime: now + config.cooldownMs,
        reason: `Rate limit exceeded: ${requestsThisMinute}/${config.requestsPerMinute} requests/min`,
        retryAfterMs: config.cooldownMs,
      };
    }

    // Check per-hour limit
    if (requestsThisHour >= config.requestsPerHour) {
      this.triggerCooldown(provider, 'requests per hour');
      return {
        allowed: false,
        remainingRequests: 0,
        remainingTokens: config.tokensPerMinute - tokensThisMinute,
        resetTime: now + config.cooldownMs * 2,
        reason: `Hourly limit exceeded: ${requestsThisHour}/${config.requestsPerHour} requests/hour`,
        retryAfterMs: config.cooldownMs * 2,
      };
    }

    // Check token limit
    if (tokensThisMinute + estimatedTokens > config.tokensPerMinute) {
      this.triggerCooldown(provider, 'tokens per minute');
      return {
        allowed: false,
        remainingRequests: config.requestsPerMinute - requestsThisMinute,
        remainingTokens: 0,
        resetTime: now + config.cooldownMs,
        reason: `Token limit exceeded: ${tokensThisMinute}/${config.tokensPerMinute} tokens/min`,
        retryAfterMs: config.cooldownMs,
      };
    }

    return {
      allowed: true,
      remainingRequests: config.requestsPerMinute - requestsThisMinute,
      remainingTokens: config.tokensPerMinute - tokensThisMinute,
      resetTime: now + 60000,
    };
  }

  /**
   * Record a request (call after successful check)
   */
  recordRequest(provider: string, tokens: number = 1000): void {
    const minuteCounter = this.getMinuteCounter(provider);
    const hourCounter = this.getHourCounter(provider);

    minuteCounter.add(tokens);
    hourCounter.add(tokens);
    this.lastRequest.set(provider, Date.now());
  }

  /**
   * Trigger cooldown for a provider
   */
  private triggerCooldown(provider: string, reason: string): void {
    const config = this.getConfig(provider);
    const cooldownEnd = Date.now() + config.cooldownMs;
    this.cooldowns.set(provider, cooldownEnd);

    const hits = (this.limitHits.get(provider) || 0) + 1;
    this.limitHits.set(provider, hits);

    logger.warn(`Rate limit triggered for ${provider}: ${reason} (hit #${hits})`);
  }

  /**
   * Check and record in one call (convenience method)
   */
  acquire(provider: string, estimatedTokens: number = 1000): RateLimitStatus {
    const status = this.checkLimit(provider, estimatedTokens);
    if (status.allowed) {
      this.recordRequest(provider, estimatedTokens);
    }
    return status;
  }

  /**
   * Get stats for a provider
   */
  getStats(provider: string): RateLimitStats {
    // Initialize config to ensure provider exists
    this.getConfig(provider);
    const minuteCounter = this.getMinuteCounter(provider);
    const hourCounter = this.getHourCounter(provider);
    const now = Date.now();
    const cooldownEnd = this.cooldowns.get(provider) || 0;

    return {
      provider,
      requestsThisMinute: minuteCounter.count(),
      requestsThisHour: hourCounter.count(),
      tokensThisMinute: minuteCounter.totalTokens(),
      lastRequest: this.lastRequest.get(provider) || 0,
      limitHits: this.limitHits.get(provider) || 0,
      inCooldown: now < cooldownEnd,
      cooldownEndsAt: cooldownEnd,
    };
  }

  /**
   * Get all provider stats
   */
  getAllStats(): Map<string, RateLimitStats> {
    const stats = new Map<string, RateLimitStats>();
    const providers = new Set([
      ...this.minuteCounters.keys(),
      ...Object.keys(PROVIDER_RATE_CONFIGS),
    ]);

    for (const provider of providers) {
      stats.set(provider, this.getStats(provider));
    }
    return stats;
  }

  /**
   * Reset limits for a provider
   */
  reset(provider: string): void {
    this.minuteCounters.get(provider)?.clear();
    this.hourCounters.get(provider)?.clear();
    this.cooldowns.delete(provider);
    this.limitHits.delete(provider);
    logger.info(`Rate limits reset for ${provider}`);
  }

  /**
   * Reset all limits
   */
  resetAll(): void {
    for (const counter of this.minuteCounters.values()) {
      counter.clear();
    }
    for (const counter of this.hourCounters.values()) {
      counter.clear();
    }
    this.cooldowns.clear();
    this.limitHits.clear();
    logger.info('All rate limits reset');
  }

  /**
   * Check if any provider is rate limited
   */
  hasRateLimitedProviders(): boolean {
    const now = Date.now();
    for (const cooldownEnd of this.cooldowns.values()) {
      if (now < cooldownEnd) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get list of rate limited providers
   */
  getRateLimitedProviders(): string[] {
    const limited: string[] = [];
    const now = Date.now();
    for (const [provider, cooldownEnd] of this.cooldowns) {
      if (now < cooldownEnd) {
        limited.push(provider);
      }
    }
    return limited;
  }

  /**
   * Estimate tokens from message length (rough approximation)
   */
  estimateTokens(message: string, history: { content: string }[] = []): number {
    // Rough estimate: ~4 characters per token for English
    const messageTokens = Math.ceil(message.length / 4);
    const historyTokens = history.reduce(
      (sum, msg) => sum + Math.ceil(msg.content.length / 4),
      0
    );
    return messageTokens + historyTokens + 500; // +500 for overhead/response
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════

export const rateLimiter = new RateLimiter();

export default rateLimiter;
