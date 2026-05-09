import { describe, expect, it } from 'vitest';

import {
  CHAT_TOOL_CAPABILITIES,
  getChatToolCapability,
  isTemplateOnlyChatTool,
  listChatToolCapabilities,
} from '../../../features/chat/chatToolCapabilities';
import { CHAT_TOOLS } from '../../../features/chat/chatToolsRegistry';
import { routeChatToolInvocation } from '../../../features/chat/chatToolRouter';

describe('chatToolCapabilities', () => {
  it('couvre tous les outils du registre UI', () => {
    const registryIds = CHAT_TOOLS.map(tool => tool.id);
    const capabilityIds = Object.keys(CHAT_TOOL_CAPABILITIES);

    expect(capabilityIds).toHaveLength(registryIds.length);
    expect(new Set(capabilityIds).size).toBe(registryIds.length);
    expect(capabilityIds.sort()).toEqual(registryIds.sort());
  });

  it('classe generate_file comme outil template honnête', () => {
    const capability = getChatToolCapability('generate_file');

    expect(capability).toBeDefined();
    expect(capability?.invocationType).toBe('template');
    expect(capability?.requires.tauri).toBe(false);
    expect(capability?.requires.web).toBe(false);
    expect(capability?.proof.successReasonCode).toBe('template_only');
    expect(capability?.fallback.canDegradeToTemplate).toBe(true);
    expect(isTemplateOnlyChatTool('generate_file')).toBe(true);
  });

  it('route tous les outils connus vers la voie template', () => {
    const routed = routeChatToolInvocation('deep_reflection');

    expect(routed.invocationType).toBe('template');
    expect(routed.shouldSendAsTemplate).toBe(true);
    expect(routed.reasonCode).toBe('template_only');
  });

  it('retombe honnêtement sur template pour un outil inconnu', () => {
    const routed = routeChatToolInvocation('unknown_tool');

    expect(routed.invocationType).toBe('template');
    expect(routed.reasonCode).toBe('unknown_tool');
    expect(routed.canDegradeToTemplate).toBe(true);
  });

  it('liste toutes les capacités dans le même ordre que le registre', () => {
    const capabilities = listChatToolCapabilities();

    expect(capabilities).toHaveLength(CHAT_TOOLS.length);
    expect(capabilities.map(capability => capability.id)).toEqual(
      CHAT_TOOLS.map(tool => tool.id)
    );
  });
});
