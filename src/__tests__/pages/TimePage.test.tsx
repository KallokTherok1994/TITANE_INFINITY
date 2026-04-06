import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TimePage } from '@/pages/TimePage';
import type { UseTimeAgendaReturn } from '@/hooks/useTimeAgenda';

const mockUseTimeAgenda = vi.fn<() => UseTimeAgendaReturn>();

vi.mock('@/hooks/useTimeAgenda', () => ({
  useTimeAgenda: () => mockUseTimeAgenda(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    listSnapshots: vi.fn().mockResolvedValue([]),
    getTravelStats: vi.fn().mockResolvedValue({
      totalSnapshots: 0,
      ramCacheSize: 0,
      diskUsageBytes: 0,
      oldestSnapshot: 0,
      newestSnapshot: 0,
    }),
    restoreSnapshot: vi.fn(),
    deleteSnapshot: vi.fn(),
    titanForceSnapshot: vi.fn(),
  },
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

function buildHookState(
  overrides: Partial<UseTimeAgendaReturn> = {}
): UseTimeAgendaReturn {
  const agendaEvent = {
    id: 'evt-sync-1',
    title: 'Sync TITANE sprint',
    startDateTime: '2026-04-04T09:00:00.000Z',
    endDateTime: '2026-04-04T10:30:00.000Z',
    allDay: false,
    category: 'focus' as const,
    status: 'scheduled' as const,
    priority: 'high' as const,
    tags: ['titane'],
    reminders: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    timeState: {
      currentDateTime: '2026-04-04T09:15:00.000Z',
      timeZone: 'Europe/Paris',
      daySegments: [],
      workHours: { start: '09:00', end: '18:00' },
      weekTemplate: [],
      currentSegment: {
        id: 'morning',
        label: 'Matin Focus',
        startTime: '09:00',
        endTime: '12:00',
        color: '#3b82f6',
        typicalEnergy: 0.9,
        icon: '🌅',
      },
      currentDayOfWeek: 6,
      isWorkDay: true,
      isWorkHours: true,
      lastUpdate: Date.now(),
    },
    events: [agendaEvent],
    energyState: {
      chronotype: 'intermediate',
      peaks: [],
      dips: [],
      currentEnergyLevel: 0.84,
      trend: 'rising',
      energyHistory: [],
      forecast: [],
      lastUpdate: Date.now(),
    },
    agendaMeta: {
      defaultView: 'week',
      showEnergyOverlay: true,
      showFocusBlocks: true,
      autoSyncEnabled: true,
      firstDayOfWeek: 1,
      use24HourFormat: true,
      defaultEventDuration: 60,
      timeSlotInterval: 30,
      gridStartHour: 6,
      gridEndHour: 22,
    },
    loading: false,
    initialized: true,
    currentDate: new Date('2026-04-04T09:15:00.000Z'),
    currentView: 'week',
    setCurrentDate: vi.fn(),
    setCurrentView: vi.fn(),
    goToToday: vi.fn(),
    goToPrevious: vi.fn(),
    goToNext: vi.fn(),
    viewEvents: [agendaEvent],
    dayGrid: [{ hour: 9, events: [agendaEvent] }],
    weekGrid: [{ date: new Date('2026-04-04T00:00:00.000Z'), events: [agendaEvent] }],
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    moveEvent: vi.fn(),
    createQuickEvent: vi.fn(),
    toggleEnergyOverlay: vi.fn(),
    toggleFocusBlocks: vi.fn(),
    processAIResponse: vi.fn(),
    stats: {
      totalEvents: 1,
      eventsToday: 1,
      eventsThisWeek: 1,
      currentEnergy: 0.84,
      currentSegment: 'Matin Focus',
      isWorkHours: true,
    },
    refresh: vi.fn(),
    ...overrides,
  };
}

function renderTimePage(initialRoute = '/time?tab=agenda') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/time" element={<TimePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TimePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockUseTimeAgenda.mockReturnValue(buildHookState());
  });

  it('renders synced agenda events instead of placeholder-only content', async () => {
    await act(async () => {
      renderTimePage('/time?tab=agenda');
    });

    expect(await screen.findByText('Sync TITANE sprint')).toBeInTheDocument();
    expect(screen.queryByText(/à implémenter/i)).not.toBeInTheDocument();
  });

  it('shows current synchronized segment and energy in Maintenant', async () => {
    await act(async () => {
      renderTimePage('/time?tab=now');
    });

    expect(await screen.findByText(/Matin Focus/i)).toBeInTheDocument();
    expect(await screen.findByText('84%')).toBeInTheDocument();
  });

  it('persists the cognitive state through the flow toggle', async () => {
    await act(async () => {
      renderTimePage('/time?tab=cognitive');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-time-flow-toggle'));
    });

    expect(window.localStorage.getItem('titane_cognitive_state')).toContain('deep-work');
  });
});
