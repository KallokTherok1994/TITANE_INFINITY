import { describe, expect, it } from 'vitest';

import { getPhaseLabel } from '@/types/numericTwin';

describe('numericTwin user-facing labels', () => {
  it('uses TWINS wording for the final synchronization phase', () => {
    const label = getPhaseLabel('Symbiosis');

    expect(label).toContain('TWINS');
    expect(label).not.toContain('Symbiose');
  });
});
