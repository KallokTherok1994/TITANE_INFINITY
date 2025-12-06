/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — DEVICES VIEW COMPONENT
 *   Gestion des appareils connectés
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DeviceIdentity } from './types';

interface DevicesResponse {
  local_device: DeviceIdentity | null;
  known_devices: DeviceIdentity[];
}

const DevicesView: React.FC = () => {
  const [localDevice, setLocalDevice] = useState<DeviceIdentity | null>(null);
  const [knownDevices, setKnownDevices] = useState<DeviceIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const result = await invoke<DevicesResponse>('cloud_get_devices');
      setLocalDevice(result.local_device);
      setKnownDevices(result.known_devices);
    } catch (err) {
      console.error('[DevicesView] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir retirer l'appareil "${deviceId}" ?`)) {
      return;
    }

    setRemoving(deviceId);
    try {
      await invoke('cloud_remove_device', { deviceId });
      await loadDevices();
    } catch (err) {
      console.error('[DevicesView] Failed to remove device:', err);
      alert(`Erreur: ${err}`);
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateStr: string): string => {
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

  const getOsIcon = (os: string): string => {
    const osLower = os.toLowerCase();
    if (osLower.includes('linux')) return '🐧';
    if (osLower.includes('windows')) return '🪟';
    if (osLower.includes('mac') || osLower.includes('darwin')) return '🍎';
    if (osLower.includes('android')) return '🤖';
    if (osLower.includes('ios')) return '📱';
    return '💻';
  };

  const truncateKey = (key: string): string => {
    if (key.length <= 16) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="devices-view loading">
        <div className="loader">🔄 Chargement des appareils...</div>
      </div>
    );
  }

  return (
    <div className="devices-view">
      {/* Appareil local */}
      {localDevice && (
        <section className="devices-section">
          <h3>🏠 Cet Appareil</h3>
          <div className="device-card local">
            <div className="device-icon">
              {getOsIcon(localDevice.os)}
            </div>
            <div className="device-info">
              <div className="device-name">{localDevice.device_name}</div>
              <div className="device-id">{localDevice.device_id}</div>
              <div className="device-os">
                {localDevice.os} ({localDevice.os_version})
              </div>
            </div>
            <div className="device-meta">
              <div className="meta-item">
                <span className="meta-label">Première connexion</span>
                <span className="meta-value">{formatDate(localDevice.first_seen)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Dernière activité</span>
                <span className="meta-value">{formatDate(localDevice.last_seen)}</span>
              </div>
            </div>
            <div className="device-key">
              <span className="key-label">🔑 Clé publique</span>
              <code className="key-value" title={localDevice.public_key}>
                {truncateKey(localDevice.public_key)}
              </code>
              <button
                className="btn-copy"
                onClick={() => navigator.clipboard.writeText(localDevice.public_key)}
                title="Copier la clé"
              >
                📋
              </button>
            </div>
            <div className="device-fingerprint">
              <span className="fingerprint-label">🔏 Fingerprint</span>
              <code className="fingerprint-value">{localDevice.fingerprint}</code>
            </div>
          </div>
        </section>
      )}

      {/* Appareils connus */}
      <section className="devices-section">
        <div className="section-header">
          <h3>🌐 Appareils Synchronisés</h3>
          <button className="btn-icon-sm" onClick={loadDevices} title="Rafraîchir">
            🔄
          </button>
        </div>

        {knownDevices.length === 0 ? (
          <div className="devices-empty">
            <div className="empty-icon">💻</div>
            <p>Aucun autre appareil détecté</p>
            <small>
              Les appareils apparaîtront ici après la première synchronisation
            </small>
          </div>
        ) : (
          <div className="devices-grid">
            {knownDevices
              .filter((d) => d.device_id !== localDevice?.device_id)
              .map((device) => (
                <div
                  key={device.device_id}
                  className={`device-card ${device.trusted ? 'trusted' : 'untrusted'}`}
                >
                  <div className="device-header">
                    <div className="device-icon">
                      {getOsIcon(device.os)}
                    </div>
                    <div className="device-status">
                      {device.trusted ? (
                        <span className="status-trusted" title="Appareil de confiance">✓</span>
                      ) : (
                        <span className="status-untrusted" title="Non vérifié">?</span>
                      )}
                    </div>
                  </div>
                  <div className="device-info">
                    <div className="device-name">{device.device_name}</div>
                    <div className="device-id">{device.device_id}</div>
                    <div className="device-os">
                      {device.os} ({device.os_version})
                    </div>
                  </div>
                  <div className="device-meta compact">
                    <div className="meta-item">
                      <span className="meta-label">Dernière sync</span>
                      <span className="meta-value">{formatDate(device.last_seen)}</span>
                    </div>
                  </div>
                  <div className="device-fingerprint compact">
                    <span className="fingerprint-label">🔏</span>
                    <code className="fingerprint-value">{device.fingerprint}</code>
                  </div>
                  <div className="device-actions">
                    <button
                      className="btn-danger-sm"
                      onClick={() => handleRemoveDevice(device.device_id)}
                      disabled={removing === device.device_id}
                    >
                      {removing === device.device_id ? '...' : '🗑️ Retirer'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Aide */}
      <section className="devices-help">
        <h4>ℹ️ À propos des appareils</h4>
        <ul>
          <li>Chaque appareil possède une paire de clés Ed25519 unique</li>
          <li>La clé privée ne quitte jamais l'appareil</li>
          <li>Seule la clé publique est partagée pour vérifier les signatures</li>
          <li>Retirer un appareil l'empêche de synchroniser ses modifications</li>
        </ul>
      </section>
    </div>
  );
};

export default DevicesView;
