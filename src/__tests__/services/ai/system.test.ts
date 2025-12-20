import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    resetAllProviders: vi.fn<() => Promise<void>>(),

    startMonitoring: vi.fn<() => void>(),
    getHealthReport: vi.fn<
      () => Promise<{ overall: 'healthy' | 'degraded' | 'critical'; score: number; alerts: unknown[] }>
    >(),
    clearAllAlerts: vi.fn<() => void>(),

    getAggregatedMetrics: vi.fn<() => {
      totalRequests: number;
      successRate: number;
      avgResponseTime: number;
      providers: Array<unknown>;
    }>(),
  };
});

vi.mock('../../../services/ai/orchestrator', () => {
  return {
    aiOrchestrator: {
      resetAllProviders: mocks.resetAllProviders,
    },
    askTitan: vi.fn(),
    streamTitan: vi.fn(),
    getAIStatus: vi.fn(),
  };
});

vi.mock('../../../services/ai/metricsEngine', () => {
  return {
    metricsEngine: {
      getAggregatedMetrics: mocks.getAggregatedMetrics,
    },
  };
});

vi.mock('../../../services/ai/autoHealEngine', () => {
  return {
    autoHealEngine: {},
  };
});

vi.mock('../../../services/ai/healthMonitor', () => {
  return {
    aiHealthMonitor: {
      startMonitoring: mocks.startMonitoring,
      getHealthReport: mocks.getHealthReport,
      clearAllAlerts: mocks.clearAllAlerts,
    },
  };
});

vi.mock('../../../services/ai/providers/titaneLocal', () => {
  return { titaneLocalProvider: {} };
});

vi.mock('../../../services/ai/providers/tauriChat', () => {
  return { tauriChatProvider: {} };
});

vi.mock('../../../services/ai/providers/gemini', () => {
  return { geminiProvider: {} };
});

vi.mock('../../../services/ai/providers/openai', () => {
  return { openaiProvider: {} };
});

vi.mock('../../../services/ai/providers/claude', () => {
  return { claudeProvider: {} };
});

vi.mock('../../../services/ai/providers/ollama', () => {
  return { ollamaProvider: {} };
});

describe('services/ai/system', () => {
  beforeEach(() => {
    mocks.resetAllProviders.mockReset();
    mocks.startMonitoring.mockReset();
    mocks.getHealthReport.mockReset();
    mocks.clearAllAlerts.mockReset();
    mocks.getAggregatedMetrics.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializeAISystem: startMonitoring quand explicitement activé', async () => {
    const { initializeAISystem } = await import('../../../services/ai/system');

    const result = await initializeAISystem({ enableHealthMonitoring: true });

    expect(mocks.startMonitoring).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        orchestrator: expect.any(Object),
        metrics: expect.any(Object),
        autoHeal: expect.any(Object),
        healthMonitor: expect.any(Object),
      })
    );
  });

  it('initializeAISystem: ne start pas monitoring quand explicitement désactivé', async () => {
    const { initializeAISystem } = await import('../../../services/ai/system');

    await initializeAISystem({ enableHealthMonitoring: false });

    expect(mocks.startMonitoring).not.toHaveBeenCalled();
  });

  it('quickHealthCheck: message healthy', async () => {
    mocks.getHealthReport.mockResolvedValue({ overall: 'healthy', score: 92, alerts: [] });

    const { quickHealthCheck } = await import('../../../services/ai/system');

    await expect(quickHealthCheck()).resolves.toEqual({
      status: 'healthy',
      score: 92,
      message: '✅ Système opérationnel (92/100)',
    });
  });

  it('quickHealthCheck: message degraded', async () => {
    mocks.getHealthReport.mockResolvedValue({ overall: 'degraded', score: 70, alerts: [1, 2] });

    const { quickHealthCheck } = await import('../../../services/ai/system');

    await expect(quickHealthCheck()).resolves.toEqual({
      status: 'degraded',
      score: 70,
      message: '⚠️ Système dégradé (70/100) - 2 alertes',
    });
  });

  it('quickHealthCheck: message critical', async () => {
    mocks.getHealthReport.mockResolvedValue({ overall: 'critical', score: 12, alerts: [1] });

    const { quickHealthCheck } = await import('../../../services/ai/system');

    await expect(quickHealthCheck()).resolves.toEqual({
      status: 'critical',
      score: 12,
      message: '🚨 Système critique (12/100) - 1 alertes',
    });
  });

  it('quickStats: mappe les métriques agrégées', async () => {
    mocks.getAggregatedMetrics.mockReturnValue({
      totalRequests: 123,
      successRate: 0.98,
      avgResponseTime: 321,
      providers: [{}, {}],
    });

    const { quickStats } = await import('../../../services/ai/system');

    await expect(quickStats()).resolves.toEqual({
      totalRequests: 123,
      successRate: 0.98,
      avgLatency: 321,
      providersCount: 2,
    });
  });

  it('quickFix: success quand reset + clear ok', async () => {
    mocks.resetAllProviders.mockResolvedValue(undefined);

    const { quickFix } = await import('../../../services/ai/system');

    await expect(quickFix()).resolves.toEqual({
      success: true,
      message: 'Réparation automatique effectuée avec succès',
      actions: ['✅ Providers réinitialisés', '✅ Alertes nettoyées'],
    });

    expect(mocks.resetAllProviders).toHaveBeenCalledTimes(1);
    expect(mocks.clearAllAlerts).toHaveBeenCalledTimes(1);
  });

  it('quickFix: failure quand reset échoue', async () => {
    mocks.resetAllProviders.mockRejectedValue(new Error('boom'));

    const { quickFix } = await import('../../../services/ai/system');

    const result = await quickFix();

    expect(result.success).toBe(false);
    expect(result.actions).toEqual([]);
    expect(result.message).toContain('Échec de la réparation: boom');
    expect(mocks.clearAllAlerts).not.toHaveBeenCalled();
  });
});
