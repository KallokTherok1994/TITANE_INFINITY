/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// 🎯 Mode Indicator — Affichage mode actif + transitions
// Indicateur visuel compact du mode Meta-Mode actuel

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { useSingularityState, selectMetaModeState } from '../core/state/SingularityState';
import './ModeIndicator.css';

interface ModeHistory {
  mode: string;
  timestamp: string;
}

export const ModeIndicator: React.FC = React.memo(() => {
  // Use Zustand instead of local state
  const metaModeState = useSingularityState(selectMetaModeState);
  const setMetaMode = useSingularityState(s => s.setMetaMode);
  const setMetaModeTransition = useSingularityState(s => s.setMetaModeTransition);

  const { currentMode, transitioning } = metaModeState;
  const [history, setHistory] = useState<ModeHistory[]>([]);

  const fetchCurrentMode = useCallback(async () => {
    try {
      const mode = await secureInvoke<string>('meta_mode_get_current_mode');
      if (mode !== currentMode) {
        setMetaMode(mode);
        setTimeout(() => setMetaModeTransition(false), 600);
      }
    } catch (error) {
      console.error('Erreur récupération mode:', error);
    }
  }, [currentMode, setMetaMode, setMetaModeTransition]);

  const fetchHistory = useCallback(async () => {
    try {
      const hist = await secureInvoke<ModeHistory[]>('meta_mode_get_history');
      setHistory(hist);
    } catch (error) {
      console.error('Erreur récupération historique:', error);
    }
  }, []);

  useEffect(() => {
    fetchCurrentMode();
    fetchHistory();

    // Polling toutes les 2 secondes
    const interval = setInterval(() => {
      fetchCurrentMode();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchCurrentMode, fetchHistory]);

  const modeEmojiMap = useMemo(
    () => ({
      'Maître-Thérapeute Humaniste': '🌿',
      'Coach Professionnel ICF': '🎯',
      'PNL Master Practitioner': '🧠',
      'Hypnose douce non médicale': '🌀',
      'Méditation profonde TITANE ZÉRO': '🧘',
      'Digital Twin (Kevin+)': '🧬',
      'Emotional Engine': '❤️',
      'Behavioral Engine': '🎭',
      LifeEngine: '⚡',
      Stratège: '🗺️',
      'Architecte Systémique': '🏗️',
      Analyste: '🔍',
      'Autopilot Proactif': '🚀',
      'Creator Engine': '✨',
      Optimizer: '⚙️',
      'Refactor Engine': '🔧',
      'Voice Mode': '🎤',
      'Risk Detector': '⚠️',
      'Forecast Engine': '🔮',
    }),
    []
  );

  const getModeEmoji = (mode: string): string => {
    return modeEmojiMap[mode as keyof typeof modeEmojiMap] || '🧠';
  };

  const getModeColor = React.useCallback((mode: string): string => {
    if (mode.includes('Thérapeute')) return '#4ade80';
    if (mode.includes('Coach')) return '#60a5fa';
    if (mode.includes('PNL')) return '#a78bfa';
    if (mode.includes('Hypnose')) return '#f472b6';
    if (mode.includes('Méditation')) return '#34d399';
    if (mode.includes('Digital Twin')) return '#667eea';
    if (mode.includes('Stratège')) return '#fb923c';
    if (mode.includes('Architecte')) return '#fbbf24';
    if (mode.includes('Analyste')) return '#38bdf8';
    if (mode.includes('Autopilot')) return '#f87171';
    if (mode.includes('Creator')) return '#c084fc';
    if (mode.includes('Risk')) return '#ef4444';
    if (mode.includes('Forecast')) return '#8b5cf6';
    return '#667eea';
  }, []);

  return (
    <div className="mode-indicator-container">
      {/* Indicateur principal */}
      <div
        className={`mode-indicator ${transitioning ? 'transitioning' : ''}`}
        style={{ borderColor: getModeColor(currentMode) }}
      >
        <div className="mode-icon">{getModeEmoji(currentMode)}</div>
        <div className="mode-info">
          <div className="mode-name" style={{ color: getModeColor(currentMode) }}>
            {currentMode}
          </div>
          {metaModeState.previousMode && transitioning && (
            <div className="mode-transition">← {metaModeState.previousMode}</div>
          )}
        </div>
        <div
          className="mode-pulse"
          style={{ backgroundColor: getModeColor(currentMode) }}
        />
      </div>

      {/* Historique récent */}
      {history.length > 0 && (
        <div className="mode-history">
          <div className="history-title">Transitions récentes</div>
          {history.map((item, idx) => (
            <div key={idx} className="history-item">
              <span className="history-icon">{getModeEmoji(item.mode)}</span>
              <span className="history-name">{item.mode}</span>
              <span className="history-time">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ModeIndicator;
