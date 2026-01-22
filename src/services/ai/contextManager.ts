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
 * Extended message type for OpenAI-like multimodal content
 */
interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

/**
 * Extended AIMessage that supports both TITAN format and OpenAI multimodal
 */
interface ExtendedAIMessage extends Omit<AIMessage, 'content'> {
  content: string | ContentPart[];
  name?: string;
}

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

  // Local models (Ollama)
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
 * Default configuration (conservative)
 */
export const DEFAULT_CONFIG: ContextWindowConfig = {
  targetRatio: 0.75, // Use 75% of limit
  strategy: TruncationStrategy.RECENT,
  keepRecentCount: 10,
  importanceThreshold: 0.7,
};

/**
 * Simple token estimation (rough approximation)
 * Production: Should use tiktoken or model-specific tokenizer
 */
function estimateTokens(text: string): number {
  // Rough heuristic: 1 token ≈ 4 characters for English
  // For multilingual (French, etc): 1 token ≈ 3.5 characters
  return Math.ceil(text.length / 3.5);
}

/**
 * Count tokens in a message
 */
function countMessageTokens(message: AIMessage | ExtendedAIMessage): number {
  let total = 0;

  // Role overhead (typically ~4 tokens)
  total += 4;

  // Content
  if (typeof message.content === 'string') {
    total += estimateTokens(message.content);
  } else if (Array.isArray(message.content)) {
    for (const part of message.content as ContentPart[]) {
      if (typeof part === 'string') {
        total += estimateTokens(part);
      } else if (part.type === 'text' && part.text) {
        total += estimateTokens(part.text);
      } else if (part.type === 'image_url') {
        // Images: approximately 85-170 tokens per tile (512x512)
        total += 150; // Conservative estimate
      }
    }
  }

  // Name field if present (OpenAI format)
  const extMsg = message as ExtendedAIMessage;
  if (extMsg.name) {
    total += estimateTokens(extMsg.name);
  }

  return total;
}

/**
 * Count total tokens in message history
 */
export function countHistoryTokens(messages: AIMessage[]): number {
  return messages.reduce((sum, msg) => sum + countMessageTokens(msg), 0);
}

/**
 * Get token limit for a model
 */
export function getModelLimit(model: string): number {
  // Exact match
  if (model in MODEL_TOKEN_LIMITS) {
    const limit = MODEL_TOKEN_LIMITS[model];
    return limit ?? MODEL_TOKEN_LIMITS.default ?? 8192;
  }

  // Fuzzy match (e.g., "gpt-4o-2024-05-13" → "gpt-4o")
  for (const [key, limit] of Object.entries(MODEL_TOKEN_LIMITS)) {
    if (model.startsWith(key)) {
      return limit ?? MODEL_TOKEN_LIMITS.default;
    }
  }

  // Default fallback
  logger.warn(`Unknown model: ${model}, using default limit of 8192 tokens`);
  return MODEL_TOKEN_LIMITS.default ?? 8192;
}

/**
 * Summarize a batch of messages into a single message
 */
function summarizeMessages(messages: (AIMessage | ExtendedAIMessage)[]): AIMessage {
  const contentParts: string[] = [];

  for (const msg of messages) {
    let content = '';
    if (typeof msg.content === 'string') {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      content = (msg.content as ContentPart[])
        .map(p => (typeof p === 'string' ? p : p.type === 'text' && p.text ? p.text : '[image]'))
        .join(' ');
    }

    contentParts.push(
      `${msg.role}: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`
    );
  }

  return {
    role: 'system',
    content: `[Summary of ${messages.length} messages]\n${contentParts.join('\n')}`,
    timestamp: Date.now(),
  };
}

/**
 * Truncate history using RECENT strategy
 */
