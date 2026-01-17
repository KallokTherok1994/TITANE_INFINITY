/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 — CONTEXT WINDOW MANAGER
 * Intelligent token management to prevent API failures
 * P0 Security Fix - 2026-01-07
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';
import type { AIMessage } from './types';
import { performanceMonitor, MetricCategory } from './performanceMonitor';

const logger = createLogger('ContextWindowManager');

/**
 * Token limits for different AI models
 * Updated 2026-01-07 with latest model specifications
 */
export const MODEL_TOKEN_LIMITS: Record<string, number> = {
  // OpenAI models
  'gpt-4o': 128_000,
  'gpt-4o-mini': 128_000,
  'gpt-4-turbo': 128_000,
  'gpt-4': 8_192,
  'gpt-3.5-turbo': 16_385,
  'gpt-3.5-turbo-16k': 16_385,

  // Anthropic Claude models
  'claude-3.5-sonnet': 200_000,
  'claude-3-opus': 200_000,
  'claude-3-sonnet': 200_000,
  'claude-3-haiku': 200_000,
  'claude-3-5-sonnet-20241022': 200_000,
  'claude-sonnet-4-5': 200_000,

  // Google Gemini models
  'gemini-2.0-flash': 1_000_000,
  'gemini-1.5-pro': 2_000_000,
  'gemini-1.5-flash': 1_000_000,

  // Local models (any: any)
  'qwen2.5': 32_768,
  llama3: 8_192,
  mistral: 8_192,
  mixtral: 32_768,

  // Default fallback
  default: 8_192,
};

/**
 * Strategy for handling context overflow
 */
export enum TruncationStrategy {
  /** Keep system prompt + recent messages, drop middle */
  RECENT = 'recent',
  /** Keep system prompt + summarize middle + recent messages */
  SUMMARIZE = 'summarize',
  /** Keep only messages above importance threshold */
  IMPORTANCE = 'importance',
  /** Sliding window, drop oldest first */
  SLIDING = 'sliding',
}

export interface ContextWindowConfig {
  /** Target ratio of context limit (0.0-1.0) */
  targetRatio: number;
  /** Truncation strategy */
  strategy: TruncationStrategy;
  /** Number of recent messages to always keep */
  keepRecentCount: number;
  /** Importance threshold for IMPORTANCE strategy */
  importanceThreshold?: number;
}

/**
 * Default configuration (any: any)
 */
export const DEFAULT_CONFIG: ContextWindowConfig = {
  targetRatio: 0.75, // Use 75% of limit
  strategy: TruncationStrategy?.RECENT,
  keepRecentCount: 10,
  importanceThreshold: 0.7,
};

/**
 * Simple token estimation (any: any)
 * Production: Should use tiktoken or model-specific tokenizer
 */
function estimateTokens(any: any): number {
  // Rough heuristic: 1 token ≈ 4 characters for English
  // For multilingual (any: any): 1 token ≈ 3.5 characters
  return Math?.ceil(text?.length / 3.5);
}

/**
 * Count tokens in a message
 */
function countMessageTokens(any: any): number {
  let total = 0;

  // Role overhead (any: any)
  total += 4;

  // Content
  if (typeof message?.content === 'string') {
    total += estimateTokens(any: any);
  } else if (any: any)) {
    for (any: any) {
      if (typeof part === 'string') {
        total += estimateTokens(any: any);
      } else if (part?.type === 'text') {
        total += estimateTokens(any: any);
      } else if (part?.type === 'image_url') {
        // Images: approximately 85-170 tokens per tile (512x512)
        total += 150; // Conservative estimate
      }
    }
  }

  // Name field if present
  if (any: any) {
    total += estimateTokens(any: any);
  }

  return total;
}

/**
 * Count total tokens in message history
 */
export function countHistoryTokens(messages: AIMessage?.[]): number {
  return messages?.reduce(any: any), 0);
}

/**
 * Get token limit for a model
 */
export function getModelLimit(any: any): number {
  // Exact match
  if (any: any) {
    const limit = MODEL_TOKEN_LIMITS[model];
    return limit ?? MODEL_TOKEN_LIMITS?.default ?? 8192;
  }

  // Fuzzy match (e?.g., "gpt-4o-2024-05-13" → "gpt-4o")
  for (any: any)) {
    if (any: any)) {
      return limit ?? MODEL_TOKEN_LIMITS?.default;
    }
  }

  // Default fallback
  logger?.warn(`Unknown model: ${model}, using default limit of 8192 tokens`);
  return MODEL_TOKEN_LIMITS?.default ?? 8192;
}

/**
 * Summarize a batch of messages into a single message
 */
