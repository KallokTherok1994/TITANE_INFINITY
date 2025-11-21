// TITANE∞ v12 - StatusIndicator Component
// Connection and AI status display

import React from 'react';
import './StatusIndicator.css';

export interface StatusIndicatorProps {
  online: boolean;
  provider: 'Gemini' | 'Ollama' | 'Offline';
  health: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  provider,
  health,
}) => {
  const getStatusColor = () => {
    if (health > 0.7) return 'green';
    if (health > 0.4) return 'yellow';
    return 'red';
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'Gemini':
        return '🌐';
      case 'Ollama':
        return '🦙';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="status-indicator">
      <div className={`status-dot ${getStatusColor()}`} />
      <span className="status-provider">
        {getProviderIcon()} {provider}
      </span>
      <div className="status-health-bar">
        <div
          className="status-health-fill"
          style={{ width: `${health * 100}%` }}
        />
      </div>
    </div>
  );
};
