import { beforeEach, describe, expect, it, vi } from 'vitest';

const secureInvoke = vi.hoisted(() => vi.fn());

vi.mock('@/lib/security', () => ({
  secureInvoke,
}));

describe('MemoryEngine persistent bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    window.localStorage.clear();
  });

  it('initializes its state from persistent memory instead of the legacy blob store', async () => {
    secureInvoke.mockResolvedValue({
      entries: [
        {
          id: 'persist-1',
          level: 'session',
          content_type: 'message',
          content: 'Souvenir de session',
          topic: 'general',
          importance: 3,
          tags: ['chat'],
          metadata: {
            created_at: 100,
            updated_at: 100,
            access_count: 1,
            source: 'chat_user',
            schema_version: 'v1',
          },
          source_entry_ids: [],
          version_history: [],
        },
        {
          id: 'persist-2',
          level: 'long_term',
          content_type: 'knowledge',
          title: 'Architecture TITANE',
          content: 'Connaissance durable',
          topic: 'technical',
          importance: 5,
          tags: ['architecture'],
          metadata: {
            created_at: 200,
            updated_at: 210,
            access_count: 4,
            source: 'manual_save',
            schema_version: 'v1',
          },
          confidence_score: 92,
          source_entry_ids: [],
          version_history: [],
        },
      ],
      total_count: 2,
      relevance_scores: {},
    });

    const { MemoryEngine } = await import('@/cognitive/memory/memoryEngine');

    await MemoryEngine.initialize();

    expect(secureInvoke).toHaveBeenCalledWith(
      'persistent_memory_read',
      expect.objectContaining({
        currentMode: 'default',
        levels: ['session', 'intermediate', 'long_term'],
        includeSummaries: false,
      })
    );

    const state = MemoryEngine.getState();
    expect(state.stats.totalMemories).toBe(2);
    expect(state.stats.longTermCount).toBe(1);
    expect(state.memories[0]?.id).toBe('persist-1');
    expect(state.memories[1]?.type).toBe('long-term');
  });

  it('routes recall through persistent memory filters used by active collectors', async () => {
    secureInvoke
      .mockResolvedValueOnce({
        entries: [],
        total_count: 0,
        relevance_scores: {},
      })
      .mockResolvedValueOnce({
        entries: [
          {
            id: 'persist-code-1',
            level: 'intermediate',
            content_type: 'code_snippet',
            content: 'Patch Rust memory pipeline',
            topic: 'coding',
            importance: 4,
            tags: ['patch', 'rust'],
            metadata: {
              created_at: 500,
              updated_at: 510,
              access_count: 2,
              source: 'manual_save',
              schema_version: 'v1',
            },
            source_entry_ids: [],
            version_history: [],
          },
        ],
        total_count: 1,
        relevance_scores: {
          'persist-code-1': 0.88,
        },
      });

    const { MemoryEngine } = await import('@/cognitive/memory/memoryEngine');

    const results = await MemoryEngine.recall('patch', {
      type: 'code' as any,
      limit: 5,
    });

    expect(secureInvoke).toHaveBeenNthCalledWith(
      2,
      'persistent_memory_read',
      expect.objectContaining({
        currentMode: 'default',
        query: 'patch',
        limit: 5,
        contentTypes: ['code_snippet', 'project_context', 'reference'],
      })
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.memory.id).toBe('persist-code-1');
    expect(results[0]?.relevance).toBeCloseTo(0.88, 2);
  });

  it('stores and forgets through persistent memory commands instead of the legacy blob store', async () => {
    secureInvoke
      .mockResolvedValueOnce({
        entries: [],
        total_count: 0,
        relevance_scores: {},
      })
      .mockResolvedValueOnce('persist-new-1')
      .mockResolvedValueOnce({
        entries: [
          {
            id: 'persist-new-1',
            level: 'intermediate',
            content_type: 'code_snippet',
            content: 'Nouveau souvenir outillé',
            topic: 'project',
            importance: 4,
            tags: ['patch'],
            metadata: {
              created_at: 800,
              updated_at: 810,
              access_count: 0,
              source: 'manual_save',
              schema_version: 'v1',
            },
            source_entry_ids: [],
            version_history: [],
          },
        ],
        total_count: 1,
        relevance_scores: {},
      })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        entries: [],
        total_count: 0,
        relevance_scores: {},
      });

    const { MemoryEngine } = await import('@/cognitive/memory/memoryEngine');

    const stored = await MemoryEngine.store(
      'Nouveau souvenir outillé',
      'procedural',
      'project-context',
      ['patch'],
      0.9
    );

    expect(secureInvoke).toHaveBeenNthCalledWith(
      2,
      'persistent_memory_write_entry',
      expect.objectContaining({
        level: 'intermediate',
        contentType: 'code_snippet',
        topic: 'project',
        tags: ['patch'],
      })
    );
    expect(stored.id).toBe('persist-new-1');

    const deleted = await MemoryEngine.forget('persist-new-1');

    expect(deleted).toBe(true);
    expect(secureInvoke).toHaveBeenNthCalledWith(4, 'persistent_memory_delete_entry', {
      entryId: 'persist-new-1',
    });
  });
});
