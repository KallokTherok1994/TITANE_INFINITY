import { describe, expect, it } from 'vitest';

import { DEFAULT_MODES } from './InstructionModeManager';

describe('InstructionModeManager default prompts', () => {
  it('keeps the assistant fallback aligned with advanced analysis expectations', () => {
    const assistantMode = DEFAULT_MODES.find(mode => mode.id === 'assistant');

    expect(assistantMode).toBeDefined();
    expect(assistantMode?.systemPrompt).toContain("maître d'analyse");
    expect(assistantMode?.systemPrompt).toContain('rapports');
    expect(assistantMode?.systemPrompt).toContain('confirmation');
  });
});
