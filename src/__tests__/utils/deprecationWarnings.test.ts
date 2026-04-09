import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resetWarnOnceRegistryForTests,
  warnOncePerSession,
} from '@/utils/deprecationWarnings';

describe('deprecationWarnings', () => {
  beforeEach(() => {
    resetWarnOnceRegistryForTests();
    vi.restoreAllMocks();
  });

  it('warns only once per key', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    warnOncePerSession('voice-hook', 'useVoice is deprecated');
    warnOncePerSession('voice-hook', 'useVoice is deprecated');
    warnOncePerSession('voice-mode', 'useVoiceMode is deprecated');

    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('useVoice is deprecated');
    expect(warnSpy.mock.calls[1]?.[0]).toContain('useVoiceMode is deprecated');
  });
});
