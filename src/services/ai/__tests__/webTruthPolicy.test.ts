import { describe, expect, it } from 'vitest';

import { evaluateWebTruthPolicy } from '../webTruthPolicy';

describe('evaluateWebTruthPolicy', () => {
  it('returns not_needed when no web signal exists', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'Explique ce concept simplement.',
      })
    ).toMatchObject({
      need: 'not_needed',
      status: 'not_needed',
      shouldUseWeb: false,
    });
  });

  it('requires web for freshness requests', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'What is the latest release today?',
        webAttempted: false,
      })
    ).toMatchObject({
      need: 'freshness_required',
      status: 'needed_not_attempted',
      shouldWarnUser: true,
    });
  });

  it('marks attempted_no_sources when web was used without citations', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'Trouve des sources sur ce sujet',
        citationsCount: 0,
        webAttempted: true,
        webAvailable: true,
      })
    ).toMatchObject({
      need: 'source_required',
      status: 'attempted_no_sources',
    });
  });

  it('marks attempted_success when sources are present', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'Browse and verify this claim.',
        citationsCount: 3,
        factualClaimsDetected: true,
        webAttempted: true,
        webAvailable: true,
      })
    ).toMatchObject({
      status: 'attempted_success',
      shouldWarnUser: false,
    });
  });

  it('detects explicit user_requested_web need when "internet" is in message', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'Cherche sur internet la réponse à ma question.',
        webAttempted: false,
      })
    ).toMatchObject({
      need: 'user_requested_web',
      shouldUseWeb: true,
      shouldWarnUser: true,
    });
  });

  it('marks unavailable status when web fails with offline reason', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'Give me the current API version.',
        webAttempted: true,
        webAvailable: false,
        failureReasonCode: 'network_unavailable',
      })
    ).toMatchObject({
      status: 'unavailable',
      shouldWarnUser: true,
    });
  });

  it('detects blocked status when policy blocks the web request', () => {
    expect(
      evaluateWebTruthPolicy({
        userMessage: 'Check online for recent data.',
        blocked: true,
        webAttempted: false,
      })
    ).toMatchObject({
      status: 'blocked',
      shouldWarnUser: true,
    });
  });
});
