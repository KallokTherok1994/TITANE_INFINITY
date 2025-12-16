/**
 * TITANE∞ v22Ω — StatusIndicator Component (Stub)
 * Minimal status indicator showing connection state
 */

import React from 'react';

export interface StatusIndicatorProps {
  online: boolean;
  provider: 'Gemini' | 'Ollama' | 'Offline' | string;
  health: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(
  ({ online, provider, health }) => {
    const statusColor = online ? (health > 0.7 ? '#22c55e' : '#eab308') : '#ef4444';
    const statusText = online ? provider : 'Offline';

    return (
      <div
        className="status-indicator"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          color: statusColor,
        }}
        aria-label={`Status: ${statusText}`}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColor,
          }}
        />
        <span>{statusText}</span>
      </div>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;
