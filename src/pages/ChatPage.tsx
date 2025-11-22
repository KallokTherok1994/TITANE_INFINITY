/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Chat Page
 * Interface de chat avec contexte cognitif
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { ChatMessage, ChatInput, ChatContextPanel, type ChatSuggestion, type ChatMessageProps } from '@features/chat';
import { colors, spacing } from '@themes/tokens';

export const ChatPage = (): JSX.Element => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    {
      role: 'system' as const,
      content: 'Système initialisé. Mode Meta-Mode activé.',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      role: 'assistant' as const,
      content: 'Bonjour ! Je suis TITANE∞, votre assistant d\'intelligence cognitive. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(Date.now() - 3500000),
      metadata: {
        cognitiveState: {
          stress: 0.2,
          clarity: 0.85,
          focus: 0.78,
        },
        processingTime: 45.3,
      },
    },
    {
      role: 'user' as const,
      content: 'Peux-tu m\'aider à analyser mon état cognitif actuel ?',
      timestamp: new Date(Date.now() - 3400000),
    },
    {
      role: 'assistant' as const,
      content: 'Bien sûr ! D\'après les données récentes, votre état cognitif est excellent. Votre niveau de clarté mentale est élevé (85%), votre stress est faible (20%), et votre capacité de focus est solide (78%). Je remarque également que vous êtes dans une phase productive idéale pour les tâches complexes.',
      timestamp: new Date(Date.now() - 3300000),
      streaming: false,
      metadata: {
        cognitiveState: {
          stress: 0.2,
          clarity: 0.85,
          focus: 0.78,
        },
        memoryReferences: [
          { id: 'm1', type: 'conversation', relevance: 0.92 },
          { id: 'm2', type: 'fact', relevance: 0.78 },
        ],
        processingTime: 123.7,
      },
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [contextCollapsed, setContextCollapsed] = useState(false);

  const suggestions: ChatSuggestion[] = [
    {
      id: 's1',
      text: 'Analyser mon état cognitif',
      category: 'action',
      icon: '🧠',
    },
    {
      id: 's2',
      text: 'Quelles sont mes tâches prioritaires ?',
      category: 'question',
    },
    {
      id: 's3',
      text: '/help',
      category: 'command',
    },
  ];

  const handleSendMessage = (content: string): void => {
    const userMessage = {
      role: 'user' as const,
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate assistant response with streaming
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant' as const,
        content: 'Je traite votre demande...',
        timestamp: new Date(),
        streaming: true,
        metadata: undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: colors.neutral[950],
      }}
    >
      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: spacing[6],
          }}
        >
          {messages.map((message, index) => (
            <ChatMessage key={index} {...message} />
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            padding: spacing[4],
            borderTop: `1px solid ${colors.rubis.primary[800]}`,
          }}
        >
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            suggestions={suggestions}
          />
        </div>
      </div>

      {/* Context Panel */}
      <ChatContextPanel
        cognitiveState={{
          stress: 0.2,
          clarity: 0.85,
          focus: 0.78,
          energy: 0.82,
          emotionalTone: 'Calme',
        }}
        activeMemories={[
          {
            id: 'm1',
            type: 'conversation',
            content: 'Discussion précédente sur l\'optimisation cognitive',
            relevance: 0.92,
            timestamp: new Date(Date.now() - 7200000),
          },
          {
            id: 'm2',
            type: 'fact',
            content: 'L\'utilisateur préfère travailler le matin',
            relevance: 0.78,
            timestamp: new Date(Date.now() - 86400000),
          },
        ]}
        suggestions={[
          'Analyser les patterns de productivité',
          'Réviser les objectifs de la semaine',
          'Optimiser la gestion du temps',
        ]}
        isCollapsed={contextCollapsed}
        onToggle={() => setContextCollapsed(!contextCollapsed)}
      />
    </div>
  );
};
