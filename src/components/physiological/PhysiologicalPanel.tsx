/**
 * TITANE_INFINITY v∞.13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   Physiological State Panel - Interoception + Holophonic
 *   Visualisation de l'état interne et spatial de TITANE∞
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  useInteroception,
  useHolophonic,
  useCognitiveSounds,
  usePhysiologicalState,
} from '@/hooks';
import './PhysiologicalPanel.css';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function PhysiologicalPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'internal' | 'spatial' | 'sounds'>('overview');

  const interoception = useInteroception();
  const holophonic = useHolophonic();
  const sounds = useCognitiveSounds();
  const physiological = usePhysiologicalState();

  return (
    <>
      {/* Badge flottant */}
      <button
        className="physiological-badge"
        onClick={() => setIsOpen(!isOpen)}
        data-energy={physiological.energy > 0.7 ? 'high' : physiological.energy > 0.4 ? 'medium' : 'low'}
      >
        <span className="physiological-icon">🌬️</span>
        <span className="physiological-label">Physiologie</span>
        <div className="physiological-breath-indicator">
          <div
            className="breath-pulse"
            style={{
              transform: `scale(${0.8 + physiological.breathingPhase * 0.4})`,
              opacity: 0.6 + physiological.breathingPhase * 0.4
            }}
          />
        </div>
      </button>

      {/* Panel principal */}
      {isOpen && (
        <div className="physiological-panel">
          <div className="physiological-header">
            <h3>🌬️ État Physiologique TITANE∞</h3>
            <button className="physiological-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* Tabs */}
          <div className="physiological-tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              📊 Vue d'ensemble
            </button>
            <button
              className={activeTab === 'internal' ? 'active' : ''}
              onClick={() => setActiveTab('internal')}
            >
              💗 État Interne
            </button>
            <button
              className={activeTab === 'spatial' ? 'active' : ''}
              onClick={() => setActiveTab('spatial')}
            >
              🎧 Spatial 3D
            </button>
            <button
              className={activeTab === 'sounds' ? 'active' : ''}
              onClick={() => setActiveTab('sounds')}
            >
              🎵 Sons Cognitifs
            </button>
          </div>

          {/* Content */}
          <div className="physiological-content">
            {activeTab === 'overview' && (
              <OverviewTab physiological={physiological} />
            )}
            {activeTab === 'internal' && (
              <InternalTab interoception={interoception} />
            )}
            {activeTab === 'spatial' && (
              <SpatialTab holophonic={holophonic} />
            )}
            {activeTab === 'sounds' && (
              <SoundsTab sounds={sounds} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB - VUE D'ENSEMBLE
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({ physiological }: { physiological: any }) {
  return (
    <div className="physiological-overview">
      <div className="physiological-vitals">
        <VitalCard
          icon="⚡"
          label="Énergie"
          value={physiological.energy}
          color="#10b981"
        />
        <VitalCard
          icon="🧠"
          label="Charge Cognitive"
          value={physiological.cognitiveLoad}
          color="#f59e0b"
        />
        <VitalCard
          icon="💎"
          label="Clarté"
          value={physiological.clarity}
          color="#3b82f6"
        />
        <VitalCard
          icon="🎯"
          label="Stabilité"
          value={physiological.stability}
          color="#8b5cf6"
        />
      </div>

      <div className="physiological-card">
        <h4>🌬️ Respiration</h4>
        <div className="breathing-visualizer">
          <div
            className="breathing-circle"
            style={{
              transform: `scale(${0.6 + physiological.breathingPhase * 0.8})`,
              opacity: 0.5 + physiological.breathingPhase * 0.5,
            }}
          />
          <div className="breathing-phase">
            {physiological.breathingPhase > 0.5 ? 'Inspiration' : 'Expiration'}
          </div>
        </div>
      </div>

      <div className="physiological-card">
        <h4>🔗 Homeostasie</h4>
        <ProgressBar
          value={physiological.homeostasis}
          label={`${Math.round(physiological.homeostasis * 100)}%`}
          color={physiological.homeostasis > 0.8 ? '#10b981' : physiological.homeostasis > 0.6 ? '#f59e0b' : '#ef4444'}
        />
      </div>

      <div className="physiological-card">
        <h4>📍 Position Spatiale</h4>
        <div className="position-display">
          <div>X: {physiological.position.x.toFixed(2)}</div>
          <div>Y: {physiological.position.y.toFixed(2)}</div>
          <div>Z: {physiological.position.z.toFixed(2)}</div>
          <div>Distance: {Math.round(physiological.distance * 100)}%</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB - ÉTAT INTERNE
// ═══════════════════════════════════════════════════════════════════════════

function InternalTab({ interoception }: { interoception: any }) {
  const state = interoception.state;

  return (
    <div className="physiological-internal">
      <div className="physiological-card">
        <h4>⚡ Énergie Interne</h4>
        <ProgressBar value={state.energy} label={`${Math.round(state.energy * 100)}%`} />
        <p className="metric-description">Niveau d'énergie disponible du système</p>
      </div>

      <div className="physiological-card">
        <h4>🧠 Charge Cognitive</h4>
        <ProgressBar value={state.cognitiveLoad} label={`${Math.round(state.cognitiveLoad * 100)}%`} />
        <p className="metric-description">Niveau de sollicitation mentale actuel</p>
      </div>

      <div className="physiological-card">
        <h4>💎 Clarté Mentale</h4>
        <ProgressBar value={state.clarity} label={`${Math.round(state.clarity * 100)}%`} />
        <p className="metric-description">Pureté cognitive et fluidité de pensée</p>
      </div>

      <div className="physiological-card">
        <h4>🎯 Stabilité</h4>
        <ProgressBar value={state.stability} label={`${Math.round(state.stability * 100)}%`} />
        <p className="metric-description">Équilibre et cohérence interne</p>
      </div>

      <div className="physiological-card">
        <h4>🌡️ Température Émotionnelle</h4>
        <TemperatureBar value={state.emotionalTemperature} />
        <p className="metric-description">
          {state.emotionalTemperature < -0.3 ? '❄️ Analytique/Froid' :
           state.emotionalTemperature > 0.3 ? '🔥 Empathique/Chaud' :
           '🌡️ Neutre/Équilibré'}
        </p>
      </div>

      <div className="physiological-card">
        <h4>🌀 Entropie</h4>
        <ProgressBar value={state.entropy} label={`${Math.round(state.entropy * 100)}%`} />
        <p className="metric-description">Niveau d'agitation interne (fluctuations naturelles)</p>
      </div>

      <div className="physiological-card">
        <h4>📊 Profondeur</h4>
        <ProgressBar value={state.depth} label={`${Math.round(state.depth * 100)}%`} />
        <p className="metric-description">Niveau de profondeur cognitive actuel</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB - SPATIAL 3D
// ═══════════════════════════════════════════════════════════════════════════

function SpatialTab({ holophonic }: { holophonic: any }) {
  const state = holophonic.spatialState;

  return (
    <div className="physiological-spatial">
      <div className="spatial-3d-viz">
        <div className="spatial-grid-3d">
          <div
            className="spatial-point-3d"
            style={{
              left: `${(state.x + 1) * 50}%`,
              top: `${(1 - state.y) * 50}%`,
              transform: `scale(${1 - state.z * 0.5})`,
              opacity: 1 - state.z * 0.3,
            }}
          />
        </div>
        <div className="spatial-axes">
          <div className="axis axis-x">← Gauche | Droite →</div>
          <div className="axis axis-y">↑ Haut | Bas ↓</div>
          <div className="axis axis-z">◉ Proche | Loin ○</div>
        </div>
      </div>

      <div className="physiological-card">
        <h4>📍 Position</h4>
        <MetricRow label="X (Gauche/Droite)" value={state.x} range={[-1, 1]} />
        <MetricRow label="Y (Bas/Haut)" value={state.y} range={[-1, 1]} />
        <MetricRow label="Z (Proche/Loin)" value={state.z} range={[0, 1]} />
      </div>

      <div className="physiological-card">
        <h4>🎨 Caractéristiques</h4>
        <MetricRow label="Largeur" value={state.width} range={[0, 1]} />
        <MetricRow label="Focus" value={state.focus} range={[0, 1]} />
        <MetricRow label="Distance perçue" value={state.distance} range={[0, 1]} />
      </div>

      <div className="physiological-card">
        <h4>🎛️ Contrôles</h4>
        <button
          className="preset-button"
          onClick={() => holophonic.setPreset('coach')}
        >
          👨‍🏫 Coach
        </button>
        <button
          className="preset-button"
          onClick={() => holophonic.setPreset('meta')}
        >
          🌐 Meta
        </button>
        <button
          className="preset-button"
          onClick={() => holophonic.setPreset('deep-work')}
        >
          🧘 Deep Work
        </button>
        <button
          className="preset-button"
          onClick={() => holophonic.setPreset('insight')}
        >
          💎 Insight
        </button>
        <button
          className="preset-button"
          onClick={() => holophonic.setPreset('empathy')}
        >
          🤝 Empathy
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB - SONS COGNITIFS
// ═══════════════════════════════════════════════════════════════════════════

function SoundsTab({ sounds }: { sounds: any }) {
  return (
    <div className="physiological-sounds">
      <div className="physiological-card">
        <h4>🎵 Lexique Sonore</h4>
        <p className="sounds-description">
          Sons minimalistes pour signaler les états internes de TITANE∞
        </p>
      </div>

      <div className="sound-grid">
        <SoundButton
          icon="💭"
          label="Thinking"
          description="Réflexion en cours"
          onClick={sounds.playThinking}
        />
        <SoundButton
          icon="💡"
          label="Insight"
          description="Éclair de clarté"
          onClick={sounds.playInsight}
        />
        <SoundButton
          icon="🔄"
          label="Mode Switch"
          description="Changement de mode"
          onClick={sounds.playModeSwitch}
        />
        <SoundButton
          icon="⚠️"
          label="Error Soft"
          description="Erreur douce"
          onClick={sounds.playErrorSoft}
        />
        <SoundButton
          icon="✨"
          label="Heal Complete"
          description="Guérison terminée"
          onClick={sounds.playHealComplete}
        />
        <SoundButton
          icon="👂"
          label="Wake Word"
          description="Wake word détecté"
          onClick={sounds.playWakeWord}
        />
        <SoundButton
          icon="🎧"
          label="Listening"
          description="Écoute active"
          onClick={sounds.playListening}
        />
        <SoundButton
          icon="⚙️"
          label="Processing"
          description="Traitement en cours"
          onClick={sounds.playProcessing}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

function VitalCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="vital-card">
      <div className="vital-icon">{icon}</div>
      <div className="vital-label">{label}</div>
      <div className="vital-value" style={{ color }}>
        {Math.round(value * 100)}%
      </div>
      <div className="vital-bar">
        <div className="vital-fill" style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ProgressBar({ value, label, color = '#3b82f6' }: {
  value: number;
  label?: string;
  color?: string;
}) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
      {label && <div className="progress-label">{label}</div>}
    </div>
  );
}

function TemperatureBar({ value }: { value: number }) {
  const position = (value + 1) / 2; // -1..1 → 0..1

  return (
    <div className="temperature-bar-container">
      <div className="temperature-bar">
        <div className="temperature-gradient" />
        <div
          className="temperature-indicator"
          style={{ left: `${position * 100}%` }}
        />
      </div>
      <div className="temperature-labels">
        <span>❄️ Froid</span>
        <span>🌡️ Neutre</span>
        <span>🔥 Chaud</span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, range }: {
  label: string;
  value: number;
  range: [number, number];
}) {
  const normalized = (value - range[0]) / (range[1] - range[0]);

  return (
    <div className="metric-row">
      <div className="metric-row-label">{label}</div>
      <div className="metric-row-bar">
        <div className="metric-row-fill" style={{ width: `${normalized * 100}%` }} />
      </div>
      <div className="metric-row-value">{value.toFixed(2)}</div>
    </div>
  );
}

function SoundButton({ icon, label, description, onClick }: {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="sound-button" onClick={onClick}>
      <div className="sound-icon">{icon}</div>
      <div className="sound-label">{label}</div>
      <div className="sound-description">{description}</div>
    </button>
  );
}
