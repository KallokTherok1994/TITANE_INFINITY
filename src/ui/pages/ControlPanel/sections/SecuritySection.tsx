/**
 * TITANE∞ OS v24.7 - Section Sécurité
 * Permissions et H-N security
 * Optimisé avec useControlPanelToggles
 */

import React, { useCallback } from 'react';
import { useControlPanelSection } from '@/hooks/useControlPanelSection';

interface SecurityConfig {
  hn_security_enabled: boolean;
  secure_mode: boolean;
  encryption_enabled: boolean;
  audit_logging: boolean;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  hn_security_enabled: true,
  secure_mode: false,
  encryption_enabled: true,
  audit_logging: true,
};

const SECURITY_TOGGLES = [
  {
    key: 'hn_security_enabled' as const,
    title: 'H-N Security',
    description: 'Activer la sécurité Humain-Non Humain',
  },
  {
    key: 'secure_mode' as const,
    title: 'Mode sécurisé',
    description: 'Restrictions accrues et validations supplémentaires',
  },
  {
    key: 'encryption_enabled' as const,
    title: 'Chiffrement',
    description: 'Chiffrer les données sensibles localement',
  },
  {
    key: 'audit_logging' as const,
    title: 'Audit logging',
    description: 'Enregistrer toutes les actions de sécurité',
  },
] as const;

export const SecuritySection: React.FC = () => {
  const { config, setConfig, saveConfig, isSaving, saved, error, hasChanges } =
    useControlPanelSection<SecurityConfig>({
      loadCommand: 'get_security_config',
      saveCommand: 'set_security_config',
      defaultConfig: DEFAULT_SECURITY_CONFIG,
      saveParamKey: 'config',
    });

  const toggleField = useCallback(
    (key: keyof SecurityConfig) => {
      setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    },
    [setConfig]
  );

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Sécurité</h2>
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
        <h3 className="cp-card-title">Paramètres de sécurité</h3>
        <div className="cp-card-content">
          {SECURITY_TOGGLES.map(({ key, title, description }) => (
            <div key={key} className="cp-switch-row">
              <div className="cp-switch-label">
                <div className="cp-switch-title">{title}</div>
                <div className="cp-switch-description">{description}</div>
              </div>
              <div
                className={`cp-switch ${config[key] ? 'active' : ''}`}
                onClick={() => toggleField(key)}
                role="switch"
                aria-checked={config[key]}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleField(key);
                  }
                }}
              >
                <div className="cp-switch-thumb" />
              </div>
            </div>
          ))}
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
