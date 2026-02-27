import { describe, expect, it } from 'vitest';

import { AutoRcaEngine, type AutoRcaTimelineEvent } from '../autoRcaEngine';

function event(overrides?: Partial<AutoRcaTimelineEvent>): AutoRcaTimelineEvent {
  return {
    timestampMs: 1_000,
    source: 'service',
    message: 'provider timeout during query',
    ...overrides,
  };
}

describe('AutoRcaEngine', () => {
  it('classifies runtime-errors with strong signal and medium/high confidence', () => {
    const engine = new AutoRcaEngine();

    const result = engine.classify({
      incidentId: 'inc-runtime',
      symptoms: 'panic exception with stack trace in runtime',
      timeline: [
        event({ source: 'engine', message: 'runtime error stack trace observed' }),
        event({
          timestampMs: 5_000,
          source: 'service',
          message: 'exception in service handler',
        }),
      ],
    });

    expect(result.category).toBe('runtime-errors');
    expect(['medium', 'high']).toContain(result.confidenceStatus);
    expect(result.timelineCorrelation.eventCount).toBe(2);
  });

  it('returns unknown when signal is insufficient', () => {
    const engine = new AutoRcaEngine();

    const result = engine.classify({
      incidentId: 'inc-unknown',
      symptoms: 'strange behavior',
      timeline: [event({ message: 'something happened', source: 'system' })],
    });

    expect(result.category).toBe('unknown');
    expect(result.confidenceStatus).toBe('unknown');
    expect(result.unknownReason).toBe('INSUFFICIENT_SIGNAL');
  });

  it('correlates timeline bursts in 10-second window', () => {
    const engine = new AutoRcaEngine();

    const result = engine.classify({
      incidentId: 'inc-correlation',
      symptoms: 'provider timeout timeout timeout',
      timeline: [
        event({ timestampMs: 10_000, message: 'provider timeout 1', source: 'provider' }),
        event({ timestampMs: 13_000, message: 'provider timeout 2', source: 'service' }),
        event({ timestampMs: 18_000, message: 'provider timeout 3', source: 'engine' }),
        event({ timestampMs: 30_500, message: 'provider timeout 4', source: 'provider' }),
      ],
    });

    expect(result.timelineCorrelation.maxBurstEventsIn10s).toBe(3);
  });

  it('builds proof-pack v2 frame with deterministic fields', () => {
    const engine = new AutoRcaEngine();
    const classification = engine.classify({
      incidentId: 'inc-proof',
      symptoms: 'permission denied unauthorized blocked',
      timeline: [
        event({ source: 'ipc', message: 'permission denied on command execute' }),
      ],
    });

    const frame = engine.buildProofPackV2Frame(classification, 99_000);

    expect(frame.incidentId).toBe('inc-proof');
    expect(frame.classificationAtMs).toBe(99_000);
    expect(frame.rootCauseCategory).toBe(classification.category);
  });
});
