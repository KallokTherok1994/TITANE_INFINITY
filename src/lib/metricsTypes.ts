/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v24.3.0 - Metrics Types
 * Type definitions for service metrics tracking
 * ═══════════════════════════════════════════════════════════════
 */

export interface ServiceMetric {
  service: string;
  command: string;
  timestamp: number;
  latency: number;
  success: boolean;
  cached: boolean;
  retried: boolean;
  error?: string;
  // Extended fields for tracking
  startTime?: number;
  endTime?: number;
  duration?: number;
  retries?: number;
}

export interface ServiceStats {
  service: string;
  totalCalls: number;
  successRate: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  cacheHitRate: number;
  retryRate: number;
  lastUpdated: number;
  // Extended fields
  successfulCalls?: number;
  failedCalls?: number;
  totalRetries?: number;
}

export interface CommandStats {
  command: string;
  service: string;
  totalCalls: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
  // Extended fields
  calls?: number;
  avgLatency?: number;
  lastCall?: number;
}
