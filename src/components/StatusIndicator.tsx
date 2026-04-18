/**
 * TITANE∞ v30.0.0 — StatusIndicator Component (Stub)
 * Minimal status indicator showing connection state
 */

import React from 'react';
import type { ConnectionState } from '@/hooks/useConnection';
import type { BackendUnavailableReason } from '@/hooks/useBackendHealth';

export interface StatusIndicatorProps {
  online: boolean;
  provider: 'Gemini' | 'Ollama' | 'Offline' | string;
  health: number;
  /** Graduated connection truth. When provided, overrides the binary online/health display. */
  connectionState?: ConnectionState;
  /** Backend unavailability cause. Shown as tooltip on degraded states only. */
  unavailableReason?: BackendUnavailableReason;
}

const UNAVAILABLE_REASON_TEXT: Record<BackendUnavailableReason, string> = {
  'all-backends-down': 'Tauri backend and Ollama are both unavailable',
  'tauri-backend-down': 'Tauri backend unreachable',
  'ollama-offline': 'Ollama service offline',
  'network-error': 'Network error',
  'unknown-error': 'Unknown backend error',
};

const CONNECTION_STATE_LABEL: Record<ConnectionState, string> = {
  CHECKING: '…',
  ONLINE: '', // provider name used when online
  PARTIAL: '⚠ Partial',
  LOCAL_ONLY: 'Local',
  OFFLINE: 'Offline',
};

const CONNECTION_STATE_COLOR: Record<ConnectionState, string> = {
  CHECKING: '#94a3b8',
  ONLINE: '#22c55e',
  PARTIAL: '#eab308',
  LOCAL_ONLY: '#f97316',
  OFFLINE: '#ef4444',
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(
  ({ online, provider, health, connectionState, unavailableReason }) => {
    const statusColor = connectionState
      ? CONNECTION_STATE_COLOR[connectionState]
      : online
        ? health > 0.7
          ? '#22c55e'
          : '#eab308'
        : '#ef4444';

    const stateLabel = connectionState
      ? CONNECTION_STATE_LABEL[connectionState]
      : undefined;
    const statusText = connectionState
      ? connectionState === 'ONLINE'
        ? provider
        : (stateLabel ?? provider)
      : online
        ? provider
        : 'Offline';

    // Show cause tooltip only when degraded — zero noise on healthy state
    const isDegraded = connectionState
      ? connectionState !== 'ONLINE' && connectionState !== 'CHECKING'
      : !online;
    const tooltipText =
      isDegraded && unavailableReason
        ? `${statusText} — ${UNAVAILABLE_REASON_TEXT[unavailableReason]}`
        : `Status: ${statusText}`;

    return (
      <div
        className="status-indicator"
        title={tooltipText}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          color: statusColor,
          cursor: isDegraded && unavailableReason ? 'help' : 'default',
        }}
        aria-label={tooltipText}
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
