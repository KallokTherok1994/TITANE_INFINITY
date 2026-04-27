import { describe, expect, it } from 'vitest';

import { CHAT_MODES, getSystemPrompt } from '@/config/chatModes.config';
import { CHAT_MODES_CONFIG } from '@/services/ai/chatModes.config';

describe('Chat mode unified runtime bridge', () => {
  it('bridges extended-only modes into the legacy runtime registry', () => {
    expect(CHAT_MODES.quick).toBeDefined();
    expect(CHAT_MODES.strategy).toBeDefined();
    expect(CHAT_MODES.quick.metadata?.sourceRegistry).toBe('extended-bridge');
    expect(CHAT_MODES.strategy.metadata?.sourceRegistry).toBe('extended-bridge');
  });

  it('resolves the final runtime prompt from the extended registry for bridged modes', () => {
    expect(getSystemPrompt('quick')).toBe(CHAT_MODES_CONFIG.quick.systemPrompt);
    expect(getSystemPrompt('strategy')).toBe(CHAT_MODES_CONFIG.strategy.systemPrompt);
  });
});
