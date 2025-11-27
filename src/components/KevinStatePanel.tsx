/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// 📊 Kevin State Panel — Dashboard 12 dimensions état Kevin
// Affichage temps réel de l'état cognitif, émotionnel et énergétique

import React, { useEffect, useState } from 'react';
import { secureInvoke } from '@/lib/security';
// import './KevinStatePanel.css';

interface KevinStateResponse {
  emotional_tone: string;
  stress_level: number;
  emotional_stability: number;
  cognitive_load: number;
  clarity_level: number;
  focus_level: number;
  energy_level: number;
  saturation_level: number;
  need_structure: boolean;
  need_validation: boolean;
  need_guidance: boolean;
  need_autonomy: boolean;
  need_creativity: boolean;
  need_rest: boolean;
}

export const KevinStatePanel: React.FC = () => {
  const [state, setState] = useState<KevinStateResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchState();

    // Rafraîchissement automatique toutes les 3 secondes
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchState = async () => {
    try {
      setRefreshing(true);
      const result = await secureInvoke<KevinStateResponse>('meta_mode_get_kevin_state');
      setState(result);
    } catch (error) {
      console.error('Erreur récupération état Kevin:', error);
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  if (!state) {
    return (
      <div className="kevin-state-panel loading">
        <div className="loading-spinner">⏳</div>
        <p>Chargement état Kevin...</p>
      </div>
    );
  }

  const getColorForLevel = (level: number): string => {
    if (level > 0.7) return '#ef4444';
    if (level > 0.4) return '#f59e0b';
    return '#10b981';
  };

  const getInverseColor = (level: number): string => {
    if (level < 0.3) return '#ef4444';
    if (level < 0.6) return '#f59e0b';
    return '#10b981';
  };

  const renderMetric = (
    label: string,
    value: number,
    emoji: string,
    inverse: boolean = false
  ) => {
    const color = inverse ? getInverseColor(value) : getColorForLevel(value);
    return (
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-emoji">{emoji}</span>
          <span className="metric-label">{label}</span>
        </div>
        <div className="metric-bar">
          <div
            className="metric-fill"
            style={{
              width: `${value * 100}%`,
              backgroundColor: color,
            }}
          >
            <span className="metric-value">{(value * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderNeed = (label: string, active: boolean, emoji: string) => {
    return (
      <div className={`need-badge ${active ? 'active' : ''}`}>
        <span className="need-emoji">{emoji}</span>
        <span className="need-label">{label}</span>
        {active && <span className="need-indicator">●</span>}
      </div>
    );
  };

  return (
    <div className={`kevin-state-panel ${refreshing ? 'refreshing' : ''}`}>
      {/* Header */}
      <div className="panel-header">
        <h3>📊 État Kevin en temps réel</h3>
        <button className="refresh-btn" onClick={fetchState} disabled={refreshing}>
          {refreshing ? '⏳' : '🔄'}
        </button>
      </div>

      {/* État émotionnel */}
      <div className="state-section">
        <h4>💫 État émotionnel</h4>
        <div className="emotional-card">
          <div className="emotional-tone">
            <span className="tone-label">Ton émotionnel:</span>
            <span className="tone-value">{state.emotional_tone}</span>
          </div>
          {renderMetric('Stress', state.stress_level, '🌡️', false)}
          {renderMetric('Stabilité émotionnelle', state.emotional_stability, '🎯', true)}
        </div>
      </div>

      {/* État cognitif */}
      <div className="state-section">
        <h4>🧠 État cognitif</h4>
        <div className="metrics-grid">
          {renderMetric('Charge cognitive', state.cognitive_load, '🧠', false)}
          {renderMetric('Clarté', state.clarity_level, '💡', true)}
          {renderMetric('Focus', state.focus_level, '🎯', true)}
        </div>
      </div>

      {/* État énergétique */}
      <div className="state-section">
        <h4>⚡ État énergétique</h4>
        <div className="metrics-grid">
          {renderMetric('Énergie', state.energy_level, '⚡', true)}
          {renderMetric('Saturation', state.saturation_level, '🔥', false)}
        </div>
      </div>

      {/* Besoins détectés */}
      <div className="state-section">
        <h4>🎯 Besoins détectés</h4>
        <div className="needs-grid">
          {renderNeed('Structure', state.need_structure, '📐')}
          {renderNeed('Validation', state.need_validation, '✅')}
          {renderNeed('Guidance', state.need_guidance, '🧭')}
          {renderNeed('Autonomie', state.need_autonomy, '🚀')}
          {renderNeed('Créativité', state.need_creativity, '✨')}
          {renderNeed('Repos', state.need_rest, '😴')}
        </div>
      </div>

      {/* Recommandations */}
      <div className="state-section">
        <h4>💡 Recommandations</h4>
        <div className="recommendations">
          {state.stress_level > 0.7 && (
            <div className="recommendation warning">
              <span>⚠️</span>
              <p>Niveau de stress élevé → Mode Thérapeute ou Méditation TITANE ZÉRO recommandé</p>
            </div>
          )}
          {state.saturation_level > 0.8 && (
            <div className="recommendation warning">
              <span>🔥</span>
              <p>Saturation cognitive → Pause immédiate recommandée</p>
            </div>
          )}
          {state.energy_level < 0.3 && (
            <div className="recommendation info">
              <span>😴</span>
              <p>Énergie faible → Repos ou méditation conseillé</p>
            </div>
          )}
          {state.clarity_level < 0.3 && (
            <div className="recommendation info">
              <span>🌫️</span>
              <p>Clarté faible → Mode Coach ICF pour clarification</p>
            </div>
          )}
          {state.clarity_level > 0.7 && state.energy_level > 0.7 && (
            <div className="recommendation success">
              <span>🚀</span>
              <p>État optimal → Autopilot Proactif disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KevinStatePanel;
