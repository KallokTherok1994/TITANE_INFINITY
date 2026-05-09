import { describe, expect, it } from 'vitest';

import {
  hasForbiddenReasoningOutput,
  resolveReasoningContract,
} from '../reasoningContract';

describe('reasoningContract', () => {
  it('mappe DIRECT vers minimal et court', () => {
    const contract = resolveReasoningContract({ requestStyle: 'simple' });

    expect(contract.internalDepth).toBe('minimal');
    expect(contract.outputCompression).toBe('short');
    expect(contract.visibleRationale).toBe('none');
    expect(contract.maxSections).toBe(2);
  });

  it('mappe DEEP vers structured sans raw reasoning', () => {
    const contract = resolveReasoningContract({ requestStyle: 'deep' });

    expect(contract.internalDepth).toBe('deep');
    expect(contract.outputCompression).toBe('structured');
    expect(contract.visibleRationale).toBe('brief');
    expect(contract.forbiddenOutputPatterns).toContain('chainOfThought');
  });

  it('reste sobre pour les demandes créatives', () => {
    const contract = resolveReasoningContract({ requestStyle: 'creative' });

    expect(contract.internalDepth).toBe('balanced');
    expect(contract.outputCompression).toBe('normal');
    expect(contract.visibleRationale).toBe('brief');
    expect(contract.maxSections).toBeLessThanOrEqual(3);
  });

  it('OMEGA reste proof-driven et structuré', () => {
    const contract = resolveReasoningContract({ profileId: 'OMEGA' });

    expect(contract.internalDepth).toBe('omega');
    expect(contract.outputCompression).toBe('deep_structured');
    expect(contract.visibleRationale).toBe('decision_trace');
    expect(contract.proofMode).toBe(true);
  });

  it('bloque les patterns de raisonnement brut', () => {
    const contract = resolveReasoningContract({ requestStyle: 'architectural' });

    expect(hasForbiddenReasoningOutput('hiddenThoughts: secret', contract)).toBe(true);
    expect(hasForbiddenReasoningOutput('simple response', contract)).toBe(false);
  });
});
