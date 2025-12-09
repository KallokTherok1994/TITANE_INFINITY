/**
 * TITANE_INFINITY v19.3.0 — Adaptive Chat Panel
 * Chat interface with visual state adaptation
 *
 * Features:
 * - Adapts to visual states (idle, listening, thinking, speaking)
 * - Smooth 500ms transitions
 * - Particle background integration
 * - Responsive design
 */

import React, { useEffect, useRef } from 'react';
import { useVisualState } from '@/hooks/useVisualState';
import { useParticles } from '@/hooks/useParticles';
import { useVisualStateStore } from '@/stores/visualStateStore';
import '@/styles/animations.css';

export interface ChatPanelProps {
  className?: string;
  children?: React.ReactNode;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ className = '', children }) => {
  const engine = useVisualStateStore((state) => state.engine);
  const { state, visuals, isTransitioning } = useVisualState(engine);
  const { canvasRef, setPattern, setColors, setEmissionRate } = useParticles({
    maxParticles: 300,
    pattern: 'dispersed',
    emissionRate: 5,
  });

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

  return (
    <div
      ref={panelRef}
      className={`chat-panel smooth-transition ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: visuals.background,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'background-color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
      data-state={state}
      data-transitioning={isTransitioning}
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
            borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
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

        {/* Main content area */}
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
      </div>
    </div>
  );
};

export default ChatPanel;
