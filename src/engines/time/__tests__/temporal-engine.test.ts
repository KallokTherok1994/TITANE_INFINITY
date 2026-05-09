import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayProfile } from '@/engines/time';
import { TimeEngine, TimeEngineUtils } from '@/engines/time';

describe('temporal engine core', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 9, 10, 15, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps overnight time ranges and boundaries truthful', () => {
    expect(TimeEngineUtils.isTimeInRange(23 * 60, '22:00', '05:00')).toBe(true);
    expect(TimeEngineUtils.isTimeInRange(4 * 60 + 59, '22:00', '05:00')).toBe(true);
    expect(TimeEngineUtils.isTimeInRange(5 * 60, '22:00', '05:00')).toBe(false);
    expect(TimeEngineUtils.isTimeInRange(21 * 60 + 59, '22:00', '05:00')).toBe(false);
  });

  it('merges custom segments and effective work hours into the active time state', () => {
    const engine = new TimeEngine();
    const currentDayOfWeek = engine.getState().currentDayOfWeek;

    const customSegments = engine.computeDaySegments([
      { label: 'Aube calibrée', startTime: '04:30', endTime: '06:30' },
    ]);

    expect(customSegments[0]).toEqual(
      expect.objectContaining({
        id: 'early_morning',
        label: 'Aube calibrée',
        startTime: '04:30',
        endTime: '06:30',
      })
    );
    expect(customSegments[1]).toEqual(
      expect.objectContaining({
        id: 'morning',
        label: 'Matin',
      })
    );

    const customWeekTemplate: Partial<DayProfile>[] = Array.from(
      { length: 7 },
      (_, index) =>
        index === currentDayOfWeek
          ? {
              day: currentDayOfWeek,
              active: true,
              customWorkHours: { start: '08:00', end: '12:00' },
            }
          : {}
    );

    engine.initWeekTemplate(customWeekTemplate);
    engine.updateDayProfile(currentDayOfWeek, { label: 'Jour calibré' });

    expect(engine.getCurrentDayProfile()).toEqual(
      expect.objectContaining({
        day: currentDayOfWeek,
        label: 'Jour calibré',
        active: true,
        customWorkHours: { start: '08:00', end: '12:00' },
      })
    );
    expect(engine.isWorkDay()).toBe(true);
    expect(engine.isWorkHours()).toBe(true);
    expect(engine.getTimeRemainingInWorkHours()).toBe(105);
    expect(engine.getTimeRemainingInSegment()).toBe(105);
  });
});
