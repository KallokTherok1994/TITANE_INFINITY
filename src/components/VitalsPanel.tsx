/**
 * TITANE∞ v22Ω — VitalsPanel Component (Stub)
 * Minimal system vitals display
 */

import React from 'react';
import type { ChatMode } from '@/services/ai';

export interface VitalsPanelProps {
  currentMode: ChatMode;
  messagesCount: number;
}

export const VitalsPanel: React.FC<VitalsPanelProps> = React.memo(
  ({ currentMode, messagesCount }) => {
    return (
      <div
        className="vitals-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#94a3b8',
          borderTop: '1px solid #334155',
        }}
      >
        <span>Mode: {currentMode}</span>
        <span>Messages: {messagesCount}</span>
      </div>
    );
  }
);

VitalsPanel.displayName = 'VitalsPanel';

export default VitalsPanel;
