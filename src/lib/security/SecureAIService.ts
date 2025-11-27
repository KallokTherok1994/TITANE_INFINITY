/**
 * TITANE∞ v19.0 — Secure AI Service Wrapper
 *
 * Wrapper sécurisé pour tous les appels IA
 * Combine: sanitization input, validation output, rate limiting, monitoring
 *
 * @module SecureAIService
 */

import { AIInputSanitizer, type SanitizationResult } from './AIInputSanitizer';
import {
  AIResponseValidator,
  type AIValidationResult,
  type ChatResponse,
  type MetaModeResponse,
} from './AIResponseValidator';
import { globalAIRateLimiter, type RateLimitStatus } from './AIRateLimiter';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SecureAIRequest {
  /** Input utilisateur (sera sanitizé) */
  input: string;
  /** Context additionnel (optionnel) */
  context?: string;
  /** Provider ('openai', 'anthropic', 'local') */
  provider?: string;
  /** Model */
  model?: string;
  /** Tokens estimés (pour rate limiting) */
  estimatedTokens?: number;
  /** Options sanitization */
  sanitizationOptions?: {
    strictMode?: boolean;
    maxLength?: number;
    allowHtml?: boolean;
    allowCodeBlocks?: boolean;
    allowUrls?: boolean;
  };
}

export interface SecureAIResponse<T = ChatResponse> {
  /** Réponse validée (safe) */
  response: T;
  /** Original response (avant sanitization) */
  originalResponse?: T;
  /** Sanitization result (input) */
  inputSanitization: SanitizationResult;
  /** Validation result (output) */
  outputValidation: AIValidationResult<T>;
  /** Rate limit status */
  rateLimitStatus: RateLimitStatus;
  /** Success */
  success: boolean;
  /** Error message (si échec) */
  error?: string;
}

export type SecureAIServiceFunction<TInput = SecureAIRequest, TOutput = ChatResponse> = (
  request: TInput
) => Promise<SecureAIResponse<TOutput>>;

// ═══════════════════════════════════════════════════════════════
// SECURE AI SERVICE
// ═══════════════════════════════════════════════════════════════

