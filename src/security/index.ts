/**
 * @module src/security
 * @description TITANE Security Module - Comprehensive frontend security hardening
 *
 * Includes:
 * - Content Security Policy (CSP) management
 * - Input validation with Zod schemas
 * - Session management with inactivity timeout
 * - API key protection and masking
 * - XSS prevention via DOMPurify
 */

import { Sanitizer } from './Sanitizer';
import { CspManager } from './CspManager';
import { InputValidator } from './InputValidator';
import { SessionGuard } from './SessionGuard';
import { ApiKeyGuard } from './ApiKeyGuard';

export { Sanitizer, CspManager, InputValidator, SessionGuard, ApiKeyGuard };

// Re-export types
export type {
  ValidationResult,
  CspPolicy,
  SessionConfig,
  ApiKeyMetadata,
  SecurityEvent,
} from './types';

// Re-export constants
export {
  ALLOWED_HTML_TAGS,
  ALLOWED_HTML_ATTRIBUTES,
  CSP_DEFAULT_POLICY,
  DISALLOWED_URL_SCHEMES,
  INPUT_LIMITS,
  SESSION_TIMEOUT_MS,
  SESSION_WARNING_MS,
  THREAT_PATTERNS,
} from './constants';

function isTauriRuntime(): boolean {
  if (typeof window === 'undefined') return false;

  const protocol = window.location?.protocol;
  const hasTauriInternals =
    typeof (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ !==
    'undefined';

  return protocol === 'tauri:' || protocol === 'asset:' || hasTauriInternals;
}

/**
 * Initialize all security modules
 * Call this once during app startup
 */
export function initializeSecurity(): void {
  if (typeof window === 'undefined') return; // Skip on SSR

  // Initialize CSP
  CspManager.initialize();
  // In Tauri runtime, CSP must stay governed by tauri.conf.json.
  // Injecting a frontend meta CSP can clamp script-src and break IPC internals.
  if (!isTauriRuntime()) {
    CspManager.applyToDocument();
  }

  // Initialize Session Guard
  SessionGuard.initialize();

  // Log initialization (development only)
  if (process.env.NODE_ENV === 'development') {
    console.warn('[Security] All security modules initialized');
  }
}
