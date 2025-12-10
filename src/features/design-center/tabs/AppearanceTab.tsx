/**
 * TITANE∞ - Appearance Tab
 * Onglet Préférences visuelles, Densité, Animations
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

import React from 'react';
import { useUITheme } from '../providers/UIThemeProvider';

// ============================================================================
// TOGGLE SWITCH COMPONENT
// ============================================================================

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function ToggleSwitch({ label, checked, onChange, description }: ToggleSwitchProps) {
  return (
    <div className="dc-toggle-field">
      <div className="dc-toggle-info">
        <span className="dc-toggle-label">{label}</span>
        {description && <span className="dc-toggle-desc">{description}</span>}
      </div>
      <button
        className={`dc-toggle ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="dc-toggle-thumb" />
      </button>
    </div>
  );
}

// ============================================================================
// SELECT FIELD COMPONENT
// ============================================================================

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  description?: string;
}

function SelectField({ label, value, options, onChange, description }: SelectFieldProps) {
  return (
    <div className="dc-select-field">
      <div className="dc-select-info">
        <span className="dc-select-label">{label}</span>
        {description && <span className="dc-select-desc">{description}</span>}
      </div>
      <select
        className="dc-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// SLIDER FIELD COMPONENT
// ============================================================================

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  description,
}: SliderFieldProps) {
  return (
    <div className="dc-slider-field">
      <div className="dc-slider-header">
        <div className="dc-slider-info">
          <span className="dc-slider-label">{label}</span>
          {description && <span className="dc-slider-desc">{description}</span>}
        </div>
        <span className="dc-slider-value">
          {value}
          {unit || ''}
        </span>
      </div>
      <input
        type="range"
        className="dc-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AppearanceTab() {
  const { tokens, updateToken, isDirty, saveTokens, resetToDefaults, undoChanges } =
    useUITheme();

  return (
    <div className="dc-tab dc-appearance-tab">
      {/* Header avec actions */}
      <div className="dc-tab-header">
        <div className="dc-tab-info">
          <h3>⚙️ Apparence & Préférences</h3>
          <p className="dc-tab-subtitle">Densité • Animations • Accessibilité</p>
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

      <div className="dc-tab-content dc-appearance-content">
        {/* Section Densité */}
        <section className="dc-settings-section">
          <h4>📐 Densité de l'Interface</h4>

          <SelectField
            label="Mode de Densité"
            value={tokens.spacing.density}
            options={[
              { value: 'compact', label: "Compact - Plus d'éléments visibles" },
              { value: 'standard', label: 'Standard - Équilibre optimal' },
              { value: 'spacious', label: "Spacieux - Plus d'espace" },
            ]}
            onChange={v => {
              const value = v as 'compact' | 'standard' | 'spacious';
              updateToken('spacing', 'density', value);
              // Ajuster automatiquement les espacements
              const baseUnits = { compact: 4, standard: 6, spacious: 8 };
              const base = baseUnits[value];
              updateToken('spacing', 'baseUnit', base);
              updateToken('spacing', 'xs', Math.round(base * 0.5));
              updateToken('spacing', 'sm', base);
              updateToken('spacing', 'md', base * 2);
              updateToken('spacing', 'lg', base * 3);
              updateToken('spacing', 'xl', base * 4);
            }}
            description="Contrôle l'espacement global de l'interface"
          />

          <SliderField
            label="Unité de Base"
            value={tokens.spacing.baseUnit}
            min={4}
            max={10}
            step={1}
            onChange={v => updateToken('spacing', 'baseUnit', v)}
            unit="px"
            description="Unité de base pour tous les espacements"
          />
        </section>

        {/* Section Bordures */}
        <section className="dc-settings-section">
          <h4>🔲 Bordures & Arrondis</h4>

          <SelectField
            label="Style d'Arrondi"
            value={tokens.borders.radius}
            options={[
              { value: 'minimal', label: 'Minimal - Bords vifs' },
              { value: 'medium', label: 'Medium - Arrondi subtil' },
              { value: 'rounded', label: 'Arrondi - Bords doux' },
            ]}
            onChange={v => {
              const value = v as 'minimal' | 'medium' | 'rounded';
              updateToken('borders', 'radius', value);
              // Ajuster automatiquement les rayons
              const radiusValues = {
                minimal: { sm: 2, md: 4, lg: 6 },
                medium: { sm: 4, md: 8, lg: 12 },
                rounded: { sm: 8, md: 12, lg: 16 },
              };
              const values = radiusValues[value];
              updateToken('borders', 'radiusValue', values.md);
              updateToken('borders', 'radiusSm', values.sm);
              updateToken('borders', 'radiusMd', values.md);
              updateToken('borders', 'radiusLg', values.lg);
            }}
            description="Style général des coins arrondis"
          />

          <SliderField
            label="Épaisseur des Bordures"
            value={tokens.borders.width}
            min={1}
            max={3}
            step={1}
            onChange={v => updateToken('borders', 'width', v)}
            unit="px"
            description="Épaisseur des bordures des éléments"
          />
        </section>

        {/* Section Animations */}
        <section className="dc-settings-section">
          <h4>✨ Animations & Transitions</h4>

          <ToggleSwitch
            label="Animations Activées"
            checked={tokens.animations.enabled}
            onChange={v => updateToken('animations', 'enabled', v)}
            description="Activer/désactiver toutes les animations"
          />

          {tokens.animations.enabled && (
            <>
              <SelectField
                label="Vitesse des Animations"
                value={tokens.animations.speed}
                options={[
                  { value: 'fast', label: 'Rapide - Réactions instantanées' },
                  { value: 'normal', label: 'Normal - Fluidité équilibrée' },
                  { value: 'slow', label: 'Lent - Transitions douces' },
                ]}
                onChange={v => {
                  const value = v as 'fast' | 'normal' | 'slow';
                  updateToken('animations', 'speed', value);
                  // Ajuster les durées
                  const durations = {
                    fast: { fast: 50, normal: 100, slow: 200 },
                    normal: { fast: 100, normal: 200, slow: 400 },
                    slow: { fast: 200, normal: 400, slow: 800 },
                  };
                  const values = durations[value];
                  updateToken('animations', 'durationMs', values.normal);
                  updateToken('animations', 'durationFast', values.fast);
                  updateToken('animations', 'durationNormal', values.normal);
                  updateToken('animations', 'durationSlow', values.slow);
                }}
                description="Vitesse globale des animations"
              />

              <SliderField
                label="Durée de Transition"
                value={tokens.animations.durationNormal}
                min={50}
                max={500}
                step={50}
                onChange={v => {
                  updateToken('animations', 'durationMs', v);
                  updateToken('animations', 'durationNormal', v);
                }}
                unit="ms"
                description="Durée des transitions standard"
              />
            </>
          )}
        </section>

        {/* Section Ombres */}
        <section className="dc-settings-section">
          <h4>🌓 Ombres</h4>

          <ToggleSwitch
            label="Ombres Activées"
            checked={tokens.shadows.enabled}
            onChange={v => updateToken('shadows', 'enabled', v)}
            description="Ajoute de la profondeur à l'interface"
          />
        </section>

        {/* Section Accessibilité */}
        <section className="dc-settings-section">
          <h4>♿ Accessibilité</h4>

          <SelectField
            label="Niveau de Contraste"
            value={tokens.contrast.level}
            options={[
              { value: 'normal', label: 'Normal - Contraste standard' },
              { value: 'high', label: 'Élevé - Contraste renforcé' },
            ]}
            onChange={v => {
              const value = v as 'normal' | 'high';
              updateToken('contrast', 'level', value);
              updateToken('contrast', 'multiplier', value === 'high' ? 1.25 : 1.0);
            }}
            description="Améliore la lisibilité pour les personnes malvoyantes"
          />

          <SliderField
            label="Multiplicateur de Contraste"
            value={tokens.contrast.multiplier}
            min={1.0}
            max={1.5}
            step={0.05}
            onChange={v => updateToken('contrast', 'multiplier', v)}
            unit="x"
            description="Ajustement fin du niveau de contraste"
          />
        </section>
      </div>

      {/* Styles inline pour ce composant */}
      <style>{`
        .dc-appearance-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .dc-settings-section {
          padding: 1.25rem;
          background: var(--color-surface, #161616);
          border: 1px solid var(--color-border, #3a3a3a);
          border-radius: var(--radius-md, 8px);
        }

        .dc-settings-section h4 {
          margin: 0 0 1rem;
          color: var(--color-text, #e8e8e8);
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dc-toggle-field, .dc-select-field, .dc-slider-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--color-border, #3a3a3a);
        }

        .dc-toggle-field:last-child, .dc-select-field:last-child, .dc-slider-field:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .dc-toggle-info, .dc-select-info, .dc-slider-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .dc-toggle-label, .dc-select-label, .dc-slider-label {
          color: var(--color-text, #e8e8e8);
          font-weight: 500;
        }

        .dc-toggle-desc, .dc-select-desc, .dc-slider-desc {
          color: var(--color-text-muted, #9ca3af);
          font-size: 0.75rem;
        }

        .dc-toggle {
          position: relative;
          width: 44px;
          height: 24px;
          background: var(--color-border, #3a3a3a);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dc-toggle.active {
          background: var(--color-accent, #93b399);
        }

        .dc-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: var(--color-text, #e8e8e8);
          border-radius: 50%;
          transition: transform 0.2s;
        }

        .dc-toggle.active .dc-toggle-thumb {
          transform: translateX(20px);
        }

        .dc-select {
          min-width: 200px;
          padding: 0.5rem 0.75rem;
          background: var(--color-surface-elevated, #1e1e1e);
          border: 1px solid var(--color-border, #3a3a3a);
          border-radius: var(--radius-sm, 4px);
          color: var(--color-text, #e8e8e8);
          font-size: 0.875rem;
        }

        .dc-slider-field {
          flex-direction: column;
          align-items: stretch;
        }

        .dc-slider-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .dc-slider-value {
          color: var(--color-accent, #93b399);
          font-family: var(--font-family-mono);
          font-size: 0.875rem;
        }

        .dc-range {
          width: 100%;
          height: 4px;
          background: var(--color-border, #3a3a3a);
          border-radius: 2px;
          appearance: none;
          cursor: pointer;
        }

        .dc-range::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--color-accent, #93b399);
          border-radius: 50%;
          cursor: pointer;
        }

        .dc-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-accent, #93b399);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default AppearanceTab;