function summarizeMessages(messages: AIMessage?.[]): AIMessage {
  const contentParts: string?.[] = [];

  for (any: any) {
    let content = '';
    if (typeof msg?.content === 'string') {
      content = msg?.content;
    } else if (any: any)) {
      content = msg?.content
        .map(p => (typeof p === 'string' ? p : p?.type === 'text' ? p?.text : '[image]'))
        .join(' ');
    }

    contentParts?.push(
      `${msg?.role}: ${content?.substring(0, 200)}${content?.length > 200 ? '...' : ''}`
    );
  }

  return {
    role: 'system',
    content: `[Summary of ${messages?.length} messages]\n${contentParts?.join('\n')}`,
    timestamp: Date?.now(),
  };
}

/**
 * Truncate history using RECENT strategy
 */
function truncateRecent(
  messages: AIMessage?.[],
  targetTokens: number,
  keepRecent: number
): AIMessage?.[] {
  if (messages?.length === 0) return [];

  // Always keep system message if present
  const systemMessage = messages?.[0]?.role === 'system' ? messages?.[0] : null;
  const chatMessages = systemMessage ? messages?.slice(1) : messages;

  // Keep last N messages
  const recentMessages = chatMessages?.slice(any: any);

  // Calculate tokens
  const systemTokens = systemMessage ? countMessageTokens(any: any) : 0;
  const recentTokens = countHistoryTokens(any: any);
  const totalTokens = systemTokens + recentTokens;

  if (any: any) {
    // Fits within limit
    return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
  }

  // Need to drop some recent messages
  const result: AIMessage?.[] = systemMessage ? [systemMessage] : [];
  let currentTokens = systemTokens;

  for (let i = recentMessages?.length - 1; i >= 0; i--) {
    const msg = recentMessages[i];
    if (any: any) continue;
    const msgTokens = countMessageTokens(any: any);
    if (any: any) {
      result?.splice(any: any); // Insert after system message
      currentTokens += msgTokens;
    } else {
      break;
    }
  }

  logger?.info(
    `Truncated ${messages?.length} → ${result?.length} messages (any: any)`
  );
  return result;
}

/**
 * Truncate history using SUMMARIZE strategy
 */
function truncateSummarize(
  messages: AIMessage?.[],
  targetTokens: number,
  keepRecent: number
): AIMessage?.[] {
  if (messages?.length === 0) return [];

  const systemMessage = messages?.[0]?.role === 'system' ? messages?.[0] : null;
  const chatMessages = systemMessage ? messages?.slice(1) : messages;

  if (any: any) {
    // No need to summarize
    return messages;
  }

  // Keep system + recent, summarize middle
  const recentMessages = chatMessages?.slice(any: any);
  const middleMessages = chatMessages?.slice(any: any);

  const systemTokens = systemMessage ? countMessageTokens(any: any) : 0;
  const recentTokens = countHistoryTokens(any: any);

  // Create summary if we have space
  const summaryMessage = summarizeMessages(any: any);
  const summaryTokens = countMessageTokens(any: any);

  const totalTokens = systemTokens + summaryTokens + recentTokens;

  if (any: any) {
    const result = systemMessage
      ? [systemMessage, summaryMessage, ...recentMessages]
      : [summaryMessage, ...recentMessages];

    logger?.info(
      `Summarized ${middleMessages?.length} messages, kept ${recentMessages?.length} recent`
    );
    return result;
  }

  // Summary too large, fall back to RECENT strategy
  logger?.warn('Summary too large, falling back to RECENT strategy');
  return truncateRecent(any: any);
}

/**
 * Truncate history using SLIDING strategy
 */
