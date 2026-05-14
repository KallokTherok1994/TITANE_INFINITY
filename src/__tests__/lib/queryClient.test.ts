/**
 * TITANE_INFINITY v34.1.0 — QueryClient configuration tests
 */
import { describe, it, expect } from 'vitest';
import { queryClient } from '../../lib/queryClient';

describe('queryClient (v34.1.0)', () => {
  it('exports a singleton QueryClient with TITANE defaults', () => {
    const defaults = queryClient.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(30_000);
    expect(defaults.queries?.gcTime).toBe(5 * 60_000);
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false);
    expect(defaults.queries?.retry).toBe(1);
    expect(defaults.mutations?.retry).toBe(0);
  });
});
