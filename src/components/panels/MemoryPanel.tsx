/**
 * TITANE_INFINITY v19.3.0 — Adaptive Memory Panel
 * Memory visualization with animated progress bars
 *
 * Features:
 * - Animated progress bars for memory metrics
 * - Visual state adaptation
 * - Smooth 500ms transitions
 * - Real-time memory updates
 */

import React from 'react';
import { useVisualState } from '@/hooks/useVisualState';
import { useVisualStateStore } from '@/stores/visualStateStore';
import '@/styles/animations.css';

export interface MemoryMetric {
  label: string;
  value: number;
  max: number;
  color?: string;
  description?: string;
}

export interface MemoryPanelProps {
  className?: string;
  metrics: MemoryMetric[];
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({ className = '', metrics }) => {
  const engine = useVisualStateStore((state) => state.engine);
  const { visuals, isTransitioning } = useVisualState(engine);

  return (
    <div
      className={`memory-panel smooth-transition ${className}`}
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
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
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
          Memory Metrics
        </h3>
      </div>

      {/* Memory metrics */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {metrics.map((metric, index) => {
          const percentage = Math.min((metric.value / metric.max) * 100, 100);
          const barColor = metric.color || visuals.accent;

          return (
            <div
              key={`${metric.label}-${index}`}
              className="slide-in-left"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Metric label and value */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span
                    className="smooth-colors"
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.9)',
                      transition: 'color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                  >
                    {metric.label}
                  </span>
                  {metric.description && (
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {metric.description}
                    </span>
                  )}
                </div>
                <span
                  className="smooth-colors"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: barColor,
                    transition: 'color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                >
                  {metric.value.toFixed(0)} / {metric.max.toFixed(0)}
                </span>
              </div>

              {/* Progress bar background */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* Progress bar fill */}
                <div
                  className="smooth-transform"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                    borderRadius: '4px',
                    transition: 'width 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                    boxShadow: `0 0 8px ${barColor}`,
                  }}
                />

                {/* Shimmer effect on active bars */}
                {percentage > 5 && (
                  <div
                    className="shimmer"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${percentage}%`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>

              {/* Percentage indicator */}
              <div
                style={{
                  marginTop: '4px',
                  textAlign: 'right',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div
        className="smooth-colors"
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        }}
      >
        <span>Total Metrics: {metrics.length}</span>
        <span>Last Updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default MemoryPanel;