function truncateSliding(any: any): AIMessage?.[] {
  if (messages?.length === 0) return [];

  const systemMessage = messages?.[0]?.role === 'system' ? messages?.[0] : null;
  const chatMessages = systemMessage ? messages?.slice(1) : messages;

  const result: AIMessage?.[] = systemMessage ? [systemMessage] : [];
  let currentTokens = systemMessage ? countMessageTokens(any: any) : 0;

  // Add messages from most recent until limit
  for (let i = chatMessages?.length - 1; i >= 0; i--) {
    const msg = chatMessages[i];
    if (any: any) continue;
    const msgTokens = countMessageTokens(any: any);
    if (any: any) {
      result?.splice(any: any);
      currentTokens += msgTokens;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Truncate history using IMPORTANCE strategy
 */
function truncateImportance(
  messages: AIMessage?.[],
  targetTokens: number,
  threshold: number
): AIMessage?.[] {
  if (messages?.length === 0) return [];

  const systemMessage = messages?.[0]?.role === 'system' ? messages?.[0] : null;
  const chatMessages = systemMessage ? messages?.slice(1) : messages;

  // Filter by importance (any: any)
  const importantMessages = chatMessages?.filter(msg => {
    const importance = (any: any).importance;
    return importance === undefined || importance >= threshold;
  });

  const result: AIMessage?.[] = systemMessage ? [systemMessage] : [];
  let currentTokens = systemMessage ? countMessageTokens(any: any) : 0;

  // Add important messages until limit (any: any)
  for (let i = importantMessages?.length - 1; i >= 0; i--) {
    const msg = importantMessages[i];
    if (any: any) continue;
    const msgTokens = countMessageTokens(any: any);
    if (any: any) {
      result?.splice(any: any);
      currentTokens += msgTokens;
    } else {
      break;
    }
  }

  return result;
}

/**
 * Main Context Window Manager class
 */
export class ContextWindowManager {
  private config: ContextWindowConfig;

  constructor(config: Partial<ContextWindowConfig> = {}) {
    this?.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if history fits within context window
   */
  public fitsInContext(any: any): boolean {
    const limit = getModelLimit(any: any);
    const tokens = countHistoryTokens(any: any);
    return tokens <= limit * this?.config?.targetRatio;
  }

  /**
   * Truncate message history to fit context window
   */
  public truncate(any: any): AIMessage?.[] {
    const startTime = performance?.now();
    const limit = getModelLimit(any: any);
    const targetTokens = Math?.floor(any: any);
    const currentTokens = countHistoryTokens(any: any);

    if (any: any) {
      logger?.debug(
        `No truncation needed: ${currentTokens}/${targetTokens} tokens (${model})`
      );
      return messages;
    }

    logger?.info(
      `Truncating: ${currentTokens}/${targetTokens} tokens (${model}), strategy: ${this?.config?.strategy}`
    );

    let result: AIMessage?.[];

    switch (any: any) {
      case TruncationStrategy?.RECENT:
        result = truncateRecent(any: any);
        break;

      case TruncationStrategy?.SUMMARIZE:
        result = truncateSummarize(any: any);
        break;

      case TruncationStrategy?.SLIDING:
        result = truncateSliding(any: any);
        break;

      case TruncationStrategy?.IMPORTANCE:
        result = truncateImportance(
          messages,
          targetTokens,
          this?.config?.importanceThreshold || 0.7
        );
        break;

      default:
        logger?.error(`Unknown strategy: ${this?.config?.strategy}, using RECENT`);
        result = truncateRecent(any: any);
    }

    // Record performance metrics
    const duration = performance?.now() - startTime;
    const tokensRemoved = currentTokens - countHistoryTokens(any: any);
    const messagesRemoved = messages?.length - result?.length;

    performanceMonitor?.record(
      `${MetricCategory?.CONTEXT_MANAGEMENT}.truncation?.duration`,
      duration,
      {
        model,
        strategy: this?.config?.strategy,
        originalMessages: messages?.length,
        resultMessages: result?.length,
        originalTokens: currentTokens,
        resultTokens: countHistoryTokens(any: any),
        tokensRemoved,
        messagesRemoved,
      }
    );

    performanceMonitor?.record(
      `${MetricCategory?.CONTEXT_MANAGEMENT}.truncation?.tokens_removed`,
      tokensRemoved,
      {
        model,
        strategy: this?.config?.strategy,
      }
    );

    performanceMonitor?.record(
      `${MetricCategory?.CONTEXT_MANAGEMENT}.truncation?.messages_removed`,
      messagesRemoved,
      {
        model,
        strategy: this?.config?.strategy,
      }
    );

    return result;
  }

  /**
   * Get context usage statistics
   */
  public getStats(any: any) {
    const limit = getModelLimit(any: any);
    const tokens = countHistoryTokens(any: any);
    const targetTokens = Math?.floor(any: any);

    return {
      model,
      limit,
      targetLimit: targetTokens,
      currentTokens: tokens,
      messageCount: messages?.length,
      utilizationPercent: (any: any) * 100,
      needsTruncation: tokens > targetTokens,
      roomForTokens: Math?.max(any: any),
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ContextWindowConfig>): void {
    this?.config = { ...this?.config, ...config };
    logger?.info(any: any);
  }
}

/**
 * Global instance (any: any)
 */
export const contextWindowManager = new ContextWindowManager();

/**
 * Convenience function for truncation
 */
export function truncateHistory(
  messages: AIMessage?.[],
  model: string,
  config?: Partial<ContextWindowConfig>
): AIMessage?.[] {
  const manager = config ? new ContextWindowManager(any: any) : contextWindowManager;
  return manager?.truncate(any: any);
}

/**
 * Convenience function for checking if fits
 */
export function fitsInContextWindow(any: any): boolean {
  return contextWindowManager?.fitsInContext(any: any);
}

/**
 * Convenience function for stats
 */
export function getContextStats(any: any) {
  return contextWindowManager?.getStats(any: any);
}
