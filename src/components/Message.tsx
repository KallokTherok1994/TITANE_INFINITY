import React, { useState, memo } from 'react';
import { ScreenReaderOnly } from '@/a11y/ScreenReader';

interface MessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Message component with React.memo optimization
 * FIX: Prevents unnecessary re-renders when parent updates
 */
export const Message = memo(function Message({
  content,
  role,
  timestamp,
  onEdit,
  onDelete,
}: MessageProps) {
  const [focused, setFocused] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!focused) return;

    // E : Éditer
    if (e.key === 'e' && onEdit) {
      e.preventDefault();
      onEdit();
    }

    // Delete : Supprimer
    if (e.key === 'Delete' && onDelete) {
      e.preventDefault();
      onDelete();
    }
  }

  const formattedTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);

  return (
    <article
      className={`message message--${role}`}
      tabIndex={0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      role="article"
      aria-label={`Message ${role === 'user' ? 'utilisateur' : 'assistant'} à ${formattedTime}`}
    >
      <div className="message__header">
        <span className="message__role">{role === 'user' ? 'Vous' : 'TITANE'}</span>
        <time className="message__time" dateTime={timestamp.toISOString()}>
          {formattedTime}
        </time>
      </div>

      <div className="message__content">{content}</div>

      {(onEdit || onDelete) && focused && (
        <div className="message__actions" role="toolbar" aria-label="Actions du message">
          {onEdit && (
            <button onClick={onEdit} aria-label="Éditer ce message (touche E)">
              Éditer
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} aria-label="Supprimer ce message (touche Delete)">
              Supprimer
            </button>
          )}
        </div>
      )}

      <ScreenReaderOnly>
        {focused &&
          'Message sélectionné. Appuyez sur E pour éditer ou Delete pour supprimer.'}
      </ScreenReaderOnly>
    </article>
  );
});

Message.displayName = 'Message';
