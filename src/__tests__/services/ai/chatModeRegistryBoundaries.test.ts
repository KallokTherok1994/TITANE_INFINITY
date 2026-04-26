import { describe, expect, it } from 'vitest';

import {
  CHAT_MODES,
  SYSTEM_PROMPTS,
  getSystemPrompt,
  registerCustomMode,
} from '@/config/chatModes.config';
import {
  CHAT_MODES_CONFIG,
  chatModesLegacy,
  getAccessibleModes,
} from '@/services/ai/chatModes.config';

describe('Chat mode registry boundaries', () => {
  it('legacy registry remains the canonical runtime path for custom mode prompt resolution', () => {
    const customModeId = 'custom-boundary-registry-test';
    const customPrompt = 'Prompt custom runtime legacy boundary.';

    registerCustomMode(customModeId, customPrompt);

    expect(getSystemPrompt(customModeId)).toBe(customPrompt);
    expect(getSystemPrompt('default')).toBe(SYSTEM_PROMPTS.default);
    expect(CHAT_MODES.default.system_prompt).toBe(SYSTEM_PROMPTS.default);
  });

  it('extended registry remains the canonical path for modern accessible mode metadata', () => {
    const accessibleModes = getAccessibleModes(5);
    const accessibleModeIds = accessibleModes.map(mode => mode.id);

    expect(accessibleModeIds).toContain('standard');
    expect(accessibleModeIds).toContain('strategy');
    expect(CHAT_MODES_CONFIG.standard.systemPrompt).toContain("maître d'analyse");
    expect(CHAT_MODES_CONFIG.strategy.systemPrompt).toContain('rapports décisionnels');
  });

  it('extended registry still exposes a legacy adapter instead of replacing the legacy runtime registry', () => {
    expect(chatModesLegacy.standard.systemPrompt).toBe(
      CHAT_MODES_CONFIG.standard.systemPrompt
    );
    expect(chatModesLegacy.strategy.systemPrompt).toBe(
      CHAT_MODES_CONFIG.strategy.systemPrompt
    );
    expect(CHAT_MODES.coach.system_prompt).toBe(SYSTEM_PROMPTS.coach);
  });
});