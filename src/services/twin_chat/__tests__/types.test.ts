import { describe, expect, it } from 'vitest';

import type { TwinChatObservationCandidate } from '../types';

describe('twin_chat types', () => {
  it('constrains candidates to shadow read-only semantics', () => {
    const candidate: TwinChatObservationCandidate = {
      id: 'value:clarte',
      kind: 'value',
      contentCompact: 'clarte',
      context: 'conversation',
      confidence: 0.72,
      evidenceSource: 'chat_turn',
      consentRisk: 'medium',
      status: 'shadow',
      canWriteTwin: false,
      route: '/titane?tab=conversation',
      moduleId: 'conversation',
    };

    expect(candidate.evidenceSource).toBe('chat_turn');
    expect(candidate.status).toBe('shadow');
    expect(candidate.canWriteTwin).toBe(false);
  });
});
