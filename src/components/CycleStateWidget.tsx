/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — CycleStateWidget
 * V32 Phase 5 — SP#16 Rythmes Cognitifs Circadiens
 * Affiche la phase cognitive, le rythme et les prédictions en temps réel.
 * ═══════════════════════════════════════════════════════════════
 */
import React, { useEffect, useState, useCallback } from 'react';
import { secureInvoke } from '../lib/security';

// ─────────────────────────────────────────────────────────────
// Types (mirroring Rust structs)
// ─────────────────────────────────────────────────────────────
interface CycleStateResponse {
  daily_phase: string;
  weekly_phase: string;
  monthly_phase: string;
  seasonal_phase: string;
  cognitive_mode: string;
  timestamp: number;
}

interface CognitiveRhythmResponse {
  omega_depth: number;
  analysis_intensity: number;
  speed_vs_quality: number;
  memory_consolidation: number;
  creative_temperature: number;
  engine_weights: number[];
}

interface CycleDiagnosticsResponse {
  clock_running: boolean;
  current_hour: number;
  uptime_seconds: number;
  daily_phase: string;
  cognitive_mode: string;
  omega_intensity: number;
  alignment_score: number;
}

// ─────────────────────────────────────────────────────────────
// Phase → couleur CSS
// ─────────────────────────────────────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  Peak: '#22d3ee',
  Analytical: '#a78bfa',
  Creative: '#fb923c',
  Consolidation: '#4ade80',
  Rest: '#64748b',
  Transition: '#fbbf24',
};

function phaseColor(phase: string): string {
  for (const [key, color] of Object.entries(PHASE_COLORS)) {
    if (phase.includes(key)) return color;
  }
  return '#94a3b8';
}

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────
export const CycleStateWidget: React.FC<{ refreshInterval?: number }> = ({
  refreshInterval = 30_000,
}) => {
  const [state, setState] = useState<CycleStateResponse | null>(null);
  const [rhythm, setRhythm] = useState<CognitiveRhythmResponse | null>(null);
  const [diagnostics, setDiagnostics] = useState<CycleDiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [stateRes, rhythmRes, diagRes] = await Promise.all([
        secureInvoke<CycleStateResponse>('cycle_get_state'),
        secureInvoke<CognitiveRhythmResponse>('cycle_get_rhythm'),
        secureInvoke<CycleDiagnosticsResponse>('cycle_get_diagnostics'),
      ]);
      setState(stateRes);
      setRhythm(rhythmRes);
      setDiagnostics(diagRes);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), refreshInterval);
    return () => clearInterval(id);
  }, [refresh, refreshInterval]);

  if (loading) {
    return (
      <div data-testid="cycle-state-widget" className="cycle-widget cycle-widget--loading">
        <span>Chargement rythmes…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="cycle-state-widget" className="cycle-widget cycle-widget--error">
        <span title={error}>⚠ Cycle Engine indisponible</span>
      </div>
    );
  }

  const phase = state?.daily_phase ?? '—';
  const color = phaseColor(phase);

  return (
    <div
      data-testid="cycle-state-widget"
      className="cycle-widget"
      style={{ '--phase-color': color } as React.CSSProperties}
    >
      {/* En-tête phase */}
      <div className="cycle-widget__header">
        <span className="cycle-widget__phase" style={{ color }}>
          {phase}
        </span>
        <span className="cycle-widget__mode">{state?.cognitive_mode}</span>
      </div>

      {/* Métriques rythme */}
      {rhythm && (
        <div className="cycle-widget__rhythm" data-testid="cycle-rhythm">
          <RhythmBar label="Ω Depth" value={rhythm.omega_depth} />
          <RhythmBar label="Analyse" value={rhythm.analysis_intensity} />
          <RhythmBar label="Créativité" value={rhythm.creative_temperature} />
          <RhythmBar label="Mémoire" value={rhythm.memory_consolidation} />
        </div>
      )}

      {/* Diagnostics */}
      {diagnostics && (
        <div className="cycle-widget__diagnostics" data-testid="cycle-diagnostics">
          <span className={`cycle-widget__clock ${diagnostics.clock_running ? 'active' : 'paused'}`}>
            {diagnostics.clock_running ? '⟳' : '⏸'} {diagnostics.current_hour}h
          </span>
          <span className="cycle-widget__alignment">
            Alignement {Math.round(diagnostics.alignment_score * 100)}%
          </span>
        </div>
      )}

      {/* Phases secondaires */}
      <div className="cycle-widget__phases" data-testid="cycle-phases">
        <PhaseBadge label="Semaine" value={state?.weekly_phase} />
        <PhaseBadge label="Saison" value={state?.seasonal_phase} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────
const RhythmBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rhythm-bar">
    <span className="rhythm-bar__label">{label}</span>
    <div className="rhythm-bar__track">
      <div
        className="rhythm-bar__fill"
        style={{ width: `${Math.min(100, Math.round(value * 100))}%` }}
      />
    </div>
    <span className="rhythm-bar__value">{Math.round(value * 100)}%</span>
  </div>
);

const PhaseBadge: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <span className="phase-badge" style={{ color: phaseColor(value ?? '') }}>
    <span className="phase-badge__label">{label}:</span>
    <span className="phase-badge__value">{value ?? '—'}</span>
  </span>
);

export default CycleStateWidget;
