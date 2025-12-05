/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Phase 6: SLA Tracking
 * Suivi SLO/SLA avec violations, reports, uptime
 * ═══════════════════════════════════════════════════════════════
 */

import { ServiceMetrics } from './serviceMetrics';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface SLO {
  service: string;
  uptimeTarget: number; // 0.999 = 99.9%
  p95LatencyTarget: number; // ms
  errorRateTarget: number; // 0.01 = 1%
}

export interface SLAViolation {
  timestamp: number;
  service: string;
  type: 'uptime' | 'latency' | 'errorRate';
  metric: string;
  actual: number;
  target: number;
  deviation: number; // % écart
  duration: number; // ms combien temps violation
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SLAReport {
  service: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startTime: number;
  endTime: number;
  uptime: number; // %
  p95Latency: number; // ms
  errorRate: number; // %
  violations: SLAViolation[];
  slosMet: boolean;
}

// ────────────────────────────────────────────────────────────────
// Default SLOs (Enterprise-grade targets)
// ────────────────────────────────────────────────────────────────

const DEFAULT_SLOS: Record<string, SLO> = {
  memory: {
    service: 'memory',
    uptimeTarget: 0.999, // 99.9%
    p95LatencyTarget: 500, // 500ms
    errorRateTarget: 0.01, // 1%
  },
  chat: {
    service: 'chat',
    uptimeTarget: 0.995, // 99.5%
    p95LatencyTarget: 2000, // 2s
    errorRateTarget: 0.02, // 2%
  },
  voice: {
    service: 'voice',
    uptimeTarget: 0.99, // 99%
    p95LatencyTarget: 1000, // 1s
    errorRateTarget: 0.03, // 3%
  },
  persona: {
    service: 'persona',
    uptimeTarget: 0.995, // 99.5%
    p95LatencyTarget: 300, // 300ms
    errorRateTarget: 0.01, // 1%
  },
  system: {
    service: 'system',
    uptimeTarget: 0.9999, // 99.99%
    p95LatencyTarget: 100, // 100ms
    errorRateTarget: 0.001, // 0.1%
  },
  evolution: {
    service: 'evolution',
    uptimeTarget: 0.99, // 99%
    p95LatencyTarget: 5000, // 5s
    errorRateTarget: 0.05, // 5%
  },
};

// ────────────────────────────────────────────────────────────────
// SLA Tracker
// ────────────────────────────────────────────────────────────────

export class SLATracker {
  private static slos: Map<string, SLO> = new Map(
    Object.entries(DEFAULT_SLOS)
  );
  private static violations: SLAViolation[] = [];
  private static maxViolations = 200;
  private static isTracking = false;
  private static trackingInterval: NodeJS.Timeout | null = null;

  /**
   * Démarrer tracking SLA
   */
  static startTracking(intervalMs = 30000): void {
    // Check toutes les 30s
    if (this.isTracking) return;

    this.isTracking = true;
    this.checkViolations();

    this.trackingInterval = setInterval(() => {
      this.checkViolations();
    }, intervalMs);
  }

