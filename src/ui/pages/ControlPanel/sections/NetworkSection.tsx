/**
 * TITANE∞ OS v24.7 - Section Réseau
 * Configuration connectivité et proxy
 * Optimisé avec ControlPanelToggle
 */

import React, { useCallback } from 'react';
import { useControlPanelSection } from '@/hooks/useControlPanelSection';
import { ControlPanelToggle } from '../components/ControlPanelToggle';

interface NetworkConfig {
  online_mode: boolean;
  proxy_enabled: boolean;
  proxy_url: string;
  auto_sync: boolean;
}

const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  online_mode: true,
  proxy_enabled: false,
  proxy_url: '',
  auto_sync: true,
};

export const NetworkSection: React.FC = () => {
  const { config, setConfig, saveConfig, isSaving, saved, error, hasChanges } =
    useControlPanelSection<NetworkConfig>({
      loadCommand: 'get_network_config',
      saveCommand: 'set_network_config',
      defaultConfig: DEFAULT_NETWORK_CONFIG,
      saveParamKey: 'config',
    });

  const toggleOnlineMode = useCallback(() => {
    setConfig(prev => ({ ...prev, online_mode: !prev.online_mode }));
  }, [setConfig]);

  const toggleAutoSync = useCallback(() => {
    setConfig(prev => ({ ...prev, auto_sync: !prev.auto_sync }));
  }, [setConfig]);

  const toggleProxy = useCallback(() => {
    setConfig(prev => ({ ...prev, proxy_enabled: !prev.proxy_enabled }));
  }, [setConfig]);

  const updateProxyUrl = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfig(prev => ({ ...prev, proxy_url: e.target.value }));
    },
    [setConfig]
  );

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Réseau</h2>
        <button
          className="cp-button"
          onClick={saveConfig}
          disabled={isSaving || !hasChanges}
        >
          {saved ? '✅ Sauvegardé' : isSaving ? '⏳ Enregistrement…' : '💾 Sauvegarder'}
        </button>
      </div>

      {error && <p className="cp-error">{error}</p>}

      <div className="cp-card">
        <h3 className="cp-card-title">Configuration</h3>
        <div className="cp-card-content">
          <ControlPanelToggle
            checked={config.online_mode}
            onChange={toggleOnlineMode}
            title="Mode en ligne"
            description="Activer les fonctionnalités en ligne (APIs, sync)"
          />
          <ControlPanelToggle
            checked={config.auto_sync}
            onChange={toggleAutoSync}
            title="Synchronisation automatique"
            description="Synchroniser les données automatiquement"
          />
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Configuration proxy</h3>
        <div className="cp-card-content">
          <ControlPanelToggle
            checked={config.proxy_enabled}
            onChange={toggleProxy}
            title="Activer le proxy"
          />

          {config.proxy_enabled && (
            <div className="cp-input-group">
              <label className="cp-input-label">URL du proxy</label>
              <input
                type="text"
                className="cp-input"
                value={config.proxy_url}
                onChange={updateProxyUrl}
                placeholder="http://proxy.example.com:8080"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
