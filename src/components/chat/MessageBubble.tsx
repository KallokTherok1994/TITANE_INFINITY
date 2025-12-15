/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v24.7 — MESSAGE BUBBLE COMPONENT OPTIMISÉ
 *   Bulle de message avec markdown rendering et animations
 *   Optimisé avec React.memo et useMemo pour performance
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { memo, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MessageBubble.css';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isLatest?: boolean;
}

// Composants markdown memoizés (définis en dehors pour éviter recréation)
const markdownComponents: Components = {
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
  pre: ({ children }) => <pre className="code-block">{children}</pre>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
      {children}
    </a>
  ),
};

// Plugins remarkGfm memoizé
const remarkPlugins = [remarkGfm];

/**
 * Formate un timestamp en heure locale
 */
const formatTime = (ts: number): string => {
  const date = new Date(ts);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Mapping des avatars par rôle
 */
const AVATARS: Record<MessageBubbleProps['role'], React.ReactNode> = {
  user: <div className="message-avatar-user">👤</div>,
  system: <div className="message-avatar-system">⚙️</div>,
  assistant: (
    <div className="message-avatar-ai">
      <span className="message-avatar-icon">🤖</span>
    </div>
  ),
};

/**
 * Mapping des noms d'auteur par rôle
 */
const AUTHOR_NAMES: Record<MessageBubbleProps['role'], string> = {
  user: 'Vous',
  system: 'Système',
  assistant: 'TITANE∞',
};

/**
 * Indicateur de frappe
 */
const TypingIndicator = memo(function TypingIndicator() {
  return (
    <span className="typing-indicator" aria-label="TITANE∞ génère une réponse...">
      <span className="typing-dot">●</span>
      <span className="typing-dot">●</span>
      <span className="typing-dot">●</span>
    </span>
  );
});

/**
 * Composant MessageBubble optimisé
 * Utilise React.memo pour éviter les re-renders inutiles
 */
export const MessageBubble = memo(function MessageBubble({
  role,
  content,
  timestamp,
  isLatest = false,
}: MessageBubbleProps) {
  // Memoize le temps formaté
  const formattedTime = useMemo(() => formatTime(timestamp), [timestamp]);

  // Memoize les classes CSS
  const bubbleClasses = useMemo(
    () =>
      `message-bubble message-bubble-${role} ${isLatest ? 'message-bubble-latest' : ''}`,
    [role, isLatest]
  );

  // Memoize le label aria
  const ariaLabel = useMemo(
    () => `Message de ${role === 'user' ? 'vous' : 'TITANE∞'}`,
    [role]
  );

  // Contenu du message
  const messageContent = useMemo(() => {
    if (role === 'assistant') {
      if (content.length > 0) {
        return (
          <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
            {content}
          </ReactMarkdown>
        );
      }
      return <TypingIndicator />;
    }
    return content;
  }, [role, content]);

  return (
    <div className={bubbleClasses} role="article" aria-label={ariaLabel}>
      <div className="message-bubble-avatar">{AVATARS[role]}</div>

      <div className="message-bubble-content">
        <div className="message-bubble-header">
          <span className="message-bubble-author">{AUTHOR_NAMES[role]}</span>
          <span className="message-bubble-time">{formattedTime}</span>
        </div>

        <div className="message-bubble-text">{messageContent}</div>
      </div>
    </div>
  );
});

export default MessageBubble;
