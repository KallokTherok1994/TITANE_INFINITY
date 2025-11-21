/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.1 — MESSAGE BUBBLE COMPONENT OPTIMISÉ
 *   Bulle de message avec markdown rendering et animations
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MessageBubble.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isLatest?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  timestamp,
  isLatest = false,
}) => {
  const formatTime = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`message-bubble message-bubble-${role} ${isLatest ? 'message-bubble-latest' : ''}`}
      role="article"
      aria-label={`Message de ${role === 'user' ? 'vous' : 'TITANE∞'}`}
    >
      <div className="message-bubble-avatar">
        {role === 'user' ? (
          <div className="message-avatar-user">👤</div>
        ) : role === 'system' ? (
          <div className="message-avatar-system">⚙️</div>
        ) : (
          <div className="message-avatar-ai">
            <span className="message-avatar-icon">🤖</span>
          </div>
        )}
      </div>

      <div className="message-bubble-content">
        <div className="message-bubble-header">
          <span className="message-bubble-author">
            {role === 'user' ? 'Vous' : role === 'system' ? 'Système' : 'TITANE∞'}
          </span>
          <span className="message-bubble-time">
            {formatTime(timestamp)}
          </span>
        </div>

        <div className="message-bubble-text">
          {role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ className, children, ...props }) => {
                  const inline = !className;
                  return inline ? (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="code-block">{children}</pre>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
