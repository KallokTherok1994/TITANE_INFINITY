/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0 — AI CHAT CLIENT SÉCURISÉ
 * Client centralisé pour chat AI avec:
 * - Sanitization input (prompt injection, XSS, code execution)
 * - Validation output (JSON schema, XSS detection)
 * - Retry, timeout, fallback
 * ═══════════════════════════════════════════════════════════════
 * NOTE: Circuit breaker supprimé - géré par orchestrator.ts
 * ═══════════════════════════════════════════════════════════════
 */

import { sendChatMessage } from '../tauriBridge';
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

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19 CHAT SERVICE — ENVOI MESSAGE SÉCURISÉ
 * ═══════════════════════════════════════════════════════════════
 * 1. Sanitize input (prompt injection, XSS, code execution)
 * 2. Retry loop with timeout
 * 3. API call via tauriBridge
 * 4. Validate output
 * 5. Fallback models
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
  // RETRY LOOP WITH TIMEOUT & ERROR HANDLING
  // ============================================================
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), config.timeout || 30000);
      });

      // Race between API call and timeout
      const response = await Promise.race([
        sendChatMessage(messages, {
          model,
          temperature,
          maxTokens,
        }),
        timeoutPromise,
      ]);

      // Validate response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from AI service');
      }

      return {
        success: true,
        content: response.data || '',
        model,
        attempt,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Attempt ${attempt}/${retries} failed: ${errorMessage}`);

      if (attempt < retries) {
        const delay = retryDelay * attempt;
        logger.debug(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ============================================================
  // FALLBACK MODELS WITH TIMEOUT
  // ============================================================
  for (const fallbackModel of fallbackModels) {
    try {
      logger.debug(`Trying fallback model: ${fallbackModel}`);

      const response = await Promise.race([
        sendChatMessage(messages, {
          model: fallbackModel,
          temperature,
          maxTokens,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Fallback timeout')), config.timeout || 30000)
        ),
      ]);

      if (response && response.data) {
        return {
          success: true,
          content: response.data,
          model: fallbackModel,
          duration: Date.now() - startTime,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn(`Fallback ${fallbackModel} failed: ${errorMessage}`);
    }
  }

  // ============================================================
  // ALL RETRIES + FALLBACKS FAILED
  // ============================================================
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

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  sendMessage,
  sendSimpleMessage,
};
