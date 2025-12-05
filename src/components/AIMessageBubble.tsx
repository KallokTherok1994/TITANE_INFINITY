/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15.8 — AI MESSAGE BUBBLE COMPONENT
 *   Bulle de message user/AI avec glass morphism
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import type { AIMessage } from '../services/aiService';
import './MessageBubble.css';

interface AIMessageBubbleProps {
  message: AIMessage;
}

export const AIMessageBubble: React.FC<AIMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-bubble message-bubble--${message.role}`}>
      <div className="message-bubble__avatar">
        {isUser ? '👤' : isSystem ? '⚙️' : '🤖'}
      </div>

      <div className="message-bubble__content">
        <div className="message-bubble__header">
          <span className="message-bubble__author">
            {isUser ? 'Vous' : isSystem ? 'Système' : 'TITANE∞'}
          </span>
          <span className="message-bubble__time">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        <div className="message-bubble__text">
          {message.content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIMessageBubble;
