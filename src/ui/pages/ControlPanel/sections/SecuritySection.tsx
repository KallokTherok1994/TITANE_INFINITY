/**
 * TITANE∞ OS - Section Sécurité
 * Permissions et H-N security
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SecurityConfig {
  hn_security_enabled: boolean;
  secure_mode: boolean;
  encryption_enabled: boolean;
  audit_logging: boolean;
}

export const SecuritySection: React.FC = () => {
  const [config, setConfig] = useState<SecurityConfig>({
    hn_security_enabled: true,
    secure_mode: false,
    encryption_enabled: true,
    audit_logging: true
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const securityConfig = await invoke<SecurityConfig>('get_security_config');
      setConfig(securityConfig);
    } catch (error) {
      console.error('Erreur chargement config sécurité:', error);
    }
  };

  const saveConfig = async () => {
    try {
      await invoke('set_security_config', { config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erreur sauvegarde config:', error);
    }
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Sécurité</h2>
        <button className="cp-button" onClick={saveConfig}>
          {saved ? '✅ Sauvegardé' : '💾 Sauvegarder'}
        </button>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Paramètres de sécurité</h3>
        <div className="cp-card-content">
          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">H-N Security</div>
              <div className="cp-switch-description">
                Activer la sécurité Humain-Non Humain
              </div>
            </div>
            <div
              className={`cp-switch ${config.hn_security_enabled ? 'active' : ''}`}
              onClick={() =>
                setConfig({ ...config, hn_security_enabled: !config.hn_security_enabled })
              }
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>

          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Mode sécurisé</div>
              <div className="cp-switch-description">
                Restrictions accrues et validations supplémentaires
              </div>
            </div>
            <div
              className={`cp-switch ${config.secure_mode ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, secure_mode: !config.secure_mode })}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>

          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Chiffrement</div>
              <div className="cp-switch-description">
                Chiffrer les données sensibles localement
              </div>
            </div>
            <div
              className={`cp-switch ${config.encryption_enabled ? 'active' : ''}`}
              onClick={() =>
                setConfig({ ...config, encryption_enabled: !config.encryption_enabled })
              }
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>

          <div className="cp-switch-row">
            <div className="cp-switch-label">
              <div className="cp-switch-title">Audit logging</div>
              <div className="cp-switch-description">
                Enregistrer toutes les actions de sécurité
              </div>
            </div>
            <div
              className={`cp-switch ${config.audit_logging ? 'active' : ''}`}
              onClick={() => setConfig({ ...config, audit_logging: !config.audit_logging })}
            >
              <div className="cp-switch-thumb" />
            </div>
          </div>
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">État de la sécurité</h3>
        <div className="cp-card-content">
          <div className="cp-info-row">
            <span className="cp-info-label">Niveau de sécurité</span>
            <span className="cp-badge success">
              <span className="cp-badge-dot" />
              {config.secure_mode ? 'Élevé' : 'Normal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