export class SecureAIService {
  /**
   * Exécute un appel IA sécurisé (Chat)
   *
   * Workflow:
   * 1. Sanitize input
   * 2. Check rate limit
   * 3. Execute API call (via callback)
   * 4. Validate output
   * 5. Record metrics
   *
   * @param request - Requête sécurisée
   * @param apiCall - Fonction d'appel IA (ChatGPT, Claude, local...)
   * @returns Réponse sécurisée
   */
  static async executeSecureChat(
    request: SecureAIRequest,
    apiCall: (sanitizedInput: string, context?: string) => Promise<ChatResponse>
  ): Promise<SecureAIResponse<ChatResponse>> {
    const provider = request.provider || 'local';
    const model = request.model || 'local';
    const estimatedTokens = request.estimatedTokens || this.estimateTokens(request.input);

    // 1. Sanitize input
    const inputSanitization = AIInputSanitizer.sanitize(
      request.input,
      request.sanitizationOptions
    );

    if (inputSanitization.isBlocked) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Input blocked by sanitizer'],
          warnings: [],
        },
        rateLimitStatus: globalAIRateLimiter.getStatus(),
        success: false,
        error: `Input blocked: ${inputSanitization.detectedPatterns.join(', ')}`,
      };
    }

    // 2. Check rate limit
    const rateLimitStatus = globalAIRateLimiter.checkLimit(estimatedTokens, provider, model);

    if (rateLimitStatus.isBlocked) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Rate limit exceeded'],
          warnings: [],
        },
        rateLimitStatus,
        success: false,
        error: rateLimitStatus.blockReason,
      };
    }

    // 3. Execute API call
    let rawResponse: ChatResponse;
    try {
      rawResponse = await apiCall(inputSanitization.sanitized, request.context);
    } catch (error) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        outputValidation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
        },
        rateLimitStatus,
        success: false,
        error: `API call failed: ${error}`,
      };
    }

    // 4. Validate output
    const outputValidation = AIResponseValidator.validateChatResponse(rawResponse);

    if (!outputValidation.isValid) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        outputValidation,
        rateLimitStatus,
        success: false,
        error: `Output validation failed: ${outputValidation.errors.join(', ')}`,
      };
    }

    // 5. Record metrics
    const actualTokens = rawResponse.metadata?.tokens || estimatedTokens;
    globalAIRateLimiter.recordRequest(actualTokens, provider, model);

    // 6. Return sanitized response (si warnings)
    const finalResponse = outputValidation.sanitizedData || outputValidation.data!;

    return {
      response: finalResponse,
      originalResponse: outputValidation.sanitizedData ? outputValidation.data : undefined,
      inputSanitization,
      outputValidation,
      rateLimitStatus: globalAIRateLimiter.getStatus(),
      success: true,
    };
  }

  /**
   * Exécute un appel IA sécurisé (Meta-Mode)
   *
   * @param request - Requête sécurisée
   * @param apiCall - Fonction d'appel Meta-Mode
   * @returns Réponse sécurisée
   */
  static async executeSecureMetaMode(
    request: SecureAIRequest,
    apiCall: (sanitizedInput: string, context?: string) => Promise<MetaModeResponse>
  ): Promise<SecureAIResponse<MetaModeResponse>> {
    const provider = request.provider || 'local';
    const model = request.model || 'local';
    const estimatedTokens = request.estimatedTokens || this.estimateTokens(request.input);

    // 1. Sanitize input
    const inputSanitization = AIInputSanitizer.sanitize(
      request.input,
      request.sanitizationOptions
    );

    if (inputSanitization.isBlocked) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Input blocked by sanitizer'],
          warnings: [],
        },
        rateLimitStatus: globalAIRateLimiter.getStatus(),
        success: false,
        error: `Input blocked: ${inputSanitization.detectedPatterns.join(', ')}`,
      };
    }

    // 2. Check rate limit
    const rateLimitStatus = globalAIRateLimiter.checkLimit(estimatedTokens, provider, model);

    if (rateLimitStatus.isBlocked) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Rate limit exceeded'],
          warnings: [],
        },
        rateLimitStatus,
        success: false,
        error: rateLimitStatus.blockReason,
      };
    }

    // 3. Execute API call
    let rawResponse: MetaModeResponse;
    try {
      rawResponse = await apiCall(inputSanitization.sanitized, request.context);
    } catch (error) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        outputValidation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : String(error)],
          warnings: [],
        },
        rateLimitStatus,
        success: false,
        error: `API call failed: ${error}`,
      };
    }

    // 4. Validate output
    const outputValidation = AIResponseValidator.validateMetaModeResponse(rawResponse);

    if (!outputValidation.isValid) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        outputValidation,
        rateLimitStatus,
        success: false,
        error: `Output validation failed: ${outputValidation.errors.join(', ')}`,
      };
    }

    // 5. Record metrics
    globalAIRateLimiter.recordRequest(estimatedTokens, provider, model);

    // 6. Return sanitized response (si warnings)
    const finalResponse = outputValidation.sanitizedData || outputValidation.data!;

    return {
      response: finalResponse,
      originalResponse: outputValidation.sanitizedData ? outputValidation.data : undefined,
      inputSanitization,
      outputValidation,
      rateLimitStatus: globalAIRateLimiter.getStatus(),
      success: true,
    };
  }

  /**
   * Estime nombre de tokens (approximatif: 1 token ≈ 4 chars)
   *
   * @param text - Texte
   * @returns Tokens estimés
   */
  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Obtient status rate limiter global
   *
   * @returns Status
   */
  static getRateLimitStatus(): RateLimitStatus {
    return globalAIRateLimiter.getStatus();
  }

  /**
   * Obtient métriques rate limiter global
   *
   * @returns Metrics
   */
  static getRateLimitMetrics() {
    return globalAIRateLimiter.getMetrics();
  }

  /**
   * Reset rate limiter (emergency)
   */
  static resetRateLimiter(): void {
    globalAIRateLimiter.reset();
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default SecureAIService;
