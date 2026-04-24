/**
 * @module src/security/CspManager
 * @description Content Security Policy (CSP) manager for Tauri WebView
 * Implements strict CSP headers to prevent XSS, injection attacks
 */

import { CSP_DEFAULT_POLICY, CSP_DEFAULT_POLICY as POLICY } from './constants';
import type { CspPolicy } from './types';

/**
 * CSP Manager - manages Content Security Policy for frontend
 * Tauri v2 runs frontend in WebView with restricted capabilities
 */
export class CspManager {
  private static policy: CspPolicy = POLICY;
  private static initialized = false;

  /**
   * Initialize CSP manager with Tauri configuration
   * Called once during app startup
   */
  static initialize(customPolicy?: Partial<CspPolicy>): void {
    if (customPolicy) {
      this.policy = { ...this.policy, ...customPolicy };
    }

    if (this.initialized) return;

    this.initialized = true;
    this.logPolicy();
  }

  /**
   * Get current CSP policy as object
   */
  static getPolicy(): CspPolicy {
    return { ...this.policy };
  }

  /**
   * Get CSP policy as meta tag content string
   * Format: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
   */
  static getPolicyString(): string {
    return Object.entries(this.policy)
      .map(([key, values]) => {
        if (!Array.isArray(values) || values.length === 0) return null;
        return `${key} ${values.join(' ')}`;
      })
      .filter((line): line is string => line !== null)
      .join('; ');
  }

  /**
   * Apply CSP policy to document via meta tag
   * Should be called in document <head> or early in app initialization
   */
  static applyToDocument(): void {
    // Check if meta tag already exists
    let metaTag = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    ) as HTMLMetaElement | null;

    if (!metaTag) {
      metaTag = document.createElement('meta') as HTMLMetaElement;
      metaTag.httpEquiv = 'Content-Security-Policy';
      document.head.insertBefore(metaTag, document.head.firstChild);
    }

    const policyString = this.getPolicyString();
    metaTag.setAttribute('content', policyString);
  }

  /**
   * Validate that a URL complies with CSP connect-src
   */
  static validateConnectUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const connectSrc = this.policy['connect-src'] || [];

      // Check if URL matches allowed origins
      for (const allowed of connectSrc) {
        if (allowed === "'self'") {
          if (urlObj.origin === window.location.origin) return true;
        } else if (allowed.startsWith('http')) {
          if (urlObj.origin === allowed) return true;
        } else if (allowed === '*') {
          return true; // Unrestricted
        }
      }

      console.warn(`[CSP] Blocked connection to ${url}: not in connect-src policy`);
      return false;
    } catch (err) {
      console.error(`[CSP] Invalid URL format: ${url}`, err);
      return false;
    }
  }

  /**
   * Validate that inline script would be allowed by CSP
   */
  static allowsInlineScripts(): boolean {
    const scriptSrc = this.policy['script-src'] || [];
    return scriptSrc.includes("'unsafe-inline'");
  }

  /**
   * Log current policy to console (debug only)
   */
  private static logPolicy(): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CSP] Policy initialized:', this.getPolicyString());
    }
  }

  /**
   * Update a specific CSP directive
   */
  static updateDirective(directive: keyof CspPolicy, values: string[]): void {
    this.policy[directive] = values;
  }

  /**
   * Check if CSP policy includes a specific directive
   */
  static hasDirective(directive: keyof CspPolicy): boolean {
    return Boolean(this.policy[directive]?.length);
  }
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  CspManager.initialize();
}
