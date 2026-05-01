import { describe, expect, it } from 'vitest';

import { DEFAULT_MODES } from './InstructionModeManager';

describe('InstructionModeManager default prompts', () => {
  it('keeps the assistant fallback aligned with natural advanced conversation expectations', () => {
    const assistantMode = DEFAULT_MODES.find(mode => mode.id === 'assistant');

    expect(assistantMode).toBeDefined();
    expect(assistantMode?.systemPrompt).toContain('langage humain et vivant');
    expect(assistantMode?.systemPrompt).toContain('créative');
    expect(assistantMode?.systemPrompt).toContain('confirmation');
  });
});
