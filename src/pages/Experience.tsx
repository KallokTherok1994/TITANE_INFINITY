/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.D - Experience Page
 * ═══════════════════════════════════════════════════════════════════
 *
 * Page de progression complète : XP, historique, statistiques
 */

import { useState, useEffect, useMemo } from 'react';
import { XP } from '../core/experience/XP_ENGINE';
import { motion } from 'framer-motion';

export const Experience = (): JSX.Element => {
  const [state, setState] = useState(XP.state);
  const [filter, setFilter] = useState<string>('all');

  // Mettre à jour l'état toutes les secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setState({ ...XP.state });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtrer l'historique
  const filteredHistory = useMemo(() => {
    if (filter === 'all') return state.history;
    return state.history.filter(e => e.source === filter);
  }, [state.history, filter]);

  // Statistiques par source (getStatsBySource utilise state interne)
  const stats = XP.getStatsBySource();
  const sources = useMemo(() => Object.keys(stats).sort(), [stats]);

  // Progression vers le prochain niveau
  const progress = XP.getProgressToNextLevel();
  const xpToNext = XP.getXPToNextLevel();
  const xpInLevel = state.total % 500;

  return (
    <div className="experience-page">
      {/* Header */}
      <motion.div
        className="exp-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>⚡ PROGRESSION TITANE∞</h1>
        <p>Évolution intelligente et persistante</p>
      </motion.div>

      {/* Stats globales */}
      <motion.div
        className="exp-stats-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="exp-stat-card">
          <div className="exp-stat-label">Niveau</div>
          <div className="exp-stat-value">{state.level}</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">XP Total</div>
          <div className="exp-stat-value">{state.total.toLocaleString()}</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">XP dans ce niveau</div>
          <div className="exp-stat-value">{xpInLevel} / 500</div>
        </div>
        <div className="exp-stat-card">
          <div className="exp-stat-label">Vers niveau {state.level + 1}</div>
          <div className="exp-stat-value">{xpToNext} XP</div>
        </div>
      </motion.div>

      {/* Barre de progression */}
      <motion.div
        className="exp-progress-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="exp-progress-bar-large">
          <div
            className="exp-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="exp-progress-text">{progress.toFixed(1)}%</div>
      </motion.div>

      {/* Statistiques par source */}
      <motion.div
        className="exp-sources-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2>📊 Statistiques par Source</h2>
        <div className="exp-sources-grid">
          {sources.map(source => (
            <div key={source} className="exp-source-card">
              <div className="exp-source-name">{formatSource(source)}</div>
              <div className="exp-source-stats">
                <span>{stats[source].total} XP</span>
                <span className="exp-source-count">{stats[source].count} événements</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div
        className="exp-filters"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tout ({state.history.length})
        </button>
        {sources.map(source => (
          <button
            key={source}
            className={filter === source ? 'active' : ''}
            onClick={() => setFilter(source)}
          >
            {formatSource(source)} ({stats[source].count})
          </button>
        ))}
      </motion.div>

      {/* Historique */}
      <motion.div
        className="exp-history"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2>📜 Historique ({filteredHistory.length})</h2>
        <div className="exp-history-list">
          {filteredHistory.slice().reverse().map((event, i) => (
            <motion.div
              key={`${event.timestamp}-${i}`}
              className="exp-event"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <span className="exp-event-time">
                {new Date(event.timestamp).toLocaleString('fr-FR')}
              </span>
              <span className="exp-event-amount">+{event.amount} XP</span>
              <span className="exp-event-source">{formatSource(event.source)}</span>
              {event.description && (
                <span className="exp-event-desc">{event.description}</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Helper pour formater les noms de sources
function formatSource(source: string): string {
  const map: Record<string, string> = {
    'message_user': '💬 Message utilisateur',
    'response_ai': '🤖 Réponse IA',
    'file_import': '📁 Import fichier',
    'file_analysis': '🔍 Analyse fichier',
    'system_update': '⚙️ Mise à jour système',
    'engine_load': '🚀 Chargement moteur',
  };
  return map[source] || source;
}
