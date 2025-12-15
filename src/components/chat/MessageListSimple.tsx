/**
 * TITANE∞ — MESSAGE LIST SIMPLE (DEBUG VERSION)
 * Version ultra-simplifiée pour diagnostiquer le problème d'affichage
 */

import React from 'react';
import type { AIMessage } from '../../services/ai/types';
import './MessageList.css';

interface MessageListSimpleProps {
  messages: AIMessage[];
  isLoading?: boolean;
  error?: string | null;
}

export const MessageListSimple: React.FC<MessageListSimpleProps> = ({
  messages,
  isLoading = false,
  error = null,
}) => {
  console.log('[MessageListSimple] 🎨 RENDER - messages:', messages?.length);

  // Log chaque message
  messages?.forEach((msg, i) => {
    console.log(
      `[MessageListSimple] Message ${i}:`,
      msg?.role,
      msg?.content?.substring(0, 50)
    );
  });

  return (
    <div
      className="message-list-container"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header debug */}
      <div
        style={{
          padding: '8px',
          background: 'rgba(0,255,0,0.1)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#00ff00',
        }}
      >
        DEBUG: {messages?.length || 0} messages | Loading: {isLoading ? 'OUI' : 'NON'} |
        Error: {error || 'AUCUNE'}
      </div>

      {/* Messages */}
      {messages && messages.length > 0 ? (
        messages.map((message, index) => {
          const uiId = message.metadata?.uiId;
          const key = (typeof uiId === 'string' ? uiId : null) || `msg-${index}`;
          return (
            <div
              key={key}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background:
                  message.role === 'user'
                    ? 'rgba(0, 150, 255, 0.15)'
                    : 'rgba(128, 0, 255, 0.15)',
                border:
                  message.role === 'user'
                    ? '1px solid rgba(0, 150, 255, 0.3)'
                    : '1px solid rgba(128, 0, 255, 0.3)',
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.7,
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {message.role === 'user' ? '👤 Vous' : '🤖 TITANE∞'}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content || '(contenu vide)'}
              </div>
            </div>
          );
        })
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            opacity: 0.5,
          }}
        >
          {isLoading ? '⏳ Chargement...' : '💬 Aucun message. Commencez à chatter !'}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(128, 0, 255, 0.1)',
            alignSelf: 'flex-start',
          }}
        >
          <span style={{ animation: 'pulse 1s infinite' }}>●</span>
          <span style={{ animation: 'pulse 1s infinite 0.2s' }}>●</span>
          <span style={{ animation: 'pulse 1s infinite 0.4s' }}>●</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px',
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '8px',
            color: '#ff6b6b',
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default MessageListSimple;
