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
import './MessageBubble.css';
import { MarkdownContent } from './MarkdownContent';
import { MessageReactions } from './MessageReactions'; // Sprint 6 Phase 3

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isLatest?: boolean;
}

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

  // Contenu du message avec markdown amélioré
  const messageContent = useMemo(() => {
    if (role === 'assistant') {
      // Si le message a du contenu, l'afficher avec markdown
      if (content && content.trim().length > 0) {
        // Utiliser notre MarkdownContent pour meilleur support
        return <MarkdownContent content={content} />;
      }
      // Si le message est vide mais récent (< 3s), afficher le typing indicator
      // Sinon afficher un placeholder pour indiquer un problème
      const messageAge = Date.now() - timestamp;
      if (messageAge < 3000) {
        return <TypingIndicator />;
      }
      // Message vide et ancien = erreur ou placeholder non mis à jour
      return <div className="message-error">⚠️ Erreur: aucune réponse générée</div>;
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

        {/* Sprint 6 Phase 3: Message Reactions */}
        {role === 'assistant' && content && content.trim().length > 0 && (
          <MessageReactions messageTimestamp={timestamp} compact />
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
