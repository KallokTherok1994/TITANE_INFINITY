import { describe, expect, it } from 'vitest';

import {
  ControlLoopEngine,
  type ControlLoopInput,
  simulateNoStorm,
} from '../controlLoopEngine';

function baseInput(partial?: Partial<ControlLoopInput>): ControlLoopInput {
  return {
    loopId: 'loop-1',
    nowMs: 1_000_000,
    previousState: 'healthy',
    budget: 2,
    signals: [
      {
        subsystem: 'chat',
        severity: 0.9,
        message: 'chat timeout',
      },
    ],
    breakers: {
      provider: false,
      tools: false,
      memory: false,
    },
    ...partial,
  };
}

describe('ControlLoopEngine', () => {
  it('returns bounded remediation for critical state', () => {
    const engine = new ControlLoopEngine();
    const decision = engine.decide(baseInput());

    expect(decision.decision).toBe('REMEDIATE');
    expect(decision.boundedAction?.maxSteps).toBe(3);
    expect(decision.verifyOrRollback).toBe(true);
    expect(decision.budgetAfter).toBe(1);
  });

  it('triggers anti-oscillation cooldown', () => {
    const engine = new ControlLoopEngine();
    const decision = engine.decide(
      baseInput({
        lastActionAtMs: 990_000,
      })
    );

    expect(decision.decision).toBe('NO_ACTION');
    expect(decision.oscillationGuardTriggered).toBe(true);
    expect(decision.reasons).toContain('COOLDOWN_ACTIVE');
  });

  it('enters safe mode when budget is exhausted', () => {
    const engine = new ControlLoopEngine();
    const decision = engine.decide(baseInput({ budget: 0 }));

    expect(decision.decision).toBe('SAFE_MODE');
    expect(decision.reasons).toContain('BUDGET_EXHAUSTED');
    expect(decision.verifyOrRollback).toBe(true);
  });

  it('simulation reports no storm for alternating inputs', () => {
    const engine = new ControlLoopEngine();
    const sequence: ControlLoopInput[] = [
      baseInput({ loopId: 'l1', nowMs: 1_000_000 }),
      baseInput({
        loopId: 'l2',
        nowMs: 1_005_000,
        previousState: 'degraded',
        signals: [],
      }),
      baseInput({
        loopId: 'l3',
        nowMs: 1_010_000,
        previousState: 'degraded',
        signals: [],
      }),
      baseInput({ loopId: 'l4', nowMs: 1_050_000 }),
    ];

    const result = simulateNoStorm(engine, sequence);
    expect(result.noStorm).toBe(true);
  });
});
