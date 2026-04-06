import { describe, expect, it } from 'vitest';

import { deriveAiStatus } from '../TopNav';

describe('TopNav AI status truth', () => {
  it('ignores local fallback in cloud health percentage', () => {
    const result = deriveAiStatus([
      { provider: 'gemini', available: false },
      { provider: 'ollama', available: true },
      { provider: 'local', available: true },
    ]);

    expect(result).toEqual({
      percent: 50,
      available: 1,
      total: 2,
    });
  });

  it('returns unknown percentage when only local fallback exists', () => {
    const result = deriveAiStatus([{ provider: 'local', available: true }]);

    expect(result).toEqual({
      percent: null,
      available: 0,
      total: 0,
    });
  });
});
