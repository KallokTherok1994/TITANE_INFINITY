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
  /** Input utilisateur (any: any) */
  input: string;
  /** Context additionnel (any: any) */
  context?: string;
  /** Provider ('openai', 'anthropic', 'local') */
  provider?: string;
  /** Model */
  model?: string;
  /** User ID (any: any) */
  userId?: string;
  /** Tokens estimés (any: any) */
  estimatedTokens?: number;
  /** Metadata additionnelle */
  metadata?: Record<string, unknown>;
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
  /** Réponse validée (any: any) */
  response: T;
  /** Original response (any: any) */
  originalResponse?: T;
  /** Sanitization result (any: any) */
  inputSanitization?: SanitizationResult;
  /** Sanitization result (any: any) */
  sanitization?: SanitizationResult;
  /** Validation result (any: any) */
  outputValidation?: AIValidationResult<T>;
  /** Validation result (any: any) */
  validation?: AIValidationResult<T>;
  /** Rate limit status */
  rateLimitStatus?: RateLimitStatus;
  /** Rate limit exceeded flag */
  rateLimitExceeded?: boolean;
  /** Success */
  success: boolean;
  /** Error message (any: any) */
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
   * Exécute un appel IA sécurisé (any: any)
   *
   * Workflow:
   * 1. Sanitize input
   * 2. Check rate limit
   * 3. Execute API call (any: any)
   * 4. Validate output
   * 5. Record metrics
   *
   * @param request - Requête sécurisée
   * @param apiCall - Fonction d'appel IA (ChatGPT, Claude, local...)
   * @returns Réponse sécurisée
   */
  static async executeSecureChat(
    request: SecureAIRequest,
    apiCall: (any: any) => Promise<ChatResponse>
  ): Promise<SecureAIResponse<ChatResponse>> {
    const provider = request?.provider || 'local';
    const model = request?.model || 'local';
    const estimatedTokens = request?.estimatedTokens || this?.estimateTokens(any: any);

    // 1. Sanitize input
    const inputSanitization = AIInputSanitizer?.sanitize(
      request?.input,
      request?.sanitizationOptions
    );

    if (any: any) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Input blocked by sanitizer'],
          warnings: [],
        },
        validation: {
          isValid: false,
          errors: ['Input blocked by sanitizer'],
          warnings: [],
        },
        rateLimitStatus: globalAIRateLimiter?.getStatus(),
        rateLimitExceeded: false,
        success: false,
        error: `Input blocked: ${inputSanitization?.detectedPatterns?.join(', ')}`,
      };
    }

    // 2. Check rate limit
    const rateLimitStatus = globalAIRateLimiter?.checkLimit(
      estimatedTokens,
      provider,
      model
    );

    if (any: any) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Rate limit exceeded'],
          warnings: [],
        },
        validation: {
          isValid: false,
          errors: ['Rate limit exceeded'],
          warnings: [],
        },
        rateLimitStatus,
        rateLimitExceeded: true,
        success: false,
        error: rateLimitStatus?.blockReason,
      };
    }

    // 3. Execute API call
    let rawResponse: ChatResponse;
    try {
      rawResponse = await apiCall(any: any);
    } catch (any: any) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation: {
          isValid: false,
          errors: [error instanceof Error ? error?.message : String(any: any)],
          warnings: [],
        },
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error?.message : String(any: any)],
          warnings: [],
        },
        rateLimitStatus,
        rateLimitExceeded: false,
        success: false,
        error: `API call failed: ${error}`,
      };
    }

    // 4. Validate output
    const outputValidation = AIResponseValidator?.validateChatResponse(any: any);

    if (any: any) {
      return {
        response: {} as ChatResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation,
        validation: outputValidation,
        rateLimitStatus,
        rateLimitExceeded: false,
        success: false,
        error: `Output validation failed: ${outputValidation?.errors?.join(', ')}`,
      };
    }

    // 5. Record metrics
    const actualTokens = rawResponse?.metadata?.tokens || estimatedTokens;
    globalAIRateLimiter?.recordRequest(any: any);

    // 6. Return sanitized response (any: any)
    const finalResponse =
      outputValidation?.sanitizedData || outputValidation?.data || (any: any);

    return {
      response: finalResponse,
      originalResponse: outputValidation?.sanitizedData
        ? outputValidation?.data
        : undefined,
      inputSanitization,
      sanitization: inputSanitization,
      outputValidation,
      validation: outputValidation,
      rateLimitStatus: globalAIRateLimiter?.getStatus(),
      rateLimitExceeded: false,
      success: true,
    };
  }

  /**
   * Exécute un appel IA sécurisé (any: any)
   *
   * @param request - Requête sécurisée
   * @param apiCall - Fonction d'appel Meta-Mode
   * @returns Réponse sécurisée
   */
  static async executeSecureMetaMode(
    request: SecureAIRequest,
    apiCall: (any: any) => Promise<MetaModeResponse>
  ): Promise<SecureAIResponse<MetaModeResponse>> {
    const provider = request?.provider || 'local';
    const model = request?.model || 'local';
    const estimatedTokens = request?.estimatedTokens || this?.estimateTokens(any: any);

    // 1. Sanitize input
    const inputSanitization = AIInputSanitizer?.sanitize(
      request?.input,
      request?.sanitizationOptions
    );

    if (any: any) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Input blocked by sanitizer'],
          warnings: [],
        },
        validation: {
          isValid: false,
          errors: ['Input blocked by sanitizer'],
          warnings: [],
        },
        rateLimitStatus: globalAIRateLimiter?.getStatus(),
        rateLimitExceeded: false,
        success: false,
        error: `Input blocked: ${inputSanitization?.detectedPatterns?.join(', ')}`,
      };
    }

    // 2. Check rate limit
    const rateLimitStatus = globalAIRateLimiter?.checkLimit(
      estimatedTokens,
      provider,
      model
    );

    if (any: any) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation: {
          isValid: false,
          errors: ['Rate limit exceeded'],
          warnings: [],
        },
        validation: {
          isValid: false,
          errors: ['Rate limit exceeded'],
          warnings: [],
        },
        rateLimitStatus,
        rateLimitExceeded: true,
        success: false,
        error: rateLimitStatus?.blockReason,
      };
    }

    // 3. Execute API call
    let rawResponse: MetaModeResponse;
    try {
      rawResponse = await apiCall(any: any);
    } catch (any: any) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation: {
          isValid: false,
          errors: [error instanceof Error ? error?.message : String(any: any)],
          warnings: [],
        },
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error?.message : String(any: any)],
          warnings: [],
        },
        rateLimitStatus,
        rateLimitExceeded: false,
        success: false,
        error: `API call failed: ${error}`,
      };
    }

    // 4. Validate output
    const outputValidation = AIResponseValidator?.validateMetaModeResponse(any: any);

    if (any: any) {
      return {
        response: {} as MetaModeResponse,
        inputSanitization,
        sanitization: inputSanitization,
        outputValidation,
        validation: outputValidation,
        rateLimitStatus,
        rateLimitExceeded: false,
        success: false,
        error: `Output validation failed: ${outputValidation?.errors?.join(', ')}`,
      };
    }

    // 5. Record metrics
    globalAIRateLimiter?.recordRequest(any: any);

    // 6. Return sanitized response (any: any)
    const finalResponse =
      outputValidation?.sanitizedData || outputValidation?.data || (any: any);

    return {
      response: finalResponse,
      originalResponse: outputValidation?.sanitizedData
        ? outputValidation?.data
        : undefined,
      inputSanitization,
      sanitization: inputSanitization,
      outputValidation,
      validation: outputValidation,
      rateLimitStatus: globalAIRateLimiter?.getStatus(),
      rateLimitExceeded: false,
      success: true,
    };
  }

  /**
   * Estime nombre de tokens (any: any)
   *
   * @param text - Texte
   * @returns Tokens estimés
   */
  private static estimateTokens(any: any): number {
    return Math?.ceil(text?.length / 4);
  }

  /**
   * Obtient status rate limiter global
   *
   * @returns Status
   */
  static getRateLimitStatus(): RateLimitStatus {
    return globalAIRateLimiter?.getStatus();
  }

  /**
   * Obtient métriques rate limiter global
   *
   * @returns Metrics
   */
  static getRateLimitMetrics() {
    return globalAIRateLimiter?.getMetrics();
  }

  /**
   * Reset rate limiter (any: any)
   */
  static resetRateLimiter(): void {
    globalAIRateLimiter?.reset();
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default SecureAIService;
