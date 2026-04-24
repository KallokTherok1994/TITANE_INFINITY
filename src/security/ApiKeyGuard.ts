/**
 * @module src/security/ApiKeyGuard
 * @description API key protection and masking in memory
 * Prevents accidental exposure of API keys in logs, errors, and UI
 */

import type { ApiKeyMetadata, SecurityEvent } from './types';

/**
 * API Key Guard - protects API keys from accidental exposure
 * - Never stores keys in plain text
 * - Masks keys in logs
 * - Validates key access
 */
export class ApiKeyGuard {
  private static keys = new Map<string, ApiKeyMetadata>();
  private static listeners: Set<(event: SecurityEvent) => void> = new Set();

  /**
   * Register an API key
   * Stores metadata only, not the actual key
   */
  static registerKey(provider: string, key: string, metadata?: Partial<ApiKeyMetadata>): void {
    if (!key || key.length < 10) {
      this.emitEvent({
        timestamp: Date.now(),
        type: 'api_key',
        severity: 'warning',
        message: `Attempted to register suspiciously short key for ${provider}`,
        details: { provider, keyLength: key.length }
      });
      return;
    }

    // Store only masked version
    const masked = this.maskKey(key);
    
    this.keys.set(provider, {
      provider,
      masked,
      createdAt: Date.now(),
      ...metadata
    });

    this.emitEvent({
      timestamp: Date.now(),
      type: 'api_key',
      severity: 'info',
      message: `API key registered for ${provider}`,
      details: { provider, masked }
    });
  }

  /**
   * Mask an API key for safe logging/display
   * Returns: ***<last4chars>
   */
  static maskKey(key: string): string {
    if (!key || key.length < 4) return '***';
    return `***${key.slice(-4)}`;
  }

  /**
   * Get masked version of a key (safe for logging)
   */
  static getMaskedKey(provider: string): string | null {
    const metadata = this.keys.get(provider);
    return metadata?.masked || null;
  }

  /**
   * Check if key is registered (without exposing it)
   */
  static hasKey(provider: string): boolean {
    return this.keys.has(provider);
  }

  /**
   * Validate that a key was NOT accidentally logged/exposed
   * Checks provided content for partial key matches
   */
  static validateNotInContent(content: string, key: string): boolean {
    if (!key || typeof content !== 'string') {
      return true;  // No key to check
    }

    const lastChars = key.slice(-6);  // Check last 6 chars
    if (content.includes(lastChars)) {
      this.emitEvent({
        timestamp: Date.now(),
        type: 'api_key',
        severity: 'critical',
        message: 'API key potentially exposed in content',
        details: { 
          contentLength: content.length,
          keyTailFound: true 
        }
      });
      return false;
    }

    return true;
  }

  /**
   * Clear all registered keys (e.g., on logout)
   */
  static clearAll(): void {
    const count = this.keys.size;
    this.keys.clear();
    
    this.emitEvent({
      timestamp: Date.now(),
      type: 'api_key',
      severity: 'info',
      message: `Cleared ${count} API keys from memory`
    });
  }

  /**
   * Get API key metadata (without exposing key)
   */
  static getMetadata(provider: string): ApiKeyMetadata | null {
    return this.keys.get(provider) || null;
  }

  /**
   * Update last usage timestamp
   */
  static recordUsage(provider: string): void {
    const metadata = this.keys.get(provider);
    if (metadata) {
      metadata.lastUsed = Date.now();
    }
  }

  /**
   * List all registered providers (without keys)
   */
  static listProviders(): string[] {
    return Array.from(this.keys.keys());
  }

  /**
   * Subscribe to API key security events
   */
  static onKeyEvent(callback: (event: SecurityEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Emit security event
   */
  private static emitEvent(event: SecurityEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (err) {
        console.error('[ApiKeyGuard] Error in event listener:', err);
      }
    });
  }

  /**
   * Get a summary of registered keys (for debugging)
   */
  static getSummary(): Record<string, { masked: string; lastUsed?: number }> {
    const summary: Record<string, { masked: string; lastUsed?: number }> = {};
    
    for (const [provider, metadata] of this.keys.entries()) {
      summary[provider] = {
        masked: metadata.masked,
        lastUsed: metadata.lastUsed
      };
    }
    
    return summary;
  }
}
