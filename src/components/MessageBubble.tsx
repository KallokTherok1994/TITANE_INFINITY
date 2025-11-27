/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */


// MessageBubble Component

import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number | Date;
}

export interface MessageBubbleProps {
  message: Message;
}



export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message }) => {

  return (

    <div className={`message-bubble ${message.role}`}>

      <div className="message-content">{message.content}</div>

      <div className="message-timestamp">

        {typeof message.timestamp === 'number'
          ? new Date(message.timestamp).toLocaleTimeString()
          : message.timestamp.toLocaleTimeString()}

      </div>

    </div>

  );

}, (prevProps, nextProps) => {
  // Only re-render if message content, role, or timestamp changed
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.timestamp === nextProps.message.timestamp
  );
});

MessageBubble.displayName = 'MessageBubble';

