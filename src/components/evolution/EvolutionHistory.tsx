/**
 * TITANE∞ Evolution Engine - Historique des évolutions
 * Copyright (c) 2025 MUSIC∞AI
 */

import React, { useState, useMemo } from 'react';
import type {
  EvolutionHistoryEntry,
  ActionResult,
  EvolutionPhase,
  GovernanceRole,
} from '../../services/evolutionEngine/evolutionEngine.config';
import './EvolutionHistory.css';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface EvolutionHistoryProps {
  entries: EvolutionHistoryEntry[];
  maxEntries?: number;
  onEntryClick?: (entry: EvolutionHistoryEntry) => void;
  onRollback?: (entryId: string) => void;
  className?: string;
}

type FilterType = 'all' | 'success' | 'failed' | 'rollback';

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

const PHASE_ICONS: Record<EvolutionPhase, string> = {
  COLLECT: '📥',
  ANALYZE: '🔍',
  PLAN: '📋',
  VALIDATE: '✅',
  EXECUTE: '⚡',
  LEARN: '🧠',
};

const RESULT_COLORS: Record<ActionResult, string> = {
  SUCCESS: '#22c55e',
  FAILED: '#ef4444',
  PARTIAL: '#f59e0b',
  DENIED: '#8b5cf6',
  ROLLED_BACK: '#6b7280',
};

const ROLE_BADGES: Record<GovernanceRole, string> = {
  USER: '👤',
  DEV: '👨‍💻',
  ADMIN: '👑',
  SYSTEM: '🤖',
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
  return `Il y a ${Math.floor(diff / 86400000)}j`;
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

interface HistoryEntryCardProps {
  entry: EvolutionHistoryEntry;
  onClick?: () => void;
  onRollback?: () => void;
}

const HistoryEntryCard: React.FC<HistoryEntryCardProps> = React.memo(
  ({ entry, onClick, onRollback }) => {
    const { timestamp, phase, actor, action, result, rollbackOf } = entry;
    const phaseIcon = PHASE_ICONS[phase];
    const roleIcon = ROLE_BADGES[actor];
    const resultColor = RESULT_COLORS[result];
    const canRollback = result === 'SUCCESS' && !rollbackOf;

    return (
      <div
        className={`history-entry result-${result.toLowerCase()}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className="entry-timeline">
          <span className="entry-phase-icon">{phaseIcon}</span>
          <div className="timeline-line" />
        </div>

        <div className="entry-content">
          <div className="entry-header">
            <span className="entry-action">{action}</span>
            <span className="entry-time" title={formatDate(timestamp)}>
              {formatRelativeTime(timestamp)}
            </span>
          </div>

          <div className="entry-meta">
            <span className="entry-phase">{phase}</span>
            <span className="entry-actor">
              {roleIcon} {actor}
            </span>
            <span className="entry-result" style={{ color: resultColor }}>
              {result}
            </span>
          </div>

          {rollbackOf && (
            <div className="entry-rollback-info">
              ↩️ Rollback de: {rollbackOf.slice(0, 8)}...
            </div>
          )}

          {canRollback && onRollback && (
            <button
              className="btn-rollback"
              onClick={e => {
                e.stopPropagation();
                onRollback();
              }}
            >
              ↩️ Annuler
            </button>
          )}
        </div>
      </div>
    );
  }
);

HistoryEntryCard.displayName = 'HistoryEntryCard';

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const EvolutionHistory: React.FC<EvolutionHistoryProps> = ({
  entries,
  maxEntries = 50,
  onEntryClick,
  onRollback,
  className = '',
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply result filter
    if (filter === 'success') {
      filtered = filtered.filter(e => e.result === 'SUCCESS');
    } else if (filter === 'failed') {
      filtered = filtered.filter(e => e.result === 'FAILED' || e.result === 'DENIED');
    } else if (filter === 'rollback') {
      filtered = filtered.filter(e => e.result === 'ROLLED_BACK' || e.rollbackOf);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        e =>
          e.action.toLowerCase().includes(term) ||
          e.phase.toLowerCase().includes(term) ||
          e.id.toLowerCase().includes(term)
      );
    }

    // Sort by timestamp (newest first) and limit
    return filtered.sort((a, b) => b.timestamp - a.timestamp).slice(0, maxEntries);
  }, [entries, filter, searchTerm, maxEntries]);

  const stats = useMemo(
    () => ({
      total: entries.length,
      success: entries.filter(e => e.result === 'SUCCESS').length,
      failed: entries.filter(e => e.result === 'FAILED').length,
      rollbacks: entries.filter(e => e.result === 'ROLLED_BACK').length,
    }),
    [entries]
  );

  return (
    <div className={`evolution-history ${className}`}>
      <header className="history-header">
        <h3>📜 Historique d'Évolution</h3>
        <div className="history-stats">
          <span className="stat success">{stats.success} ✓</span>
          <span className="stat failed">{stats.failed} ✗</span>
          <span className="stat rollback">{stats.rollbacks} ↩</span>
        </div>
      </header>

      <div className="history-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tout ({stats.total})
          </button>
          <button
            className={`filter-tab ${filter === 'success' ? 'active' : ''}`}
            onClick={() => setFilter('success')}
          >
            Succès
          </button>
          <button
            className={`filter-tab ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            Échecs
          </button>
          <button
            className={`filter-tab ${filter === 'rollback' ? 'active' : ''}`}
            onClick={() => setFilter('rollback')}
          >
            Rollbacks
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="history-list">
        {filteredEntries.length === 0 ? (
          <div className="empty-history">
            <span className="empty-icon">📭</span>
            <p>Aucune entrée trouvée</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <HistoryEntryCard
              key={entry.id}
              entry={entry}
              onClick={() => onEntryClick?.(entry)}
              onRollback={() => onRollback?.(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EvolutionHistory;
