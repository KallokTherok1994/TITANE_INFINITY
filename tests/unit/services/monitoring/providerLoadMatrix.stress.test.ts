/**
 * Stress test — ProviderLoadMatrix 2000 req/min throughput guard
 * Plan AH-0080 Phase 4 — HIGH priority
 *
 * Validates that getProviderLoadMatrix() and computeAdaptiveDispatchPolicy()
 * handle 2000 rapid sequential calls without error accumulation or structural
 * degradation. Simulates sustained 2000 req/min load.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';

// ── Mocks hoisted ────────────────────────────────────────────────────────────
const {
  mockGetAggregatedMetrics,
  mockGetHealthStats,
  mockGetAllProviders,
} = vi.hoisted(() => ({
  mockGetAggregatedMetrics: vi.fn(),
  mockGetHealthStats: vi.fn(),
  mockGetAllProviders: vi.fn(),
}));

mockGetAllProviders.mockReturnValue([
  { id: 'ollama', isActive: true, isHealthy: true, failureCount: 2, consecutiveFailures: 0, lastFailure: null },
  { id: 'openai', isActive: true, isHealthy: true, failureCount: 1, consecutiveFailures: 0, lastFailure: null },
  { id: 'gemini', isActive: true, isHealthy: true, failureCount: 0, consecutiveFailures: 0, lastFailure: null },
]);

vi.mock('@/services/ai/metricsEngine', async () => ({
  metricsEngine: {
    getAggregatedMetrics: mockGetAggregatedMetrics,
    getHealthStats: mockGetHealthStats,
  },
}));

vi.mock('@/services/governance/GovernanceConnector', async () => ({
  getGovernanceConnector: vi.fn().mockReturnValue({ getAllProviders: mockGetAllProviders }),
}));

vi.mock('@/services/ai/autoHealEngine', async () => ({
  autoHealEngine: {
    getStats: vi.fn().mockReturnValue({ healthScore: 92, totalErrors: 5, totalHeals: 3 }),
  },
}));

vi.mock('@/config/featureFlags', async () => ({
  getActiveAIProviders: vi.fn().mockReturnValue(['ollama', 'openai', 'gemini']),
}));

vi.mock('@/services/agents/advancedAgentCatalog', async () => ({
  getAdvancedAgentStatus: vi.fn().mockReturnValue({
    readiness: 'qualified',
    blockers: [],
    serviceState: '',
    evidence: [],
  }),
}));

vi.mock('@/services/ai/championChallenger', async () => ({
  loadRegistry: vi.fn().mockReturnValue({
    champions: {
      ollama: { model: 'llama3.2:3b', successRate: 0.97, avgLatency: 600 },
    },
    entries: [],
  }),
}));

vi.mock('@/config/aiTimeouts.config', async () => ({
  PROVIDER_TIMEOUTS: { ollama: 30000, openai: 15000, gemini: 15000 },
}));

import {
  getProviderLoadMatrix,
  computeAdaptiveDispatchPolicy,
} from '@/services/orchestrator';

const STRESS_ITERATIONS = 2000;

beforeAll(() => {
  mockGetAggregatedMetrics.mockReturnValue({
    totalRequests: 500,
    successRate: 0.97,
    avgResponseTime: 750,
    providers: [
      { provider: 'ollama', totalRequests: 350, successCount: 340, errorCount: 10, avgLatency: 600 },
      { provider: 'openai', totalRequests: 100, successCount: 98, errorCount: 2, avgLatency: 1200 },
      { provider: 'gemini', totalRequests: 50, successCount: 49, errorCount: 1, avgLatency: 900 },
    ],
    totalFallbacks: 13,
    last24h: { requests: 500, errors: 13, avgLatency: 750, fallbacks: 13 },
  });
  mockGetHealthStats.mockReturnValue({ overall: 'healthy' });
});

describe(`ProviderLoadMatrix stress — ${STRESS_ITERATIONS} appels`, () => {
  it(`getProviderLoadMatrix() survit ${STRESS_ITERATIONS} appels sans erreur`, () => {
    const errors: unknown[] = [];
    let successCount = 0;

    for (let i = 0; i < STRESS_ITERATIONS; i++) {
      try {
        const matrix = getProviderLoadMatrix();
        if (matrix && typeof matrix === 'object') successCount++;
      } catch (e) {
        errors.push(e);
      }
    }

    expect(errors).toHaveLength(0);
    expect(successCount).toBe(STRESS_ITERATIONS);
  });

  it('structure valide après stress', () => {
    const matrix = getProviderLoadMatrix();
    expect(matrix).toHaveProperty('providers');
    expect(matrix).toHaveProperty('totalLoad');
    expect(matrix).toHaveProperty('dominantProvider');
    expect(Array.isArray(matrix.providers)).toBe(true);
  });

  it(`computeAdaptiveDispatchPolicy() survit ${STRESS_ITERATIONS} appels sans erreur`, () => {
    const matrix = getProviderLoadMatrix();
    const errors: unknown[] = [];
    let successCount = 0;

    for (let i = 0; i < STRESS_ITERATIONS; i++) {
      try {
        const policy = computeAdaptiveDispatchPolicy(matrix);
        if (policy && typeof policy === 'object') successCount++;
      } catch (e) {
        errors.push(e);
      }
    }

    expect(errors).toHaveLength(0);
    expect(successCount).toBe(STRESS_ITERATIONS);
  });

  it('computeAdaptiveDispatchPolicy() retourne toujours un provider valide', () => {
    const matrix = getProviderLoadMatrix();

    for (let i = 0; i < 100; i++) {
      const policy = computeAdaptiveDispatchPolicy(matrix);
      expect(policy).toBeDefined();
      expect(policy).toHaveProperty('preferredProvider');
      expect(typeof policy.preferredProvider).toBe('string');
      expect(policy.preferredProvider.length).toBeGreaterThan(0);
    }
  });

  it('structure matrix stable entre appels successifs', () => {
    const first = getProviderLoadMatrix();
    const second = getProviderLoadMatrix();
    expect(Object.keys(first).sort()).toEqual(Object.keys(second).sort());
    expect(first.providers.length).toBe(second.providers.length);
  });

  it('latence par appel < 5ms en médiane (pur CPU)', () => {
    const iterations = 200;
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      getProviderLoadMatrix();
      durations.push(performance.now() - t0);
    }

    const sorted = [...durations].sort((a, b) => a - b);
    const median = sorted[Math.floor(iterations / 2)];
    const p95 = sorted[Math.floor(iterations * 0.95)];

    expect(median).toBeLessThan(5);
    expect(p95).toBeLessThan(20);
  });
});
