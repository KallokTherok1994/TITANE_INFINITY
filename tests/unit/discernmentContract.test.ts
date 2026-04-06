import { describe, expect, it } from 'vitest';
import { buildDiscernmentDecision } from '@/services/ai/discernmentContract';

describe('discernmentContract', () => {
  it('asks for clarification when inference requires clarify', () => {
    const decision = buildDiscernmentDecision({
      profileId: 'BALANCED',
      inferenceState: 'CLARIFY_REQUIRED',
      taskType: 'question',
      memoryAvailable: true,
      webAvailable: true,
      toolAvailable: true,
      providerAvailable: true,
    });

    expect(decision.askActHold).toBe('ask');
    expect(decision.reasonCodes).toContain('RC_CLARIFY');
  });

  it('acts with provider and memory available', () => {
    const decision = buildDiscernmentDecision({
      profileId: 'BALANCED',
      inferenceState: 'SAFE_TO_INFER',
      taskType: 'question',
      memoryAvailable: true,
      webAvailable: true,
      toolAvailable: false,
      providerAvailable: true,
    });

    expect(decision.askActHold).toBe('act');
    expect(decision.providerChoice).not.toBeNull();
    expect(decision.memoryAction).not.toBe('none');
    expect(decision.reasonCodes).toContain('RC_OK_INFER');
  });

  it('holds when provider unavailable', () => {
    const decision = buildDiscernmentDecision({
      profileId: 'DIRECT',
      inferenceState: 'SAFE_TO_INFER',
      taskType: 'question',
      memoryAvailable: false,
      webAvailable: false,
      toolAvailable: false,
      providerAvailable: false,
    });

    expect(decision.askActHold).toBe('hold');
    expect(decision.reasonCodes).toContain('RC_HOLD_NO_PROVIDER');
  });
});
