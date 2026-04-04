import { describe, expect, it } from 'vitest';

import {
  buildConversationProviders,
  isConversationProviderReady,
} from '../../components/sections/conversationProviderReadiness';

type ConversationProviderEntry = ReturnType<typeof buildConversationProviders>[number];

describe('ConversationSection provider readiness truth', () => {
  it('keeps cloud providers unavailable by default until they are actually configured', () => {
    const providers = buildConversationProviders();

    expect(
      providers.find((provider: ConversationProviderEntry) => provider.id === 'ollama')
        ?.available
    ).toBe(true);
    expect(
      providers.find((provider: ConversationProviderEntry) => provider.id === 'openai')
        ?.available
    ).toBe(false);
    expect(
      providers.find((provider: ConversationProviderEntry) => provider.id === 'gemini')
        ?.available
    ).toBe(false);
    expect(
      providers.find((provider: ConversationProviderEntry) => provider.id === 'claude')
        ?.available
    ).toBe(false);
  });

  it('only enables a provider when readiness explicitly marks it available', () => {
    const providers = buildConversationProviders({
      openai: true,
      gemini: true,
    });

    expect(
      providers.find((provider: ConversationProviderEntry) => provider.id === 'openai')
        ?.available
    ).toBe(true);
    expect(
      providers.find((provider: ConversationProviderEntry) => provider.id === 'gemini')
        ?.available
    ).toBe(true);
    expect(isConversationProviderReady('openai', { openai: false })).toBe(false);
    expect(isConversationProviderReady('ollama', { ollama: true })).toBe(true);
  });
});
