// 📈 Transition Timeline — Historique visuel des transitions de modes
// Visualisation chronologique des changements de modes Meta-Mode Engine

import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
// import './TransitionTimeline.css';

interface TransitionEntry {
  mode: string;
  timestamp: string;
}

export const TransitionTimeline: React.FC = () => {
  const [history, setHistory] = useState<TransitionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();

    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      const result = await invoke<TransitionEntry[]>('meta_mode_get_history');
      setHistory(result);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      setLoading(false);
    }
  };

  const getModeEmoji = (mode: string): string => {
    const map: Record<string, string> = {
      'Maître-Thérapeute Humaniste': '🌿',
      'Coach Professionnel ICF': '🎯',
      'PNL Master Practitioner': '🧠',
      'Hypnose douce non médicale': '🌀',
      'Méditation profonde TITANE ZÉRO': '🧘',
      'Digital Twin (Kevin+)': '🧬',
      'Emotional Engine': '❤️',
      'Behavioral Engine': '🎭',
      'LifeEngine': '⚡',
      'Stratège': '🗺️',
      'Architecte Systémique': '🏗️',
      'Analyste': '🔍',
      'Autopilot Proactif': '🚀',
      'Creator Engine': '✨',
      'Optimizer': '⚙️',
      'Risk Detector': '⚠️',
      'Forecast Engine': '🔮',
    };
    return map[mode] || '🧠';
  };

  const getModeColor = (mode: string): string => {
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
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `il y a ${hours}h`;
    if (minutes > 0) return `il y a ${minutes}min`;
    if (seconds > 10) return `il y a ${seconds}s`;
    return 'à l\'instant';
  };

  if (loading) {
    return (
      <div className="transition-timeline loading">
        <div className="loading-spinner">⏳</div>
        <p>Chargement historique...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="transition-timeline empty">
        <div className="empty-icon">📭</div>
        <p>Aucune transition enregistrée pour le moment</p>
      </div>
    );
  }

  return (
    <div className="transition-timeline">
      <div className="timeline-header">
        <h3>📈 Historique des transitions</h3>
        <div className="timeline-count">{history.length} transitions</div>
      </div>

      <div className="timeline-container">
        <div className="timeline-line" />
        {history.map((entry, idx) => (
          <div key={idx} className="timeline-entry" style={{ '--delay': `${idx * 0.1}s` } as React.CSSProperties}>
            <div className="timeline-dot" style={{ backgroundColor: getModeColor(entry.mode) }} />
            <div className="timeline-card">
              <div className="card-header">
                <span className="card-emoji">{getModeEmoji(entry.mode)}</span>
                <span className="card-mode" style={{ color: getModeColor(entry.mode) }}>
                  {entry.mode}
                </span>
              </div>
              <div className="card-time">{formatTime(entry.timestamp)}</div>
              <div className="card-timestamp">
                {new Date(entry.timestamp).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
            {idx < history.length - 1 && (
              <div className="timeline-arrow">→</div>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <div className="timeline-stats">
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <div className="stat-value">{history.length}</div>
            <div className="stat-label">Transitions totales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-value">
              {(() => {
                if (history.length < 2) return 0;
                const first = history[0];
                const last = history[history.length - 1];
                if (!first || !last) return 0;
                return Math.round(
                  (new Date(first.timestamp).getTime() -
                    new Date(last.timestamp).getTime()) /
                    (1000 * 60)
                );
              })()}
              min
            </div>
            <div className="stat-label">Durée totale</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{history[0]?.mode.split(' ')[0] || 'N/A'}</div>
            <div className="stat-label">Mode actuel</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitionTimeline;
