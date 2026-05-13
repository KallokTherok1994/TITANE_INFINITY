/**
 * TITANE∞ — Phase 4 TimePage 7-tabs coverage (memory + twin).
 *
 * Vérifie que les onglets `memory` et `twin` rendent leurs sections
 * data-testid stables, sans dépendance Tauri réelle (mock useTemporalIntelligence).
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { UseTimeAgendaReturn } from '@/hooks/useTimeAgenda';

const tauriMocks = vi.hoisted(() => ({
  listSnapshotsMock: vi.fn().mockResolvedValue([]),
  getTravelStatsMock: vi.fn().mockResolvedValue({
    totalSnapshots: 0,
    ramCacheSize: 0,
    diskUsageBytes: 0,
    oldestSnapshot: 0,
    newestSnapshot: 0,
  }),
  restoreSnapshotMock: vi.fn(),
  deleteSnapshotMock: vi.fn(),
  titanForceSnapshotCurrentMock: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    listSnapshots: tauriMocks.listSnapshotsMock,
    getTravelStats: tauriMocks.getTravelStatsMock,
    restoreSnapshot: tauriMocks.restoreSnapshotMock,
    deleteSnapshot: tauriMocks.deleteSnapshotMock,
    titanForceSnapshotCurrent: tauriMocks.titanForceSnapshotCurrentMock,
  },
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

const useTemporalIntelligenceMock = vi.fn(() => ({
  context: null,
  state: {
    context: null as unknown,
    memory_stats: {
      total_traces: 42,
      active_traces: 20,
      consolidated_traces: 18,
      average_strength: 0.612,
    },
    routine_stats: {},
    planner_stats: { tasks: 0 },
    anticipator_stats: {},
    health: {
      overall: 0.81,
      energy: 0.73,
      alignment: 0.66,
      consistency: 0.55,
      recovery: 0.42,
    },
  } as unknown,
  health: {
    overall: 0.81,
    energy: 0.73,
    alignment: 0.66,
    consistency: 0.55,
    recovery: 0.42,
  },
  alignment: {
    score: 0.7,
    active_goals: 4,
    completed_goals: 1,
  },
  lastTick: null,
  loading: false,
  error: null,
  refresh: vi.fn(),
  tick: vi.fn(),
  recordMemory: vi.fn(),
  recallMemory: vi.fn(),
  memoryMetrics: vi.fn(),
  consolidateMemory: vi.fn(),
  listRoutines: vi.fn(),
  upsertRoutine: vi.fn(),
  checkRoutineTriggers: vi.fn(),
  getPlan: vi.fn(),
  addTask: vi.fn(),
  upsertGoal: vi.fn(),
  predict: vi.fn(),
  plannerStats: vi.fn(),
  alignmentScore: vi.fn(),
  health_: vi.fn(),
  memory: vi.fn(),
}));

vi.mock('@/hooks/useTemporalIntelligence', () => ({
  useTemporalIntelligence: () => useTemporalIntelligenceMock(),
}));

function buildAgendaState(): UseTimeAgendaReturn {
  const evt = {
    id: 'evt-1',
    title: 'Focus',
    startDateTime: '2026-04-04T09:00:00.000Z',
    endDateTime: '2026-04-04T10:00:00.000Z',
    allDay: false,
    category: 'focus' as const,
    status: 'scheduled' as const,
    priority: 'high' as const,
    tags: [],
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
        id: 'm',
        label: 'Matin',
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
    events: [evt],
    energyState: {
      chronotype: 'intermediate',
      peaks: [],
      dips: [],
      currentEnergyLevel: 0.8,
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
    viewEvents: [evt],
    dayGrid: [],
    weekGrid: [],
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
      currentEnergy: 0.8,
      currentSegment: 'Matin',
      isWorkHours: true,
    },
    refresh: vi.fn(),
  };
}

const mockUseTimeAgenda = vi.fn<() => UseTimeAgendaReturn>();
vi.mock('@/hooks/useTimeAgenda', () => ({
  useTimeAgenda: () => mockUseTimeAgenda(),
}));

import { TimePage } from '@/pages/TimePage';

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/time" element={<TimePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TimePage Phase 4 — onglets memory & twin', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    mockUseTimeAgenda.mockReturnValue(buildAgendaState());
  });
  afterEach(() => cleanup());

  it('expose les 7 boutons d’onglets', async () => {
    await act(async () => {
      renderAt('/time?tab=now');
    });
    for (const id of [
      'now',
      'agenda',
      'memory',
      'timeline',
      'cognitive',
      'snapshots',
      'twin',
    ]) {
      expect(screen.getByTestId(`tab-time-${id}`)).toBeInTheDocument();
    }
  });

  it('rend la section mémoire avec stats Ebbinghaus', async () => {
    await act(async () => {
      renderAt('/time?tab=memory');
    });
    expect(screen.getByTestId('time-section-memory')).toBeInTheDocument();
    expect(screen.getByTestId('time-memory-stats')).toBeInTheDocument();
    expect(screen.getByTestId('time-metric-memory-total')).toHaveTextContent('42');
    expect(screen.getByTestId('time-metric-memory-active')).toHaveTextContent('20');
    expect(screen.getByTestId('time-metric-memory-strength')).toHaveTextContent(
      '0.612'
    );
  });

  it('rend la section twin avec health + alignment', async () => {
    await act(async () => {
      renderAt('/time?tab=twin');
    });
    expect(screen.getByTestId('time-section-twin')).toBeInTheDocument();
    expect(screen.getByTestId('time-metric-twin-overall')).toHaveTextContent('0.81');
    expect(screen.getByTestId('time-metric-twin-energy')).toHaveTextContent('0.73');
    expect(screen.getByTestId('time-metric-twin-align-score')).toHaveTextContent(
      '0.70'
    );
    expect(screen.getByTestId('time-metric-twin-active-goals')).toHaveTextContent('4');
  });
});