  /**
   * Arrêter tracking
   */
  static stopTracking(): void {
    this.isTracking = false;
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  /**
   * Vérifier violations pour tous services
   */
  private static checkViolations(): void {
    for (const [service, slo] of this.slos.entries()) {
      const stats = ServiceMetrics.getServiceStats(service);
      const now = Date.now();

      // 1. Uptime violation
      if (stats.totalCalls > 0) {
        const uptime = stats.successfulCalls / stats.totalCalls;
        if (uptime < slo.uptimeTarget) {
          const deviation = ((slo.uptimeTarget - uptime) / slo.uptimeTarget) * 100;
          this.recordViolation({
            timestamp: now,
            service,
            type: 'uptime',
            metric: 'availability',
            actual: uptime * 100,
            target: slo.uptimeTarget * 100,
            deviation,
            duration: 0, // TODO: track duration
            severity: this.calculateSeverity(deviation),
          });
        }
      }

      // 2. Latency violation (p95)
      if (stats.p95Latency > slo.p95LatencyTarget) {
        const deviation =
          ((stats.p95Latency - slo.p95LatencyTarget) / slo.p95LatencyTarget) * 100;
        this.recordViolation({
          timestamp: now,
          service,
          type: 'latency',
          metric: 'p95_latency',
          actual: stats.p95Latency,
          target: slo.p95LatencyTarget,
          deviation,
          duration: 0,
          severity: this.calculateSeverity(deviation),
        });
      }

      // 3. Error rate violation
      if (stats.errorRate > slo.errorRateTarget) {
        const deviation =
          ((stats.errorRate - slo.errorRateTarget) / slo.errorRateTarget) * 100;
        this.recordViolation({
          timestamp: now,
          service,
          type: 'errorRate',
          metric: 'error_rate',
          actual: stats.errorRate * 100,
          target: slo.errorRateTarget * 100,
          deviation,
          duration: 0,
          severity: this.calculateSeverity(deviation),
        });
      }
    }
  }

  /**
   * Enregistrer violation
   */
  private static recordViolation(violation: SLAViolation): void {
    this.violations.push(violation);

    // Limiter taille
    if (this.violations.length > this.maxViolations) {
      this.violations.shift();
    }
  }

  /**
   * Calculer sévérité selon déviation
   */
  private static calculateSeverity(deviation: number): SLAViolation['severity'] {
    if (deviation > 50) return 'critical';
    if (deviation > 25) return 'high';
    if (deviation > 10) return 'medium';
    return 'low';
  }

  /**
   * Générer rapport SLA pour période
   */
  static generateReport(
    service: string,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): SLAReport | null {
    const slo = this.slos.get(service);
    if (!slo) return null;

    const now = Date.now();
    let startTime = now;

    // Calculer période
    switch (period) {
      case 'hourly':
        startTime = now - 60 * 60 * 1000;
        break;
      case 'daily':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    // Stats période
    const stats = ServiceMetrics.getServiceStats(service, now - startTime);

    // Violations période
    const periodViolations = this.violations.filter(
      (v) => v.service === service && v.timestamp >= startTime
    );

    // Metrics
    const uptime =
      stats.totalCalls > 0
        ? (stats.successfulCalls / stats.totalCalls) * 100
        : 100;
    const p95Latency = stats.p95Latency;
    const errorRate = stats.errorRate * 100;

    // SLOs met ?
    const slosMet =
      uptime >= slo.uptimeTarget * 100 &&
      p95Latency <= slo.p95LatencyTarget &&
      errorRate <= slo.errorRateTarget * 100;

    return {
      service,
      period,
      startTime,
      endTime: now,
      uptime,
      p95Latency,
      errorRate,
      violations: periodViolations,
      slosMet,
    };
  }

  /**
   * Obtenir violations récentes
   */
  static getViolations(
    limit = 50,
    service?: string,
    minSeverity?: SLAViolation['severity']
  ): SLAViolation[] {
    let filtered = [...this.violations];

    if (service) {
      filtered = filtered.filter((v) => v.service === service);
    }

    if (minSeverity) {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const minLevel = severityOrder[minSeverity];
      filtered = filtered.filter((v) => severityOrder[v.severity] >= minLevel);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Obtenir SLO service
   */
  static getSLO(service: string): SLO | undefined {
    return this.slos.get(service);
  }

  /**
   * Modifier SLO service
   */
  static updateSLO(slo: SLO): void {
    this.slos.set(slo.service, slo);
  }

  /**
   * Obtenir tous SLOs
   */
  static getAllSLOs(): SLO[] {
    return Array.from(this.slos.values());
  }

  /**
   * Calculer budget erreur restant (error budget)
   */
  static getErrorBudget(service: string, period: 'daily' | 'weekly' | 'monthly'): {
    totalBudget: number; // nombre erreurs permises
    consumed: number; // nombre erreurs déjà faites
    remaining: number; // nombre erreurs restantes
    percentage: number; // % budget restant
  } | null {
    const slo = this.slos.get(service);
    if (!slo) return null;

    let periodMs = 0;

    switch (period) {
      case 'daily':
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        periodMs = 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const stats = ServiceMetrics.getServiceStats(service, periodMs);

    // Budget total = (1 - uptime target) × total calls
    const totalBudget = Math.floor((1 - slo.uptimeTarget) * stats.totalCalls);
    const consumed = stats.failedCalls;
    const remaining = Math.max(0, totalBudget - consumed);
    const percentage = totalBudget > 0 ? (remaining / totalBudget) * 100 : 100;

    return {
      totalBudget,
      consumed,
      remaining,
      percentage,
    };
  }

  /**
   * Stats violations globales
   */
  static getViolationStats(): {
    total: number;
    byService: Record<string, number>;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    last24h: number;
  } {
    const last24h = Date.now() - 24 * 60 * 60 * 1000;

    const byService: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    let last24hCount = 0;

    for (const violation of this.violations) {
      byService[violation.service] = (byService[violation.service] || 0) + 1;
      byType[violation.type] = (byType[violation.type] || 0) + 1;
      const sev = bySeverity[violation.severity];
      bySeverity[violation.severity] = (sev || 0) + 1;

      if (violation.timestamp >= last24h) {
        last24hCount++;
      }
    }

    return {
      total: this.violations.length,
      byService,
      byType,
      bySeverity,
      last24h: last24hCount,
    };
  }

  /**
   * Effacer historique
   */
  static clear(): void {
    this.violations = [];
  }
}
