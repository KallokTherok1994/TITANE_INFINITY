/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — SYNC LOGS COMPONENT
 *   Historique des synchronisations
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SyncLogEntry, SyncHistoryEntry } from './types';

interface SyncHistoryResponse {
  entries: SyncHistoryEntry[];
  total_count: number;
}

const SyncLogs: React.FC = () => {
  const [logs, setLogs] = useState<SyncHistoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'push' | 'pull' | 'error'>('all');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await invoke<SyncHistoryResponse>('cloud_get_sync_history', {
        limit: 100,
      });
      setLogs(result.entries);
      setTotalCount(result.total_count);
    } catch (err) {
      console.error('[SyncLogs] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'push') return log.direction === 'Push';
    if (filter === 'pull') return log.direction === 'Pull';
    if (filter === 'error') return log.status === 'Error';
    return true;
  });

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Success':
        return '✅';
      case 'Error':
        return '❌';
      case 'Conflict':
        return '⚠️';
      case 'Syncing':
        return '🔄';
      default:
        return '❓';
    }
  };

  const getDirectionIcon = (direction: string): string => {
    switch (direction) {
      case 'Push':
        return '⬆️';
      case 'Pull':
        return '⬇️';
      case 'Bidirectional':
        return '↕️';
      default:
        return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="sync-logs loading">
        <div className="loader">🔄 Chargement des logs...</div>
      </div>
    );
  }

  return (
    <div className="sync-logs">
      <div className="logs-header">
        <div className="logs-info">
          <span className="logs-count">
            {filteredLogs.length} / {totalCount} entrées
          </span>
        </div>
        <div className="logs-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'push' ? 'active' : ''}`}
            onClick={() => setFilter('push')}
          >
            ⬆️ Push
          </button>
          <button
            className={`filter-btn ${filter === 'pull' ? 'active' : ''}`}
            onClick={() => setFilter('pull')}
          >
            ⬇️ Pull
          </button>
          <button
            className={`filter-btn ${filter === 'error' ? 'active' : ''}`}
            onClick={() => setFilter('error')}
          >
            ❌ Erreurs
          </button>
          <button className="btn-icon-sm" onClick={loadLogs} title="Rafraîchir">
            🔄
          </button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="logs-empty">
          <div className="empty-icon">📋</div>
          <p>Aucun log de synchronisation</p>
          <small>Les synchronisations apparaîtront ici</small>
        </div>
      ) : (
        <div className="logs-list">
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`log-entry status-${log.status.toLowerCase()}`}
            >
              <div className="log-main">
                <div className="log-icons">
                  <span className="direction-icon">{getDirectionIcon(log.direction)}</span>
                  <span className="status-icon">{getStatusIcon(log.status)}</span>
                </div>
                <div className="log-details">
                  <div className="log-title">
                    <span className="log-direction">
                      {log.direction === 'Push' ? 'Export' : 'Import'}
                    </span>
                    <span className="log-revision">Rev. {log.revision}</span>
                  </div>
                  <div className="log-timestamp">{formatDate(log.timestamp)}</div>
                </div>
                <div className="log-meta">
                  <span className="log-duration">{formatDuration(log.duration_ms)}</span>
                  {log.conflicts_resolved > 0 && (
                    <span className="log-conflicts">
                      ⚔️ {log.conflicts_resolved} conflit(s)
                    </span>
                  )}
                </div>
              </div>
              {log.error_message && (
                <div className="log-error">
                  <span className="error-label">Erreur:</span>
                  <span className="error-message">{log.error_message}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SyncLogs;
