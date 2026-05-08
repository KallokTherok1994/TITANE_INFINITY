import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AgendaEvent,
  AgendaMeta,
  AgendaStorageCallbacks,
  CommandExecutionResult,
  EnergyState,
  TimeState,
} from '@/engines/time';

let currentEvents: AgendaEvent[] = [];
let currentMeta: AgendaMeta;
let timeState: TimeState;
let energyState: EnergyState;
let agendaListener: ((events: AgendaEvent[]) => void) | null = null;

const initTimeAgendaSystemMock = vi.fn(
  async (_storage?: AgendaStorageCallbacks): Promise<void> => {}
);
const loadAllEventsMock = vi.fn(async () => currentEvents);
const saveAllEventsMock = vi.fn(async (_events: AgendaEvent[]): Promise<void> => {});
const processAIResponseMock = vi.fn(
  async (_response: string): Promise<CommandExecutionResult[]> => []
);

vi.mock('@/services/agendaService', () => ({
  agendaService: {
    loadAllEvents: () => loadAllEventsMock(),
    saveAllEvents: (events: AgendaEvent[]) => saveAllEventsMock(events),
  },
}));

vi.mock('@/engines/time', () => ({
  initTimeAgendaSystem: (storage?: AgendaStorageCallbacks) =>
    initTimeAgendaSystemMock(storage),
  timeEngine: {
    subscribe: (listener: (state: TimeState) => void) => {
      listener(timeState);
      return () => {};
    },
    updateCurrentDateTime: vi.fn(),
  },
  agendaEngine: {
    getMeta: () => currentMeta,
    subscribe: (listener: (events: AgendaEvent[]) => void) => {
      agendaListener = listener;
      listener(currentEvents);
      return () => {
        agendaListener = null;
      };
    },
    getEventsForDay: vi.fn(() => currentEvents),
    getEventsForWeek: vi.fn(() => currentEvents),
    getEventsForMonth: vi.fn(() => currentEvents),
    buildDayGrid: vi.fn((date: Date) => [{ hour: date.getHours(), events: currentEvents }]),
    buildWeekGrid: vi.fn((date: Date) => [{ date, events: currentEvents }]),
    createQuickEvent: vi.fn(
      async (
        title: string,
        startDateTime: string,
        durationMinutes: number,
        category: AgendaEvent['category']
      ): Promise<AgendaEvent> => {
        const event: AgendaEvent = {
          id: `evt-${currentEvents.length + 1}`,
          title,
          startDateTime,
          endDateTime: new Date(
            new Date(startDateTime).getTime() + durationMinutes * 60 * 1000
          ).toISOString(),
          allDay: false,
          category,
          status: 'scheduled',
          priority: 'medium',
          tags: [],
          reminders: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        currentEvents = [...currentEvents, event];
        agendaListener?.(currentEvents);
        return event;
      }
    ),
    updateEvent: vi.fn(async () => null),
    deleteEvent: vi.fn(async () => false),
    moveEvent: vi.fn(async () => null),
    toggleEnergyOverlay: vi.fn(() => {
      currentMeta = { ...currentMeta, showEnergyOverlay: !currentMeta.showEnergyOverlay };
    }),
    toggleFocusBlocks: vi.fn(() => {
      currentMeta = { ...currentMeta, showFocusBlocks: !currentMeta.showFocusBlocks };
    }),
    loadEvents: vi.fn(async () => {}),
    getStats: vi.fn(() => ({
      totalEvents: currentEvents.length,
      eventsToday: currentEvents.length,
      eventsThisWeek: currentEvents.length,
      completedToday: 0,
      byCategory: {},
      byStatus: {},
    })),
  },
  energyEngine: {
    subscribe: (listener: (state: EnergyState) => void) => {
      listener(energyState);
      return () => {};
    },
    updateCurrentEnergyLevel: vi.fn(),
  },
  priorityEngine: {
    annotateEventsWithPriority: (events: AgendaEvent[]) => events,
  },
  chatScheduler: {
    processAIResponse: (response: string) => processAIResponseMock(response),
  },
}));

import { useTimeAgenda } from '@/hooks/useTimeAgenda';

describe('useTimeAgenda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentEvents = [];
    agendaListener = null;
    currentMeta = {
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
    };
    timeState = {
      currentDateTime: '2026-05-08T10:00:00.000Z',
      timeZone: 'America/Toronto',
      daySegments: [],
      workHours: { start: '09:00', end: '18:00' },
      weekTemplate: [],
      currentSegment: {
        id: 'focus',
        label: 'Focus',
        startTime: '09:00',
        endTime: '12:00',
        color: '#2563eb',
        typicalEnergy: 0.8,
        icon: '⚡',
      },
      currentDayOfWeek: 5,
      isWorkDay: true,
      isWorkHours: true,
      lastUpdate: Date.now(),
    };
    energyState = {
      chronotype: 'intermediate',
      peaks: [],
      dips: [],
      currentEnergyLevel: 0.8,
      trend: 'stable',
      energyHistory: [],
      forecast: [],
      lastUpdate: Date.now(),
    };
  });

  it('recomputes agenda-derived views after a quick event is created', async () => {
    const { result } = renderHook(() => useTimeAgenda());

    await waitFor(() => {
      expect(result.current.initialized).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.viewEvents).toHaveLength(0);
    expect(result.current.weekGrid[0]?.events).toHaveLength(0);

    await act(async () => {
      await result.current.createQuickEvent('Nouvel événement manuel', 30);
    });

    await waitFor(() => {
      expect(result.current.viewEvents).toHaveLength(1);
      expect(result.current.weekGrid[0]?.events).toHaveLength(1);
    });
  });
});
