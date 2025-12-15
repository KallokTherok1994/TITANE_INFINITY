/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — CLOUD CENTER PAGE
 *   Interface de gestion Cloud Sync Engine
 *   Vault Status, Sync Config, Logs, Devices
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import VaultStatus from './VaultStatus';
import SyncConfig from './SyncConfig';
import SyncLogs from './SyncLogs';
import DevicesView from './DevicesView';
import './CloudCenter.css';

// Types (re-exported from types.ts)
import type { CloudStatus, SyncResult } from './types';

export type { CloudStatus, SyncResult, DeviceIdentity, SyncLogEntry } from './types';

type TabId = 'vault' | 'config' | 'logs' | 'devices';

const CloudCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('vault');
  const [status, setStatus] = useState<CloudStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Passphrase pour l'initialisation
  const [passphrase, setPassphrase] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [showInitForm, setShowInitForm] = useState(false);

  // Charger le statut initial
  const loadStatus = useCallback(async () => {
    try {
      const result = await invoke<CloudStatus>('cloud_get_status');
      setStatus(result);
      setInitialized(result.initialized);
    } catch (err) {
      console.error('[CloudCenter] Failed to load status:', err);
      setInitialized(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Initialiser le Cloud Sync
  const handleInitialize = async () => {
    if (!passphrase || !deviceName) {
      setError("Veuillez entrer un mot de passe et un nom d'appareil");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invoke<CloudStatus>('cloud_init', {
        passphrase,
        deviceName,
      });
      setStatus(result);
      setInitialized(true);
      setShowInitForm(false);
      setPassphrase('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser (Push)
  const handleSyncPush = async () => {
    setLoading(true);
    setError(null);

    try {
      await invoke<SyncResult>('cloud_sync_push');
      await loadStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser (Pull)
  const handleSyncPull = async () => {
    setLoading(true);
    setError(null);

    try {
      await invoke<SyncResult>('cloud_sync_pull');
      await loadStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Vérifier l'intégrité
  const handleVerifyIntegrity = async () => {
    setLoading(true);
    setError(null);

    try {
      const isValid = await invoke<boolean>('cloud_verify_integrity');
      if (isValid) {
        alert("✅ L'intégrité du vault est validée");
      } else {
        setError("⚠️ Le vault présente des problèmes d'intégrité");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Créer une sauvegarde
  const handleBackup = async () => {
    setLoading(true);
    setError(null);

    try {
      const backupPath = await invoke<string>('cloud_backup_vault');
      alert(`✅ Sauvegarde créée: ${backupPath}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'vault', label: 'Vault Status', icon: '🔐' },
    { id: 'config', label: 'Configuration', icon: '⚙️' },
    { id: 'logs', label: 'Sync Logs', icon: '📋' },
    { id: 'devices', label: 'Appareils', icon: '💻' },
  ];

  // Formulaire d'initialisation
  if (!initialized) {
    return (
      <div className="cloud-center">
        <header className="cloud-header">
          <h1>☁️ TITANE∞ Cloud Center</h1>
          <p className="subtitle">Vault chiffré & synchronisation multi-device</p>
        </header>

        <div className="init-container">
          {!showInitForm ? (
            <div className="init-welcome">
              <div className="init-icon">🔐</div>
              <h2>Cloud Sync Engine v∞</h2>
              <p>
                Synchronisez vos données de manière sécurisée entre vos appareils.
                <br />
                Chiffrement AES-256-GCM + signatures Ed25519.
              </p>
              <button className="btn-primary" onClick={() => setShowInitForm(true)}>
                Initialiser le Cloud Sync
              </button>
            </div>
          ) : (
            <div className="init-form">
              <h2>🔑 Initialisation du Vault</h2>

              <div className="form-group">
                <label htmlFor="deviceName">Nom de l'appareil</label>
                <input
                  id="deviceName"
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  placeholder="Ex: Pop!_OS Laptop"
                />
              </div>

              <div className="form-group">
                <label htmlFor="passphrase">Mot de passe du Vault</label>
                <input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                  placeholder="Mot de passe fort..."
                />
                <small>
                  Ce mot de passe chiffre votre vault localement.
                  <br />
                  Il ne sera jamais synchronisé.
                </small>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowInitForm(false)}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  className="btn-primary"
                  onClick={handleInitialize}
                  disabled={loading || !passphrase || !deviceName}
                >
                  {loading ? 'Initialisation...' : 'Initialiser'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cloud-center">
      <header className="cloud-header">
        <div className="header-left">
          <h1>☁️ TITANE∞ Cloud Center</h1>
          <span
            className={`status-badge status-${status?.status?.toLowerCase() || 'idle'}`}
          >
            {status?.status || 'Idle'}
          </span>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={handleVerifyIntegrity}
            disabled={loading}
            title="Vérifier l'intégrité"
          >
            🔍
          </button>
          <button
            className="btn-icon"
            onClick={handleBackup}
            disabled={loading}
            title="Créer une sauvegarde"
          >
            💾
          </button>
          <button
            className="btn-secondary"
            onClick={handleSyncPull}
            disabled={loading || status?.status === 'Syncing'}
          >
            ⬇️ Pull
          </button>
          <button
            className="btn-primary"
            onClick={handleSyncPush}
            disabled={loading || status?.status === 'Syncing'}
          >
            ⬆️ Push
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <nav className="cloud-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="cloud-content">
        {activeTab === 'vault' && <VaultStatus status={status} onRefresh={loadStatus} />}
        {activeTab === 'config' && <SyncConfig status={status} onUpdate={loadStatus} />}
        {activeTab === 'logs' && <SyncLogs />}
        {activeTab === 'devices' && <DevicesView />}
      </main>
    </div>
  );
};

// Export nommé et par défaut
export { CloudCenter };
export default CloudCenter;
