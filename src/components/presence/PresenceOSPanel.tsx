/**
 * TITANE_INFINITY v∞.12 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   Presence OS Panel - Super Prompt XII
 *   Visualisation en temps réel des 7 couches de présence
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  usePresenceOS,
  usePresenceMode,
  useCognitiveState,
  useAffectiveState,
  useExpressiveState,
  useSpatialPosition,
  usePresenceCoherence,
  usePresenceModeControl,
} from '@/hooks';

// REMOVED: engines/presence supprimé en PHASE 1 (OPTION B)
// Types locaux pour éviter l'import manquant
import type {
  PresenceState,
  CognitiveState,
  AffectiveState,
  ExpressiveOSState as ExpressiveState,
  SpatialState as SpatialPosition,
} from '@/engines/presence/_stubs';

/*
import type {
  PresenceState,
  CognitiveState,
  AffectiveState,
  ExpressiveState,
  SpatialPosition,
} from '@/engines/presence/presenceOS';
*/
import './PresenceOSPanel.css';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function PresenceOSPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cognitive' | 'affective' | 'expressive' | 'spatial'
  >('overview');

  const { state } = usePresenceOS();
  const mode = usePresenceMode();
  const cognitive = useCognitiveState();
  const affective = useAffectiveState();
  const expressive = useExpressiveState();
  const spatial = useSpatialPosition();
  const coherence = usePresenceCoherence();
  const modeControl = usePresenceModeControl();

  return (
    <>
      {/* Badge flottant */}
      <button
        className="presence-os-badge"
        onClick={() => setIsOpen(!isOpen)}
        data-mode={mode}
        data-coherence={coherence > 0.8 ? 'high' : coherence > 0.6 ? 'medium' : 'low'}
      >
        <span className="presence-os-icon">🌌</span>
        <span className="presence-os-label">Presence OS</span>
        <span className="presence-os-coherence">{Math.round(coherence * 100)}%</span>
      </button>

      {/* Panel principal */}
      {isOpen && (
        <div className="presence-os-panel">
          <div className="presence-os-header">
            <h3>🌌 TITANE∞ Presence OS v∞.1</h3>
            <button className="presence-os-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          {/* Mode selector */}
          <div className="presence-os-mode-selector">
            <button
              className={mode === 'insight' ? 'active' : ''}
              onClick={modeControl.setInsight}
              title="Mode Insight: Perle blanche, voix douce"
            >
              💎 Insight
            </button>
            <button
              className={mode === 'empathy' ? 'active' : ''}
              onClick={modeControl.setEmpathy}
              title="Mode Empathy: Or/ambre, voix chaude"
            >
              🤝 Empathy
            </button>
            <button
              className={mode === 'architect' ? 'active' : ''}
              onClick={modeControl.setArchitect}
              title="Mode Architect: Bleu-violet, voix précise"
            >
              🏛️ Architect
            </button>
            <button
              className={mode === 'deep-work' ? 'active' : ''}
              onClick={modeControl.setDeepWork}
              title="Mode Deep-Work: Aura diffuse, calme"
            >
              🧘 Deep-Work
            </button>
            <button
              className={mode === 'singularity' ? 'active' : ''}
              onClick={modeControl.setSingularity}
              title="Mode Singularity: Triangle infini"
            >
              ∞ Singularity
            </button>
          </div>

          {/* Tabs */}
          <div className="presence-os-tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={activeTab === 'cognitive' ? 'active' : ''}
              onClick={() => setActiveTab('cognitive')}
            >
              🧠 Cognitive
            </button>
            <button
              className={activeTab === 'affective' ? 'active' : ''}
              onClick={() => setActiveTab('affective')}
            >
              💗 Affective
            </button>
            <button
              className={activeTab === 'expressive' ? 'active' : ''}
              onClick={() => setActiveTab('expressive')}
            >
              🎭 Expressive
            </button>
            <button
              className={activeTab === 'spatial' ? 'active' : ''}
              onClick={() => setActiveTab('spatial')}
            >
              📍 Spatial
            </button>
          </div>

          {/* Content */}
          <div className="presence-os-content">
            {activeTab === 'overview' && (
              <OverviewTab state={state} coherence={coherence} />
            )}
            {activeTab === 'cognitive' && <CognitiveTab cognitive={cognitive} />}
            {activeTab === 'affective' && <AffectiveTab affective={affective} />}
            {activeTab === 'expressive' && <ExpressiveTab expressive={expressive} />}
            {activeTab === 'spatial' && <SpatialTab spatial={spatial} />}
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TAB - OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({ state, coherence }: { state: PresenceState; coherence: number }) {
  return (
    <div className="presence-os-overview">
      <div className="presence-os-card">
        <h4>🎯 Mode Actuel</h4>
        <div className="presence-os-mode-display" data-mode={state.mode}>
          {state.mode}
        </div>
      </div>

      <div className="presence-os-card">
        <h4>🔗 Cohérence Globale</h4>
        <div className="presence-os-coherence-bar">
          <div
            className="presence-os-coherence-fill"
            style={{ width: `${coherence * 100}%` }}
            data-level={coherence > 0.8 ? 'high' : coherence > 0.6 ? 'medium' : 'low'}
          />
        </div>
        <div className="presence-os-coherence-value">{Math.round(coherence * 100)}%</div>
      </div>

      <div className="presence-os-card">
        <h4>🌈 Pattern Aura</h4>
        <div className="presence-os-aura-display" data-pattern={state.auraPattern}>
          {state.auraPattern}
        </div>
      </div>

      <div className="presence-os-card">
        <h4>📈 7 Couches</h4>
        <div className="presence-os-layers">
          <LayerIndicator label="Cognitive" value={state.cognitive.coherence} />
          <LayerIndicator label="Affective" value={state.affective.stability} />
          <LayerIndicator
            label="Expressive"
            value={
              (Object.values(state.expressive.timbreBlend) as number[]).reduce(
                (a, b) => a + b,
                0
              ) / 4
            }
          />
          <LayerIndicator label="Aura" value={coherence} />
          <LayerIndicator label="Spatial" value={state.spatial.proximity} />
          <LayerIndicator label="Autonomic" value={0.8} />
          <LayerIndicator label="Evolution" value={0.75} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 TAB - COGNITIVE
// ═══════════════════════════════════════════════════════════════════════════

function CognitiveTab({ cognitive }: { cognitive: CognitiveState }) {
  return (
    <div className="presence-os-cognitive">
      <MetricCard label="Reasoning Style" value={cognitive.reasoningStyle} />
      <MetricCard label="Depth" value={cognitive.depth} type="progress" />
      <MetricCard label="Tempo" value={cognitive.tempo} type="progress" />
      <MetricCard
        label="Analytical Intensity"
        value={cognitive.analyticalIntensity}
        type="progress"
      />
      <MetricCard label="Coherence" value={cognitive.coherence} type="progress" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 💗 TAB - AFFECTIVE
// ═══════════════════════════════════════════════════════════════════════════

function AffectiveTab({ affective }: { affective: AffectiveState }) {
  return (
    <div className="presence-os-affective">
      <MetricCard label="Emotion" value={affective.emotion} />
      <MetricCard label="Intensity" value={affective.intensity} type="progress" />
      <MetricCard label="Valence" value={affective.valence} type="progress" />
      <MetricCard label="Warmth" value={affective.warmth} type="progress" />
      <MetricCard label="Stability" value={affective.stability} type="progress" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎭 TAB - EXPRESSIVE
// ═══════════════════════════════════════════════════════════════════════════

function ExpressiveTab({ expressive }: { expressive: ExpressiveState }) {
  return (
    <div className="presence-os-expressive">
      <div className="presence-os-card">
        <h4>🎵 Expression Vocale</h4>
        <MetricCard
          label="Speech Rate"
          value={expressive.speechRate ?? 1.0}
          type="progress"
        />
        <MetricCard label="Softness" value={expressive.softness ?? 0.5} type="progress" />
        <MetricCard
          label="Vocal Warmth"
          value={expressive.vocalWarmth ?? 0.5}
          type="progress"
        />
      </div>

      <div className="presence-os-card">
        <h4>🎤 Timbre & Breathing</h4>
        <MetricCard
          label="Breathiness"
          value={expressive.breathiness ?? 0.3}
          type="progress"
        />
        <MetricCard
          label="Micro Pauses"
          value={expressive.microPauses ?? 0.2}
          type="progress"
        />
      </div>

      <div className="presence-os-card">
        <h4>🎭 Timbre Blend</h4>
        {Object.entries(expressive.timbreBlend).map(([key, val]) => (
          <MetricCard key={key} label={key} value={val as number} type="progress" />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 📍 TAB - SPATIAL
// ═══════════════════════════════════════════════════════════════════════════

function SpatialTab({ spatial }: { spatial: SpatialPosition }) {
  return (
    <div className="presence-os-spatial">
      <MetricCard label="Proximity" value={spatial.proximity} type="progress" />
      <MetricCard label="Elevation" value={spatial.elevation} type="progress" />
      <MetricCard label="Width" value={spatial.width} type="progress" />

      <div className="presence-os-spatial-viz">
        <div className="spatial-grid">
          <div
            className="spatial-point"
            style={{
              left: `${(spatial.proximity + 1) * 50}%`,
              top: `${(1 - spatial.elevation) * 50}%`,
              width: `${spatial.width * 50}px`,
              height: `${spatial.width * 50}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧩 COMPOSANTS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

function LayerIndicator({ label, value }: { label: string; value: number }) {
  return (
    <div className="layer-indicator">
      <span className="layer-label">{label}</span>
      <div className="layer-bar">
        <div className="layer-fill" style={{ width: `${value * 100}%` }} />
      </div>
      <span className="layer-value">{Math.round(value * 100)}%</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  type = 'text',
}: {
  label: string;
  value: string | number;
  type?: 'text' | 'progress';
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      {type === 'text' ? (
        <div className="metric-value">{String(value)}</div>
      ) : (
        <div className="metric-progress">
          <div
            className="metric-progress-fill"
            style={{ width: `${(typeof value === 'number' ? value : 0) * 100}%` }}
          />
          <span className="metric-progress-value">
            {Math.round((typeof value === 'number' ? value : 0) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
