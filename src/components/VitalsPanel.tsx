/**
 * TITANE∞ v30.0.0 — VitalsPanel Component
 * Unified DEV cockpit: mode, messages, connection truth, metrics availability.
 * Single bottom-strip surface for runtime diagnosis — no behavior change.
 */

import React from 'react';
import type { ChatMode } from '@/services/ai';
import type { ConnectionState } from '@/hooks/useConnection';
import type { BackendUnavailableReason } from '@/hooks/useBackendHealth';

export interface VitalsPanelProps {
  currentMode: ChatMode;
  messagesCount: number;
  /** Graduated connection state from useConnection — CHECKING/ONLINE/PARTIAL/LOCAL_ONLY/OFFLINE */
  connectionState?: ConnectionState;
  /** Backend unavailability cause from useBackendHealth — shown only when degraded */
  unavailableReason?: BackendUnavailableReason;
  /** Whether system metrics are currently available (null metrics = false) */
  metricsAvailable?: boolean;
}

const CONNECTION_STATE_COLOR: Record<ConnectionState, string> = {
  CHECKING: '#94a3b8',
  ONLINE: '#22c55e',
  PARTIAL: '#eab308',
  LOCAL_ONLY: '#f97316',
  OFFLINE: '#ef4444',
};

const UNAVAILABLE_REASON_SHORT: Record<BackendUnavailableReason, string> = {
  'all-backends-down': 'All backends down',
  'tauri-backend-down': 'Tauri down',
  'ollama-offline': 'Ollama offline',
  'ollama-remote-unavailable': 'Ollama remote unavailable',
  'network-error': 'Network error',
  'unknown-error': 'Unknown error',
};

export const VitalsPanel: React.FC<VitalsPanelProps> = React.memo(
  ({
    currentMode,
    messagesCount,
    connectionState,
    unavailableReason,
    metricsAvailable,
  }) => {
    const isDegraded = connectionState
      ? connectionState !== 'ONLINE' && connectionState !== 'CHECKING'
      : false;

    return (
      <div
        className="vitals-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px',
          fontSize: '11px',
          color: '#94a3b8',
          borderTop: '1px solid #334155',
          flexWrap: 'wrap',
        }}
      >
        {/* Always-present context */}
        <span>Mode: {currentMode}</span>
        <span style={{ color: '#475569' }}>|</span>
        <span>Messages: {messagesCount}</span>

        {/* Connection truth — always shown when available */}
        {connectionState && (
          <>
            <span style={{ color: '#475569' }}>|</span>
            <span
              style={{ color: CONNECTION_STATE_COLOR[connectionState] }}
              title={
                isDegraded && unavailableReason
                  ? `Connection: ${connectionState} — ${UNAVAILABLE_REASON_SHORT[unavailableReason]}`
                  : `Connection: ${connectionState}`
              }
            >
              {connectionState}
              {isDegraded && unavailableReason && (
                <span style={{ color: '#64748b', marginLeft: 4 }}>
                  ({UNAVAILABLE_REASON_SHORT[unavailableReason]})
                </span>
              )}
            </span>
          </>
        )}

        {/* Metrics truth — shown only when explicitly unavailable to avoid noise */}
        {metricsAvailable === false && (
          <>
            <span style={{ color: '#475569' }}>|</span>
            <span style={{ color: '#64748b' }} title="System metrics unavailable">
              Metrics: —
            </span>
          </>
        )}
      </div>
    );
  }
);

VitalsPanel.displayName = 'VitalsPanel';

export default VitalsPanel;
