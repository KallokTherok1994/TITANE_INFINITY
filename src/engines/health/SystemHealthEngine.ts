/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * SystemHealthEngine - Unified System Health Engine
 * FUSION: Helios Core (Monitoring) + Sentinel (Security) + Harmonia (Balance)
 *
 * This engine consolidates:
 * - Metrics Engine (performance instrumentation)
 * - Auto-Heal Engine (error recovery)
 * - Helios Agent (cognitive monitoring)
 * - Sentinel (security guardrails)
 * - Harmonia (load balancing)
 */

import { MetricsCollector } from './monitoring/metricsCollector';
import { LatencyTracker } from './monitoring/latencyTracker';
import { AutoHealer } from './healing/autoHealer';
import { GuardrailsEngine } from './security/guardrails';
import { LoadBalancer } from './balance/loadBalancer';

import type {
  SystemMetrics,
  ProviderHealth,
  ProviderMetrics,
  ProviderStatus,
  HealthIssue,
  Alert,
  AnomalyHandler,
  HealingContext,
  HealingResult,
  HealingEvent,
  SecurityResult,
  LoadBalanceState,
} from './types';

/**
 * SystemHealthEngine - Central system health management
 *
 * Responsibilities:
 * - CPU/RAM/process monitoring
 * - Performance instrumentation
 * - Provider health scoring
 * - Anomaly detection and alerts
 * - Auto-healing and recovery
 * - Security guardrails
 * - Resource load balancing
 */
class SystemHealthImpl {
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  private metrics: MetricsCollector;
  private latency: LatencyTracker;
  private healer: AutoHealer;
  private guardrails: GuardrailsEngine;
  private balancer: LoadBalancer;

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  private providers: Map<string, ProviderMetrics> = new Map();
  private initialized = false;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.metrics = new MetricsCollector();
    this.latency = new LatencyTracker();
    this.healer = new AutoHealer();
    this.guardrails = new GuardrailsEngine();
    this.balancer = new LoadBalancer();

