/**
 * TITANE∞ — ConversationSection does NOT instantiate useChat
 *
 * Verifies that ConversationSection itself never calls useChat.
 * The canonical chat surface delegates message handling to
 * useConversationEngine; useChat is only consumed by the legacy
 * ChatWindow component.
 *
 * Covers:
 *   src/components/sections/ConversationSection.tsx  (no useChat import)
 *   src/components/ChatWindow.tsx                    (owns the single useChat call)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// ── Mock useChat so we can count invocations ───────────────────────────────

const useChatMock = vi.fn(() => ({
  messages: [],
  conversationId: 'mock-conv',
  sendMessage: vi.fn(),
  isLoading: false,
  error: null,
  clearMessages: vi.fn(),
  deleteConversation: vi.fn(),
}));

vi.mock('@/hooks/useChat', () => ({
  useChat: useChatMock,
}));

// ── Lightweight stubs for ConversationSection's heavy dependencies ──────────

vi.mock('@hooks/useConversationEngine', () => ({
  useConversationEngine: () => ({
    messages: [],
    sendMessage: vi.fn(),
    isLoading: false,
    error: null,
    clearMessages: vi.fn(),
    deleteConversation: vi.fn(),
    conversationId: 'mock-conv',
    healthReport: {},
    webSearchStatus: 'idle',
    saveStatus: 'idle',
    conversationMode: 'chat',
    setConversationMode: vi.fn(),
    providerPreference: 'auto',
    setProviderPreference: vi.fn(),
    cognitiveTrace: null,
    isOnline: true,
  }),
}));

vi.mock('@/hooks/queries/useChatProvidersHealthQuery', () => ({
  useChatProvidersHealthQuery: () => ({ data: null, isLoading: false }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/useVoiceEngine', () => ({
  useVoiceEngine: () => ({
    isListening: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    transcript: '',
    isSupported: false,
  }),
}));

vi.mock('@/stores/useChatModeStore', () => ({
  useChatModeStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({ currentModeId: 'default', changeMode: vi.fn() })
  ),
}));

vi.mock('@/services/conversationEngine', () => ({
  resetStaticPromptContextCache: vi.fn(),
  conversationEngine: { initialize: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Stub every other import ConversationSection pulls in
vi.mock('@/design-system', () => ({
  TSectionHeader: ({ children }: { children?: React.ReactNode }) => React.createElement('div', null, children),
}));

vi.mock('@/features/chat/ThinkingPanel', () => ({
  ThinkingPanel: () => null,
  useThinkingSteps: () => ({ steps: [], addStep: vi.fn(), clearSteps: vi.fn() }),
}));

vi.mock('@/features/chat/exportImport', () => ({
  downloadConversation: vi.fn(),
  downloadMarkdown: vi.fn(),
  copyToClipboard: vi.fn(),
  generateAndSaveFile: vi.fn(),
}));

vi.mock('@/services/tts/hybridTTS', () => ({
  hybridTTS: { speak: vi.fn(), stop: vi.fn(), isSpeaking: false },
}));

vi.mock('@/features/chat/ChatProviderSelector', () => ({
  ChatProviderSelector: () => null,
}));

vi.mock('@/components/chat/ChatModeSelector', () => ({
  ChatModeSelector: () => null,
}));

vi.mock('@/components/chat/ChatToolbar', () => ({
  ChatToolbar: () => null,
}));

vi.mock('@/components/chat/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => React.createElement('div', null, content),
}));

vi.mock('@/components/conversation/ModeBuilder', () => ({
  ModeBuilder: () => null,
}));

vi.mock('@/config/chatModes.config', () => ({
  registerCustomMode: vi.fn(),
  chatModes: [],
}));

vi.mock('./conversationProviderReadiness', () => ({
  buildConversationProviders: vi.fn(() => ({})),
  DEFAULT_CONVERSATION_PROVIDER_READINESS: {},
  isConversationProviderReady: vi.fn(() => false),
}));

vi.mock('@/components/chat/FileUploadButton', () => ({
  FileUploadButton: () => null,
}));

vi.mock('@/components/chat/fileImportPrompt', () => ({
  buildImportedFilesPrompt: vi.fn(() => ''),
}));

// ── Import the component under test ───────────────────────────────────────

import { ConversationSection } from '@/components/sections/ConversationSection';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('ConversationSection — does NOT instantiate useChat', () => {
  beforeEach(() => {
    useChatMock.mockClear();
  });

  it('renders without calling useChat at all', () => {
    // ConversationSection renders successfully without error
    expect(() =>
      render(React.createElement(ConversationSection as React.ComponentType))
    ).not.toThrow();

    // useChat must never have been called — ConversationSection delegates to
    // useConversationEngine, not useChat.
    expect(useChatMock).toHaveBeenCalledTimes(0);
  });

  it('useChat call count across the entire render tree is at most once (ChatWindow is not rendered)', () => {
    render(React.createElement(ConversationSection as React.ComponentType));

    // ConversationSection does not render ChatWindow, so useChat is never called.
    expect(useChatMock.mock.calls.length).toBe(0);
  });
});
