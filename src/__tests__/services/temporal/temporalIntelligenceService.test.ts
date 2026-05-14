/**
 * TITANE∞ — Unit tests for temporalIntelligenceService.
 * Mocks the Single Door `safeInvokeCanonical` and asserts:
 *   - command name routing
 *   - payload shape (Rust serde mirrors)
 *   - error propagation on IPC failure
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn();

vi.mock('@/utils/invoke', () => ({
  safeInvokeCanonical: (...args: unknown[]) => invokeMock(...args),
}));

import {
  TEMPORAL_V3_COMMANDS,
  temporalIntelligenceService,
} from '@/services/temporal/temporalIntelligenceService';

function okResult<T>(content: T) {
  return Promise.resolve({ ok: true, content, error: null });
}
function errResult(code: string, message: string) {
  return Promise.resolve({ ok: false, content: null, error: { code, message } });
}

describe('temporalIntelligenceService — TIME-IPC v3 bridge', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });
  afterEach(() => {
    invokeMock.mockReset();
  });

  it('exposes 18 canonical commands', () => {
    expect(TEMPORAL_V3_COMMANDS.length).toBe(18);
  });

  it('getFullContext routes to temporal_get_full_context', async () => {
    invokeMock.mockReturnValueOnce(okResult({ day_progress: 0.5 }));
    const r = await temporalIntelligenceService.getFullContext();
    expect(invokeMock).toHaveBeenCalledWith('temporal_get_full_context');
    expect(r).toEqual({ day_progress: 0.5 });
  });

  it('tick routes to temporal_tick (write)', async () => {
    invokeMock.mockReturnValueOnce(okResult({ tick_count: 1, tick_duration_ms: 4 }));
    const r = await temporalIntelligenceService.tick();
    expect(invokeMock).toHaveBeenCalledWith('temporal_tick');
    expect(r.tick_count).toBe(1);
  });

  it('recordMemory passes payload under {payload} envelope', async () => {
    invokeMock.mockReturnValueOnce(okResult('mem-id-1'));
    const id = await temporalIntelligenceService.recordMemory({
      event_type: 'user_msg',
      context: 'chat',
      data: { a: 1 },
      significance: 0.42,
    });
    expect(invokeMock).toHaveBeenCalledWith('temporal_memory_record', {
      payload: {
        event_type: 'user_msg',
        context: 'chat',
        data: { a: 1 },
        significance: 0.42,
      },
    });
    expect(id).toBe('mem-id-1');
  });

  it('recallMemory uses default empty payload', async () => {
    invokeMock.mockReturnValueOnce(okResult([]));
    await temporalIntelligenceService.recallMemory();
    expect(invokeMock).toHaveBeenCalledWith('temporal_memory_recall', { payload: {} });
  });

  it('addTask routes to temporal_planner_add_task with payload envelope', async () => {
    invokeMock.mockReturnValueOnce(okResult('task-1'));
    const id = await temporalIntelligenceService.addTask({
      title: 'Focus 2h livre',
      priority: 'high',
      horizon: 'today',
    });
    expect(invokeMock).toHaveBeenCalledWith('temporal_planner_add_task', {
      payload: { title: 'Focus 2h livre', priority: 'high', horizon: 'today' },
    });
    expect(id).toBe('task-1');
  });

  it('getPlan forwards horizon as bare argument', async () => {
    invokeMock.mockReturnValueOnce(okResult([]));
    await temporalIntelligenceService.getPlan('this_week');
    expect(invokeMock).toHaveBeenCalledWith('temporal_planner_get_plan', {
      horizon: 'this_week',
    });
  });

  it('upsertRoutine forwards trigger payload', async () => {
    invokeMock.mockReturnValueOnce(okResult('routine-1'));
    const id = await temporalIntelligenceService.upsertRoutine({
      name: 'Morning focus',
      trigger: { pattern: 'daily', time_of_day: 'morning', hour: 7, minute: 30 },
      enabled: true,
      priority: 5,
    });
    expect(invokeMock).toHaveBeenCalledWith(
      'temporal_routine_upsert',
      expect.any(Object)
    );
    expect(id).toBe('routine-1');
  });

  it('upsertGoal forwards category & milestones', async () => {
    invokeMock.mockReturnValueOnce(okResult('goal-1'));
    const id = await temporalIntelligenceService.upsertGoal({
      title: 'Sortir livre',
      category: 'creative',
      milestones: [{ title: 'Chapitre 1' }],
    });
    expect(invokeMock).toHaveBeenCalledWith(
      'temporal_alignment_goal_upsert',
      expect.objectContaining({
        payload: expect.objectContaining({ title: 'Sortir livre', category: 'creative' }),
      })
    );
    expect(id).toBe('goal-1');
  });

  it('propagates IPC errors with command + code prefix', async () => {
    invokeMock.mockReturnValueOnce(errResult('PERMISSION_DENIED', 'Permission denied'));
    await expect(temporalIntelligenceService.getHealth()).rejects.toThrowError(
      /temporal_metrics_health.*PERMISSION_DENIED/
    );
  });
});
