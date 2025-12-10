/**
 * TITANE_INFINITY v19.3.0 — Visual Engine Demo
 * Complete demonstration of Visual Engine capabilities
 *
 * Features:
 * - All visual states showcase
 * - All panels demonstration
 * - All effects showcase
 * - Performance monitoring
 */

import React, { useEffect, useState } from 'react';
import { useVisualStateStore } from '@/stores/visualStateStore';
import { useVisualState } from '@/hooks/useVisualState';
import { ChatPanel } from '@/components/panels/ChatPanel';
import { MemoryPanel, MemoryMetric } from '@/components/panels/MemoryPanel';
import { DevToolsPanel, EngineStatus } from '@/components/panels/DevToolsPanel';
import { SelfHealingPanel, HealingPhase } from '@/components/panels/SelfHealingPanel';
import { EnergyArcs, EnergyArc } from '@/effects/EnergyArcs';
import { HealingWaves } from '@/effects/HealingWaves';
import { AudioWaveform } from '@/effects/AudioWaveform';
import { GlitchEffect } from '@/effects/GlitchEffect';
import { SpiralPattern } from '@/effects/SpiralPattern';
import type { VisualState } from '@/design-system/visual-states';

export const VisualEngineDemo: React.FC = () => {
  const { engine, initEngine, startEngine, setState, currentState, performanceMetrics } =
    useVisualStateStore();
  const { visuals } = useVisualState(engine);

  const [showEffects, setShowEffects] = useState(false);

  // Initialize engine on mount
  useEffect(() => {
    initEngine({
      enableParticles: true,
      enableEffects: true,
      targetFPS: 60,
      performanceMode: 'high',
    });
    startEngine();
  }, [initEngine, startEngine]);

  // Mock data for panels
  const mockMemoryMetrics: MemoryMetric[] = [
    {
      label: 'Short Term',
      value: 75,
      max: 100,
      color: '#4a9eff',
      description: 'Recent context',
    },
    {
      label: 'Long Term',
      value: 45,
      max: 100,
      color: '#34d399',
      description: 'Persistent memories',
    },
    {
      label: 'Working Memory',
      value: 60,
      max: 100,
      color: '#fbbf24',
      description: 'Active processing',
    },
    {
      label: 'Semantic',
      value: 30,
      max: 100,
      color: '#a78bfa',
      description: 'Knowledge base',
    },
  ];

  const mockEngines: EngineStatus[] = [
    {
      name: 'Cognitive Engine',
      status: 'active',
      metrics: [
        { label: 'Uptime', value: '24h 15m' },
        { label: 'Tasks', value: 1247 },
        { label: 'Load', value: '65%' },
      ],
      description: 'Core reasoning and decision-making',
    },
    {
      name: 'Memory Engine',
      status: 'active',
      metrics: [
        { label: 'Stored', value: '45.2 MB' },
        { label: 'Queries', value: 3421 },
        { label: 'Hit Rate', value: '94%' },
      ],
      description: 'Persistent and working memory management',
    },
    {
      name: 'Healing Engine',
      status: currentState === 'healing' ? 'active' : 'idle',
      metrics: [
        { label: 'Repairs', value: 37 },
        { label: 'Success', value: '98%' },
        { label: 'Active', value: currentState === 'healing' ? 'Yes' : 'No' },
      ],
      description: 'Automatic error detection and recovery',
    },
    {
      name: 'Performance Monitor',
      status: 'active',
      metrics: [
        { label: 'FPS', value: performanceMetrics.fps },
        { label: 'Frame Time', value: `${performanceMetrics.frameTime.toFixed(1)}ms` },
        { label: 'Particles', value: performanceMetrics.particleCount },
      ],
      description: 'Real-time performance tracking',
    },
  ];

  const mockHealingPhases: HealingPhase[] = [
    {
      id: 'detect',
      name: 'Error Detection',
      status: 'completed',
      progress: 100,
      duration: 500,
      startTime: Date.now() - 2000,
    },
    {
      id: 'analyze',
      name: 'Root Cause Analysis',
      status: currentState === 'healing' ? 'active' : 'completed',
      progress: currentState === 'healing' ? 65 : 100,
      duration: 1200,
      startTime: Date.now() - 1500,
    },
    {
      id: 'repair',
      name: 'Automatic Repair',
      status: currentState === 'healing' ? 'pending' : 'completed',
      progress: currentState === 'healing' ? 0 : 100,
      duration: 800,
    },
    {
      id: 'verify',
      name: 'Verification',
      status: 'pending',
      progress: 0,
      duration: 600,
    },
  ];

  const mockEnergyArcs: EnergyArc[] = [
    {
      id: 'arc1',
      start: { x: 100, y: 100 },
      end: { x: 300, y: 150 },
      color: '#4a9eff',
      intensity: 0.8,
    },
    {
      id: 'arc2',
      start: { x: 300, y: 150 },
      end: { x: 500, y: 100 },
      color: '#34d399',
      intensity: 0.6,
    },
    {
      id: 'arc3',
      start: { x: 200, y: 200 },
      end: { x: 400, y: 250 },
      color: '#a78bfa',
      intensity: 0.7,
    },
  ];

  const states: VisualState[] = [
    'idle',
    'listening',
    'thinking',
    'speaking',
    'processing',
    'error',
    'success',
    'loading',
    'healing',
    'quantum',
    'singularity',
  ];

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: visuals.background,
        transition: 'background-color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: visuals.primary,
            marginBottom: '16px',
            transition: 'color 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          TITANE Visual Engine Demo
        </h1>

        {/* State controls */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          {states.map(state => (
            <button
              key={state}
              onClick={() => setState(state)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border:
                  currentState === state
                    ? `2px solid ${visuals.accent}`
                    : '1px solid rgba(255,255,255,0.2)',
                backgroundColor:
                  currentState === state
                    ? visuals.accent + '20'
                    : 'rgba(255,255,255,0.05)',
                color: currentState === state ? visuals.accent : 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: '13px',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Effects toggle */}
        <button
          onClick={() => setShowEffects(!showEffects)}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: showEffects
              ? visuals.accent + '30'
              : 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showEffects ? 'Hide' : 'Show'} Special Effects
        </button>
      </div>

      {/* Special Effects Showcase */}
      {showEffects && (
        <div
          style={{
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: visuals.primary,
              marginBottom: '24px',
            }}
          >
            Special Effects
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Energy Arcs */}
            <div
              style={{
                position: 'relative',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
              }}
            >
              <EnergyArcs arcs={mockEnergyArcs} />
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Energy Arcs
              </div>
            </div>

            {/* Healing Waves */}
            <div
              style={{
                position: 'relative',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
              }}
            >
              <HealingWaves color={visuals.accent} />
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Healing Waves
              </div>
            </div>

            {/* Audio Waveform */}
            <div
              style={{
                position: 'relative',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AudioWaveform barCount={7} color={visuals.primary} height="150px" />
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Audio Waveform
              </div>
            </div>

            {/* Glitch Effect */}
            <div
              style={{
                position: 'relative',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GlitchEffect continuous intensity="medium">
                <h3 style={{ fontSize: '24px', fontWeight: 700, color: visuals.accent }}>
                  GLITCH
                </h3>
              </GlitchEffect>
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Glitch Effect
              </div>
            </div>

            {/* Spiral Pattern */}
            <div
              style={{
                position: 'relative',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SpiralPattern
                color={visuals.accent}
                secondaryColor={visuals.primary}
                size="150px"
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                Spiral Pattern
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panels Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Chat Panel */}
        <div style={{ minHeight: '400px' }}>
          <ChatPanel>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Chat content goes here. This panel adapts to the current visual state.
              </p>
            </div>
          </ChatPanel>
        </div>

        {/* Memory Panel */}
        <MemoryPanel metrics={mockMemoryMetrics} />

        {/* DevTools Panel */}
        <DevToolsPanel engines={mockEngines} />

        {/* Self-Healing Panel */}
        <SelfHealingPanel
          phases={mockHealingPhases}
          overallProgress={currentState === 'healing' ? 45 : 75}
          isHealing={currentState === 'healing'}
        />
      </div>

      {/* Performance Stats */}
      <div
        style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: visuals.accent }}>
            {performanceMetrics.fps}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>FPS</div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: visuals.accent }}>
            {performanceMetrics.frameTime.toFixed(1)}ms
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            Frame Time
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: visuals.accent }}>
            {performanceMetrics.particleCount}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            Particles
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: visuals.accent,
              textTransform: 'capitalize',
            }}
          >
            {currentState}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            Current State
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualEngineDemo;
