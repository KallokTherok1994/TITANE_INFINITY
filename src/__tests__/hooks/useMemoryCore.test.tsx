import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMemoryCore } from '@/hooks/useMemoryCore';

const mockTauriClient = vi.hoisted(() => ({
  persistentMemoryRead: vi.fn(),
  persistentMemoryWriteEntry: vi.fn(),
  persistentMemoryDeleteEntry: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: mockTauriClient,
}));

describe('useMemoryCore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads entries from persistent memory instead of legacy memory_get_state', async () => {
    mockTauriClient.persistentMemoryRead.mockResolvedValue({
      entries: [
        {
          id: 'ltm-1',
          level: 'long_term',
          content_type: 'knowledge',
          content: 'Connaissance durable',
          topic: 'technical',
          tags: ['architecture'],
          metadata: {
            created_at: 123,
            updated_at: 124,
          },
        },
      ],
      total_count: 1,
      query_time: 1,
      relevance_scores: {},
    });

    const { result } = renderHook(() => useMemoryCore());

    await act(async () => {
      await result.current.loadEntries();
    });

    expect(mockTauriClient.persistentMemoryRead).toHaveBeenCalledWith(
      expect.objectContaining({
        currentMode: 'default',
        levels: ['session', 'intermediate', 'long_term'],
      })
    );
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      id: 'ltm-1',
      content: 'Connaissance durable',
      encrypted: true,
    });
  });

  it('saves entries through persistent memory writes', async () => {
    mockTauriClient.persistentMemoryWriteEntry.mockResolvedValue('session-1');
    mockTauriClient.persistentMemoryRead.mockResolvedValue({
      entries: [
        {
          id: 'session-1',
          level: 'session',
          content_type: 'message',
          content: 'Nouveau souvenir',
          topic: 'general',
          tags: ['memory-core'],
          metadata: {
            created_at: 200,
            updated_at: 201,
          },
        },
      ],
      total_count: 1,
      query_time: 1,
      relevance_scores: {},
    });

    const { result } = renderHook(() => useMemoryCore());

    await act(async () => {
      await result.current.saveEntry('Nouveau souvenir');
    });

    expect(mockTauriClient.persistentMemoryWriteEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'session',
        contentType: 'message',
        content: 'Nouveau souvenir',
      })
    );
    expect(result.current.entries[0]?.id).toBe('session-1');
  });

  it('clears memory through persistent entry deletion', async () => {
    mockTauriClient.persistentMemoryRead.mockResolvedValue({
      entries: [
        { id: 'entry-1', level: 'session', metadata: {} },
        { id: 'entry-2', level: 'long_term', metadata: {} },
      ],
      total_count: 2,
      query_time: 1,
      relevance_scores: {},
    });
    mockTauriClient.persistentMemoryDeleteEntry.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMemoryCore());

    await act(async () => {
      await result.current.clearMemory();
    });

    expect(mockTauriClient.persistentMemoryDeleteEntry).toHaveBeenCalledTimes(2);
    expect(mockTauriClient.persistentMemoryDeleteEntry).toHaveBeenCalledWith({
      entryId: 'entry-1',
    });
    expect(mockTauriClient.persistentMemoryDeleteEntry).toHaveBeenCalledWith({
      entryId: 'entry-2',
    });
    expect(result.current.entries).toHaveLength(0);
  });
});
