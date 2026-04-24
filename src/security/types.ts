/**
 * @module src/security/types
 * @description Security module type definitions
 */

/**
 * Validation result from InputValidator
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * CSP policy configuration
 */
export interface CspPolicy {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'connect-src'?: string[];
  'font-src'?: string[];
  'frame-src'?: string[];
  'media-src'?: string[];
}

/**
 * Session configuration
 */
export interface SessionConfig {
  timeoutMs: number;
  warningMs?: number;
  autoRefresh?: boolean;
}

/**
 * API Key metadata
 */
export interface ApiKeyMetadata {
  provider: string;
  masked: string;
  lastUsed?: number;
  createdAt: number;
}

/**
 * Security event for auditing
 */
export interface SecurityEvent {
  timestamp: number;
  type: 'validation' | 'session' | 'api_key' | 'csp' | 'threat';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, any>;
}
