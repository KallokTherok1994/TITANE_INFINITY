/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */


// MessageBubble Component

import React, { useMemo } from 'react';

export interface MessageMetadata {
  uiId?: string;
  status?: string;
  streamChunks?: number;
  duration?: number;
  latencyMs?: number;
  mode?: string;
  provider?: string;
  tokenCount?: number;
  promptTokens?: number;
  totalDuration?: number;
  loadDuration?: number;
  [key: string]: unknown;
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number | Date;
  provider?: string;
  metadata?: MessageMetadata;
}

export interface MessageBubbleProps {
  message: Message;
}

const formatDuration = (value?: number): string | null => {
  if (typeof value !== 'number' || value < 0) {
    return null;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}s`;
  }
  return `${Math.round(value)}ms`;
};

const formatProvider = (raw?: string): string | null => {
  if (!raw) {
    return null;
  }

  const normalized = raw.replace('tauri-', '').replace(/_/g, ' ');
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message }) => {
  const timestampLabel = useMemo(() => {
    if (typeof message.timestamp === 'number') {
      return new Date(message.timestamp).toLocaleTimeString();
    }
    return message.timestamp.toLocaleTimeString();
  }, [message.timestamp]);

  const provider = useMemo(() => {
    const rawProvider = message.provider || (message.metadata?.provider as string | undefined);
    return formatProvider(rawProvider);
  }, [message.provider, message.metadata?.provider]);

  const status = message.metadata?.status as string | undefined;
  const isStreaming = status === 'streaming';
  const chunkCount = typeof message.metadata?.streamChunks === 'number' ? message.metadata?.streamChunks : undefined;
  const durationLabel = formatDuration(
    typeof message.metadata?.latencyMs === 'number'
      ? message.metadata?.latencyMs
      : (message.metadata?.duration as number | undefined)
  );
  const totalDurationLabel = formatDuration(
    typeof message.metadata?.totalDuration === 'number'
      ? message.metadata?.totalDuration
      : undefined
  );
  const loadDurationLabel = formatDuration(
    typeof message.metadata?.loadDuration === 'number'
      ? message.metadata?.loadDuration
      : undefined
  );
  const promptTokens = typeof message.metadata?.promptTokens === 'number' ? message.metadata?.promptTokens : undefined;
  const completionTokens = typeof message.metadata?.tokenCount === 'number' ? message.metadata?.tokenCount : undefined;
  const totalTokens = typeof promptTokens === 'number' || typeof completionTokens === 'number'
    ? (promptTokens ?? 0) + (completionTokens ?? 0)
    : undefined;
  const mode = typeof message.metadata?.mode === 'string' ? message.metadata?.mode : undefined;

  return (
    <div className={`message-bubble ${message.role}`}>
      {(provider || mode || durationLabel || isStreaming || totalTokens != null || totalDurationLabel || loadDurationLabel) && (
        <div className="message-meta">
          {provider && <span className="message-badge message-badge-provider">⚡ {provider}</span>}
          {mode && <span className="message-badge message-badge-mode">Mode {mode}</span>}
          {isStreaming && (
            <span className="message-badge message-badge-streaming">
              Streaming{typeof chunkCount === 'number' && chunkCount > 0 ? ` · ${chunkCount}` : ''}
            </span>
          )}
          {status === 'fallback' && (
            <span className="message-badge message-badge-fallback">Auto-réparation</span>
          )}
          {durationLabel && <span className="message-badge message-badge-duration">⏱ {durationLabel}</span>}
          {totalTokens != null && (
            <span className="message-badge message-badge-tokens">
              🧠 Tokens {totalTokens}
              {promptTokens != null && completionTokens != null
                ? ` (prompt ${promptTokens}, sortie ${completionTokens})`
                : completionTokens != null
                  ? ` (${completionTokens})`
                  : promptTokens != null
                    ? ` (prompt ${promptTokens})`
                    : ''}
            </span>
          )}
          {totalDurationLabel && (
            <span className="message-badge message-badge-total-duration">🕒 Total {totalDurationLabel}</span>
          )}
          {loadDurationLabel && (
            <span className="message-badge message-badge-load-duration">⚙️ Chargement {loadDurationLabel}</span>
          )}
        </div>
      )}

      <div className="message-content">{message.content}</div>

      <div className="message-timestamp">{timestampLabel}</div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if relevant message fields changed
  const prev = prevProps.message;
  const next = nextProps.message;

  const shallowEqualMetadata = (a?: MessageMetadata, b?: MessageMetadata) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  };

  return (
    prev.content === next.content &&
    prev.role === next.role &&
    prev.timestamp === next.timestamp &&
    prev.provider === next.provider &&
    shallowEqualMetadata(prev.metadata, next.metadata)
  );
});

MessageBubble.displayName = 'MessageBubble';

