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

import React, { memo, useMemo, lazy, Suspense } from 'react';
import './MessageBubble.css';

// YOLO OPT-6: Lazy-load ReactMarkdown (-80 KB gzip)
// Markdown uniquement pour messages assistant (pas user)
const LazyReactMarkdown = lazy(() => import('react-markdown'));
import remarkGfm from 'remark-gfm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type simplifié pour éviter import statique
type Components = any;
type CodeProps = {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isLatest?: boolean;
}

// Composants markdown memoizés (définis en dehors pour éviter recréation)
const markdownComponents: Components = {
  code: ({ className, children, ...props }: CodeProps) => {
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
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="code-block">{children}</pre>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
      {children}
    </a>
  ),
};

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

  // Contenu du message avec lazy markdown
  const messageContent = useMemo(() => {
    if (role === 'assistant') {
      // Si le message a du contenu, l'afficher avec markdown
      if (content && content.trim().length > 0) {
        // YOLO OPT: Lazy-load markdown pour assistant uniquement
        return (
          <Suspense fallback={<div className="markdown-loading">Chargement...</div>}>
            <LazyReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </LazyReactMarkdown>
          </Suspense>
        );
      }
      // Si le message est vide mais récent (< 3s), afficher le typing indicator
      // Sinon afficher un placeholder pour indiquer un problème
      const messageAge = Date.now() - timestamp;
      if (messageAge < 3000) {
        return <TypingIndicator />;
      }
      // Message vide et ancien = erreur ou placeholder non mis à jour
      return (
        <div className="message-error">
          ⚠️ Erreur: aucune réponse générée
        </div>
      );
    }
    return content;
  }, [role, content, timestamp]);

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
