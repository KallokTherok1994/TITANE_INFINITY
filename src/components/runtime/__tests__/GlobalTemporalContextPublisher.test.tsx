import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GlobalTemporalContextPublisher } from '@/components/runtime/GlobalTemporalContextPublisher';
import { TIME_RUNTIME_CONTEXT_KEY } from '@/services/chat/chatMemorySingleDoor';

const mockUseTimeAgenda = vi.fn();

vi.mock('@/hooks/useTimeAgenda', () => ({
  useTimeAgenda: () => mockUseTimeAgenda(),
}));

describe('GlobalTemporalContextPublisher', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    mockUseTimeAgenda.mockReturnValue({
      timeState: {
        currentDateTime: '2026-05-09T10:22:51.001Z',
        timeZone: 'Europe/Paris',
      },
      events: [
        {
          id: 'evt-1',
          title: 'Focus Sprint',
          startDateTime: '2026-05-09T09:00:00.000Z',
          endDateTime: '2026-05-09T10:30:00.000Z',
          category: 'focus',
        },
      ],
      energyState: {
        currentEnergyLevel: 0.81,
      },
      stats: {
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        currentEnergy: 0.81,
      },
      currentDate: new Date('2026-05-09T10:22:51.001Z'),
      initialized: true,
    });
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('publishes the governed TIME runtime context without mounting TimePage', () => {
    render(<GlobalTemporalContextPublisher />);

    const raw = window.localStorage.getItem(TIME_RUNTIME_CONTEXT_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw ?? '{}');
    expect(parsed).toEqual(
      expect.objectContaining({
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        todayFocusMinutes: 90,
        currentEnergy: 81,
        runtimeSource: 'global-publisher',
      })
    );
    expect(typeof parsed.updatedAt).toBe('number');
  });
});
