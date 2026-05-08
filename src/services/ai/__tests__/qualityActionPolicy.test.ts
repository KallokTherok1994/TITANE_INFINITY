import { describe, expect, it } from 'vitest';

import { evaluateQualityActionPolicy } from '../qualityActionPolicy';

describe('evaluateQualityActionPolicy', () => {
  it('returns QUALIFIED floor when quality is not evaluated', () => {
    expect(
      evaluateQualityActionPolicy({
        evaluated: false,
      }),
    ).toMatchObject({
      action: 'enhance',
      minimumVerdict: 'QUALIFIED',
      reasonCode: 'not_evaluated',
    });
  });

  it('returns UNCERTAIN floor for very low quality', () => {
    expect(
      evaluateQualityActionPolicy({
        evaluated: true,
        score: 0.2,
        shouldEnhance: true,
      }),
    ).toMatchObject({
      action: 'block',
      minimumVerdict: 'UNCERTAIN',
      reasonCode: 'quality_blocked',
    });
  });

  it('returns PASS floor for good quality', () => {
    expect(
      evaluateQualityActionPolicy({
        evaluated: true,
        score: 0.9,
        shouldEnhance: false,
      }),
    ).toMatchObject({
      action: 'none',
      minimumVerdict: 'PASS',
      reasonCode: 'quality_pass',
    });
  });

  it('returns QUALIFIED floor for mid-range quality (0.45–0.65)', () => {
    expect(
      evaluateQualityActionPolicy({
        evaluated: true,
        score: 0.60,
        shouldEnhance: true,
      }),
    ).toMatchObject({
      minimumVerdict: 'QUALIFIED',
      reasonCode: 'quality_enhance',
    });
  });

  it('returns BLOCKED floor when clarification is required', () => {
    expect(
      evaluateQualityActionPolicy({
        evaluated: true,
        score: 0.3,
        inferenceState: 'CLARIFY_REQUIRED',
      }),
    ).toMatchObject({
      action: 'clarify',
      minimumVerdict: 'BLOCKED',
      reasonCode: 'clarify_required',
    });
  });

  it('flags warnUser for low quality', () => {
    const result = evaluateQualityActionPolicy({
      evaluated: true,
      score: 0.3,
    });
    expect(result.warnUser).toBe(true);
  });

  it('does not flag warnUser for passing quality', () => {
    const result = evaluateQualityActionPolicy({
      evaluated: true,
      score: 0.85,
    });
    expect(result.warnUser).toBe(false);
  });
});
