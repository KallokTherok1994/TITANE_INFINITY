/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — SELFHEAL++ ERROR TRACKER
 *   Suivi temporel des erreurs pour détection surcharge & auto-recovery
 * ═══════════════════════════════════════════════════════════════════
 */

interface ErrorEvent {
  timestamp: number;
  type: 'chat' | 'tts' | 'memory' | 'provider' | 'other';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface ErrorStats {
  total: number;
  last60s: number;
  last5min: number;
  byType: Record<string, number>;
  shouldReset: boolean; // 3+ erreurs en <60s
}

// ─────────────────────────────────────────────────────────────────
// ERROR TRACKER
// ─────────────────────────────────────────────────────────────────

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private readonly MAX_HISTORY = 100;
  private readonly RESET_THRESHOLD = 3; // 3 erreurs en 60s = reset
  private readonly RESET_WINDOW = 60000; // 60s
  private lastResetTime = 0;
  private readonly MIN_RESET_INTERVAL = 120000; // 2min entre resets

  /**
   * Enregistre une erreur
   */
  track(
    type: ErrorEvent['type'],
    message: string,
    severity: ErrorEvent['severity'] = 'medium'
  ): void {
    const event: ErrorEvent = {
      timestamp: Date.now(),
      type,
      message,
      severity,
    };

    this.errors.push(event);

    // Nettoyage historique si trop grand
    if (this.errors.length > this.MAX_HISTORY) {
      this.errors = this.errors.slice(-this.MAX_HISTORY);
    }

    console.warn(`🔴 ERROR TRACKED: [${type}] ${message} (severity: ${severity})`);

    // Check si reset nécessaire
    const stats = this.getStats();
    if (stats.shouldReset) {
      console.error('🚨 SELFHEAL++: Reset threshold reached!');
    }
  }

  /**
   * Stats d'erreurs temporelles
   */
  getStats(): ErrorStats {
    const now = Date.now();

    // Erreurs des 60 dernières secondes
    const last60s = this.errors.filter(e => now - e.timestamp < this.RESET_WINDOW);

    // Erreurs des 5 dernières minutes
    const last5min = this.errors.filter(e => now - e.timestamp < 300000);

    // Par type
    const byType: Record<string, number> = {};
    this.errors.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    // Détection surcharge
    const shouldReset =
      last60s.length >= this.RESET_THRESHOLD &&
      (now - this.lastResetTime) > this.MIN_RESET_INTERVAL;

    return {
      total: this.errors.length,
      last60s: last60s.length,
      last5min: last5min.length,
      byType,
      shouldReset,
    };
  }

  /**
   * Marque reset effectué
   */
  markReset(): void {
    this.lastResetTime = Date.now();
    console.log('✅ SELFHEAL++: Reset marker set');
  }

  /**
   * Réinitialise tout l'historique
   */
  clear(): void {
    this.errors = [];
    this.lastResetTime = 0;
    console.log('🧹 ERROR TRACKER: Cleared');
  }

  /**
   * Récupère les erreurs récentes
   */
  getRecentErrors(count = 10): ErrorEvent[] {
    return this.errors.slice(-count);
  }

  /**
   * Check si un type d'erreur est critique
   */
  isCritical(type: ErrorEvent['type']): boolean {
    const now = Date.now();
    const recentErrors = this.errors.filter(
      e => e.type === type && now - e.timestamp < this.RESET_WINDOW
    );

    return recentErrors.length >= 2; // 2 mêmes erreurs en 60s = critique
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const errorTracker = new ErrorTracker();
export default errorTracker;
