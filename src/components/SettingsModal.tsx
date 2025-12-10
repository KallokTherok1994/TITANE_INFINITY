/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE INFINITY v16.1 - SETTINGS MODAL (AI MODE CONFIGURATION)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Modal de configuration du mode AI : Local / Cloud / Hybrid
 * Gestion des providers, confirmations, et status
 *
 * @module SettingsModal
 * @version 16.1.0
 * @date 2025-11-21
 */

import { useState, useEffect } from 'react';
import { Modal } from '@/ui/Modal';
import {
  getAIConfig,
  enableCloudMode,
  disableCloudMode,
  checkInternetConnection,
  isOnlineModeEnabled,
  type AIConfig,
} from '../config/offline-first';
import { getApprovalStatus, resetAllApprovals } from '../utils/cloudAPIConfirmation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [isOnline, setIsOnline] = useState(false);
  const [approvals, setApprovals] = useState<{ session: string[]; permanent: string[] }>({
    session: [],
    permanent: [],
  });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setIsOnline(isOnlineModeEnabled());
      setApprovals(getApprovalStatus());
    }
  }, [isOpen]);

  const handleCheckInternet = async () => {
    setChecking(true);
    const online = await checkInternetConnection();
    setIsOnline(online);
    setChecking(false);
  };

  const handleModeChange = (mode: 'local' | 'cloud' | 'hybrid') => {
    if (mode === 'local') {
      disableCloudMode();
    } else {
      // Par défaut gemini pour cloud/hybrid
      const cloudProvider =
        config.provider === 'gemini' || config.provider === 'openai'
          ? config.provider
          : 'gemini';
      enableCloudMode(cloudProvider);
    }
    setConfig(getAIConfig());
    setIsOnline(isOnlineModeEnabled());
  };

  const handleProviderChange = (provider: 'ollama' | 'gemini' | 'openai' | 'local') => {
    if (config.mode !== 'local' && (provider === 'gemini' || provider === 'openai')) {
      enableCloudMode(provider);
    }
    setConfig(getAIConfig());
  };

  const handleResetApprovals = () => {
    if (confirm('Réinitialiser toutes les approbations cloud ?')) {
      resetAllApprovals();
      setApprovals(getApprovalStatus());
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ Configuration AI"
      size="lg"
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <div className="settings-modal-inner">
        {/* Status Internet */}
        <section className="settings-section" aria-labelledby="status-heading">
          <h3 id="status-heading">📡 Status Internet</h3>
          <div className="status-row">
            <div
              className={`status-indicator ${isOnline ? 'online' : 'offline'}`}
              role="status"
              aria-live="polite"
            >
              {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCheckInternet}
              disabled={checking}
              aria-label={
                checking ? 'Vérification en cours' : 'Vérifier la connexion internet'
              }
            >
              {checking ? '⏳ Vérification...' : '🔄 Vérifier'}
            </button>
          </div>
        </section>

        {/* Mode AI with proper radio buttons */}
        <section className="settings-section" aria-labelledby="mode-heading">
          <h3 id="mode-heading">🤖 Mode AI</h3>
          <fieldset className="mode-selector">
            <legend className="sr-only">Choisir le mode AI</legend>

            <label className="mode-btn">
              <input
                type="radio"
                name="ai-mode"
                value="local"
                checked={config.mode === 'local'}
                onChange={() => handleModeChange('local')}
                className="mode-radio sr-only"
              />
              <div className={`mode-visual ${config.mode === 'local' ? 'active' : ''}`}>
                <div className="mode-icon" aria-hidden="true">
                  🏠
                </div>
                <div className="mode-label">Local</div>
                <div className="mode-desc">100% offline</div>
              </div>
            </label>

            <label className="mode-btn">
              <input
                type="radio"
                name="ai-mode"
                value="cloud"
                checked={config.mode === 'cloud'}
                onChange={() => handleModeChange('cloud')}
                className="mode-radio sr-only"
              />
              <div className={`mode-visual ${config.mode === 'cloud' ? 'active' : ''}`}>
                <div className="mode-icon" aria-hidden="true">
                  🌐
                </div>
                <div className="mode-label">Cloud</div>
                <div className="mode-desc">APIs externes</div>
              </div>
            </label>

            <label className="mode-btn">
              <input
                type="radio"
                name="ai-mode"
                value="hybrid"
                checked={config.mode === 'hybrid'}
                onChange={() => handleModeChange('hybrid')}
                className="mode-radio sr-only"
              />
              <div className={`mode-visual ${config.mode === 'hybrid' ? 'active' : ''}`}>
                <div className="mode-icon" aria-hidden="true">
                  ⚡
                </div>
                <div className="mode-label">Hybrid</div>
                <div className="mode-desc">Local + Cloud</div>
              </div>
            </label>
          </fieldset>
        </section>

        {/* Provider Selection */}
        {config.mode !== 'local' && (
          <section className="settings-section" aria-labelledby="provider-heading">
            <h3 id="provider-heading">🔌 Provider Cloud</h3>
            <label htmlFor="provider-select" className="sr-only">
              Sélectionner le provider cloud
            </label>
            <select
              id="provider-select"
              className="provider-select"
              value={config.provider}
              onChange={e =>
                handleProviderChange(e.target.value as 'gemini' | 'openai' | 'ollama')
              }
              aria-labelledby="provider-heading"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </section>
        )}

        {/* Confirmations */}
        <section className="settings-section" aria-labelledby="confirmations-heading">
          <h3 id="confirmations-heading">🔐 Confirmations Cloud</h3>
          <label htmlFor="require-confirmation" className="checkbox-label">
            <input
              id="require-confirmation"
              type="checkbox"
              checked={config.requireOnlineConfirmation}
              onChange={() => {
                // Toggle sera implémenté via config update
                console.log('Toggle confirmation');
              }}
              aria-describedby="confirmation-hint"
            />
            <span>Demander confirmation avant chaque appel API cloud</span>
          </label>
          <div id="confirmation-hint" className="sr-only">
            Active ou désactive la confirmation avant d'utiliser les APIs cloud externes
          </div>
        </section>

        {/* Approbations */}
        {(approvals.session.length > 0 || approvals.permanent.length > 0) && (
          <section className="settings-section" aria-labelledby="approvals-heading">
            <h3 id="approvals-heading">✅ Approbations Actives</h3>

            {approvals.permanent.length > 0 && (
              <div
                className="approvals-list"
                role="region"
                aria-label="Approbations permanentes"
              >
                <div className="approvals-label">⭐ Permanentes:</div>
                <div role="list">
                  {approvals.permanent.map(p => (
                    <span key={p} role="listitem" className="approval-tag permanent">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {approvals.session.length > 0 && (
              <div
                className="approvals-list"
                role="region"
                aria-label="Approbations de session"
              >
                <div className="approvals-label">🔄 Session:</div>
                <div role="list">
                  {approvals.session.map(p => (
                    <span key={p} role="listitem" className="approval-tag session">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-danger"
              onClick={handleResetApprovals}
              aria-label="Réinitialiser toutes les approbations cloud"
            >
              🗑️ Réinitialiser toutes les approbations
            </button>
          </section>
        )}

        {/* Footer */}
        <footer className="settings-footer">
          <p className="settings-info" role="status">
            🛡️ Mode OFFLINE FIRST activé - Vos données restent locales par défaut
          </p>
        </footer>
      </div>

      <style>{`
        .settings-modal-inner {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-section {
          margin-bottom: 32px;
        }

        .settings-section h3 {
          color: #ffffff;
          font-size: 20px;
          margin: 0 0 16px 0;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicator {
          flex: 1;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
        }

        .status-indicator.online {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          border: 2px solid #4CAF50;
        }

        .status-indicator.offline {
          background: rgba(255, 51, 102, 0.2);
          color: #ff3366;
          border: 2px solid #ff3366;
        }

        .mode-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          border: none;
          padding: 0;
          margin: 0;
        }

        .mode-btn {
          cursor: pointer;
          display: block;
          position: relative;
        }

        .mode-radio {
          position: absolute;
          opacity: 0;
        }

        .mode-visual {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .mode-btn:hover .mode-visual {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.5);
          transform: translateY(-2px);
        }

        .mode-visual.active {
          background: rgba(0, 217, 255, 0.2);
          border-color: #00d9ff;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
        }

        .mode-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .mode-label {
          color: #ffffff;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .mode-desc {
          color: #aaaaaa;
          font-size: 12px;
        }

        .provider-select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .provider-select:hover {
          border-color: #00d9ff;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .approvals-list {
          margin-bottom: 16px;
        }

        .approvals-label {
          color: #aaaaaa;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .approval-tag {
          display: inline-block;
          padding: 6px 12px;
          margin: 4px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
        }

        .approval-tag.permanent {
          background: rgba(0, 217, 255, 0.2);
          color: #00d9ff;
          border: 1px solid #00d9ff;
        }

        .approval-tag.session {
          background: rgba(76, 175, 80, 0.2);
          color: #4CAF50;
          border: 1px solid #4CAF50;
        }

        .btn-primary, .btn-secondary, .btn-danger {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-danger {
          background: #ff3366;
          color: #ffffff;
          width: 100%;
        }

        .btn-danger:hover {
          background: #dd2244;
        }

        .settings-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 217, 255, 0.2);
        }

        .settings-info {
          color: #ffaa00;
          font-size: 14px;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </Modal>
  );
}
