/**
 * TITANE_INFINITY v19.3.0 — Self-Healing Panel
 * Real-time healing process visualization
 *
 * Features:
 * - Phase-based healing progress
 * - Animated healing waves
 * - Real-time status updates
 * - Smooth 500ms transitions
 */

import React from 'react';
import { useVisualState } from '@/hooks/useVisualState';
import { useVisualStateStore } from '@/stores/visualStateStore';
import '@/styles/animations.css';

export interface HealingPhase {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  duration: number;
  startTime?: number;
}

export interface SelfHealingPanelProps {
  className?: string;
  phases: HealingPhase[];
  overallProgress: number;
  isHealing: boolean;
}

const phaseStatusColors = {
  pending: '#9ca4ab',
  active: '#06b6d4',
  completed: '#34d399',
  failed: '#ef4444',
};

export const SelfHealingPanel: React.FC<SelfHealingPanelProps> = ({
  className = '',
  phases,
  overallProgress,
  isHealing,
}) => {
  const engine = useVisualStateStore(state => state.engine);
  const { visuals, isTransitioning } = useVisualState(engine);

  return (
    <div
      className={`self-healing-panel smooth-transition ${className}`}
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
          {/* Healing indicator */}
          <div
            className={isHealing ? 'healing-ripple' : ''}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isHealing ? '#06b6d4' : visuals.accent,
              boxShadow: isHealing ? '0 0 16px #06b6d4' : visuals.glow,
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
            Self-Healing Status
          </h3>
        </div>

        {/* Overall progress */}
        <span
          className="smooth-colors"
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: isHealing ? '#06b6d4' : visuals.accent,
            transition: 'color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          {overallProgress.toFixed(0)}%
        </span>
      </div>

      {/* Overall progress bar */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div
          className="smooth-transform"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${overallProgress}%`,
            background: isHealing
              ? 'linear-gradient(90deg, #06b6d4, #22d3ee, #06b6d4)'
              : visuals.accent,
            backgroundSize: '200% 100%',
            borderRadius: '6px',
            transition: 'width 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
            boxShadow: isHealing ? '0 0 12px #06b6d4' : `0 0 8px ${visuals.accent}`,
            animation: isHealing ? 'shimmer 2s linear infinite' : 'none',
          }}
        />
      </div>

      {/* Healing phases */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {phases.map((phase, index) => {
          const statusColor = phaseStatusColors[phase.status];
          const isActive = phase.status === 'active';

          return (
            <div
              key={phase.id}
              className="slide-in-left"
              style={{
                animationDelay: `${index * 60}ms`,
                padding: '16px',
                backgroundColor: isActive
                  ? 'rgba(6, 182, 212, 0.05)'
                  : 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: `1px solid ${isActive ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                transition: 'all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              {/* Phase header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Phase status indicator */}
                  <div
                    className={isActive ? 'pulse-fast' : ''}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: statusColor,
                      boxShadow: isActive ? `0 0 12px ${statusColor}` : 'none',
                    }}
                  />

                  {/* Phase name */}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {phase.name}
                  </span>
                </div>

                {/* Phase progress */}
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: statusColor,
                  }}
                >
                  {phase.status === 'completed' ? '✓' : `${phase.progress.toFixed(0)}%`}
                </span>
              </div>

              {/* Phase progress bar */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="smooth-transform"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${phase.progress}%`,
                    backgroundColor: statusColor,
                    borderRadius: '3px',
                    transition: 'width 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                    boxShadow: isActive ? `0 0 8px ${statusColor}` : 'none',
                  }}
                />

                {/* Shimmer on active phase */}
                {isActive && (
                  <div
                    className="shimmer"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${phase.progress}%`,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>

              {/* Phase metadata */}
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <span>Duration: {(phase.duration / 1000).toFixed(1)}s</span>
                {phase.startTime && (
                  <span>Started: {new Date(phase.startTime).toLocaleTimeString()}</span>
                )}
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
        <span>
          Completed: {phases.filter(p => p.status === 'completed').length} /{' '}
          {phases.length}
        </span>
        <span>Status: {isHealing ? 'Healing...' : 'Idle'}</span>
      </div>
    </div>
  );
};

export default SelfHealingPanel;
