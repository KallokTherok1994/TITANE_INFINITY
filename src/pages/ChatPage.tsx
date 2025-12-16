/**
 * TITANE∞ v24.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v24.2.0 - Chat Page Component
 * Page principale du Chat IA
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { ChatMessage } from '@/features/chat/ChatMessage';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';

export const ChatPage: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">TITANE∞ Chat</h1>
        <ChatProviderSelector />
      </div>
      <div className="flex-1 overflow-auto">
        {/* Chat interface will be rendered here */}
      </div>
    </div>
  );
};

export default ChatPage;
