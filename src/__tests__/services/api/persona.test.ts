import { describe, it, expect, beforeEach, vi } from 'vitest';

const invokeWithRetryMock = vi.fn();

vi.mock('../../../lib/serviceInvoker', () => ({
  invokeWithRetry: invokeWithRetryMock,
  STANDARD_COMMAND_OPTIONS: { timeout: 30000, retries: 3 },
  FAST_COMMAND_OPTIONS: { timeout: 5000, retries: 2 },
}));

describe('personaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('initialize() devrait passer config=null si non fourni', async () => {
    const fakeState = {
      id: 'p-1',
      name: 'Titane',
      archetype: 'scientist',
      activeMultipliers: {},
      moodState: { energy: 1, focus: 1, creativity: 1 },
      timestamp: new Date().toISOString(),
    };

    invokeWithRetryMock.mockResolvedValueOnce(fakeState);

    const { personaService } = await import('../../../services/api/persona');

    await expect(personaService.initialize()).resolves.toEqual(fakeState);
    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'persona_initialize',
      { config: null },
      expect.objectContaining({ context: 'Persona' })
    );
  });

  it('getMultipliers() devrait retourner des multiplicateurs neutres sur erreur', async () => {
    invokeWithRetryMock.mockRejectedValueOnce(new Error('validation failed'));

    const { personaService } = await import('../../../services/api/persona');

    await expect(personaService.getMultipliers()).resolves.toEqual({
      creativity: 1.0,
      analytical: 1.0,
      empathy: 1.0,
      efficiency: 1.0,
      risk_taking: 1.0,
    });
  });

  it("adaptToContext() devrait fallback vers getMultipliers() si l'appel échoue", async () => {
    invokeWithRetryMock.mockImplementation((command: string) => {
      if (command === 'persona_adapt_to_context') {
        return Promise.reject(new Error('validation failed'));
      }
      if (command === 'persona_get_multipliers') {
        return Promise.resolve({
          creativity: 2,
          analytical: 1,
          empathy: 1,
          efficiency: 1,
          risk_taking: 1,
        });
      }
      throw new Error(`unexpected command: ${command}`);
    });

    const { personaService } = await import('../../../services/api/persona');

    await expect(
      personaService.adaptToContext({ taskType: 'coding', urgency: 0.5, complexity: 0.8 })
    ).resolves.toEqual({
      creativity: 2,
      analytical: 1,
      empathy: 1,
      efficiency: 1,
      risk_taking: 1,
    });

    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'persona_adapt_to_context',
      { context: { taskType: 'coding', urgency: 0.5, complexity: 0.8 } },
      expect.objectContaining({ context: 'Persona' })
    );

    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'persona_get_multipliers',
      {},
      expect.objectContaining({ context: 'Persona' })
    );
  });

  it("listPersonas() devrait retourner [] en cas d'erreur", async () => {
    invokeWithRetryMock.mockRejectedValueOnce(new Error('validation failed'));

    const { personaService } = await import('../../../services/api/persona');

    await expect(personaService.listPersonas()).resolves.toEqual([]);
  });
});
