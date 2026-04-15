/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Chat Page Component
 * Page principale du Chat IA avec Error Boundary (Phase 4)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, Suspense } from 'react';
import { ChatMessage as _ChatMessage } from '@/features/chat/ChatMessage';
import { ChatProviderSelector } from '@/features/chat/ChatProviderSelector';
import { ChatErrorBoundary } from '@/components/ChatErrorBoundary';
import { ChatWindow } from '@/components/ChatWindow';
import { logger } from '@/lib/logger';

import MonitoringDashboard from '@/services/monitoring/MonitoringDashboard';
import DiagnosticDashboard from '@/services/diagnostic/DiagnosticDashboard';
import ExplainabilityDashboard from '@/services/explainability/ExplainabilityDashboard';
import OrchestratorDashboard from '@/services/orchestrator/OrchestratorDashboard';
import SecurityDashboard from '@/services/security_active/SecurityDashboard';

const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';
// LOCK2: canonical key — legacy 'omega-chat-conversation-id' is migrated on boot via legacyCleanup
const CONVERSATION_ID_STORAGE_KEY = 'titane_active_conversation_id';
const CONVERSATION_ID_LEGACY_KEY = 'omega-chat-conversation-id';

const getInitialProvider = (): string => {
  if (typeof window === 'undefined') {
    return 'ollama';
  }

  const stored = window.localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY);
  return stored && stored.trim().length > 0 ? stored : 'ollama';
};

// PATCH-014 + LOCK2: Persist conversationId across sessions for cross-session LTM recall.
// Read canonical key first, fall back to legacy key for existing installs not yet migrated.
const getInitialConversationId = (): string => {
  if (typeof window === 'undefined') {
    return `conv_${Date.now()}`;
  }
  const stored =
    window.localStorage.getItem(CONVERSATION_ID_STORAGE_KEY) ??
    window.localStorage.getItem(CONVERSATION_ID_LEGACY_KEY);
  if (stored && stored.trim().length > 0) {
    // Always persist under canonical key
    window.localStorage.setItem(CONVERSATION_ID_STORAGE_KEY, stored);
    return stored;
  }
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
      <div
        className="chat-fullscreen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          minHeight: 0,
          flex: '1 1 auto',
          overflow: 'hidden',
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        <div className="chat-fullscreen-header">
          <h1 className="text-2xl font-bold">TITANE∞ Chat</h1>
          <ChatProviderSelector
            selectedProvider={selectedProvider}
            onChange={setSelectedProvider}
            providers={availableProviders}
          />
        </div>
        <div
          className="chat-fullscreen-window"
          style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
          <ChatWindow />
        </div>
        {/* Dashboards agents avancés */}
        <div className="chat-advanced-agents-dashboards">
          <Suspense fallback={null}>
            <MonitoringDashboard />
            <DiagnosticDashboard />
            <ExplainabilityDashboard />
            <OrchestratorDashboard />
            <SecurityDashboard />
          </Suspense>
        </div>
      </div>
    </ChatErrorBoundary>
  );
};

export default ChatPage;
