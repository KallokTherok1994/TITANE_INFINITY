import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaEvent } from '@/engines/time';

vi.mock('@/engines/time/EnergyEngine', () => ({
  energyEngine: {
    inferEnergyLevelFromTime: vi.fn((time: string) => {
      const hour = Number.parseInt(time.slice(0, 2), 10);
      return hour >= 9 && hour < 18 ? 0.9 : 0.4;
    }),
  },
}));

import { PriorityEngine } from '@/engines/time';

function makeAgendaEvent(overrides: Partial<AgendaEvent>): AgendaEvent {
  const now = Date.now();

  return {
    id: overrides.id ?? `evt-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title ?? 'Événement priorisé',
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

describe('priority engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 8, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('scores and ranks priority using the current temporal context', () => {
    const engine = new PriorityEngine();

    const highSignalEvent = makeAgendaEvent({
      title: 'Launch release',
      category: 'work',
      priority: 'high',
      startDateTime: new Date(2026, 4, 9, 10, 0, 0).toISOString(),
      endDateTime: new Date(2026, 4, 9, 11, 0, 0).toISOString(),
      tags: ['deadline', 'strategic', 'goal-aligned'],
      energyRequired: 0.8,
    });

    const lowSignalEvent = makeAgendaEvent({
      title: 'Coffee break',
      category: 'break',
      priority: 'low',
      startDateTime: new Date(2026, 4, 10, 10, 0, 0).toISOString(),
      endDateTime: new Date(2026, 4, 10, 10, 15, 0).toISOString(),
      energyRequired: 0.2,
    });

    const ranked = engine.rankEvents([lowSignalEvent, highSignalEvent]);

    expect(ranked[0]?.title).toBe('Launch release');
    expect(ranked[0]?.priorityScore).toBeGreaterThan(ranked[1]?.priorityScore ?? 0);
    expect(engine.getPriorityLevelFromScore(95)).toBe('critical');
    expect(engine.getPriorityLevelFromScore(76)).toBe('urgent');
    expect(engine.getPriorityLevelFromScore(60)).toBe('high');
    expect(engine.getPriorityLevelFromScore(40)).toBe('medium');
    expect(engine.getPriorityLevelFromScore(39)).toBe('low');
  });

  it('recommends the best open slot for a work event', () => {
    const engine = new PriorityEngine();

    const slot = engine.recommendBestSlot(
      { category: 'work', energyRequired: 0.8 },
      [],
      new Date(2026, 4, 9, 0, 0, 0)
    );

    const expectedBestSlot = Array.from({ length: 12 }, (_, index) => {
      const hour = 8 + index;
      const start = new Date(2026, 4, 9, hour, 0, 0);
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const predictedEnergy = hour >= 9 && hour < 18 ? 0.9 : 0.4;
      const energyMatch = 100 - Math.abs(predictedEnergy - 0.8) * 100;
      const bonus = hour >= 9 && hour < 18 ? 15 : 0;

      return {
        start: start.toISOString(),
        end: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
        score: energyMatch + bonus,
        time,
      };
    }).reduce((best, slotCandidate) =>
      slotCandidate.score > best.score ? slotCandidate : best
    );

    expect(slot).not.toBeNull();
    expect(slot?.start).toBe(expectedBestSlot.start);
    expect(slot?.end).toBe(expectedBestSlot.end);
  });
});
