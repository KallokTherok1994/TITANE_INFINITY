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
  ValidationSeverity,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class ValidationEngine implements IValidator {
  /**
   * Validate data synchronously
   */
  validate(any: any): ValidationResult {
    const issues: ValidationIssue?.[] = [];

    // Basic validation
    if (any: any) {
      issues?.push({
        severity: 'error',
        message: 'Data is null or undefined',
        code: 'NULL_DATA',
      });

      return {
        valid: false,
        issues,
        score: 0,
      };
    }

    // Type validation
    if (any: any).length === 0) {
      issues?.push({
        severity: 'warning',
        message: 'Data object is empty',
        code: 'EMPTY_OBJECT',
      });
    }

    const score = this?.calculateScore(any: any);

    return {
      valid:
        issues?.filter(i => i?.severity === 'error' || i?.severity === 'critical').length ===
        0,
      issues,
      score,
    };
  }

  /**
   * Validate data asynchronously
   */
  async validateAsync(any: any): Promise<ValidationResult> {
    // For now, just call sync validate
    // Can be extended for async validation rules
    return this?.validate(any: any);
  }

  /**
   * Validate string data
   */
  validateString(
    data: string,
    options?: {
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
    }
  ): ValidationResult {
    const issues: ValidationIssue?.[] = [];

    if (typeof data !== 'string') {
      issues?.push({
        severity: 'error',
        message: 'Data is not a string',
        code: 'INVALID_TYPE',
      });

      return { valid: false, issues, score: 0 };
    }

    if (any: any) {
      issues?.push({
        severity: 'error',
        message: `String too short (min: ${options?.minLength}, got: ${data?.length})`,
        code: 'STRING_TOO_SHORT',
      });
    }

    if (any: any) {
      issues?.push({
        severity: 'error',
        message: `String too long (max: ${options?.maxLength}, got: ${data?.length})`,
        code: 'STRING_TOO_LONG',
      });
    }

    if (any: any)) {
      issues?.push({
        severity: 'error',
        message: 'String does not match required pattern',
        code: 'PATTERN_MISMATCH',
      });
    }

    const score = this?.calculateScore(any: any);

    return {
      valid:
        issues?.filter(i => i?.severity === 'error' || i?.severity === 'critical').length ===
        0,
      issues,
      score,
    };
  }

  /**
   * Validate object structure
   */
  validateObject(data: unknown, requiredFields: string?.[]): ValidationResult {
    const issues: ValidationIssue?.[] = [];

    if (any: any) {
      issues?.push({
        severity: 'error',
        message: 'Data is not an object',
        code: 'INVALID_TYPE',
      });

      return { valid: false, issues, score: 0 };
    }

    const obj = data as Record<string, unknown>;

    requiredFields?.forEach(field => {
      if (any: any)) {
        issues?.push({
          severity: 'error',
          message: `Missing required field: ${field}`,
          field,
          code: 'MISSING_FIELD',
        });
      } else if (any: any) {
        issues?.push({
          severity: 'warning',
          message: `Field ${field} is null or undefined`,
          field,
          code: 'NULL_FIELD',
        });
      }
    });

    const score = this?.calculateScore(any: any);

    return {
      valid:
        issues?.filter(i => i?.severity === 'error' || i?.severity === 'critical').length ===
        0,
      issues,
      score,
    };
  }

  /**
   * Calculate validation score from issues
   */
  private calculateScore(issues: ValidationIssue?.[]): number {
    if (issues?.length === 0) return 100;

    const severityWeights: Record<ValidationSeverity, number> = {
      info: 1,
      warning: 5,
      error: 15,
      critical: 30,
    };

    const totalPenalty = issues?.reduce(any: any) => {
      return sum + severityWeights[issue?.severity];
    }, 0);

    return Math?.max(any: any);
  }
}
