/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Guardrails - Security guardrails and input validation
 * Migrated from Sentinel security logic
 */

import type { SecurityResult, SecurityViolation, ViolationType, Guardrail } from '../types';

/**
 * Guardrails - Security validation and sanitization
 *
 * Features:
 * - Input validation
 * - Injection detection
 * - Rate limiting checks
 * - Content filtering
 */
export class GuardrailsEngine {
  private guardrails: Map<string, Guardrail> = new Map();
  private violations: SecurityViolation[] = [];
  private readonly maxViolations = 100;

  constructor() {
    this.initDefaultGuardrails();
  }

  /**
   * Initialize default guardrails
   */
  private initDefaultGuardrails(): void {
    // Script injection detection
    this.register({
      id: 'script_injection',
      name: 'Script Injection',
      enabled: true,
      action: 'sanitize',
      check: (input: unknown) => {
        if (typeof input !== 'string') return true;
        const patterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
        ];
        return !patterns.some(p => p.test(input));
      },
    });

    // SQL injection detection
    this.register({
      id: 'sql_injection',
      name: 'SQL Injection',
      enabled: true,
      action: 'block',
      check: (input: unknown) => {
        if (typeof input !== 'string') return true;
        const patterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|INTO|WHERE|TABLE)\b)/gi,
          /(--.*)|(\/\*.*\*\/)/g,
          /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
        ];
        return !patterns.some(p => p.test(input));
      },
    });

    // Size limit
    this.register({
      id: 'size_limit',
      name: 'Size Limit',
      enabled: true,
      action: 'block',
      check: (input: unknown) => {
        if (typeof input === 'string') {
          return input.length <= 100000; // 100KB max
        }
        return true;
      },
    });

    // Rate abuse patterns
    this.register({
      id: 'rate_abuse',
      name: 'Rate Abuse',
      enabled: true,
      action: 'warn',
      check: (input: unknown) => {
        if (typeof input !== 'string') return true;
        // Check for repetitive patterns that might indicate abuse
        const repeating = /(.+?)\1{10,}/;
        return !repeating.test(input);
      },
    });
  }

  /**
   * Register a custom guardrail
   */
  register(guardrail: Guardrail): void {
    this.guardrails.set(guardrail.id, guardrail);
  }

  /**
   * Unregister a guardrail
   */
  unregister(id: string): boolean {
    return this.guardrails.delete(id);
  }

  /**
   * Enable/disable a guardrail
   */
  setEnabled(id: string, enabled: boolean): void {
    const guardrail = this.guardrails.get(id);
    if (guardrail) {
      guardrail.enabled = enabled;
    }
  }

  /**
   * Validate input against all guardrails
   */
  validate(input: unknown): SecurityResult {
    const violations: SecurityViolation[] = [];
    let sanitized = input;

    for (const guardrail of this.guardrails.values()) {
      if (!guardrail.enabled) continue;

      const passed = guardrail.check(input);

      if (!passed) {
        const violation: SecurityViolation = {
          type: this.getViolationType(guardrail.id),
          message: `${guardrail.name} violation detected`,
          severity: guardrail.action === 'block' ? 'block' : 'warn',
        };

        violations.push(violation);
        this.recordViolation(violation);

        if (guardrail.action === 'block') {
          return { valid: false, violations };
        }

        if (guardrail.action === 'sanitize' && typeof input === 'string') {
          sanitized = this.sanitize(input as string, guardrail.id);
        }
      }
    }

    return {
      valid: violations.filter(v => v.severity === 'block').length === 0,
      violations,
      sanitized: sanitized !== input ? sanitized : undefined,
    };
  }

  /**
   * Apply guardrails to response
   */
  apply<T>(response: T): T {
    if (typeof response === 'string') {
      return this.sanitizeOutput(response) as T;
    }
    return response;
  }

  /**
   * Get recent violations
   */
  getViolations(limit = 20): SecurityViolation[] {
    return this.violations.slice(-limit);
  }

  /**
   * Get all guardrails
   */
  getGuardrails(): Guardrail[] {
    return Array.from(this.guardrails.values());
  }

  /**
   * Sanitize input based on guardrail type
   */
  private sanitize(input: string, guardrailId: string): string {
    switch (guardrailId) {
      case 'script_injection':
        return input
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=/gi, 'data-removed=');

      case 'sql_injection':
        return input.replace(/['"`;\\]/g, '');

      default:
        return input;
    }
  }

  /**
   * Sanitize output (for responses)
   */
  private sanitizeOutput(output: string): string {
    // Basic XSS prevention for outputs
    return output
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Get violation type from guardrail ID
   */
  private getViolationType(guardrailId: string): ViolationType {
    switch (guardrailId) {
      case 'script_injection': return 'xss';
      case 'sql_injection': return 'injection';
      case 'size_limit': return 'size_limit';
      case 'rate_abuse': return 'rate_limit';
      default: return 'malformed_input';
    }
  }

  /**
   * Record a violation
   */
  private recordViolation(violation: SecurityViolation): void {
    this.violations.push(violation);
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations.slice(-this.maxViolations);
    }
  }
}
