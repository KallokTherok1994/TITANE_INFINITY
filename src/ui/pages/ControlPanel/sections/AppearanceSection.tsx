/**
 * TITANE∞ OS - Section Apparence
 * Configuration Design System Monochrome
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface DesignSystemConfig {
  mode: 'light' | 'dark' | 'auto';
  density: 'compact' | 'normal' | 'comfortable';
  animations_enabled: boolean;
  transparency_enabled: boolean;
}

export const AppearanceSection: React.FC = () => {
  const [config, setConfig] = useState<DesignSystemConfig>({
    mode: 'auto',
    density: 'normal',
    animations_enabled: true,
    transparency_enabled: false
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig = await invoke<DesignSystemConfig>('get_design_config');
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Erreur chargement config:', error);
    }
  };

  const saveConfig = async (newConfig: DesignSystemConfig) => {
    try {
      await invoke('set_design_config', { config: newConfig });
      setConfig(newConfig);
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'auto') => {
    saveConfig({ ...config, mode });
  };

  const handleDensityChange = (density: 'compact' | 'normal' | 'comfortable') => {
    saveConfig({ ...config, density });
  };

  const toggleAnimations = () => {
    saveConfig({ ...config, animations_enabled: !config.animations_enabled });
  };

  const toggleTransparency = () => {
    saveConfig({ ...config, transparency_enabled: !config.transparency_enabled });
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Apparence</h2>
      </div>

      {/* Mode d'affichage */}
      <div className="cp-card">
        <h3 className="cp-card-title">Mode d'affichage</h3>
        <div className="cp-card-content">
          <div className="cp-mode-selector">
            <button
              className={`cp-mode-option ${config.mode === 'light' ? 'active' : ''}`}
              onClick={() => handleModeChange('light')}
            >
              <span className="cp-mode-icon">☀️</span>
              <span className="cp-mode-label">Clair</span>
            </button>
            <button
              className={`cp-mode-option ${config.mode === 'dark' ? 'active' : ''}`}
              onClick={() => handleModeChange('dark')}
            >
              <span className="cp-mode-icon">🌙</span>
              <span className="cp-mode-label">Sombre</span>
            </button>
            <button
              className={`cp-mode-option ${config.mode === 'auto' ? 'active' : ''}`}
              onClick={() => handleModeChange('auto')}
            >
              <span className="cp-mode-icon">🔄</span>
              <span className="cp-mode-label">Auto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Densité */}
      <div className="cp-card">
        <h3 className="cp-card-title">Densité d'affichage</h3>
        <div className="cp-card-content">
          <div className="cp-density-selector">
            <button
              className={`cp-density-option ${config.density === 'compact' ? 'active' : ''}`}
              onClick={() => handleDensityChange('compact')}
            >
              <span className="cp-density-preview cp-density-compact" />
              <span className="cp-density-label">Compact</span>
            </button>
            <button
              className={`cp-density-option ${config.density === 'normal' ? 'active' : ''}`}
              onClick={() => handleDensityChange('normal')}
            >
              <span className="cp-density-preview cp-density-normal" />
              <span className="cp-density-label">Normal</span>
            </button>
            <button
              className={`cp-density-option ${config.density === 'comfortable' ? 'active' : ''}`}
              onClick={() => handleDensityChange('comfortable')}
            >
              <span className="cp-density-preview cp-density-comfortable" />
              <span className="cp-density-label">Confortable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Options avancées */}
      <div className="cp-card">
        <h3 className="cp-card-title">Options avancées</h3>
        <div className="cp-card-content">
          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Animations</div>
              <div className="cp-switch-description">
                Activer les animations et transitions
              </div>
            </div>
            <div
              className={`cp-switch ${config.animations_enabled ? 'active' : ''}`}
              onClick={toggleAnimations}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>

          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Transparence</div>
              <div className="cp-switch-description">
                Activer les effets de transparence (expérimental)
              </div>
            </div>
            <div
              className={`cp-switch ${config.transparency_enabled ? 'active' : ''}`}
              onClick={toggleTransparency}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="cp-card">
        <h3 className="cp-card-title">Aperçu Design System</h3>
        <div className="cp-card-content">
          <div className="cp-preview">
            <div className="cp-preview-section">
              <span className="cp-preview-label">Couleurs primaires</span>
              <div className="cp-color-swatches">
                <div className="cp-color-swatch" style={{ background: 'var(--color-primary)' }} />
                <div className="cp-color-swatch" style={{ background: 'var(--color-surface)' }} />
                <div className="cp-color-swatch" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
            <div className="cp-preview-section">
              <span className="cp-preview-label">Typographie</span>
              <p className="cp-preview-text">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
