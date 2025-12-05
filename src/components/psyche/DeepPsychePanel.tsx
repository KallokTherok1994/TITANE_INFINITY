/**
 * TITANE_INFINITY v∞.29-32 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React, { useState } from 'react';
import {
  useArchetypeResonance,
  useArchetypeScores,
  useMetaContinuum,
  useGlobalCoherence,
  useTemporalAnchors,
  useEmbodiedPresence,
  useBreathState,
  usePostureState,
  useEnergyField,
  useNeuralVoiceBlend,
  useVoiceIdentity,
  useCognitiveTone,
  useVoiceBlendRatio,
} from '@/hooks/useDeepPsyche';
import './DeepPsychePanel.css';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   DEEP PSYCHE PANEL — Unified UI for 4 Engines
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const DeepPsychePanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'archetype' | 'continuum' | 'embodied' | 'voice'>('archetype');

  // Hooks
  const { dominant, scores, intensity, focusMode, activateFocusMode, activateSafetyGuard } = useArchetypeResonance();
  const archetypeScores = useArchetypeScores();
  const { globalCoherence, continuumAge, identityVersion, anchors } = useMetaContinuum();
  const coherence = useGlobalCoherence();
  const recentAnchors = useTemporalAnchors(5);
  const { breath, posture, energyField, userSync, applyStrongEmotion, activateUserSync, deactivateUserSync } = useEmbodiedPresence();
  const breathState = useBreathState();
  const postureState = usePostureState();
  const energyFieldState = useEnergyField();
  const { currentProfile, blendRatio, cognitiveTone, voiceSignature, identityCoherence } = useNeuralVoiceBlend();
  const voiceIdentity = useVoiceIdentity();
  const cognitiveToneState = useCognitiveTone();
  const voiceBlend = useVoiceBlendRatio();

  // Format durations
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="deep-psyche-panel">
      {/* Toggle Button */}
      <button
        className="psyche-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Toggle Deep Psyche Panel"
      >
        <span className="toggle-icon">🧠</span>
        <span className="toggle-text">{isExpanded ? 'Fermer' : 'Psyché'}</span>
      </button>

      {/* Panel Content */}
      {isExpanded && (
        <div className="psyche-content">
          {/* Header */}
          <div className="psyche-header">
            <h2>🧠 Deep Psyche Engine</h2>
            <div className="psyche-version">
              <span className="version-badge" data-coherence={coherence.isCoherent ? 'high' : coherence.isUnstable ? 'low' : 'medium'}>
                v{identityVersion} • {coherence.percentageText}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="psyche-tabs">
            <button
              className={`tab-btn ${activeTab === 'archetype' ? 'active' : ''}`}
              onClick={() => setActiveTab('archetype')}
              data-archetype={dominant}
            >
              🎭 Archétype
            </button>
            <button
              className={`tab-btn ${activeTab === 'continuum' ? 'active' : ''}`}
              onClick={() => setActiveTab('continuum')}
            >
              ⏱️ Continuum
            </button>
            <button
              className={`tab-btn ${activeTab === 'embodied' ? 'active' : ''}`}
              onClick={() => setActiveTab('embodied')}
            >
              🧘 Corps
            </button>
            <button
              className={`tab-btn ${activeTab === 'voice' ? 'active' : ''}`}
              onClick={() => setActiveTab('voice')}
            >
              🎤 Voix
            </button>
          </div>

          {/* Tab Content */}
          <div className="psyche-tab-content">
            {/* ARCHETYPE TAB */}
            {activeTab === 'archetype' && (
              <div className="tab-pane">
                <div className="section">
                  <h3>Archétype Dominant</h3>
                  <div className="archetype-dominant" data-type={dominant}>
                    <span className="archetype-icon">
                      {dominant === 'sage' && '🧙'}
                      {dominant === 'gardien' && '🛡️'}
                      {dominant === 'muse' && '✨'}
                      {dominant === 'architecte' && '📐'}
                    </span>
                    <span className="archetype-name">
                      {dominant === 'sage' && 'Le Sage'}
                      {dominant === 'gardien' && 'Le Gardien'}
                      {dominant === 'muse' && 'La Muse'}
                      {dominant === 'architecte' && "L'Architecte"}
                    </span>
                    <span className="archetype-intensity">{Math.round(intensity * 100)}%</span>
                  </div>
                </div>

                <div className="section">
                  <h3>Résonance Archétypale</h3>
                  <div className="archetype-scores">
                    <div className="score-item">
                      <span className="score-label">🧙 Sage</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${scores.sage * 100}%` }} data-type="sage"></div>
                      </div>
                      <span className="score-value">{Math.round(scores.sage * 100)}%</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">🛡️ Gardien</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${scores.gardien * 100}%` }} data-type="gardien"></div>
                      </div>
                      <span className="score-value">{Math.round(scores.gardien * 100)}%</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">✨ Muse</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${scores.muse * 100}%` }} data-type="muse"></div>
                      </div>
                      <span className="score-value">{Math.round(scores.muse * 100)}%</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">📐 Architecte</span>
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${scores.architecte * 100}%` }} data-type="architecte"></div>
                      </div>
                      <span className="score-value">{Math.round(scores.architecte * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Actions Rapides</h3>
                  <div className="archetype-actions">
                    <button className="action-btn" data-type="sage" onClick={() => activateFocusMode('sage', 30000)}>
                      🧙 Focus Sage (30s)
                    </button>
                    <button className="action-btn" data-type="gardien" onClick={() => activateFocusMode('gardien', 30000)}>
                      🛡️ Focus Gardien (30s)
                    </button>
                    <button className="action-btn" data-type="muse" onClick={() => activateFocusMode('muse', 30000)}>
                      ✨ Focus Muse (30s)
                    </button>
                    <button className="action-btn" data-type="architecte" onClick={() => activateFocusMode('architecte', 30000)}>
                      📐 Focus Architecte (30s)
                    </button>
                    <button className="action-btn safety-guard" onClick={activateSafetyGuard}>
                      🛡️ Safety Guard
                    </button>
                  </div>
                  {focusMode && (
                    <div className="focus-indicator">
                      <span className="focus-label">🎯 Mode Focus Actif:</span>
                      <span className="focus-value">{focusMode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONTINUUM TAB */}
            {activeTab === 'continuum' && (
              <div className="tab-pane">
                <div className="section">
                  <h3>Cohérence Globale</h3>
                  <div className="coherence-display">
                    <div className="coherence-meter">
                      <div className="coherence-fill" style={{ width: `${globalCoherence * 100}%` }} data-level={coherence.isCoherent ? 'high' : coherence.isUnstable ? 'low' : 'medium'}></div>
                    </div>
                    <span className="coherence-text">{coherence.percentageText}</span>
                  </div>
                </div>

                <div className="section">
                  <h3>Identité Temporelle</h3>
                  <div className="temporal-info">
                    <div className="info-row">
                      <span className="info-label">Âge Continuum:</span>
                      <span className="info-value">{formatDuration(continuumAge)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Version Identité:</span>
                      <span className="info-value">v{identityVersion}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Ancrages Totaux:</span>
                      <span className="info-value">{anchors.length}</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Ancrages Récents</h3>
                  <div className="anchors-list">
                    {recentAnchors.length === 0 ? (
                      <div className="empty-state">Aucun ancrage récent</div>
                    ) : (
                      recentAnchors.map(anchor => (
                        <div key={anchor.id} className="anchor-item" data-type={anchor.type}>
                          <span className="anchor-icon">
                            {anchor.type === 'learning' && '📚'}
                            {anchor.type === 'correction' && '🔧'}
                            {anchor.type === 'evolution' && '📈'}
                            {anchor.type === 'stabilization' && '⚖️'}
                            {anchor.type === 'milestone' && '🏆'}
                          </span>
                          <div className="anchor-info">
                            <span className="anchor-desc">{anchor.description}</span>
                            <span className="anchor-impact">Impact: {Math.round(anchor.identityImpact * 100)}%</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EMBODIED TAB */}
            {activeTab === 'embodied' && (
              <div className="tab-pane">
                <div className="section">
                  <h3>Respiration</h3>
                  <div className="breath-display">
                    <div className="breath-phase" data-phase={breath.phase}>
                      {breath.phase === 'inhale' && '↑ Inspiration'}
                      {breath.phase === 'hold' && '⏸️ Rétention'}
                      {breath.phase === 'exhale' && '↓ Expiration'}
                      {breath.phase === 'rest' && '○ Repos'}
                    </div>
                    <div className="breath-bar">
                      <div className="breath-fill" style={{ height: `${breathState.cycleProgress * 100}%` }}></div>
                    </div>
                    <div className="breath-stats">
                      <span>Cycle: {breath.cycleDuration}ms</span>
                      <span>Amplitude: {Math.round(breath.amplitude * 100)}%</span>
                      <span>Tension: {Math.round(breath.tension * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Posture</h3>
                  <div className="posture-display" data-posture={posture.type}>
                    <div className="posture-icon">
                      {posture.type === 'open' && '🤗'}
                      {posture.type === 'centered' && '🧘'}
                      {posture.type === 'forward' && '👉'}
                      {posture.type === 'recede' && '🔙'}
                      {posture.type === 'expansive' && '🌟'}
                    </div>
                    <div className="posture-name">
                      {posture.type === 'open' && 'Ouverte'}
                      {posture.type === 'centered' && 'Centrée'}
                      {posture.type === 'forward' && 'Vers Avant'}
                      {posture.type === 'recede' && 'Recul'}
                      {posture.type === 'expansive' && 'Expansive'}
                    </div>
                    <div className="posture-stats">
                      <span>Ouverture: {Math.round(posture.openness * 100)}%</span>
                      <span>Stabilité: {Math.round(posture.stability * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Champ Énergétique</h3>
                  <div className="energy-display">
                    <div className="energy-field" data-texture={energyField.texture} data-movement={energyField.movement}>
                      <span className="energy-temp">{energyFieldState.temperatureText}</span>
                      <span className="energy-density">Densité: {Math.round(energyField.density * 100)}%</span>
                      <span className="energy-coherence">Cohérence: {Math.round(energyField.spatialCoherence * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Synchronisation Utilisateur</h3>
                  <div className="user-sync">
                    <button
                      className={`sync-btn ${userSync.active ? 'active' : ''}`}
                      onClick={() => userSync.active ? deactivateUserSync() : activateUserSync()}
                    >
                      {userSync.active ? '🔗 Actif' : '⛓️ Inactif'}
                    </button>
                    {userSync.active && userSync.syncRatio !== null && (
                      <span className="sync-ratio">Ratio: {Math.round(userSync.syncRatio * 100)}%</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VOICE TAB */}
            {activeTab === 'voice' && (
              <div className="tab-pane">
                <div className="section">
                  <h3>Identité Vocale</h3>
                  <div className="voice-identity">
                    <div className="voice-signature">{voiceSignature}</div>
                    <div className="voice-coherence">
                      <span>Cohérence: </span>
                      <div className="coherence-bar">
                        <div className="coherence-bar-fill" style={{ width: `${identityCoherence * 100}%` }}></div>
                      </div>
                      <span>{Math.round(identityCoherence * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Profil Timbre</h3>
                  <div className="voice-profile">
                    <div className="profile-item">
                      <span className="profile-label">Brillance:</span>
                      <span className="profile-value">{voiceIdentity.brightnessText}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Chaleur:</span>
                      <span className="profile-value">{voiceIdentity.warmthText}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Tempo:</span>
                      <span className="profile-value">{voiceIdentity.paceText}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Articulation:</span>
                      <span className="profile-value">{currentProfile.articulation}</span>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <h3>Tonalité Cognitive</h3>
                  <div className="cognitive-tone" data-tone={cognitiveTone}>
                    <span className="tone-icon">🎭</span>
                    <span className="tone-name">{cognitiveToneState.description}</span>
                  </div>
                </div>

                <div className="section">
                  <h3>Mélange Voix</h3>
                  <div className="voice-blend">
                    <div className="blend-bar">
                      <div className="blend-synthetic" style={{ width: `${blendRatio.synthetic * 100}%` }}>
                        <span>{voiceBlend.syntheticPercentage}% Synth</span>
                      </div>
                      <div className="blend-inspired" style={{ width: `${blendRatio.inspired * 100}%` }}>
                        <span>{voiceBlend.inspiredPercentage}% Inspired</span>
                      </div>
                    </div>
                    <div className="blend-context">{blendRatio.context}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Badge flottant compact
 */
export const DeepPsycheBadge: React.FC = () => {
  const { dominant } = useArchetypeResonance();
  const { isCoherent } = useGlobalCoherence();

  return (
    <div className="deep-psyche-badge" data-archetype={dominant} data-coherent={isCoherent}>
      <span className="badge-icon">🧠</span>
      <span className="badge-archetype">
        {dominant === 'sage' && '🧙'}
        {dominant === 'gardien' && '🛡️'}
        {dominant === 'muse' && '✨'}
        {dominant === 'architecte' && '📐'}
      </span>
    </div>
  );
};
