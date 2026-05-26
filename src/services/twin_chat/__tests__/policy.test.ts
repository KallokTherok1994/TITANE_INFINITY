import { describe, expect, it } from 'vitest';

import { createTwinConsentShadowEntry } from '../createTwinConsentShadowEntry';
import { evaluateTwinChatShadowPolicy } from '../policy';

describe('evaluateTwinChatShadowPolicy', () => {
  it('forces review for identity-sensitive auto-detected value observations', () => {
    const entry = createTwinConsentShadowEntry({
      id: 'value:clarte',
      kind: 'value',
      contentCompact: 'clarte',
      context: 'conversation',
      confidence: 0.99,
      evidenceSource: 'chat_turn',
      consentRisk: 'medium',
      status: 'shadow',
      canWriteTwin: false,
      route: '/titane',
      moduleId: 'conversation',
    });

    const decision = evaluateTwinChatShadowPolicy(entry);

    expect(decision.verdict).toBe('review_required');
    expect(decision.requiresKevinValidation).toBe(true);
    expect(decision.canWriteTwin).toBe(false);
    expect(decision.validationStatus).toBe('requires_kevin_validation');
  });

  it('downgrades cognitive observations to a safe preference shadow entry', () => {
    const entry = createTwinConsentShadowEntry({
      id: 'cognitive:reasoning_structured',
      kind: 'cognitive',
      contentCompact: 'reasoning_structured',
      context: 'conversation',
      confidence: 0.74,
      evidenceSource: 'chat_turn',
      consentRisk: 'low',
      status: 'shadow',
      canWriteTwin: false,
      route: '/titane',
      moduleId: 'conversation',
    });

    const decision = evaluateTwinChatShadowPolicy(entry);

    expect(decision.observationType).toBe('preference');
    expect(decision.verdict).toBe('downgraded');
    expect(decision.requiresKevinValidation).toBe(false);
    expect(decision.canWriteTwin).toBe(false);
  });

  it('keeps emotional auto-detected observations under review regardless of confidence', () => {
    const entry = createTwinConsentShadowEntry({
      id: 'emotional:emotion_anxiete',
      kind: 'emotional',
      contentCompact: 'emotion_anxiete',
      context: 'conversation',
      confidence: 1,
      evidenceSource: 'chat_turn',
      consentRisk: 'identity_sensitive',
      status: 'shadow',
      canWriteTwin: false,
      route: '/titane',
      moduleId: 'conversation',
    });

    const decision = evaluateTwinChatShadowPolicy(entry);

    expect(decision.verdict).toBe('review_required');
    expect(decision.requiresKevinValidation).toBe(true);
    expect(decision.validationStatus).toBe('requires_kevin_validation');
  });
});
