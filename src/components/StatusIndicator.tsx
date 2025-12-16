// TITANE∞ v15 - StatusIndicator Component
// Connection and AI status display
// FIX: Added React.memo to prevent 3-4 unnecessary re-renders/sec

import React, { memo, useMemo } from 'react';
import './StatusIndicator.css';

export interface StatusIndicatorProps {
  online: boolean;
  provider: 'Gemini' | 'Ollama' | 'Offline';
  health: number;
}

export const StatusIndicator = memo(function StatusIndicator({
  provider,
  health,
}: StatusIndicatorProps) {
  const statusColor = useMemo(() => {
    if (health > 0.7) return 'green';
    if (health > 0.4) return 'yellow';
    return 'red';
  }, [health]);

  const providerIcon = useMemo(() => {
    switch (provider) {
      case 'Gemini':
        return '🌐';
      case 'Ollama':
        return '🦙';
      default:
        return '⚠️';
    }
  }, [provider]);

  const healthWidth = useMemo(() => `${health * 100}%`, [health]);

  return (
    <div className="status-indicator">
      <div className={`status-dot ${statusColor}`} />
      <span className="status-provider">
        {providerIcon} {provider}
      </span>
      <div className="status-health-bar">
        <div className="status-health-fill" style={{ width: healthWidth }} />
      </div>
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';
