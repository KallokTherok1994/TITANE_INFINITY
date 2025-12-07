/**
 * TITANE_INFINITY v∞.5 — Full Duplex Example
 *
 * Example component demonstrating full duplex vocal interaction
 */

import React, { useEffect, useState } from 'react';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import {
  fullDuplexOrchestrator,
  type FullDuplexEvent,
} from '@/services/voice/fullDuplexOrchestrator';
import { chatInterruptionHandler } from '@/services/chat/chatInterruptionHandler';

/**
 * Full Duplex Voice Assistant Component
 *
 * Features:
 * - Speak and listen simultaneously
 * - Visual feedback for interruptions
 * - Real-time state display
 * - Manual interrupt button
 */
export function FullDuplexExample() {
  const voice = useVoiceEngine({
    fullDuplexMode: true,
    language: 'fr-FR',
  });

  const [events, setEvents] = useState<FullDuplexEvent[]>([]);
  const [interruptionHistory, setInterruptionHistory] = useState<
    Array<Record<string, unknown>>
  >([]);

  // Enable full duplex on mount
  useEffect(() => {
    const init = async () => {
      await voice.enableFullDuplex();
      chatInterruptionHandler.enable();
      console.log('✅ Full duplex enabled');
    };

    init();

    return () => {
      voice.disableFullDuplex();
      chatInterruptionHandler.disable();
    };
  }, [voice]);

  // Subscribe to full duplex events
  useEffect(() => {
    const unsubscribe = fullDuplexOrchestrator.onEvent(event => {
      console.log('Full Duplex Event:', event);
      setEvents(prev => [...prev.slice(-9), event]); // Keep last 10 events

      if (event.type === 'interrupt' && event.bargeInEvent) {
        const history = chatInterruptionHandler.getHistory();
        setInterruptionHistory(history);
      }
    });

    return unsubscribe;
  }, []);

  // Example conversation flow
  const startConversation = async () => {
    try {
      // Start listening
      await voice.startTurn();

      // User speaks: "Titane, quelle heure est-il ?"
      // (handled by voice engine automatically)
    } catch (error) {
      console.error('Conversation error:', error);
    }
  };

  // Example long TTS (for testing interruptions)
  const speakLongMessage = async () => {
    const longText = `
      La capitale de la France est Paris.
      Paris est située au centre-nord du pays, sur les rives de la Seine.
      La ville compte environ 2,2 millions d'habitants intra-muros,
      et plus de 12 millions dans l'aire urbaine.
      Paris est connue pour ses monuments emblématiques comme la Tour Eiffel,
      le Louvre, Notre-Dame, et l'Arc de Triomphe.
      C'est également un centre culturel, artistique et gastronomique majeur.
    `;

    await voice.speak(longText.trim());
  };

  // Manual interrupt
  const handleInterrupt = async () => {
    await voice.interrupt();
  };

  // Inject interruption with text
  const handleInjectInterruption = async () => {
    const text = "Non attends, je veux parler d'autre chose";
    await voice.injectInterruption(text);
  };

  return (
    <div
      className="full-duplex-example"
      style={{ padding: '20px', fontFamily: 'monospace' }}
    >
      <h1>🔥 Full Duplex Voice Assistant</h1>

      {/* Status Panel */}
      <div
        style={{
          background: '#1e1e1e',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>📊 Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>Full Duplex:</strong>{' '}
            {voice.status.fullDuplexMode ? (
              <span style={{ color: '#4ade80' }}>✅ Enabled</span>
            ) : (
              <span style={{ color: '#ef4444' }}>❌ Disabled</span>
            )}
          </div>

          <div>
            <strong>State:</strong>{' '}
            <span style={{ color: '#60a5fa' }}>
              {voice.status.fullDuplexState || 'idle'}
            </span>
          </div>

          <div>
            <strong>Speaking:</strong>{' '}
            {voice.status.isSpeaking ? (
              <span style={{ color: '#f59e0b' }}>🎤 Yes</span>
            ) : (
              <span style={{ color: '#6b7280' }}>No</span>
            )}
          </div>

          <div>
            <strong>Listening:</strong>{' '}
            {voice.status.isListening ? (
              <span style={{ color: '#10b981' }}>👂 Yes</span>
            ) : (
              <span style={{ color: '#6b7280' }}>No</span>
            )}
          </div>

          <div>
            <strong>Voice Engine:</strong>{' '}
            <span style={{ color: '#8b5cf6' }}>{voice.status.state}</span>
          </div>

          <div>
            <strong>Attention:</strong>{' '}
            <span style={{ color: '#ec4899' }}>{voice.status.attentionState}</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🎮 Controls</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={startConversation}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🗣️ Start Conversation
          </button>

          <button
            onClick={speakLongMessage}
            style={{
              padding: '10px 20px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            📢 Speak Long Message
          </button>

          <button
            onClick={handleInterrupt}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            disabled={!voice.status.isSpeaking}
          >
            🚨 Interrupt
          </button>

          <button
            onClick={handleInjectInterruption}
            style={{
              padding: '10px 20px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            disabled={!voice.status.isSpeaking}
          >
            💬 Inject Interruption
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div
        style={{
          background: '#1e1e1e',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <h3>📜 Event Log (Last 10)</h3>
        <div
          style={{
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          {events.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No events yet...</div>
          ) : (
            events.map((event, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  background: '#2d2d2d',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${
                    event.type === 'interrupt'
                      ? '#ef4444'
                      : event.type === 'state_change'
                        ? '#3b82f6'
                        : event.type === 'resume'
                          ? '#10b981'
                          : '#f59e0b'
                  }`,
                }}
              >
                <div>
                  <strong>{event.type.toUpperCase()}</strong>
                  {' → '}
                  <span style={{ color: '#60a5fa' }}>{event.state}</span>
                </div>
                {event.bargeInEvent && (
                  <div style={{ color: '#9ca3af', fontSize: '11px' }}>
                    Barge-in: {event.bargeInEvent.type}
                    (confidence: {event.bargeInEvent.confidence.toFixed(2)})
                  </div>
                )}
                <div style={{ color: '#6b7280', fontSize: '10px' }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interruption History */}
      <div
        style={{
          background: '#1e1e1e',
          padding: '15px',
          borderRadius: '8px',
        }}
      >
        <h3>🧠 Interruption History</h3>
        <div
          style={{
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          {interruptionHistory.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No interruptions yet...</div>
          ) : (
            interruptionHistory.map((ctx, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  background: '#2d2d2d',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${
                    ctx.type === 'hard_stop'
                      ? '#ef4444'
                      : ctx.type === 'redirect'
                        ? '#f59e0b'
                        : ctx.type === 'clarification'
                          ? '#3b82f6'
                          : ctx.type === 'correction'
                            ? '#ec4899'
                            : '#10b981'
                  }`,
                }}
              >
                <div>
                  <strong style={{ color: '#f59e0b' }}>
                    {ctx.type.toUpperCase().replace('_', ' ')}
                  </strong>
                </div>
                <div style={{ color: '#d1d5db', marginTop: '4px' }}>
                  User: "{ctx.userText}"
                </div>
                <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px' }}>
                  Interrupted at: {(ctx.interruptedAt * 100).toFixed(0)}%{' | '}
                  Confidence: {ctx.confidence.toFixed(2)}
                </div>
                <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>
                  {new Date(ctx.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#1e293b',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <h3 style={{ color: '#60a5fa' }}>📖 Instructions</h3>
        <ol style={{ color: '#d1d5db', lineHeight: '1.8' }}>
          <li>Click "Speak Long Message" to start TTS</li>
          <li>While TTS is speaking, click "Interrupt" to stop it</li>
          <li>Or speak into your microphone to trigger barge-in detection</li>
          <li>Watch the event log for real-time updates</li>
          <li>Check interruption history for AI context</li>
        </ol>
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            background: '#0f172a',
            borderRadius: '4px',
          }}
        >
          <strong style={{ color: '#fbbf24' }}>💡 Tip:</strong>
          <span style={{ color: '#9ca3af' }}>
            {' '}
            Try interrupting mid-sentence by saying "Stop!" or "Attends!" to test hard
            interrupt detection.
          </span>
        </div>
      </div>
    </div>
  );
}

export default FullDuplexExample;
