import { describe, expect, it } from 'vitest';

import { chatModes } from '@/services/ai/chatModes';
import { CHAT_MODES_CONFIG } from '@/services/ai/chatModes.config';

describe('Chat modes runtime depth floor', () => {
  it('runtime chat modes keep advanced positioning on main conversational lanes', () => {
    expect(chatModes.default.systemPrompt).toContain("maître d'analyse");
    expect(chatModes.synthesis.systemPrompt).toContain('synthèse avancée');
    expect(chatModes.planning.systemPrompt).toContain('niveau expert');
    expect(chatModes.debug_cognitive.systemPrompt).toContain('analyste expert');
  });

  it('extended chat mode config keeps expert-grade positioning on strategic lanes', () => {
    expect(CHAT_MODES_CONFIG.standard.systemPrompt).toContain("maître d'analyse");
    expect(CHAT_MODES_CONFIG.strategy.systemPrompt).toContain('rapports décisionnels');
    expect(CHAT_MODES_CONFIG.audit.systemPrompt).toContain("rapports d'audit");
    expect(CHAT_MODES_CONFIG.dev.systemPrompt).toContain('niveau senior');
    expect(CHAT_MODES_CONFIG.quick.systemPrompt).toContain('niveau expert');
    expect(CHAT_MODES_CONFIG.creation.systemPrompt).toContain('créativité appliquée');
  });
});