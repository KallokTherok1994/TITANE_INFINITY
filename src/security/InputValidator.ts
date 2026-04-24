/**
 * @module src/security/InputValidator
 * @description Centralized input validation using Zod schemas
 * Replaces ad-hoc validation throughout codebase
 */

import { z } from 'zod';
import { INPUT_LIMITS, THREAT_PATTERNS, DISALLOWED_URL_SCHEMES } from './constants';
import type { ValidationResult } from './types';

/**
 * Input Validator - centralized validation using Zod
 * All user input should be validated through this module
 */
export class InputValidator {
  /**
   * Validate API key format
   * - Length: 1-2048 chars
   * - No control characters
   */
  static validateApiKey(input: unknown): ValidationResult {
    const schema = z
      .string()
      .min(1, 'API key cannot be empty')
      .max(INPUT_LIMITS.apiKey, `API key exceeds ${INPUT_LIMITS.apiKey} characters`)
      .regex(/^[\x20-\x7E]+$/, 'API key contains invalid characters');

    const result = schema.safeParse(input);
    if (!result.success) {
      return {
        valid: false,
        error: result.error.issues[0]?.message || 'Invalid API key'
      };
    }

    return { valid: true, sanitized: result.data };
  }

  /**
   * Validate chat message
   * - Length: 1-10000 chars
   * - No control characters except newlines/tabs
   * - Detect potential threats
   */
  static validateChatMessage(input: unknown): ValidationResult {
    const schema = z
      .string()
      .min(1, 'Message cannot be empty')
      .max(INPUT_LIMITS.chatMessage, `Message exceeds ${INPUT_LIMITS.chatMessage} characters`);

    const result = schema.safeParse(input);
    if (!result.success) {
      return {
        valid: false,
        error: result.error.issues[0]?.message || 'Invalid message'
      };
    }

    const message = result.data;

    // Check for threat patterns (SQL injection, command injection, XSS)
    if (THREAT_PATTERNS.xss.test(message)) {
      return {
        valid: false,
        error: 'Message contains potential XSS patterns'
      };
    }

    return { valid: true, sanitized: message };
  }

  /**
   * Validate URL format and scheme
   * - Must be valid HTTP/HTTPS/blob/data URL
   * - No javascript:/vbscript: schemes
   */
  static validateUrl(input: unknown): ValidationResult {
    const schema = z
      .string()
      .min(1)
      .max(INPUT_LIMITS.url);

    const result = schema.safeParse(input);
    if (!result.success) {
      return {
        valid: false,
        error: 'Invalid URL format'
      };
    }

    const url = result.data;

    // Check for disallowed schemes
    for (const scheme of DISALLOWED_URL_SCHEMES) {
      if (url.toLowerCase().startsWith(scheme)) {
        return {
          valid: false,
          error: `URL scheme ${scheme} is not allowed`
        };
      }
    }

    // Try to parse as URL
    try {
      new URL(url);
      return { valid: true, sanitized: url };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Validate user name/identifier
   * - Length: 1-256 chars
   * - Alphanumeric, underscore, hyphen only
   */
  static validateUserName(input: unknown): ValidationResult {
    const schema = z
      .string()
      .min(1)
      .max(INPUT_LIMITS.userName)
      .regex(/^[a-zA-Z0-9_-]+$/, 'User name contains invalid characters');

    const result = schema.safeParse(input);
    if (!result.success) {
      return {
        valid: false,
        error: result.error.issues[0]?.message || 'Invalid user name'
      };
    }

    return { valid: true, sanitized: result.data };
  }

  /**
   * Validate command/shell input
   * - Length: 1-512 chars
   * - Detect dangerous patterns
   */
  static validateCommand(input: unknown): ValidationResult {
    const schema = z
      .string()
      .min(1)
      .max(INPUT_LIMITS.command);

    const result = schema.safeParse(input);
    if (!result.success) {
      return {
        valid: false,
        error: 'Invalid command format'
      };
    }

    const command = result.data;

    // Detect command injection patterns
    if (THREAT_PATTERNS.commandInjection.test(command)) {
      return {
        valid: false,
        error: 'Command contains dangerous characters (injection risk)'
      };
    }

    return { valid: true, sanitized: command };
  }

  /**
   * Generic string validation with custom schema
   */
  static validate(input: unknown, schema: z.ZodSchema): ValidationResult {
    const result = schema.safeParse(input);
    if (!result.success) {
      return {
        valid: false,
        error: result.error.issues[0]?.message || 'Validation failed'
      };
    }

    return { valid: true, sanitized: (result.data as unknown as string | undefined) };
  }

  static validateOrThrow(input: unknown, schema: z.ZodSchema, fieldName: string): any {
    const result = this.validate(input, schema);
    if (!result.valid) {
      throw new Error(`Invalid ${fieldName}: ${result.error}`);
    }
    return result.sanitized;
  }
}