function truncateRecent(
  messages: AIMessage[],
  targetTokens: number,
  keepRecent: number
): AIMessage[] {
  if (messages.length === 0) return [];

  // Always keep system message if present
  const systemMessage = messages[0]?.role === 'system' ? messages[0] : null;
  const chatMessages = systemMessage ? messages.slice(1) : messages;

  // Keep last N messages
  const recentMessages = chatMessages.slice(-keepRecent);

  // Calculate tokens
  const systemTokens = systemMessage ? countMessageTokens(systemMessage) : 0;
  const recentTokens = countHistoryTokens(recentMessages);
  const totalTokens = systemTokens + recentTokens;

  if (totalTokens <= targetTokens) {
    // Fits within limit
    return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
  }

  // Need to drop some recent messages
  const result: AIMessage[] = systemMessage ? [systemMessage] : [];
  let currentTokens = systemTokens;

  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const msg = recentMessages[i];
    if (!msg) continue;
    const msgTokens = countMessageTokens(msg);
    if (currentTokens + msgTokens <= targetTokens) {
      result.splice(1, 0, msg); // Insert after system message
      currentTokens += msgTokens;
    } else {
      break;
    }
  }

  logger.info(
    `Truncated ${messages.length} → ${result.length} messages (${totalTokens} → ${currentTokens} tokens)`
  );
  return result;
}

/**
 * Truncate history using SUMMARIZE strategy
 */
function truncateSummarize(
  messages: AIMessage[],
  targetTokens: number,
  keepRecent: number
): AIMessage[] {
  if (messages.length === 0) return [];

  const systemMessage = messages[0]?.role === 'system' ? messages[0] : null;
  const chatMessages = systemMessage ? messages.slice(1) : messages;

  if (chatMessages.length <= keepRecent) {
    // No need to summarize
    return messages;
  }

  // Keep system + recent, summarize middle
  const recentMessages = chatMessages.slice(-keepRecent);
  const middleMessages = chatMessages.slice(0, -keepRecent);

  const systemTokens = systemMessage ? countMessageTokens(systemMessage) : 0;
  const recentTokens = countHistoryTokens(recentMessages);

  // Create summary if we have space
  const summaryMessage = summarizeMessages(middleMessages);
  const summaryTokens = countMessageTokens(summaryMessage);

  const totalTokens = systemTokens + summaryTokens + recentTokens;

  if (totalTokens <= targetTokens) {
    const result = systemMessage
      ? [systemMessage, summaryMessage, ...recentMessages]
      : [summaryMessage, ...recentMessages];

    logger.info(
      `Summarized ${middleMessages.length} messages, kept ${recentMessages.length} recent`
    );
    return result;
  }

  // Summary too large, fall back to RECENT strategy
  logger.warn('Summary too large, falling back to RECENT strategy');
  return truncateRecent(messages, targetTokens, keepRecent);
}

/**
 * Truncate history using SLIDING strategy
 */
