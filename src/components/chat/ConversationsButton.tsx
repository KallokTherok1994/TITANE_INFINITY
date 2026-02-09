/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — CONVERSATIONS BUTTON
 *   Bouton d'ouverture de la sidebar des conversations
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './ConversationsButton.css';

export interface ConversationsButtonProps {
  onClick: () => void;
  conversationCount: number;
  hasActiveConversation: boolean;
}

export const ConversationsButton: React.FC<ConversationsButtonProps> = ({
  onClick,
  conversationCount,
  hasActiveConversation,
}) => {
  return (
    <button
      className={`conversations-button ${hasActiveConversation ? 'conversations-button--active' : ''}`}
      onClick={onClick}
      aria-label="Ouvrir les conversations"
      title={`${conversationCount} conversation${conversationCount > 1 ? 's' : ''}`}
      data-testid="conversations-button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {conversationCount > 1 && (
        <span className="conversations-button__badge">{conversationCount}</span>
      )}
    </button>
  );
};
