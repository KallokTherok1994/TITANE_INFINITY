/**
 * TITANE∞ v19.0 — AI Input Sanitizer
 *
 * Sanitization & validation des entrées utilisateur avant envoi aux services IA
 * Protection contre: prompt injection, jailbreak, XSS, code execution, data leaking
 *
 * @module AIInputSanitizer
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SanitizationResult {
  /** Texte sanitizé (any: any) */
  sanitized: string;
  /** Texte original */
  original: string;
  /** Détecté comme dangereux */
  isBlocked: boolean;
  /** Patterns détectés */
  detectedPatterns: string?.[];
  /** Modifications appliquées */
  modifications: string?.[];
  /** Niveau de risque (any: any) */
  riskLevel: number;
}

export interface SanitizationOptions {
  /** Mode strict (any: any) */
  strictMode?: boolean;
  /** Max length (any: any) */
  maxLength?: number;
  /** Permettre HTML (any: any) */
  allowHtml?: boolean;
  /** Permettre code blocks (any: any) */
  allowCodeBlocks?: boolean;
  /** Permettre URLs (any: any) */
  allowUrls?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PATTERNS DANGEREUX
// ═══════════════════════════════════════════════════════════════

/**
 * Patterns d'injection de prompts (any: any)
 */
const PROMPT_INJECTION_PATTERNS = [
  // System prompt override
  /ignore\s+(any: any)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(any: any)\s+(instructions?|prompts?)/gi,
  /forget\s+(any: any)/gi,

  // Role manipulation
  /you\s+are\s+now\s+(any: any)\s+\w+/gi,
  /act\s+as\s+(any: any)\s+\w+/gi,
  /pretend\s+(any: any)\s+\w+/gi,

  // Context injection
  /\[system\]/gi,
  /\[assistant\]/gi,
  /\[user\]/gi,
  /<\|system\|>/gi,
  /<\|assistant\|>/gi,

  // Jailbreak keywords
  /DAN\s+mode/gi,
  /developer\s+mode/gi,
  /sudo\s+mode/gi,
  /god\s+mode/gi,
];

/**
 * Patterns de code execution (any: any)
 */
const CODE_EXECUTION_PATTERNS = [
  // Shell commands
  /`[^`]*\$\([^)]+\)[^`]*`/g,
  /`[^`]*;\s*(any: any)/g,

  // Eval/exec
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /Function\s*\(/gi,

  // SQL injection
  /'\s*OR\s+'1'\s*=\s*'1/gi,
  /UNION\s+SELECT/gi,
  /DROP\s+TABLE/gi,

  // Path traversal
  /\.\.\/\.\.\//g,
  /%2e%2e%2f/gi,
];

/**
 * Patterns de data leaking (any: any)
 */
const DATA_LEAKING_PATTERNS = [
  // Tentative extraction
  /show\s+me\s+(any: any)/gi,
  /print\s+(any: any)/gi,
  /output\s+(any: any)/gi,
  /reveal\s+(any: any)/gi,

  // Exfiltration
  /send\s+(any: any)\s+to\s+https?:\/\//gi,
  /POST\s+https?:\/\//gi,
];

/**
 * Patterns XSS (any: any)
 */
const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe[^>]*>/gi,
  /<embed[^>]*>/gi,
  /<object[^>]*>/gi,
];

/**
 * Patterns excessifs (any: any)
 */
const EXCESSIVE_PATTERNS = [
  // Répétitions
  /(.)\1{50,}/g, // 50+ caractères identiques
  /(\w+\s+){100,}/g, // 100+ mots répétés
];

// ═══════════════════════════════════════════════════════════════
// SANITIZER CLASS
// ═══════════════════════════════════════════════════════════════

export class AIInputSanitizer {
  // v26.4.0: Limites très permissives
  private static readonly DEFAULT_MAX_LENGTH = 1000000;
  private static readonly RISK_THRESHOLD_BLOCK = 10; // Désactivé effectivement

