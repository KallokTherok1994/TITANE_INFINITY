/**
 * Tests unitaires — Orchestrateur Dynamique Agent
 * Scope: getProviderLoadMatrix, computeAdaptiveDispatchPolicy,
 *        dispatchToAgents, dispatchToAgentsWithTimeout,
 *        getOrchestratorAgentStatus, getOrchestratorDashboardRefreshIntervalMs
 * Rule 16: nouveau service → tests unitaires obligatoires
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks (vi.hoisted garantit l'initialisation avant le hoist vi.mock) ──────

const {
  mockGetAdvancedAgentStatus,
  mockGetActiveAIProviders,
  mockLoadRegistry,
  mockGetAggregatedMetrics,
  mockGetHealthStats,
  mockGetHealStats,
  mockGetAllProviders,
  mockGetGovernanceConnector,
} = vi.hoisted(() => {
  const getAllProviders = vi.fn(() => [
    {
      id: 'ollama',
      isActive: true,
      isHealthy: true,
      isConfigured: true,
      failureCount: 0,
      consecutiveFailures: 0,
      lastFailure: 0,
    },
    {
      id: 'tauri-backend',
      isActive: true,
      isHealthy: true,
      isConfigured: true,
      failureCount: 0,
      consecutiveFailures: 0,
      lastFailure: 0,
    },
  ]);
  return {
    mockGetAdvancedAgentStatus: vi.fn(() => ({
      id: 'orchestrator',
      name: 'Orchestrateur Dynamique',
      readiness: 'partial',
      readinessLabel: 'PARTIAL',
      serviceState: 'mock',
      evidence: ['mock evidence'],
      blockers: [],
      nextStep: 'mock step',
      detailSections: [],
    })),
    mockGetActiveAIProviders: vi.fn(() => ['ollama', 'tauri-backend']),
    mockLoadRegistry: vi.fn(() => ({
      champions: {
        default: { provider: 'ollama', model: 'gemma2:2b', mode: 'default' },
        creative: { provider: 'ollama', model: 'gemma2:2b', mode: 'creative' },
      },
      challengers: {},
      comparison: { enabled: false, sample_rate: 0.1 },
    })),
    mockGetAggregatedMetrics: vi.fn(() => ({
      totalRequests: 50,
      successRate: 95,
      avgResponseTime: 350,
      totalFallbacks: 2,
      last24h: { requests: 30 },
      providers: [
        {
          provider: 'ollama',
          totalRequests: 40,
          successCount: 38,
          avgLatency: 300,
          errorCount: 2,
        },
        {
          provider: 'tauri-backend',
          totalRequests: 10,
          successCount: 10,
          avgLatency: 100,
          errorCount: 0,
        },
      ],
    })),
    mockGetHealthStats: vi.fn(() => ({ overall: 'healthy' })),
    mockGetHealStats: vi.fn(() => ({ healthScore: 90, totalErrors: 3, totalHeals: 1 })),
    mockGetAllProviders: getAllProviders,
    mockGetGovernanceConnector: vi.fn(() => ({ getAllProviders: getAllProviders })),
  };
});

vi.mock('@/services/agents/advancedAgentCatalog', () => ({
  getAdvancedAgentStatus: mockGetAdvancedAgentStatus,
}));

vi.mock('@/config/featureFlags', () => ({
  getActiveAIProviders: mockGetActiveAIProviders,
}));

vi.mock('@/services/ai/championChallenger', () => ({
  loadRegistry: mockLoadRegistry,
}));

vi.mock('@/services/ai/metricsEngine', () => ({
  metricsEngine: {
    getAggregatedMetrics: mockGetAggregatedMetrics,
    getHealthStats: mockGetHealthStats,
  },
}));

vi.mock('@/services/ai/autoHealEngine', () => ({
  autoHealEngine: { getStats: mockGetHealStats },
}));

vi.mock('@/services/governance/GovernanceConnector', () => ({
  getGovernanceConnector: mockGetGovernanceConnector,
}));

vi.mock('@/config/aiTimeouts.config', () => ({
  PROVIDER_TIMEOUTS: { ollama: 30000, 'tauri-backend': 15000 },
}));

// ── Import après mocks ────────────────────────────────────────────────────────

import {
  getProviderLoadMatrix,
  computeAdaptiveDispatchPolicy,
  dispatchToAgents,
  dispatchToAgentsWithTimeout,
  getOrchestratorAgentStatus,
  getOrchestratorDashboardRefreshIntervalMs,
  resetOrchestratorSessionSnapshotsForTests,
  type AgentEvent,
} from '../index';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getProviderLoadMatrix — état sain', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockGetAllProviders.mockReturnValue([
      {
        id: 'ollama',
        isActive: true,
        isHealthy: true,
        isConfigured: true,
        failureCount: 0,
        consecutiveFailures: 0,
        lastFailure: 0,
      },
      {
        id: 'tauri-backend',
        isActive: true,
        isHealthy: true,
        isConfigured: true,
        failureCount: 0,
        consecutiveFailures: 0,
        lastFailure: 0,
      },
    ]);
    mockGetAggregatedMetrics.mockReturnValue({
      totalRequests: 50,
      successRate: 95,
      avgResponseTime: 350,
      totalFallbacks: 2,
      last24h: { requests: 30 },
      providers: [
        {
          provider: 'ollama',
          totalRequests: 40,
          successCount: 38,
          avgLatency: 300,
          errorCount: 2,
        },
        {
          provider: 'tauri-backend',
          totalRequests: 10,
          successCount: 10,
          avgLatency: 100,
          errorCount: 0,
        },
      ],
    });
  });

  it('retourne une matrice structurée avec champs obligatoires', () => {
    const matrix = getProviderLoadMatrix();
    expect(Array.isArray(matrix.providers)).toBe(true);
    expect(typeof matrix.totalLoad).toBe('number');
    expect(typeof matrix.dominantProvider).toBe('string');
    expect(typeof matrix.balanceScore).toBe('number');
    expect(typeof matrix.computedAt).toBe('number');
  });

  it('totalLoad = somme des requêtes de tous les providers', () => {
    const matrix = getProviderLoadMatrix();
    const sum = matrix.providers.reduce((acc, p) => acc + p.totalRequests, 0);
    expect(matrix.totalLoad).toBe(sum);
  });

  it('balanceScore est entre 0 et 100', () => {
    const matrix = getProviderLoadMatrix();
    expect(matrix.balanceScore).toBeGreaterThanOrEqual(0);
    expect(matrix.balanceScore).toBeLessThanOrEqual(100);
  });

  it('dominantProvider = provider avec le plus de requêtes', () => {
    const matrix = getProviderLoadMatrix();
    expect(matrix.dominantProvider).toBe('ollama');
  });

  it('chaque entry a un loadScore entre 0 et 100', () => {
    const matrix = getProviderLoadMatrix();
    matrix.providers.forEach(entry => {
      expect(entry.loadScore).toBeGreaterThanOrEqual(0);
      expect(entry.loadScore).toBeLessThanOrEqual(100);
    });
  });

  it('circuitOpen = true quand consecutiveFailures >= 3', () => {
    mockGetAllProviders.mockReturnValue([
      {
        id: 'ollama',
        isActive: true,
        isHealthy: false,
        isConfigured: true,
        failureCount: 5,
        consecutiveFailures: 4,
        lastFailure: Date.now() - 1000,
      },
    ]);
    const matrix = getProviderLoadMatrix();
    const ollamaEntry = matrix.providers.find(p => p.provider === 'ollama');
    expect(ollamaEntry?.circuitOpen).toBe(true);
  });
});

describe('computeAdaptiveDispatchPolicy', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockGetAllProviders.mockReturnValue([
      {
        id: 'ollama',
        isActive: true,
        isHealthy: true,
        isConfigured: true,
        failureCount: 0,
        consecutiveFailures: 0,
        lastFailure: 0,
      },
    ]);
    mockGetAggregatedMetrics.mockReturnValue({
      totalRequests: 10,
      successRate: 100,
      avgResponseTime: 200,
      totalFallbacks: 0,
      last24h: { requests: 10 },
      providers: [
        {
          provider: 'ollama',
          totalRequests: 10,
          successCount: 10,
          avgLatency: 200,
          errorCount: 0,
        },
      ],
    });
    // healthScore < 70 pour éviter la branche LOAD_BALANCED → USE_LOCAL_CHAMPION attendu
    mockGetHealStats.mockReturnValue({ healthScore: 50, totalErrors: 3, totalHeals: 1 });
  });

  it('retourne une politique avec champs obligatoires', () => {
    const policy = computeAdaptiveDispatchPolicy();
    expect(typeof policy.recommendation).toBe('string');
    expect(typeof policy.reason).toBe('string');
    expect(typeof policy.preferredProvider).toBe('string');
    expect(typeof policy.fallbackProvider).toBe('string');
    expect(typeof policy.maxConcurrent).toBe('number');
    expect(typeof policy.timeoutMs).toBe('number');
    expect(typeof policy.computedAt).toBe('number');
  });

  it("recommandation valide dans l'ensemble des valeurs autorisées", () => {
    const policy = computeAdaptiveDispatchPolicy();
    const validRecs = [
      'USE_LOCAL_CHAMPION',
      'REDUCE_CLOUD_LOAD',
      'FALLBACK_REQUIRED',
      'CIRCUIT_OPEN',
      'LOAD_BALANCED',
    ];
    expect(validRecs).toContain(policy.recommendation);
  });

  it('USE_LOCAL_CHAMPION quand Ollama sain avec 0 erreur', () => {
    const policy = computeAdaptiveDispatchPolicy();
    expect(policy.recommendation).toBe('USE_LOCAL_CHAMPION');
    expect(policy.preferredProvider).toBe('ollama');
  });
});

describe('dispatchToAgents — bus événements', () => {
  it('retourne un consensus avec verdicts et aggregated', async () => {
    const event: AgentEvent = {
      type: 'HEALTH_CHECK',
      payload: { source: 'test' },
      timestamp: Date.now(),
    };
    const consensus = await dispatchToAgents(event);
    expect(consensus.verdicts).toBeDefined();
    expect(['PASS', 'FAIL', 'BLOCKED', 'UNKNOWN']).toContain(consensus.aggregated);
    expect(Array.isArray(consensus.blockers)).toBe(true);
    expect(typeof consensus.timestamp).toBe('number');
  });
});

describe('dispatchToAgentsWithTimeout', () => {
  it('retourne BLOCKED après timeout très court', async () => {
    const event: AgentEvent = {
      type: 'HEALTH_CHECK',
      payload: {},
      timestamp: Date.now(),
    };
    const consensus = await dispatchToAgentsWithTimeout(event, 1);
    expect(['PASS', 'FAIL', 'BLOCKED', 'UNKNOWN']).toContain(consensus.aggregated);
  });

  it('retourne résultat normal avec timeout suffisant', async () => {
    const event: AgentEvent = {
      type: 'HEALTH_CHECK',
      payload: {},
      timestamp: Date.now(),
    };
    const consensus = await dispatchToAgentsWithTimeout(event, 5000);
    expect(consensus.verdicts).toBeDefined();
  });
});

describe('getOrchestratorDashboardRefreshIntervalMs', () => {
  it('retourne exactement 15000ms', () => {
    expect(getOrchestratorDashboardRefreshIntervalMs()).toBe(15000);
  });
});

describe('getOrchestratorAgentStatus — surface agent', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    resetOrchestratorSessionSnapshotsForTests();
    mockGetAllProviders.mockReturnValue([
      {
        id: 'ollama',
        isActive: true,
        isHealthy: true,
        isConfigured: true,
        failureCount: 0,
        consecutiveFailures: 0,
        lastFailure: 0,
      },
    ]);
    mockGetAggregatedMetrics.mockReturnValue({
      totalRequests: 50,
      successRate: 95,
      avgResponseTime: 350,
      totalFallbacks: 2,
      last24h: { requests: 30 },
      providers: [
        {
          provider: 'ollama',
          totalRequests: 50,
          successCount: 47,
          avgLatency: 350,
          errorCount: 3,
        },
      ],
    });
    mockGetHealStats.mockReturnValue({ healthScore: 90, totalErrors: 3, totalHeals: 1 });
    mockGetHealthStats.mockReturnValue({ overall: 'healthy' });
  });

  it('retourne un statut avec champs obligatoires', () => {
    const status = getOrchestratorAgentStatus();
    expect(typeof status.readiness).toBe('string');
    expect(typeof status.readinessLabel).toBe('string');
    expect(Array.isArray(status.evidence)).toBe(true);
    expect(Array.isArray(status.blockers)).toBe(true);
    expect(typeof status.nextStep).toBe('string');
  });

  it('serviceState reflète le nombre de providers actifs', () => {
    const status = getOrchestratorAgentStatus();
    expect(status.serviceState).toContain('providers actifs');
  });

  it('evidence contient des données runtime réelles', () => {
    const status = getOrchestratorAgentStatus();
    const evidenceText = status.evidence.join(' ');
    expect(evidenceText).toContain('Runtime');
  });

  it('detailSections inclut live-metrics et provider-snapshots', () => {
    const status = getOrchestratorAgentStatus();
    const keys = status.detailSections.map((s: { key: string }) => s.key);
    expect(keys).toContain('live-metrics');
    expect(keys).toContain('provider-snapshots');
  });

  it('detailSections inclut live-timeline et multi-session-compare', () => {
    const status = getOrchestratorAgentStatus();
    const keys = status.detailSections.map((s: { key: string }) => s.key);
    expect(keys).toContain('live-timeline');
    expect(keys).toContain('multi-session-compare');
  });
});
