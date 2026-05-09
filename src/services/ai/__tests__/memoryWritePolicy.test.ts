import { describe, expect, it } from 'vitest';

import { decideMemoryWrite } from '../memoryWritePolicy';

describe('memoryWritePolicy', () => {
  it('n ecrit rien quand safeToRemember=false', () => {
    const decision = decideMemoryWrite({
      safeToRemember: false,
      verdict: 'PASS',
    });

    expect(decision.shouldWrite).toBe(false);
    expect(decision.target).toBe('none');
    expect(decision.blockedBy).toContain('trace.final.safeToRemember=false');
  });

  it('n ecrit pas durablement sur un verdict bloqué', () => {
    const decision = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'BLOCKED',
    });

    expect(decision.shouldWrite).toBe(false);
    expect(decision.reasonCode).toBe('non_durable_verdict');
  });

  it('route une preference explicite vers preferences', () => {
    const decision = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      explicitPreference: true,
      confidence: 0.8,
    });

    expect(decision.shouldWrite).toBe(true);
    expect(decision.target).toBe('preferences');
    expect(decision.durability).toBe('long_term');
  });

  it('route un état émotionnel temporaire vers stm/session', () => {
    const decision = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      temporaryEmotion: true,
      confidence: 0.6,
    });

    expect(decision.shouldWrite).toBe(true);
    expect(decision.target).toBe('stm');
    expect(decision.durability).toBe('session');
  });

  it('route une décision projet durable vers project_memory ou mtm', () => {
    const highConfidence = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      durableProjectDecision: true,
      confidence: 0.9,
    });
    const midConfidence = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      durableProjectDecision: true,
      confidence: 0.72,
    });

    expect(highConfidence.target).toBe('project_memory');
    expect(highConfidence.durability).toBe('long_term');
    expect(midConfidence.target).toBe('mtm');
    expect(midConfidence.durability).toBe('medium');
  });

  it('refuse un fait personnel stable sans confiance suffisante', () => {
    const decision = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      stablePersonalFact: true,
      confidence: 0.6,
    });

    expect(decision.shouldWrite).toBe(false);
    expect(decision.reasonCode).toBe('stable_personal_fact_low_confidence');
  });

  it('refuse les faits non verifies et les cas de conflit mémoire', () => {
    const unverified = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      factualClaimsVerified: false,
      confidence: 0.9,
    });
    const conflict = decideMemoryWrite({
      safeToRemember: true,
      verdict: 'PASS',
      memoryConflict: true,
      confidence: 0.9,
    });

    expect(unverified.shouldWrite).toBe(false);
    expect(unverified.reasonCode).toBe('factual_claims_unverified');
    expect(conflict.shouldWrite).toBe(false);
    expect(conflict.reasonCode).toBe('memory_conflict');
  });
});
