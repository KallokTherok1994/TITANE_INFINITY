/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Panel Component
 *   Full settings panel with presets, typography, layout options
 *   Design System: Monochrome TITANE
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { memo } from 'react';
import { useUIReadingContext } from './UIReadingContext';
import { useZoom, useTypography, usePresets } from './useUIReading';
import { PresetMetadata, ReadingPresets } from './UIReadingPresets';
import { ValidationLimits } from './UIReadingValidator';
import type { PresetName, FontFamilyOption } from './UIReadingContext';
import './UIReadingPanel.css';

export const UIReadingPanel = memo(function UIReadingPanel() {
  const { isPanelOpen, togglePanel } = useUIReadingContext();
  const { zoomLevel, zoomOut, zoomPercent, setZoom } = useZoom();
  const {
    fontSizeBase,
    fontFamily,
    lineHeight,
    letterSpacing,
    maxContentWidth,
    setFontSize,
    setFontFamily,
    setLineHeight,
    setLetterSpacing,
    setMaxContentWidth,
  } = useTypography();
  const { currentPreset, applyPreset, resetAll } = usePresets();

  if (!isPanelOpen) return null;

  const presetKeys = Object.keys(ReadingPresets) as Exclude<PresetName, null>[];

  return (
    <div className="ui-reading-panel-overlay" onClick={togglePanel}>
      <div className="ui-reading-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ui-reading-panel__header">
          <h3 className="ui-reading-panel__title">Préférences de lecture</h3>
          <button
            className="ui-reading-panel__close"
            onClick={togglePanel}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Presets */}
        <section className="ui-reading-panel__section">
          <h4 className="ui-reading-panel__section-title">Presets</h4>
          <div className="ui-reading-panel__presets">
            {presetKeys.map(preset => (
              <button
                key={preset}
                className={`ui-reading-panel__preset ${currentPreset === preset ? 'ui-reading-panel__preset--active' : ''}`}
                onClick={() => applyPreset(preset)}
                title={PresetMetadata[preset].description}
              >
                <span className="ui-reading-panel__preset-icon">
                  {PresetMetadata[preset].icon}
                </span>
                <span className="ui-reading-panel__preset-label">
                  {PresetMetadata[preset].label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Zoom */}
        <section className="ui-reading-panel__section">
          <h4 className="ui-reading-panel__section-title">Zoom</h4>
          <div className="ui-reading-panel__row">
            <button className="ui-reading-panel__btn" onClick={zoomOut}>
              −
            </button>
            <input
              type="range"
              className="ui-reading-panel__slider"
              min={ValidationLimits.zoom.min * 100}
              max={ValidationLimits.zoom.max * 100}
              step={5}
              value={zoomLevel * 100}
              onChange={e => {
                const val = parseInt(e.target.value) / 100;
                // Round to nearest valid zoom level
                const validZoomLevels = [
                  0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.3, 1.4,
                ] as const;
                const closestZoom = validZoomLevels.reduce((prev, curr) =>
                  Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
                );
                setZoom(closestZoom);
                applyPreset(null); // Clear preset when manually adjusting
              }}
            />
            <span className="ui-reading-panel__value">{zoomPercent}%</span>
          </div>
        </section>

        {/* Section 3: Typography */}
        <section className="ui-reading-panel__section">
          <h4 className="ui-reading-panel__section-title">Typographie</h4>

          {/* Font Size */}
          <div className="ui-reading-panel__control">
            <label className="ui-reading-panel__label">Taille du texte</label>
            <div className="ui-reading-panel__row">
              <input
                type="range"
                className="ui-reading-panel__slider"
                min={ValidationLimits.fontSize.min}
                max={ValidationLimits.fontSize.max}
                step={1}
                value={fontSizeBase}
                onChange={e => setFontSize(parseInt(e.target.value))}
              />
              <span className="ui-reading-panel__value">{fontSizeBase}px</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="ui-reading-panel__control">
            <label className="ui-reading-panel__label">Interligne</label>
            <div className="ui-reading-panel__row">
              <input
                type="range"
                className="ui-reading-panel__slider"
                min={ValidationLimits.lineHeight.min * 100}
                max={ValidationLimits.lineHeight.max * 100}
                step={5}
                value={lineHeight * 100}
                onChange={e => setLineHeight(parseInt(e.target.value) / 100)}
              />
              <span className="ui-reading-panel__value">{lineHeight.toFixed(2)}</span>
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="ui-reading-panel__control">
            <label className="ui-reading-panel__label">Espacement lettres</label>
            <div className="ui-reading-panel__row">
              <input
                type="range"
                className="ui-reading-panel__slider"
                min={ValidationLimits.letterSpacing.min * 100}
                max={ValidationLimits.letterSpacing.max * 100}
                step={1}
                value={letterSpacing * 100}
                onChange={e => setLetterSpacing(parseInt(e.target.value) / 100)}
              />
              <span className="ui-reading-panel__value">
                {letterSpacing.toFixed(2)}em
              </span>
            </div>
          </div>

          {/* Font Family */}
          <div className="ui-reading-panel__control">
            <label className="ui-reading-panel__label">Police</label>
            <div className="ui-reading-panel__font-options">
              {(['system', 'serif', 'mono'] as FontFamilyOption[]).map(font => (
                <button
                  key={font}
                  className={`ui-reading-panel__font-btn ${fontFamily === font ? 'ui-reading-panel__font-btn--active' : ''}`}
                  onClick={() => setFontFamily(font)}
                  style={{
                    fontFamily:
                      font === 'system'
                        ? 'inherit'
                        : font === 'serif'
                          ? 'Georgia, serif'
                          : 'monospace',
                  }}
                >
                  {font === 'system' ? 'Système' : font === 'serif' ? 'Serif' : 'Mono'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Layout */}
        <section className="ui-reading-panel__section">
          <h4 className="ui-reading-panel__section-title">Mise en page</h4>
          <div className="ui-reading-panel__control">
            <label className="ui-reading-panel__label">Largeur maximale</label>
            <div className="ui-reading-panel__row">
              <input
                type="range"
                className="ui-reading-panel__slider"
                min={ValidationLimits.maxContentWidth.min}
                max={ValidationLimits.maxContentWidth.max}
                step={20}
                value={maxContentWidth}
                onChange={e => setMaxContentWidth(parseInt(e.target.value))}
              />
              <span className="ui-reading-panel__value">{maxContentWidth}px</span>
            </div>
          </div>
        </section>

        {/* Footer: Reset */}
        <div className="ui-reading-panel__footer">
          <button className="ui-reading-panel__reset" onClick={resetAll}>
            Réinitialiser par défaut
          </button>
        </div>

        {/* Shortcuts hint */}
        <div className="ui-reading-panel__hints">
          <span>Ctrl++/− : Zoom</span>
          <span>F11 : Plein écran</span>
          <span>Ctrl+Shift+1-5 : Presets</span>
        </div>
      </div>
    </div>
  );
});
