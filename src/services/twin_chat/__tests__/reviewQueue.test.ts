import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  approveTwinChatReviewItem,
  listTwinChatReviewItems,
  recordTwinChatReviewItems,
  rejectTwinChatReviewItem,
} from '../reviewQueue';
import { numericTwinService } from '@/services/api/numericTwin';
import type { TwinChatObservationCandidate, TwinChatPolicyDecision } from '../types';

vi.mock('@/services/api/numericTwin', () => ({
  numericTwinService: {
    observeValue: vi.fn(),
    observeCognitivePattern: vi.fn(),
    observeStyle: vi.fn(),
    observeEmotional: vi.fn(),
    refreshChatContextSnapshot: vi.fn(),
  },
}));

const styleCandidate: TwinChatObservationCandidate = {
  id: 'style:style_direct',
  kind: 'style',
  contentCompact: 'style_direct',
  context: 'conversation',
  confidence: 0.79,
  evidenceSource: 'chat_turn',
  consentRisk: 'low',
  status: 'shadow',
  canWriteTwin: false,
  route: '/titane',
  moduleId: 'conversation',
};

const valueCandidate: TwinChatObservationCandidate = {
  id: 'value:clarte',
  kind: 'value',
  contentCompact: 'clarte',
  context: 'conversation',
  confidence: 0.88,
  evidenceSource: 'chat_turn',
  consentRisk: 'medium',
  status: 'shadow',
  canWriteTwin: false,
  route: '/titane',
  moduleId: 'conversation',
};

const blockedDecision: TwinChatPolicyDecision = {
  candidateId: 'emotional:panic',
  verdict: 'blocked',
  observationType: 'emotional_pattern',
  validationStatus: 'blocked',
  riskLevel: 'identity_sensitive',
  canWriteTwin: false,
  requiresKevinValidation: true,
};

describe('twin_chat reviewQueue', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('records only actionable review_required and downgraded items', () => {
    recordTwinChatReviewItems({
      candidates: [styleCandidate, valueCandidate],
      decisions: [
        {
          candidateId: styleCandidate.id,
          verdict: 'downgraded',
          observationType: 'preference',
          validationStatus: 'system_observed',
          riskLevel: 'low',
          canWriteTwin: false,
          requiresKevinValidation: false,
        },
        {
          candidateId: valueCandidate.id,
          verdict: 'review_required',
          observationType: 'value',
          validationStatus: 'requires_kevin_validation',
          riskLevel: 'medium',
          canWriteTwin: false,
          requiresKevinValidation: true,
        },
        blockedDecision,
      ],
      now: '2026-05-15T12:00:00.000Z',
    });

    expect(listTwinChatReviewItems()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: styleCandidate.id,
          writeStatus: 'pending',
          decision: expect.objectContaining({ verdict: 'downgraded' }),
        }),
        expect.objectContaining({
          id: valueCandidate.id,
          writeStatus: 'pending',
          decision: expect.objectContaining({ verdict: 'review_required' }),
        }),
      ])
    );
    expect(listTwinChatReviewItems()).toHaveLength(2);
  });

  it('approves a pending review and writes to the matching numericTwin method', async () => {
    recordTwinChatReviewItems({
      candidates: [styleCandidate],
      decisions: [
        {
          candidateId: styleCandidate.id,
          verdict: 'downgraded',
          observationType: 'preference',
          validationStatus: 'system_observed',
          riskLevel: 'low',
          canWriteTwin: false,
          requiresKevinValidation: false,
        },
      ],
    });
    vi.mocked(numericTwinService.observeStyle).mockResolvedValue('sync-style-42');
    vi.mocked(numericTwinService.refreshChatContextSnapshot).mockResolvedValue(undefined);

    const approved = await approveTwinChatReviewItem(styleCandidate.id);

    expect(numericTwinService.observeStyle).toHaveBeenCalledWith(
      'style_direct',
      'conversation',
      0.79
    );
    expect(numericTwinService.refreshChatContextSnapshot).toHaveBeenCalledTimes(1);
    expect(approved.writeStatus).toBe('approved');
    expect(approved.syncId).toBe('sync-style-42');
  });

  it('marks a review as rejected without calling the write path', () => {
    recordTwinChatReviewItems({
      candidates: [valueCandidate],
      decisions: [
        {
          candidateId: valueCandidate.id,
          verdict: 'review_required',
          observationType: 'value',
          validationStatus: 'requires_kevin_validation',
          riskLevel: 'medium',
          canWriteTwin: false,
          requiresKevinValidation: true,
        },
      ],
    });

    const rejected = rejectTwinChatReviewItem(valueCandidate.id);

    expect(rejected.writeStatus).toBe('rejected');
    expect(numericTwinService.observeValue).not.toHaveBeenCalled();
  });
});
