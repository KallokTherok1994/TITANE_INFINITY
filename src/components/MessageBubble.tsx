/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */


// MessageBubble Component

import React from 'react';



export interface Message {

  id: string;

  role: 'user' | 'assistant';

  content: string;

  timestamp: Date;

}



export interface MessageBubbleProps {

  message: Message;

}



export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {

  return (

    <div className={`message-bubble ${message.role}`}>

      <div className="message-content">{message.content}</div>

      <div className="message-timestamp">

        {message.timestamp.toLocaleTimeString()}

      </div>

    </div>

  );

};

