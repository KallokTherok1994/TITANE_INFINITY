import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './ChatIA.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const ChatIA: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await invoke<string>('chat_send_message', {
        message: userMsg.content,
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }]);
    } catch (err) {
      console.error('Erreur:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Erreur: ' + err,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-ia-container">
      <header className="chat-header">
        <h1>💬 Chat IA - TITANE∞</h1>
      </header>

      <div className="messages-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message message-${msg.role}`}>
            <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && <div className="loading">⏳ Génération...</div>}
      </div>

      <div className="input-container">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Tapez votre message..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={!input.trim() || isLoading}>
          Envoyer
        </button>
      </div>
    </div>
  );
};
