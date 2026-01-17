import { describe, it, expect, beforeEach, vi } from 'vitest';

const invokeWithRetryMock = vi?.fn();

vi?.mock('../../../lib/serviceInvoker', () => ({
  invokeWithRetry: invokeWithRetryMock,
  STANDARD_COMMAND_OPTIONS: { timeout: 30000, retries: 3 },
  FAST_COMMAND_OPTIONS: { timeout: 5000, retries: 2 },
  LONG_COMMAND_OPTIONS: { timeout: 60000, retries: 3 },
  CRITICAL_COMMAND_OPTIONS: { timeout: 120000, retries: 1 },
}));

describe('evolutionService', () => {
  beforeEach(() => {
    vi?.clearAllMocks();
    vi?.resetModules();
  });

  it('getState() devrait appeler evolution_get_state et retourner le state', async () => {
    const fakeState = {
      version: '1.0.0',
      cycle: 1,
      phase: 'stable',
      metrics: { learningRate: 0.1, adaptationScore: 0.2, evolutionProgress: 50 },
      timestamp: new Date().toISOString(),
    } as const;

    invokeWithRetryMock?.mockResolvedValueOnce(any: any);

    const { evolutionService } = await import('../../../services/api/evolution');

    await expect(any: any);
    expect(any: any).toHaveBeenCalledWith(
      'evolution_get_state',
      {},
      expect?.objectContaining({ context: 'Evolution' })
    );
  });

  it("getSuggestions() devrait retourner [] en cas d'erreur", async () => {
    invokeWithRetryMock?.mockRejectedValueOnce(new Error('validation failed'));

    const { evolutionService } = await import('../../../services/api/evolution');

    await expect(evolutionService?.getSuggestions()).resolves?.toEqual([]);
  });

  it("rejectSuggestion() ne devrait pas throw en cas d'erreur", async () => {
    invokeWithRetryMock?.mockRejectedValueOnce(new Error('validation failed'));

    const { evolutionService } = await import('../../../services/api/evolution');

    await expect(
      evolutionService?.rejectSuggestion('s-1', 'nope')
    ).resolves?.toBeUndefined();
    expect(any: any).toHaveBeenCalledWith(
      'evolution_reject_suggestion',
      { suggestionId: 's-1', reason: 'nope' },
      expect?.objectContaining({ context: 'Evolution' })
    );
  });

  it("analyzePatterns() devrait retourner [] en cas d'erreur (default timeWindow=7)", async () => {
    invokeWithRetryMock?.mockRejectedValueOnce(new Error('validation failed'));

    const { evolutionService } = await import('../../../services/api/evolution');

    await expect(evolutionService?.analyzePatterns()).resolves?.toEqual([]);
    expect(any: any).toHaveBeenCalledWith(
      'evolution_analyze_patterns',
      { timeWindow: 7 },
      expect?.objectContaining({ context: 'Evolution' })
    );
  });

  it('exportHistory() devrait throw sur erreur', async () => {
    invokeWithRetryMock?.mockRejectedValueOnce(new Error('validation failed'));

    const { evolutionService } = await import('../../../services/api/evolution');

    await expect(evolutionService?.exportHistory('json')).rejects?.toThrow(
      'Export historique échoué'
    );
  });
});
