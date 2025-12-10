/**
 * TITANE∞ v21 — TitaneSphere Demo
 * Démonstration complète du noyau visuel polished
 *
 * Test tous les effets et états
 */

import React, { useState } from 'react';
import { TitaneSphereCore } from '@/components/core/TitaneSphereCore';
import { useTitaneSphere } from '@/hooks/useTitaneSphere';
import { CognitiveState, EmotionalTone } from '@/design-system/visual-states';

export const TitaneSphereDemo: React.FC = () => {
  const {
    config,
    setCognitiveState,
    setEmotionalTone,
    setIntensity,
    setSize,
    toggleEffect,
    reset,
  } = useTitaneSphere({
    initialSize: 300,
    autoSync: false,
    enableAllEffects: true,
  });

  const [autoRotate, setAutoRotate] = useState(false);

  // Auto-rotate through cognitive states
  React.useEffect(() => {
    if (!autoRotate) return;

    const states = Object.values(CognitiveState);
    let index = 0;

    const interval = setInterval(() => {
      setCognitiveState(states[index % states.length]);
      index++;
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, setCognitiveState]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0e14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        padding: '40px',
      }}
    >
      {/* Title */}
      <h1
        style={{
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: 700,
          margin: 0,
          textAlign: 'center',
        }}
      >
        TITANE∞ Sphere Core Demo
      </h1>

      {/* Sphere */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TitaneSphereCore config={config} />
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '1200px',
        }}
      >
        {/* Cognitive State */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Cognitive State
          </h3>
          <select
            value={config.cognitiveState}
            onChange={e => setCognitiveState(e.target.value as CognitiveState)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1a1f2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
            }}
          >
            {Object.values(CognitiveState).map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '8px',
              backgroundColor: autoRotate ? '#4a9eff' : '#2a3f5f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {autoRotate ? '⏸ Stop Auto-Rotate' : '▶ Auto-Rotate'}
          </button>
        </div>

        {/* Emotional Tone */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Emotional Tone
          </h3>
          <select
            value={config.emotionalTone}
            onChange={e => setEmotionalTone(e.target.value as EmotionalTone)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#1a1f2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
            }}
          >
            {Object.values(EmotionalTone).map(tone => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        {/* Intensity */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Intensity: {(config.intensity * 100).toFixed(0)}%
          </h3>
          <input
            type="range"
            min="0"
            max="100"
            value={config.intensity * 100}
            onChange={e => setIntensity(Number(e.target.value) / 100)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Size */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Size: {config.size}px
          </h3>
          <input
            type="range"
            min="100"
            max="500"
            value={config.size}
            onChange={e => setSize(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Effects Toggles */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '8px',
            gridColumn: 'span 2',
          }}
        >
          <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            Visual Effects
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => toggleEffect('enableDynamicShadows')}
              style={{
                padding: '8px',
                backgroundColor: config.enableDynamicShadows ? '#34d399' : '#2a3f5f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {config.enableDynamicShadows ? '✓' : '✗'} Dynamic Shadows
            </button>
            <button
              onClick={() => toggleEffect('enableMicroDeformations')}
              style={{
                padding: '8px',
                backgroundColor: config.enableMicroDeformations ? '#34d399' : '#2a3f5f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {config.enableMicroDeformations ? '✓' : '✗'} Micro-Deformations
            </button>
            <button
              onClick={() => toggleEffect('enableDirectionalGlow')}
              style={{
                padding: '8px',
                backgroundColor: config.enableDirectionalGlow ? '#34d399' : '#2a3f5f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {config.enableDirectionalGlow ? '✓' : '✗'} Directional Glow
            </button>
            <button
              onClick={() => toggleEffect('enablePhaseShift')}
              style={{
                padding: '8px',
                backgroundColor: config.enablePhaseShift ? '#34d399' : '#2a3f5f',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {config.enablePhaseShift ? '✓' : '✗'} Phase Shift
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '20px',
            borderRadius: '8px',
            gridColumn: 'span 2',
          }}
        >
          <button
            onClick={reset}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '600px',
        }}
      >
        <p style={{ margin: '8px 0' }}>
          <strong>Dynamic Shadows:</strong> Shadows adapt to intensity + emotional
          colorimetry
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>Micro-Deformations:</strong> Living surface effect with breathing
          deformations
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>Directional Glow:</strong> Glow follows cursor position (move mouse over
          sphere)
        </p>
        <p style={{ margin: '8px 0' }}>
          <strong>Phase Shift:</strong> Orbital rings desynchronized for depth effect
        </p>
      </div>
    </div>
  );
};

export default TitaneSphereDemo;
