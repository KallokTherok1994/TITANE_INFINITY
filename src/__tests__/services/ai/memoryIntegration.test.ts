import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryServiceMock = vi.hoisted(() => ({
  getActiveProjects: vi.fn(),
  getRecentDecisions: vi.fn(),
  getKnowledge: vi.fn(),
  getActiveRituals: vi.fn(),
  getTimeline: vi.fn(),
  saveChatInteraction: vi.fn(),
  saveStructuredEntry: vi.fn(),
}));

const unifiedMemoryCreateMock = vi.hoisted(() => vi.fn());
const unifiedMemoryInstanceMock = vi.hoisted(() => ({
  createMemory: vi.fn(),
}));

vi.mock('@/services/api/memory', () => ({
  memoryService: memoryServiceMock,
}));

vi.mock('@/services/unified', () => ({
  createUnifiedMemory: unifiedMemoryCreateMock,
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('memoryIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    localStorage.clear();
    unifiedMemoryCreateMock.mockResolvedValue(unifiedMemoryInstanceMock);
  });

  it('clears cached context after saving an interaction', async () => {
    memoryServiceMock.getActiveProjects
      .mockResolvedValueOnce([{ id: 'project-a', title: 'Atlas' }])
      .mockResolvedValueOnce([{ id: 'project-b', title: 'Helios' }]);
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await expect(
      memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        activeProjects: [{ id: 'project-a', title: 'Atlas' }],
      })
    );

    await expect(
      memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        activeProjects: [{ id: 'project-a', title: 'Atlas' }],
      })
    );

    await memoryIntegration.saveInteraction({
      userMessage: 'ping',
      aiResponse: 'pong',
      mode: 'default',
    });

    await expect(
      memoryIntegration.loadContext({
        includeProjects: true,
        includeDecisions: false,
        includeKnowledge: false,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        activeProjects: [{ id: 'project-b', title: 'Helios' }],
      })
    );

    expect(memoryServiceMock.getActiveProjects).toHaveBeenCalledTimes(2);
  });

  it('clears cached context after saving a structured memory entry', async () => {
    memoryServiceMock.getKnowledge
      .mockResolvedValueOnce([{ id: 'k1', title: 'Ancienne connaissance' }])
      .mockResolvedValueOnce([{ id: 'k2', title: 'Nouvelle connaissance' }]);
    memoryServiceMock.saveStructuredEntry.mockResolvedValue(undefined);

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.loadContext({
      includeProjects: false,
      includeDecisions: false,
      includeKnowledge: true,
      includeRituals: false,
      includeTimeline: false,
    });

    await memoryIntegration.saveStructuredEntry({
      templateId: 'season_summary',
      target: 'long',
      data: { season: 'Stabilisation' },
    });

    await expect(
      memoryIntegration.loadContext({
        includeProjects: false,
        includeDecisions: false,
        includeKnowledge: true,
        includeRituals: false,
        includeTimeline: false,
      })
    ).resolves.toEqual(
      expect.objectContaining({
        relevantKnowledge: [{ id: 'k2', title: 'Nouvelle connaissance' }],
      })
    );

    expect(memoryServiceMock.getKnowledge).toHaveBeenCalledTimes(2);
  });

  it('dual-writes interactions to UnifiedMemory only when hybrid shadow flag is enabled', async () => {
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);

    localStorage.setItem('titane_hybrid_memory_shadow_write_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.saveInteraction({
      userMessage: 'Question utilisateur',
      aiResponse: 'Réponse assistant',
      mode: 'default',
      emotionState: {
        valence: 0.2,
        activation: 0.3,
        dominant_emotion: 'calm',
      },
    });

    expect(memoryServiceMock.saveChatInteraction).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryCreateMock).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenCalledTimes(2);
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: 'conversation',
        details: 'Question utilisateur',
        tags: expect.arrayContaining(['hybrid-shadow-write', 'user', 'default']),
      })
    );
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'conversation',
        details: 'Réponse assistant',
        tags: expect.arrayContaining(['hybrid-shadow-write', 'assistant', 'calm']),
      })
    );
  });

  it('does not dual-write interactions when hybrid shadow flag is disabled', async () => {
    memoryServiceMock.saveChatInteraction.mockResolvedValue(undefined);

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.saveInteraction({
      userMessage: 'Question utilisateur',
      aiResponse: 'Réponse assistant',
      mode: 'default',
    });

    expect(memoryServiceMock.saveChatInteraction).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryCreateMock).not.toHaveBeenCalled();
    expect(unifiedMemoryInstanceMock.createMemory).not.toHaveBeenCalled();
  });

  it('dual-writes structured entries to UnifiedMemory when hybrid shadow flag is enabled', async () => {
    memoryServiceMock.saveStructuredEntry.mockResolvedValue(undefined);

    localStorage.setItem('titane_hybrid_memory_shadow_write_enabled', 'true');

    const { memoryIntegration } = await import('@/services/ai/memoryIntegration');

    await memoryIntegration.saveStructuredEntry({
      templateId: 'decision_record',
      target: 'long',
      timestamp: '2026-04-18T09:00:00.000Z',
      data: {
        title: 'Décision critique',
        summary: 'Basculer en shadow-write',
      },
    });

    expect(memoryServiceMock.saveStructuredEntry).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryCreateMock).toHaveBeenCalledTimes(1);
    expect(unifiedMemoryInstanceMock.createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'decision',
        summary: 'Décision critique',
        tags: expect.arrayContaining([
          'hybrid-shadow-write',
          'structured-entry',
          'decision_record',
          'long',
        ]),
      })
    );
  });
});
