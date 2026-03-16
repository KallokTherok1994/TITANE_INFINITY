/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Chat Page Component
 * Page principale du Chat IA avec Error Boundary (Phase 4)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { ChatMessage as _ChatMessage } from '@/features/chat/ChatMessage';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { ChatErrorBoundary } from '@/components/ChatErrorBoundary';
import { ChatWindow } from '@/components/ChatWindow';
import { logger } from '@/lib/logger';

const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';
const CONVERSATION_ID_STORAGE_KEY = 'omega-chat-conversation-id';

const getInitialProvider = (): string => {
  if (typeof window === 'undefined') {
    return 'ollama';
  }

  const stored = window.localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY);
  return stored && stored.trim().length > 0 ? stored : 'ollama';
};

// PATCH-014: Persist conversationId across sessions for cross-session LTM recall
const getInitialConversationId = (): string => {
  if (typeof window === 'undefined') {
    return `conv_${Date.now()}`;
  }
  const stored = window.localStorage.getItem(CONVERSATION_ID_STORAGE_KEY);
  if (stored && stored.trim().length > 0) return stored;
  const newId = `conv_${Date.now()}`;
  window.localStorage.setItem(CONVERSATION_ID_STORAGE_KEY, newId);
  return newId;
};

export const ChatPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState(getInitialProvider);
  const [conversationId] = useState(getInitialConversationId);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(PREFERRED_PROVIDER_STORAGE_KEY, selectedProvider);
  }, [selectedProvider]);

  const availableProviders = [
    { id: 'gemini', name: 'Gemini', icon: '✨', available: true },
    { id: 'ollama', name: 'Ollama', icon: '🦙', available: true },
    { id: 'custom', name: 'Custom', icon: '⚙️', available: false },
  ];

  const handleChatError = (error: Error) => {
    logger.error(
      'Chat error occurred',
      {
        component: 'ChatPage',
        conversationId,
        provider: selectedProvider,
      },
      error
    );
  };

  const handleChatReset = () => {
    logger.info('Chat reset triggered', {
      component: 'ChatPage',
      conversationId,
    });
  };

  return (
    <ChatErrorBoundary
      conversationId={conversationId}
      mode="default"
      onError={handleChatError}
      onReset={handleChatReset}
    >
      <div className="h-full w-full flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">TITANE∞ Chat</h1>
          <ChatProviderSelector
            selectedProvider={selectedProvider}
            onChange={setSelectedProvider}
            providers={availableProviders}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <ChatWindow />
        </div>
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatPage;
