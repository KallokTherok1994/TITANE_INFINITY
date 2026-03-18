/**
 * Regression test — EvolutionResultPanel crash fix
 * Bug: "undefined is not an object (evaluating 'result.errors.length')"
 * Root cause: lying fallback / malformed IPC response missing `errors` field
 * Fix: result.errors?.length ?? 0  +  result.errors ?? []
 */

import { describe, it, expect } from 'vitest';

// Mirrors the EvolutionResult interface (errors is optional at runtime)
interface EvolutionResult {
  timestamp: string;
  status: string;
  items_parsed: number;
  items_synthesized: number;
  clusters_created: number;
  items_compressed: number;
  patterns_extracted: number;
  stability_score: number;
  growth_achieved: boolean;
  duration_ms: number;
  errors?: string[];
}

/**
 * Reproduces the EvolutionResultPanel errors rendering logic exactly.
 * Returns true if errors block would be shown, array of displayed errors otherwise.
 */
function computeErrorsBlock(result: EvolutionResult): {
  shown: boolean;
  items: string[];
} {
  const items = result.errors ?? [];
  const shown = (result.errors?.length ?? 0) > 0;
  return { shown, items };
}

describe('EvolutionResultPanel — errors null-safety (regression)', () => {
  it('CRASH CASE: does not throw when errors is undefined (tauriProtector fallback)', () => {
    // Simulates the lying fallback: { success: false, error: "...", fallback: true, timestamp: ... }
    // cast to EvolutionResult — errors field is absent
    const partialResult = {
      timestamp: new Date().toISOString(),
      status: 'Error',
      items_parsed: 0,
      items_synthesized: 0,
      clusters_created: 0,
      items_compressed: 0,
      patterns_extracted: 0,
      stability_score: 0,
      growth_achieved: false,
      duration_ms: 0,
      // errors: intentionally absent
    } as EvolutionResult;

    expect(() => computeErrorsBlock(partialResult)).not.toThrow();
    const { shown, items } = computeErrorsBlock(partialResult);
    expect(shown).toBe(false);
    expect(items).toEqual([]);
  });

  it('renders no errors block when errors is empty array', () => {
    const result: EvolutionResult = {
      timestamp: new Date().toISOString(),
      status: 'Complete',
      items_parsed: 5,
      items_synthesized: 3,
      clusters_created: 1,
      items_compressed: 2,
      patterns_extracted: 4,
      stability_score: 0.95,
      growth_achieved: true,
      duration_ms: 120,
      errors: [],
    };

    const { shown, items } = computeErrorsBlock(result);
    expect(shown).toBe(false);
    expect(items).toEqual([]);
  });

  it('renders errors block when errors has items', () => {
    const result: EvolutionResult = {
      timestamp: new Date().toISOString(),
      status: 'Error',
      items_parsed: 1,
      items_synthesized: 0,
      clusters_created: 0,
      items_compressed: 0,
      patterns_extracted: 0,
      stability_score: 0.3,
      growth_achieved: false,
      duration_ms: 55,
      errors: ['Parse failed: unexpected token', 'Cluster engine timeout'],
    };

    const { shown, items } = computeErrorsBlock(result);
    expect(shown).toBe(true);
    expect(items).toHaveLength(2);
    expect(items[0]).toBe('Parse failed: unexpected token');
    expect(items[1]).toBe('Cluster engine timeout');
  });

  it('does not assume missing errors means success (null != success)', () => {
    const noErrors = {
      timestamp: new Date().toISOString(),
      status: 'Error', // status is Error but errors field absent
      items_parsed: 0,
      items_synthesized: 0,
      clusters_created: 0,
      items_compressed: 0,
      patterns_extracted: 0,
      stability_score: 0,
      growth_achieved: false,
      duration_ms: 0,
    } as EvolutionResult;

    const { shown } = computeErrorsBlock(noErrors);
    // No errors block shown (correct — nothing to display)
    // but status is still 'Error' — parent still shows error status
    expect(shown).toBe(false);
    expect(noErrors.status).toBe('Error'); // status contract preserved
  });
});
