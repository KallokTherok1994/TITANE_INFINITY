/**
 * TITANE∞ — Unit tests for temporalChatTools (Phase 3 TOOL_CALL bridge).
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const addTaskMock = vi.fn();
const upsertRoutineMock = vi.fn();
const upsertGoalMock = vi.fn();
const recordMemoryMock = vi.fn();
const getPlanMock = vi.fn();

vi.mock('@/services/temporal', () => ({
  temporalIntelligenceService: {
    addTask: (...a: unknown[]) => addTaskMock(...a),
    upsertRoutine: (...a: unknown[]) => upsertRoutineMock(...a),
    upsertGoal: (...a: unknown[]) => upsertGoalMock(...a),
    recordMemory: (...a: unknown[]) => recordMemoryMock(...a),
    getPlan: (...a: unknown[]) => getPlanMock(...a),
  },
}));

import {
  TEMPORAL_CHAT_TOOLS,
  TEMPORAL_CHAT_TOOL_NAMES,
  registerTemporalChatTools,
} from '@/services/temporal/temporalChatTools';

describe('temporalChatTools — TOOL_CALL bridge', () => {
  beforeEach(() => {
    addTaskMock.mockReset();
    upsertRoutineMock.mockReset();
    upsertGoalMock.mockReset();
    recordMemoryMock.mockReset();
    getPlanMock.mockReset();
  });
  afterEach(() => vi.clearAllMocks());

  it('expose 5 outils temporels canoniques', () => {
    expect(TEMPORAL_CHAT_TOOL_NAMES.sort()).toEqual(
      [
        'temporal_add_task',
        'temporal_upsert_routine',
        'temporal_upsert_goal',
        'temporal_record_memory',
        'temporal_get_plan',
      ].sort()
    );
  });

  it('temporal_add_task valide title + route service', async () => {
    addTaskMock.mockResolvedValue('task-1');
    const out = await TEMPORAL_CHAT_TOOLS.temporal_add_task.execute({
      title: 'Focus 2h',
      priority: 'high',
      horizon: 'today',
      energy_required: 0.8,
      tags: ['focus', 'livre'],
    });
    expect(addTaskMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Focus 2h',
        priority: 'high',
        horizon: 'today',
        energy_required: 0.8,
        tags: ['focus', 'livre'],
      })
    );
    expect(out).toEqual({ id: 'task-1', title: 'Focus 2h' });
  });

  it('temporal_add_task rejette title vide', async () => {
    await expect(
      TEMPORAL_CHAT_TOOLS.temporal_add_task.execute({ title: '   ' })
    ).rejects.toThrow(/title required/);
  });

  it('temporal_upsert_routine construit trigger', async () => {
    upsertRoutineMock.mockResolvedValue('routine-1');
    const out = await TEMPORAL_CHAT_TOOLS.temporal_upsert_routine.execute({
      name: 'Morning focus',
      pattern: 'daily',
      time_of_day: 'morning',
      hour: 7,
      minute: 30,
    });
    expect(upsertRoutineMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Morning focus',
        trigger: expect.objectContaining({
          pattern: 'daily',
          time_of_day: 'morning',
          hour: 7,
          minute: 30,
        }),
      })
    );
    expect(out).toEqual({ id: 'routine-1', name: 'Morning focus' });
  });

  it('temporal_upsert_goal mappe category + milestones', async () => {
    upsertGoalMock.mockResolvedValue('goal-1');
    await TEMPORAL_CHAT_TOOLS.temporal_upsert_goal.execute({
      title: 'Sortir livre',
      category: 'creative',
      milestones: [{ title: 'Ch.1' }, { title: 'Ch.2', due_date: 1234 }],
    });
    const call = upsertGoalMock.mock.calls[0][0];
    expect(call.title).toBe('Sortir livre');
    expect(call.category).toBe('creative');
    expect(call.milestones).toHaveLength(2);
    expect(call.milestones[0].title).toBe('Ch.1');
    expect(call.milestones[1].due_date).toBe(1234);
  });

  it('temporal_record_memory exige event_type + context', async () => {
    recordMemoryMock.mockResolvedValue('mem-1');
    const out = await TEMPORAL_CHAT_TOOLS.temporal_record_memory.execute({
      event_type: 'decision',
      context: 'chat',
      data: { x: 1 },
      significance: 0.9,
    });
    expect(recordMemoryMock).toHaveBeenCalledWith({
      event_type: 'decision',
      context: 'chat',
      data: { x: 1 },
      significance: 0.9,
    });
    expect(out).toMatchObject({ id: 'mem-1', event_type: 'decision' });

    await expect(
      TEMPORAL_CHAT_TOOLS.temporal_record_memory.execute({ event_type: '', context: 'chat' })
    ).rejects.toThrow(/event_type required/);
  });

  it('temporal_get_plan retourne tasks + count', async () => {
    getPlanMock.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
    const out = await TEMPORAL_CHAT_TOOLS.temporal_get_plan.execute({ horizon: 'this_week' });
    expect(getPlanMock).toHaveBeenCalledWith('this_week');
    expect(out).toMatchObject({ horizon: 'this_week', count: 2 });
  });

  it('registerTemporalChatTools enregistre 5 outils', () => {
    const registered: string[] = [];
    registerTemporalChatTools({
      registerTool: (t) => registered.push(t.name),
    });
    expect(registered.sort()).toEqual(TEMPORAL_CHAT_TOOL_NAMES.slice().sort());
  });
});
