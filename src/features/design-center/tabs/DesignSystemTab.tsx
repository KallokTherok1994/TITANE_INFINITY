/**
 * TITANE∞ - Design System Tab
 * Onglet Palette, Typographie, Composants
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

import React, { useState } from 'react';
import { useUITheme } from '../providers/UIThemeProvider';
import type { ColorTokens } from '../types/designCenter.types';

// ============================================================================
// COLOR PICKER COMPONENT
// ============================================================================

interface ColorPickerProps {
  label: string;
  colorKey: keyof ColorTokens;
  value: string;
  onChange: (key: keyof ColorTokens, value: string) => void;
}

function ColorPicker({ label, colorKey, value, onChange }: ColorPickerProps) {
  return (
    <div className="dc-color-picker">
      <label className="dc-color-label">
        <span className="dc-color-name">{label}</span>
        <div className="dc-color-input-wrapper">
          <input
            type="color"
            value={value}
            onChange={e => onChange(colorKey, e.target.value)}
            className="dc-color-input"
          />
          <span className="dc-color-value">{value}</span>
        </div>
      </label>
    </div>
  );
}

// ============================================================================
// COMPONENT PREVIEW
// ============================================================================

function ComponentPreview() {
  const { tokens } = useUITheme();

  // Protection: Vérifier que tokens est bien défini
  if (!tokens || !tokens.colors) {
    return (
      <div className="dc-component-preview">
        <p style={{ padding: '1rem', textAlign: 'center' }}>Chargement de l&apos;aperçu...</p>
      </div>
    );
  }

  return (
    <div className="dc-component-preview">
      <h4 className="dc-preview-title">Aperçu des Composants</h4>

      <div className="dc-preview-section">
        <h5>Boutons</h5>
        <div className="dc-preview-row">
          <button
            className="dc-btn dc-btn-primary"
            style={{
              backgroundColor: tokens.colors.primary,
              color: tokens.colors.text,
              borderRadius: `${tokens.borders.radiusMd}px`,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            }}
          >
            Primaire
          </button>
          <button
            className="dc-btn dc-btn-secondary"
            style={{
              backgroundColor: tokens.colors.surface,
              color: tokens.colors.text,
              border: `${tokens.borders.width}px solid ${tokens.colors.border}`,
              borderRadius: `${tokens.borders.radiusMd}px`,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            }}
          >
            Secondaire
          </button>
          <button
            className="dc-btn dc-btn-accent"
            style={{
              backgroundColor: tokens.colors.accent,
              color: tokens.colors.background,
              borderRadius: `${tokens.borders.radiusMd}px`,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
            }}
          >
            Accent
          </button>
        </div>
      </div>

      <div className="dc-preview-section">
        <h5>Cartes</h5>
        <div
          className="dc-preview-card"
          style={{
            backgroundColor: tokens.colors.surface,
            border: `${tokens.borders.width}px solid ${tokens.colors.border}`,
            borderRadius: `${tokens.borders.radiusLg}px`,
            padding: `${tokens.spacing.lg}px`,
            boxShadow: tokens.shadows.enabled ? tokens.shadows.md : 'none',
          }}
        >
          <h6 style={{ color: tokens.colors.text, margin: 0 }}>Titre de la Carte</h6>
          <p
            style={{
              color: tokens.colors.textMuted,
              margin: `${tokens.spacing.sm}px 0 0`,
            }}
          >
            Description avec texte secondaire
          </p>
        </div>
      </div>

      <div className="dc-preview-section">
        <h5>Inputs</h5>
        <input
          type="text"
          placeholder="Champ de texte"
          className="dc-preview-input"
          style={{
            backgroundColor: tokens.colors.surface,
            color: tokens.colors.text,
            border: `${tokens.borders.width}px solid ${tokens.colors.border}`,
            borderRadius: `${tokens.borders.radiusSm}px`,
            padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
          }}
        />
      </div>

      <div className="dc-preview-section">
        <h5>Status</h5>
        <div className="dc-preview-row">
          <span
            className="dc-status"
            style={{
              backgroundColor: `${tokens.colors.success}20`,
              color: tokens.colors.success,
              padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
              borderRadius: `${tokens.borders.radiusSm}px`,
            }}
          >
            ✓ Succès
          </span>
          <span
            className="dc-status"
            style={{
              backgroundColor: `${tokens.colors.warning}20`,
              color: tokens.colors.warning,
              padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
              borderRadius: `${tokens.borders.radiusSm}px`,
            }}
          >
            ⚠ Warning
          </span>
          <span
            className="dc-status"
            style={{
              backgroundColor: `${tokens.colors.error}20`,
              color: tokens.colors.error,
              padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
              borderRadius: `${tokens.borders.radiusSm}px`,
            }}
          >
            ✕ Erreur
          </span>
          <span
            className="dc-status"
            style={{
              backgroundColor: `${tokens.colors.info}20`,
              color: tokens.colors.info,
              padding: `${tokens.spacing.xs}px ${tokens.spacing.sm}px`,
              borderRadius: `${tokens.borders.radiusSm}px`,
            }}
          >
            ℹ Info
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DesignSystemTab() {
  const { tokens, updateToken, isDirty, saveTokens, resetToDefaults, undoChanges } =
    useUITheme();
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'preview'>(
    'colors'
  );

  const handleColorChange = (key: keyof ColorTokens, value: string) => {
    updateToken('colors', key, value);
  };

  // Protection: Attendre que tokens soit chargé
  if (!tokens || !tokens.colors) {
    return (
      <div className="dc-tab dc-design-system-tab">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Chargement des tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dc-tab dc-design-system-tab">
      {/* Header avec actions */}
      <div className="dc-tab-header">
        <div className="dc-tab-info">
          <h3>🎨 Design System Monochrome v16</h3>
          <p className="dc-tab-subtitle">Palette Metal • Tokens Dynamiques</p>
        </div>
        <div className="dc-tab-actions">
          {isDirty && (
            <>
              <button className="dc-btn-action dc-btn-undo" onClick={undoChanges}>
                ↶ Annuler
              </button>
              <button className="dc-btn-action dc-btn-save" onClick={saveTokens}>
                💾 Sauvegarder
              </button>
            </>
          )}
          <button className="dc-btn-action dc-btn-reset" onClick={resetToDefaults}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="dc-section-nav">
        <button
          className={`dc-section-btn ${activeSection === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveSection('colors')}
        >
          🎨 Couleurs
        </button>
        <button
          className={`dc-section-btn ${activeSection === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveSection('typography')}
        >
          📝 Typographie
        </button>
        <button
          className={`dc-section-btn ${activeSection === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveSection('preview')}
        >
          👁 Aperçu
        </button>
      </div>

      {/* Contenu sections */}
      <div className="dc-tab-content">
        {activeSection === 'colors' && (
          <div className="dc-colors-section">
            <div className="dc-colors-group">
              <h4>Couleurs Principales</h4>
              <div className="dc-colors-grid">
                <ColorPicker
                  label="Primary"
                  colorKey="primary"
                  value={tokens.colors.primary}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Secondary"
                  colorKey="secondary"
                  value={tokens.colors.secondary}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Accent"
                  colorKey="accent"
                  value={tokens.colors.accent}
                  onChange={handleColorChange}
                />
              </div>
            </div>

            <div className="dc-colors-group">
              <h4>Surfaces</h4>
              <div className="dc-colors-grid">
                <ColorPicker
                  label="Background"
                  colorKey="background"
                  value={tokens.colors.background}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Surface"
                  colorKey="surface"
                  value={tokens.colors.surface}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Surface Elevated"
                  colorKey="surfaceElevated"
                  value={tokens.colors.surfaceElevated}
                  onChange={handleColorChange}
                />
              </div>
            </div>

            <div className="dc-colors-group">
              <h4>Texte & Bordures</h4>
              <div className="dc-colors-grid">
                <ColorPicker
                  label="Text"
                  colorKey="text"
                  value={tokens.colors.text}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Text Muted"
                  colorKey="textMuted"
                  value={tokens.colors.textMuted}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Border"
                  colorKey="border"
                  value={tokens.colors.border}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Border Focus"
                  colorKey="borderFocus"
                  value={tokens.colors.borderFocus}
                  onChange={handleColorChange}
                />
              </div>
            </div>

            <div className="dc-colors-group">
              <h4>Sémantique</h4>
              <div className="dc-colors-grid">
                <ColorPicker
                  label="Success"
                  colorKey="success"
                  value={tokens.colors.success}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Warning"
                  colorKey="warning"
                  value={tokens.colors.warning}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Error"
                  colorKey="error"
                  value={tokens.colors.error}
                  onChange={handleColorChange}
                />
                <ColorPicker
                  label="Info"
                  colorKey="info"
                  value={tokens.colors.info}
                  onChange={handleColorChange}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'typography' && (
          <div className="dc-typography-section">
            <div className="dc-typography-group">
              <h4>Police</h4>
              <div className="dc-form-field">
                <label>Famille de Police</label>
                <input
                  type="text"
                  value={tokens.typography.fontFamily}
                  onChange={e => updateToken('typography', 'fontFamily', e.target.value)}
                  className="dc-input"
                />
              </div>
              <div className="dc-form-field">
                <label>Police Monospace</label>
                <input
                  type="text"
                  value={tokens.typography.fontFamilyMono}
                  onChange={e =>
                    updateToken('typography', 'fontFamilyMono', e.target.value)
                  }
                  className="dc-input"
                />
              </div>
            </div>

            <div className="dc-typography-group">
              <h4>Taille</h4>
              <div className="dc-form-field">
                <label>Taille de base</label>
                <select
                  value={tokens.typography.fontSize}
                  onChange={e =>
                    updateToken(
                      'typography',
                      'fontSize',
                      e.target.value as 'small' | 'medium' | 'large'
                    )
                  }
                  className="dc-select"
                >
                  <option value="small">Petit</option>
                  <option value="medium">Moyen</option>
                  <option value="large">Grand</option>
                </select>
              </div>
              <div className="dc-form-field">
                <label>Échelle ({tokens.typography.fontScale})</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.1"
                  value={tokens.typography.fontScale}
                  onChange={e =>
                    updateToken('typography', 'fontScale', parseFloat(e.target.value))
                  }
                  className="dc-range"
                />
              </div>
              <div className="dc-form-field">
                <label>Hauteur de ligne ({tokens.typography.lineHeight})</label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={tokens.typography.lineHeight}
                  onChange={e =>
                    updateToken('typography', 'lineHeight', parseFloat(e.target.value))
                  }
                  className="dc-range"
                />
              </div>
            </div>

            <div className="dc-typography-preview">
              <h4>Aperçu</h4>
              <div
                style={{
                  fontFamily: tokens.typography.fontFamily,
                  fontSize: `calc(1rem * ${tokens.typography.fontScale})`,
                  lineHeight: tokens.typography.lineHeight,
                  color: tokens.colors.text,
                }}
              >
                <p style={{ fontSize: '2em', marginBottom: '0.5em' }}>Titre Principal</p>
                <p style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
                  Titre Secondaire
                </p>
                <p>Texte de paragraphe avec la police sélectionnée.</p>
                <p style={{ fontFamily: tokens.typography.fontFamilyMono }}>
                  <code>Code monospace: const x = 42;</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'preview' && <ComponentPreview />}
      </div>

      {/* Styles inline pour ce composant */}
      <style>{`
        .dc-tab { padding: 1.5rem; }
        .dc-tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .dc-tab-info h3 { margin: 0; color: var(--color-text, #e8e8e8); }
        .dc-tab-subtitle { margin: 0.25rem 0 0; color: var(--color-text-muted, #9ca3af); font-size: 0.875rem; }
        .dc-tab-actions { display: flex; gap: 0.5rem; }
        .dc-btn-action {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--color-border, #3a3a3a);
          background: var(--color-surface, #161616);
          color: var(--color-text, #e8e8e8);
          cursor: pointer;
          transition: all 0.2s;
        }
        .dc-btn-action:hover { background: var(--color-surface-elevated, #1e1e1e); }
        .dc-btn-save { background: var(--color-accent, #93b399); color: var(--color-background, #0f0f0f); }
        .dc-btn-undo { border-color: var(--color-warning, #a89f91); }
        .dc-btn-reset { border-color: var(--color-error, #8f7a7a); }

        .dc-section-nav { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border, #3a3a3a); padding-bottom: 0.5rem; }
        .dc-section-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted, #9ca3af);
          cursor: pointer;
          transition: all 0.2s;
        }
        .dc-section-btn:hover { color: var(--color-text, #e8e8e8); }
        .dc-section-btn.active { color: var(--color-accent, #93b399); border-bottom: 2px solid var(--color-accent, #93b399); margin-bottom: -2px; }

        .dc-colors-group { margin-bottom: 1.5rem; }
        .dc-colors-group h4 { margin: 0 0 0.75rem; color: var(--color-text, #e8e8e8); font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .dc-colors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }

        .dc-color-picker { display: flex; align-items: center; }
        .dc-color-label { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 1rem; }
        .dc-color-name { color: var(--color-text, #e8e8e8); font-size: 0.875rem; }
        .dc-color-input-wrapper { display: flex; align-items: center; gap: 0.5rem; }
        .dc-color-input { width: 32px; height: 32px; border: 1px solid var(--color-border, #3a3a3a); border-radius: var(--radius-sm, 4px); cursor: pointer; }
        .dc-color-value { font-family: var(--font-family-mono); font-size: 0.75rem; color: var(--color-text-muted, #9ca3af); }

        .dc-typography-group { margin-bottom: 1.5rem; }
        .dc-typography-group h4 { margin: 0 0 0.75rem; color: var(--color-text, #e8e8e8); }
        .dc-form-field { margin-bottom: 1rem; }
        .dc-form-field label { display: block; margin-bottom: 0.25rem; color: var(--color-text-muted, #9ca3af); font-size: 0.875rem; }
        .dc-input, .dc-select {
          width: 100%;
          padding: 0.5rem;
          background: var(--color-surface, #161616);
          border: 1px solid var(--color-border, #3a3a3a);
          border-radius: var(--radius-sm, 4px);
          color: var(--color-text, #e8e8e8);
        }
        .dc-range { width: 100%; }

        .dc-typography-preview {
          padding: 1rem;
          background: var(--color-surface, #161616);
          border: 1px solid var(--color-border, #3a3a3a);
          border-radius: var(--radius-md, 8px);
        }

        .dc-component-preview { }
        .dc-preview-title { margin: 0 0 1rem; color: var(--color-text, #e8e8e8); }
        .dc-preview-section { margin-bottom: 1.5rem; }
        .dc-preview-section h5 { margin: 0 0 0.5rem; color: var(--color-text-muted, #9ca3af); font-size: 0.875rem; }
        .dc-preview-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .dc-btn { border: none; cursor: pointer; transition: all 0.2s; }
        .dc-preview-card { max-width: 300px; }
        .dc-preview-input { width: 100%; max-width: 300px; outline: none; }
        .dc-preview-input:focus { border-color: var(--color-border-focus, #5a5a5a); }
        .dc-status { font-size: 0.875rem; }
      `}</style>
    </div>
  );
}

export default DesignSystemTab;
