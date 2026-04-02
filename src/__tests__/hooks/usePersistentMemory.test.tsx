import { act, renderHook, waitFor } from '@/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePersistentMemory } from '@/hooks/usePersistentMemory';
import { tauriClient } from '@/lib/tauriClient';

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    persistentMemoryRead: vi.fn(),
    persistentMemoryGetBundles: vi.fn(),
    persistentMemoryGetStats: vi.fn(),
    persistentMemoryWriteEntry: vi.fn(),
    persistentMemoryPromoteEntry: vi.fn(),
    persistentMemoryArchiveEntry: vi.fn(),
    persistentMemoryDeleteEntry: vi.fn(),
    persistentMemoryCreateSummary: vi.fn(),
    persistentMemoryCreateBundle: vi.fn(),
    persistentMemoryAddToBundle: vi.fn(),
    persistentMemoryExport: vi.fn(),
    persistentMemoryGetContext: vi.fn(),
  },
}));

describe('usePersistentMemory persistence truth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(tauriClient.persistentMemoryGetBundles).mockResolvedValue([]);
    vi.mocked(tauriClient.persistentMemoryGetStats).mockResolvedValue({
      countByLevel: { session: 1, intermediate: 0, long_term: 0 },
      sizeByLevel: { session: 128, intermediate: 0, long_term: 0 },
    });
  });

  it('starts in loading mode until the first persistent read resolves', async () => {
    let resolveRead: ((value: unknown) => void) | null = null;
    vi.mocked(tauriClient.persistentMemoryRead).mockImplementation(
      () =>
        new Promise(resolve => {
          resolveRead = resolve;
        }) as Promise<any>
    );

    const { result } = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: true,
        projectId: 'test-loading-bootstrap',
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.lastUpdate).toBeNull();

    await act(async () => {
      resolveRead?.({ entries: [], summaries: [] });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('forces a fresh persistent read after saveEntry instead of reusing stale cache', async () => {
    vi.mocked(tauriClient.persistentMemoryRead)
      .mockResolvedValueOnce({
        entries: [
          {
            id: 'entry-1',
            level: 'session',
            topic: 'general',
            importance: 3,
            contentType: 'message',
            content: 'Première mémoire',
            tags: [],
            metadata: {
              createdAt: 100,
              accessCount: 0,
              updatedAt: 100,
              source: 'chat_user',
              schemaVersion: '1.0.0',
            },
          },
        ],
        summaries: [],
      })
      .mockResolvedValueOnce({
        entries: [
          {
            id: 'entry-1',
            level: 'session',
            topic: 'general',
            importance: 3,
            contentType: 'message',
            content: 'Première mémoire',
            tags: [],
            metadata: {
              createdAt: 100,
              accessCount: 0,
              updatedAt: 100,
              source: 'chat_user',
              schemaVersion: '1.0.0',
            },
          },
          {
            id: 'entry-2',
            level: 'session',
            topic: 'general',
            importance: 3,
            contentType: 'message',
            content: 'Seconde mémoire',
            tags: [],
            metadata: {
              createdAt: 200,
              accessCount: 0,
              updatedAt: 200,
              source: 'chat_user',
              schemaVersion: '1.0.0',
            },
          },
        ],
        summaries: [],
      });
    vi.mocked(tauriClient.persistentMemoryWriteEntry).mockResolvedValue('entry-2');

    const { result } = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: true,
        projectId: 'test-save-refresh',
      })
    );

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    await act(async () => {
      await result.current.saveEntry('Seconde mémoire', { level: 'session' });
    });

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });

    expect(tauriClient.persistentMemoryRead).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.clearCache();
    });
  });

  it('reuses hook projectId when saveEntry is called without an explicit projectId override', async () => {
    vi.mocked(tauriClient.persistentMemoryRead).mockResolvedValue({
      entries: [],
      summaries: [],
    });
    vi.mocked(tauriClient.persistentMemoryWriteEntry).mockResolvedValue('entry-1');

    const { result } = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: false,
        projectId: 'proj-omega',
      })
    );

    await waitFor(() => {
      expect(tauriClient.persistentMemoryRead).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.saveEntry('Mémoire projet');
    });

    expect(tauriClient.persistentMemoryWriteEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Mémoire projet',
        projectId: 'proj-omega',
        modeId: 'admin',
      })
    );
  });

  it('normalizes snake_case backend payloads before exposing persistent entries and stats', async () => {
    vi.mocked(tauriClient.persistentMemoryGetBundles).mockResolvedValue([
      {
        id: 'bundle-1',
        name: 'Bundle mémoire',
        description: 'Regroupe les faits clés',
        topic: 'general',
        entry_ids: ['entry-1'],
        tags: ['memoire'],
        created_at: 10,
        updated_at: 20,
        created_by: 'system',
      },
    ]);
    vi.mocked(tauriClient.persistentMemoryGetStats).mockResolvedValue({
      count_by_level: { session: 0, intermediate: 1, long_term: 0 },
      count_by_topic: { general: 1 },
      count_by_type: { message: 1 },
      total_size: 128,
      size_by_level: { session: 0, intermediate: 128, long_term: 0 },
      last_write: 100,
      last_read: 90,
      summary_count: 1,
      bundle_count: 1,
      health: {
        status: 'healthy',
        corrupted_files: 0,
        last_integrity_check: 100,
        disk_space_percent: 100,
        encryption_active: true,
        last_backup: 0,
      },
    });
    vi.mocked(tauriClient.persistentMemoryRead).mockResolvedValue({
      entries: [
        {
          id: 'entry-1',
          level: 'intermediate',
          topic: 'general',
          importance: 3,
          content_type: 'message',
          content: 'Mémoire backend snake_case',
          tags: ['memoire'],
          status: 'active',
          metadata: {
            created_at: 100,
            updated_at: 100,
            access_count: 2,
            source: 'chat_user',
            schema_version: '1.0.0',
          },
          source_entry_ids: [],
          relevance_score: 0.9,
        },
      ],
      summaries: [
        {
          id: 'summary-1',
          title: 'Résumé mémoire',
          content: 'Une entrée',
          topic: 'general',
          period_start: 1,
          period_end: 2,
          source_count: 1,
          source_ids: ['entry-1'],
          keywords: ['memoire'],
          aggregated_importance: 3,
          generated_at: 3,
          summary_type: 'topic',
        },
      ],
      total_count: 1,
      query_time: 4,
      relevance_scores: {
        'entry-1': 0.9,
      },
    });

    const { result } = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: false,
        levels: ['intermediate'],
      })
    );

    await waitFor(() => {
      expect(result.current.entries).toHaveLength(1);
    });

    expect(result.current.entries[0]).toMatchObject({
      id: 'entry-1',
      level: 'intermediate',
      contentType: 'message',
      metadata: expect.objectContaining({
        createdAt: 100,
        accessCount: 2,
      }),
    });
    expect(result.current.stats?.countByLevel.intermediate).toBe(1);
    expect(result.current.stats?.summaryCount).toBe(1);
    expect(result.current.bundles[0]).toMatchObject({
      id: 'bundle-1',
      entryIds: ['entry-1'],
      createdAt: 10,
    });
    expect(result.current.summaries[0]).toMatchObject({
      id: 'summary-1',
      generatedAt: 3,
      sourceCount: 1,
    });
  });

  it('does not reuse a cached snapshot from another memory scope', async () => {
    vi.mocked(tauriClient.persistentMemoryRead)
      .mockResolvedValueOnce({
        entries: [],
        summaries: [],
      })
      .mockResolvedValueOnce({
        entries: [
          {
            id: 'entry-admin-1',
            level: 'intermediate',
            topic: 'coding',
            importance: 4,
            contentType: 'knowledge',
            content: 'Memoire admin visible',
            tags: ['dev'],
            metadata: {
              createdAt: 200,
              accessCount: 1,
              updatedAt: 200,
              source: 'chat_assistant',
              schemaVersion: '1.0.0',
            },
          },
        ],
        summaries: [],
      });

    const first = renderHook(() =>
      usePersistentMemory({
        modeId: 'default',
        enableCache: true,
        projectId: 'test-scope-default',
      })
    );

    await waitFor(() => {
      expect(tauriClient.persistentMemoryRead).toHaveBeenCalledTimes(1);
    });

    expect(first.result.current.entries).toHaveLength(0);

    const second = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: true,
        projectId: 'test-scope-admin',
      })
    );

    await waitFor(() => {
      expect(second.result.current.entries).toHaveLength(1);
    });

    expect(tauriClient.persistentMemoryRead).toHaveBeenCalledTimes(2);

    act(() => {
      second.result.current.clearCache();
    });
    first.unmount();
    second.unmount();
  });

  it('forces a fresh read when backend lastWrite is newer than the cached snapshot', async () => {
    vi.mocked(tauriClient.persistentMemoryRead)
      .mockResolvedValueOnce({
        entries: [],
        summaries: [],
      })
      .mockResolvedValueOnce({
        entries: [
          {
            id: 'entry-fresh-1',
            level: 'intermediate',
            topic: 'general',
            importance: 3,
            contentType: 'summary',
            content: 'Memoire fraichement persistante',
            tags: ['memoire'],
            metadata: {
              createdAt: 300,
              accessCount: 0,
              updatedAt: 300,
              source: 'chat_user',
              schemaVersion: '1.0.0',
            },
          },
        ],
        summaries: [],
      });
    vi.mocked(tauriClient.persistentMemoryGetStats)
      .mockResolvedValueOnce({
        countByLevel: { session: 0, intermediate: 0, long_term: 0 },
        sizeByLevel: { session: 0, intermediate: 0, long_term: 0 },
        lastWrite: 10,
      })
      .mockResolvedValueOnce({
        countByLevel: { session: 0, intermediate: 1, long_term: 0 },
        sizeByLevel: { session: 0, intermediate: 128, long_term: 0 },
        lastWrite: 20,
      })
      .mockResolvedValueOnce({
        countByLevel: { session: 0, intermediate: 1, long_term: 0 },
        sizeByLevel: { session: 0, intermediate: 128, long_term: 0 },
        lastWrite: 20,
      });

    const first = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: true,
        projectId: 'test-backend-lastwrite',
      })
    );

    await waitFor(() => {
      expect(tauriClient.persistentMemoryRead).toHaveBeenCalledTimes(1);
    });

    expect(first.result.current.entries).toHaveLength(0);

    const second = renderHook(() =>
      usePersistentMemory({
        modeId: 'admin',
        enableCache: true,
        projectId: 'test-backend-lastwrite',
      })
    );

    await waitFor(() => {
      expect(second.result.current.entries).toHaveLength(1);
    });

    expect(tauriClient.persistentMemoryRead).toHaveBeenCalledTimes(2);

    act(() => {
      second.result.current.clearCache();
    });
    first.unmount();
    second.unmount();
  });
});
