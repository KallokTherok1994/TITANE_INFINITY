/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — INPUT VALIDATOR
 *   Validation & sanitization centralisée des entrées utilisateur
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('InputValidator');

export class InputValidator {
  private readonly MAX_LENGTH = 10000;
  private readonly MIN_LENGTH = 1;

  /**
   * Valide et nettoie un message utilisateur
   */
  validate(message: string): string {
    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide: doit être une chaîne non vide');
    }

    // Trim
    let sanitized = message.trim();

    // Vérifier longueur
    if (sanitized.length < this.MIN_LENGTH) {
      throw new Error('Message trop court');
    }

    if (sanitized.length > this.MAX_LENGTH) {
      sanitized = sanitized.substring(0, this.MAX_LENGTH);
      logger.warn(`Message truncated to ${this.MAX_LENGTH} characters`);
    }

    // Sanitize HTML/Scripts
    sanitized = this.removeScripts(sanitized);
    sanitized = this.removeDangerousTags(sanitized);

    // Normaliser espaces
    sanitized = this.normalizeWhitespace(sanitized);

    return sanitized;
  }

  /**
   * Valide un batch de messages
   */
  validateBatch(messages: string[]): string[] {
    return messages.map(msg => this.validate(msg));
  }

  /**
   * Supprime les scripts
   */
  private removeScripts(text: string): string {
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  /**
   * Supprime les tags HTML dangereux
   */
  private removeDangerousTags(text: string): string {
    const dangerousTags = ['iframe', 'object', 'embed', 'link', 'meta'];
    let result = text;

    for (const tag of dangerousTags) {
      // Tags avec fermeture normale
      const regex = new RegExp(
        `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
        'gi'
      );
      result = result.replace(regex, '');

      // Tags auto-fermants
      const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
      result = result.replace(selfClosing, '');
    }

    return result;
  }

  /**
   * Normalise les espaces (remove multiple spaces, tabs, newlines excessives)
   */
  private normalizeWhitespace(text: string): string {
    return text
      .replace(/\t/g, ' ') // Tabs → spaces
      .replace(/ {2,}/g, ' ') // Multiple spaces → single
      .replace(/\n{3,}/g, '\n\n'); // Max 2 newlines consécutives
  }

  /**
   * Détecte du contenu potentiellement malveillant
   */
  isSuspicious(text: string): boolean {
    const suspiciousPatterns = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }
}

// Singleton
export const inputValidator = new InputValidator();

export default inputValidator;