function truncateSliding(messages: AIMessage[], targetTokens: number): AIMessage[] {
  if (messages.length === 0) return [];

  const systemMessage = messages[0]?.role === 'system' ? messages[0] : null;
  const chatMessages = systemMessage ? messages.slice(1) : messages;

  const result: AIMessage[] = systemMessage ? [systemMessage] : [];
  let currentTokens = systemMessage ? countMessageTokens(systemMessage) : 0;

  // Add messages from most recent until limit
  for (let i = chatMessages.length - 1; i >= 0; i--) {
    const msg = chatMessages[i];
    if (!msg) continue;
    const msgTokens = countMessageTokens(msg);
    if (currentTokens + msgTokens <= targetTokens) {
      result.splice(systemMessage ? 1 : 0, 0, msg);
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
  messages: AIMessage[],
  targetTokens: number,
  threshold: number
): AIMessage[] {
  if (messages.length === 0) return [];

  const systemMessage = messages[0]?.role === 'system' ? messages[0] : null;
  const chatMessages = systemMessage ? messages.slice(1) : messages;

  // Filter by importance (if metadata exists)
  const importantMessages = chatMessages.filter(msg => {
    const importance = (msg as any).importance;
    return importance === undefined || importance >= threshold;
  });

  const result: AIMessage[] = systemMessage ? [systemMessage] : [];
  let currentTokens = systemMessage ? countMessageTokens(systemMessage) : 0;

  // Add important messages until limit (recent first)
  for (let i = importantMessages.length - 1; i >= 0; i--) {
    const msg = importantMessages[i];
    if (!msg) continue;
    const msgTokens = countMessageTokens(msg);
    if (currentTokens + msgTokens <= targetTokens) {
      result.splice(systemMessage ? 1 : 0, 0, msg);
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
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if history fits within context window
   */
  public fitsInContext(messages: AIMessage[], model: string): boolean {
    const limit = getModelLimit(model);
    const tokens = countHistoryTokens(messages);
    return tokens <= limit * this.config.targetRatio;
  }

  /**
   * Truncate message history to fit context window
   */
  public truncate(messages: AIMessage[], model: string): AIMessage[] {
    const startTime = performance.now();
    const limit = getModelLimit(model);
    const targetTokens = Math.floor(limit * this.config.targetRatio);
    const currentTokens = countHistoryTokens(messages);

    if (currentTokens <= targetTokens) {
      logger.debug(
        `No truncation needed: ${currentTokens}/${targetTokens} tokens (${model})`
      );
      return messages;
    }

    logger.info(
      `Truncating: ${currentTokens}/${targetTokens} tokens (${model}), strategy: ${this.config.strategy}`
    );

    let result: AIMessage[];

    switch (this.config.strategy) {
      case TruncationStrategy.RECENT:
        result = truncateRecent(messages, targetTokens, this.config.keepRecentCount);
        break;

      case TruncationStrategy.SUMMARIZE:
        result = truncateSummarize(messages, targetTokens, this.config.keepRecentCount);
        break;

      case TruncationStrategy.SLIDING:
        result = truncateSliding(messages, targetTokens);
        break;

      case TruncationStrategy.IMPORTANCE:
        result = truncateImportance(
          messages,
          targetTokens,
          this.config.importanceThreshold || 0.7
        );
        break;

      default:
        logger.error(`Unknown strategy: ${this.config.strategy}, using RECENT`);
        result = truncateRecent(messages, targetTokens, this.config.keepRecentCount);
    }

    // Record performance metrics
    const duration = performance.now() - startTime;
    const tokensRemoved = currentTokens - countHistoryTokens(result);
    const messagesRemoved = messages.length - result.length;

    performanceMonitor.record(
      `${MetricCategory.CONTEXT_MANAGEMENT}.truncation.duration`,
      duration,
      {
        model,
        strategy: this.config.strategy,
        originalMessages: messages.length,
        resultMessages: result.length,
        originalTokens: currentTokens,
        resultTokens: countHistoryTokens(result),
        tokensRemoved,
        messagesRemoved,
      }
    );

    performanceMonitor.record(
      `${MetricCategory.CONTEXT_MANAGEMENT}.truncation.tokens_removed`,
      tokensRemoved,
      {
        model,
        strategy: this.config.strategy,
      }
    );

    performanceMonitor.record(
      `${MetricCategory.CONTEXT_MANAGEMENT}.truncation.messages_removed`,
      messagesRemoved,
      {
        model,
        strategy: this.config.strategy,
      }
    );

    return result;
  }

  /**
   * Get context usage statistics
   */
  public getStats(messages: AIMessage[], model: string) {
    const limit = getModelLimit(model);
    const tokens = countHistoryTokens(messages);
    const targetTokens = Math.floor(limit * this.config.targetRatio);

    return {
      model,
      limit,
      targetLimit: targetTokens,
      currentTokens: tokens,
      messageCount: messages.length,
      utilizationPercent: (tokens / limit) * 100,
      needsTruncation: tokens > targetTokens,
      roomForTokens: Math.max(0, targetTokens - tokens),
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ContextWindowConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Configuration updated', this.config);
  }
}

/**
 * Global instance (singleton pattern)
 */
export const contextWindowManager = new ContextWindowManager();

/**
 * Convenience function for truncation
 */
export function truncateHistory(
  messages: AIMessage[],
  model: string,
  config?: Partial<ContextWindowConfig>
): AIMessage[] {
  const manager = config ? new ContextWindowManager(config) : contextWindowManager;
  return manager.truncate(messages, model);
}

/**
 * Convenience function for checking if fits
 */
export function fitsInContextWindow(messages: AIMessage[], model: string): boolean {
  return contextWindowManager.fitsInContext(messages, model);
}

/**
 * Convenience function for stats
 */
export function getContextStats(messages: AIMessage[], model: string) {
  return contextWindowManager.getStats(messages, model);
}
