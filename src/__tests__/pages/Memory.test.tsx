import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Memory } from '@/pages/Memory';

const { persistentMemoryGetStats, memorySectionMock } = vi.hoisted(() => ({
  persistentMemoryGetStats: vi.fn(),
  memorySectionMock: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    persistentMemoryGetStats,
  },
}));

vi.mock('@/components/sections', () => ({
  MemorySection: (props: {
    stats: { memoryLongTerm: number };
    conversationId?: string;
  }) => {
    memorySectionMock(props);
    return (
      <div data-testid="memory-section-proxy">
        {props.conversationId ?? 'no-conversation'}|{props.stats.memoryLongTerm}
      </div>
    );
  },
}));

describe('Memory page route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('uses persistent stats and canonical conversation id', async () => {
    persistentMemoryGetStats.mockResolvedValue({
      countByLevel: {
        session: 2,
        intermediate: 3,
        long_term: 7,
      },
    });
    window.localStorage.setItem('titane_active_conversation_id', 'conv-memory-route');

    render(<Memory />);

    await waitFor(() => {
      expect(memorySectionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 'conv-memory-route',
          stats: expect.objectContaining({
            memoryShortTerm: 2,
            memoryMidTerm: 3,
            memoryLongTerm: 7,
          }),
        })
      );
    });

    expect(screen.getByTestId('memory-section-proxy')).toHaveTextContent(
      'conv-memory-route|7'
    );
  });

  it('falls back to zero counts when stats loading fails', async () => {
    persistentMemoryGetStats.mockRejectedValue(new Error('stats unavailable'));

    render(<Memory />);

    await waitFor(() => {
      expect(memorySectionMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            memoryShortTerm: 0,
            memoryMidTerm: 0,
            memoryLongTerm: 0,
          }),
        })
      );
    });
  });

  it('normalizes snake_case stats from backend before computing route counters', async () => {
    persistentMemoryGetStats.mockResolvedValue({
      count_by_level: {
        session: 4,
        intermediate: 5,
        long_term: 6,
      },
    });

    render(<Memory />);

    await waitFor(() => {
      expect(memorySectionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            memoryShortTerm: 4,
            memoryMidTerm: 5,
            memoryLongTerm: 6,
          }),
        })
      );
    });
  });
});
