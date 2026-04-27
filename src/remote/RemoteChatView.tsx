/**
 * TITANE∞ Remote — Chat View
 * data-testid: remote-chat-view, remote-chat-messages, remote-chat-input, remote-chat-send-button, remote-logout-button
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { RemoteMessage } from './useRemoteChat';

interface RemoteChatViewProps {
  messages: RemoteMessage[];
  loading: boolean;
  error: string | null;
  conversationId: string | null;
  onSend: (text: string) => void;
  onLogout: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-card)',
    flexShrink: 0,
  },
  headerLeft: {
    fontWeight: 700,
    fontSize: '17px',
    background: 'linear-gradient(135deg, #6e5bff 0%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  convBadge: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  logoutBtn: {
    padding: '5px 12px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    maxWidth: '75%',
    background: 'var(--user-bubble)',
    border: '1px solid var(--border)',
    borderRadius: '14px 14px 2px 14px',
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: 1.5,
    color: 'var(--text)',
  },
  bubbleAi: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    background: 'var(--ai-bubble)',
    border: '1px solid var(--border)',
    borderRadius: '2px 14px 14px 14px',
    padding: '10px 14px',
    fontSize: '14px',
    lineHeight: 1.5,
    color: 'var(--text)',
    whiteSpace: 'pre-wrap',
  },
  typingDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse 1.2s ease-in-out infinite',
    margin: '0 2px',
  },
  inputRow: {
    padding: '14px 20px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-card)',
    display: 'flex',
    gap: '10px',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    padding: '10px 14px',
    background: '#0d0d1a',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '14px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'var(--font)',
    lineHeight: 1.5,
    maxHeight: '120px',
  },
  sendBtn: {
    padding: '10px 18px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    alignSelf: 'flex-end',
  },
  error: {
    color: 'var(--error)',
    fontSize: '12px',
    padding: '6px 20px',
    borderTop: '1px solid rgba(239,68,68,0.2)',
    background: 'rgba(239,68,68,0.05)',
    flexShrink: 0,
  },
};

export default function RemoteChatView({
  messages,
  loading,
  error,
  conversationId,
  onSend,
  onLogout,
}: RemoteChatViewProps) {
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft('');
    onSend(text);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container} data-testid="remote-chat-view">
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.headerLeft}>TITANE∞</span>
        <div style={styles.headerRight}>
          {conversationId && (
            <span style={styles.convBadge} title="ID de conversation">
              {conversationId.slice(0, 8)}…
            </span>
          )}
          <button
            data-testid="remote-logout-button"
            style={styles.logoutBtn}
            onClick={onLogout}
          >
            Déconnecter
          </button>
        </div>
      </header>

      {/* Messages */}
      <div
        style={styles.messages}
        data-testid="remote-chat-messages"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && !loading && (
          <p
            style={{
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: '40px',
              fontSize: '14px',
            }}
          >
            Commencez à discuter avec TITANE∞
          </p>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            style={msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}
            data-testid={`remote-message-${msg.role}`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div
            style={{ ...styles.bubbleAi, padding: '14px 16px' }}
            aria-label="TITANE est en train de répondre"
          >
            <span style={styles.typingDot} />
            <span style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
            <span style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <p style={styles.error} role="alert">
          {error}
        </p>
      )}

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          data-testid="remote-chat-input"
          style={styles.textarea}
          rows={1}
          placeholder="Écrivez votre message… (Entrée pour envoyer)"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          aria-label="Message"
        />
        <button
          data-testid="remote-chat-send-button"
          style={{
            ...styles.sendBtn,
            opacity: loading || !draft.trim() ? 0.55 : 1,
            cursor: loading || !draft.trim() ? 'not-allowed' : 'pointer',
          }}
          onClick={handleSend}
          disabled={loading || !draft.trim()}
          aria-label="Envoyer"
        >
          Envoyer
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
