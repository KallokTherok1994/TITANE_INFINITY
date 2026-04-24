/**
 * @module src/security/SessionGuard
 * @description Session management and inactivity timeout handling
 * Monitors user activity and enforces session timeouts
 */

import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from './constants';
import type { SessionConfig, SecurityEvent } from './types';

/**
 * Session Guard - manages user session lifecycle
 * Enforces timeout policies and monitors activity
 */
export class SessionGuard {
  private static lastActivity = Date.now();
  private static sessionActive = false;
  private static warningShown = false;
  private static warningTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private static sessionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private static config: SessionConfig = {
    timeoutMs: SESSION_TIMEOUT_MS,
    warningMs: SESSION_WARNING_MS,
    autoRefresh: true,
  };
  private static listeners: Set<(event: SecurityEvent) => void> = new Set();

  /**
   * Initialize session guard with optional custom config
   */
  static initialize(config?: Partial<SessionConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.sessionActive = true;
    this.lastActivity = Date.now();
    this.attachActivityListeners();
    this.resetTimeouts();
  }

  /**
   * Record user activity and reset timeout
   */
  static recordActivity(source?: string): void {
    if (!this.sessionActive) {
      console.warn('[SessionGuard] Activity recorded after session ended');
      return;
    }

    this.lastActivity = Date.now();
    this.warningShown = false;

    // Reset timeouts
    this.clearTimeouts();
    this.resetTimeouts();
  }

  /**
   * Check if session is currently valid
   */
  static isSessionValid(): boolean {
    if (!this.sessionActive) return false;

    const elapsed = Date.now() - this.lastActivity;
    const isValid = elapsed < this.config.timeoutMs;

    if (!isValid && this.sessionActive) {
      this.invalidateSession();
    }

    return isValid;
  }

  /**
   * Get time remaining in session (milliseconds)
   */
  static getTimeRemaining(): number {
    const elapsed = Date.now() - this.lastActivity;
    const remaining = this.config.timeoutMs - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Invalidate session and cleanup
   */
  static invalidateSession(): void {
    if (!this.sessionActive) return;

    this.sessionActive = false;
    this.clearTimeouts();
    this.detachActivityListeners();

    // Emit event
    this.emitEvent({
      timestamp: Date.now(),
      type: 'session',
      severity: 'warning',
      message: 'Session terminated due to inactivity'
    });

    // Clear sensitive data from memory
    this.clearSensitiveData();
  }

  /**
   * Subscribe to session events
   */
  static onSessionEvent(callback: (event: SecurityEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Attach DOM event listeners for activity tracking
   */
  private static attachActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  /**
   * Detach DOM event listeners
   */
  private static detachActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.removeEventListener(event, this.handleActivity, { passive: true } as any);
    });
  }

  /**
   * Handle activity event (bound method)
   */
  private static handleActivity = (): void => {
    this.recordActivity();
  };

  /**
   * Reset session timeout and warning timeout
   */
  private static resetTimeouts(): void {
    const warningTime = Math.max(0, this.config.timeoutMs - (this.config.warningMs || 0));

    // Warning timeout
    if (this.config.warningMs && this.config.warningMs < this.config.timeoutMs) {
      this.warningTimeoutId = setTimeout(
        () => this.showWarning(),
        warningTime
      );
    }

    // Session timeout
    this.sessionTimeoutId = setTimeout(
      () => this.invalidateSession(),
      this.config.timeoutMs
    );
  }

  /**
   * Clear all timeouts
   */
  private static clearTimeouts(): void {
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    if (this.sessionTimeoutId) clearTimeout(this.sessionTimeoutId);
    this.warningTimeoutId = null;
    this.sessionTimeoutId = null;
  }

  /**
   * Show inactivity warning
   */
  private static showWarning(): void {
    if (this.warningShown) return;
    this.warningShown = true;

    this.emitEvent({
      timestamp: Date.now(),
      type: 'session',
      severity: 'warning',
      message: 'Session will expire soon due to inactivity'
    });
  }

  /**
   * Emit security event to all listeners
   */
  private static emitEvent(event: SecurityEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (err) {
        console.error('[SessionGuard] Error in event listener:', err);
      }
    });
  }

  /**
   * Clear sensitive data from memory
   */
  private static clearSensitiveData(): void {
    // Clear any cached sensitive data if needed
    // This is called when session is invalidated
  }
}
