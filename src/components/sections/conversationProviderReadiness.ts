import type { ConversationProviderPreference } from '@/services/conversationEngine';

const BASE_CONVERSATION_PROVIDERS: Array<{
  id: Extract<ConversationProviderPreference, 'gemini' | 'ollama' | 'openai' | 'claude'>;
  name: string;
  icon: string;
}> = [
  { id: 'gemini', name: 'Gemini', icon: '✨' },
  { id: 'ollama', name: 'Ollama', icon: '🦙' },
  { id: 'openai', name: 'OpenAI', icon: '🤖' },
  { id: 'claude', name: 'Claude', icon: '🧠' },
];

export type ConversationProviderReadiness = Partial<
  Record<ConversationProviderPreference, boolean>
>;

export const DEFAULT_CONVERSATION_PROVIDER_READINESS: Record<
  ConversationProviderPreference,
  boolean
> = {
  auto: true,
  local: true,
  ollama: true,
  openai: false,
  gemini: false,
  claude: false,
};

export function isConversationProviderReady(
  provider: ConversationProviderPreference,
  readiness: ConversationProviderReadiness = DEFAULT_CONVERSATION_PROVIDER_READINESS
): boolean {
  if (provider === 'auto' || provider === 'local' || provider === 'ollama') {
    return true;
  }

  return readiness[provider] === true;
}

export function buildConversationProviders(
  readiness: ConversationProviderReadiness = DEFAULT_CONVERSATION_PROVIDER_READINESS
): Array<{
  id: Extract<ConversationProviderPreference, 'gemini' | 'ollama' | 'openai' | 'claude'>;
  name: string;
  icon: string;
  available: boolean;
}> {
  return BASE_CONVERSATION_PROVIDERS.map(provider => ({
    ...provider,
    available: isConversationProviderReady(provider.id, readiness),
  }));
}