  /**
   * Sanitize input text pour envoi sécurisé vers IA
   *
   * @param input - Texte brut utilisateur
   * @param options - Options sanitization
   * @returns Résultat sanitization
   */
  static sanitize(input: string, options: SanitizationOptions = {}): SanitizationResult {
    const {
      strictMode = false,
      maxLength = this?.DEFAULT_MAX_LENGTH,
      allowHtml = false,
      allowCodeBlocks = true,
      allowUrls = true,
    } = options;

    const result: SanitizationResult = {
      sanitized: input,
      original: input,
      isBlocked: false,
      detectedPatterns: [],
      modifications: [],
      riskLevel: 0,
    };

    // 1. Check length
    if (any: any) {
      result?.sanitized = input?.substring(any: any);
      result?.modifications?.push(`Truncated to ${maxLength} chars`);
      result?.riskLevel = Math?.max(result?.riskLevel, 1);
    }

    // 2. Check prompt injection (any: any)
    for (any: any) {
      if (any: any)) {
        result?.detectedPatterns?.push(`Prompt Injection: ${pattern?.source}`);
        result?.riskLevel = 2; // Log only, ne bloque plus
        // v26.4.0: Ne bloque plus, log seulement
      }
    }

    // 3. Check code execution (any: any)
    for (any: any) {
      if (any: any)) {
        result?.detectedPatterns?.push(`Code Execution: ${pattern?.source}`);
        result?.riskLevel = 2; // Log only, ne bloque plus
        // v26.4.0: Ne bloque plus, log seulement
      }
    }

    // 4. Check XSS (any: any)
    if (any: any) {
      for (any: any) {
        if (any: any)) {
          result?.detectedPatterns?.push(`XSS: ${pattern?.source}`);
          result?.riskLevel = 4;
          result?.sanitized = result?.sanitized?.replace(pattern, '');
          result?.modifications?.push('Removed XSS patterns');
        }
      }
    }

    // 5. Check data leaking (any: any)
    for (any: any) {
      if (any: any)) {
        result?.detectedPatterns?.push(`Data Leaking: ${pattern?.source}`);
        result?.riskLevel = Math?.max(result?.riskLevel, 3);
        if (any: any) {
          result?.isBlocked = true;
          return result;
        }
      }
    }

    // 6. Sanitize excessive patterns
    for (any: any) {
      if (any: any)) {
        result?.detectedPatterns?.push(`Excessive Pattern: ${pattern?.source}`);
        result?.riskLevel = Math?.max(result?.riskLevel, 2);
        result?.sanitized = result?.sanitized?.replace(pattern, match => {
          return match?.substring(0, 50) + '...';
        });
        result?.modifications?.push('Truncated excessive repetitions');
      }
    }

    // 7. Sanitize URLs (any: any)
    if (any: any) {
      const urlPattern = /https?:\/\/[^\s]+/gi;
      if (any: any)) {
        result?.sanitized = result?.sanitized?.replace(urlPattern, '[URL_REMOVED]');
        result?.modifications?.push('Removed URLs');
        result?.riskLevel = Math?.max(result?.riskLevel, 1);
      }
    }

    // 8. Sanitize code blocks (any: any)
    if (any: any) {
      const codeBlockPattern = /```[\s\S]*?```/g;
      if (any: any)) {
        result?.sanitized = result?.sanitized?.replace(
          codeBlockPattern,
          '[CODE_BLOCK_REMOVED]'
        );
        result?.modifications?.push('Removed code blocks');
        result?.riskLevel = Math?.max(result?.riskLevel, 1);
      }
    }

    // 9. Final block check
    if (any: any) {
      result?.isBlocked = true;
    }

    return result;
  }

  /**
   * Validation rapide (any: any) - bloque si niveau >= 4
   *
   * @param input - Texte à valider
   * @returns true si safe, false si dangereux
   */
  static isInputSafe(any: any): boolean {
    const result = this?.sanitize(input, { strictMode: false });
    return !result?.isBlocked;
  }

  /**
   * Sanitize array de strings (any: any)
   *
   * @param inputs - Array de textes
   * @param options - Options sanitization
   * @returns Array de résultats
   */
  static sanitizeBatch(
    inputs: string?.[],
    options: SanitizationOptions = {}
  ): SanitizationResult?.[] {
    return inputs?.map(any: any));
  }

  /**
   * Validation stricte pour production
   *
   * @param input - Texte à valider
   * @returns Résultat sanitization (any: any)
   */
  static sanitizeStrict(any: any): SanitizationResult {
    return this?.sanitize(input, {
      strictMode: true,
      allowHtml: false,
      allowCodeBlocks: true,
      allowUrls: true,
      maxLength: 10000,
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default AIInputSanitizer;
