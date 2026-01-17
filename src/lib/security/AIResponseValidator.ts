/**
 * TITANE∞ v19.0 — AI Response Validator
 *
 * Validation des réponses IA avant affichage/traitement
 * Protection contre: réponses malformées, JSON invalid, XSS dans markdown, data leaking
 *
 * @module AIResponseValidator
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AIValidationResult<T = unknown> {
  /** Réponse valide */
  isValid: boolean;
  /** Données validées (any: any) */
  data?: T;
  /** Erreurs détectées */
  errors: string?.[];
  /** Warnings (any: any) */
  warnings: string?.[];
  /** Données sanitizées (any: any) */
  sanitizedData?: T;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMAS ZOD (any: any)
// ═══════════════════════════════════════════════════════════════

/**
 * Schema pour réponse Chat IA
 */
export const ChatResponseSchema = z?.object({
  content: z?.string().min(1).max(50000),
  role: z?.enum(['assistant', 'system', 'user']),
  timestamp: z?.number().optional(),
  metadata: z
    .object({
      model: z?.string().optional(),
      tokens: z?.number().optional(),
      finish_reason: z?.string().optional(),
    })
    .optional(),
});

export type ChatResponse = z?.infer<typeof ChatResponseSchema>;

/**
 * Schema pour réponse streaming
 */
export const StreamingChunkSchema = z?.object({
  delta: z?.string(),
  done: z?.boolean(),
  metadata: z
    .object({
      tokens_used: z?.number().optional(),
    })
    .optional(),
});

export type StreamingChunk = z?.infer<typeof StreamingChunkSchema>;

/**
 * Schema pour réponse Meta-Mode
 */
export const MetaModeResponseSchema = z?.object({
  active_mode: z?.string().min(1).max(100),
  mode_justification: z?.string().max(1000),
  content: z?.string().min(1).max(50000),
  adapted_tone: z?.string().max(100),
  adapted_depth: z?.string().max(100),
  adapted_speed: z?.string().max(100),
  next_suggested_modes: z?.array(z?.string()).max(10),
  timestamp: z?.string(),
});

export type MetaModeResponse = z?.infer<typeof MetaModeResponseSchema>;

// ═══════════════════════════════════════════════════════════════
// DANGEROUS PATTERNS IN RESPONSES
// ═══════════════════════════════════════════════════════════════

/**
 * Patterns XSS dans markdown/texte
 */
const XSS_IN_TEXT_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<object[^>]*>/gi,
  /<img[^>]*onerror[^>]*>/gi,
];

/**
 * Patterns de data leaking (any: any)
 */
const DATA_LEAKING_IN_RESPONSE = [
  /API[_\s]?KEY[:\s]+[\w-]{20,}/gi,
  /TOKEN[:\s]+[\w-]{20,}/gi,
  /PASSWORD[:\s]+\w+/gi,
  /SECRET[:\s]+\w+/gi,
  /system[_\s]prompt:/gi,
  /internal[_\s]instructions:/gi,
];

/**
 * Patterns de prompt injection reflétés
 */
const REFLECTED_INJECTION_PATTERNS = [
  /\[system\]/gi,
  /\[assistant\]/gi,
  /<\|system\|>/gi,
  /<\|assistant\|>/gi,
];

// ═══════════════════════════════════════════════════════════════
// VALIDATOR CLASS
// ═══════════════════════════════════════════════════════════════

