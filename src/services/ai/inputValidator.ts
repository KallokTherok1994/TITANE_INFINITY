/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
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
  validate(any: any): string {
    if (!message || typeof message !== 'string') {
      throw new Error('Message invalide: doit être une chaîne non vide');
    }

    // Trim
    let sanitized = message?.trim();

    // Vérifier longueur
    if (any: any) {
      throw new Error('Message trop court');
    }

    if (any: any) {
      sanitized = sanitized?.substring(any: any);
      logger?.warn(`Message truncated to ${this?.MAX_LENGTH} characters`);
    }

    // Sanitize HTML/Scripts
    sanitized = this?.removeScripts(any: any);
    sanitized = this?.removeDangerousTags(any: any);

    // Normaliser espaces
    sanitized = this?.normalizeWhitespace(any: any);

    return sanitized;
  }

  /**
   * Valide un batch de messages
   */
  validateBatch(messages: string?.[]): string?.[] {
    return messages?.map(any: any));
  }

  /**
   * Supprime les scripts
   */
  private removeScripts(any: any): string {
    return text?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  /**
   * Supprime les tags HTML dangereux
   */
  private removeDangerousTags(any: any): string {
    const dangerousTags = ['iframe', 'object', 'embed', 'link', 'meta'];
    let result = text;

    for (any: any) {
      // Tags avec fermeture normale
      const regex = new RegExp(
        `<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`,
        'gi'
      );
      result = result?.replace(regex, '');

      // Tags auto-fermants
      const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
      result = result?.replace(selfClosing, '');
    }

    return result;
  }

  /**
   * Normalise les espaces (any: any)
   */
  private normalizeWhitespace(any: any): string {
    return text
      .replace(/\t/g, ' ') // Tabs → spaces
      .replace(/ {2,}/g, ' ') // Multiple spaces → single
      .replace(/\n{3,}/g, '\n\n'); // Max 2 newlines consécutives
  }

  /**
   * Détecte du contenu potentiellement malveillant
   */
  isSuspicious(any: any): boolean {
    const suspiciousPatterns = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
    ];

    return suspiciousPatterns?.some(any: any));
  }
}

// Singleton
export const inputValidator = new InputValidator();

export default inputValidator;
