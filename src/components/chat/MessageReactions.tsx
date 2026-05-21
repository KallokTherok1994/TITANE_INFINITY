/**
 * TITANE∞ — Message Reactions Component
 * Affiche et gère les réactions aux messages
 *
 * v35.1.8 (Sprint 6 Phase 3)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  getReactionsService,
  REACTION_EMOJIS,
  type ReactionType,
} from '../../services/chat/messageReactions';
import './MessageReactions.css';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface MessageReactionsProps {
  messageTimestamp: number;
  className?: string;
  style?: React.CSSProperties;
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageTimestamp,
  className,
  style,
  compact = false,
}) => {
  const reactionsService = useMemo(() => getReactionsService(), []);
  const [reactions, setReactions] = useState(() =>
    reactionsService.getReactions(messageTimestamp)
  );
  const [showPicker, setShowPicker] = useState(false);

  const handleToggleReaction = useCallback(
    (reaction: ReactionType) => {
      reactionsService.toggleReaction(messageTimestamp, reaction);
      setReactions(reactionsService.getReactions(messageTimestamp));
    },
    [messageTimestamp, reactionsService]
  );

  const activeReactions = useMemo(() => {
    return Object.entries(reactions).filter(([, count]) => count && count > 0);
  }, [reactions]);

  const hasReactions = activeReactions.length > 0;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? '4px' : '6px',
        marginTop: compact ? '4px' : '8px',
        position: 'relative',
        ...style,
      }}
    >
      {/* Active Reactions */}
      {hasReactions && (
        <div
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
          }}
        >
          {activeReactions.map(([type, count]) => (
            <button
              key={type}
              onClick={() => handleToggleReaction(type as ReactionType)}
              style={{
                background: 'var(--titanium-bg-interactive, rgba(255,255,255,0.06))',
                border: '1px solid var(--titanium-border-default, rgba(255,255,255,0.12))',
                borderRadius: '12px',
                padding: compact ? '2px 6px' : '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: compact ? '11px' : '12px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--titanium-border-default, rgba(255,255,255,0.12))';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--titanium-bg-interactive, rgba(255,255,255,0.06))';
              }}
              title={`Remove ${type} reaction`}
            >
              <span>{REACTION_EMOJIS[type as ReactionType]}</span>
              {count && count > 1 && (
                <span style={{ color: '#C4C4C4', fontSize: '10px' }}>{count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add Reaction Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          background: showPicker
            ? 'var(--titanium-border-default, rgba(255,255,255,0.12))'
            : 'var(--titanium-bg-subtle, rgba(255,255,255,0.04))',
          border: '1px solid var(--titanium-border-default, rgba(255,255,255,0.12))',
          borderRadius: '12px',
          padding: compact ? '2px 6px' : '4px 8px',
          cursor: 'pointer',
          fontSize: compact ? '11px' : '12px',
          transition: 'all 0.2s',
          color: 'var(--titanium-text-tertiary, #8a8a8a)',
        }}
        onMouseEnter={e => {
          if (!showPicker) {
            e.currentTarget.style.background = 'var(--titanium-bg-interactive, rgba(255,255,255,0.08))';
          }
        }}
        onMouseLeave={e => {
          if (!showPicker) {
            e.currentTarget.style.background = 'var(--titanium-bg-subtle, rgba(255,255,255,0.04))';
          }
        }}
        title="Add reaction"
      >
        {showPicker ? '✕' : '➕'}
      </button>

      {/* Reaction Picker */}
      {showPicker && (
        <div
          className="message-reaction-picker"
          role="menu"
          aria-label="Choisir une réaction"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '4px',
            background: 'var(--titanium-bg-elevated, rgba(4,15,31,0.95))',
            border: '1px solid var(--titanium-border-default, rgba(255,255,255,0.12))',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
          }}
          onMouseLeave={() => setShowPicker(false)}
        >
          {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map(type => {
            const isActive = (reactions[type] ?? 0) > 0;
            return (
              <button
                key={type}
                onClick={() => {
                  handleToggleReaction(type);
                  setShowPicker(false);
                }}
                style={{
                  background: isActive ? 'var(--titanium-border-default, rgba(255,255,255,0.12))' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--titanium-bg-overlay, rgba(255,255,255,0.14))';
                  e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isActive
                    ? 'var(--titanium-border-default, rgba(255,255,255,0.12))'
                    : 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={type}
              >
                {REACTION_EMOJIS[type]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
