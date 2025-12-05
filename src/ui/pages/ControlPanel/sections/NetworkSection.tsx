/**
 * TITANE∞ OS - Section Réseau
 * Configuration connectivité et proxy
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';

interface NetworkConfig {
  online_mode: boolean;
  proxy_enabled: boolean;
  proxy_url: string;
  auto_sync: boolean;
}

export const NetworkSection: React.FC = () => {
  const [config, setConfig] = useState<NetworkConfig>({
    online_mode: true,
    proxy_enabled: false,
    proxy_url: '',
    auto_sync: true
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const networkConfig = await secureInvoke<NetworkConfig>('get_network_config');
      setConfig(networkConfig);
    } catch (error) {
      console.error('Erreur chargement config réseau:', error);
    }
  };

  const saveConfig = async () => {
    try {
      await secureInvoke('set_network_config', { config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Réseau</h2>
        <button className="cp-button" onClick={saveConfig}>
          {saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Configuration</h3>
        <div className="cp-card-content">
          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Mode en ligne</div>
              <div className="cp-switch-description">
                Activer les fonctionnalités en ligne (APIs, sync)
              </div>
            </div>
            <div
              className={`cp-switch ${config.online_mode ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, online_mode: !config.online_mode })}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>

          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Synchronisation automatique</div>
              <div className="cp-switch-description">
                Synchroniser les données automatiquement
              </div>
            </div>
            <div
              className={`cp-switch ${config.auto_sync ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, auto_sync: !config.auto_sync })}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Configuration proxy</h3>
        <div className="cp-card-content">
          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Activer le proxy</div>
            </div>
            <div
              className={`cp-switch ${config.proxy_enabled ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, proxy_enabled: !config.proxy_enabled })}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>

          {config.proxy_enabled && (
            <div className="cp-input-group">
              <label className="cp-input-label">URL du proxy</label>
              <input
                type="text"
                className="cp-input"
                value={config.proxy_url}
                onChange={(e) => setConfig({ ...config, proxy_url: e.target.value })}
                placeholder="http://proxy.example.com:8080"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
