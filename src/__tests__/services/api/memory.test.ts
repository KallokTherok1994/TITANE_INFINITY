import { beforeEach, describe, expect, it, vi } from 'vitest';

const invokeWithRetryMock = vi.fn();
const isTauriRuntimeAvailableMock = vi.fn(() => true);

vi.mock('@/lib/serviceInvoker', () => ({
  invokeWithRetry: invokeWithRetryMock,
  STANDARD_COMMAND_OPTIONS: { timeout: 30000, retries: 3 },
  FAST_COMMAND_OPTIONS: { timeout: 5000, retries: 2 },
}));

vi.mock('@/utils/tauriProtector', () => ({
  isTauriRuntimeAvailable: isTauriRuntimeAvailableMock,
}));

const getBundledKbEntriesMock = vi.fn();

vi.mock('@/services/api/defaultKnowledgeBase', () => ({
  getAllEntries: getBundledKbEntriesMock,
}));

describe('memoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    isTauriRuntimeAvailableMock.mockReturnValue(true);
    getBundledKbEntriesMock.mockResolvedValue([]);
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

    // Phase 1: saveChatInteraction now uses long_term + importance:4 + chat-permanent tag
    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'persistent_memory_write_entry',
      expect.objectContaining({
        level: 'long_term',
        contentType: 'message',
        topic: 'general',
        importance: 4,
        title: 'Rappelle-toi de ORION-482-LICHEN',
        modeId: 'default',
        projectId: 'orion-project',
        tags: expect.arrayContaining(['chat-interaction', 'default', 'focus', 'chat-permanent']),
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

  // ─────────────────────────────────────────────────────────────────
  // Phase 3: getKnowledge() bundled fallback — Rule 16 coverage
  // ─────────────────────────────────────────────────────────────────

  it('getKnowledge() returns bundled KB entries mapped as KnowledgeEntry[] when Tauri is unavailable', async () => {
    isTauriRuntimeAvailableMock.mockReturnValue(false);
    getBundledKbEntriesMock.mockResolvedValue([
      {
        id: 'system_architecture',
        category: 'system_architecture',
        version: 'v30.0.0',
        description: 'Architecture cœur TITANE∞',
        content: { rings: 4 },
      },
      {
        id: 'kevin_owner_profile_v30',
        category: 'kevin_owner_profile_v30',
        version: 'v30.0.0',
        description: 'Profil propriétaire Kevin',
        content: { owner: 'Kevin Thibault' },
      },
    ]);

    const { memoryService } = await import('@/services/api/memory');
    const result = await memoryService.getKnowledge(10);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'system_architecture',
      category: 'system_architecture',
      source: 'bundled_kb',
      relevance: 0.8,
    });
    expect(result[0]?.title).toBe('Architecture cœur TITANE∞');
    // Tauri IPC must NOT be called — bundled path only
    expect(invokeWithRetryMock).not.toHaveBeenCalled();
  });

  it('getKnowledge() respects the limit parameter when falling back to bundled entries', async () => {
    isTauriRuntimeAvailableMock.mockReturnValue(false);
    getBundledKbEntriesMock.mockResolvedValue(
      Array.from({ length: 50 }, (_, i) => ({
        id: `entry_${i}`,
        category: `cat_${i}`,
        version: 'v30.0.0',
        description: `Entry ${i}`,
        content: {},
      }))
    );

    const { memoryService } = await import('@/services/api/memory');
    const result = await memoryService.getKnowledge(5);

    expect(result).toHaveLength(5);
  });

  it('getKnowledge() returns [] when Tauri is unavailable and getBundledKbEntries rejects', async () => {
    isTauriRuntimeAvailableMock.mockReturnValue(false);
    getBundledKbEntriesMock.mockRejectedValue(new Error('bundled glob failed'));

    const { memoryService } = await import('@/services/api/memory');
    const result = await memoryService.getKnowledge(10);

    expect(result).toEqual([]);
  });

  it('getKnowledge() calls Tauri IPC when runtime is available', async () => {
    isTauriRuntimeAvailableMock.mockReturnValue(true);
    invokeWithRetryMock.mockResolvedValue([{ id: 'k1', title: 'Knowledge 1' }]);

    const { memoryService } = await import('@/services/api/memory');
    const result = await memoryService.getKnowledge(10);

    expect(result).toEqual([{ id: 'k1', title: 'Knowledge 1' }]);
    expect(invokeWithRetryMock).toHaveBeenCalledWith(
      'memory_get_knowledge',
      { limit: 10 },
      expect.objectContaining({ context: 'Memory' })
    );
    // Bundled fallback must NOT be called
    expect(getBundledKbEntriesMock).not.toHaveBeenCalled();
  });
});
