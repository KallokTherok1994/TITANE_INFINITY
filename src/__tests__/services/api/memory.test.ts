import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeWithRetryMock = vi.fn();

vi.mock('@/lib/serviceInvoker', () => ({
  invokeWithRetry: invokeWithRetryMock,
  STANDARD_COMMAND_OPTIONS: { timeout: 30000, retries: 3 },
  FAST_COMMAND_OPTIONS: { timeout: 5000, retries: 2 },
}));

describe('memoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('routes structured entries to persistent memory writes instead of legacy memory_save_entry', async () => {
    invokeWithRetryMock.mockResolvedValue(undefined);

    const { memoryService } = await import('@/services/api/memory');

    await memoryService.saveStructuredEntry({
      templateId: 'decision',
      target: 'long',
      data: {
        title: 'Stabiliser le routeur',
        choice: 'Conserver One Door',
      },
      tags: ['router', 'policy'],
      source: 'test',
    });

    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'persistent_memory_write_entry',
      expect.objectContaining({
        level: 'long_term',
        contentType: 'decision',
        topic: 'decisions',
        importance: 5,
        title: 'Stabiliser le routeur',
        tags: expect.arrayContaining(['decision', 'long', 'router', 'policy']),
      }),
      expect.objectContaining({ context: 'Memory' })
    );

    expect(invokeWithRetryMock).not.toHaveBeenCalledWith(
      'memory_save_entry',
      expect.anything(),
      expect.anything()
    );
  });

  it('routes chat interactions to persistent memory writes instead of legacy memory_save_chat_interaction', async () => {
    invokeWithRetryMock.mockResolvedValue(undefined);

    const { memoryService } = await import('@/services/api/memory');

    await memoryService.saveChatInteraction({
      userMessage: 'Rappelle-toi de ORION-482-LICHEN',
      aiResponse: "C'est note pour la suite",
      mode: 'default',
      emotionState: {
        valence: 0.6,
        activation: 0.4,
        dominant_emotion: 'focus',
      },
      timestamp: '2026-03-25T18:45:00.000Z',
      metadata: {
        projectId: 'orion-project',
      },
    });

    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'persistent_memory_write_entry',
      expect.objectContaining({
        level: 'session',
        contentType: 'message',
        topic: 'general',
        importance: 3,
        title: 'Rappelle-toi de ORION-482-LICHEN',
        modeId: 'default',
        projectId: 'orion-project',
        tags: expect.arrayContaining(['chat-interaction', 'default', 'focus']),
        content: expect.stringContaining('Utilisateur: Rappelle-toi de ORION-482-LICHEN'),
      }),
      expect.objectContaining({ context: 'Memory' })
    );

    expect(invokeWithRetryMock).not.toHaveBeenCalledWith(
      'memory_save_chat_interaction',
      expect.anything(),
      expect.anything()
    );
  });

  it('clears cached memory core reads after a structured persistent write', async () => {
    invokeWithRetryMock
      .mockResolvedValueOnce([{ id: 'project-1', title: 'Atlas' }])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 'project-2', title: 'Helios' }]);

    const { memoryService } = await import('@/services/api/memory');

    await expect(memoryService.getActiveProjects(5)).resolves.toEqual([
      { id: 'project-1', title: 'Atlas' },
    ]);
    await expect(memoryService.getActiveProjects(5)).resolves.toEqual([
      { id: 'project-1', title: 'Atlas' },
    ]);

    await memoryService.saveStructuredEntry({
      templateId: 'project_snapshot',
      target: 'medium',
      data: {
        project: 'Helios',
        phase: 'S',
      },
    });

    await expect(memoryService.getActiveProjects(5)).resolves.toEqual([
      { id: 'project-2', title: 'Helios' },
    ]);

    expect(
      invokeWithRetryMock.mock.calls.filter(
        call => call[0] === 'memory_get_active_projects'
      )
    ).toHaveLength(2);
  });
});
