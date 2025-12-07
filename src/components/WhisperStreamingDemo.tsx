/**
 * TITANE_INFINITY v19.3.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3.1 — WHISPER STREAMING DEMO
 *
 *   Composant de démonstration du streaming vocal en temps réel
 *   Affiche les transcriptions partial/final en direct
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useWhisperStream } from '@/hooks/useWhisperStream';

export const WhisperStreamingDemo = () => {
  const [model, setModel] = useState<'tiny' | 'base' | 'small' | 'medium' | 'large'>(
    'base'
  );
  const [language, setLanguage] = useState('fr');

  const {
    partial,
    final,
    segments,
    fullTranscript,
    isStreaming,
    confidence,
    error,
    start,
    stop,
    reset,
  } = useWhisperStream({
    model,
    language,
    onPartial: (text, conf) => {
      console.log('[Demo] Partial:', text, 'Confidence:', conf);
    },
    onFinal: (text, conf) => {
      console.log('[Demo] Final:', text, 'Confidence:', conf);
    },
    onError: err => {
      console.error('[Demo] Error:', err);
    },
  });

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>🎙️ TITANE∞ Real-Time Whisper Streaming</h1>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          disabled={isStreaming}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value="tiny">Tiny (fastest)</option>
          <option value="base">Base (recommended)</option>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large (best quality)</option>
        </select>

        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={isStreaming}
          style={{
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value="auto">Auto-detect</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>

        <button
          onClick={isStreaming ? stop : start}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            background: isStreaming ? '#dc2626' : '#10b981',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isStreaming ? '⏹️ Stop' : '▶️ Start'}
        </button>

        <button
          onClick={reset}
          disabled={isStreaming}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            background: 'white',
            cursor: isStreaming ? 'not-allowed' : 'pointer',
            opacity: isStreaming ? 0.5 : 1,
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Status */}
      <div
        style={{
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          background: isStreaming ? '#dcfce7' : '#f3f4f6',
          border: `2px solid ${isStreaming ? '#10b981' : '#e5e7eb'}`,
        }}
      >
        <strong>Status:</strong>{' '}
        {isStreaming ? (
          <span style={{ color: '#10b981' }}>🟢 Streaming Active</span>
        ) : (
          <span style={{ color: '#6b7280' }}>⚪ Idle</span>
        )}
        {confidence > 0 && (
          <span style={{ marginLeft: '1rem', color: '#6b7280' }}>
            Confidence: {(confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: '#fee2e2',
            border: '2px solid #dc2626',
            color: '#991b1b',
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Partial Transcription (In Progress) */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '1.5rem',
          borderRadius: '8px',
          background: '#fef3c7',
          border: '2px dashed #f59e0b',
          minHeight: '80px',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: '#92400e',
            marginBottom: '0.5rem',
          }}
        >
          📝 PARTIAL (in progress)
        </div>
        <div
          style={{
            fontSize: '1.125rem',
            color: '#78350f',
            fontStyle: partial ? 'normal' : 'italic',
          }}
        >
          {partial || '(waiting for speech...)'}
        </div>
      </div>

      {/* Final Segment (Last Confirmed) */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '1.5rem',
          borderRadius: '8px',
          background: '#dbeafe',
          border: '2px solid #3b82f6',
          minHeight: '80px',
        }}
      >
        <div
          style={{
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: '#1e40af',
            marginBottom: '0.5rem',
          }}
        >
          ✅ FINAL (last segment)
        </div>
        <div
          style={{
            fontSize: '1.125rem',
            color: '#1e3a8a',
            fontWeight: '500',
          }}
        >
          {final || '(no segment finalized yet)'}
        </div>
      </div>

      {/* Full Transcript History */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '8px',
          background: '#f3f4f6',
          border: '2px solid #9ca3af',
          minHeight: '120px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.875rem',
              fontWeight: 'bold',
              color: '#374151',
            }}
          >
            📜 FULL TRANSCRIPT ({segments.length} segments)
          </div>
          {segments.length > 0 && (
            <button
              onClick={() => navigator.clipboard.writeText(fullTranscript)}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '4px',
                border: '1px solid #9ca3af',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              📋 Copy
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: '1rem',
            color: '#1f2937',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            fontStyle: fullTranscript ? 'normal' : 'italic',
          }}
        >
          {fullTranscript || '(no transcript yet)'}
        </div>
      </div>

      {/* Segments List */}
      {segments.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Segments History ({segments.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {segments.map((segment, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ fontWeight: 'bold', color: '#6b7280' }}>
                  #{index + 1}:
                </span>{' '}
                {segment}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: '8px',
          background: '#eff6ff',
          border: '1px solid #3b82f6',
          fontSize: '0.875rem',
          color: '#1e40af',
        }}
      >
        <strong>ℹ️ How it works:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Click Start to begin real-time streaming</li>
          <li>PARTIAL updates every 300ms while you speak</li>
          <li>FINAL segment triggers after 1.5s silence</li>
          <li>Multiple segments are accumulated in FULL TRANSCRIPT</li>
        </ul>
      </div>
    </div>
  );
};

export default WhisperStreamingDemo;
