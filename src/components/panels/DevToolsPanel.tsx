/**
 * TITANE_INFINITY v19.3.0 — Adaptive DevTools Panel
 * Development tools with OMEGA engine cards
 *
 * Features:
 * - Engine status cards with visual states
 * - Real-time metrics display
 * - Smooth 500ms transitions
 * - Grid layout responsive
 */

import React from 'react';
import { useVisualState } from '@/hooks/useVisualState';
import { useVisualStateStore } from '@/stores/visualStateStore';
import '@/styles/animations.css';

export interface EngineStatus {
  name: string;
  status: 'active' | 'idle' | 'error' | 'disabled';
  metrics: {
    label: string;
    value: string | number;
  }[];
  description?: string;
}

export interface DevToolsPanelProps {
  className?: string;
  engines: EngineStatus[];
}

const statusColors = {
  active: '#34d399',
  idle: '#9ca4ab',
  error: '#ef4444',
  disabled: '#60676d',
};

export const DevToolsPanel: React.FC<DevToolsPanelProps> = ({ className = '', engines }) => {
  const engine = useVisualStateStore((state) => state.engine);
  const { visuals, isTransitioning } = useVisualState(engine);

  return (
    <div
      className={`devtools-panel smooth-transition ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        padding: '24px',
        backgroundColor: visuals.background,
        borderRadius: '12px',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className={isTransitioning ? 'glow-pulse' : ''}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: visuals.accent,
              boxShadow: visuals.glow,
            }}
          />
          <h3
            className="smooth-colors"
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: visuals.primary,
              transition: 'color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            OMEGA Engines
          </h3>
        </div>

        {/* Total count */}
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          {engines.filter((e) => e.status === 'active').length} / {engines.length} Active
        </span>
      </div>

      {/* Engine cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {engines.map((engineStatus, index) => {
          const statusColor = statusColors[engineStatus.status];

          return (
            <div
              key={`${engineStatus.name}-${index}`}
              className="scale-in"
              style={{
                animationDelay: `${index * 75}ms`,
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: `1px solid rgba(255, 255, 255, 0.08)`,
                transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = statusColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {/* Engine header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {engineStatus.name}
                </h4>

                {/* Status indicator */}
                <div
                  className={engineStatus.status === 'active' ? 'pulse-medium' : ''}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: statusColor,
                    boxShadow: `0 0 8px ${statusColor}`,
                  }}
                />
              </div>

              {/* Description */}
              {engineStatus.description && (
                <p
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: 1.4,
                  }}
                >
                  {engineStatus.description}
                </p>
              )}

              {/* Metrics */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {engineStatus.metrics.map((metric, metricIndex) => (
                  <div
                    key={`${metric.label}-${metricIndex}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {metric.label}
                    </span>
                    <span
                      style={{
                        color: statusColor,
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}
                    >
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status badge */}
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  {engineStatus.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DevToolsPanel;
