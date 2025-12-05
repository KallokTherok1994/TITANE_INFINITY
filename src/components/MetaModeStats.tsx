// 📊 Meta-Mode Statistics Dashboard
// Tableau de bord statistiques pour le Meta-Mode Engine

import React, { useEffect, useState } from 'react';
import { secureInvoke } from '@/lib/security';
// import './MetaModeStats.css';

interface MetaModeStatsData {
  total_interactions: number;
  total_transitions: number;
  average_response_time_ms: number;
  mode_usage: Record<string, number>;
  uptime_seconds: number;
  last_reset: string | null;
}

export const MetaModeStats: React.FC = () => {
  const [stats, setStats] = useState<MetaModeStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();

    // Rafraîchir toutes les 10 secondes
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchStats().finally(() => {
        setTimeout(() => setRefreshing(false), 300);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const result = await secureInvoke<MetaModeStatsData>('meta_mode_get_stats');
      setStats(result);
      setLoading(false);
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}min`;
    if (minutes > 0) return `${minutes}min`;
    return `${seconds}s`;
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
    if (mode.includes('Coach')) return '#8899aa';
    if (mode.includes('PNL')) return '#9a9ab8';
    if (mode.includes('Hypnose')) return '#b89a9a';
    if (mode.includes('Méditation')) return '#93b399';
    if (mode.includes('Digital Twin')) return '#727b81';
    if (mode.includes('Stratège')) return '#a89f91';
    if (mode.includes('Architecte')) return '#a89f91';
    if (mode.includes('Analyste')) return '#8899aa';
    if (mode.includes('Autopilot')) return '#9a8a8a';
    if (mode.includes('Creator')) return '#9a8aaa';
    if (mode.includes('Risk')) return '#8f7a7a';
    if (mode.includes('Forecast')) return '#727b81';
    return '#727b81';
  };

  if (loading) {
    return (
      <div className="meta-mode-stats loading">
        <div className="loading-spinner">📊</div>
        <p>Chargement statistiques...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="meta-mode-stats empty">
        <div className="empty-icon">📭</div>
        <p>Aucune statistique disponible</p>
      </div>
    );
  }

  const sortedModes = Object.entries(stats.mode_usage).sort((a, b) => b[1] - a[1]);
  const totalUsage = Object.values(stats.mode_usage).reduce((sum, val) => sum + val, 0);

  return (
    <div className={`meta-mode-stats ${refreshing ? 'refreshing' : ''}`}>
      {/* Header */}
      <div className="stats-header">
        <h2>📊 Tableau de bord Meta-Mode</h2>
        {refreshing && <div className="refresh-indicator">🔄 Mise à jour...</div>}
      </div>

      {/* KPIs principaux */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon">💬</div>
          <div className="kpi-content">
            <div className="kpi-value">{stats.total_interactions}</div>
            <div className="kpi-label">Interactions totales</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">🔄</div>
          <div className="kpi-content">
            <div className="kpi-value">{stats.total_transitions}</div>
            <div className="kpi-label">Transitions de mode</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⚡</div>
          <div className="kpi-content">
            <div className="kpi-value">{stats.average_response_time_ms}ms</div>
            <div className="kpi-label">Temps de réponse moyen</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">⏱️</div>
          <div className="kpi-content">
            <div className="kpi-value">{formatUptime(stats.uptime_seconds)}</div>
            <div className="kpi-label">Temps d'activité</div>
          </div>
        </div>
      </div>

      {/* Graphique utilisation des modes */}
      <div className="section-card">
        <h3>📈 Utilisation des modes</h3>
        <div className="mode-usage-chart">
          {sortedModes.map(([mode, count]) => {
            const percentage = totalUsage > 0 ? (count / totalUsage) * 100 : 0;
            return (
              <div key={mode} className="mode-bar-container">
                <div className="mode-bar-label">
                  <span className="mode-emoji">{getModeEmoji(mode)}</span>
                  <span className="mode-name">{mode}</span>
                  <span className="mode-count">{count}</span>
                </div>
                <div className="mode-bar-wrapper">
                  <div
                    className="mode-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getModeColor(mode),
                    }}
                  >
                    <span className="mode-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Métadonnées */}
      <div className="metadata-section">
        <div className="metadata-card">
          <div className="metadata-icon">🔧</div>
          <div className="metadata-content">
            <div className="metadata-label">Version Engine</div>
            <div className="metadata-value">TITANE∞ v15.1</div>
          </div>
        </div>

        {stats.last_reset && (
          <div className="metadata-card">
            <div className="metadata-icon">🔄</div>
            <div className="metadata-content">
              <div className="metadata-label">Dernier reset</div>
              <div className="metadata-value">
                {new Date(stats.last_reset).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        )}

        <div className="metadata-card">
          <div className="metadata-icon">🧮</div>
          <div className="metadata-content">
            <div className="metadata-label">Modes actifs</div>
            <div className="metadata-value">{sortedModes.length} modes</div>
          </div>
        </div>
      </div>

      {/* Performance insights */}
      <div className="insights-section">
        <h3>💡 Insights</h3>
        <div className="insights-grid">
          {stats.average_response_time_ms < 100 && (
            <div className="insight-card success">
              <div className="insight-icon">🚀</div>
              <div className="insight-text">
                Performances excellentes : temps de réponse &lt; 100ms
              </div>
            </div>
          )}

          {stats.total_transitions > 10 && (
            <div className="insight-card info">
              <div className="insight-icon">🔄</div>
              <div className="insight-text">
                Système dynamique : {stats.total_transitions} transitions détectées
              </div>
            </div>
          )}

          {sortedModes.length >= 5 && (
            <div className="insight-card success">
              <div className="insight-icon">🎯</div>
              <div className="insight-text">
                Couverture étendue : {sortedModes.length} modes utilisés
              </div>
            </div>
          )}

          {stats.total_interactions > 50 && (
            <div className="insight-card success">
              <div className="insight-icon">⭐</div>
              <div className="insight-text">
                Haut engagement : {stats.total_interactions} interactions
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaModeStats;
