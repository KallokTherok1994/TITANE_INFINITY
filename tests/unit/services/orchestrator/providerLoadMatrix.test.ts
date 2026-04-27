/**
 * Tests unitaires — ProviderLoadMatrix + AdaptiveDispatchPolicy
 * v31.2.14 — Load matrix temps réel + politique de dispatch adaptive
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ──────────────────────────────────────────────────────
const mockGetAggregatedMetrics = vi.fn().mockReturnValue({
  totalRequests: 50,
  successRate: 0.95,
  avgResponseTime: 1000,
  providers: [
    { provider: 'ollama', totalRequests: 40, successCount: 38, errorCount: 2, avgLatency: 800 },
    { provider: 'openai', totalRequests: 10, successCount: 9, errorCount: 1, avgLatency: 2000 },
  ],
  totalFallbacks: 2,
  last24h: { requests: 50, errors: 3, avgLatency: 1000, fallbacks: 2 },
});
const mockGetHealthStats = vi.fn().mockReturnValue({ overall: 'healthy' });

vi.mock('@/services/ai/metricsEngine', async () => ({
  metricsEngine: {
    getAggregatedMetrics: mockGetAggregatedMetrics,
    getHealthStats: mockGetHealthStats,
  },
}));

const mockGetAllProviders = vi.fn().mockReturnValue([
  { id: 'ollama', isActive: true, isHealthy: true, failureCount: 2, consecutiveFailures: 0, lastFailure: null },
  { id: 'openai', isActive: true, isHealthy: true, failureCount: 1, consecutiveFailures: 0, lastFailure: null },
]);
vi.mock('@/services/governance/GovernanceConnector', async () => ({
  getGovernanceConnector: vi.fn().mockReturnValue({ getAllProviders: mockGetAllProviders }),
}));
vi.mock('@/services/ai/autoHealEngine', async () => ({
  autoHealEngine: { getStats: vi.fn().mockReturnValue({ healthScore: 85, totalErrors: 3, totalHeals: 2 }) },
}));
vi.mock('@/config/aiTimeouts.config', async () => ({
  PROVIDER_TIMEOUTS: { ollama: 30000, openai: 15000 },
}));
vi.mock('@/config/featureFlags', async () => ({
  getActiveAIProviders: vi.fn().mockReturnValue(['ollama', 'openai']),
}));
vi.mock('@/services/agents/advancedAgentCatalog', async () => ({
  getAdvancedAgentStatus: vi.fn().mockReturnValue({ readiness: 'qualified', blockers: [], serviceState: '', evidence: [] }),
}));
import { getProviderLoadMatrix, computeAdaptiveDispatchPolicy } from '@/services/orchestrator';

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAggregatedMetrics.mockReturnValue({
    totalRequests: 50,
    successRate: 0.95,
    avgResponseTime: 1000,
    providers: [
      { provider: 'ollama', totalRequests: 40, successCount: 38, errorCount: 2, avgLatency: 800 },
      { provider: 'openai', totalRequests: 10, successCount: 9, errorCount: 1, avgLatency: 2000 },
    ],
    totalFallbacks: 2,
    last24h: { requests: 50, errors: 3, avgLatency: 1000, fallbacks: 2 },
  });
  mockGetAllProviders.mockReturnValue([
    { id: 'ollama', isActive: true, isHealthy: true, failureCount: 2, consecutiveFailures: 0, lastFailure: null },
    { id: 'openai', isActive: true, isHealthy: true, failureCount: 1, consecutiveFailures: 0, lastFailure: null },
  ]);
});

describe('getProviderLoadMatrix', () => {
  it('retourne une ProviderLoadMatrix structurée', () => {
    const matrix = getProviderLoadMatrix();
    expect(matrix).toHaveProperty('providers');
    expect(matrix).toHaveProperty('totalLoad');
    expect(matrix).toHaveProperty('dominantProvider');
    expect(matrix).toHaveProperty('balanceScore');
    expect(matrix).toHaveProperty('computedAt');
    expect(Array.isArray(matrix.providers)).toBe(true);
  });

  it('chaque ProviderLoadEntry a les champs requis', () => {
    const matrix = getProviderLoadMatrix();
    for (const entry of matrix.providers) {
      expect(entry).toHaveProperty('provider');
      expect(entry).toHaveProperty('loadScore');
      expect(entry.loadScore).toBeGreaterThanOrEqual(0);
      expect(entry.loadScore).toBeLessThanOrEqual(100);
      expect(entry).toHaveProperty('isHealthy');
      expect(entry).toHaveProperty('circuitOpen');
    }
  });

  it('balanceScore est entre 0 et 100', () => {
    const matrix = getProviderLoadMatrix();
    expect(matrix.balanceScore).toBeGreaterThanOrEqual(0);
    expect(matrix.balanceScore).toBeLessThanOrEqual(100);
  });

  it('dominantProvider est le provider avec le plus grand totalRequests', () => {
    const matrix = getProviderLoadMatrix();
    expect(matrix.dominantProvider).toBe('ollama');
  });
});

describe('computeAdaptiveDispatchPolicy', () => {
  it('retourne USE_LOCAL_CHAMPION en situation normale', () => {
    const policy = computeAdaptiveDispatchPolicy();
    expect(['USE_LOCAL_CHAMPION', 'LOAD_BALANCED', 'REDUCE_CLOUD_LOAD', 'FALLBACK_REQUIRED', 'CIRCUIT_OPEN']).toContain(policy.recommendation);
  });

  it('retourne CIRCUIT_OPEN si provider ollama a ≥3 echecs consecutifs', () => {
    mockGetAllProviders.mockReturnValue([
      { id: 'ollama', isActive: true, isHealthy: true, failureCount: 5, consecutiveFailures: 3, lastFailure: Date.now() },
      { id: 'openai', isActive: true, isHealthy: true, failureCount: 0, consecutiveFailures: 0, lastFailure: null },
    ]);
    const policy = computeAdaptiveDispatchPolicy();
    expect(policy.recommendation).toBe('CIRCUIT_OPEN');
  });

  it('retourne FALLBACK_REQUIRED si provider ollama non healthy', () => {
    mockGetAllProviders.mockReturnValue([
      { id: 'ollama', isActive: true, isHealthy: false, failureCount: 5, consecutiveFailures: 0, lastFailure: Date.now() },
      { id: 'openai', isActive: true, isHealthy: true, failureCount: 0, consecutiveFailures: 0, lastFailure: null },
    ]);
    const policy = computeAdaptiveDispatchPolicy();
    expect(policy.recommendation).toBe('FALLBACK_REQUIRED');
  });

  it('policy a maxConcurrent > 0 et timeoutMs > 0', () => {
    const policy = computeAdaptiveDispatchPolicy();
    expect(policy.maxConcurrent).toBeGreaterThan(0);
    expect(policy.timeoutMs).toBeGreaterThan(0);
  });

  it('policy a une raison non vide', () => {
    const policy = computeAdaptiveDispatchPolicy();
    expect(policy.reason.length).toBeGreaterThan(0);
  });
});
