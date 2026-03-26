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

vi.mock('@/services/api/memory', () => ({
  memoryService: memoryServiceMock,
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  }),
}));

describe('memoryIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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
});
