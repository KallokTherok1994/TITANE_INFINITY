/**
 * TITANE∞ OS v24.7 - Section Sécurité
 * Permissions et H-N security
 * Optimisé avec ControlPanelToggleList
 */

import React, { useCallback } from 'react';
import { useControlPanelSection } from '@/hooks/useControlPanelSection';
import {
  ControlPanelToggleList,
  type ToggleConfig,
} from '../components/ControlPanelToggle';

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

const SECURITY_TOGGLES: readonly ToggleConfig<keyof SecurityConfig>[] = [
  {
    key: 'hn_security_enabled',
    title: 'H-N Security',
    description: 'Activer la sécurité Humain-Non Humain',
  },
  {
    key: 'secure_mode',
    title: 'Mode sécurisé',
    description: 'Restrictions accrues et validations supplémentaires',
  },
  {
    key: 'encryption_enabled',
    title: 'Chiffrement',
    description: 'Chiffrer les données sensibles localement',
  },
  {
    key: 'audit_logging',
    title: 'Audit logging',
    description: 'Enregistrer toutes les actions de sécurité',
  },
];

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
          <ControlPanelToggleList<keyof SecurityConfig>
            config={config}
            toggles={SECURITY_TOGGLES}
            onToggle={toggleField}
          />
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
