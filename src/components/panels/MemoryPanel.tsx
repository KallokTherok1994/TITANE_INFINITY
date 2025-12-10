/**
 * TITANE∞ v21 — Adaptive Memory Panel
 * Memory visualization with animated progress bars
 *
 * Features v21:
 * - ✅ Animated progress bars for memory metrics
 * - ✅ Visual state adaptation
 * - ✅ Smooth 500ms transitions
 * - ✅ Real-time memory updates
 * - ✅ Panel state management (collapsed/expanded)
 * - ✅ Z-index auto-management (bring-to-front)
 * - ✅ LocalStorage persistence
 * - ✅ Mobile responsive
 */

import React, { useEffect } from 'react';
import { useVisualState } from '@/hooks/useVisualState';
import { useVisualStateStore } from '@/stores/visualStateStore';
import { usePanelState } from '@/hooks/usePanelState';
import { usePanelsStore } from '@/stores/panelsStore';
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
  const engine = useVisualStateStore(state => state.engine);
  const { visuals, isTransitioning } = useVisualState(engine);

  // v21: Panel state management
  const { isCollapsed, isVisible, zIndex, toggle, bringToFront } = usePanelState({
    panelId: 'memory',
    defaultCollapsed: false,
    defaultVisible: true,
    defaultZIndex: 101,
    persistState: true,
  });

  // v21: Register panel in global store
  const registerPanel = usePanelsStore(state => state.registerPanel);
  useEffect(() => {
    registerPanel({
      id: 'memory',
      title: 'Memory',
      isVisible: true,
      isCollapsed: false,
      isPinned: false,
      zIndex: 101,
      position: { x: null, y: null },
      size: { width: null, height: null },
      hiddenOnMobile: false,
      collapsedOnMobile: true,
    });
  }, [registerPanel]);

  // v21: Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      className={`memory-panel smooth-transition ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: isCollapsed ? '56px' : 'auto', // v21: Collapsed height
        padding: isCollapsed ? '16px 24px' : '24px', // v21: Reduced padding when collapsed
        backgroundColor: visuals.background,
        borderRadius: '12px',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        zIndex, // v21: Dynamic z-index
        overflow: 'hidden', // v21: Hide overflow when collapsed
      }}
      data-panel-id="memory" // v21: For z-index queries
      onClick={bringToFront} // v21: Bring to front on click
    >
      {/* Header */}
      <div
        style={{
          marginBottom: isCollapsed ? '0' : '20px', // v21: No margin when collapsed
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between', // v21: Space for collapse button
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
            Memory Metrics
          </h3>
        </div>

        {/* v21: Collapse/Expand button */}
        <button
          onClick={e => {
            e.stopPropagation(); // Don't trigger bring-to-front
            toggle();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: visuals.primary,
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 200ms',
          }}
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Memory metrics - v21: Hide when collapsed */}
      {!isCollapsed && (
        <>
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
        </>
      )}
    </div>
  );
};

export default MemoryPanel;
