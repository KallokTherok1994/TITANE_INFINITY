import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AgendaCommand, AgendaEvent } from '@/engines/time';
import { ChatScheduler, ChatSchedulerUtils } from '@/engines/time';

const schedulerMocks = vi.hoisted(() => {
  const agendaState = new Map<string, AgendaEvent>();

  const loadEventsMock = vi.fn(async () => Array.from(agendaState.values()));
  const createEventMock = vi.fn(
    async (eventData: Omit<AgendaEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
      const event: AgendaEvent = {
        ...eventData,
        id: `evt-${agendaState.size + 1}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      agendaState.set(event.id, event);
      return event;
    }
  );
  const updateEventMock = vi.fn(
    async (eventId: string, updates: Partial<AgendaEvent>) => {
      const current = agendaState.get(eventId);
      if (!current) return null;

      const updated: AgendaEvent = {
        ...current,
        ...updates,
        id: eventId,
        updatedAt: Date.now(),
      };
      agendaState.set(eventId, updated);
      return updated;
    }
  );
  const moveEventMock = vi.fn(
    async (eventId: string, newStartDateTime: string, newEndDateTime?: string) => {
      const current = agendaState.get(eventId);
      if (!current) return null;

      const moved: AgendaEvent = {
        ...current,
        startDateTime: newStartDateTime,
        endDateTime: newEndDateTime ?? current.endDateTime,
        updatedAt: Date.now(),
      };
      agendaState.set(eventId, moved);
      return moved;
    }
  );
  const deleteEventMock = vi.fn(async (eventId: string) => agendaState.delete(eventId));
  const getEventsForDayMock = vi.fn((date: Date) => {
    const day = date.toISOString().slice(0, 10);
    return Array.from(agendaState.values()).filter(
      event => event.startDateTime.slice(0, 10) === day
    );
  });
  const getEventsInRangeMock = vi.fn((start: Date, end: Date) => {
    const startMs = start.getTime();
    const endMs = end.getTime();
    return Array.from(agendaState.values()).filter(event => {
      const eventStart = new Date(event.startDateTime).getTime();
      const eventEnd = new Date(event.endDateTime).getTime();
      return eventStart <= endMs && eventEnd >= startMs;
    });
  });

  return {
    agendaState,
    loadEventsMock,
    createEventMock,
    updateEventMock,
    moveEventMock,
    deleteEventMock,
    getEventsForDayMock,
    getEventsInRangeMock,
  };
});

const {
  agendaState,
  loadEventsMock,
  createEventMock,
  updateEventMock,
  moveEventMock,
  deleteEventMock,
  getEventsForDayMock,
  getEventsInRangeMock,
} = schedulerMocks;

vi.mock('@/engines/time/AgendaEngine', () => ({
  agendaEngine: {
    createEvent: schedulerMocks.createEventMock,
    createQuickEvent: vi.fn(),
    updateEvent: schedulerMocks.updateEventMock,
    moveEvent: schedulerMocks.moveEventMock,
    deleteEvent: schedulerMocks.deleteEventMock,
    getEventsForDay: schedulerMocks.getEventsForDayMock,
    getEventsInRange: schedulerMocks.getEventsInRangeMock,
    loadEvents: schedulerMocks.loadEventsMock,
  },
}));

describe('chat scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 8, 0, 0));
    agendaState.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeScheduler(): ChatScheduler {
    return new ChatScheduler();
  }

  it('detects structured and inline agenda commands', () => {
    const scheduler = makeScheduler();

    const structuredResponse = [
      'préambule',
      ChatSchedulerUtils.COMMAND_START_MARKER,
      JSON.stringify({
        type: 'create',
        title: 'Focus sprint',
        start: new Date(2026, 4, 9, 13, 0, 0).toISOString(),
        meta: { durationMinutes: 90, category: 'focus', priority: 'high' },
      }),
      ChatSchedulerUtils.COMMAND_END_MARKER,
      'épilogue',
    ].join('\n');

    const inlineResponse = `[AGENDA] ${JSON.stringify({
      type: 'delete',
      fromEventId: 'evt-1',
    })} [/AGENDA]`;

    expect(scheduler.detectAgendaCommands(structuredResponse)).toHaveLength(1);
    expect(scheduler.getLastCommands()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'create',
          title: 'Focus sprint',
        }),
      ])
    );

    expect(scheduler.detectAgendaCommands(inlineResponse)).toHaveLength(1);
    expect(scheduler.getLastCommands()[0]).toEqual(
      expect.objectContaining({
        type: 'delete',
        fromEventId: 'evt-1',
      })
    );
  });

  it('suppresses detection when disabled and rejects malformed JSON', () => {
    const scheduler = makeScheduler();

    scheduler.setEnabled(false);
    expect(
      scheduler.detectAgendaCommands(`
        ${ChatSchedulerUtils.COMMAND_START_MARKER}
        {"type":"create","title":"Disabled","start":"2026-05-09T13:00:00.000Z"}
        ${ChatSchedulerUtils.COMMAND_END_MARKER}
      `)
    ).toHaveLength(0);
    expect(scheduler.parseAgendaCommand('{"type": "create",')).toBeNull();
  });

  it('executes commands and syncs after successful mutations', async () => {
    const scheduler = makeScheduler();

    const result = await scheduler.executeAgendaCommand({
      type: 'create',
      title: 'Temporal sync',
      start: new Date(2026, 4, 9, 13, 0, 0).toISOString(),
      meta: { durationMinutes: 90, category: 'focus', priority: 'high' },
    } as AgendaCommand);

    expect(result.success).toBe(true);
    expect(result.event).toEqual(
      expect.objectContaining({
        title: 'Temporal sync',
        endDateTime: new Date(2026, 4, 9, 14, 30, 0).toISOString(),
      })
    );
    expect(loadEventsMock).toHaveBeenCalledTimes(1);
  });

  it('processes multiple structured commands in a single response', async () => {
    const scheduler = makeScheduler();

    const response = [
      ChatSchedulerUtils.COMMAND_START_MARKER,
      JSON.stringify({
        type: 'create',
        title: 'Morning focus',
        start: new Date(2026, 4, 9, 9, 0, 0).toISOString(),
        meta: { durationMinutes: 60, category: 'work', priority: 'high' },
      }),
      ChatSchedulerUtils.COMMAND_END_MARKER,
      ChatSchedulerUtils.COMMAND_START_MARKER,
      JSON.stringify({
        type: 'query',
        start: new Date(2026, 4, 9, 0, 0, 0).toISOString(),
        end: new Date(2026, 4, 9, 23, 59, 59, 999).toISOString(),
      }),
      ChatSchedulerUtils.COMMAND_END_MARKER,
    ].join('\n');

    const results = await scheduler.processAIResponse(response);

    expect(results).toHaveLength(2);
    expect(results[0]?.success).toBe(true);
    expect(results[1]?.message).toContain('1 événement');
    expect(loadEventsMock).toHaveBeenCalledTimes(1);
  });

  it('fails cleanly when update or delete target is missing', async () => {
    const scheduler = makeScheduler();

    const missingUpdate = await scheduler.executeAgendaCommand({
      type: 'update',
      fromEventId: 'evt-missing',
      title: 'Missing',
    } as AgendaCommand);

    const missingDelete = await scheduler.executeAgendaCommand({
      type: 'delete',
      fromEventId: 'evt-missing',
    } as AgendaCommand);

    expect(missingUpdate.success).toBe(false);
    expect(missingDelete.success).toBe(false);
  });
});
