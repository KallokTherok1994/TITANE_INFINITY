/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Service Metrics Types
 * Break circular dependencies between serviceMetrics and metricsCache
 * ═══════════════════════════════════════════════════════════════
 */

export interface ServiceMetric {
  command: string;
  service: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  retries: number;
  error?: string;
}

export interface ServiceStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalRetries: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  errorRate: number; // 0-1
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface CommandStats {
  command: string;
  calls: number;
  avgLatency: number;
  errorRate: number;
  lastCall: number;
}
