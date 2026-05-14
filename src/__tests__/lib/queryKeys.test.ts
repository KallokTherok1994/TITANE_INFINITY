/**
 * TITANE_INFINITY v34.2.0 — queryKeys factory tests
 */
import { describe, it, expect } from 'vitest';
import { queryKeys } from '../../lib/queryKeys';

describe('queryKeys factory (v34.2.0)', () => {
  it('exposes system cluster with `all` prefix and `health` leaf', () => {
    expect(queryKeys.system.all).toEqual(['system']);
    expect(queryKeys.system.health()).toEqual(['system', 'health']);
  });

  it('exposes engines cluster with `status` leaf', () => {
    expect(queryKeys.engines.all).toEqual(['engines']);
    expect(queryKeys.engines.status()).toEqual(['engines', 'status']);
  });

  it('exposes providers cluster with `status` leaf', () => {
    expect(queryKeys.providers.all).toEqual(['providers']);
    expect(queryKeys.providers.status()).toEqual(['providers', 'status']);
  });

  it('exposes conversation cluster with `health` leaf', () => {
    expect(queryKeys.conversation.all).toEqual(['conversation']);
    expect(queryKeys.conversation.health()).toEqual(['conversation', 'health']);
  });

  it('exposes devtools cluster with `memoryHealth` leaf', () => {
    expect(queryKeys.devtools.all).toEqual(['devtools']);
    expect(queryKeys.devtools.memoryHealth()).toEqual(['devtools', 'memory-health']);
  });

  it('keys are stable (referential equality for the `all` array constants)', () => {
    expect(queryKeys.system.all).toBe(queryKeys.system.all);
    expect(queryKeys.engines.all).toBe(queryKeys.engines.all);
  });
});
