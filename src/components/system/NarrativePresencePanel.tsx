/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v22 — NARRATIVE PRESENCE PANEL
 *   Dashboard pour le NarrativeEngine
 *   Identité, archétypes, style expressif
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  NarrativeBridgeV22,
  type IdentityProfile,
  type NarrativeArchetype,
  type StyleProfile,
  type NarrativeOutput,
} from '@/services/narrativeBridgeV22';
import './NarrativePresencePanel.css';

export const NarrativePresencePanel: React.FC = () => {
  // ═══════════════════════════════════════════════════════════════
  //   STATE
  // ═══════════════════════════════════════════════════════════════

  const [identity, setIdentity] = useState<IdentityProfile | null>(null);
  const [archetype, setArchetype] = useState<NarrativeArchetype | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [output, setOutput] = useState<NarrativeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'archetype' | 'style' | 'generate'>(
    'identity'
  );

  // ═══════════════════════════════════════════════════════════════
  //   LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    loadNarrativeData();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  //   HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const loadNarrativeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [identityData, archetypeData, styleData] = await Promise.all([
        NarrativeBridgeV22.getIdentity(),
        NarrativeBridgeV22.getArchetype(),
        NarrativeBridgeV22.getStyle(),
      ]);
      setIdentity(identityData);
      setArchetype(archetypeData);
      setStyle(styleData);
    } catch (err) {
      console.error('[NarrativePresencePanel] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load narrative data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetArchetype = async (archetypeName: string) => {
    setLoading(true);
    try {
      await NarrativeBridgeV22.setArchetype(archetypeName);
      await loadNarrativeData();
    } catch (err) {
      console.error('[NarrativePresencePanel] Set archetype error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set archetype');
    } finally {
      setLoading(false);
    }
  };

  const handleSetStyle = async (newStyle: StyleProfile) => {
    setLoading(true);
    try {
      await NarrativeBridgeV22.setStyle(newStyle);
      await loadNarrativeData();
    } catch (err) {
      console.error('[NarrativePresencePanel] Set style error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set style');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await NarrativeBridgeV22.generate('Test expression', 0.85, 0.9);
      setOutput(generated);
    } catch (err) {
      console.error('[NarrativePresencePanel] Generate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //   RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

  const renderIdentity = () => {
    if (!identity) return <div className="narrative-empty">Aucune donnée d'identité</div>;

    return (
      <div className="narrative-identity">
        <div className="narrative-identity-header">
          <div className="narrative-identity-name">{identity.name}</div>
          <div className="narrative-identity-signature">{identity.signature}</div>
        </div>

        <div className="narrative-identity-worldview">
          <div className="narrative-label">Vision du Monde</div>
          <div className="narrative-value">{identity.worldview}</div>
        </div>

        <div className="narrative-identity-perspective">
          <div className="narrative-label">Perspective Narrative</div>
          <div className="narrative-value">
            {NarrativeBridgeV22.formatPerspective(identity.narrative_perspective)}
          </div>
        </div>

        <div className="narrative-identity-values">
          <div className="narrative-label">Valeurs Fondamentales</div>
          <div className="narrative-values-grid">
            {identity.core_values.map((value, idx) => (
              <div key={idx} className="narrative-value-chip">
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderArchetype = () => {
    return (
      <div className="narrative-archetype">
        <div className="narrative-archetype-title">Archétype Actif</div>

        {archetype && (
          <div className="narrative-active-archetype">
            <div
              className="narrative-archetype-icon"
              style={{ color: NarrativeBridgeV22.getArchetypeColor(archetype.name) }}
            >
              {NarrativeBridgeV22.getArchetypeIcon(archetype.name)}
            </div>
            <div className="narrative-archetype-name">{archetype.name}</div>
            <div className="narrative-archetype-description">{archetype.description}</div>
            <div className="narrative-archetype-qualities">
              {archetype.qualities.map((quality, idx) => (
                <span key={idx} className="narrative-quality-badge">
                  {quality}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="narrative-archetype-list-title">Archétypes Disponibles</div>
        <div className="narrative-archetype-grid">
          {NarrativeBridgeV22.ARCHETYPES.map((name) => (
            <button
              key={name}
              className={`narrative-archetype-card ${
                archetype && archetype.name === name ? 'active' : ''
              }`}
              onClick={() => handleSetArchetype(name)}
              disabled={loading}
              style={{
                borderColor:
                  archetype && archetype.name === name
                    ? NarrativeBridgeV22.getArchetypeColor(name)
                    : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="narrative-archetype-card-icon">
                {NarrativeBridgeV22.getArchetypeIcon(name)}
              </div>
              <div className="narrative-archetype-card-name">{name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderStyle = () => {
    return (
      <div className="narrative-style">
        <div className="narrative-style-title">Style Actuel</div>
        {style && <div className="narrative-current-style">{style}</div>}

        <div className="narrative-style-list-title">Styles Disponibles</div>
        <div className="narrative-style-grid">
          {NarrativeBridgeV22.STYLES.map((styleOption) => (
            <button
              key={styleOption}
              className={`narrative-style-card ${
                style === styleOption.toString() ? 'active' : ''
              }`}
              onClick={() => handleSetStyle(styleOption)}
              disabled={loading}
            >
              <div className="narrative-style-card-name">{styleOption}</div>
              <div className="narrative-style-card-description">
                {NarrativeBridgeV22.formatStyle(styleOption)}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderGenerate = () => {
    return (
      <div className="narrative-generate">
        <div className="narrative-generate-title">Génération d&apos;Expression</div>

        <button className="narrative-generate-btn" onClick={handleGenerate} disabled={loading}>
          ✨ Générer Expression
        </button>

        {output && (
          <div className="narrative-output">
            <div className="narrative-output-header">
              <div className="narrative-output-label">Résultat</div>
              {output.archetype && (
                <div
                  className="narrative-output-archetype"
                  style={{ color: NarrativeBridgeV22.getArchetypeColor(output.archetype) }}
                >
                  {NarrativeBridgeV22.getArchetypeIcon(output.archetype)} {output.archetype}
                </div>
              )}
            </div>

            <div className="narrative-output-text">{output.text}</div>

            <div className="narrative-output-meta">
              <div className="narrative-output-meta-item">
                <span className="narrative-meta-label">Ton:</span>
                <span className="narrative-meta-value">{output.tone}</span>
              </div>

              {output.modulation && (
                <div className="narrative-output-meta-item">
                  <span className="narrative-meta-label">Modulation:</span>
                  <span className="narrative-meta-value">{output.modulation}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //   RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════

  if (loading && !identity) {
    return (
      <div className="narrative-presence-panel">
        <div className="narrative-loading">
          <div className="narrative-spinner" />
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="narrative-presence-panel">
        <div className="narrative-error">
          <div className="narrative-error-icon">⚠</div>
          <div className="narrative-error-message">{error}</div>
          <button className="narrative-error-retry" onClick={loadNarrativeData}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="narrative-presence-panel">
      <div className="narrative-header">
        <h2 className="narrative-title">NarrativeEngine v22</h2>
        <div className="narrative-subtitle">Identité Expressive & Symbolique</div>
      </div>

      <div className="narrative-actions">
        <button className="narrative-action-btn" onClick={loadNarrativeData} disabled={loading}>
          🔄 Rafraîchir
        </button>
      </div>

      <div className="narrative-tabs">
        <button
          className={`narrative-tab ${activeTab === 'identity' ? 'active' : ''}`}
          onClick={() => setActiveTab('identity')}
        >
          Identité
        </button>
        <button
          className={`narrative-tab ${activeTab === 'archetype' ? 'active' : ''}`}
          onClick={() => setActiveTab('archetype')}
        >
          Archétypes
        </button>
        <button
          className={`narrative-tab ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`narrative-tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          Générer
        </button>
      </div>

      <div className="narrative-content">
        {activeTab === 'identity' && renderIdentity()}
        {activeTab === 'archetype' && renderArchetype()}
        {activeTab === 'style' && renderStyle()}
        {activeTab === 'generate' && renderGenerate()}
      </div>
    </div>
  );
};
