import { describe, expect, test } from 'vitest';
import { CHAT_TOOLS, type ChatTool } from '@/features/chat/chatToolsRegistry';
import { resolveConversationToolTemplate } from '@/components/sections/ConversationSection';

describe('ConversationSection tool routing integration', () => {
  test('known chat tool resolves to template flow', () => {
    const tool = CHAT_TOOLS[0] as ChatTool;
    const decision = resolveConversationToolTemplate(tool);

    expect(decision.blocked).toBe(false);
    expect(decision.reasonCode).toBe('template_only');
    expect(decision.templateValue).toBe(tool.templateText);
  });

  test('unknown chat tool degrades safely to template flow', () => {
    const unknownTool = {
      id: 'unknown-tool-id',
      label: 'Unknown',
      icon: '❓',
      description: 'unknown',
      templateText: 'Fallback prompt',
      category: 'generate',
      autoSend: false,
    } as ChatTool;

    const decision = resolveConversationToolTemplate(unknownTool);

    expect(decision.blocked).toBe(false);
    expect(decision.reasonCode).toBe('unknown_tool');
    expect(decision.userVisibleMessage).toContain('voie sûre');
    expect(decision.templateValue).toBe('Fallback prompt');
  });
});
