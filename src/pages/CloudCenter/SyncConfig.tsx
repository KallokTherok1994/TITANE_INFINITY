/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — SYNC CONFIG COMPONENT
 *   Configuration de la synchronisation cloud
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CloudStatus } from './types';

interface SyncConfigProps {
  status: CloudStatus | null;
  onUpdate: () => void;
}

interface CloudConfig {
  backend: 'local_folder' | 's3_private' | 'p2p';
  mode: 'manual' | 'auto' | 'disabled';
  conflict_resolution: 'last_write_wins' | 'kevin_override' | 'strategic_merge';
  sync_folder_path: string;
  s3_endpoint: string;
  s3_bucket: string;
  auto_sync_interval_secs: number;
  limit_during_training: boolean;
  limit_during_dev_mode: boolean;
  compression_enabled: boolean;
}

const SyncConfig: React.FC<SyncConfigProps> = ({ status, onUpdate }) => {
  const [config, setConfig] = useState<CloudConfig>({
    backend: 'local_folder',
    mode: 'manual',
    conflict_resolution: 'last_write_wins',
    sync_folder_path: '',
    s3_endpoint: '',
    s3_bucket: '',
    auto_sync_interval_secs: 300,
    limit_during_training: true,
    limit_during_dev_mode: true,
    compression_enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Charger la config depuis le status
  useEffect(() => {
    if (status) {
      setConfig(prev => ({
        ...prev,
        backend:
          status.backend === 'LocalFolder'
            ? 'local_folder'
            : status.backend === 'S3Private'
              ? 's3_private'
              : 'p2p',
        mode:
          status.sync_mode === 'Manual'
            ? 'manual'
            : status.sync_mode === 'Auto'
              ? 'auto'
              : 'disabled',
      }));
    }
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await invoke('cloud_update_config', {
        backend: config.backend,
        mode: config.mode,
        conflictResolution: config.conflict_resolution,
        syncFolderPath: config.sync_folder_path || null,
        s3Endpoint: config.s3_endpoint || null,
        s3Bucket: config.s3_bucket || null,
        autoSyncIntervalSecs: config.auto_sync_interval_secs,
        limitDuringTraining: config.limit_during_training,
        limitDuringDevMode: config.limit_during_dev_mode,
        compressionEnabled: config.compression_enabled,
      });
      setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès!' });
      onUpdate();
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sync-config">
      {message && (
        <div className={`config-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="config-sections">
        {/* Backend de synchronisation */}
        <section className="config-section">
          <h3>🌐 Backend de Synchronisation</h3>
          <div className="config-options">
            <label
              className={`option-card ${config.backend === 'local_folder' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="backend"
                value="local_folder"
                checked={config.backend === 'local_folder'}
                onChange={_e => setConfig({ ...config, backend: 'local_folder' })}
              />
              <div className="option-content">
                <span className="option-icon">📁</span>
                <span className="option-title">Dossier Local</span>
                <span className="option-desc">
                  Syncthing, Nextcloud, Google Drive, etc.
                </span>
              </div>
            </label>

            <label
              className={`option-card ${config.backend === 's3_private' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="backend"
                value="s3_private"
                checked={config.backend === 's3_private'}
                onChange={_e => setConfig({ ...config, backend: 's3_private' })}
              />
              <div className="option-content">
                <span className="option-icon">☁️</span>
                <span className="option-title">S3 Privé</span>
                <span className="option-desc">MinIO local ou bucket S3 chiffré</span>
              </div>
            </label>

            <label
              className={`option-card ${config.backend === 'p2p' ? 'selected' : ''} disabled`}
            >
              <input
                type="radio"
                name="backend"
                value="p2p"
                checked={config.backend === 'p2p'}
                onChange={_e => setConfig({ ...config, backend: 'p2p' })}
                disabled
              />
              <div className="option-content">
                <span className="option-icon">🔗</span>
                <span className="option-title">P2P WebRTC</span>
                <span className="option-desc">Device-to-device (bientôt disponible)</span>
              </div>
            </label>
          </div>

          {/* Configuration spécifique au backend */}
          {config.backend === 'local_folder' && (
            <div className="backend-config">
              <div className="form-group">
                <label>Chemin du dossier de synchronisation</label>
                <input
                  type="text"
                  value={config.sync_folder_path}
                  onChange={e =>
                    setConfig({ ...config, sync_folder_path: e.target.value })
                  }
                  placeholder="/home/user/Sync/TITANE_Cloud"
                />
                <small>
                  Ce dossier sera synchronisé par votre outil (Syncthing, Nextcloud, etc.)
                </small>
              </div>
            </div>
          )}

          {config.backend === 's3_private' && (
            <div className="backend-config">
              <div className="form-group">
                <label>Endpoint S3</label>
                <input
                  type="text"
                  value={config.s3_endpoint}
                  onChange={e => setConfig({ ...config, s3_endpoint: e.target.value })}
                  placeholder="https://s3.example.com"
                />
              </div>
              <div className="form-group">
                <label>Bucket</label>
                <input
                  type="text"
                  value={config.s3_bucket}
                  onChange={e => setConfig({ ...config, s3_bucket: e.target.value })}
                  placeholder="titane-vault"
                />
              </div>
              <small>Les credentials S3 sont stockés dans SecureSecretsEngine</small>
            </div>
          )}
        </section>

        {/* Mode de synchronisation */}
        <section className="config-section">
          <h3>⚙️ Mode de Synchronisation</h3>
          <div className="config-options horizontal">
            <label
              className={`option-pill ${config.mode === 'manual' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="mode"
                value="manual"
                checked={config.mode === 'manual'}
                onChange={_e => setConfig({ ...config, mode: 'manual' })}
              />
              <span>🖐️ Manuel</span>
            </label>

            <label className={`option-pill ${config.mode === 'auto' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="mode"
                value="auto"
                checked={config.mode === 'auto'}
                onChange={_e => setConfig({ ...config, mode: 'auto' })}
              />
              <span>🔄 Automatique</span>
            </label>

            <label
              className={`option-pill ${config.mode === 'disabled' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="mode"
                value="disabled"
                checked={config.mode === 'disabled'}
                onChange={_e => setConfig({ ...config, mode: 'disabled' })}
              />
              <span>⛔ Désactivé</span>
            </label>
          </div>

          {config.mode === 'auto' && (
            <div className="form-group">
              <label>Intervalle de synchronisation automatique</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  min={60}
                  max={86400}
                  value={config.auto_sync_interval_secs}
                  onChange={e =>
                    setConfig({
                      ...config,
                      auto_sync_interval_secs: parseInt(e.target.value) || 300,
                    })
                  }
                />
                <span className="suffix">secondes</span>
              </div>
              <small>Minimum: 60s (1 min) — Maximum: 86400s (24h)</small>
            </div>
          )}
        </section>

        {/* Résolution des conflits */}
        <section className="config-section">
          <h3>⚔️ Résolution des Conflits</h3>
          <div className="config-options">
            <label
              className={`option-card small ${config.conflict_resolution === 'last_write_wins' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="conflict"
                value="last_write_wins"
                checked={config.conflict_resolution === 'last_write_wins'}
                onChange={_e =>
                  setConfig({ ...config, conflict_resolution: 'last_write_wins' })
                }
              />
              <div className="option-content">
                <span className="option-title">⏱️ Dernier écrit gagne</span>
                <span className="option-desc">
                  La version la plus récente est conservée
                </span>
              </div>
            </label>

            <label
              className={`option-card small ${config.conflict_resolution === 'kevin_override' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="conflict"
                value="kevin_override"
                checked={config.conflict_resolution === 'kevin_override'}
                onChange={_e =>
                  setConfig({ ...config, conflict_resolution: 'kevin_override' })
                }
              />
              <div className="option-content">
                <span className="option-title">👤 Préférence Kevin</span>
                <span className="option-desc">
                  La version locale est toujours conservée
                </span>
              </div>
            </label>

            <label
              className={`option-card small ${config.conflict_resolution === 'strategic_merge' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="conflict"
                value="strategic_merge"
                checked={config.conflict_resolution === 'strategic_merge'}
                onChange={_e =>
                  setConfig({ ...config, conflict_resolution: 'strategic_merge' })
                }
              />
              <div className="option-content">
                <span className="option-title">🔀 Fusion stratégique</span>
                <span className="option-desc">Fusion intelligente par champ</span>
              </div>
            </label>
          </div>
        </section>

        {/* Options avancées */}
        <section className="config-section">
          <h3>🔧 Options Avancées</h3>
          <div className="toggle-options">
            <label className="toggle-option">
              <input
                type="checkbox"
                checked={config.compression_enabled}
                onChange={e =>
                  setConfig({ ...config, compression_enabled: e.target.checked })
                }
              />
              <span className="toggle-label">
                <span className="toggle-title">Compression GZIP</span>
                <span className="toggle-desc">Réduit la taille du vault</span>
              </span>
            </label>

            <label className="toggle-option">
              <input
                type="checkbox"
                checked={config.limit_during_training}
                onChange={e =>
                  setConfig({ ...config, limit_during_training: e.target.checked })
                }
              />
              <span className="toggle-label">
                <span className="toggle-title">Limiter pendant Training Mode</span>
                <span className="toggle-desc">
                  Évite les conflits pendant l'apprentissage
                </span>
              </span>
            </label>

            <label className="toggle-option">
              <input
                type="checkbox"
                checked={config.limit_during_dev_mode}
                onChange={e =>
                  setConfig({ ...config, limit_during_dev_mode: e.target.checked })
                }
              />
              <span className="toggle-label">
                <span className="toggle-title">Limiter pendant Developer Mode</span>
                <span className="toggle-desc">
                  Préserve l'état de développement local
                </span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <div className="config-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Sauvegarde...' : '💾 Sauvegarder la configuration'}
        </button>
      </div>
    </div>
  );
};

export default SyncConfig;
