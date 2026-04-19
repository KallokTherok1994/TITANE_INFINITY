import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const conversationRenderFixtures = vi.hoisted(() => ({
  assistantContent: [
    '# Audit complet',
    '',
    'Cette réponse longue doit rester complète sur la surface conversationnelle réelle.',
    '',
    '- Étape 1',
    '- Étape 2',
    '',
    '> Citation visible',
    '',
    '## Bloc terminal',
    'OMEGA-CONVERSATION-TERMINAL-MARKER',
  ].join('\n'),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@hooks/useConversationEngine', () => ({
  useConversationEngine: () => ({
    messages: [
      {
        id: 'assistant-render-1',
        role: 'assistant',
        content: conversationRenderFixtures.assistantContent,
        timestamp: Date.now(),
        metadata: {
          tags: ['long-answer'],
        },
      },
    ],
    isLoading: false,
    error: null,
    currentMode: 'default',
    setMode: vi.fn(),
    sendMessage: vi.fn(),
    appendLocalExchange: vi.fn(),
    clearMessages: vi.fn(),
    deleteMessage: vi.fn(),
    healthReport: { status: 'Healthy' },
    refreshHealth: vi.fn(),
    conversationId: 'conv-render-1',
    lastResponse: null,
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

vi.mock('@/config/chatModes.config', () => ({
  registerCustomMode: vi.fn(),
}));

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
  buildArtifactActionContract: vi.fn(() => null),
  buildProfessionalDocumentManifest: vi.fn(() => null),
  resolveArtifactRoute: vi.fn(() => null),
  validateNoFakeArtifactResponse: vi.fn(() => true),
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

describe('ConversationSection rendering truth', () => {
  beforeAll(() => {
    if (typeof ResizeObserver === 'undefined') {
      class MockResizeObserver {
        observe() {}
        disconnect() {}
        unobserve() {}
      }

      vi.stubGlobal('ResizeObserver', MockResizeObserver);
    }
  });

  it('renders the full terminal block for a long assistant response on the canonical surface', () => {
    render(<ConversationSection fullscreen />);

    const contentNode = screen.getByTestId('chat-message-content');

    expect(contentNode.textContent).toContain('Bloc terminal');
    expect(contentNode.textContent).toContain('OMEGA-CONVERSATION-TERMINAL-MARKER');
  });
});