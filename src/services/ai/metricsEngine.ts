/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω — METRICS ENGINE (INSTRUMENTATION LOCALE)
 *   Capture métrique sans données sensibles
 *   Métriques : latence, succès, providers, fallbacks
 * ═══════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('Metrics');

// ─────────────────────────────────────────────────────────────────
// TYPES METRICS
// ─────────────────────────────────────────────────────────────────

export interface MetricEvent {
  id: string;
  timestamp: number;
  type: 'request' | 'response' | 'error' | 'fallback' | 'test';
  provider: string;
  latencyMs?: number;
  success: boolean;
  model?: string;
  tokensUsed?: number;
  messageLength?: number; // Taille message (pas contenu)
  errorType?: string;
}

export interface ProviderMetrics {
  provider: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  lastUsed: number;
  successRate: number;
}

export interface AggregatedMetrics {
  totalRequests: number;
  totalSuccesses: number;
  totalErrors: number;
  totalFallbacks: number;
  avgResponseTime: number;
  successRate: number;
  providers: ProviderMetrics[];
  last24h: {
    requests: number;
    successes: number;
    errors: number;
  };
  uptime: number;
}

// ─────────────────────────────────────────────────────────────────
// METRICS ENGINE CLASS
// ─────────────────────────────────────────────────────────────────

class MetricsEngine {
  private events: MetricEvent[] = [];
  private readonly MAX_EVENTS = 1000; // Limite mémoire
  private readonly RETENTION_MS = 24 * 60 * 60 * 1000; // 24h
  private startTime = Date.now();

  /**
   * Enregistrer un événement métrique
   */
  recordEvent(event: Omit<MetricEvent, 'id' | 'timestamp'>): void {
    const metricEvent: MetricEvent = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      ...event,
    };

    this.events.push(metricEvent);

    // Nettoyage automatique si trop d'événements
    if (this.events.length > this.MAX_EVENTS) {
      this.cleanup();
    }

    logger.debug(
      `${metricEvent.type} | ${metricEvent.provider} | ${metricEvent.success ? '✅' : '❌'} | ${metricEvent.latencyMs || 0}ms`
    );
  }

  /**
   * Nettoyage des événements anciens
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.RETENTION_MS;

    // Supprimer événements > 24h
    this.events = this.events.filter(e => e.timestamp > cutoff);

    // Si encore trop d'événements, garder seulement les plus récents
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    logger.debug(`Cleanup: ${this.events.length} events retained`);
  }

  /**
   * Obtenir métriques par provider
   */
  getProviderMetrics(provider: string): ProviderMetrics {
    const providerEvents = this.events.filter(e => e.provider === provider);
    const latencies = providerEvents
      .filter(e => e.latencyMs !== undefined)
      .map(e => e.latencyMs as number); // ✅ Type assertion sûre

    const totalRequests = providerEvents.filter(
      e => e.type === 'request' || e.type === 'response'
    ).length;
    const successCount = providerEvents.filter(e => e.success).length;
    const errorCount = providerEvents.filter(e => !e.success).length;

    return {
      provider,
      totalRequests,
      successCount,
      errorCount,
      avgLatency:
        latencies.length > 0
          ? latencies.reduce((a, b) => a + b, 0) / latencies.length
          : 0,
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      lastUsed:
        providerEvents.length > 0 ? Math.max(...providerEvents.map(e => e.timestamp)) : 0,
      successRate: totalRequests > 0 ? (successCount / totalRequests) * 100 : 0,
    };
  }

  /**
   * Obtenir métriques agrégées
   */
  getAggregatedMetrics(): AggregatedMetrics {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;

    const allProviders = [...new Set(this.events.map(e => e.provider))];
    const providers = allProviders.map(p => this.getProviderMetrics(p));

    const recentEvents = this.events.filter(e => e.timestamp > last24h);

    const totalRequests = this.events.filter(
      e => e.type === 'request' || e.type === 'response'
    ).length;
    const totalSuccesses = this.events.filter(
      e => e.success && e.type === 'response'
    ).length;
    const totalErrors = this.events.filter(e => !e.success).length;
    const totalFallbacks = this.events.filter(e => e.type === 'fallback').length;

    const latencies = this.events
      .filter(e => e.latencyMs !== undefined)
      .map(e => e.latencyMs as number); // ✅ Type assertion sûre

    return {
      totalRequests,
      totalSuccesses,
      totalErrors,
      totalFallbacks,
      avgResponseTime:
        latencies.length > 0
          ? latencies.reduce((a, b) => a + b, 0) / latencies.length
          : 0,
      successRate: totalRequests > 0 ? (totalSuccesses / totalRequests) * 100 : 0,
      providers,
      last24h: {
        requests: recentEvents.filter(e => e.type === 'request' || e.type === 'response')
          .length,
        successes: recentEvents.filter(e => e.success && e.type === 'response').length,
        errors: recentEvents.filter(e => !e.success).length,
      },
      uptime: now - this.startTime,
    };
  }

  /**
   * Export métriques (format JSON)
   */
  exportMetrics(): string {
    const metrics = this.getAggregatedMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Reset métriques
   */
  reset(): void {
    this.events = [];
    this.startTime = Date.now();
    logger.debug('Reset complete');
  }

  /**
   * Obtenir statistiques de santé
   */
  getHealthStats(): {
    overall: 'healthy' | 'degraded' | 'critical';
    successRate: number;
    avgLatency: number;
    recommendations: string[];
  } {
    const metrics = this.getAggregatedMetrics();
    const recommendations: string[] = [];

    let overall: 'healthy' | 'degraded' | 'critical';

    if (metrics.successRate >= 95 && metrics.avgResponseTime < 5000) {
      overall = 'healthy';
    } else if (metrics.successRate >= 80 && metrics.avgResponseTime < 10000) {
      overall = 'degraded';
      recommendations.push('Taux de succès en baisse');
      if (metrics.avgResponseTime > 5000) {
        recommendations.push('Latence élevée détectée');
      }
    } else {
      overall = 'critical';
      recommendations.push('Taux de succès critique (<80%)');
      if (metrics.avgResponseTime > 10000) {
        recommendations.push('Latence critique (>10s)');
      }
    }

    // Analyser providers individuels
    metrics.providers.forEach(p => {
      if (p.successRate < 70) {
        recommendations.push(
          `Provider ${p.provider}: taux de succès faible (${p.successRate.toFixed(1)}%)`
        );
      }
      if (p.avgLatency > 15000) {
        recommendations.push(
          `Provider ${p.provider}: latence élevée (${(p.avgLatency / 1000).toFixed(1)}s)`
        );
      }
    });

    return {
      overall,
      successRate: metrics.successRate,
      avgLatency: metrics.avgResponseTime,
      recommendations,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// EXPORT SINGLETON
// ─────────────────────────────────────────────────────────────────

export const metricsEngine = new MetricsEngine();
export default metricsEngine;
