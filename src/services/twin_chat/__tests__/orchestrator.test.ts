import { describe, expect, it } from 'vitest';

import { orchestrateTwinChatShadow } from '../orchestrator';

describe('orchestrateTwinChatShadow', () => {
  it('aggregates policy verdicts without enabling writes', () => {
    const result = orchestrateTwinChatShadow([
      {
        id: 'style:style_direct',
        kind: 'style',
        contentCompact: 'style_direct',
        context: 'conversation',
        confidence: 0.76,
        evidenceSource: 'chat_turn',
        consentRisk: 'low',
        status: 'shadow',
        canWriteTwin: false,
        route: '/titane',
        moduleId: 'conversation',
      },
      {
        id: 'value:clarte',
        kind: 'value',
        contentCompact: 'clarte',
        context: 'conversation',
        confidence: 0.72,
        evidenceSource: 'chat_turn',
        consentRisk: 'medium',
        status: 'shadow',
        canWriteTwin: false,
        route: '/titane',
        moduleId: 'conversation',
      },
    ]);

    expect(result.summary.candidateCount).toBe(2);
    expect(result.summary.kinds).toEqual(expect.arrayContaining(['style', 'value']));
    expect(result.summary.verdictCounts).toEqual(
      expect.objectContaining({ downgraded: 1, review_required: 1 })
    );
    expect(result.decisions.every(decision => decision.canWriteTwin === false)).toBe(
      true
    );
  });

  it('returns an empty summary for empty candidate batches', () => {
    const result = orchestrateTwinChatShadow([]);

    expect(result.decisions).toEqual([]);
    expect(result.summary).toEqual({
      candidateCount: 0,
      kinds: [],
      verdictCounts: {},
    });
  });
});
