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

import React, { useState } from 'react';
import { ChatMessage as _ChatMessage } from '@/features/chat/ChatMessage';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { ChatErrorBoundary } from '@/components/ChatErrorBoundary';
import { logger } from '@/lib/logger';

export const ChatPage: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [conversationId] = useState(() => `conv_${Date.now()}`);

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
          {/* Chat interface will be rendered here */}
        </div>
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatPage;
