/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — VAULT STATUS COMPONENT
 *   Affiche l'état du vault chiffré
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { CloudStatus } from './types';

interface BackupInfo {
  path: string;
  filename: string;
  created_timestamp: number;
  size_bytes: number;
}

interface HealReport {
  vault_healthy: boolean;
  issues_found: string[];
  actions_taken: string[];
  backup_created: boolean;
  backup_path: string | null;
}

interface VaultStatusProps {
  status: CloudStatus | null;
  onRefresh: () => void;
}

const VaultStatus: React.FC<VaultStatusProps> = ({ status, onRefresh }) => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isHealing, setIsHealing] = useState(false);
  const [healReport, setHealReport] = useState<HealReport | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const list = (await tauriClient.cloudListBackups()) as BackupInfo[];
      setBackups(list);
    } catch (e) {
      console.error('[VaultStatus] Failed to load backups:', e);
    }
  };

  const handleAutoHeal = async () => {
    setIsHealing(true);
    try {
      const report = (await tauriClient.cloudAutoHeal()) as HealReport;
      setHealReport(report);
      if (report.backup_created) {
        await loadBackups();
      }
      onRefresh();
    } catch (e) {
      console.error('[VaultStatus] Auto-heal failed:', e);
    } finally {
      setIsHealing(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await tauriClient.cloudBackupVault();
      await loadBackups();
    } catch (e) {
      console.error('[VaultStatus] Backup failed:', e);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (path: string) => {
    if (!confirm('Restaurer cette sauvegarde ? Les données actuelles seront écrasées.'))
      return;
    try {
      await tauriClient.cloudRestoreVault({ backupPath: path });
      onRefresh();
    } catch (e) {
      console.error('[VaultStatus] Restore failed:', e);
    }
  };

  const formatBytes = (bytes: number | null): string => {
    if (bytes === null || bytes === undefined) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Jamais';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusIcon = (statusValue: string | null): string => {
    switch (statusValue) {
      case 'Idle':
        return '⏸️';
      case 'Syncing':
        return '🔄';
      case 'Success':
        return '✅';
      case 'Error':
        return '❌';
      case 'Conflict':
        return '⚠️';
      case 'Corrupted':
        return '🔥';
      default:
        return '❓';
    }
  };

  return (
    <div className="vault-status">
      <div className="status-grid">
        {/* Carte principale du vault */}
        <div className="status-card vault-main">
          <div className="card-header">
            <h3>🔐 Vault Chiffré</h3>
            <button className="btn-icon-sm" onClick={onRefresh} title="Rafraîchir">
              🔄
            </button>
          </div>
          <div className="card-content">
            <div className="vault-visual">
              <div className={`vault-icon ${status?.vault_loaded ? 'loaded' : 'empty'}`}>
                {status?.vault_loaded ? '🔒' : '📦'}
              </div>
              <div className="vault-info">
                <span className="vault-state">
                  {status?.vault_loaded ? 'Vault chargé' : 'Vault non chargé'}
                </span>
                <span className="vault-revision">
                  Révision: {status?.vault_revision ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statut de synchronisation */}
        <div className="status-card sync-status">
          <div className="card-header">
            <h3>☁️ Statut Sync</h3>
          </div>
          <div className="card-content">
            <div className="sync-indicator">
              <span className="sync-icon">{getStatusIcon(status?.status ?? null)}</span>
              <span className="sync-label">{status?.status ?? 'Inconnu'}</span>
            </div>
            <div className="sync-details">
              <div className="detail-row">
                <span className="detail-label">Dernière sync:</span>
                <span className="detail-value">
                  {formatDate(status?.last_sync ?? null)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Backend:</span>
                <span className="detail-value">
                  {status?.backend === 'LocalFolder' && '📁 Dossier local'}
                  {status?.backend === 'S3Private' && '☁️ S3 Privé'}
                  {status?.backend === 'P2P' && '🔗 P2P'}
                  {!status?.backend && 'Non configuré'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mode:</span>
                <span className="detail-value">
                  {status?.sync_mode === 'Manual' && '🖐️ Manuel'}
                  {status?.sync_mode === 'Auto' && '🔄 Automatique'}
                  {status?.sync_mode === 'Disabled' && '⛔ Désactivé'}
                  {!status?.sync_mode && 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations appareil */}
        <div className="status-card device-info">
          <div className="card-header">
            <h3>💻 Cet Appareil</h3>
          </div>
          <div className="card-content">
            <div className="device-details">
              <div className="detail-row">
                <span className="detail-label">ID:</span>
                <span className="detail-value mono">{status?.device_id ?? 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nom:</span>
                <span className="detail-value">{status?.device_name ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="status-card security-info">
          <div className="card-header">
            <h3>🛡️ Sécurité</h3>
          </div>
          <div className="card-content">
            <div className="security-badges">
              <div className="security-badge active">
                <span className="badge-icon">🔐</span>
                <span className="badge-label">AES-256-GCM</span>
              </div>
              <div className="security-badge active">
                <span className="badge-icon">🔑</span>
                <span className="badge-label">Argon2id</span>
              </div>
              <div className="security-badge active">
                <span className="badge-icon">✍️</span>
                <span className="badge-label">Ed25519</span>
              </div>
              <div className="security-badge active">
                <span className="badge-icon">📦</span>
                <span className="badge-label">GZIP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="status-card stats-info">
          <div className="card-header">
            <h3>📊 Statistiques</h3>
          </div>
          <div className="card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{status?.vault_revision ?? 0}</span>
                <span className="stat-label">Révisions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {formatBytes(status?.vault_size_bytes ?? null)}
                </span>
                <span className="stat-label">Taille</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Heal */}
        <div className="status-card heal-info">
          <div className="card-header">
            <h3>🩺 Auto-Heal</h3>
          </div>
          <div className="card-content">
            <button
              className="btn-primary"
              onClick={handleAutoHeal}
              disabled={isHealing || !status?.initialized}
            >
              {isHealing ? '🔍 Analyse en cours...' : '🩺 Lancer diagnostic'}
            </button>
            {healReport && (
              <div
                className={`heal-report ${healReport.vault_healthy ? 'healthy' : 'warning'}`}
              >
                <div className="report-status">
                  {healReport.vault_healthy ? '✅ Vault sain' : '⚠️ Problèmes détectés'}
                </div>
                {healReport.issues_found.length > 0 && (
                  <ul className="issues-list">
                    {healReport.issues_found.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sauvegardes */}
        <div className="status-card backups-info">
          <div className="card-header">
            <h3>💾 Sauvegardes</h3>
            <button
              className="btn-icon-sm"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || !status?.initialized}
              title="Créer une sauvegarde"
            >
              {isCreatingBackup ? '⏳' : '➕'}
            </button>
          </div>
          <div className="card-content">
            {backups.length === 0 ? (
              <div className="no-backups">Aucune sauvegarde disponible</div>
            ) : (
              <div className="backups-list">
                {backups.slice(0, 5).map((backup, i) => (
                  <div key={i} className="backup-item">
                    <div className="backup-info">
                      <span className="backup-name">{backup.filename}</span>
                      <span className="backup-meta">
                        {formatBytes(backup.size_bytes)} •{' '}
                        {new Date(backup.created_timestamp * 1000).toLocaleDateString(
                          'fr-FR'
                        )}
                      </span>
                    </div>
                    <button
                      className="btn-icon-xs"
                      onClick={() => handleRestoreBackup(backup.path)}
                      title="Restaurer"
                    >
                      🔄
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultStatus;
