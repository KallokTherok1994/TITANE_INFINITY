/**
 * TITANE∞ — Tool Result Display Component
 * Affiche les résultats des appels d'outils
 *
 * v26.4.0 (Sprint 6)
 */

import React, { memo } from 'react';
import type { ToolCall } from '../../services/chat/toolCaller';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ToolResultProps {
  toolCall: ToolCall;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

/**
 * Displays a tool call result with nice formatting
 */
export const ToolResult = memo(function ToolResult({
  toolCall,
  className,
  style,
}: ToolResultProps) {
  const isError = Boolean(toolCall.error);
  const timestamp = new Date(toolCall.timestamp).toLocaleTimeString('fr-FR');

  return (
    <div
      className={className}
      style={{
        padding: '12px',
        background: isError ? 'rgba(255, 107, 107, 0.1)' : 'rgba(81, 207, 102, 0.1)',
        border: `1px solid ${isError ? 'rgba(255, 107, 107, 0.3)' : 'rgba(81, 207, 102, 0.3)'}`,
        borderRadius: '8px',
        marginTop: '8px',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <span style={{ color: isError ? '#FF6B6B' : '#51CF66' }}>
          {isError ? '❌' : '✅'}
        </span>
        <span style={{ color: '#C4C4C4' }}>{toolCall.name}</span>
        <span style={{ color: '#727B81', fontSize: '11px', marginLeft: 'auto' }}>
          {timestamp}
        </span>
      </div>

      {/* Arguments */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#727B81', marginBottom: '4px' }}>
          Arguments:
        </div>
        <pre
          style={{
            background: 'rgba(4, 15, 31, 0.5)',
            padding: '6px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#C4C4C4',
            overflow: 'auto',
            margin: 0,
            maxHeight: '120px',
          }}
        >
          {JSON.stringify(toolCall.arguments, null, 2)}
        </pre>
      </div>

      {/* Result or Error */}
      {isError ? (
        <div style={{ fontSize: '11px' }}>
          <div style={{ color: '#727B81', marginBottom: '4px' }}>Error:</div>
          <div
            style={{
              background: 'rgba(255, 107, 107, 0.2)',
              padding: '6px',
              borderRadius: '4px',
              color: '#FF6B6B',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            {toolCall.error}
          </div>
        </div>
      ) : toolCall.result ? (
        <div style={{ fontSize: '11px' }}>
          <div style={{ color: '#727B81', marginBottom: '4px' }}>Result:</div>
          <pre
            style={{
              background: 'rgba(81, 207, 102, 0.1)',
              padding: '6px',
              borderRadius: '4px',
              color: '#51CF66',
              fontFamily: 'monospace',
              fontSize: '11px',
              overflow: 'auto',
              margin: 0,
              maxHeight: '120px',
            }}
          >
            {JSON.stringify(toolCall.result, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
});

export default ToolResult;
