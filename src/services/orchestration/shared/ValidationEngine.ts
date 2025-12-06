/**
 * TITANE∞ vΩ — Shared Validation Engine
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * Unified validation for all strategies
 */

import type { 
  IValidator, 
  ValidationResult, 
  ValidationIssue, 
  ValidationSeverity 
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class ValidationEngine implements IValidator {
  /**
   * Validate data synchronously
   */
  validate(data: unknown): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Basic validation
    if (data === null || data === undefined) {
      issues.push({
        severity: 'error',
        message: 'Data is null or undefined',
        code: 'NULL_DATA'
      });
      
      return {
        valid: false,
        issues,
        score: 0
      };
    }

    // Type validation
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      issues.push({
        severity: 'warning',
        message: 'Data object is empty',
        code: 'EMPTY_OBJECT'
      });
    }

    const score = this.calculateScore(issues);

    return {
      valid: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
      issues,
      score
    };
  }

  /**
   * Validate data asynchronously
   */
  async validateAsync(data: unknown): Promise<ValidationResult> {
    // For now, just call sync validate
    // Can be extended for async validation rules
    return this.validate(data);
  }

  /**
   * Validate string data
   */
  validateString(data: string, options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (typeof data !== 'string') {
      issues.push({
        severity: 'error',
        message: 'Data is not a string',
        code: 'INVALID_TYPE'
      });
      
      return { valid: false, issues, score: 0 };
    }

    if (options?.minLength && data.length < options.minLength) {
      issues.push({
        severity: 'error',
        message: `String too short (min: ${options.minLength}, got: ${data.length})`,
        code: 'STRING_TOO_SHORT'
      });
    }

    if (options?.maxLength && data.length > options.maxLength) {
      issues.push({
        severity: 'error',
        message: `String too long (max: ${options.maxLength}, got: ${data.length})`,
        code: 'STRING_TOO_LONG'
      });
    }

    if (options?.pattern && !options.pattern.test(data)) {
      issues.push({
        severity: 'error',
        message: 'String does not match required pattern',
        code: 'PATTERN_MISMATCH'
      });
    }

    const score = this.calculateScore(issues);

    return {
      valid: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
      issues,
      score
    };
  }

  /**
   * Validate object structure
   */
  validateObject(data: unknown, requiredFields: string[]): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (typeof data !== 'object' || data === null) {
      issues.push({
        severity: 'error',
        message: 'Data is not an object',
        code: 'INVALID_TYPE'
      });
      
      return { valid: false, issues, score: 0 };
    }

    const obj = data as Record<string, unknown>;

    requiredFields.forEach(field => {
      if (!(field in obj)) {
        issues.push({
          severity: 'error',
          message: `Missing required field: ${field}`,
          field,
          code: 'MISSING_FIELD'
        });
      } else if (obj[field] === undefined || obj[field] === null) {
        issues.push({
          severity: 'warning',
          message: `Field ${field} is null or undefined`,
          field,
          code: 'NULL_FIELD'
        });
      }
    });

    const score = this.calculateScore(issues);

    return {
      valid: issues.filter(i => i.severity === 'error' || i.severity === 'critical').length === 0,
      issues,
      score
    };
  }

  /**
   * Calculate validation score from issues
   */
  private calculateScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) return 100;

    const severityWeights: Record<ValidationSeverity, number> = {
      info: 1,
      warning: 5,
      error: 15,
      critical: 30
    };

    const totalPenalty = issues.reduce((sum, issue) => {
      return sum + severityWeights[issue.severity];
    }, 0);

    return Math.max(0, 100 - totalPenalty);
  }
}
