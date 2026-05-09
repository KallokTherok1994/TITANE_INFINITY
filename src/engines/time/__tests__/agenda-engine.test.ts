import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent, AgendaStorageCallbacks } from '@/engines/time';
import { AgendaEngine } from '@/engines/time';

function makeEvent(overrides: Partial<AgendaEvent>): AgendaEvent {
  const now = Date.now();

  return {
    id: overrides.id ?? `evt-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title ?? 'Événement canonique',
    description: overrides.description,
    startDateTime: overrides.startDateTime ?? '2026-05-09T10:00:00.000Z',
    endDateTime: overrides.endDateTime ?? '2026-05-09T11:00:00.000Z',
    allDay: overrides.allDay ?? false,
    category: overrides.category ?? 'work',
    status: overrides.status ?? 'scheduled',
    priority: overrides.priority ?? 'medium',
    priorityScore: overrides.priorityScore,
    energyRequired: overrides.energyRequired,
    tags: overrides.tags ?? [],
    recurrence: overrides.recurrence,
    reminders: overrides.reminders ?? [],
    color: overrides.color,
    location: overrides.location,
    notes: overrides.notes,
    projectId: overrides.projectId,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

describe('agenda engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads injected storage and builds canonical day/week/month views', async () => {
    const seedEvents = [
      makeEvent({
        id: 'evt-friday-focus',
        title: 'Focus sprint',
        startDateTime: new Date(2026, 4, 8, 9, 30, 0).toISOString(),
        endDateTime: new Date(2026, 4, 8, 10, 30, 0).toISOString(),
        category: 'work',
        priority: 'high',
        tags: ['goal-aligned', 'strategic'],
      }),
      makeEvent({
        id: 'evt-saturday-review',
        title: 'Review session',
        startDateTime: new Date(2026, 4, 9, 14, 0, 0).toISOString(),
        endDateTime: new Date(2026, 4, 9, 15, 0, 0).toISOString(),
        category: 'meeting',
        status: 'completed',
        priority: 'medium',
        tags: ['weekly-review'],
      }),
    ];

    const loadEventsMock = vi.fn(async () => seedEvents);
    const saveEventsMock = vi.fn(async (_events: AgendaEvent[]) => {});
    const storage: AgendaStorageCallbacks = {
      loadEvents: loadEventsMock,
      saveEvents: saveEventsMock,
    };

    const agenda = new AgendaEngine(storage);
    await agenda.init();

    expect(loadEventsMock).toHaveBeenCalledTimes(1);
    expect(agenda.getEventsForDay(new Date(2026, 4, 9, 12, 0, 0))).toHaveLength(1);
    expect(agenda.getEventsForWeek(new Date(2026, 4, 9, 12, 0, 0))).toHaveLength(2);
    expect(agenda.getEventsForMonth(new Date(2026, 4, 9, 12, 0, 0))).toHaveLength(2);

    const dayGrid = agenda.buildDayGrid(new Date(2026, 4, 9, 12, 0, 0));
    expect(dayGrid).toHaveLength(17);
    expect(
      dayGrid.some(slot => slot.events.some(event => event.title === 'Review session'))
    ).toBe(true);

    const weekGrid = agenda.buildWeekGrid(new Date(2026, 4, 9, 12, 0, 0));
    expect(weekGrid).toHaveLength(7);
    expect(weekGrid[0]?.date.getDay()).toBe(1);
    expect(
      weekGrid.some(slot => slot.events.some(event => event.title === 'Focus sprint'))
    ).toBe(true);

    const monthGrid = agenda.buildMonthGrid(new Date(2026, 4, 9, 12, 0, 0));
    expect(monthGrid).toHaveLength(42);
    expect(monthGrid.filter(cell => cell.isCurrentMonth).length).toBeGreaterThan(0);

    const stats = agenda.getStats();
    expect(stats).toEqual(
      expect.objectContaining({
        totalEvents: 2,
        eventsToday: 1,
        eventsThisWeek: 2,
        completedToday: 1,
      })
    );
    expect(stats.byCategory.work).toBe(1);
    expect(stats.byStatus.completed).toBe(1);
    expect(saveEventsMock).not.toHaveBeenCalled();
  });

  it('persists create, update, move and delete operations through the injected storage bridge', async () => {
    const loadEventsMock = vi.fn(async () => [] as AgendaEvent[]);
    const saveEventsMock = vi.fn(async (_events: AgendaEvent[]) => {});
    const agenda = new AgendaEngine({
      loadEvents: loadEventsMock,
      saveEvents: saveEventsMock,
    });

    await agenda.init();

    const created = await agenda.createQuickEvent(
      'Temporal sync',
      new Date(2026, 4, 9, 13, 0, 0).toISOString(),
      90,
      'focus'
    );

    expect(created).toEqual(
      expect.objectContaining({
        title: 'Temporal sync',
        startDateTime: new Date(2026, 4, 9, 13, 0, 0).toISOString(),
        endDateTime: new Date(2026, 4, 9, 14, 30, 0).toISOString(),
        category: 'focus',
      })
    );
    expect(created.reminders).toHaveLength(1);
    expect(saveEventsMock).toHaveBeenCalled();

    const updated = await agenda.updateEvent(created.id, {
      title: 'Temporal sync updated',
      priority: 'urgent',
    });

    expect(updated).toEqual(
      expect.objectContaining({
        id: created.id,
        title: 'Temporal sync updated',
        priority: 'urgent',
      })
    );
    expect(updated?.updatedAt).toBeGreaterThanOrEqual(created.createdAt);

    const moved = await agenda.moveEvent(
      created.id,
      new Date(2026, 4, 9, 15, 0, 0).toISOString(),
      new Date(2026, 4, 9, 16, 30, 0).toISOString()
    );

    expect(moved).toEqual(
      expect.objectContaining({
        startDateTime: new Date(2026, 4, 9, 15, 0, 0).toISOString(),
        endDateTime: new Date(2026, 4, 9, 16, 30, 0).toISOString(),
      })
    );

    expect(await agenda.deleteEvent(created.id)).toBe(true);
    expect(agenda.getEvent(created.id)).toBeUndefined();
    expect(saveEventsMock.mock.calls.at(-1)?.[0]).toHaveLength(0);
  });
});
