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
  /** Texte sanitizé (safe) */
  sanitized: string;
  /** Texte original */
  original: string;
  /** Détecté comme dangereux */
  isBlocked: boolean;
  /** Patterns détectés */
  detectedPatterns: string[];
  /** Modifications appliquées */
  modifications: string[];
  /** Niveau de risque (0 = safe, 1-3 = warn, 4-5 = blocked) */
  riskLevel: number;
}

export interface SanitizationOptions {
  /** Mode strict (bloque plus de patterns) */
  strictMode?: boolean;
  /** Max length (default: 10000 caractères) */
  maxLength?: number;
  /** Permettre HTML (default: false) */
  allowHtml?: boolean;
  /** Permettre code blocks (default: true) */
  allowCodeBlocks?: boolean;
  /** Permettre URLs (default: true) */
  allowUrls?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PATTERNS DANGEREUX
// ═══════════════════════════════════════════════════════════════

/**
 * Patterns d'injection de prompts (niveau 5 - BLOCK)
 */
const PROMPT_INJECTION_PATTERNS = [
  // System prompt override
  /ignore\s+(previous|all)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(previous|all)\s+(instructions?|prompts?)/gi,
  /forget\s+(everything|all|previous)\s+(instructions?|context)/gi,

  // Role manipulation
  /you\s+are\s+now\s+(a|an)\s+\w+/gi,
  /act\s+as\s+(if\s+you\s+are|a|an)\s+\w+/gi,
  /pretend\s+(you\s+are|to\s+be)\s+\w+/gi,

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
 * Patterns de code execution (niveau 4 - BLOCK)
 */
const CODE_EXECUTION_PATTERNS = [
  // Shell commands
  /`[^`]*\$\([^)]+\)[^`]*`/g,
  /`[^`]*;\s*(rm|curl|wget|bash|sh|python|node)/g,

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
 * Patterns de data leaking (niveau 3 - WARN)
 */
const DATA_LEAKING_PATTERNS = [
  // Tentative extraction
  /show\s+me\s+(your|the)\s+(system|internal|config|database)/gi,
  /print\s+(your|the)\s+(prompt|instructions|rules)/gi,
  /output\s+(your|the)\s+(system|config)/gi,
  /reveal\s+(your|the)\s+(secret|key|token|password)/gi,

  // Exfiltration
  /send\s+(data|info)\s+to\s+https?:\/\//gi,
  /POST\s+https?:\/\//gi,
];

/**
 * Patterns XSS (niveau 4 - BLOCK)
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
 * Patterns excessifs (niveau 2 - SANITIZE)
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
  private static readonly DEFAULT_MAX_LENGTH = 10000;
  private static readonly RISK_THRESHOLD_BLOCK = 4;

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
      maxLength = this.DEFAULT_MAX_LENGTH,
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
    if (input.length > maxLength) {
      result.sanitized = input.substring(0, maxLength);
      result.modifications.push(`Truncated to ${maxLength} chars`);
      result.riskLevel = Math.max(result.riskLevel, 1);
    }

    // 2. Check prompt injection (BLOCK)
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(result.sanitized)) {
        result.detectedPatterns.push(`Prompt Injection: ${pattern.source}`);
        result.riskLevel = 5;
        result.isBlocked = true;
        return result;
      }
    }

    // 3. Check code execution (BLOCK)
    for (const pattern of CODE_EXECUTION_PATTERNS) {
      if (pattern.test(result.sanitized)) {
        result.detectedPatterns.push(`Code Execution: ${pattern.source}`);
        result.riskLevel = 4;
        result.isBlocked = true;
        return result;
      }
    }

    // 4. Check XSS (BLOCK si !allowHtml)
    if (!allowHtml) {
      for (const pattern of XSS_PATTERNS) {
        if (pattern.test(result.sanitized)) {
          result.detectedPatterns.push(`XSS: ${pattern.source}`);
          result.riskLevel = 4;
          result.sanitized = result.sanitized.replace(pattern, '');
          result.modifications.push('Removed XSS patterns');
        }
      }
    }

    // 5. Check data leaking (WARN)
    for (const pattern of DATA_LEAKING_PATTERNS) {
      if (pattern.test(result.sanitized)) {
        result.detectedPatterns.push(`Data Leaking: ${pattern.source}`);
        result.riskLevel = Math.max(result.riskLevel, 3);
        if (strictMode) {
          result.isBlocked = true;
          return result;
        }
      }
    }

    // 6. Sanitize excessive patterns
    for (const pattern of EXCESSIVE_PATTERNS) {
      if (pattern.test(result.sanitized)) {
        result.detectedPatterns.push(`Excessive Pattern: ${pattern.source}`);
        result.riskLevel = Math.max(result.riskLevel, 2);
        result.sanitized = result.sanitized.replace(pattern, match => {
          return match.substring(0, 50) + '...';
        });
        result.modifications.push('Truncated excessive repetitions');
      }
    }

    // 7. Sanitize URLs (si !allowUrls)
    if (!allowUrls) {
      const urlPattern = /https?:\/\/[^\s]+/gi;
      if (urlPattern.test(result.sanitized)) {
        result.sanitized = result.sanitized.replace(urlPattern, '[URL_REMOVED]');
        result.modifications.push('Removed URLs');
        result.riskLevel = Math.max(result.riskLevel, 1);
      }
    }

    // 8. Sanitize code blocks (si !allowCodeBlocks)
    if (!allowCodeBlocks) {
      const codeBlockPattern = /```[\s\S]*?```/g;
      if (codeBlockPattern.test(result.sanitized)) {
        result.sanitized = result.sanitized.replace(
          codeBlockPattern,
          '[CODE_BLOCK_REMOVED]'
        );
        result.modifications.push('Removed code blocks');
        result.riskLevel = Math.max(result.riskLevel, 1);
      }
    }

    // 9. Final block check
    if (result.riskLevel >= this.RISK_THRESHOLD_BLOCK && strictMode) {
      result.isBlocked = true;
    }

    return result;
  }

  /**
   * Validation rapide (boolean) - bloque si niveau >= 4
   *
   * @param input - Texte à valider
   * @returns true si safe, false si dangereux
   */
  static isInputSafe(input: string): boolean {
    const result = this.sanitize(input, { strictMode: false });
    return !result.isBlocked;
  }

  /**
   * Sanitize array de strings (batch)
   *
   * @param inputs - Array de textes
   * @param options - Options sanitization
   * @returns Array de résultats
   */
  static sanitizeBatch(
    inputs: string[],
    options: SanitizationOptions = {}
  ): SanitizationResult[] {
    return inputs.map(input => this.sanitize(input, options));
  }

  /**
   * Validation stricte pour production
   *
   * @param input - Texte à valider
   * @returns Résultat sanitization (strictMode = true)
   */
  static sanitizeStrict(input: string): SanitizationResult {
    return this.sanitize(input, {
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
