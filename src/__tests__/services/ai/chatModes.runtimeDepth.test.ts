import { describe, expect, it } from 'vitest';

import { chatModes } from '@/services/ai/chatModes';
import { CHAT_MODES_CONFIG } from '@/services/ai/chatModes.config';

describe('Chat modes runtime depth floor', () => {
  it('runtime chat modes keep high depth while sounding more human on main conversational lanes', () => {
    expect(chatModes.default.systemPrompt).toContain('langage humain, vivant et naturel');
    expect(chatModes.default.systemPrompt).toContain(
      'ne pas exposer les phases internes'
    );
    expect(chatModes.synthesis.systemPrompt).toContain('synthèse avancée');
    expect(chatModes.planning.systemPrompt).toContain('niveau expert');
    expect(chatModes.debug_cognitive.systemPrompt).toContain('analyste expert');
  });

  it('extended chat mode config keeps advanced depth with natural-expression guardrails', () => {
    expect(CHAT_MODES_CONFIG.standard.systemPrompt).toContain(
      'Conversation équilibrée, naturelle'
    );
    expect(CHAT_MODES_CONFIG.standard.systemPrompt).toContain(
      'ne montre ni tes phases ni ton raisonnement interne'
    );
    expect(CHAT_MODES_CONFIG.strategy.systemPrompt).toContain(
      'rédaction décisionnelle claire'
    );
    expect(CHAT_MODES_CONFIG.audit.systemPrompt).toContain("rapports d'audit");
    expect(CHAT_MODES_CONFIG.dev.systemPrompt).toContain('expertise senior');
    expect(CHAT_MODES_CONFIG.quick.systemPrompt).toContain('FAST');
    expect(CHAT_MODES_CONFIG.creation.systemPrompt).toContain('créatif');
    expect(CHAT_MODES_CONFIG.reflection.systemPrompt).toContain(
      'restent internes sauf si Kevin demande explicitement la méthode'
    );
  });
});
