/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v24.3.0 - Metrics Types
 * Type definitions for service metrics tracking
 * ═══════════════════════════════════════════════════════════════
 */

export interface ServiceMetric {
  service: string;
  command: string;
  success: boolean;
  error?: string;
  // Tracking fields
  startTime: number;
  endTime?: number;
  duration?: number;
  retries: number;
  // Optional fields (for backwards compatibility)
  timestamp?: number;
  latency?: number;
  cached?: boolean;
  retried?: boolean;
}

export interface ServiceStats {
  service?: string;
  totalCalls: number;
  successRate: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  cacheHitRate: number;
  retryRate: number;
  lastUpdated?: number;
  // Required fields (used by serviceMetrics.ts)
  successfulCalls: number;
  failedCalls: number;
  totalRetries: number;
  minLatency?: number;
  maxLatency?: number;
}

export interface CommandStats {
  command: string;
  service?: string;
  totalCalls?: number;
  successRate?: number;
  averageLatency?: number;
  errorRate: number;
  // Required fields (used by serviceMetrics.ts)
  calls: number;
  avgLatency: number;
  lastCall: number;
}
