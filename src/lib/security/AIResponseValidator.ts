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
  /** Données validées (si valide) */
  data?: T;
  /** Erreurs détectées */
  errors: string[];
  /** Warnings (non bloquants) */
  warnings: string[];
  /** Données sanitizées (safe) */
  sanitizedData?: T;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMAS ZOD (JSON Schema validation)
// ═══════════════════════════════════════════════════════════════

/**
 * Schema pour réponse Chat IA
 */
export const ChatResponseSchema = z.object({
  content: z.string().min(1).max(50000),
  role: z.enum(['assistant', 'system', 'user']),
  timestamp: z.number().optional(),
  metadata: z
    .object({
      model: z.string().optional(),
      tokens: z.number().optional(),
      finish_reason: z.string().optional(),
    })
    .optional(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * Schema pour réponse streaming
 */
export const StreamingChunkSchema = z.object({
  delta: z.string(),
  done: z.boolean(),
  metadata: z
    .object({
      tokens_used: z.number().optional(),
    })
    .optional(),
});

export type StreamingChunk = z.infer<typeof StreamingChunkSchema>;

/**
 * Schema pour réponse Meta-Mode
 */
export const MetaModeResponseSchema = z.object({
  active_mode: z.string().min(1).max(100),
  mode_justification: z.string().max(1000),
  content: z.string().min(1).max(50000),
  adapted_tone: z.string().max(100),
  adapted_depth: z.string().max(100),
  adapted_speed: z.string().max(100),
  next_suggested_modes: z.array(z.string()).max(10),
  timestamp: z.string(),
});

export type MetaModeResponse = z.infer<typeof MetaModeResponseSchema>;

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
 * Patterns de data leaking (IA révèle infos internes)
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
  static validateChatResponse(response: unknown): AIValidationResult<ChatResponse> {
    const result: AIValidationResult<ChatResponse> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    // 1. JSON Schema validation
    try {
      const parsed = ChatResponseSchema.parse(response);
      result.data = parsed;
      result.isValid = true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors.push(...error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        result.errors.push(`Validation failed: ${String(error)}`);
      }
      return result;
    }

    // 2. XSS detection
    const xssDetected = this.detectXSS(result.data.content);
    if (xssDetected.length > 0) {
      result.warnings.push(...xssDetected.map(p => `XSS detected: ${p}`));
      result.sanitizedData = {
        ...result.data,
        content: this.sanitizeXSS(result.data.content),
      };
    }

    // 3. Data leaking detection
    const leakingDetected = this.detectDataLeaking(result.data.content);
    if (leakingDetected.length > 0) {
      result.warnings.push(...leakingDetected.map(p => `Data leaking: ${p}`));
      result.sanitizedData = {
        ...result.data,
        content: this.sanitizeDataLeaking(result.data.content),
      };
    }

    // 4. Reflected injection detection
    const injectionDetected = this.detectReflectedInjection(result.data.content);
    if (injectionDetected.length > 0) {
      result.warnings.push(...injectionDetected.map(p => `Reflected injection: ${p}`));
      result.sanitizedData = {
        ...result.data,
        content: this.sanitizeReflectedInjection(result.data.content),
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
      const parsed = MetaModeResponseSchema.parse(response);
      result.data = parsed;
      result.isValid = true;

      // XSS + data leaking check
      const xss = this.detectXSS(parsed.content);
      const leaking = this.detectDataLeaking(parsed.content);

      if (xss.length > 0 || leaking.length > 0) {
        result.sanitizedData = {
          ...parsed,
          content: this.sanitizeXSS(this.sanitizeDataLeaking(parsed.content)),
        };
        result.warnings.push(...xss, ...leaking);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors.push(...error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        result.errors.push(`Validation failed: ${String(error)}`);
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
  static validateStreamingChunk(chunk: unknown): AIValidationResult<StreamingChunk> {
    const result: AIValidationResult<StreamingChunk> = {
      isValid: false,
      errors: [],
      warnings: [],
    };

    try {
      const parsed = StreamingChunkSchema.parse(chunk);
      result.data = parsed;
      result.isValid = true;

      // XSS check sur delta
      const xss = this.detectXSS(parsed.delta);
      if (xss.length > 0) {
        result.sanitizedData = {
          ...parsed,
          delta: this.sanitizeXSS(parsed.delta),
        };
        result.warnings.push(...xss);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        result.errors.push(...error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        result.errors.push(`Validation failed: ${String(error)}`);
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
  private static detectXSS(text: string): string[] {
    const detected: string[] = [];
    for (const pattern of XSS_IN_TEXT_PATTERNS) {
      if (pattern.test(text)) {
        detected.push(pattern.source);
      }
    }
    return detected;
  }

  /**
   * Détecte data leaking
   */
  private static detectDataLeaking(text: string): string[] {
    const detected: string[] = [];
    for (const pattern of DATA_LEAKING_IN_RESPONSE) {
      if (pattern.test(text)) {
        detected.push(pattern.source);
      }
    }
    return detected;
  }

  /**
   * Détecte reflected injection
   */
  private static detectReflectedInjection(text: string): string[] {
    const detected: string[] = [];
    for (const pattern of REFLECTED_INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        detected.push(pattern.source);
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
  private static sanitizeXSS(text: string): string {
    let sanitized = text;
    for (const pattern of XSS_IN_TEXT_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[XSS_REMOVED]');
    }
    return sanitized;
  }

  /**
   * Sanitize data leaking
   */
  private static sanitizeDataLeaking(text: string): string {
    let sanitized = text;
    for (const pattern of DATA_LEAKING_IN_RESPONSE) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
  }

  /**
   * Sanitize reflected injection
   */
  private static sanitizeReflectedInjection(text: string): string {
    let sanitized = text;
    for (const pattern of REFLECTED_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    return sanitized;
  }

  /**
   * Validation rapide (boolean)
   *
   * @param response - Réponse à valider
   * @param schema - Schema Zod
   * @returns true si valide, false sinon
   */
  static isResponseValid(response: unknown, schema: z.ZodSchema): boolean {
    try {
      schema.parse(response);
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
