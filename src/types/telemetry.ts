/**
 * Ring 1: Telemetry Types
 * Production observability data contracts + thresholds
 * No runtime logic, pure type definitions
 */

export type ProductionHealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export const PRODUCTION_HEALTH_THRESHOLDS = {
  greenMaxMb: 213,
  yellowMaxMb: 239,
  redMinMb: 240,
  greenMaxGrowthPct: 18,
  yellowMaxGrowthPct: 22,
} as const;

export interface ProductionHealthSample {
  timestamp: string; // ISO 8601
  rssInitialMb: number;
  rssCurrentMb: number;
  vszMb?: number;
  cpuPercent?: number;
  sessionCount?: number;
  crashCount?: number;
  failoverCount?: number;
  eventLoopLagMs?: number;
  providerTimeoutsPerHour?: number;
  errorCount?: number;
}

export interface ProductionHealthSummary {
  status: ProductionHealthStatus;
  windowStartISO: string;
  windowEndISO: string;
  initialRssMb: number;
  growthMb: number;
  growthPercent: number;
  lastSample: ProductionHealthSample;
  samplesCollected: number;
  notes?: string;
}