    console.log('[SystemHealth] Initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize the health engine
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.runHealthCheck();
    }, 30000); // Every 30 seconds

    this.initialized = true;
    console.log('[SystemHealth] Engine started');
  }

  /**
   * Shutdown the health engine
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.initialized = false;
    console.log('[SystemHealth] Engine stopped');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MONITORING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current system metrics
   */
  getMetrics(): SystemMetrics {
    const baseMetrics = this.metrics.getMetrics();
    baseMetrics.providers = new Map(this.providers);
    baseMetrics.latency = this.latency.getPercentiles();
    return baseMetrics;
  }

  /**
   * Get health status for a specific provider
   */
  getProviderHealth(id: string): ProviderHealth {
    const metrics = this.providers.get(id);

    if (!metrics) {
      return {
        id,
        status: 'offline',
        health: 0,
        metrics: this.createEmptyProviderMetrics(id),
        issues: [
          {
            severity: 'critical',
            code: 'NOT_FOUND',
            message: 'Provider not registered',
            timestamp: Date.now(),
          },
        ],
      };
    }

    const status = this.calculateStatus(metrics);
    const issues = this.detectIssues(metrics);

    return {
      id,
      status,
      health: metrics.health,
      metrics,
      issues,
    };
  }

  /**
   * Get all provider health statuses
   */
  getAllProviderHealth(): Map<string, ProviderHealth> {
    const result = new Map<string, ProviderHealth>();
    this.providers.forEach((_, id) => {
      result.set(id, this.getProviderHealth(id));
    });
    return result;
  }

  /**
   * Track latency for an operation
   */
  trackLatency(operation: string, ms: number): void {
    this.latency.track(operation, ms);

    // Update provider latency if operation is a provider ID
    if (this.providers.has(operation)) {
      const provider = this.providers.get(operation);
      if (provider) {
        // Running average
        provider.latency = provider.latency * 0.9 + ms * 0.1;
      }
    }
  }

  /**
   * Register a provider for health tracking
   */
  registerProvider(id: string, capacity?: number): void {
    if (!this.providers.has(id)) {
      this.providers.set(id, this.createEmptyProviderMetrics(id));
    }
    this.balancer.registerProvider(id, capacity);
  }

  /**
   * Update provider metrics
   */
  updateProvider(id: string, update: Partial<ProviderMetrics>): void {
    const existing = this.providers.get(id) ?? this.createEmptyProviderMetrics(id);
    this.providers.set(id, { ...existing, ...update });
  }

  /**
   * Record provider success
   */
  recordSuccess(providerId: string, latencyMs: number): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.requestCount++;
      provider.lastSuccess = Date.now();
      provider.latency = provider.latency * 0.9 + latencyMs * 0.1;
      // Boost health on success
      provider.health = Math.min(1, provider.health + 0.01);
      provider.available = true;
    }
    this.trackLatency(providerId, latencyMs);
    this.balancer.decrementLoad(providerId);
  }

  /**
   * Record provider error
   */
  recordError(providerId: string, error: Error): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.requestCount++;
      provider.errorCount++;
      provider.lastError = Date.now();
      // Reduce health on error
      provider.health = Math.max(0, provider.health - 0.1);
    }
    this.metrics.recordError(providerId, error.message);
    this.balancer.decrementLoad(providerId);
  }

  /**
   * Mark provider request started
   */
  requestStarted(providerId: string): void {
    this.balancer.incrementLoad(providerId);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ALERTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Subscribe to anomaly events
   */
  onAnomaly(handler: AnomalyHandler): () => void {
    return this.metrics.onAnomaly(handler);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.metrics.getActiveAlerts();
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(id: string): void {
    this.metrics.acknowledgeAlert(id);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(id: string): void {
    this.metrics.resolveAlert(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-HEALING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Trigger automatic healing
   */
  async triggerHealing(context: HealingContext): Promise<HealingResult> {
    const result = await this.healer.heal(context);

    // Update provider state if healing succeeded
    if (result.success && context.source) {
      this.metrics.markErrorRecovered(context.source);

      const provider = this.providers.get(context.source);
      if (provider) {
        // Partial health recovery after successful healing
        provider.health = Math.min(1, provider.health + 0.2);
      }
    }

    return result;
  }

  /**
   * Get healing history
   */
  getHealingHistory(): HealingEvent[] {
    return this.healer.getHistory();
  }

  /**
   * Get healing success rate
   */
  getHealingSuccessRate(): number {
    return this.healer.getSuccessRate();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SECURITY (ex-Sentinel)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate a request for security issues
   */
  validateRequest(request: unknown): SecurityResult {
    return this.guardrails.validate(request);
  }

  /**
   * Apply security guardrails to response
   */
  applyGuardrails<T>(response: T): T {
    return this.guardrails.apply(response);
  }

  /**
   * Get security violations
   */
  getSecurityViolations(): ReturnType<GuardrailsEngine['getViolations']> {
    return this.guardrails.getViolations();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD BALANCE (ex-Harmonia)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current load balance state
   */
  getLoadBalance(): LoadBalanceState {
    return this.balancer.getState();
  }

  /**
   * Trigger load rebalancing
   */
  async rebalance(): Promise<void> {
    await this.balancer.rebalance();
  }

  /**
   * Get best provider for new request
   */
  getBestProvider(): string | undefined {
    return this.balancer.getBestProvider();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH CHECK
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Run comprehensive health check
   */
  runHealthCheck(): void {
    // Check all providers
    this.providers.forEach((metrics, id) => {
      const issues = this.detectIssues(metrics);

      // Create alerts for critical issues
      for (const issue of issues) {
        if (issue.severity === 'critical') {
          this.metrics.createAlert('provider_unhealthy', id, issue.message, 'critical');
        }
      }

      // Auto-heal unhealthy providers
      if (metrics.health < 0.3) {
        this.triggerHealing({
          trigger: 'health_degradation',
          source: id,
          severity: 'high',
        }).catch(console.error);
      }
    });

    // Check system resources
    const memUsage = this.metrics.getMemory();
    if (memUsage.percentage > 90) {
      this.metrics.createAlert(
        'memory_pressure',
        'system',
        `Memory usage at ${memUsage.percentage.toFixed(0)}%`,
        'warning'
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private createEmptyProviderMetrics(id: string): ProviderMetrics {
    return {
      id,
      health: 1,
      latency: 0,
      requestCount: 0,
      errorCount: 0,
      lastSuccess: 0,
      available: true,
    };
  }

  private calculateStatus(metrics: ProviderMetrics): ProviderStatus {
    if (!metrics.available) return 'offline';
    if (metrics.health < 0.3) return 'unhealthy';
    if (metrics.health < 0.7) return 'degraded';
    return 'healthy';
  }

  private detectIssues(metrics: ProviderMetrics): HealthIssue[] {
    const issues: HealthIssue[] = [];
    const now = Date.now();

    // High error rate
    if (metrics.requestCount > 0) {
      const errorRate = metrics.errorCount / metrics.requestCount;
      if (errorRate > 0.2) {
        issues.push({
          severity: 'critical',
          code: 'HIGH_ERROR_RATE',
          message: `Error rate ${(errorRate * 100).toFixed(0)}% exceeds threshold`,
          timestamp: now,
        });
      } else if (errorRate > 0.1) {
        issues.push({
          severity: 'warning',
          code: 'ELEVATED_ERROR_RATE',
          message: `Error rate ${(errorRate * 100).toFixed(0)}% is elevated`,
          timestamp: now,
        });
      }
    }

    // High latency
    if (metrics.latency > 5000) {
      issues.push({
        severity: 'warning',
        code: 'HIGH_LATENCY',
        message: `Latency ${metrics.latency.toFixed(0)}ms exceeds threshold`,
        timestamp: now,
      });
    }

    // Low health
    if (metrics.health < 0.5) {
      issues.push({
        severity: metrics.health < 0.3 ? 'critical' : 'warning',
        code: 'LOW_HEALTH',
        message: `Health score ${(metrics.health * 100).toFixed(0)}% is low`,
        timestamp: now,
      });
    }

    // Stale (no success in 5 minutes)
    if (metrics.lastSuccess > 0 && now - metrics.lastSuccess > 5 * 60 * 1000) {
      issues.push({
        severity: 'info',
        code: 'STALE',
        message: 'No successful requests in 5 minutes',
        timestamp: now,
      });
    }

    return issues;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Global SystemHealth instance
 *
 * Usage:
 * ```typescript
 * import { systemHealth } from '@/engines/health';
 *
 * // Register providers
 * systemHealth.registerProvider('openai', 100);
 *
 * // Track operations
 * systemHealth.requestStarted('openai');
 * const result = await callProvider();
 * systemHealth.recordSuccess('openai', latencyMs);
 *
 * // Get health
 * const health = systemHealth.getProviderHealth('openai');
 *
 * // Auto-heal
 * await systemHealth.triggerHealing({ trigger: 'provider_failure', source: 'openai' });
 * ```
 */
export const systemHealth = new SystemHealthImpl();

// Type export for consumers
export type SystemHealth = typeof systemHealth;
