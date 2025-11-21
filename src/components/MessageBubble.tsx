
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

