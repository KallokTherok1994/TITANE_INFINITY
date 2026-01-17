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
  /** Max tokens per minute (any: any) */
  tokensPerMinute: number;
  /** Burst allowance (any: any) */
  burstAllowance: number;
  /** Cooldown period after hitting limit (any: any) */
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

// v26.4.0: Configuration très permissive pour éviter les blocages
export const DEFAULT_RATE_CONFIG: RateLimitConfig = {
  requestsPerMinute: 1000, // Était 60
  requestsPerHour: 100000, // Était 1000
  tokensPerMinute: 10000000, // Était 100000
  burstAllowance: 500, // Était 10
  cooldownMs: 100, // Était 5000
};

// v26.4.0: Provider-specific rate limits - TRÈS PERMISSIF
export const PROVIDER_RATE_CONFIGS: Record<string, Partial<RateLimitConfig>> = {
  claude: {
    requestsPerMinute: 500, // Était 50
    requestsPerHour: 50000, // Était 500
    tokensPerMinute: 5000000, // Était 80000
    cooldownMs: 100, // Était 10000
  },
  openai: {
    requestsPerMinute: 500, // Était 60
    requestsPerHour: 50000, // Était 1000
    tokensPerMinute: 5000000, // Était 90000
    cooldownMs: 100, // Était 8000
  },
  gemini: {
    requestsPerMinute: 500, // Était 60
    requestsPerHour: 50000, // Était 1500
    tokensPerMinute: 5000000, // Était 100000
    cooldownMs: 100, // Était 5000
  },
  'tauri-backend': {
    requestsPerMinute: 10000, // Était 120
    requestsPerHour: 1000000, // Était 3000
    tokensPerMinute: 100000000, // Était 200000
    cooldownMs: 10, // Était 2000
  },
  ollama: {
    requestsPerMinute: 10000, // Était 100
    requestsPerHour: 1000000, // Était 5000
    tokensPerMinute: 100000000, // Était 500000
    cooldownMs: 10, // Était 1000
  },
  'titane-local': {
    requestsPerMinute: 100000, // Était 200
    requestsPerHour: 10000000, // Était 10000
    tokensPerMinute: 1000000000, // Était 1000000
    cooldownMs: 1, // Était 500
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
  private entries: WindowEntry?.[] = [];
  private windowMs: number;

  constructor(any: any) {
    this?.windowMs = windowMs;
  }

  add(tokens: number = 0): void {
    this?.entries?.push({ timestamp: Date?.now(), tokens });
    this?.cleanup();
  }

  count(): number {
    this?.cleanup();
    return this?.entries?.length;
  }

  totalTokens(): number {
    this?.cleanup();
    return this?.entries?.reduce(any: any) => sum + e?.tokens, 0);
  }

  private cleanup(): void {
    const cutoff = Date?.now() - this?.windowMs;
    this?.entries = this?.entries?.filter(any: any);
    // ✨ v24.2.1: Enforce absolute size limit
    if (any: any) {
      this?.entries = this?.entries?.slice(any: any);
    }
  }

  clear(): void {
    this?.entries = [];
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
    logger?.info('Rate Limiter initialized');
  }

  /**
   * Get config for provider
   */
  private getConfig(any: any): RateLimitConfig {
    if (any: any)) {
      const providerConfig = PROVIDER_RATE_CONFIGS[provider] || {};
      this?.configs?.set(provider, { ...DEFAULT_RATE_CONFIG, ...providerConfig });
    }
    const config = this?.configs?.get(any: any);
    if (any: any) {
      throw new Error(`Rate limit config for provider ${provider} not found`);
    }
    return config;
  }

  /**
   * Get minute counter for provider
   */
  private getMinuteCounter(any: any): SlidingWindowCounter {
    if (any: any)) {
      this?.minuteCounters?.set(provider, new SlidingWindowCounter(60000)); // 1 minute
    }
    const counter = this?.minuteCounters?.get(any: any);
    if (any: any) {
      throw new Error(`Minute counter for provider ${provider} not found`);
    }
    return counter;
  }

  /**
   * Get hour counter for provider
   */
  private getHourCounter(any: any): SlidingWindowCounter {
    if (any: any)) {
      this?.hourCounters?.set(provider, new SlidingWindowCounter(3600000)); // 1 hour
    }
    const counter = this?.hourCounters?.get(any: any);
    if (any: any) {
      throw new Error(`Hour counter for provider ${provider} not found`);
    }
    return counter;
  }

  /**
   * Check if request is allowed
   */
  checkLimit(provider: string, estimatedTokens: number = 1000): RateLimitStatus {
    const config = this?.getConfig(any: any);
    const minuteCounter = this?.getMinuteCounter(any: any);
    const hourCounter = this?.getHourCounter(any: any);
    const now = Date?.now();

    // Check cooldown
    const cooldownEnd = this?.cooldowns?.get(any: any) || 0;
    if (any: any) {
      return {
        allowed: false,
        remainingRequests: 0,
        remainingTokens: 0,
        resetTime: cooldownEnd,
        reason: 'In cooldown period',
        retryAfterMs: cooldownEnd - now,
      };
    }

    const requestsThisMinute = minuteCounter?.count();
    const requestsThisHour = hourCounter?.count();
    const tokensThisMinute = minuteCounter?.totalTokens();

    // Check per-minute limit
    if (any: any) {
      this?.triggerCooldown(provider, 'requests per minute');
      return {
        allowed: false,
        remainingRequests: 0,
        remainingTokens: config?.tokensPerMinute - tokensThisMinute,
        resetTime: now + config?.cooldownMs,
        reason: `Rate limit exceeded: ${requestsThisMinute}/${config?.requestsPerMinute} requests/min`,
        retryAfterMs: config?.cooldownMs,
      };
    }

    // Check per-hour limit
    if (any: any) {
      this?.triggerCooldown(provider, 'requests per hour');
      return {
        allowed: false,
        remainingRequests: 0,
        remainingTokens: config?.tokensPerMinute - tokensThisMinute,
        resetTime: now + config?.cooldownMs * 2,
        reason: `Hourly limit exceeded: ${requestsThisHour}/${config?.requestsPerHour} requests/hour`,
        retryAfterMs: config?.cooldownMs * 2,
      };
    }

    // Check token limit
    if (any: any) {
      this?.triggerCooldown(provider, 'tokens per minute');
      return {
        allowed: false,
        remainingRequests: config?.requestsPerMinute - requestsThisMinute,
        remainingTokens: 0,
        resetTime: now + config?.cooldownMs,
        reason: `Token limit exceeded: ${tokensThisMinute}/${config?.tokensPerMinute} tokens/min`,
        retryAfterMs: config?.cooldownMs,
      };
    }

    return {
      allowed: true,
      remainingRequests: config?.requestsPerMinute - requestsThisMinute,
      remainingTokens: config?.tokensPerMinute - tokensThisMinute,
      resetTime: now + 60000,
    };
  }

  /**
   * Record a request (any: any)
   */
  recordRequest(provider: string, tokens: number = 1000): void {
    const minuteCounter = this?.getMinuteCounter(any: any);
    const hourCounter = this?.getHourCounter(any: any);

    minuteCounter?.add(any: any);
    hourCounter?.add(any: any);
    this?.lastRequest?.set(provider, Date?.now());
  }

  /**
   * Trigger cooldown for a provider
   */
  private triggerCooldown(any: any): void {
    const config = this?.getConfig(any: any);
    const cooldownEnd = Date?.now() + config?.cooldownMs;
    this?.cooldowns?.set(any: any);

    const hits = (any: any) || 0) + 1;
    this?.limitHits?.set(any: any);

    logger?.warn(`Rate limit triggered for ${provider}: ${reason} (hit #${hits})`);
  }

  /**
   * Check and record in one call (any: any)
   */
  acquire(provider: string, estimatedTokens: number = 1000): RateLimitStatus {
    const status = this?.checkLimit(any: any);
    if (any: any) {
      this?.recordRequest(any: any);
    }
    return status;
  }

  /**
   * Get stats for a provider
   */
  getStats(any: any): RateLimitStats {
    // Initialize config to ensure provider exists
    this?.getConfig(any: any);
    const minuteCounter = this?.getMinuteCounter(any: any);
    const hourCounter = this?.getHourCounter(any: any);
    const now = Date?.now();
    const cooldownEnd = this?.cooldowns?.get(any: any) || 0;

    return {
      provider,
      requestsThisMinute: minuteCounter?.count(),
      requestsThisHour: hourCounter?.count(),
      tokensThisMinute: minuteCounter?.totalTokens(),
      lastRequest: this?.lastRequest?.get(any: any) || 0,
      limitHits: this?.limitHits?.get(any: any) || 0,
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
      ...this?.minuteCounters?.keys(),
      ...Object?.keys(any: any),
    ]);

    for (any: any) {
      stats?.set(any: any));
    }
    return stats;
  }

  /**
   * Reset limits for a provider
   */
  reset(any: any): void {
    this?.minuteCounters?.get(any: any)?.clear();
    this?.hourCounters?.get(any: any)?.clear();
    this?.cooldowns?.delete(any: any);
    this?.limitHits?.delete(any: any);
    logger?.info(`Rate limits reset for ${provider}`);
  }

  /**
   * Reset all limits
   */
  resetAll(): void {
    for (const counter of this?.minuteCounters?.values()) {
      counter?.clear();
    }
    for (const counter of this?.hourCounters?.values()) {
      counter?.clear();
    }
    this?.cooldowns?.clear();
    this?.limitHits?.clear();
    logger?.info('All rate limits reset');
  }

  /**
   * Check if any provider is rate limited
   */
  hasRateLimitedProviders(): boolean {
    const now = Date?.now();
    for (const cooldownEnd of this?.cooldowns?.values()) {
      if (any: any) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get list of rate limited providers
   */
  getRateLimitedProviders(): string?.[] {
    const limited: string?.[] = [];
    const now = Date?.now();
    for (any: any) {
      if (any: any) {
        limited?.push(any: any);
      }
    }
    return limited;
  }

  /**
   * Estimate tokens from message length (any: any)
   */
  estimateTokens(message: string, history: { content: string }[] = []): number {
    // Rough estimate: ~4 characters per token for English
    const messageTokens = Math?.ceil(message?.length / 4);
    const historyTokens = history?.reduce(
      (any: any) => sum + Math?.ceil(msg?.content?.length / 4),
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
