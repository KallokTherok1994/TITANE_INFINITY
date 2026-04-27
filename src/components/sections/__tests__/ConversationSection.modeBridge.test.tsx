import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const conversationModeBridgeFixtures = vi.hoisted(() => ({
  currentMode: 'default',
  setMode: vi.fn(),
  changeMode: vi.fn(() => Promise.resolve()),
  currentModeId: 'default',
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@hooks/useConversationEngine', () => ({
  useConversationEngine: () => ({
    messages: [],
    isLoading: false,
    error: null,
    currentMode: conversationModeBridgeFixtures.currentMode,
    setMode: conversationModeBridgeFixtures.setMode,
    sendMessage: vi.fn(),
    appendLocalExchange: vi.fn(),
    clearMessages: vi.fn(),
    deleteMessage: vi.fn(),
    healthReport: { status: 'Healthy' },
    refreshHealth: vi.fn(),
    conversationId: 'conv-mode-bridge',
    lastResponse: null,
  }),
}));

vi.mock('@/stores/useChatModeStore', () => ({
  useChatModeStore: (
    selector: (state: {
      currentModeId: string;
      changeMode: typeof conversationModeBridgeFixtures.changeMode;
    }) => unknown
  ) =>
    selector({
      currentModeId: conversationModeBridgeFixtures.currentModeId,
      changeMode: conversationModeBridgeFixtures.changeMode,
    }),
}));

vi.mock('@/features/chat/ThinkingPanel', () => ({
  ThinkingPanel: () => <div data-testid="thinking-panel" />,
  useThinkingSteps: () => ({
    isThinking: false,
    steps: [],
    startThinking: vi.fn(),
    stopThinking: vi.fn(),
    reset: vi.fn(),
    addStep: vi.fn(),
  }),
}));

vi.mock('@/features/chat/exportImport', () => ({
  downloadConversation: vi.fn(),
  downloadMarkdown: vi.fn(),
  copyToClipboard: vi.fn(),
  generateAndSaveFile: vi.fn(),
}));

vi.mock('@/services/tts/hybridTTS', () => ({
  hybridTTS: { speak: vi.fn() },
}));

vi.mock('@/features/chat/ChatProviderSelector', () => ({
  ChatProviderSelector: () => <div data-testid="provider-selector" />,
}));

vi.mock('@/components/chat/ChatToolbar', () => ({
  ChatToolbar: () => <div data-testid="chat-toolbar" />,
}));

vi.mock('@/components/conversation/ModeBuilder', () => ({
  ModeBuilder: () => <div data-testid="mode-builder" />,
}));

vi.mock('@/config/chatModes.config', async importOriginal => {
  const actual = await importOriginal<typeof import('@/config/chatModes.config')>();
  return {
    ...actual,
    registerCustomMode: vi.fn(),
  };
});

vi.mock('@/hooks/useVoiceEngine', () => ({
  useVoiceEngine: () => ({
    status: {
      isMicAvailable: true,
      isRecording: false,
      transcript: '',
      error: null,
    },
    startDictation: vi.fn(async () => undefined),
    stopDictation: vi.fn(async () => ''),
  }),
}));

vi.mock('@/design-system', () => ({
  TSectionHeader: ({ title }: { title?: string }) => <div>{title ?? 'Conversation'}</div>,
}));

vi.mock('@/utils/runtimeConfirm', () => ({
  confirmAction: vi.fn(async () => true),
}));

vi.mock('@/services/webResearchService', () => ({
  webResearch: { runResearch: vi.fn() },
}));

vi.mock('@/hooks/useLTMContext', () => ({
  useLTMContext: () => ({ historyCount: 0, refresh: vi.fn() }),
}));

vi.mock('@/features/chat/artifactIntent', () => ({
  buildArtifactActionContract: vi.fn(() => ({ intent: 'ANSWER_ONLY' })),
  buildProfessionalDocumentManifest: vi.fn(() => null),
  resolveArtifactRoute: vi.fn(() => ({
    status: 'READY',
    contract: { intent: 'ANSWER_ONLY' },
  })),
  validateNoFakeArtifactResponse: vi.fn(() => ({ ok: true, violations: [] })),
  buildFileGenerationPrompt: vi.fn(() => ''),
  extractFileContent: vi.fn(() => ''),
  inferFileExtension: vi.fn(() => 'md'),
  buildSafeFilename: vi.fn(() => 'safe-file'),
}));

vi.mock('@/services/tts/messageSpeechController', () => ({
  messageSpeechController: {
    playMessage: vi.fn(async () => undefined),
    pause: vi.fn(async () => undefined),
    resume: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
  },
  useMessageSpeechState: () => ({
    canPlay: false,
    status: 'idle',
    supportsPause: false,
    error: null,
  }),
}));

import { ConversationSection } from '../ConversationSection';

describe('ConversationSection modern mode bridge', () => {
  beforeEach(() => {
    conversationModeBridgeFixtures.currentMode = 'default';
    conversationModeBridgeFixtures.currentModeId = 'default';
    conversationModeBridgeFixtures.setMode.mockReset();
    conversationModeBridgeFixtures.changeMode.mockClear();
  });

  it('bridges the modern selector to the conversation engine and the chat mode store', async () => {
    render(<ConversationSection fullscreen />);

    expect(screen.queryByTestId('select-conversation-mode')).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('chat-mode-selector-select'), {
      target: { value: 'planning' },
    });

    expect(conversationModeBridgeFixtures.setMode).toHaveBeenCalledWith('planning');
    await waitFor(() => {
      expect(conversationModeBridgeFixtures.changeMode).toHaveBeenCalledWith('planning');
    });
  });

  it('publishes the active conversation mode and store mode on the canonical page root', () => {
    conversationModeBridgeFixtures.currentMode = 'planning';
    conversationModeBridgeFixtures.currentModeId = 'planning';

    render(<ConversationSection fullscreen />);

    expect(screen.getByTestId('page-conversation')).toHaveAttribute(
      'data-conversation-mode',
      'planning'
    );
    expect(screen.getByTestId('page-conversation')).toHaveAttribute(
      'data-chat-store-mode',
      'planning'
    );
    expect(screen.getByTestId('chat-mode-selector-select')).toHaveValue('planning');
  });
});