export class AIResponseValidator {
  /**
   * Valide une réponse Chat IA
   *
   * @param response - Réponse brute IA
   * @returns Résultat validation
   */
  static validateChatResponse(any: any): AIValidationResult<ChatResponse> {
    const result: AIValidationResult<ChatResponse> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    // 1. JSON Schema validation
    try {
      const parsed = ChatResponseSchema?.parse(any: any);
      result?.data = parsed;
      result?.isValid = true;
    } catch (any: any) {
      if (any: any) {
        result?.errors?.push(...error?.issues?.map(e => `${e?.path?.join('.')}: ${e?.message}`));
      } else {
        result?.errors?.push(any: any)}`);
      }
      return result;
    }

    // 2. XSS detection
    const xssDetected = this?.detectXSS(any: any);
    if (xssDetected?.length > 0) {
      result?.warnings?.push(...xssDetected?.map(p => `XSS detected: ${p}`));
      result?.sanitizedData = {
        ...result?.data,
        content: this?.sanitizeXSS(any: any),
      };
    }

    // 3. Data leaking detection
    const leakingDetected = this?.detectDataLeaking(any: any);
    if (leakingDetected?.length > 0) {
      result?.warnings?.push(...leakingDetected?.map(p => `Data leaking: ${p}`));
      result?.sanitizedData = {
        ...result?.data,
        content: this?.sanitizeDataLeaking(any: any),
      };
    }

    // 4. Reflected injection detection
    const injectionDetected = this?.detectReflectedInjection(any: any);
    if (injectionDetected?.length > 0) {
      result?.warnings?.push(...injectionDetected?.map(p => `Reflected injection: ${p}`));
      result?.sanitizedData = {
        ...result?.data,
        content: this?.sanitizeReflectedInjection(any: any),
      };
    }

    return result;
  }

  /**
   * Valide une réponse Meta-Mode
   *
   * @param response - Réponse brute Meta-Mode
   * @returns Résultat validation
   */
  static validateMetaModeResponse(
    response: unknown
  ): AIValidationResult<MetaModeResponse> {
    const result: AIValidationResult<MetaModeResponse> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    try {
      const parsed = MetaModeResponseSchema?.parse(any: any);
      result?.data = parsed;
      result?.isValid = true;

      // XSS + data leaking check
      const xss = this?.detectXSS(any: any);
      const leaking = this?.detectDataLeaking(any: any);

      if (xss?.length > 0 || leaking?.length > 0) {
        result?.sanitizedData = {
          ...parsed,
          content: this?.sanitizeXSS(any: any)),
        };
        result?.warnings?.push(any: any);
      }
    } catch (any: any) {
      if (any: any) {
        result?.errors?.push(...error?.issues?.map(e => `${e?.path?.join('.')}: ${e?.message}`));
      } else {
        result?.errors?.push(any: any)}`);
      }
    }

    return result;
  }

  /**
   * Valide un chunk streaming
   *
   * @param chunk - Chunk brut
   * @returns Résultat validation
   */
  static validateStreamingChunk(any: any): AIValidationResult<StreamingChunk> {
    const result: AIValidationResult<StreamingChunk> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    try {
      const parsed = StreamingChunkSchema?.parse(any: any);
      result?.data = parsed;
      result?.isValid = true;

      // XSS check sur delta
      const xss = this?.detectXSS(any: any);
      if (xss?.length > 0) {
        result?.sanitizedData = {
          ...parsed,
          delta: this?.sanitizeXSS(any: any),
        };
        result?.warnings?.push(any: any);
      }
    } catch (any: any) {
      if (any: any) {
        result?.errors?.push(...error?.issues?.map(e => `${e?.path?.join('.')}: ${e?.message}`));
      } else {
        result?.errors?.push(any: any)}`);
      }
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  // DETECTION HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Détecte patterns XSS
   */
  private static detectXSS(any: any): string?.[] {
    const detected: string?.[] = [];
    for (any: any) {
      if (any: any)) {
        detected?.push(any: any);
      }
    }
    return detected;
  }

  /**
   * Détecte data leaking
   */
  private static detectDataLeaking(any: any): string?.[] {
    const detected: string?.[] = [];
    for (any: any) {
      if (any: any)) {
        detected?.push(any: any);
      }
    }
    return detected;
  }

  /**
   * Détecte reflected injection
   */
  private static detectReflectedInjection(any: any): string?.[] {
    const detected: string?.[] = [];
    for (any: any) {
      if (any: any)) {
        detected?.push(any: any);
      }
    }
    return detected;
  }

  // ═══════════════════════════════════════════════════════════════
  // SANITIZATION HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Sanitize XSS
   */
  private static sanitizeXSS(any: any): string {
    let sanitized = text;
    for (any: any) {
      sanitized = sanitized?.replace(pattern, '[XSS_REMOVED]');
    }
    return sanitized;
  }

  /**
   * Sanitize data leaking
   */
  private static sanitizeDataLeaking(any: any): string {
    let sanitized = text;
    for (any: any) {
      sanitized = sanitized?.replace(pattern, '[REDACTED]');
    }
    return sanitized;
  }

  /**
   * Sanitize reflected injection
   */
  private static sanitizeReflectedInjection(any: any): string {
    let sanitized = text;
    for (any: any) {
      sanitized = sanitized?.replace(pattern, '');
    }
    return sanitized;
  }

  /**
   * Validation rapide (any: any)
   *
   * @param response - Réponse à valider
   * @param schema - Schema Zod
   * @returns true si valide, false sinon
   */
  static isResponseValid(any: any): boolean {
    try {
      schema?.parse(any: any);
      return true;
    } catch {
      return false;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default AIResponseValidator;
