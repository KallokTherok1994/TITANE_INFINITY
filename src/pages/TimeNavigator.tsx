/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   TIME NAVIGATOR — Super-Prompt N6
 *   Interface de navigation temporelle + restore
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './TimeNavigator.css';

interface Snapshot {
  id: string;
  timestamp: number;
  version: string;
  size: number;
  checksum: string;
  context: SnapshotContext;
}

interface SnapshotContext {
  xp: number;
  level: number;
  activeEngines: string[];
  designSystem: string;
  personaMood: string;
}

interface TravelStats {
  totalSnapshots: number;
  ramCacheSize: number;
  diskUsageBytes: number;
  oldestSnapshot: number;
  newestSnapshot: number;
}

export const TimeNavigator: React.FC = () => {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [stats, setStats] = useState<TravelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSnapshot, setCompareSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    loadSnapshots();
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      // TODO: Appeler commande Tauri list_snapshots
      const response = await invoke<Snapshot[]>('list_snapshots');
      setSnapshots(response.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Appeler commande Tauri get_travel_stats
      const response = await invoke<TravelStats>('get_travel_stats');
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRestore = async (snapshot: Snapshot) => {
    if (!window.confirm(`Restaurer l'état du ${formatDate(snapshot.timestamp)} ?\n\nCette action nécessite les permissions ROOT.`)) {
      return;
    }

    try {
      setLoading(true);
      await invoke('restore_snapshot', { snapshotId: snapshot.id });
      alert('✅ Restauration réussie ! Redémarrage requis.');
      // TODO: Recharger l'application
      window.location.reload();
    } catch (error) {
      alert(`❌ Erreur lors de la restauration: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (snapshot: Snapshot) => {
    if (!window.confirm(`Supprimer le snapshot du ${formatDate(snapshot.timestamp)} ?`)) {
      return;
    }

    try {
      await invoke('delete_snapshot', { snapshotId: snapshot.id });
      loadSnapshots();
    } catch (error) {
      alert(`❌ Erreur: ${error}`);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('fr-FR');
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const renderTimeline = () => {
    return (
      <div className="timeline">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.id}
            className={`timeline-item ${selectedSnapshot?.id === snapshot.id ? 'selected' : ''}`}
            onClick={() => setSelectedSnapshot(snapshot)}
          >
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-time">{formatDate(snapshot.timestamp)}</div>
              <div className="timeline-version">Version {snapshot.version}</div>
              <div className="timeline-context">
                Level {snapshot.context.level} | XP {snapshot.context.xp} | {snapshot.context.personaMood}
              </div>
              <div className="timeline-size">{formatSize(snapshot.size)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSnapshotDetails = () => {
    if (!selectedSnapshot) {
      return <div className="no-selection">Sélectionnez un snapshot</div>;
    }

    return (
      <div className="snapshot-details">
        <h3>📸 Snapshot Details</h3>

        <div className="detail-section">
          <h4>Métadonnées</h4>
          <table>
            <tbody>
              <tr>
                <td>ID:</td>
                <td><code>{selectedSnapshot.id}</code></td>
              </tr>
              <tr>
                <td>Timestamp:</td>
                <td>{formatDate(selectedSnapshot.timestamp)}</td>
              </tr>
              <tr>
                <td>Version:</td>
                <td>{selectedSnapshot.version}</td>
              </tr>
              <tr>
                <td>Size:</td>
                <td>{formatSize(selectedSnapshot.size)}</td>
              </tr>
              <tr>
                <td>Checksum:</td>
                <td><code>{selectedSnapshot.checksum.substring(0, 16)}...</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="detail-section">
          <h4>Contexte</h4>
          <table>
            <tbody>
              <tr>
                <td>Level:</td>
                <td>{selectedSnapshot.context.level}</td>
              </tr>
              <tr>
                <td>XP:</td>
                <td>{selectedSnapshot.context.xp}</td>
              </tr>
              <tr>
                <td>Active Engines:</td>
                <td>{selectedSnapshot.context.activeEngines.join(', ')}</td>
              </tr>
              <tr>
                <td>Design System:</td>
                <td>{selectedSnapshot.context.designSystem}</td>
              </tr>
              <tr>
                <td>Persona Mood:</td>
                <td>{selectedSnapshot.context.personaMood}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="detail-actions">
          <button
            className="btn-restore"
            onClick={() => handleRestore(selectedSnapshot)}
            disabled={loading}
          >
            🔄 Restore
          </button>
          <button
            className="btn-compare"
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareSnapshot(selectedSnapshot);
            }}
          >
            🔍 Compare
          </button>
          <button
            className="btn-delete"
            onClick={() => handleDelete(selectedSnapshot)}
            disabled={loading}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="travel-stats">
        <h3>📊 Time-Travel Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Snapshots:</span>
            <span className="stat-value">{stats.totalSnapshots}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">RAM Cache:</span>
            <span className="stat-value">{stats.ramCacheSize}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Disk Usage:</span>
            <span className="stat-value">{formatSize(stats.diskUsageBytes)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Oldest:</span>
            <span className="stat-value">{formatDate(stats.oldestSnapshot)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Newest:</span>
            <span className="stat-value">{formatDate(stats.newestSnapshot)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="time-navigator">
      <header className="navigator-header">
        <h1>⏱️ Time Navigator</h1>
        <p>Navigate through TITANE∞ state history and restore previous versions</p>
      </header>

      {renderStats()}

      <div className="navigator-content">
        <div className="timeline-container">
          <h2>📜 Timeline</h2>
          {loading ? <div className="loading">Loading...</div> : renderTimeline()}
        </div>

        <div className="details-container">
          {renderSnapshotDetails()}
        </div>
      </div>

      {compareMode && compareSnapshot && (
        <div className="compare-panel">
          <h3>🔍 Compare Mode</h3>
          <p>Compare functionality coming soon...</p>
        </div>
      )}
    </div>
  );
};
