import { describe, expect, it } from 'vitest';
import { buildTemporalMemorySummary } from '@/services/chat/temporalMemoryManager';

describe('temporalMemoryManager', () => {
  it('returns undefined when no time context is available', () => {
    const summary = buildTemporalMemorySummary({
      timeContext: undefined,
      recentMessages: [],
      ttlMs: 900_000,
      now: 1_000,
    });

    expect(summary).toBeUndefined();
  });

  it('computes age and freshness ratio with safe clamping', () => {
    const summary = buildTemporalMemorySummary({
      timeContext: {
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        todayFocusMinutes: 90,
        currentEnergy: 81,
        runtimeSource: 'global-publisher',
        updatedAt: 1_000,
      },
      recentMessages: [],
      ttlMs: 900_000,
      now: 1_900,
    });

    expect(summary?.ageMs).toBe(900);
    expect(summary?.freshnessRatio).toBeCloseTo(0.999, 3);
    expect(summary?.status).toBe('fresh');
    expect(summary?.runtimeSource).toBe('global-publisher');
  });

  it('deduplicates repeated moments and limits compact output size', () => {
    const repeated = 'Build a precise temporal memory summary for the active sprint.';

    const summary = buildTemporalMemorySummary({
      timeContext: {
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        todayFocusMinutes: 90,
        currentEnergy: 81,
        runtimeSource: 'persistence-active',
        updatedAt: Date.now() - 2_000,
      },
      recentMessages: [
        { role: 'user', content: repeated, timestamp: 10 },
        { role: 'assistant', content: repeated, timestamp: 11 },
        { role: 'user', content: repeated, timestamp: 12 },
        {
          role: 'assistant',
          content:
            'Long tail block '.repeat(40) + 'to assert that compact timeline is bounded.',
          timestamp: 13,
        },
      ],
      ttlMs: 900_000,
    });

    expect(summary?.rawMomentsCount).toBe(4);
    expect(summary?.deduplicatedMomentsCount).toBe(2);
    expect(summary?.keyMoments.length).toBe(2);
    expect(summary?.compactTimeline.length ?? 0).toBeLessThanOrEqual(260);
    expect(summary?.promptSafeSummary.length ?? 0).toBeLessThanOrEqual(260);
  });

  it('emits truncation warnings when temporal summaries exceed hard bounds', () => {
    const summary = buildTemporalMemorySummary({
      timeContext: {
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'America/Toronto/'.repeat(12),
        currentSegment: 'Deep Focus '.repeat(24),
        isWorkHours: true,
        eventsToday: 222,
        eventsThisWeek: 777,
        todayFocusMinutes: 900,
        currentEnergy: 81,
        runtimeSource: 'persistence-active',
        updatedAt: Date.now() - 2_000,
      },
      recentMessages: [
        {
          role: 'assistant',
          content: 'Long temporal track '.repeat(80),
          timestamp: 13,
        },
      ],
      ttlMs: 900_000,
    });

    expect(summary?.warningCount).toBeGreaterThan(0);
    expect(summary?.warnings).toContain('compact_timeline_truncated');
    expect(summary?.warnings).toContain('prompt_summary_truncated');
  });

  it('clamps future updatedAt values and emits a bounded warning', () => {
    const summary = buildTemporalMemorySummary({
      timeContext: {
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        todayFocusMinutes: 90,
        currentEnergy: 81,
        runtimeSource: 'global-publisher',
        updatedAt: 2_100,
      },
      recentMessages: [],
      ttlMs: 900_000,
      now: 2_000,
    });

    expect(summary?.ageMs).toBe(0);
    expect(summary?.updatedAt).toBe(2_000);
    expect(summary?.warnings).toContain('future_timestamp_clamped');
  });

  it('skips malformed recent messages and reports the skip warning', () => {
    const malformedInput = [
      { role: 'user', content: 'valid event', timestamp: 1 },
      { role: 'system', content: 'invalid role', timestamp: 2 },
      { role: 'assistant', content: 123, timestamp: 3 },
    ] as unknown as Parameters<typeof buildTemporalMemorySummary>[0]['recentMessages'];

    const summary = buildTemporalMemorySummary({
      timeContext: {
        currentDateTime: '2026-05-09T10:22:00.000Z',
        timeZone: 'Europe/Paris',
        currentSegment: 'Deep Focus',
        isWorkHours: true,
        eventsToday: 2,
        eventsThisWeek: 7,
        todayFocusMinutes: 90,
        currentEnergy: 81,
        runtimeSource: 'global-publisher',
        updatedAt: 1_000,
      },
      recentMessages: malformedInput,
      ttlMs: 900_000,
      now: 1_300,
    });

    expect(summary?.keyMoments).toEqual(['user:valid event']);
    expect(summary?.warnings).toContain('malformed_recent_message_skipped');
  });

  it('does not mutate the caller-provided input objects', () => {
    const timeContext = {
      currentDateTime: '2026-05-09T10:22:00.000Z',
      timeZone: 'Europe/Paris',
      currentSegment: 'Deep Focus',
      isWorkHours: true,
      eventsToday: 2,
      eventsThisWeek: 7,
      todayFocusMinutes: 90,
      currentEnergy: 81,
      runtimeSource: 'global-publisher' as const,
      updatedAt: 1_000,
    };
    const recentMessages = [{ role: 'user' as const, content: 'snapshot', timestamp: 1 }];
    const before = {
      timeContext: structuredClone(timeContext),
      recentMessages: structuredClone(recentMessages),
    };

    buildTemporalMemorySummary({
      timeContext,
      recentMessages,
      ttlMs: 900_000,
      now: 1_400,
    });

    expect(timeContext).toEqual(before.timeContext);
    expect(recentMessages).toEqual(before.recentMessages);
  });
});
