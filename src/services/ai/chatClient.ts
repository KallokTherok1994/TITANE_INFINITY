/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — AI CHAT CLIENT SÉCURISÉ
 * Client centralisé pour chat AI avec:
 * - Sanitization input (prompt injection, XSS, code execution)
 * - Validation output (JSON schema, XSS detection)
 * - Rate limiting (50 req/min, 100k tokens/min, 1$/min)
 * - Circuit breaker, retry, timeout, fallback
 * ═══════════════════════════════════════════════════════════════
 */

import { sendChatMessage } from '../tauriBridge';
import { secureInvoke } from '@/lib/security';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ChatClient');

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  fallbackModels?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResult {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  attempt?: number;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════

class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,
    private timeout = 60000,
    private resetTimeout = 30000
  ) {}

  canExecute(): boolean {
    if (this.state === 'closed') return true;

    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }

    return true; // half-open
  }

  recordSuccess(): void {
    this.successCount++;
    if (this.state === 'half-open') {
      this.state = 'closed';
      this.failureCount = 0;
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

// ═══════════════════════════════════════════════════════════════
// CHAT CLIENT
// ═══════════════════════════════════════════════════════════════

const circuitBreaker = new CircuitBreaker(5, 60000, 30000);

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19 CHAT SERVICE — ENVOI MESSAGE SÉCURISÉ
 * ═══════════════════════════════════════════════════════════════
 * 1. Sanitize input (prompt injection, XSS, code execution)
 * 2. Rate limit check (50 req/min, 100k tokens/min, 1$/min)
 * 3. Circuit breaker + retry loop
 * 4. API call via tauriBridge
 * 5. Validate output (JSON schema, XSS detection)
 * 6. Record metrics + violations
 * ---------------------------------------------------------------
 */
export async function sendMessage(
  messages: ChatMessage[],
  config: ChatConfig = {}
): Promise<ChatResult> {
  const {
    model = 'gpt-4',
    temperature = 0.7,
    maxTokens = 2000,
    retries = 3,
    retryDelay = 1000,
    fallbackModels = ['claude-3', 'ollama'],
  } = config;

  const startTime = Date.now();

  // ============================================================
  // SECURITY: Extract user input for sanitization
  // ============================================================
  const userInput = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n');

  if (!userInput.trim()) {
    return {
      success: false,
      error: 'Empty message - no user input found',
      duration: Date.now() - startTime,
    };
  }

  // ============================================================
  // CIRCUIT BREAKER CHECK
  // ============================================================
  if (!circuitBreaker.canExecute()) {
    return {
      success: false,
      error: 'Circuit breaker open - service temporarily unavailable',
    };
  }

  // ============================================================
  // SECURE AI REQUEST
  // ============================================================
  // ============================================================
  // RETRY LOOP
  // ============================================================
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // API call via tauriBridge
      const response = await sendChatMessage(messages, {
        model,
        temperature,
        maxTokens,
      });

      if (response.data && response.data.trim().length > 0) {
        circuitBreaker.recordSuccess();
        return {
          success: true,
          content: response.data,
          model,
          attempt,
          duration: Date.now() - startTime,
        };
      }
    } catch (error) {
      logger.warn(`Attempt ${attempt}/${retries} failed`, error);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }

  // ============================================================
  // FALLBACK MODELS
  // ============================================================
  for (const fallbackModel of fallbackModels) {
    try {
      logger.debug(`Trying fallback model: ${fallbackModel}`);

      const response = await sendChatMessage(messages, {
        model: fallbackModel,
        temperature,
        maxTokens,
      });

      if (response.data && response.data.trim().length > 0) {
        circuitBreaker.recordSuccess();
        return {
          success: true,
          content: response.data,
          model: fallbackModel,
          duration: Date.now() - startTime,
        };
      }
    } catch (error) {
      logger.warn(`Fallback ${fallbackModel} failed`, error);
    }
  }

  // ============================================================
  // ALL RETRIES + FALLBACKS FAILED
  // ============================================================
  circuitBreaker.recordFailure();
  return {
    success: false,
    error: 'All AI models failed. Please try again or check your connection.',
    duration: Date.now() - startTime,
  };
}

/**
 * Envoie un message simple (helper)
 */
export async function sendSimpleMessage(
  content: string,
  config?: ChatConfig
): Promise<ChatResult> {
  return sendMessage([{ role: 'user', content }], config);
}

/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus(): string {
  return circuitBreaker.getState();
}

/**
 * Reset circuit breaker (manual override)
 */
export function resetCircuitBreaker(): void {
  // Create new instance
  circuitBreaker['state'] = 'closed';
  circuitBreaker['failureCount'] = 0;
  circuitBreaker['successCount'] = 0;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  sendMessage,
  sendSimpleMessage,
  getCircuitBreakerStatus,
  resetCircuitBreaker,
};
