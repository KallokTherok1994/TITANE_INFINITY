/**
 * TITANE∞ v21 — Adaptive Chat Panel
 * Chat interface with visual state adaptation
 *
 * Features v21:
 * - ✅ Adapts to visual states (idle, listening, thinking, speaking)
 * - ✅ Smooth 500ms transitions
 * - ✅ Particle background integration
 * - ✅ Responsive design
 * - ✅ Panel state management (collapsed/expanded)
 * - ✅ Z-index auto-management (bring-to-front)
 * - ✅ LocalStorage persistence
 * - ✅ Mobile responsive
 */

import React, { useEffect, useRef } from 'react';
import { useVisualState } from '@/hooks/useVisualState';
import { useParticles } from '@/hooks/useParticles';
import { useVisualStateStore } from '@/stores/visualStateStore';
import { usePanelState } from '@/hooks/usePanelState';
import { usePanelsStore } from '@/stores/panelsStore';
import '@/styles/animations.css';

export interface ChatPanelProps {
  className?: string;
  children?: React.ReactNode;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className = '', children }) => {
  const engine = useVisualStateStore(state => state.engine);
  const { state, visuals, isTransitioning } = useVisualState(engine);
  const { canvasRef, setPattern, setColors, setEmissionRate } = useParticles({
    maxParticles: 300,
    pattern: 'dispersed',
    emissionRate: 5,
  });

  // v21: Panel state management
  const { isCollapsed, isVisible, zIndex, toggle, bringToFront } = usePanelState({
    panelId: 'chat',
    defaultCollapsed: false,
    defaultVisible: true,
    defaultZIndex: 100,
    persistState: true,
  });

  // v21: Register panel in global store
  const registerPanel = usePanelsStore(state => state.registerPanel);
  useEffect(() => {
    registerPanel({
      id: 'chat',
      title: 'Chat',
      isVisible: true,
      isCollapsed: false,
      isPinned: false,
      zIndex: 100,
      position: { x: null, y: null },
      size: { width: null, height: null },
      hiddenOnMobile: false,
      collapsedOnMobile: false,
    });
  }, [registerPanel]);

  const panelRef = useRef<HTMLDivElement>(null);

  // Update particles based on visual state
  useEffect(() => {
    if (!visuals) return;

    // Update particle pattern based on state
    switch (state) {
      case 'idle':
        setPattern('dispersed');
        setEmissionRate(3);
        break;
      case 'listening':
        setPattern('focused');
        setEmissionRate(8);
        break;
      case 'thinking':
        setPattern('spiral');
        setEmissionRate(10);
        break;
      case 'speaking':
        setPattern('chaotic');
        setEmissionRate(12);
        break;
      default:
        setPattern('dispersed');
        setEmissionRate(5);
    }

    // Update particle colors
    setColors([visuals.particleColor, visuals.accent, visuals.secondary]);
  }, [state, visuals, setPattern, setColors, setEmissionRate]);

  // v21: Don't render if not visible
  if (!isVisible) return null;

  return (
    <div
      ref={panelRef}
      className={`chat-panel smooth-transition ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: isCollapsed ? '56px' : '100%', // v21: Collapsed height
        backgroundColor: visuals.background,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)', // v21: Transition height too
        zIndex, // v21: Dynamic z-index
      }}
      data-state={state}
      data-transitioning={isTransitioning}
      data-panel-id="chat" // v21: For z-index queries
      onClick={bringToFront} // v21: Bring to front on click
    >
      {/* Particle background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with state indicator */}
        <div
          className="smooth-colors"
          style={{
            padding: '16px',
            borderBottom: isCollapsed ? 'none' : `1px solid rgba(255, 255, 255, 0.1)`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'space-between', // v21: Space for collapse button
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* State indicator glow */}
            <div
              className={isTransitioning ? 'pulse-medium' : 'pulse-slow'}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: visuals.primary,
                boxShadow: visuals.glow,
                transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            />

            {/* State label */}
            <span
              className="smooth-colors"
              style={{
                color: visuals.primary,
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              {state}
            </span>
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

        {/* Main content area - v21: Hide when collapsed */}
        {!isCollapsed && (
          <>
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {children}
            </div>

            {/* Footer with visual accent */}
            <div
              className="smooth-colors"
              style={{
                padding: '12px 16px',
                borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
                background: `linear-gradient(to top, ${visuals.background}, transparent)`,
                transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <div
                className="smooth-transform"
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: visuals.accent,
                  opacity: 0.5,
                  transform: isTransitioning ? 'scaleX(1)' : 'scaleX(0.3)',
                  transformOrigin: 'left',
                  transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
