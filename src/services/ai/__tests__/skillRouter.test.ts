import { describe, expect, it } from 'vitest';

import { routeSkill } from '../skillRouter';

describe('skillRouter', () => {
  it('route un skill sain et correspondant vers primary_route', () => {
    const decision = routeSkill({
      skillId: 'skill-architect',
      source: 'manual_active',
      packageHealthy: true,
      allowedForIntent: true,
      promptLength: 120,
    });

    expect(decision.activationMode).toBe('primary_route');
    expect(decision.reasonCode).toBe('manual_active_route');
    expect(decision.expiry).toBe('manual');
    expect(decision.safety.packageHealthy).toBe(true);
  });

  it('bloque un skill échoué ou archivé', () => {
    const failed = routeSkill({
      skillId: 'skill-failed',
      source: 'tool_invocation',
      packageHealthy: false,
      packageState: 'FAILED',
      allowedForIntent: true,
      promptLength: 80,
    });
    const archived = routeSkill({
      skillId: 'skill-archived',
      source: 'tool_invocation',
      packageHealthy: true,
      packageState: 'ARCHIVED',
      allowedForIntent: true,
      promptLength: 80,
    });

    expect(failed.activationMode).toBe('blocked');
    expect(failed.reasonCode).toBe('skill_unhealthy');
    expect(archived.activationMode).toBe('blocked');
    expect(archived.reasonCode).toBe('skill_archived');
  });

  it('n injecte pas automatiquement un skill incompatible', () => {
    const decision = routeSkill({
      skillId: 'skill-mismatch',
      source: 'kernel_intent',
      packageHealthy: true,
      allowedForIntent: false,
      promptLength: 120,
    });

    expect(decision.activationMode).toBe('suggest');
    expect(decision.reasonCode).toBe('intent_mismatch');
    expect(decision.safety.allowedForIntent).toBe(false);
  });

  it('bloque quand le prompt devient trop long', () => {
    const decision = routeSkill({
      skillId: 'skill-long',
      source: 'mode_mapping',
      packageHealthy: true,
      allowedForIntent: true,
      promptLength: 5000,
      maxPromptLength: 512,
    });

    expect(decision.activationMode).toBe('blocked');
    expect(decision.reasonCode).toBe('prompt_too_long');
    expect(decision.safety.promptTooLong).toBe(true);
  });
});
