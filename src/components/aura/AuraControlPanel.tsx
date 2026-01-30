/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.1 — AURA CONTROL PANEL
 *   Panneau de contrôle utilisateur pour configuration Aura
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useAura } from '@/hooks/useAuraOrchestrator';
import type { AuraIntensity, AuraMode, AuraTheme } from '@/hooks/useAuraOrchestrator';
import './AuraControlPanel.css';

interface AuraControlPanelProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'header';
  defaultOpen?: boolean;
}

export const AuraControlPanel: React.FC<AuraControlPanelProps> = ({
  intensity,
  onChange,
}) => {
  position = 'bottom-right',
  defaultOpen = false,
}) => {
  const aura = useAura();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const intensities: AuraIntensity[] = ['minimal', 'low', 'medium', 'high', 'maximum'];
  const modes: AuraMode[] = ['disabled', 'static', 'dynamic', 'reactive', 'quantum'];
  const themes: AuraTheme[] = ['default', 'ocean', 'sunset', 'forest', 'fire', 'rainbow'];
  const presets = ['minimal', 'balanced', 'performance', 'quality', 'maximum'] as const;

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`aura-control-toggle aura-control-toggle--${position}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Aura Control Panel"
        title="Aura Settings"
      >
        <span className="aura-icon">✨</span>
        {aura.enabled && (
          <span className="aura-status-dot" data-intensity={aura.intensity} />
        )}
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className={`aura-control-panel aura-control-panel--${position}`}>
          {/* Header */}
          <div className="aura-control-header">
            <h3>
              <span className="aura-icon">✨</span>
              Aura Settings
            </h3>
            <button
              className="aura-control-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="aura-control-content">
            {/* Master Toggle */}
            <div className="aura-control-section">
              <label className="aura-control-toggle-label">
                <input
                  type="checkbox"
                  checked={aura.enabled}
                  onChange={e => aura.setEnabled(e.target.checked)}
                />
                <span>Enable Aura Effects</span>
              </label>
            </div>

            {aura.enabled && (
              <>
                {/* Presets */}
                <div className="aura-control-section">
                  <h4>Quick Presets</h4>
                  <div className="aura-preset-grid">
                    {presets.map(preset => (
                      <button
                        key={preset}
                        className="aura-preset-btn"
                        onClick={() => aura.applyPreset(preset)}
                      >
                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div className="aura-control-section">
                  <h4>Intensity</h4>
                  <div className="aura-slider-container">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      value={intensities.indexOf(aura.intensity)}
                      onChange={e =>
                        aura.setIntensity(
                          intensities[parseInt(e.target.value)] ?? 'medium'
                        )
                      }
                      className="aura-slider"
                    />
                    <div className="aura-slider-labels">
                      {intensities.map(int => (
                        <span
                          key={int}
                          className={aura.intensity === int ? 'active' : ''}
                        >
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="aura-value-display">
                    Current: {(aura.globalIntensity * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Mode */}
                <div className="aura-control-section">
                  <h4>Mode</h4>
                  <select
                    value={aura.mode}
                    onChange={e => aura.setMode(e.target.value as AuraMode)}
                    className="aura-select"
                  >
                    {modes.map(mode => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme */}
                <div className="aura-control-section">
                  <h4>Theme</h4>
                  <div className="aura-theme-grid">
                    {themes.map(theme => (
                      <button
                        key={theme}
                        className={`aura-theme-btn ${aura.theme === theme ? 'active' : ''}`}
                        onClick={() => aura.setTheme(theme)}
                        data-theme={theme}
                      >
                        <span className="theme-preview" data-theme={theme} />
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Particles */}
                <div className="aura-control-section">
                  <h4>Quantum Particles</h4>
                  <label className="aura-control-toggle-label">
                    <input
                      type="checkbox"
                      checked={aura.config.particlesEnabled}
                      onChange={e => aura.setParticlesEnabled(e.target.checked)}
                    />
                    <span>Enable Particles</span>
                  </label>
                  {aura.config.particlesEnabled && (
                    <div className="aura-info">
                      Count: {aura.config.particleCount} particles
                    </div>
                  )}
                </div>

                {/* Quality */}
                <div className="aura-control-section">
                  <h4>Quality</h4>
                  <select
                    value={aura.config.quality}
                    onChange={e =>
                      aura.setQuality(
                        e.target.value as 'low' | 'medium' | 'high' | 'ultra'
                      )
                    }
                    className="aura-select"
                  >
                    <option value="low">Low (30 FPS)</option>
                    <option value="medium">Medium (45 FPS)</option>
                    <option value="high">High (60 FPS)</option>
                    <option value="ultra">Ultra (60 FPS+)</option>
                  </select>
                </div>

                {/* Performance Metrics */}
                <div className="aura-control-section">
                  <h4>Performance</h4>
                  <div className="aura-metrics">
                    <div className="aura-metric">
                      <span>FPS:</span>
                      <span className={aura.metrics.fps < 30 ? 'warning' : 'success'}>
                        {aura.metrics.fps.toFixed(0)}
                      </span>
                    </div>
                    <div className="aura-metric">
                      <span>Recommended:</span>
                      <span>{aura.getRecommendedQuality()}</span>
                    </div>
                  </div>
                </div>

                {/* Reset */}
                <div className="aura-control-section">
                  <button
                    className="aura-reset-btn"
                    onClick={() => aura.resetToDefault()}
                  >
                    Reset to Default
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

AuraControlPanel.displayName = 'AuraControlPanel';

export default AuraControlPanel;
